import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Card, EmptyState, PageHeader } from '../components/shared'
import { computeCourseGrade, computeTargetNeeded, computeWhatIf } from '../lib/grades'
import { format, parseISO } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { Assessment, AssessmentType } from '../lib/types'

const TYPES: AssessmentType[] = ['quiz', 'test', 'exam', 'assignment', 'lab', 'portfolio', 'journal', 'other']

export default function GradeDetail() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { courses, assessments, units, refresh } = useData()
  const [tab, setTab] = useState<'assessments' | 'target' | 'whatif' | 'trend'>('assessments')
  const [targetPct, setTargetPct] = useState(90)
  const [whatIfMarks, setWhatIfMarks] = useState<Record<string, number>>({})
  const [adding, setAdding] = useState(false)

  const course = courses.find((c) => c.id === courseId)
  const courseAssessments = useMemo(() => assessments.filter((a) => a.course_id === courseId), [assessments, courseId])
  const courseUnits = useMemo(() => units.filter((u) => u.course_id === courseId), [units, courseId])

  if (!course) return <div className="p-4"><EmptyState text="Course not found." /></div>

  const result = computeCourseGrade(course, courseAssessments)
  const target = computeTargetNeeded(courseAssessments, targetPct)
  const whatIfPercent = computeWhatIf(courseAssessments, whatIfMarks)

  const trendData = courseAssessments
    .filter((a) => a.mark_earned != null && a.mark_total != null && a.due_date)
    .sort((a, b) => (a.due_date! > b.due_date! ? 1 : -1))
    .reduce((acc: { date: string; pct: number; cum: number }[], a, i) => {
      const pct = (a.mark_earned! / a.mark_total!) * 100
      const prevCum = acc[i - 1]?.cum ?? pct
      const cum = i === 0 ? pct : prevCum + (pct - prevCum) / (i + 1)
      acc.push({ date: format(parseISO(a.due_date!), 'MMM d'), pct: Math.round(pct), cum: Math.round(cum * 10) / 10 })
      return acc
    }, [])

  async function updateMark(a: Assessment, earned: string, total: string) {
    await supabase
      .from('assessments')
      .update({
        mark_earned: earned === '' ? null : Number(earned),
        mark_total: total === '' ? null : Number(total),
        status: earned !== '' ? 'done' : a.status,
      })
      .eq('id', a.id)
    await refresh()
  }

  async function markMissing(a: Assessment) {
    await supabase.from('assessments').update({ status: a.status === 'missing' ? 'upcoming' : 'missing' }).eq('id', a.id)
    await refresh()
  }

  async function removeAssessment(id: string) {
    await supabase.from('assessments').delete().eq('id', id)
    await refresh()
  }

  async function setShaky(unitId: string, level: number) {
    await supabase.from('units').update({ shaky_level: level }).eq('id', unitId)
    await refresh()
  }

  return (
    <div>
      <PageHeader
        title={course.code}
        subtitle={course.name}
        right={
          <button onClick={() => navigate(-1)} className="text-sm opacity-60">
            Back
          </button>
        }
      />

      <div className="px-4">
        <Card className="p-4 flex items-center justify-between mb-4" style={{ borderColor: course.color + '40' }}>
          <div>
            <p className="text-3xl font-bold tabular-nums">{result.termWorkPercent != null ? `${result.termWorkPercent.toFixed(1)}%` : '—'}</p>
            <p className="text-xs opacity-50 mt-0.5">term work average</p>
          </div>
          <div className="text-right text-xs opacity-60 space-y-0.5">
            {(['K', 'T', 'C', 'A'] as const).map((cat) => {
              const b = result.categoryBreakdown[cat]
              return (
                <p key={cat}>
                  {cat}: {b.total > 0 ? `${Math.round((b.earned / b.total) * 100)}%` : '—'}
                </p>
              )
            })}
          </div>
        </Card>

        {courseUnits.length > 0 && (
          <Card className="p-3 mb-4">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Unit confidence</p>
            <div className="space-y-1.5">
              {courseUnits.map((u) => (
                <div key={u.id} className="flex items-center gap-2">
                  <span className="text-xs flex-1 truncate">{u.name}</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3].map((lvl) => (
                      <button
                        key={lvl}
                        onClick={() => setShaky(u.id, lvl)}
                        className={`h-2.5 w-2.5 rounded-full ${lvl <= u.shaky_level ? 'bg-amber-500' : 'bg-black/10 dark:bg-white/15'}`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        <div className="flex gap-1 bg-black/5 dark:bg-white/10 rounded-full p-0.5 mb-4 text-xs font-medium">
          {([
            ['assessments', 'Marks'],
            ['target', 'Target'],
            ['whatif', 'What-if'],
            ['trend', 'Trend'],
          ] as const).map(([k, label]) => (
            <button key={k} onClick={() => setTab(k)} className={`flex-1 py-1.5 rounded-full ${tab === k ? 'bg-white dark:bg-white/20 shadow' : 'opacity-60'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'assessments' && (
          <>
            <button onClick={() => setAdding((a) => !a)} className="w-full mb-3 rounded-xl border border-dashed border-black/15 dark:border-white/20 py-2.5 text-sm font-medium opacity-70">
              {adding ? 'Cancel' : '+ Add assessment'}
            </button>
            {adding && <AddAssessmentForm courseId={course.id} userId={user!.id} units={courseUnits} onDone={() => { setAdding(false); refresh() }} />}
            <Card className="divide-y divide-black/5 dark:divide-white/10">
              {courseAssessments.length === 0 ? (
                <EmptyState text="No assessments yet." />
              ) : (
                courseAssessments.map((a) => (
                  <div key={a.id} className="px-4 py-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{a.title}</p>
                        <p className="text-xs opacity-50">
                          {a.type}
                          {a.category ? ` · ${a.category}` : ''}
                          {a.weight_percent ? ` · ${a.weight_percent}%` : ''}
                          {a.due_date ? ` · ${format(parseISO(a.due_date), 'MMM d')}` : ''}
                        </p>
                      </div>
                      <button onClick={() => removeAssessment(a.id)} className="opacity-30 hover:opacity-70 text-xs px-1">✕</button>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        defaultValue={a.mark_earned ?? ''}
                        onBlur={(e) => updateMark(a, e.target.value, String(a.mark_total ?? ''))}
                        placeholder="earned"
                        className="w-20 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 text-sm outline-none"
                      />
                      <span className="opacity-40 text-sm">/</span>
                      <input
                        type="number"
                        defaultValue={a.mark_total ?? ''}
                        onBlur={(e) => updateMark(a, String(a.mark_earned ?? ''), e.target.value)}
                        placeholder="total"
                        className="w-20 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 text-sm outline-none"
                      />
                      <button
                        onClick={() => markMissing(a)}
                        className={`ml-auto text-xs font-medium px-2.5 py-1.5 rounded-lg ${a.status === 'missing' ? 'bg-red-500 text-white' : 'bg-black/5 dark:bg-white/10 opacity-60'}`}
                      >
                        {a.status === 'missing' ? 'Missing' : 'Mark missing'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </Card>
          </>
        )}

        {tab === 'target' && (
          <Card className="p-4 space-y-3">
            <label className="text-xs font-medium opacity-60">I want this average:</label>
            <input
              type="range"
              min={50}
              max={100}
              value={targetPct}
              onChange={(e) => setTargetPct(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-2xl font-bold text-center">{targetPct}%</p>
            <div className="text-center pt-2 border-t border-black/5 dark:border-white/10">
              {target.remainingWeight === 0 ? (
                <p className="text-sm opacity-60">No remaining weighted work to project.</p>
              ) : target.neededPercent == null ? (
                <p className="text-sm opacity-60">Add weights to your assessments to use this.</p>
              ) : target.neededPercent > 100 ? (
                <p className="text-sm text-red-500">Not mathematically possible anymore ({target.neededPercent.toFixed(0)}% needed).</p>
              ) : target.neededPercent < 0 ? (
                <p className="text-sm text-emerald-500">You've already secured this target.</p>
              ) : (
                <>
                  <p className="text-3xl font-bold tabular-nums">{target.neededPercent.toFixed(1)}%</p>
                  <p className="text-xs opacity-50 mt-1">needed on remaining work ({target.remainingWeight}% of grade)</p>
                </>
              )}
            </div>
          </Card>
        )}

        {tab === 'whatif' && (
          <Card className="p-4 space-y-3">
            <p className="text-xs opacity-50 mb-1">Type a hypothetical mark for any assessment to see the effect.</p>
            {courseAssessments.map((a) => (
              <div key={a.id} className="flex items-center gap-2">
                <span className="text-xs flex-1 truncate">{a.title}</span>
                <input
                  type="number"
                  min={0}
                  max={100}
                  placeholder={a.mark_earned != null && a.mark_total ? `${Math.round((a.mark_earned / a.mark_total) * 100)}` : '%'}
                  onChange={(e) =>
                    setWhatIfMarks((m) => ({ ...m, [a.id]: e.target.value === '' ? undefined as unknown as number : Number(e.target.value) }))
                  }
                  className="w-16 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1 text-xs outline-none text-right"
                />
              </div>
            ))}
            <div className="text-center pt-2 border-t border-black/5 dark:border-white/10">
              <p className="text-3xl font-bold tabular-nums">{whatIfPercent != null ? `${whatIfPercent.toFixed(1)}%` : '—'}</p>
              <p className="text-xs opacity-50 mt-1">projected term work average</p>
            </div>
          </Card>
        )}

        {tab === 'trend' && (
          <Card className="p-4">
            {trendData.length === 0 ? (
              <EmptyState text="Log marks to see your trend." />
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                  <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} fontSize={10} tickLine={false} axisLine={false} width={30} />
                  <Tooltip />
                  <Line type="monotone" dataKey="pct" stroke="#a5b4fc" strokeWidth={1.5} dot={{ r: 2 }} name="Mark" />
                  <Line type="monotone" dataKey="cum" stroke={course.color} strokeWidth={2.5} dot={false} name="Running avg" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </Card>
        )}
      </div>
    </div>
  )
}

function AddAssessmentForm({
  courseId,
  userId,
  units,
  onDone,
}: {
  courseId: string
  userId: string
  units: { id: string; name: string }[]
  onDone: () => void
}) {
  const [title, setTitle] = useState('')
  const [type, setType] = useState<AssessmentType>('assignment')
  const [category, setCategory] = useState('')
  const [weight, setWeight] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [unitId, setUnitId] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await supabase.from('assessments').insert({
      user_id: userId,
      course_id: courseId,
      unit_id: unitId || null,
      title: title.trim(),
      type,
      category: category || null,
      weight_percent: weight ? Number(weight) : null,
      due_date: dueDate || null,
    })
    onDone()
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-black/10 dark:border-white/15 p-3 mb-3 space-y-2">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none" />
      <div className="grid grid-cols-2 gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as AssessmentType)} className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-xs outline-none">
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-xs outline-none">
          <option value="">No category</option>
          <option value="K">K</option>
          <option value="T">T</option>
          <option value="C">C</option>
          <option value="A">A</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="Weight %" className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-xs outline-none" />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-xs outline-none" />
      </div>
      {units.length > 0 && (
        <select value={unitId} onChange={(e) => setUnitId(e.target.value)} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-2 text-xs outline-none">
          <option value="">No unit</option>
          {units.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
      )}
      <button type="submit" className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium">Save</button>
    </form>
  )
}
