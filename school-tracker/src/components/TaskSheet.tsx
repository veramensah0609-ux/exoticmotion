import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useData } from '../contexts/DataContext'
import type { Task } from '../lib/types'
import { CourseDot } from './shared'

export default function TaskSheet({ task, onClose }: { task: Task; onClose: () => void }) {
  const { courses, refresh } = useData()
  const [title, setTitle] = useState(task.title)
  const [courseId, setCourseId] = useState(task.course_id ?? '')
  const [dueDate, setDueDate] = useState(task.due_date ?? '')
  const [dueTime, setDueTime] = useState(task.due_time ?? '')
  const [estimate, setEstimate] = useState(task.estimate_minutes != null ? String(task.estimate_minutes) : '')
  const [notes, setNotes] = useState(task.notes ?? '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!title.trim()) return
    setSaving(true)
    await supabase
      .from('tasks')
      .update({
        title: title.trim(),
        course_id: courseId || null,
        due_date: dueDate || null,
        due_time: dueTime || null,
        estimate_minutes: estimate === '' ? null : Number(estimate),
        notes: notes.trim() || null,
      })
      .eq('id', task.id)
    await refresh()
    setSaving(false)
    onClose()
  }

  async function toggleComplete() {
    setSaving(true)
    await supabase
      .from('tasks')
      .update({ completed: !task.completed, completed_at: !task.completed ? new Date().toISOString() : null })
      .eq('id', task.id)
    await refresh()
    setSaving(false)
    onClose()
  }

  async function remove() {
    setSaving(true)
    await supabase.from('tasks').delete().eq('id', task.id)
    await refresh()
    setSaving(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#15171f] rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-4"
      >
        <div className="h-1 w-10 bg-black/15 dark:bg-white/20 rounded-full mx-auto mb-1" />

        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-lg font-bold bg-transparent outline-none"
        />

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs space-y-1">
            <span className="opacity-50">Due date</span>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 outline-none"
            />
          </label>
          <label className="text-xs space-y-1">
            <span className="opacity-50">Time (optional)</span>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 outline-none"
            />
          </label>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <label className="text-xs space-y-1">
            <span className="opacity-50">Course</span>
            <select
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 outline-none"
            >
              <option value="">No course</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs space-y-1">
            <span className="opacity-50">Estimate (min)</span>
            <input
              type="number"
              min={0}
              value={estimate}
              onChange={(e) => setEstimate(e.target.value)}
              className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 outline-none"
            />
          </label>
        </div>

        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          rows={2}
          className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none resize-none"
        />

        {courseId && (
          <p className="text-xs opacity-50 flex items-center gap-1.5">
            <CourseDot color={courses.find((c) => c.id === courseId)?.color ?? '#888'} />
            {courses.find((c) => c.id === courseId)?.code}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={remove} disabled={saving} className="rounded-xl py-2.5 px-4 text-sm font-medium bg-red-500/10 text-red-500">
            Delete
          </button>
          <button
            onClick={toggleComplete}
            disabled={saving}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-black/5 dark:bg-white/10"
          >
            {task.completed ? 'Mark incomplete' : 'Mark done'}
          </button>
          <button onClick={save} disabled={saving || !title.trim()} className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-indigo-600 text-white disabled:opacity-50">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
