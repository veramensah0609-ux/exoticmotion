import type { CSSProperties, ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { daysUntil } from '../lib/priority'

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 flex items-start justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm opacity-50 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div style={style} className={`rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 ${className}`}>
      {children}
    </div>
  )
}

export function DueBadge({ date, done }: { date: string | null; done?: boolean }) {
  if (!date) return null
  const d = daysUntil(date)
  if (d === null) return null
  let label: string
  let cls: string
  if (done) {
    label = format(parseISO(date), 'MMM d')
    cls = 'bg-black/5 dark:bg-white/10 opacity-60'
  } else if (d < 0) {
    label = `${Math.abs(d)}d overdue`
    cls = 'bg-red-500/15 text-red-500'
  } else if (d === 0) {
    label = 'Today'
    cls = 'bg-amber-500/15 text-amber-500'
  } else if (d === 1) {
    label = 'Tomorrow'
    cls = 'bg-amber-500/15 text-amber-500'
  } else if (d <= 3) {
    label = `${d}d`
    cls = 'bg-amber-500/10 text-amber-500'
  } else {
    label = format(parseISO(date), 'MMM d')
    cls = 'bg-black/5 dark:bg-white/10 opacity-70'
  }
  return <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${cls}`}>{label}</span>
}

export function CourseDot({ color }: { color: string }) {
  return <span className="h-2 w-2 rounded-full shrink-0" style={{ background: color }} />
}

export function EmptyState({ text }: { text: string }) {
  return <p className="text-sm opacity-40 text-center py-8">{text}</p>
}
