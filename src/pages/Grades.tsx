import { Link } from 'react-router-dom'
import { useData } from '../contexts/DataContext'
import { Card, EmptyState, PageHeader } from '../components/shared'
import { computeCourseGrade } from '../lib/grades'

export default function Grades() {
  const { courses, assessments } = useData()

  return (
    <div>
      <PageHeader title="Grades" subtitle="Live averages across your courses" />
      <div className="px-4">
        <Card className="divide-y divide-black/5 dark:divide-white/10">
          {courses.length === 0 ? (
            <EmptyState text="Add a course to get started." />
          ) : (
            courses.map((c) => {
              const result = computeCourseGrade(c, assessments.filter((a) => a.course_id === c.id))
              return (
                <Link key={c.id} to={`/grades/${c.id}`} className="flex items-center gap-3 px-4 py-4">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ background: c.color }}>
                    {c.code.slice(0, 2)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold truncate">{c.name}</p>
                    <p className="text-xs opacity-50">{c.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold tabular-nums">
                      {result.termWorkPercent != null ? `${result.termWorkPercent.toFixed(1)}%` : '—'}
                    </p>
                    <p className="text-[10px] opacity-40">term work</p>
                  </div>
                </Link>
              )
            })
          )}
        </Card>
      </div>
    </div>
  )
}
