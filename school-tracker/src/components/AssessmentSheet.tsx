import { useState } from 'react'
import { format, parseISO } from 'date-fns'
import { supabase } from '../lib/supabase'
import { useData } from '../contexts/DataContext'
import type { Assessment, AssessmentStatus } from '../lib/types'
import { CourseDot } from './shared'

export default function AssessmentSheet({ assessment, onClose }: { assessment: Assessment; onClose: () => void }) {
  const { courses, units, refresh } = useData()
  const course = courses.find((c) => c.id === assessment.course_id)
  const unit = units.find((u) => u.id === assessment.unit_id)

  const [earned, setEarned] = useState(assessment.mark_earned != null ? String(assessment.mark_earned) : '')
  const [total, setTotal] = useState(assessment.mark_total != null ? String(assessment.mark_total) : '')
  const [dueDate, setDueDate] = useState(assessment.due_date ?? '')
  const [dueTime, setDueTime] = useState(assessment.due_time ?? '')
  const [saving, setSaving] = useState(false)

  async function setStatus(status: AssessmentStatus) {
    setSaving(true)
    await supabase.from('assessments').update({ status }).eq('id', assessment.id)
    await refresh()
    setSaving(false)
  }

  async function saveMark() {
    setSaving(true)
    await supabase
      .from('assessments')
      .update({
        mark_earned: earned === '' ? null : Number(earned),
        mark_total: total === '' ? null : Number(total),
        due_date: dueDate || null,
        due_time: dueTime || null,
        status: earned !== '' ? 'done' : assessment.status,
      })
      .eq('id', assessment.id)
    await refresh()
    setSaving(false)
    onClose()
  }

  const pct = earned !== '' && total !== '' && Number(total) > 0 ? Math.round((Number(earned) / Number(total)) * 1000) / 10 : null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-[#15171f] rounded-t-3xl p-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))] space-y-4"
      >
        <div className="h-1 w-10 bg-black/15 dark:bg-white/20 rounded-full mx-auto mb-1" />

        <div>
          <p className="text-xs opacity-50 flex items-center gap-1.5">
            {course && <CourseDot color={course.color} />}
            {course?.code} {unit ? `· ${unit.name}` : ''}
          </p>
          <h2 className="text-lg font-bold mt-0.5">{assessment.title}</h2>
          <p className="text-xs opacity-50 mt-0.5 capitalize">
            {assessment.type}
            {assessment.weight_percent ? ` · worth ${assessment.weight_percent}% of term work` : ''}
            {assessment.category ? ` · ${assessment.category}` : ''}
          </p>
        </div>

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

        <div className="text-xs space-y-1">
          <span className="opacity-50">Status</span>
          <div className="flex gap-1">
            {(['upcoming', 'missing', 'excused'] as AssessmentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                disabled={saving}
                className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium capitalize ${
                  assessment.status === s ? 'bg-red-500 text-white' : 'bg-black/5 dark:bg-white/10 opacity-60'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs opacity-50 mb-1.5">Log your grade</p>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={earned}
              onChange={(e) => setEarned(e.target.value)}
              placeholder="earned"
              className="w-24 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none"
            />
            <span className="opacity-40">/</span>
            <input
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value)}
              placeholder="total"
              className="w-24 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none"
            />
            {pct != null && <span className="ml-auto text-lg font-bold tabular-nums">{pct}%</span>}
          </div>
        </div>

        {assessment.due_date && (
          <p className="text-[11px] opacity-40">Originally due {format(parseISO(assessment.due_date), 'EEEE, MMM d')}</p>
        )}

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-black/5 dark:bg-white/10">
            Close
          </button>
          <button
            onClick={saveMark}
            disabled={saving}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium bg-indigo-600 text-white disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
