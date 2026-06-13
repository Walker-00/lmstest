'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getDocs, collection, query, orderBy, limit, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { BookOpen, Users, GraduationCap, TrendingUp, BarChart3, Award } from 'lucide-react'

export default function AdminAnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState({
    totalStudents: 0, activeStudents: 0, totalEnrollments: 0,
    completedCourses: 0, completionRate: 0, avgCourseRating: 0,
  })
  const [popularCourses, setPopularCourses] = useState<any[]>([])
  const [monthlyEnrollments, setMonthlyEnrollments] = useState(0)

  useEffect(() => {
    loadAnalytics()
  }, [])

  async function loadAnalytics() {
    try {
      const [usersSnap, coursesSnap, enrollmentsSnap] = await Promise.all([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'courses')),
        getDocs(collection(db, 'enrollments')),
      ])

      const students = usersSnap.docs.filter(d => d.data().role === 'student')
      const courses = coursesSnap.docs.map(d => ({ id: d.id, ...d.data() }))
      const enrollments = enrollmentsSnap.docs.map(d => ({ id: d.id, ...d.data() }))

      const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
      const activeStudents = students.filter(s => {
        const lastLogin = s.data().lastLogin
        return lastLogin?.toDate() > thirtyDaysAgo.toDate()
      })

      const completed = enrollments.filter((e: any) => e.progress >= 100)
      const monthEnrolls = enrollments.filter((e: any) => e.enrolledAt?.toDate() > thirtyDaysAgo.toDate())

      setMetrics({
        totalStudents: students.length,
        activeStudents: activeStudents.length,
        totalEnrollments: enrollments.length,
        completedCourses: completed.length,
        completionRate: enrollments.length > 0 ? Math.round((completed.length / enrollments.length) * 100) : 0,
        avgCourseRating: 0,
      })

      setPopularCourses(courses.sort((a: any, b: any) => (b.enrolledCount || 0) - (a.enrolledCount || 0)).slice(0, 5))
      setMonthlyEnrollments(monthEnrolls.length)
      setLoading(false)
    } catch (err) {
      console.error(err)
      setLoading(false)
    }
  }

  if (loading) return <div className="space-y-6">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>

  const statCards = [
    { label: 'Total Students', value: metrics.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
    { label: 'Active Students (30d)', value: metrics.activeStudents, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30' },
    { label: 'Total Enrollments', value: metrics.totalEnrollments, icon: GraduationCap, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30' },
    { label: 'Monthly Enrollments', value: monthlyEnrollments, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30' },
    { label: 'Completed Courses', value: metrics.completedCourses, icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
    { label: 'Completion Rate', value: `${metrics.completionRate}%`, icon: TrendingUp, color: metrics.completionRate > 50 ? 'text-green-600' : 'text-red-600', bg: metrics.completionRate > 50 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30' },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Platform performance and insights</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className={`rounded-lg ${stat.bg} p-2 w-fit mb-3`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><h2 className="font-semibold">Popular Courses</h2></CardHeader>
          <CardContent>
            {popularCourses.length === 0 ? (
              <p className="text-sm text-gray-500">No course data yet</p>
            ) : (
              <div className="space-y-4">
                {popularCourses.map((course: any, idx: number) => (
                  <div key={course.id} className="flex items-center gap-4">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{course.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span>{course.enrolledCount || 0} enrolled</span>
                        <span>{course.totalLessons || 0} lessons</span>
                      </div>
                    </div>
                    <div className="h-2 w-24 rounded-full bg-gray-200 dark:bg-gray-700">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${Math.min((course.enrolledCount || 0) / 10, 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><h2 className="font-semibold">Engagement Summary</h2></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Student-to-Course Ratio</span>
              <span className="text-sm font-medium">{metrics.totalStudents > 0 ? (metrics.totalEnrollments / metrics.totalStudents).toFixed(1) : '0'}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Rate</span>
              <span className="text-sm font-medium">{metrics.totalStudents > 0 ? Math.round((metrics.activeStudents / metrics.totalStudents) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Completion Rate</span>
              <span className="text-sm font-medium">{metrics.completionRate}%</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Growth</span>
              <span className="text-sm font-medium text-green-600">+{monthlyEnrollments}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
