import { useMemo, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { supabase } from '../lib/supabase'
import { Card, CourseDot, EmptyState, PageHeader } from '../components/shared'

export default function Mistakes() {
  const { user } = useAuth()
  const { courses, mistakes, refresh } = useData()
  const [courseId, setCourseId] = useState('')
  const [question, setQuestion] = useState('')
  const [why, setWhy] = useState('')
  const [tags, setTags] = useState('')
  const [reviewMode, setReviewMode] = useState(false)
  const [reviewIdx, setReviewIdx] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])
  const unmastered = mistakes.filter((m) => !m.mastered)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!question.trim() || !user) return
    await supabase.from('mistakes').insert({
      user_id: user.id,
      course_id: courseId || null,
      question: question.trim(),
      why_wrong: why.trim() || null,
      tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
    })
    setQuestion('')
    setWhy('')
    setTags('')
    await refresh()
  }

  async function toggleMastered(id: string, mastered: boolean) {
    await supabase.from('mistakes').update({ mastered: !mastered }).eq('id', id)
    await refresh()
  }

  async function markReviewed(id: string, count: number) {
    await supabase.from('mistakes').update({ review_count: count + 1, last_reviewed_at: new Date().toISOString() }).eq('id', id)
    await refresh()
  }

  if (reviewMode) {
    if (unmastered.length === 0) {
      return (
        <div className="p-4">
          <EmptyState text="No mistakes left to review. You're on top of it." />
          <button onClick={() => setReviewMode(false)} className="w-full mt-3 rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-medium">Back</button>
        </div>
      )
    }
    const m = unmastered[reviewIdx % unmastered.length]
    return (
      <div className="p-4 min-h-dvh flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setReviewMode(false)} className="text-sm opacity-60">Exit review</button>
          <span className="text-xs opacity-50">{(reviewIdx % unmastered.length) + 1} / {unmastered.length}</span>
        </div>
        <Card className="flex-1 p-6 flex flex-col justify-center text-center">
          {courseById[m.course_id ?? ''] && (
            <p className="text-xs opacity-50 mb-2 flex items-center justify-center gap-1.5">
              <CourseDot color={courseById[m.course_id!].color} /> {courseById[m.course_id!].code}
            </p>
          )}
          <p className="text-base font-medium">{m.question}</p>
          {revealed && m.why_wrong && (
            <p className="text-sm opacity-60 mt-4 pt-4 border-t border-black/10 dark:border-white/10">{m.why_wrong}</p>
          )}
          {!revealed ? (
            <button onClick={() => setRevealed(true)} className="mt-6 text-sm font-medium text-indigo-500">Show why I got it wrong</button>
          ) : (
            <div className="flex gap-2 mt-6">
              <button
                onClick={() => { markReviewed(m.id, m.review_count); setRevealed(false); setReviewIdx((i) => i + 1) }}
                className="flex-1 rounded-xl bg-black/5 dark:bg-white/10 py-2.5 text-sm font-medium"
              >
                Still shaky
              </button>
              <button
                onClick={() => { toggleMastered(m.id, false); setRevealed(false); setReviewIdx((i) => i + 1) }}
                className="flex-1 rounded-xl bg-emerald-500 text-white py-2.5 text-sm font-medium"
              >
                Got it now
              </button>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Mistakes"
        subtitle={`${unmastered.length} to review`}
        right={
          unmastered.length > 0 && (
            <button onClick={() => { setReviewMode(true); setReviewIdx(0); setRevealed(false) }} className="text-xs font-medium bg-indigo-600 text-white px-3 py-1.5 rounded-full">
              Review
            </button>
          )
        }
      />

      <div className="px-4 space-y-4">
        <form onSubmit={submit} className="rounded-2xl border border-black/10 dark:border-white/15 p-3 space-y-2">
          <select value={courseId} onChange={(e) => setCourseId(e.target.value)} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-xs outline-none">
            <option value="">No course</option>
            {courses.map((c) => <option key={c.id} value={c.id}>{c.code}</option>)}
          </select>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="What did you get wrong?" rows={2} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none resize-none" />
          <textarea value={why} onChange={(e) => setWhy(e.target.value)} placeholder="Why did you get it wrong? (the actual lesson)" rows={2} className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none resize-none" />
          <input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Tags, comma separated" className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-xs outline-none" />
          <button type="submit" className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-medium">Log mistake</button>
        </form>

        <Card className="divide-y divide-black/5 dark:divide-white/10">
          {mistakes.length === 0 ? (
            <EmptyState text="No mistakes logged yet." />
          ) : (
            mistakes.map((m) => (
              <div key={m.id} className="px-4 py-3 flex items-start gap-2.5">
                <button
                  onClick={() => toggleMastered(m.id, m.mastered)}
                  className={`mt-0.5 h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center ${m.mastered ? 'bg-emerald-500 border-emerald-500' : 'border-black/20 dark:border-white/30'}`}
                >
                  {m.mastered && (
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                      <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${m.mastered ? 'line-through opacity-40' : ''}`}>{m.question}</p>
                  {m.why_wrong && <p className="text-xs opacity-50 mt-0.5">{m.why_wrong}</p>}
                  <div className="flex items-center gap-2 mt-1">
                    {courseById[m.course_id ?? ''] && (
                      <span className="text-[10px] opacity-50 flex items-center gap-1"><CourseDot color={courseById[m.course_id!].color} />{courseById[m.course_id!].code}</span>
                    )}
                    {m.tags.map((t) => (
                      <span key={t} className="text-[10px] px-1.5 py-0.5 rounded-full bg-black/5 dark:bg-white/10 opacity-60">{t}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  )
}
