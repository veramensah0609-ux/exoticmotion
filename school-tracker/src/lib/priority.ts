import { differenceInCalendarDays, parseISO } from 'date-fns'
import type { Assessment, Task, Unit } from './types'

/** Priority score: due-date urgency x weight x shakiness. Higher = more urgent. */
export function assessmentPriority(a: Assessment, unit: Unit | undefined, today: Date = new Date()): number {
  if (!a.due_date) return 0
  const days = differenceInCalendarDays(parseISO(a.due_date), today)
  const urgency = days <= 0 ? 10 : 1 / Math.max(days, 0.5)
  const weight = (a.weight_percent ?? 5) / 5
  const shaky = 1 + (unit?.shaky_level ?? 0) * 0.5
  return urgency * weight * shaky
}

export function taskPriority(t: Task, today: Date = new Date()): number {
  if (t.completed) return -1
  let score = t.priority_score ?? 0
  if (t.due_date) {
    const days = differenceInCalendarDays(parseISO(t.due_date), today)
    score += days <= 0 ? 8 : 1 / Math.max(days, 0.5)
  }
  return score
}

export function isOverdue(dateStr: string | null, today: Date = new Date()): boolean {
  if (!dateStr) return false
  return differenceInCalendarDays(parseISO(dateStr), today) < 0
}

export function daysUntil(dateStr: string | null, today: Date = new Date()): number | null {
  if (!dateStr) return null
  return differenceInCalendarDays(parseISO(dateStr), today)
}
