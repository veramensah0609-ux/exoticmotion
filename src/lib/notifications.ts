import type { Assessment, NotificationSettings, Task } from './types'
import { daysUntil } from './priority'

const SEEN_KEY = 'notif_seen_v1'

function getSeen(): Set<string> {
  try {
    return new Set(JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]'))
  } catch {
    return new Set()
  }
}

function saveSeen(seen: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
}

function inQuietHours(settings: NotificationSettings | null): boolean {
  if (!settings) return false
  const now = new Date()
  const [sh, sm] = settings.quiet_hours_start.split(':').map(Number)
  const [eh, em] = settings.quiet_hours_end.split(':').map(Number)
  const nowMin = now.getHours() * 60 + now.getMinutes()
  const startMin = sh * 60 + sm
  const endMin = eh * 60 + em
  if (startMin < endMin) return nowMin >= startMin && nowMin < endMin
  return nowMin >= startMin || nowMin < endMin
}

function notify(tag: string, title: string, body: string) {
  if (Notification.permission !== 'granted') return
  try {
    new Notification(title, { body, tag, icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' })
  } catch {
    // some browsers require SW-based notifications
    navigator.serviceWorker?.getRegistration().then((reg) => {
      reg?.showNotification(title, { body, tag, icon: '/icons/icon-192.png' })
    })
  }
}

export function checkAndNotify(
  tasks: Task[],
  assessments: Assessment[],
  settings: NotificationSettings | null,
) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') return
  if (inQuietHours(settings)) return

  const seen = getSeen()
  const muted = settings?.course_mutes ?? {}

  for (const a of assessments) {
    if (!a.due_date || a.status === 'done') continue
    if (a.course_id && muted[a.course_id]) continue
    const d = daysUntil(a.due_date)
    if (d === 3 || d === 1 || d === 0) {
      const key = `a-${a.id}-${d}`
      if (seen.has(key)) continue
      const when = d === 0 ? 'today' : d === 1 ? 'tomorrow' : 'in 3 days'
      notify(key, `${a.title} due ${when}`, `${a.type} · don't let it sneak up on you`)
      seen.add(key)
    }
  }

  for (const t of tasks) {
    if (t.completed || !t.due_date) continue
    const d = daysUntil(t.due_date)
    if (d === 1 || d === 0) {
      const key = `t-${t.id}-${d}`
      if (seen.has(key)) continue
      notify(key, t.title, d === 0 ? 'Due today' : 'Due tomorrow')
      seen.add(key)
    }
  }

  saveSeen(seen)
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof Notification === 'undefined') return 'denied'
  return Notification.requestPermission()
}
