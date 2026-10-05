# School Tracker

A personal installable PWA for tracking deadlines, grades, study time, and mistakes across all your courses.

## Stack

- React + TypeScript + Vite, Tailwind v4
- Supabase (Postgres + Auth) for cross-device sync
- `vite-plugin-pwa` for installability + local notifications

## Setup

1. `npm install`
2. Copy `.env.example` to `.env` (already configured for this project's Supabase instance; the publishable key is safe to expose client-side)
3. `npm run dev`

## First run

1. Sign up with your email + a password (Supabase sends a confirmation email by default — check your inbox).
2. Go to **More → Courses → Import my VSS Fall 2026 courses** to load MCR3U1, SPH3U1, SBI3U1, and NBE3U with units and known assessment dates pulled from your course outlines.
3. Go to **More → Settings → Enable notifications** to get due-soon reminders on this device.
4. Install to your home screen (Share → Add to Home Screen on iOS, or the install icon in Chrome) for the best experience.

## Features

- **Dashboard**: overdue/today/upcoming tasks, missing work, next-test countdown with shaky units
- **Calendar**: week/month view of assessments + tasks
- **Tasks**: subtasks, course filters, priority sort, quick-add
- **Grades**: live averages, category (K/T/C/A) breakdown, target calculator, what-if mode, trend chart
- **Study**: timer with session logging, weekly time-per-course report
- **Mistakes**: log + spaced review mode
- **Flashcards**: decks, study mode, JSON import/export
- **Reassessments**: track requests, approvals, deadlines
- **Settings**: quiet hours, per-course mutes, morning brief toggle, JSON backup

## Notifications

Notifications fire client-side while the app is open or running in the background on a device where it's installed (standard PWA limitation, especially on iOS). There's no server-side push yet — if you want push notifications to arrive even when the app is fully closed, that needs a small serverless function + VAPID keys, which can be added later.
