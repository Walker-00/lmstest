'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { CourseCard } from '@/components/shared/CourseCard'
import { queryDocs, where, orderBy, limit } from '@/lib/firebase/firestore'
import { Course, Enrollment } from '@/models'
import { useAuth } from '@/contexts/AuthContext'
import { getDocs, collection, query as fq, where as fw } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Search, SlidersHorizontal, BookOpen } from 'lucide-react'
import Link from 'next/link'

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'web-dev', label: 'Web Development' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'ai-ml', label: 'AI & ML' },
  { value: 'mobile-dev', label: 'Mobile Development' },
  { value: 'devops', label: 'DevOps' },
]

export default function CoursesPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    loadCourses()
    if (user) loadEnrollments()
  }, [user])

  async function loadCourses() {
    try {
      const data = await queryDocs<Course>('courses', where('status', '==', 'published'), orderBy('createdAt', 'desc'))
      setCourses(data as Course[])
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function loadEnrollments() {
    const snap = await getDocs(fq(collection(db, 'enrollments'), fw('userId', '==', user!.uid)))
    setEnrolledIds(new Set(snap.docs.map(d => d.data().courseId)))
  }

  const filtered = courses.filter(c => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false
    if (category && c.category !== category) return false
    if (difficulty && c.difficulty !== difficulty) return false
    return true
  })

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Course Catalog</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Discover courses to advance your skills</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search" placeholder="Search courses..."
            value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600">
          {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600">
          <option value="">All Levels</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center py-12">
              <BookOpen className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No courses found matching your criteria</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((course) => (
            <div key={course.id} className="relative">
              <CourseCard
                course={course}
                href={enrolledIds.has(course.id) ? `/courses/${course.id}/learn` : `/courses/${course.id}`}
              />
              {enrolledIds.has(course.id) && (
                <div className="absolute top-2 left-2">
                  <Badge variant="success">Enrolled</Badge>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
