'use client'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getDoc, doc, updateDoc, deleteDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Course, Lesson } from '@/models'
import { ArrowLeft, Plus, BookOpen, Trash2, Edit, Video } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const categories = [
  { value: 'programming', label: 'Programming' }, { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' }, { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' }, { value: 'ai-ml', label: 'AI & ML' },
  { value: 'mobile-dev', label: 'Mobile Development' }, { value: 'web-dev', label: 'Web Development' },
  { value: 'devops', label: 'DevOps' }, { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'cloud', label: 'Cloud Computing' }, { value: 'other', label: 'Other' },
]

const difficulties = [
  { value: 'beginner', label: 'Beginner' }, { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' }, { value: 'all-levels', label: 'All Levels' },
]

export default function EditCoursePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const router = useRouter()
  const [course, setCourse] = useState<Course & { id: string } | null>(null)
  const [lessons, setLessons] = useState<(Lesson & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '', description: '', category: 'other', difficulty: 'beginner', tags: '',
  })

  useEffect(() => {
    if (!courseId) return
    loadCourse()
  }, [courseId])

  async function loadCourse() {
    try {
      const [courseSnap, lessonsSnap] = await Promise.all([
        getDoc(doc(db, 'courses', courseId)),
        getDocs(query(collection(db, 'lessons'), where('courseId', '==', courseId), where('__name__', '!=', ''))),
      ])
      if (!courseSnap.exists()) { router.push('/admin/courses'); return }
      const data = { id: courseSnap.id, ...courseSnap.data() } as Course & { id: string }
      setCourse(data)
      setForm({ title: data.title, description: data.description, category: data.category, difficulty: data.difficulty, tags: data.tags?.join(', ') || '' })
      const allLessons = await getDocs(query(collection(db, 'lessons'), where('courseId', '==', courseId)))
      setLessons(allLessons.docs.map(d => ({ id: d.id, ...d.data() } as Lesson & { id: string })).sort((a, b) => a.order - b.order))
    } catch (err) {
      console.error('Failed to load course:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateDoc(doc(db, 'courses', courseId), {
        title: form.title,
        description: form.description,
        category: form.category,
        difficulty: form.difficulty,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        updatedAt: serverTimestamp(),
      })
      toast.success('Course updated')
      loadCourse()
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  const togglePublish = async () => {
    if (!course) return
    const newStatus = course.status === 'draft' ? 'published' : course.status === 'published' ? 'archived' : 'draft'
    try {
      await updateDoc(doc(db, 'courses', courseId), { status: newStatus, updatedAt: serverTimestamp(), publishedAt: newStatus === 'published' ? serverTimestamp() : undefined })
      toast.success(`Course ${newStatus}`)
      loadCourse()
    } catch { toast.error('Failed to update status') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
  if (!course) return null

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/admin/courses')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{course.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={course.status === 'published' ? 'success' : course.status === 'archived' ? 'warning' : 'default'}>{course.status}</Badge>
              <span className="text-sm text-gray-500">{lessons.length} lessons</span>
              <span className="text-sm text-gray-500">{course.enrolledCount || 0} enrolled</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={togglePublish}>
            {course.status === 'draft' ? 'Publish' : course.status === 'published' ? 'Archive' : 'Restore'}
          </Button>
          <Link href={`/admin/lessons/new?courseId=${courseId}`}>
            <Button leftIcon={<Plus className="h-4 w-4" />}>Add Lesson</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Course Details</h2></CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
                <Textarea label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} required />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Select label="Category" options={categories} value={form.category} onChange={(e) => setForm(f => ({ ...f, category: e.target.value }))} />
                  <Select label="Difficulty" options={difficulties} value={form.difficulty} onChange={(e) => setForm(f => ({ ...f, difficulty: e.target.value }))} />
                </div>
                <Input label="Tags" value={form.tags} onChange={(e) => setForm(f => ({ ...f, tags: e.target.value }))} helperText="Comma separated" />
                <Button type="submit" isLoading={saving}>Save Changes</Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">Lessons ({lessons.length})</h2>
                <Link href={`/admin/lessons/new?courseId=${courseId}`}>
                  <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Lesson</Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {lessons.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Video className="mx-auto h-8 w-8 mb-2" />
                  <p className="text-sm">No lessons yet. Start adding lessons to your course.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {lessons.map((lesson, idx) => (
                    <div key={lesson.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                      <div className="flex items-center gap-3">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-xs font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">{idx + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{lesson.title}</p>
                          <p className="text-xs text-gray-500">{lesson.duration ? `${lesson.duration}s` : ''}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/lessons/${lesson.id}`}>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader><h2 className="font-semibold">Course Info</h2></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Instructor</span><span>{course.instructorName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Category</span><span className="capitalize">{course.category}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Difficulty</span><span className="capitalize">{course.difficulty}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Lessons</span><span>{lessons.length}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Enrolled</span><span>{course.enrolledCount || 0}</span></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
