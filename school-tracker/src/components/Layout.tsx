import { NavLink, Outlet } from 'react-router-dom'
import { useState } from 'react'
import QuickAdd from './QuickAdd'

const navItems = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/calendar', label: 'Calendar', icon: CalendarIcon },
  { to: '/tasks', label: 'Tasks', icon: TaskIcon },
  { to: '/grades', label: 'Grades', icon: GradeIcon },
  { to: '/study', label: 'Study', icon: StudyIcon },
]

export default function Layout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="min-h-dvh pb-36">
      <Outlet />

      <button
        onClick={() => setQuickAddOpen(true)}
        className="fixed right-4 bottom-20 z-30 h-14 w-14 rounded-full bg-neutral-900 text-white shadow-lg shadow-neutral-900/40 flex items-center justify-center text-2xl active:scale-95 transition"
        aria-label="Quick add"
      >
        +
      </button>

      {quickAddOpen && <QuickAdd onClose={() => setQuickAddOpen(false)} />}

      <nav className="fixed bottom-0 inset-x-0 z-20 px-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        <div className="flex items-stretch max-w-lg mx-auto rounded-[28px] bg-white/90 dark:bg-neutral-900/90 backdrop-blur border border-black/5 dark:border-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.15)] px-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-0.5 py-2.5 my-1.5 rounded-2xl text-[10px] font-medium transition-colors ${
                  isActive ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'opacity-50'
                }`
              }
            >
              <Icon />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/more"
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center gap-0.5 py-2.5 my-1.5 rounded-2xl text-[10px] font-medium transition-colors ${
                isActive ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'opacity-50'
              }`
            }
          >
            <MoreIcon />
            More
          </NavLink>
        </div>
      </nav>
    </div>
  )
}

function HomeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 10.5 12 3l9 7.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function CalendarIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 3v4M16 3v4" strokeLinecap="round" />
    </svg>
  )
}
function TaskIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m5 12 4 4 10-10" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="4" width="18" height="16" rx="2" />
    </svg>
  )
}
function GradeIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 17 9 11l4 4 8-8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function StudyIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
function MoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
    </svg>
  )
}
