import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useData } from '../contexts/DataContext'
import { supabase } from '../lib/supabase'
import { Card, CourseDot, PageHeader } from '../components/shared'
import { requestNotificationPermission, subscribeToPush } from '../lib/notifications'

export default function Settings() {
  const { user } = useAuth()
  const { courses, units, assessments, tasks, mistakes, flashcards, studySessions, reassessments, notificationSettings, refresh } = useData()
  const [permStatus, setPermStatus] = useState<NotificationPermission>(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied',
  )
  const [pushStatus, setPushStatus] = useState<'idle' | 'subscribing' | 'subscribed' | 'error' | 'unsupported'>('idle')

  useEffect(() => {
    if (permStatus !== 'granted' || !('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setPushStatus(sub ? 'subscribed' : 'idle'))
      .catch(() => setPushStatus('unsupported'))
  }, [permStatus])

  async function ensureSettings() {
    if (notificationSettings || !user) return notificationSettings
    const { data } = await supabase.from('notification_settings').insert({ user_id: user.id }).select().single()
    await refresh()
    return data
  }

  async function updateSetting(field: string, value: unknown) {
    await ensureSettings()
    await supabase.from('notification_settings').upsert({ user_id: user!.id, [field]: value }).eq('user_id', user!.id)
    await refresh()
  }

  async function toggleMute(courseId: string) {
    const current = notificationSettings?.course_mutes ?? {}
    const next = { ...current, [courseId]: !current[courseId] }
    await updateSetting('course_mutes', next)
  }

  async function enableNotifications() {
    const perm = await requestNotificationPermission()
    setPermStatus(perm)
    if (perm === 'granted' && user) {
      await ensureSettings()
      setPushStatus('subscribing')
      const result = await subscribeToPush(user.id)
      setPushStatus(result)
    }
  }

  function exportBackup() {
    const data = { courses, units, assessments, tasks, mistakes, flashcards, studySessions, reassessments, exported_at: new Date().toISOString() }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `school-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader title="Settings" />
      <div className="px-4 space-y-4">
        <Card className="p-4">
          <p className="text-sm font-semibold mb-1">Notifications</p>
          <p className="text-xs opacity-50 mb-3">
            {permStatus === 'granted' && pushStatus === 'subscribed'
              ? 'Push enabled on this device — you’ll get reminders even when the app is closed.'
              : permStatus === 'granted' && pushStatus === 'unsupported'
                ? 'Browser notifications on while open, but this browser doesn’t support background push. Install to your home screen on iOS to enable it.'
                : 'Enable to get due-soon reminders, test countdowns, and daily briefs — even when the app is closed.'}
          </p>
          {(permStatus !== 'granted' || (pushStatus !== 'subscribed' && pushStatus !== 'unsupported')) && (
            <button
              onClick={enableNotifications}
              disabled={pushStatus === 'subscribing'}
              className="w-full rounded-xl bg-indigo-600 text-white py-2.5 text-sm font-medium disabled:opacity-50"
            >
              {pushStatus === 'subscribing' ? 'Enabling…' : 'Enable notifications'}
            </button>
          )}
          {pushStatus === 'error' && <p className="text-xs text-red-500 mt-2">Couldn’t finish setting up push. Try again, or check the browser allows notifications for this site.</p>}
        </Card>

        <Card className="p-4 space-y-3">
          <p className="text-sm font-semibold">Quiet hours</p>
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs space-y-1">
              <span className="opacity-50">From</span>
              <input
                type="time"
                defaultValue={notificationSettings?.quiet_hours_start ?? '21:30'}
                onBlur={(e) => updateSetting('quiet_hours_start', e.target.value)}
                className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 outline-none"
              />
            </label>
            <label className="text-xs space-y-1">
              <span className="opacity-50">To</span>
              <input
                type="time"
                defaultValue={notificationSettings?.quiet_hours_end ?? '07:00'}
                onBlur={(e) => updateSetting('quiet_hours_end', e.target.value)}
                className="w-full rounded-lg border border-black/10 dark:border-white/15 bg-transparent px-2 py-1.5 outline-none"
              />
            </label>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-1">Morning brief</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs opacity-50">Today's tasks & overdue items, each morning</p>
            <button
              onClick={() => updateSetting('morning_brief_enabled', !(notificationSettings?.morning_brief_enabled ?? true))}
              className={`h-6 w-11 rounded-full relative transition shrink-0 ${notificationSettings?.morning_brief_enabled ?? true ? 'bg-indigo-600' : 'bg-black/15'}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${notificationSettings?.morning_brief_enabled ?? true ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-2">Mute per course</p>
          <div className="space-y-2">
            {courses.map((c) => (
              <div key={c.id} className="flex items-center justify-between">
                <span className="text-xs flex items-center gap-1.5"><CourseDot color={c.color} />{c.code}</span>
                <button
                  onClick={() => toggleMute(c.id)}
                  className={`h-5 w-9 rounded-full relative transition ${notificationSettings?.course_mutes?.[c.id] ? 'bg-black/20' : 'bg-indigo-600'}`}
                >
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition ${notificationSettings?.course_mutes?.[c.id] ? 'left-0.5' : 'left-4'}`} />
                </button>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <p className="text-sm font-semibold mb-1">Backup</p>
          <p className="text-xs opacity-50 mb-3">Export everything as JSON, just in case.</p>
          <button onClick={exportBackup} className="w-full rounded-xl bg-black/5 dark:bg-white/10 py-2.5 text-sm font-medium">
            Export backup
          </button>
        </Card>

        <p className="text-[11px] opacity-40 text-center px-4 pb-4">
          Your data syncs automatically across any device you sign into. Install this app to your home screen for the best notification experience.
        </p>
      </div>
    </div>
  )
}
