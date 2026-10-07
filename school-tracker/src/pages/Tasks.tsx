import { useMemo, useState } from 'react'
import { useData } from '../contexts/DataContext'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Card, CourseDot, DueBadge, EmptyState, PageHeader } from '../components/shared'
import { taskPriority } from '../lib/priority'
import type { Task } from '../lib/types'

export default function Tasks() {
  const { user } = useAuth()
  const { courses, tasks, refresh } = useData()
  const [filterCourse, setFilterCourse] = useState<string>('all')
  const [showDone, setShowDone] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDueDate, setNewDueDate] = useState('')
  const [newCourseId, setNewCourseId] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [subtaskDraft, setSubtaskDraft] = useState('')

  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])

  const topLevel = tasks.filter((t) => !t.parent_task_id)
  const subtasksOf = (id: string) => tasks.filter((t) => t.parent_task_id === id)

  const filtered = topLevel
    .filter((t) => (filterCourse === 'all' ? true : t.course_id === filterCourse))
    .filter((t) => (showDone ? true : !t.completed))
    .sort((a, b) => taskPriority(b) - taskPriority(a))

  async function addTask(e: React.FormEvent) {
    e.preventDefault()
    if (!newTitle.trim() || !user) return
    await supabase.from('tasks').insert({
      user_id: user.id,
      title: newTitle.trim(),
      course_id: newCourseId || (filterCourse === 'all' ? null : filterCourse),
      due_date: newDueDate || null,
    })
    setNewTitle('')
    setNewDueDate('')
    setNewCourseId('')
    await refresh()
  }

  async function addSubtask(parentId: string, courseId: string | null) {
    if (!subtaskDraft.trim() || !user) return
    await supabase.from('tasks').insert({
      user_id: user.id,
      title: subtaskDraft.trim(),
      parent_task_id: parentId,
      course_id: courseId,
    })
    setSubtaskDraft('')
    await refresh()
  }

  async function toggle(t: Task) {
    await supabase.from('tasks').update({ completed: !t.completed, completed_at: !t.completed ? new Date().toISOString() : null }).eq('id', t.id)
    await refresh()
  }

  async function remove(id: string) {
    await supabase.from('tasks').delete().eq('id', id)
    await refresh()
  }

  const totalEstimateToday = tasks
    .filter((t) => !t.completed && t.due_date === new Date().toISOString().slice(0, 10))
    .reduce((s, t) => s + (t.estimate_minutes ?? 0), 0)

  return (
    <div>
      <PageHeader title="Tasks" subtitle={totalEstimateToday > 0 ? `~${Math.round(totalEstimateToday / 60 * 10) / 10}h planned today` : undefined} />

      <div className="px-4">
        <form onSubmit={addTask} className="mb-3 space-y-2">
          <div className="flex gap-2">
            <input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Add a task or assessment…"
              className="flex-1 rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button type="submit" className="rounded-xl bg-indigo-600 text-white px-4 text-sm font-medium">Add</button>
          </div>
          <div className="flex gap-2">
            <label className="flex-1 text-xs space-y-1">
              <span className="opacity-50">Course</span>
              <select
                value={newCourseId}
                onChange={(e) => setNewCourseId(e.target.value)}
                className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 outline-none"
              >
                <option value="">No course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex-1 text-xs space-y-1">
              <span className="opacity-50">Due date</span>
              <input
                type="date"
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="w-full rounded-xl border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 outline-none"
              />
            </label>
          </div>
        </form>

        <div className="flex gap-2 mb-3 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            onClick={() => setFilterCourse('all')}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${filterCourse === 'all' ? 'bg-indigo-600 text-white' : 'bg-black/5 dark:bg-white/10'}`}
          >
            All
          </button>
          {courses.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilterCourse(c.id)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${filterCourse === c.id ? 'bg-indigo-600 text-white' : 'bg-black/5 dark:bg-white/10'}`}
            >
              <CourseDot color={c.color} />
              {c.code}
            </button>
          ))}
          <button onClick={() => setShowDone((s) => !s)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium ${showDone ? 'bg-indigo-600 text-white' : 'bg-black/5 dark:bg-white/10'}`}>
            {showDone ? 'Hide done' : 'Show done'}
          </button>
        </div>

        <Card className="divide-y divide-black/5 dark:divide-white/10">
          {filtered.length === 0 ? (
            <EmptyState text="No tasks here." />
          ) : (
            filtered.map((t) => {
              const subs = subtasksOf(t.id)
              const course = t.course_id ? courseById[t.course_id] : undefined
              const isExpanded = expanded === t.id
              return (
                <div key={t.id}>
                  <div className="flex items-center gap-2.5 px-4 py-3">
                    <button
                      onClick={() => toggle(t)}
                      className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center ${t.completed ? 'bg-indigo-600 border-indigo-600' : 'border-black/20 dark:border-white/30'}`}
                    >
                      {t.completed && (
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                    <button className="min-w-0 flex-1 text-left" onClick={() => setExpanded(isExpanded ? null : t.id)}>
                      <p className={`text-sm font-medium truncate ${t.completed ? 'line-through opacity-40' : ''}`}>{t.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {course && (
                          <span className="text-xs opacity-50 flex items-center gap-1">
                            <CourseDot color={course.color} />
                            {course.code}
                          </span>
                        )}
                        {t.estimate_minutes && <span className="text-xs opacity-40">{t.estimate_minutes}m</span>}
                        {subs.length > 0 && <span className="text-xs opacity-40">{subs.filter((s) => s.completed).length}/{subs.length} subtasks</span>}
                      </div>
                    </button>
                    <DueBadge date={t.due_date} done={t.completed} />
                    <button onClick={() => remove(t.id)} className="opacity-30 hover:opacity-70 text-xs px-1">✕</button>
                  </div>
                  {isExpanded && (
                    <div className="pl-11 pr-4 pb-3 space-y-2">
                      {subs.map((s) => (
                        <div key={s.id} className="flex items-center gap-2">
                          <button
                            onClick={() => toggle(s)}
                            className={`h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center ${s.completed ? 'bg-indigo-600 border-indigo-600' : 'border-black/20 dark:border-white/30'}`}
                          />
                          <p className={`text-xs flex-1 ${s.completed ? 'line-through opacity-40' : ''}`}>{s.title}</p>
                          <button onClick={() => remove(s.id)} className="opacity-30 hover:opacity-70 text-xs">✕</button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input
                          value={subtaskDraft}
                          onChange={(e) => setSubtaskDraft(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addSubtask(t.id, t.course_id)}
                          placeholder="Break this down…"
                          className="flex-1 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 text-xs outline-none"
                        />
                        <button onClick={() => addSubtask(t.id, t.course_id)} className="text-xs font-medium text-indigo-500 px-2">Add</button>
                      </div>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </Card>
      </div>
    </div>
  )
}
