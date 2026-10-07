import { useMemo, useState } from 'react'
import {
  addMonths,
  addDays,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from 'date-fns'
import { useData } from '../contexts/DataContext'
import { PageHeader } from '../components/shared'
import TimelineDay from '../components/TimelineDay'
import AssessmentSheet from '../components/AssessmentSheet'
import TaskSheet from '../components/TaskSheet'
import QuickAdd from '../components/QuickAdd'
import type { Assessment, Task } from '../lib/types'

type ViewMode = 'month' | 'day'

export default function CalendarPage() {
  const { courses, assessments, tasks } = useData()
  const [view, setView] = useState<ViewMode>('month')
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState<Date>(new Date())
  const [selectedAssessment, setSelectedAssessment] = useState<Assessment | null>(null)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [quickAdd, setQuickAdd] = useState<{ date: string; time: string } | null>(null)

  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor))
    const end = endOfWeek(endOfMonth(cursor))
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const eventsByDay = useMemo(() => {
    const map: Record<string, { color: string }[]> = {}
    for (const a of assessments) {
      if (!a.due_date) continue
      ;(map[a.due_date] ??= []).push({ color: courseById[a.course_id]?.color ?? '#888' })
    }
    for (const t of tasks) {
      if (!t.due_date) continue
      ;(map[t.due_date] ??= []).push({ color: t.course_id ? courseById[t.course_id]?.color ?? '#9ca3af' : '#9ca3af' })
    }
    return map
  }, [assessments, tasks, courseById])

  function shiftMonth(dir: 1 | -1) {
    setCursor((c) => addMonths(c, dir))
  }

  function shiftDay(dir: 1 | -1) {
    setSelected((d) => addDays(d, dir))
  }

  function pickDay(d: Date) {
    setSelected(d)
    if (view === 'month') setView('day')
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        right={
          <div className="flex gap-1 bg-black/5 dark:bg-white/10 rounded-full p-0.5">
            {(['month', 'day'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${view === v ? 'bg-white dark:bg-white/20 shadow' : 'opacity-60'}`}
              >
                {v}
              </button>
            ))}
          </div>
        }
      />

      <div className="px-4">
        {view === 'month' ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <button onClick={() => shiftMonth(-1)} className="h-8 w-8 flex items-center justify-center opacity-60">‹</button>
              <p className="text-sm font-semibold">{format(cursor, 'MMMM yyyy')}</p>
              <button onClick={() => shiftMonth(1)} className="h-8 w-8 flex items-center justify-center opacity-60">›</button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium opacity-40 mb-1">
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                <div key={i}>{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 mb-5">
              {monthDays.map((d) => {
                const key = format(d, 'yyyy-MM-dd')
                const evs = eventsByDay[key] ?? []
                const inMonth = isSameMonth(d, cursor)
                const isToday = isSameDay(d, new Date())
                const isSelected = isSameDay(d, selected)
                return (
                  <button
                    key={key}
                    onClick={() => pickDay(d)}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs relative ${
                      isSelected ? 'bg-indigo-600 text-white' : isToday ? 'bg-indigo-500/10 font-semibold' : ''
                    } ${!inMonth ? 'opacity-30' : ''}`}
                  >
                    <span>{format(d, 'd')}</span>
                    {evs.length > 0 && (
                      <span className="flex gap-0.5">
                        {evs.slice(0, 3).map((e, i) => (
                          <span key={i} className="h-1 w-1 rounded-full" style={{ background: isSelected ? 'white' : e.color }} />
                        ))}
                      </span>
                    )}
                  </button>
                )
              })}
            </div>

            <h2 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">{format(selected, 'EEEE, MMM d')}</h2>
          </>
        ) : (
          <div className="flex items-center justify-between mb-3">
            <button onClick={() => shiftDay(-1)} className="h-8 w-8 flex items-center justify-center opacity-60">‹</button>
            <p className="text-sm font-semibold">{format(selected, 'EEEE, MMM d')}</p>
            <button onClick={() => shiftDay(1)} className="h-8 w-8 flex items-center justify-center opacity-60">›</button>
          </div>
        )}

        <TimelineDay
          date={selected}
          tasks={tasks}
          assessments={assessments}
          courseById={courseById}
          onSelectTask={setSelectedTask}
          onSelectAssessment={setSelectedAssessment}
          onCreateAtTime={(date, time) => setQuickAdd({ date, time })}
        />
      </div>

      {selectedAssessment && <AssessmentSheet assessment={selectedAssessment} onClose={() => setSelectedAssessment(null)} />}
      {selectedTask && <TaskSheet task={selectedTask} onClose={() => setSelectedTask(null)} />}
      {quickAdd && (
        <QuickAdd defaultDate={quickAdd.date} defaultTime={quickAdd.time} onClose={() => setQuickAdd(null)} />
      )}
    </div>
  )
}
