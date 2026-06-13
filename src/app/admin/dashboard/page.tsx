'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Skeleton } from '@/components/ui/Skeleton'
import { getDocs, collection, query, orderBy, limit, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { BookOpen, Users, BarChart3, GraduationCap, TrendingUp, ArrowUp, ArrowDown } from 'lucide-react'

interface DashboardStats {
  totalStudents: number
  totalCourses: number
  publishedCourses: number
  totalEnrollments: number
  recentEnrollments: number
  completionRate: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    publishedCourses: 0,
    totalEnrollments: 0,
    recentEnrollments: 0,
    completionRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentCourses, setRecentCourses] = useState<any[]>([])
  const [recentStudents, setRecentStudents] = useState<any[]>([])

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [usersSnap, coursesSnap, enrollmentsSnap] = await Promise.all([
          getDocs(collection(db, 'users')),
          getDocs(collection(db, 'courses')),
          getDocs(collection(db, 'enrollments')),
        ])

        const students = usersSnap.docs.filter(d => d.data().role === 'student')
        const courses = coursesSnap.docs
        const enrollments = enrollmentsSnap.docs
        const published = courses.filter(d => d.data().status === 'published')
        const completed = enrollments.filter(d => d.data().progress >= 100)
        const thirtyDaysAgo = Timestamp.fromDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))
        const recentEnrolls = enrollments.filter(d => d.data().enrolledAt?.toDate() > thirtyDaysAgo.toDate())

        setStats({
          totalStudents: students.length,
          totalCourses: courses.length,
          publishedCourses: published.length,
          totalEnrollments: enrollments.length,
          recentEnrollments: recentEnrolls.length,
          completionRate: enrollments.length > 0 ? Math.round((completed.length / enrollments.length) * 100) : 0,
        })

        const recentCoursesData = courses
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => b.createdAt?.toDate() - a.createdAt?.toDate())
          .slice(0, 5)
        setRecentCourses(recentCoursesData)

        const recentStudentsData = students
          .map(d => ({ id: d.id, ...d.data() }))
          .sort((a: any, b: any) => b.createdAt?.toDate() - a.createdAt?.toDate())
          .slice(0, 5)
        setRecentStudents(recentStudentsData)
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    loadDashboard()
  }, [])

  const statCards = [
    { label: 'Total Students', value: stats.totalStudents, icon: Users, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', change: '+12%', trend: 'up' },
    { label: 'Total Courses', value: stats.totalCourses, icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-100 dark:bg-indigo-900/30', change: '+3', trend: 'up' },
    { label: 'Enrollments', value: stats.totalEnrollments, icon: GraduationCap, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', change: `${stats.recentEnrollments} this month`, trend: 'up' },
    { label: 'Completion Rate', value: `${stats.completionRate}%`, icon: BarChart3, color: 'text-purple-600', bg: 'bg-purple-100 dark:bg-purple-900/30', change: `${stats.completionRate}% avg`, trend: stats.completionRate > 50 ? 'up' : 'down' },
  ]

  if (loading) return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Overview of your learning platform</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className={`rounded-lg ${stat.bg} p-3`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                {stat.trend === 'up' ? (
                  <ArrowUp className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDown className="h-4 w-4 text-red-500" />
                )}
              </div>
              <p className="mt-4 text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
              <p className="mt-1 text-xs text-gray-400">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Courses</h2>
          </CardHeader>
          <CardContent>
            {recentCourses.length === 0 ? (
              <p className="text-sm text-gray-500">No courses yet</p>
            ) : (
              <div className="space-y-3">
                {recentCourses.map((course: any) => (
                  <div key={course.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
                        <BookOpen className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{course.title}</p>
                        <p className="text-xs text-gray-500">{course.totalLessons || 0} lessons</p>
                      </div>
                    </div>
                    <Badge variant={course.status === 'published' ? 'success' : course.status === 'archived' ? 'warning' : 'default'}>
                      {course.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 dark:text-gray-100">Recent Students</h2>
          </CardHeader>
          <CardContent>
            {recentStudents.length === 0 ? (
              <p className="text-sm text-gray-500">No students yet</p>
            ) : (
              <div className="space-y-3">
                {recentStudents.map((student: any) => (
                  <div key={student.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                        {student.displayName?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.displayName}</p>
                        <p className="text-xs text-gray-500">{student.email}</p>
                      </div>
                    </div>
                    <Badge variant={student.isActive ? 'success' : 'default'}>
                      {student.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
