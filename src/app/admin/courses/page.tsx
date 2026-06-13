'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { getDocs, collection, query, orderBy, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Course } from '@/models'
import { Plus, BookOpen, Edit, Trash2, Eye, EyeOff, Archive } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<(Course & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCourses()
  }, [])

  async function loadCourses() {
    try {
      const q = query(collection(db, 'courses'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() } as Course & { id: string })))
    } catch (err) {
      console.error('Failed to load courses:', err)
    } finally {
      setLoading(false)
    }
  }

  async function toggleStatus(courseId: string, currentStatus: string) {
    const newStatus = currentStatus === 'published' ? 'archived' : currentStatus === 'archived' ? 'draft' : 'published'
    try {
      await updateDoc(doc(db, 'courses', courseId), { status: newStatus, updatedAt: new Date() })
      toast.success(`Course ${newStatus}`)
      loadCourses()
    } catch {
      toast.error('Failed to update course')
    }
  }

  async function deleteCourse(courseId: string) {
    if (!confirm('Are you sure you want to delete this course?')) return
    try {
      await deleteDoc(doc(db, 'courses', courseId))
      toast.success('Course deleted')
      loadCourses()
    } catch {
      toast.error('Failed to delete course')
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Courses</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your course catalog</p>
        </div>
        <Link href="/admin/courses/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Course</Button>
        </Link>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<BookOpen className="h-12 w-12" />}
              title="No courses yet"
              description="Create your first course to get started"
              action={
                <Link href="/admin/courses/new">
                  <Button leftIcon={<Plus className="h-4 w-4" />}>Create Course</Button>
                </Link>
              }
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id} hover>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-16 w-24 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white shrink-0">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt="" className="h-full w-full rounded-lg object-cover" />
                  ) : (
                    <BookOpen className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{course.title}</h3>
                    <Badge variant={course.status === 'published' ? 'success' : course.status === 'archived' ? 'warning' : 'default'}>
                      {course.status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{course.description}</p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-gray-400">
                    <span>{course.category}</span>
                    <span>{course.difficulty}</span>
                    <span>{course.totalLessons || 0} lessons</span>
                    <span>{course.enrolledCount || 0} enrolled</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/courses/${course.id}`}>
                    <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => toggleStatus(course.id, course.status)}>
                    {course.status === 'published' ? <EyeOff className="h-4 w-4" /> : course.status === 'archived' ? <Eye className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteCourse(course.id)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
