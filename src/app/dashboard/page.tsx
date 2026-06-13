'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CourseCard } from '@/components/shared/CourseCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { getDocs, collection, query, where, orderBy, limit, getDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Course, Enrollment, Lesson } from '@/models'
import { formatDate } from '@/lib/utils'
import { BookOpen, Clock, TrendingUp, Award, ChevronRight, Play, BarChart3 } from 'lucide-react'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [enrollments, setEnrollments] = useState<(Enrollment & { course?: Course })[]>([])
  const [recentLessons, setRecentLessons] = useState<{ lesson: Lesson; courseTitle: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ enrolled: 0, inProgress: 0, completed: 0, certificates: 0 })

  useEffect(() => {
    if (!user) return
    loadDashboard()
  }, [user])

  async function loadDashboard() {
    try {
      const enrollSnap = await getDocs(query(
        collection(db, 'enrollments'),
        where('userId', '==', user!.uid),
        orderBy('lastAccessedAt', 'desc')
      ))

      const enrollmentList = await Promise.all(
        enrollSnap.docs.map(async (d) => {
          const data = { id: d.id, ...d.data() } as Enrollment
          const courseSnap = await getDoc(doc(db, 'courses', data.courseId))
          return { ...data, course: courseSnap.exists() ? ({ id: courseSnap.id, ...courseSnap.data() } as Course) : undefined }
        })
      )

      setEnrollments(enrollmentList)
      setStats({
        enrolled: enrollmentList.length,
        inProgress: enrollmentList.filter(e => e.progress > 0 && e.progress < 100).length,
        completed: enrollmentList.filter(e => e.progress >= 100).length,
        certificates: enrollmentList.filter(e => e.certificateIssued).length,
      })
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your learning journey</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Enrolled', value: stats.enrolled, icon: BookOpen, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
          { label: 'In Progress', value: stats.inProgress, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
          { label: 'Completed', value: stats.completed, icon: Award, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
          { label: 'Certificates', value: stats.certificates, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`rounded-lg ${stat.bg} p-2`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {enrollments.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="No enrollments yet"
              description="Browse our course catalog and start learning"
              action={<Link href="/courses"><Button>Browse Courses</Button></Link>}
            />
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">My Courses</h2>
                <Link href="/courses" className="text-sm text-indigo-600 hover:text-indigo-500">View All</Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {enrollments.slice(0, 6).map((enrollment) => (
                  enrollment.course ? (
                    <CourseCard
                      key={enrollment.id}
                      course={enrollment.course}
                      href={`/courses/${enrollment.courseId}/learn`}
                      progress={enrollment.progress}
                      showProgress
                    />
                  ) : null
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-semibold">Continue Learning</h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {enrollments.filter(e => e.progress > 0 && e.progress < 100).slice(0, 5).map((enrollment) => (
                  <Link key={enrollment.id} href={`/courses/${enrollment.courseId}/learn`}>
                    <div className="flex items-center gap-4 rounded-lg border border-gray-200 p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-900/30">
                        <Play className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {enrollment.course?.title || 'Course'}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-200 dark:bg-gray-700">
                            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${enrollment.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(enrollment.progress)}%</span>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
