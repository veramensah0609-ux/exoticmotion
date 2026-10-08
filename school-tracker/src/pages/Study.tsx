import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { supabase } from '../lib/supabase'
import { Card, CourseDot, EmptyState, PageHeader } from '../components/shared'
import { startOfWeek, isAfter } from 'date-fns'

export default function Study() {
  const { user } = useAuth()
  const { courses, studySessions, mistakes, flashcards, refresh } = useData()
  const [courseId, setCourseId] = useState('')
  const [running, setRunning] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const startedAtRef = useRef<number | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  function recomputeSeconds() {
    if (startedAtRef.current != null) {
      setSeconds(Math.round((Date.now() - startedAtRef.current) / 1000))
    }
  }

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(recomputeSeconds, 1000)
      document.addEventListener('visibilitychange', recomputeSeconds)
      window.addEventListener('focus', recomputeSeconds)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
      document.removeEventListener('visibilitychange', recomputeSeconds)
      window.removeEventListener('focus', recomputeSeconds)
    }
  }, [running])

  async function start() {
    if (!user) return
    const { data } = await supabase
      .from('study_sessions')
      .insert({ user_id: user.id, course_id: courseId || null })
      .select()
      .single()
    setSessionId(data?.id ?? null)
    startedAtRef.current = Date.now()
    setSeconds(0)
    setRunning(true)
  }

  async function stop() {
    setRunning(false)
    const elapsedSeconds = startedAtRef.current != null ? Math.round((Date.now() - startedAtRef.current) / 1000) : seconds
    if (sessionId) {
      const durationMinutes = Math.max(1, Math.round(elapsedSeconds / 60))
      await supabase
        .from('study_sessions')
        .update({ ended_at: new Date().toISOString(), duration_minutes: durationMinutes })
        .eq('id', sessionId)
      await refresh()
    }
    startedAtRef.current = null
    setSessionId(null)
    setSeconds(0)
  }

  const weekStart = startOfWeek(new Date())
  const thisWeekSessions = studySessions.filter((s) => isAfter(new Date(s.started_at), weekStart) && s.duration_minutes != null)
  const minutesByCourse = useMemo(() => {
    const map: Record<string, number> = {}
    for (const s of thisWeekSessions) {
      const key = s.course_id ?? 'none'
      map[key] = (map[key] ?? 0) + (s.duration_minutes ?? 0)
    }
    return map
  }, [thisWeekSessions])

  const totalWeekMinutes = thisWeekSessions.reduce((s, x) => s + (x.duration_minutes ?? 0), 0)

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0')
  const ss = String(seconds % 60).padStart(2, '0')

  return (
    <div>
      <PageHeader title="Study" />

      <div className="px-4 space-y-4">
        <Card className="p-6 text-center">
          <p className="text-5xl font-bold tabular-nums tracking-tight">{mm}:{ss}</p>
          <select
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
            disabled={running}
            className="mt-3 mx-auto block rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-3 py-1.5 text-xs outline-none disabled:opacity-40"
          >
            <option value="">General studying</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.code}</option>
            ))}
          </select>
          <button
            onClick={running ? stop : start}
            className={`mt-4 w-full rounded-xl py-3 text-sm font-semibold ${running ? 'bg-red-500 text-white' : 'bg-indigo-600 text-white'}`}
          >
            {running ? 'Stop & save' : 'Start studying'}
          </button>
        </Card>

        <Card className="p-4">
          <p className="text-xs font-semibold uppercase tracking-wide opacity-50 mb-3">This week · {Math.round(totalWeekMinutes / 60 * 10) / 10}h total</p>
          {Object.keys(minutesByCourse).length === 0 ? (
            <EmptyState text="No study sessions logged yet." />
          ) : (
            <div className="space-y-2">
              {Object.entries(minutesByCourse)
                .sort((a, b) => b[1] - a[1])
                .map(([cid, mins]) => {
                  const c = courses.find((x) => x.id === cid)
                  const pct = totalWeekMinutes ? (mins / totalWeekMinutes) * 100 : 0
                  return (
                    <div key={cid}>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5">{c && <CourseDot color={c.color} />}{c?.code ?? 'General'}</span>
                        <span className="opacity-50">{Math.round(mins / 60 * 10) / 10}h</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-black/5 dark:bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: c?.color ?? '#9ca3af' }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </Card>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/mistakes" className="rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4">
            <p className="text-2xl font-bold">{mistakes.filter((m) => !m.mastered).length}</p>
            <p className="text-xs opacity-50 mt-0.5">mistakes to review</p>
          </Link>
          <Link to="/flashcards" className="rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 p-4">
            <p className="text-2xl font-bold">{flashcards.length}</p>
            <p className="text-xs opacity-50 mt-0.5">flashcards</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
