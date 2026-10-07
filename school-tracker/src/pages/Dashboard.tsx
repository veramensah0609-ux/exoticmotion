import { useMemo, useState } from 'react'
import { useData } from '../contexts/DataContext'
import { Card, CourseDot, DueBadge, EmptyState, PageHeader } from '../components/shared'
import { daysUntil, isOverdue } from '../lib/priority'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import AssessmentSheet from '../components/AssessmentSheet'
import type { Assessment } from '../lib/types'

export default function Dashboard() {
  const { courses, units, assessments, tasks, refresh } = useData()
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)

  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])

  const overdueTasks = tasks.filter((t) => !t.completed && isOverdue(t.due_date))
  const todayTasks = tasks.filter((t) => !t.completed && daysUntil(t.due_date) === 0)
  const upcomingTasks = tasks
    .filter((t) => !t.completed && !isOverdue(t.due_date) && daysUntil(t.due_date) !== 0 && daysUntil(t.due_date) !== null)
    .sort((a, b) => (daysUntil(a.due_date)! - daysUntil(b.due_date)!))
    .slice(0, 6)

  const upcomingAssessments = assessments
    .filter((a) => a.status !== 'done' && a.due_date && daysUntil(a.due_date)! >= 0 && daysUntil(a.due_date)! <= 10)
    .sort((a, b) => daysUntil(a.due_date)! - daysUntil(b.due_date)!)

  const missingAssessments = assessments.filter((a) => a.status === 'missing' || (a.due_date && isOverdue(a.due_date) && a.status === 'upcoming'))

  const nextTest = assessments
    .filter((a) => (a.type === 'test' || a.type === 'exam' || a.type === 'quiz') && a.due_date && daysUntil(a.due_date)! >= 0)
    .sort((a, b) => daysUntil(a.due_date)! - daysUntil(b.due_date)!)[0]

  const shakyUnitsForNextTest = nextTest
    ? units.filter((u) => u.course_id === nextTest.course_id && u.shaky_level >= 2)
    : []

  async function toggleTask(id: string, completed: boolean) {
    await supabase.from('tasks').update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null }).eq('id', id)
    await refresh()
  }

  return (
    <div>
      <PageHeader title="Today" subtitle={format(new Date(), 'EEEE, MMMM d')} />

      <div className="px-4 space-y-4">
        {nextTest && (
          <Card className="p-4 bg-gradient-to-br from-indigo-600 to-violet-600 text-white border-0">
            <p className="text-xs font-medium opacity-80">Next test · {courseById[nextTest.course_id]?.code}</p>
            <p className="text-lg font-bold mt-0.5">{nextTest.title}</p>
            <p className="text-sm opacity-90 mt-0.5">
              in {daysUntil(nextTest.due_date)} day{daysUntil(nextTest.due_date) === 1 ? '' : 's'}
            </p>
            {shakyUnitsForNextTest.length > 0 && (
              <p className="text-xs mt-2 bg-white/15 rounded-lg px-2.5 py-1.5 inline-block">
                Still shaky: {shakyUnitsForNextTest.map((u) => u.name).join(', ')}
              </p>
            )}
          </Card>
        )}

        {overdueTasks.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">Overdue ({overdueTasks.length})</h2>
            <Card className="divide-y divide-black/5 dark:divide-white/10">
              {overdueTasks.map((t) => (
                <TaskRow key={t.id} task={t} course={t.course_id ? courseById[t.course_id] : undefined} onToggle={toggleTask} />
              ))}
            </Card>
          </section>
        )}

        {missingAssessments.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2">Missing work</h2>
            <Card className="divide-y divide-black/5 dark:divide-white/10">
              {missingAssessments.map((a) => (
                <button key={a.id} onClick={() => setSelectedAssessment(a)} className="w-full flex items-center gap-2.5 px-4 py-3 text-left">
                  <CourseDot color={courseById[a.course_id]?.color ?? '#888'} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs opacity-50">{courseById[a.course_id]?.code}</p>
                  </div>
                  <DueBadge date={a.due_date} />
                </button>
              ))}
            </Card>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Today ({todayTasks.length})</h2>
          <Card className="divide-y divide-black/5 dark:divide-white/10">
            {todayTasks.length === 0 ? (
              <EmptyState text="Nothing due today. Nice." />
            ) : (
              todayTasks.map((t) => (
                <TaskRow key={t.id} task={t} course={t.course_id ? courseById[t.course_id] : undefined} onToggle={toggleTask} />
              ))
            )}
          </Card>
        </section>

        {upcomingTasks.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Coming up</h2>
            <Card className="divide-y divide-black/5 dark:divide-white/10">
              {upcomingTasks.map((t) => (
                <TaskRow key={t.id} task={t} course={t.course_id ? courseById[t.course_id] : undefined} onToggle={toggleTask} />
              ))}
            </Card>
          </section>
        )}

        {upcomingAssessments.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Assessments this week+</h2>
            <Card className="divide-y divide-black/5 dark:divide-white/10">
              {upcomingAssessments.map((a) => (
                <button key={a.id} onClick={() => setSelectedAssessment(a)} className="w-full flex items-center gap-2.5 px-4 py-3 text-left">
                  <CourseDot color={courseById[a.course_id]?.color ?? '#888'} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{a.title}</p>
                    <p className="text-xs opacity-50">
                      {courseById[a.course_id]?.code} · {a.type}
                      {a.weight_percent ? ` · ${a.weight_percent}%` : ''}
                    </p>
                  </div>
                  <DueBadge date={a.due_date} />
                </button>
              ))}
            </Card>
          </section>
        )}
      </div>

      {selectedAssessment && <AssessmentSheet assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} />}
    </div>
  )
}

function TaskRow({
  task,
  course,
  onToggle,
}: {
  task: import('../lib/types').Task
  course?: import('../lib/types').Course
  onToggle: (id: string, completed: boolean) => void
}) {
  return (
    <div className="flex items-center gap-2.5 px-4 py-3">
      <button
        onClick={() => onToggle(task.id, task.completed)}
        className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
          task.completed ? 'bg-indigo-600 border-indigo-600' : 'border-black/20 dark:border-white/30'
        }`}
      >
        {task.completed && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-medium truncate ${task.completed ? 'line-through opacity-40' : ''}`}>{task.title}</p>
        {course && <p className="text-xs opacity-50 flex items-center gap-1 mt-0.5"><CourseDot color={course.color} />{course.code}</p>}
      </div>
      <DueBadge date={task.due_date} done={task.completed} />
    </div>
  )
}
