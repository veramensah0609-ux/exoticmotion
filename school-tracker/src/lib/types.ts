export type CategoryWeights = { K: number; T: number; C: number; A: number }
export type TermStructure = { term_work: number; exam: number; attendance: number }

export interface Course {
  id: string
  user_id: string
  code: string
  name: string
  color: string
  teacher_name: string | null
  teacher_email: string | null
  category_weights: CategoryWeights
  term_structure: TermStructure
  archived: boolean
  created_at: string
}

export interface Unit {
  id: string
  course_id: string
  name: string
  sort_order: number
  shaky_level: number
  created_at: string
}

export type AssessmentType = 'quiz' | 'test' | 'exam' | 'assignment' | 'lab' | 'portfolio' | 'journal' | 'other'
export type AssessmentStatus = 'upcoming' | 'done' | 'missing' | 'excused'

export interface Assessment {
  id: string
  user_id: string
  course_id: string
  unit_id: string | null
  title: string
  type: AssessmentType
  category: 'K' | 'T' | 'C' | 'A' | null
  weight_percent: number | null
  due_time: string | null
  due_date: string | null
  drop_box_opens: string | null
  mark_earned: number | null
  mark_total: number | null
  status: AssessmentStatus
  notes: string | null
  created_at: string
}

export interface Task {
  id: string
  user_id: string
  course_id: string | null
  assessment_id: string | null
  parent_task_id: string | null
  title: string
  notes: string | null
  due_date: string | null
  due_time: string | null
  estimate_minutes: number | null
  priority_score: number
  completed: boolean
  completed_at: string | null
  recurring_rule: string | null
  sort_order: number
  created_at: string
}

export interface Mistake {
  id: string
  user_id: string
  course_id: string | null
  unit_id: string | null
  assessment_id: string | null
  question: string
  why_wrong: string | null
  tags: string[]
  mastered: boolean
  review_count: number
  last_reviewed_at: string | null
  created_at: string
}

export interface Flashcard {
  id: string
  user_id: string
  course_id: string | null
  deck: string
  front: string
  back: string
  created_at: string
}

export interface StudySession {
  id: string
  user_id: string
  course_id: string | null
  started_at: string
  ended_at: string | null
  duration_minutes: number | null
  notes: string | null
}

export interface Reassessment {
  id: string
  user_id: string
  course_id: string
  assessment_id: string | null
  requested_at: string
  status: 'requested' | 'approved' | 'denied' | 'completed'
  approved_date: string | null
  deadline: string | null
  notes: string | null
  created_at: string
}

export interface NotificationSettings {
  user_id: string
  quiet_hours_start: string
  quiet_hours_end: string
  course_mutes: Record<string, boolean>
  morning_brief_enabled: boolean
  morning_brief_time: string
}
