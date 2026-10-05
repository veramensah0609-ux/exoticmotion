import { useMemo, useState } from 'react'
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
  addWeeks,
} from 'date-fns'
import { useData } from '../contexts/DataContext'
import { Card, CourseDot, EmptyState, PageHeader } from '../components/shared'

type ViewMode = 'month' | 'week'

export default function CalendarPage() {
  const { courses, assessments, tasks } = useData()
  const [view, setView] = useState<ViewMode>('month')
  const [cursor, setCursor] = useState(new Date())
  const [selected, setSelected] = useState<Date>(new Date())

  const courseById = useMemo(() => Object.fromEntries(courses.map((c) => [c.id, c])), [courses])

  const days = useMemo(() => {
    if (view === 'month') {
      const start = startOfWeek(startOfMonth(cursor))
      const end = endOfWeek(endOfMonth(cursor))
      return eachDayOfInterval({ start, end })
    }
    const start = startOfWeek(cursor)
    const end = endOfWeek(cursor)
    return eachDayOfInterval({ start, end })
  }, [cursor, view])

  const eventsByDay = useMemo(() => {
    const map: Record<string, { type: 'assessment' | 'task'; title: string; color: string; sub: string }[]> = {}
    for (const a of assessments) {
      if (!a.due_date) continue
      const key = a.due_date
      ;(map[key] ??= []).push({ type: 'assessment', title: a.title, color: courseById[a.course_id]?.color ?? '#888', sub: courseById[a.course_id]?.code ?? '' })
    }
    for (const t of tasks) {
      if (!t.due_date) continue
      const key = t.due_date
      ;(map[key] ??= []).push({
        type: 'task',
        title: t.title,
        color: t.course_id ? courseById[t.course_id]?.color ?? '#888' : '#9ca3af',
        sub: t.course_id ? courseById[t.course_id]?.code ?? '' : 'Task',
      })
    }
    return map
  }, [assessments, tasks, courseById])

  const selectedKey = format(selected, 'yyyy-MM-dd')
  const selectedEvents = eventsByDay[selectedKey] ?? []

  function shift(dir: 1 | -1) {
    setCursor((c) => (view === 'month' ? addMonths(c, dir) : addWeeks(c, dir)))
  }

  return (
    <div>
      <PageHeader
        title="Calendar"
        right={
          <div className="flex gap-1 bg-black/5 dark:bg-white/10 rounded-full p-0.5">
            {(['week', 'month'] as const).map((v) => (
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
        <div className="flex items-center justify-between mb-3">
          <button onClick={() => shift(-1)} className="h-8 w-8 flex items-center justify-center opacity-60">‹</button>
          <p className="text-sm font-semibold">{format(cursor, view === 'month' ? 'MMMM yyyy' : "'Week of' MMM d")}</p>
          <button onClick={() => shift(1)} className="h-8 w-8 flex items-center justify-center opacity-60">›</button>
        </div>

        <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium opacity-40 mb-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
            <div key={i}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((d) => {
            const key = format(d, 'yyyy-MM-dd')
            const evs = eventsByDay[key] ?? []
            const inMonth = view === 'week' || isSameMonth(d, cursor)
            const isToday = isSameDay(d, new Date())
            const isSelected = isSameDay(d, selected)
            return (
              <button
                key={key}
                onClick={() => setSelected(d)}
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

        <div className="mt-5">
          <h2 className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">{format(selected, 'EEEE, MMM d')}</h2>
          <Card className="divide-y divide-black/5 dark:divide-white/10">
            {selectedEvents.length === 0 ? (
              <EmptyState text="Nothing scheduled" />
            ) : (
              selectedEvents.map((e, i) => (
                <div key={i} className="flex items-center gap-2.5 px-4 py-3">
                  <CourseDot color={e.color} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{e.title}</p>
                    <p className="text-xs opacity-50">{e.sub}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/5 dark:bg-white/10 opacity-70">
                    {e.type === 'assessment' ? 'Assessment' : 'Task'}
                  </span>
                </div>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
