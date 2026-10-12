import { useMemo, useState } from 'react'
import { useData } from '../contexts/DataContext'
import { Card, DueBadge, EmptyState, PageHeader, ProgressRing } from '../components/shared'
import { daysUntil, isOverdue } from '../lib/priority'
import { supabase } from '../lib/supabase'
import { format } from 'date-fns'
import AssessmentSheet from '../components/AssessmentSheet'
import TaskSheet from '../components/TaskSheet'
import type { Assessment, Task } from '../lib/types'

export default function Dashboard() {
  const { courses, units, assessments, tasks, refresh } = useData()
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const selectedAssessment = selectedAssessmentId ? assessments.find((a) => a.id === selectedAssessmentId) ?? null : null
  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) ?? null : null

  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])

  const overdueTasks = tasks.filter((t) => !t.completed && isOverdue(t.due_date))
  const todayTasks = tasks.filter((t) => !t.completed && daysUntil(t.due_date) === 0)
  const allTasksDueToday = tasks.filter((t) => daysUntil(t.due_date) === 0)
  const allAssessmentsDueToday = assessments.filter((a) => daysUntil(a.due_date) === 0)
  const doneToday = allTasksDueToday.filter((t) => t.completed).length + allAssessmentsDueToday.filter((a) => a.status === 'done').length
  const totalToday = allTasksDueToday.length + allAssessmentsDueToday.length
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
      <PageHeader
        title="Today"
        subtitle={format(new Date(), 'EEEE, MMMM d')}
        right={totalToday > 0 ? <ProgressRing done={doneToday} total={totalToday} /> : undefined}
      />

      <div className="px-4 space-y-4">
        {nextTest && (
          <Card className="p-4 bg-gradient-to-br from-neutral-900 to-neutral-700 text-white border-0">
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
            <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2 px-1">Overdue ({overdueTasks.length})</h2>
            <div className="space-y-2">
              {overdueTasks.map((t) => {
                const course = t.course_id ? courseById[t.course_id] : undefined
                return (
                  <Card key={t.id}>
                    <TaskRow task={t} course={course} onToggle={toggleTask} onSelect={(selected) => setSelectedTaskId(selected.id)} />
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {missingAssessments.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-red-500 mb-2 px-1">Missing work</h2>
            <div className="space-y-2">
              {missingAssessments.map((a) => {
                const color = courseById[a.course_id]?.color ?? '#888'
                return (
                  <Card key={a.id} className="overflow-hidden">
                    <button onClick={() => setSelectedAssessmentId(a.id)} className="w-full flex items-center gap-3 pl-1 pr-4 py-3.5 text-left">
                      <span className="h-full w-1.5 self-stretch rounded-full shrink-0" style={{ background: color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{a.title}</p>
                        <p className="text-xs opacity-50 mt-0.5">{courseById[a.course_id]?.code}</p>
                      </div>
                      <DueBadge date={a.due_date} />
                    </button>
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2 px-1">Today ({todayTasks.length})</h2>
          {todayTasks.length === 0 ? (
            <Card>
              <EmptyState icon="🎉" text="Nothing due today. Nice." />
            </Card>
          ) : (
            <div className="space-y-2">
              {todayTasks.map((t) => {
                const course = t.course_id ? courseById[t.course_id] : undefined
                return (
                  <Card key={t.id}>
                    <TaskRow task={t} course={course} onToggle={toggleTask} onSelect={(selected) => setSelectedTaskId(selected.id)} />
                  </Card>
                )
              })}
            </div>
          )}
        </section>

        {upcomingTasks.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2 px-1">Coming up</h2>
            <div className="space-y-2">
              {upcomingTasks.map((t) => {
                const course = t.course_id ? courseById[t.course_id] : undefined
                return (
                  <Card key={t.id}>
                    <TaskRow task={t} course={course} onToggle={toggleTask} onSelect={(selected) => setSelectedTaskId(selected.id)} />
                  </Card>
                )
              })}
            </div>
          </section>
        )}

        {upcomingAssessments.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2 px-1">Assessments this week+</h2>
            <div className="space-y-2">
              {upcomingAssessments.map((a) => {
                const color = courseById[a.course_id]?.color ?? '#888'
                return (
                  <Card key={a.id} className="overflow-hidden">
                    <button onClick={() => setSelectedAssessmentId(a.id)} className="w-full flex items-center gap-3 pl-1 pr-4 py-3.5 text-left">
                      <span className="h-full w-1.5 self-stretch rounded-full shrink-0" style={{ background: color }} />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold truncate">{a.title}</p>
                        <p className="text-xs opacity-50 mt-0.5">
                          {courseById[a.course_id]?.code} · {a.type}
                          {a.weight_percent ? ` · ${a.weight_percent}%` : ''}
                        </p>
                      </div>
                      <DueBadge date={a.due_date} />
                    </button>
                  </Card>
                )
              })}
            </div>
          </section>
        )}
      </div>

      {selectedAssessment && <AssessmentSheet assessment={selectedAssessment} onClose={() => setSelectedAssessmentId(null)} />}
      {selectedTask && <TaskSheet task={selectedTask} onClose={() => setSelectedTaskId(null)} />}
    </div>
  )
}

function TaskRow({
  task,
  course,
  onToggle,
  onSelect,
}: {
  task: Task
  course?: import('../lib/types').Course
  onToggle: (id: string, completed: boolean) => void
  onSelect: (task: Task) => void
}) {
  return (
    <div className="flex items-center gap-3 pl-1 pr-4 py-3">
      <span className="h-full w-1.5 self-stretch rounded-full shrink-0" style={{ background: course?.color ?? 'transparent' }} />
      <button
        onClick={() => onToggle(task.id, task.completed)}
        className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center ${
          task.completed ? 'bg-neutral-900 border-neutral-900' : 'border-black/20 dark:border-white/30'
        }`}
      >
        {task.completed && (
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
            <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <button onClick={() => onSelect(task)} className="min-w-0 flex-1 text-left">
        <p className={`text-sm font-semibold truncate ${task.completed ? 'line-through opacity-40' : ''}`}>{task.title}</p>
        {course && <p className="text-xs opacity-50 mt-0.5">{course.code}</p>}
      </button>
      <DueBadge date={task.due_date} done={task.completed} />
    </div>
  )
}
