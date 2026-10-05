import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { DataProvider, useData } from './contexts/DataContext'
import { ThemeProvider } from './contexts/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CalendarPage from './pages/CalendarPage'
import Tasks from './pages/Tasks'
import Grades from './pages/Grades'
import GradeDetail from './pages/GradeDetail'
import Study from './pages/Study'
import More from './pages/More'
import Courses from './pages/Courses'
import Mistakes from './pages/Mistakes'
import Flashcards from './pages/Flashcards'
import Reassessments from './pages/Reassessments'
import Settings from './pages/Settings'
import { checkAndNotify } from './lib/notifications'

function AppRoutes() {
  const { user, loading } = useAuth()

  if (loading) {
    return <div className="min-h-dvh flex items-center justify-center text-sm opacity-40">Loading…</div>
  }

  if (!user) {
    return (
      <Routes>
        <Route path="*" element={<Login />} />
      </Routes>
    )
  }

  return (
    <DataProvider>
      <NotificationWatcher />
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/grades" element={<Grades />} />
          <Route path="/grades/:courseId" element={<GradeDetail />} />
          <Route path="/study" element={<Study />} />
          <Route path="/more" element={<More />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/mistakes" element={<Mistakes />} />
          <Route path="/flashcards" element={<Flashcards />} />
          <Route path="/reassessments" element={<Reassessments />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </DataProvider>
  )
}

function NotificationWatcher() {
  const { tasks, assessments, notificationSettings } = useData()

  useEffect(() => {
    checkAndNotify(tasks, assessments, notificationSettings)
    const interval = setInterval(() => checkAndNotify(tasks, assessments, notificationSettings), 5 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') checkAndNotify(tasks, assessments, notificationSettings)
    })
    return () => clearInterval(interval)
  }, [tasks, assessments, notificationSettings])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
