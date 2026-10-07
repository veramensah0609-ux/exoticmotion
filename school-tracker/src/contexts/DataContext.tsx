import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './AuthContext'
import type {
  Assessment,
  Course,
  Flashcard,
  Mistake,
  NotificationSettings,
  Reassessment,
  StudySession,
  Task,
  Unit,
} from '../lib/types'

interface DataState {
  loading: boolean
  courses: Course[]
  units: Unit[]
  assessments: Assessment[]
  tasks: Task[]
  mistakes: Mistake[]
  flashcards: Flashcard[]
  studySessions: StudySession[]
  reassessments: Reassessment[]
  notificationSettings: NotificationSettings | null
  refresh: () => Promise<void>
}

const DataContext = createContext<DataState | null>(null)

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<Course[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [mistakes, setMistakes] = useState<Mistake[]>([])
  const [flashcards, setFlashcards] = useState<Flashcard[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [reassessments, setReassessments] = useState<Reassessment[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings | null>(null)

  const refresh = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const [c, u, a, t, m, f, s, r, ns] = await Promise.all([
      supabase.from('courses').select('*').order('code'),
      supabase.from('units').select('*').order('sort_order'),
      supabase.from('assessments').select('*').order('due_date', { nullsFirst: false }),
      supabase.from('tasks').select('*').order('due_date', { nullsFirst: false }),
      supabase.from('mistakes').select('*').order('created_at', { ascending: false }),
      supabase.from('flashcards').select('*').order('created_at', { ascending: false }),
      supabase.from('study_sessions').select('*').order('started_at', { ascending: false }),
      supabase.from('reassessments').select('*').order('requested_at', { ascending: false }),
      supabase.from('notification_settings').select('*').maybeSingle(),
    ])
    setCourses((c.data as Course[]) ?? [])
    setUnits((u.data as Unit[]) ?? [])
    setAssessments((a.data as Assessment[]) ?? [])
    setTasks((t.data as Task[]) ?? [])
    setMistakes((m.data as Mistake[]) ?? [])
    setFlashcards((f.data as Flashcard[]) ?? [])
    setStudySessions((s.data as StudySession[]) ?? [])
    setReassessments((r.data as Reassessment[]) ?? [])
    setNotificationSettings((ns.data as NotificationSettings) ?? null)
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (user) refresh()
    else setLoading(false)
  }, [user, refresh])

  return (
    <DataContext.Provider
      value={{
        loading,
        courses,
        units,
        assessments,
        tasks,
        mistakes,
        flashcards,
        studySessions,
        reassessments,
        notificationSettings,
        refresh,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const ctx = useContext(DataContext)
  if (!ctx) throw new Error('useData must be used within DataProvider')
  return ctx
}
