import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import { supabase } from '../lib/supabase'
import { Card, PageHeader } from '../components/shared'

const links = [
  { to: '/courses', label: 'Courses', desc: 'Manage courses, weights, teachers', icon: '📚' },
  { to: '/mistakes', label: 'Mistakes', desc: 'Log and review what tripped you up', icon: '🧠' },
  { to: '/flashcards', label: 'Flashcards', desc: 'Decks, study mode, import/export', icon: '🗂️' },
  { to: '/reassessments', label: 'Reassessments', desc: 'Track requests and deadlines', icon: '🔁' },
  { to: '/settings', label: 'Notifications & settings', desc: 'Quiet hours, reminders, backup', icon: '⚙️' },
]

export default function More() {
  const { theme, toggle } = useTheme()

  return (
    <div>
      <PageHeader title="More" />
      <div className="px-4 space-y-4">
        <Card className="divide-y divide-black/5 dark:divide-white/10">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-xl">{l.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{l.label}</p>
                <p className="text-xs opacity-50">{l.desc}</p>
              </div>
              <span className="opacity-30">›</span>
            </Link>
          ))}
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Dark mode</p>
            <p className="text-xs opacity-50">{theme === 'dark' ? 'On' : 'Off'}</p>
          </div>
          <button
            onClick={toggle}
            className={`h-7 w-12 rounded-full relative transition ${theme === 'dark' ? 'bg-indigo-600' : 'bg-black/15'}`}
          >
            <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white transition ${theme === 'dark' ? 'left-5' : 'left-0.5'}`} />
          </button>
        </Card>

        <button
          onClick={() => supabase.auth.signOut()}
          className="w-full rounded-2xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 py-3 text-sm font-medium text-red-500"
        >
          Sign out
        </button>
      </div>
    </div>
  )
}
