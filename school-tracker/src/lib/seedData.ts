import { supabase } from './supabase'

interface SeedAssessment {
  unit: string
  title: string
  type: 'quiz' | 'test' | 'exam' | 'assignment' | 'lab' | 'portfolio' | 'journal' | 'other'
  weight?: number
  due?: string
}

interface SeedCourse {
  code: string
  name: string
  color: string
  teacher_name?: string
  teacher_email?: string
  category_weights: { K: number; T: number; C: number; A: number }
  term_structure: { term_work: number; exam: number; attendance: number }
  units: string[]
  assessments: SeedAssessment[]
}

export const VSS_FALL_2026: SeedCourse[] = [
  {
    code: 'MCR3U1',
    name: 'Functions, University Preparation',
    color: '#6366f1',
    teacher_name: 'Ms. Lee',
    teacher_email: 'joan.lee2@tdsb.on.ca',
    category_weights: { K: 30, T: 20, C: 20, A: 30 },
    term_structure: { term_work: 65, exam: 25, attendance: 10 },
    units: [
      'Unit 1: Intro to Functions',
      'Unit 2: Building Algebraic Skills',
      'Unit 3: Working with Quadratic Functions',
      'Unit 4: Working with Exponential Functions',
      'Unit 5: Working with Trig Ratios',
      'Unit 6: Working with Sinusoidal Functions',
      'Unit 7: Working with Discrete Functions',
    ],
    assessments: [
      { unit: 'Unit 1: Intro to Functions', title: 'Quiz U1', type: 'quiz', weight: 2.6, due: '2026-09-18' },
      { unit: 'Unit 1: Intro to Functions', title: 'Test U1', type: 'test', weight: 6, due: '2026-09-24' },
      { unit: 'Unit 2: Building Algebraic Skills', title: 'Quiz U2', type: 'quiz', weight: 2.6, due: '2026-10-01' },
      { unit: 'Unit 2: Building Algebraic Skills', title: 'Test U2', type: 'test', weight: 6, due: '2026-10-07' },
      { unit: 'Unit 3: Working with Quadratic Functions', title: 'Quiz U3', type: 'quiz', weight: 2.6, due: '2026-10-16' },
      { unit: 'Unit 3: Working with Quadratic Functions', title: 'Test U3', type: 'test', weight: 6, due: '2026-10-26' },
      { unit: 'Unit 4: Working with Exponential Functions', title: 'Quiz U4', type: 'quiz', weight: 2.6, due: '2026-11-02' },
      { unit: 'Unit 4: Working with Exponential Functions', title: 'Test U4', type: 'test', weight: 6, due: '2026-11-09' },
      { unit: 'Unit 5: Working with Trig Ratios', title: 'Quiz U5', type: 'quiz', weight: 2.6, due: '2026-11-18' },
      { unit: 'Unit 5: Working with Trig Ratios', title: 'Test U5', type: 'test', weight: 6, due: '2026-11-26' },
      { unit: 'Unit 6: Working with Sinusoidal Functions', title: 'Quiz U6', type: 'quiz', weight: 2.6, due: '2026-12-04' },
      { unit: 'Unit 6: Working with Sinusoidal Functions', title: 'Test U6', type: 'test', weight: 6, due: '2026-12-10' },
      { unit: 'Unit 7: Working with Discrete Functions', title: 'Quiz U7', type: 'quiz', weight: 2.6, due: '2026-12-17' },
      { unit: 'Unit 7: Working with Discrete Functions', title: 'Test U7', type: 'test', weight: 6, due: '2027-01-14' },
      { unit: 'Unit 7: Working with Discrete Functions', title: 'Final Exam', type: 'exam', weight: 25 },
    ],
  },
  {
    code: 'SPH3U1',
    name: 'Physics',
    color: '#f59e0b',
    teacher_name: 'Ms. Verma',
    teacher_email: 'suman.verma@tdsb.on.ca',
    category_weights: { K: 25, T: 25, C: 25, A: 25 },
    term_structure: { term_work: 65, exam: 25, attendance: 10 },
    units: ['Orientation', 'Scientific Skills', 'Kinematics', 'Forces', 'Energy', 'Electricity & Magnetism', 'Waves/Sound'],
    assessments: [
      { unit: 'Orientation', title: 'Online Orientation Activities', type: 'assignment', weight: 1, due: '2026-09-11' },
      { unit: 'Scientific Skills', title: 'Quiz 1', type: 'quiz', weight: 2, due: '2026-09-19' },
      { unit: 'Kinematics', title: 'Lab 1: Motion Graphs', type: 'lab', weight: 5, due: '2026-10-02' },
      { unit: 'Kinematics', title: 'Kinematics Quest', type: 'test', weight: 7, due: '2026-10-05' },
      { unit: 'Forces', title: 'Vector Graphing Story', type: 'assignment', weight: 4, due: '2026-10-14' },
      { unit: 'Forces', title: 'Lab 2: Projectiles', type: 'lab', weight: 5, due: '2026-10-23' },
      { unit: 'Forces', title: 'Lab 3: Newton’s Laws', type: 'lab', weight: 5, due: '2026-11-03' },
      { unit: 'Forces', title: 'Forces Quest', type: 'test', weight: 7, due: '2026-11-10' },
      { unit: 'Energy', title: 'Lab 4: Skate Park Lab', type: 'lab', weight: 5, due: '2026-11-23' },
      { unit: 'Energy', title: 'Lab 5: Power Stair Lab', type: 'lab', weight: 5, due: '2026-11-27' },
      { unit: 'Energy', title: 'Energy Quest', type: 'test', weight: 7, due: '2026-11-27' },
      { unit: 'Electricity & Magnetism', title: 'Electricity & Magnetism Quest', type: 'test', weight: 7, due: '2026-12-11' },
      { unit: 'Waves/Sound', title: 'Lab 6: Waves Gizmo', type: 'lab', weight: 5, due: '2027-01-06' },
      { unit: 'Waves/Sound', title: 'Final Exam', type: 'exam', weight: 25, due: '2027-01-20' },
    ],
  },
  {
    code: 'SBI3U1',
    name: 'Biology',
    color: '#22c55e',
    teacher_name: 'Mr. Ramlochan',
    teacher_email: 'clyde.ramlochan@tdsb.on.ca',
    category_weights: { K: 25, T: 25, C: 25, A: 25 },
    term_structure: { term_work: 65, exam: 25, attendance: 10 },
    units: [
      'Ch 1: Biodiversity & Classification',
      'Ch 2: Microorganisms',
      'Ch 4: Cell Division & Reproduction',
      'Ch 5: Inheritance',
      'Ch 6: Co-dominance & Multiple Alleles',
      'Ch 7: Evolution - Adaptation',
      'Ch 8: Evidence of Evolution',
      'Ch 9: Mechanisms of Evolution & Speciation',
      'Ch 10: Digestive System',
      'Ch 12: Circulatory System',
      'Ch 11: Respiratory System',
    ],
    assessments: [
      { unit: 'Ch 1: Biodiversity & Classification', title: 'Chapter 1 Assessment', type: 'test', due: '2026-09-18' },
      { unit: 'Ch 2: Microorganisms', title: 'Chapter 2 Assessment', type: 'test', due: '2026-09-30' },
      { unit: 'Ch 4: Cell Division & Reproduction', title: 'Chapter 4 Assessment', type: 'test', due: '2026-10-09' },
      { unit: 'Ch 5: Inheritance', title: 'Chapter 5 Assessment', type: 'test', due: '2026-10-20' },
      { unit: 'Ch 6: Co-dominance & Multiple Alleles', title: 'Chapter 6 Assessment', type: 'test', due: '2026-10-28' },
      { unit: 'Ch 7: Evolution - Adaptation', title: 'Chapter 7 Assessment', type: 'test', due: '2026-11-05' },
      { unit: 'Ch 8: Evidence of Evolution', title: 'Chapter 8 Assessment', type: 'test', due: '2026-11-11' },
      { unit: 'Ch 9: Mechanisms of Evolution & Speciation', title: 'Chapter 9 Assessment', type: 'test', due: '2026-11-19' },
      { unit: 'Ch 10: Digestive System', title: 'Chapter 10 Assessment', type: 'test', due: '2026-12-02' },
      { unit: 'Ch 12: Circulatory System', title: 'Chapter 12 Assessment', type: 'test', due: '2026-12-17' },
      { unit: 'Ch 11: Respiratory System', title: 'Chapter 11 Assessment', type: 'test', due: '2027-01-14' },
      { unit: 'Ch 11: Respiratory System', title: 'Final Exam', type: 'exam', weight: 25 },
    ],
  },
  {
    code: 'NBE3U',
    name: 'English: Understanding Indigenous Voices',
    color: '#ec4899',
    teacher_name: 'Ms. Ni Threasaigh',
    teacher_email: 'michilin.nithreasaigh@tdsb.on.ca',
    category_weights: { K: 20, T: 30, C: 30, A: 20 },
    term_structure: { term_work: 65, exam: 20, attendance: 15 },
    units: [
      'Unit 1: Self-Selected Reading & Book Clubs',
      'Unit 2: All We Are Is Stories',
      'Unit 3: All My Relations',
      'Unit 4: #LandBack',
    ],
    assessments: [
      { unit: 'Unit 1: Self-Selected Reading & Book Clubs', title: 'Monthly Goals & Growth Reflection', type: 'journal', weight: 17 },
      { unit: 'Unit 2: All We Are Is Stories', title: 'Text Annotation & Close Reading Test', type: 'test', weight: 8, due: '2026-10-19' },
      { unit: 'Unit 2: All We Are Is Stories', title: 'Round Table Discussion', type: 'other', weight: 8, due: '2026-10-19' },
      { unit: 'Unit 3: All My Relations', title: 'Mentor Text Annotation Test', type: 'test', weight: 8, due: '2026-11-30' },
      { unit: 'Unit 3: All My Relations', title: 'Round Table Discussion', type: 'other', weight: 8, due: '2026-11-30' },
      { unit: 'Unit 4: #LandBack', title: 'Mentor Text Annotation Test', type: 'test', weight: 8 },
      { unit: 'Unit 4: #LandBack', title: 'Round Table Discussion', type: 'other', weight: 8 },
      { unit: 'Unit 4: #LandBack', title: 'Final Written Exam', type: 'exam', weight: 20 },
    ],
  },
  {
    code: 'BOH4M1',
    name: 'Business Leadership Fundamentals',
    color: '#0ea5e9',
    teacher_name: 'Mr. Hirji',
    teacher_email: 'aly.hirji@tdsb.on.ca',
    category_weights: { K: 25, T: 25, C: 25, A: 25 },
    term_structure: { term_work: 65, exam: 25, attendance: 10 },
    units: [
      'Unit 1: Foundations of Management',
      'Unit 2: Leading',
      'Unit 3: Management Challenges',
      'Unit 4: Planning and Controlling',
      'Unit 5: Organizing',
    ],
    assessments: [],
  },
  {
    code: 'SCH3U1',
    name: 'Chemistry, University Preparation',
    color: '#a855f7',
    category_weights: { K: 25, T: 25, C: 25, A: 25 },
    term_structure: { term_work: 65, exam: 25, attendance: 10 },
    units: [
      'Unit 1: Atomic Structure & Periodic Trends',
      'Unit 2: Chemical Reactions',
      'Unit 3: Moles & Stoichiometry',
      'Unit 4: Solutions',
      'Unit 5: Gases',
    ],
    assessments: [
      { unit: 'Unit 1: Atomic Structure & Periodic Trends', title: 'Quiz B1', type: 'quiz', weight: 2, due: '2026-10-14' },
      { unit: 'Unit 1: Atomic Structure & Periodic Trends', title: 'Quiz B2', type: 'quiz', weight: 2, due: '2026-10-19' },
      { unit: 'Unit 1: Atomic Structure & Periodic Trends', title: 'Unit Test #1', type: 'test', weight: 6, due: '2026-10-26' },
      { unit: 'Unit 2: Chemical Reactions', title: 'Quiz C1', type: 'quiz', weight: 2, due: '2026-11-02' },
      { unit: 'Unit 2: Chemical Reactions', title: 'Quiz C2', type: 'quiz', weight: 2, due: '2026-11-04' },
      { unit: 'Unit 2: Chemical Reactions', title: 'Unit Test #2', type: 'test', weight: 6, due: '2026-11-11' },
      { unit: 'Unit 3: Moles & Stoichiometry', title: 'Quiz D1', type: 'quiz', weight: 2, due: '2026-11-18' },
      { unit: 'Unit 3: Moles & Stoichiometry', title: 'Quiz D2', type: 'quiz', weight: 2, due: '2026-11-23' },
      { unit: 'Unit 3: Moles & Stoichiometry', title: 'Unit Test #3', type: 'test', weight: 6, due: '2026-12-03' },
      { unit: 'Unit 4: Solutions', title: 'Quiz E1', type: 'quiz', weight: 2, due: '2026-12-09' },
      { unit: 'Unit 4: Solutions', title: 'Quiz E2', type: 'quiz', weight: 2, due: '2026-12-14' },
      { unit: 'Unit 4: Solutions', title: 'Unit Test #4', type: 'test', weight: 6, due: '2027-01-06' },
      { unit: 'Unit 5: Gases', title: 'Quiz F1', type: 'quiz', weight: 2, due: '2027-01-13' },
      { unit: 'Unit 5: Gases', title: 'Quiz F2', type: 'quiz', weight: 2, due: '2027-01-18' },
      { unit: 'Unit 5: Gases', title: 'Unit Test #5', type: 'test', weight: 6, due: '2027-01-20' },
      { unit: 'Unit 5: Gases', title: 'Gizmos (14 total, ongoing)', type: 'assignment', weight: 15 },
      { unit: 'Unit 5: Gases', title: 'Final Exam', type: 'exam', weight: 25 },
    ],
  },
]

export async function importSeedCourses(userId: string) {
  for (const sc of VSS_FALL_2026) {
    const { data: course, error: courseErr } = await supabase
      .from('courses')
      .insert({
        user_id: userId,
        code: sc.code,
        name: sc.name,
        color: sc.color,
        teacher_name: sc.teacher_name ?? null,
        teacher_email: sc.teacher_email ?? null,
        category_weights: sc.category_weights,
        term_structure: sc.term_structure,
      })
      .select()
      .single()
    if (courseErr || !course) continue

    const unitRows = sc.units.map((name, i) => ({ course_id: course.id, name, sort_order: i }))
    const { data: insertedUnits } = await supabase.from('units').insert(unitRows).select()
    const unitIdByName = Object.fromEntries((insertedUnits ?? []).map((u) => [u.name, u.id]))

    const assessmentRows = sc.assessments.map((a) => ({
      user_id: userId,
      course_id: course.id,
      unit_id: unitIdByName[a.unit] ?? null,
      title: a.title,
      type: a.type,
      weight_percent: a.weight ?? null,
      due_date: a.due ?? null,
      status: 'upcoming',
    }))
    await supabase.from('assessments').insert(assessmentRows)
  }
}
