import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { supabase } from '../lib/supabase'
import { Card, CourseDot, EmptyState, PageHeader } from '../components/shared'
import { format, parseISO } from 'date-fns'

const STATUSES = ['requested', 'approved', 'denied', 'completed'] as const

export default function Reassessments() {
  const { user } = useAuth()
  const { courses, assessments, reassessments, refresh } = useData()
  const [courseId, setCourseId] = useState('')
  const [assessmentId, setAssessmentId] = useState('')
  const [deadline, setDeadline] = useState('')
  const [notes, setNotes] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!courseId || !user) return
    await supabase.from('reassessments').insert({
      user_id: user.id,
      course_id: courseId,
      assessment_id: assessmentId || null,
      deadline: deadline || null,
      notes: notes.trim() || null,
    })
    setAssessmentId('')
    setDeadline('')
    setNotes('')
    await refresh()
  }

  async function setStatus(id: string, status: string) {
    await supabase.from('reassessments').update({ status }).eq('id', id)
    await refresh()
  }

  const courseAssessments = assessments.filter((a) => a.course_id === courseId)

  return (
    <div>
      <PageHeader title="Reassessments" subtitle="What you asked for, what was approved" />
      <div className="px-4 space-y-4">
        <form onSubmit={submit} className="rounded-2xl border border-black/10 dark:border-white/15 p-3 space-y-2">
          <select value={courseId} onChange={(e) => { setCourseId(e.target.value); setAssessmentId('') }} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-xs outline-none">
            <option value="">Select course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
          {courseId && (
            <select value={assessmentId} onChange={(e) => setAssessmentId(e.target.value)} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-xs outline-none">
              <option value="">Which assessment?</option>
              {courseAssessments.map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
            </select>
          )}
          <input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-xs outline-none" />
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes (what was agreed)" rows={2} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none resize-none" />
          <button type="submit" disabled={!courseId} className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium disabled:opacity-50">Log request</button>
        </form>

        <Card className="divide-y divide-black/5 dark:divide-white/10">
          {reassessments.length === 0 ? (
            <EmptyState text="No reassessment requests logged." />
          ) : (
            reassessments.map((r) => {
              const course = courses.find((c) => c.id === r.course_id)
              const assessment = assessments.find((a) => a.id === r.assessment_id)
              return (
                <div key={r.id} className="px-4 py-3">
                  <div className="flex items-center gap-2 mb-1">
                    {course && <CourseDot color={course.color} />}
                    <p className="text-sm font-medium">{assessment?.title ?? course?.name ?? 'Reassessment'}</p>
                  </div>
                  {r.deadline && <p className="text-xs opacity-50">Deadline: {format(parseISO(r.deadline), 'MMM d, yyyy')}</p>}
                  {r.notes && <p className="text-xs opacity-50 mt-0.5">{r.notes}</p>}
                  <div className="flex gap-1.5 mt-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s}
                        onClick={() => setStatus(r.id, s)}
                        className={`text-[10px] px-2 py-1 rounded-full capitalize font-medium ${r.status === s ? 'bg-indigo-600 text-white' : 'bg-black/5 dark:bg-white/10 opacity-60'}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </Card>
      </div>
    </div>
  )
}
