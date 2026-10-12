import type { CSSProperties, ReactNode } from 'react'
import { format, parseISO } from 'date-fns'
import { daysUntil } from '../lib/priority'

export function PageHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <div className="px-4 pt-[calc(1rem+env(safe-area-inset-top))] pb-3 flex items-start justify-between">
      <div>
        <h1 className="text-[28px] font-bold tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm opacity-50 mt-0.5">{subtitle}</p>}
      </div>
      {right}
    </div>
  )
}

export function Card({ children, className = '', style }: { children: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <div
      style={style}
      className={`rounded-[28px] bg-white dark:bg-zinc-900/60 border border-black/5 dark:border-white/10 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_-12px_rgba(0,0,0,0.08)] dark:shadow-none ${className}`}
    >
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

export function tint(color: string, alpha = 0.1): string {
  const hex = color.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16)
  const g = parseInt(hex.slice(2, 4), 16)
  const b = parseInt(hex.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function EmptyState({ text, icon = '✨' }: { text: string; icon?: string }) {
  return (
    <div className="text-center py-10 px-4">
      <div className="h-12 w-12 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-xl mx-auto mb-3">{icon}</div>
      <p className="text-sm opacity-50">{text}</p>
    </div>
  )
}

export function ProgressRing({ done, total, size = 56 }: { done: number; total: number; size?: number }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 100
  const stroke = 5
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const offset = c - (pct / 100) * c
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} className="stroke-black/10 dark:stroke-white/15" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="stroke-zinc-900 dark:stroke-white transition-all duration-500"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[13px] font-bold tabular-nums">{pct}%</span>
    </div>
  )
}
