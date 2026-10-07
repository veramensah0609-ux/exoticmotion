import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'

export default function QuickAdd({
  onClose,
  defaultDate,
  defaultTime,
}: {
  onClose: () => void
  defaultDate?: string
  defaultTime?: string
}) {
  const { user } = useAuth()
  const { courses, refresh } = useData()
  const [title, setTitle] = useState('')
  const [courseId, setCourseId] = useState('')
  const [dueDate, setDueDate] = useState(defaultDate ?? '')
  const [dueTime, setDueTime] = useState(defaultTime ?? '')
  const [estimate, setEstimate] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !user) return
    setBusy(true)
    await supabase.from('tasks').insert({
      user_id: user.id,
      title: title.trim(),
      course_id: courseId || null,
      due_date: dueDate || null,
      due_time: dueTime || null,
      estimate_minutes: estimate ? Number(estimate) : null,
    })
    await refresh()
    setBusy(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="w-full max-w-lg bg-white dark:bg-[#15171f] rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-3 animate-[slideUp_0.2s_ease-out]"
      >
        <div className="h-1 w-10 bg-black/15 dark:bg-white/20 rounded-full mx-auto mb-2" />
        <h2 className="text-base font-semibold">Quick add task</h2>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What do you need to do?"
          className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <div className="grid grid-cols-2 gap-2">
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            className="rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-2 py-2.5 text-xs outline-none"
          >
            <option value="">No course</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code}
              </option>
            ))}
          </select>
          <input
            type="number"
            min={0}
            value={estimate}
            onChange={(e) => setEstimate(e.target.value)}
            placeholder="mins"
            className="rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-2 py-2.5 text-xs outline-none"
          />
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-2 py-2.5 text-xs outline-none"
          />
          <input
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            className="rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-2 py-2.5 text-xs outline-none"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-black/5 dark:bg-white/10">
            Cancel
          </button>
          <button
            type="submit"
            disabled={busy || !title.trim()}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-indigo-600 text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </form>
    </div>
  )
}
