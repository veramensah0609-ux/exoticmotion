import type { Assessment, NotificationSettings, Task } from './types'
import { daysUntil } from './priority'
import { supabase } from './supabase'

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

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = atob(base64)
  return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0))).buffer
}

/** Subscribes this device to server-sent push notifications (works even when the app is closed). */
export async function subscribeToPush(userId: string): Promise<'subscribed' | 'unsupported' | 'error'> {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY as string | undefined
  if (!vapidPublicKey) return 'unsupported'

  try {
    const registration = await navigator.serviceWorker.ready
    let subscription = await registration.pushManager.getSubscription()
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      })
    }
    const json = subscription.toJSON() as { endpoint?: string; keys?: { p256dh: string; auth: string } }
    if (!json.endpoint || !json.keys) return 'error'

    await supabase.from('push_subscriptions').upsert(
      { user_id: userId, endpoint: json.endpoint, keys: json.keys },
      { onConflict: 'endpoint' },
    )
    return 'subscribed'
  } catch {
    return 'error'
  }
}
