import type { Assessment, Course } from './types'

export interface GradeResult {
  termWorkPercent: number | null
  finalPercent: number | null
  gradedWeightUsed: number
  categoryBreakdown: Record<string, { earned: number; total: number }>
}

/** Weighted average of graded assessments as a percent (0-100), scaled by each assessment's weight. */
export function computeTermWork(assessments: Assessment[]): { percent: number | null; weightUsed: number } {
  const graded = assessments.filter((a) => a.mark_earned != null && a.mark_total != null && a.mark_total > 0)
  if (graded.length === 0) return { percent: null, weightUsed: 0 }

  const hasWeights = graded.some((a) => a.weight_percent != null && a.weight_percent > 0)

  if (hasWeights) {
    let weightedSum = 0
    let weightUsed = 0
    for (const a of graded) {
      const w = a.weight_percent ?? 0
      if (w <= 0) continue
      const pct = (a.mark_earned! / a.mark_total!) * 100
      weightedSum += pct * w
      weightUsed += w
    }
    if (weightUsed === 0) return { percent: null, weightUsed: 0 }
    return { percent: weightedSum / weightUsed, weightUsed }
  }

  // fall back to raw points pooled together
  const totalEarned = graded.reduce((s, a) => s + a.mark_earned!, 0)
  const totalPossible = graded.reduce((s, a) => s + a.mark_total!, 0)
  if (totalPossible === 0) return { percent: null, weightUsed: 0 }
  return { percent: (totalEarned / totalPossible) * 100, weightUsed: 100 }
}

export function computeCourseGrade(course: Course, assessments: Assessment[]): GradeResult {
  const termWork = computeTermWork(assessments)
  const categoryBreakdown: Record<string, { earned: number; total: number }> = { K: { earned: 0, total: 0 }, T: { earned: 0, total: 0 }, C: { earned: 0, total: 0 }, A: { earned: 0, total: 0 } }
  for (const a of assessments) {
    if (a.category && a.mark_earned != null && a.mark_total != null) {
      categoryBreakdown[a.category].earned += a.mark_earned
      categoryBreakdown[a.category].total += a.mark_total
    }
  }

  let finalPercent: number | null = null
  if (termWork.percent != null) {
    const ts = course.term_structure
    // Only term work is known day-to-day; exam/attendance assumed at termWork level unless entered separately.
    const nonTermWeight = ts.exam + ts.attendance
    finalPercent = termWork.percent * (ts.term_work / 100) + termWork.percent * (nonTermWeight / 100)
  }

  return {
    termWorkPercent: termWork.percent,
    finalPercent,
    gradedWeightUsed: termWork.weightUsed,
    categoryBreakdown,
  }
}

/** What-if: given remaining assessments with assumed marks, project the term-work average. */
export function computeWhatIf(
  assessments: Assessment[],
  hypothetical: Record<string, number>, // assessmentId -> assumed percent (0-100)
): number | null {
  const merged = assessments.map((a) => {
    if (hypothetical[a.id] != null) {
      return { ...a, mark_earned: hypothetical[a.id], mark_total: 100 }
    }
    return a
  })
  return computeTermWork(merged).percent
}

/** Target calculator: what average do you need on remaining (ungraded, weighted) work to hit a target? */
export function computeTargetNeeded(
  assessments: Assessment[],
  targetPercent: number,
): { neededPercent: number | null; remainingWeight: number; currentWeightedPercent: number } {
  const graded = assessments.filter((a) => a.mark_earned != null && a.mark_total != null && (a.weight_percent ?? 0) > 0)
  const ungraded = assessments.filter((a) => (a.mark_earned == null || a.mark_total == null) && (a.weight_percent ?? 0) > 0)

  const gradedWeight = graded.reduce((s, a) => s + (a.weight_percent ?? 0), 0)
  const remainingWeight = ungraded.reduce((s, a) => s + (a.weight_percent ?? 0), 0)
  const totalWeight = gradedWeight + remainingWeight

  if (totalWeight === 0) return { neededPercent: null, remainingWeight: 0, currentWeightedPercent: 0 }

  const earnedWeighted = graded.reduce((s, a) => s + ((a.mark_earned! / a.mark_total!) * 100 * (a.weight_percent ?? 0)), 0)
  const currentWeightedPercent = earnedWeighted / totalWeight

  if (remainingWeight === 0) {
    return { neededPercent: null, remainingWeight: 0, currentWeightedPercent }
  }

  const neededWeighted = targetPercent * totalWeight - earnedWeighted
  const neededPercent = neededWeighted / remainingWeight
  return { neededPercent, remainingWeight, currentWeightedPercent }
}
