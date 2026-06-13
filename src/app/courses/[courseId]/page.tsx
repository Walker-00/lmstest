'use client'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { getDoc, doc, addDoc, collection, serverTimestamp, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Course, Lesson, Enrollment } from '@/models'
import { truncate } from '@/lib/utils'
import { BookOpen, Users, Clock, Star, Play, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    if (!courseId) return
    loadCourse()
  }, [courseId, user])

  async function loadCourse() {
    try {
      const [courseSnap, lessonsSnap] = await Promise.all([
        getDoc(doc(db, 'courses', courseId)),
        getDocs(query(collection(db, 'lessons'), where('courseId', '==', courseId))),
      ])
      if (!courseSnap.exists()) { router.push('/courses'); return }
      setCourse({ id: courseSnap.id, ...courseSnap.data() } as Course)
      setLessons(lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)).sort((a, b) => a.order - b.order))

      if (user) {
        const enrollSnap = await getDocs(query(
          collection(db, 'enrollments'),
          where('userId', '==', user.uid),
          where('courseId', '==', courseId)
        ))
        if (!enrollSnap.empty) {
          setEnrollment({ id: enrollSnap.docs[0].id, ...enrollSnap.docs[0].data() } as Enrollment)
        }
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleEnroll() {
    if (!user) { router.push('/auth/login'); return }
    setEnrolling(true)
    try {
      await addDoc(collection(db, 'enrollments'), {
        userId: user.uid,
        courseId,
        enrolledAt: serverTimestamp() as Timestamp,
        completedLessons: [],
        progress: 0,
        certificateIssued: false,
        lastAccessedAt: serverTimestamp() as Timestamp,
      })
      toast.success('Enrolled successfully!')
      router.push(`/courses/${courseId}/learn`)
    } catch { toast.error('Failed to enroll') }
    finally { setEnrolling(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
  if (!course) return null

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="info" size="sm">{course.category}</Badge>
              <Badge variant={course.difficulty === 'beginner' ? 'success' : course.difficulty === 'intermediate' ? 'warning' : 'danger'} size="sm">
                {course.difficulty}
              </Badge>
              {course.status === 'published' && <Badge variant="success" size="sm">Published</Badge>}
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{course.title}</h1>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-relaxed">{course.description}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1"><BookOpen className="h-4 w-4" /> {lessons.length} lessons</span>
              <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {course.enrolledCount || 0} enrolled</span>
              {course.averageRating > 0 && <span className="flex items-center gap-1"><Star className="h-4 w-4 text-yellow-500" /> {course.averageRating.toFixed(1)}</span>}
              <span className="text-sm text-gray-400">Instructor: {course.instructorName}</span>
            </div>
          </div>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Course Content</h2>
              <div className="space-y-2">
                {lessons.map((lesson, idx) => (
                  <div key={lesson.id} className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lesson.title}</p>
                      <p className="text-xs text-gray-500">{truncate(lesson.description, 60)}</p>
                    </div>
                    <Play className="h-4 w-4 text-gray-400 shrink-0" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <div className="sticky top-24">
            <Card>
              <div className="aspect-video rounded-t-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Play className="h-16 w-16 text-white/80" />
              </div>
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">Free</p>
                <p className="text-sm text-gray-500 mt-1">Start learning today</p>
                {enrollment ? (
                  <Link href={`/courses/${courseId}/learn`}>
                    <Button className="w-full mt-4">Continue Learning</Button>
                  </Link>
                ) : (
                  <Button className="w-full mt-4" onClick={handleEnroll} isLoading={enrolling}>
                    Enroll Now
                  </Button>
                )}
                <div className="mt-4 space-y-2 text-sm text-gray-500">
                  <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Full lifetime access</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Certificate upon completion</p>
                  <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Downloadable resources</p>
                </div>
              </CardContent>
            </Card>

            {course.tags && course.tags.length > 0 && (
              <Card className="mt-4">
                <CardContent className="p-4">
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag) => (
                      <Badge key={tag} variant="default" size="sm">{tag}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
