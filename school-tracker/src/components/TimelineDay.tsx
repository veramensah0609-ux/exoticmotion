import { format } from 'date-fns'
import type { Assessment, Course, Task } from '../lib/types'
import { CourseDot } from './shared'

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6) // 6am - 10pm

function hourLabel(h: number) {
  const period = h < 12 ? 'AM' : 'PM'
  const hour12 = h % 12 === 0 ? 12 : h % 12
  return `${hour12} ${period}`
}

function timeToHour(time: string | null): number | null {
  if (!time) return null
  return Number(time.slice(0, 2))
}

interface TimelineItem {
  kind: 'task' | 'assessment'
  id: string
  title: string
  time: string | null
  color: string
  sub: string
  done: boolean
  data: Task | Assessment
}

export default function TimelineDay({
  date,
  tasks,
  assessments,
  courseById,
  onSelectTask,
  onSelectAssessment,
  onCreateAtTime,
}: {
  date: Date
  tasks: Task[]
  assessments: Assessment[]
  courseById: Record<string, Course>
  onSelectTask: (t: Task) => void
  onSelectAssessment: (a: Assessment) => void
  onCreateAtTime: (dateStr: string, time: string) => void
}) {
  const dateStr = format(date, 'yyyy-MM-dd')

  const items: TimelineItem[] = [
    ...tasks
      .filter((t) => t.due_date === dateStr)
      .map((t) => ({
        kind: 'task' as const,
        id: t.id,
        title: t.title,
        time: t.due_time,
        color: t.course_id ? courseById[t.course_id]?.color ?? '#9ca3af' : '#9ca3af',
        sub: t.course_id ? courseById[t.course_id]?.code ?? '' : 'Task',
        done: t.completed,
        data: t,
      })),
    ...assessments
      .filter((a) => a.due_date === dateStr)
      .map((a) => ({
        kind: 'assessment' as const,
        id: a.id,
        title: a.title,
        time: a.due_time,
        color: courseById[a.course_id]?.color ?? '#888',
        sub: `${courseById[a.course_id]?.code ?? ''} · ${a.type}`,
        done: a.status === 'done',
        data: a,
      })),
  ]

  const untimed = items.filter((i) => i.time == null)
  const byHour = new Map<number, TimelineItem[]>()
  for (const i of items) {
    const h = timeToHour(i.time)
    if (h == null) continue
    const arr = byHour.get(h) ?? []
    arr.push(i)
    byHour.set(h, arr)
  }

  function select(item: TimelineItem) {
    if (item.kind === 'task') onSelectTask(item.data as Task)
    else onSelectAssessment(item.data as Assessment)
  }

  return (
    <div>
      {untimed.length > 0 && (
        <div className="mb-3 space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-40">No time set</p>
          {untimed.map((item) => (
            <button
              key={item.id}
              onClick={() => select(item)}
              className="w-full flex items-center gap-2 rounded-xl bg-black/5 dark:bg-white/5 px-3 py-2 text-left"
            >
              <CourseDot color={item.color} />
              <span className={`text-sm flex-1 truncate ${item.done ? 'line-through opacity-40' : ''}`}>{item.title}</span>
              <span className="text-[10px] opacity-40">{item.sub}</span>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-black/5 dark:border-white/10 overflow-hidden">
        {HOURS.map((h) => {
          const hourItems = byHour.get(h) ?? []
          return (
            <div key={h} className="flex border-b border-black/5 dark:border-white/5 last:border-0 min-h-[44px]">
              <div className="w-16 shrink-0 py-2 px-2 text-[10px] opacity-40 text-right">{hourLabel(h)}</div>
              <button
                onClick={() => hourItems.length === 0 && onCreateAtTime(dateStr, `${String(h).padStart(2, '0')}:00`)}
                className="flex-1 flex flex-col gap-1 py-1.5 px-2 text-left border-l border-black/5 dark:border-white/5"
              >
                {hourItems.length === 0 ? (
                  <span className="opacity-0 text-[10px]">+</span>
                ) : (
                  hourItems.map((item) => (
                    <span
                      key={item.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        select(item)
                      }}
                      className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs"
                      style={{ background: item.color + '22' }}
                    >
                      <CourseDot color={item.color} />
                      <span className={`truncate ${item.done ? 'line-through opacity-40' : ''}`}>{item.title}</span>
                      <span className="opacity-50 shrink-0">{item.time?.slice(0, 5)}</span>
                    </span>
                  ))
                )}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
