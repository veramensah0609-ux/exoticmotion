import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { supabase } from '../lib/supabase'
import { Card, EmptyState, PageHeader } from '../components/shared'
import { importSeedCourses } from '../lib/seedData'

const PALETTE = ['#6366f1', '#ec4899', '#22c55e', '#f59e0b', '#06b6d4', '#8b5cf6', '#ef4444', '#14b8a6']

export default function Courses() {
  const { user } = useAuth()
  const { courses, units, refresh } = useData()
  const [adding, setAdding] = useState(false)
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [color, setColor] = useState(PALETTE[0])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [unitDraft, setUnitDraft] = useState('')
  const [importing, setImporting] = useState(false)

  async function doImport() {
    if (!user) return
    setImporting(true)
    await importSeedCourses(user.id)
    await refresh()
    setImporting(false)
  }

  async function addCourse(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim() || !user) return
    await supabase.from('courses').insert({ user_id: user.id, code: code.trim(), name: name.trim() || code.trim(), color })
    setCode('')
    setName('')
    setColor(PALETTE[Math.floor(Math.random() * PALETTE.length)])
    setAdding(false)
    await refresh()
  }

  async function removeCourse(id: string) {
    if (!confirm('Delete this course and all its data?')) return
    await supabase.from('courses').delete().eq('id', id)
    await refresh()
  }

  async function addUnit(courseId: string) {
    if (!unitDraft.trim()) return
    const courseUnits = units.filter((u) => u.course_id === courseId)
    await supabase.from('units').insert({ course_id: courseId, name: unitDraft.trim(), sort_order: courseUnits.length })
    setUnitDraft('')
    await refresh()
  }

  async function removeUnit(id: string) {
    await supabase.from('units').delete().eq('id', id)
    await refresh()
  }

  async function updateWeights(courseId: string, field: 'term_work' | 'exam' | 'attendance', value: number, current: Record<string, number>) {
    await supabase.from('courses').update({ term_structure: { ...current, [field]: value } }).eq('id', courseId)
    await refresh()
  }

  return (
    <div>
      <PageHeader title="Courses" right={<button onClick={() => setAdding((a) => !a)} className="text-xs font-medium bg-zinc-900 text-white px-3 py-1.5 rounded-full">{adding ? 'Cancel' : '+ Add'}</button>} />

      <div className="px-4 space-y-3">
        {adding && (
          <form onSubmit={addCourse} className="rounded-2xl border border-black/10 dark:border-white/15 p-3 space-y-2">
            <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="Course code (e.g. MCR3U1)" className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none" />
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2.5 py-2 text-sm outline-none" />
            <div className="flex gap-2">
              {PALETTE.map((c) => (
                <button type="button" key={c} onClick={() => setColor(c)} className="h-7 w-7 rounded-full" style={{ background: c, outline: color === c ? '2px solid white' : 'none', outlineOffset: 2, boxShadow: color === c ? '0 0 0 2px ' + c : 'none' }} />
              ))}
            </div>
            <button type="submit" className="w-full rounded-lg bg-zinc-900 text-white py-2 text-sm font-medium">Add course</button>
          </form>
        )}

        {courses.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <EmptyState icon="📚" text="No courses yet." />
            <button
              onClick={doImport}
              disabled={importing}
              className="rounded-xl bg-zinc-900 text-white px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {importing ? 'Importing…' : 'Import my 2026-27 courses'}
            </button>
            <p className="text-[11px] opacity-40 px-6">Loads MCR3U1, SPH3U1, SBI3U1, NBE3U, BOH4M1 & SCH3U1 with units, weights, and known assessment dates from your course outlines.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {courses.map((c) => {
                const courseUnits = units.filter((u) => u.course_id === c.id)
                const isSelected = expanded === c.id
                return (
                  <button
                    key={c.id}
                    onClick={() => setExpanded(isSelected ? null : c.id)}
                    className={`relative rounded-[24px] p-4 text-left aspect-square flex flex-col justify-between overflow-hidden shadow-[0_8px_20px_-10px_rgba(0,0,0,0.3)] transition-transform active:scale-[0.97] ${
                      isSelected ? 'ring-4 ring-offset-2 ring-offset-[#f0f0f2] dark:ring-offset-[#0b0d12]' : ''
                    }`}
                    style={{ background: `linear-gradient(150deg, ${c.color}, ${c.color}99)`, ['--tw-ring-color' as string]: c.color }}
                  >
                    <div className="h-8 w-8 rounded-full bg-white/25 flex items-center justify-center text-[11px] font-bold text-white shrink-0">
                      {c.code.slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-base font-bold text-white tracking-tight leading-tight">{c.code}</p>
                      <p className="text-[11px] text-white/80 mt-0.5 line-clamp-2">{c.name}</p>
                      <span className="inline-block mt-2 text-[10px] font-medium text-white/90 bg-black/15 rounded-full px-2 py-0.5">
                        {courseUnits.length} units
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            {expanded && (() => {
              const c = courses.find((x) => x.id === expanded)
              if (!c) return null
              const courseUnits = units.filter((u) => u.course_id === c.id)
              return (
                <Card className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">{c.name}</p>
                      <p className="text-xs opacity-50">{c.code}</p>
                    </div>
                    <button onClick={() => removeCourse(c.id)} className="h-7 w-7 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-xs shrink-0">✕</button>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Units</p>
                    <div className="space-y-1.5">
                      {courseUnits.map((u) => (
                        <div key={u.id} className="flex items-center gap-2 text-sm">
                          <span className="flex-1">{u.name}</span>
                          <button onClick={() => removeUnit(u.id)} className="opacity-30 hover:opacity-70 text-xs">✕</button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <input value={unitDraft} onChange={(e) => setUnitDraft(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addUnit(c.id)} placeholder="Add unit" className="flex-1 rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 text-xs outline-none" />
                        <button onClick={() => addUnit(c.id)} className="text-xs font-medium text-zinc-600 px-2">Add</button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-2">Term structure</p>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      {(['term_work', 'exam', 'attendance'] as const).map((field) => (
                        <label key={field} className="space-y-1">
                          <span className="opacity-50 capitalize">{field.replace('_', ' ')}</span>
                          <input
                            type="number"
                            defaultValue={c.term_structure[field]}
                            onBlur={(e) => updateWeights(c.id, field, Number(e.target.value), c.term_structure)}
                            className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 outline-none"
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </Card>
              )
            })()}
          </>
        )}
      </div>
    </div>
  )
}
