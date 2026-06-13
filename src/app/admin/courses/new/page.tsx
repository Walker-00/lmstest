'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '@/lib/firebase/config'
import { CourseCategory, CourseDifficulty } from '@/models'
import toast from 'react-hot-toast'

const categories: { value: CourseCategory; label: string }[] = [
  { value: 'programming', label: 'Programming' },
  { value: 'design', label: 'Design' },
  { value: 'business', label: 'Business' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'data-science', label: 'Data Science' },
  { value: 'ai-ml', label: 'AI & ML' },
  { value: 'mobile-dev', label: 'Mobile Development' },
  { value: 'web-dev', label: 'Web Development' },
  { value: 'devops', label: 'DevOps' },
  { value: 'cybersecurity', label: 'Cybersecurity' },
  { value: 'cloud', label: 'Cloud Computing' },
  { value: 'other', label: 'Other' },
]

const difficulties: { value: CourseDifficulty; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'all-levels', label: 'All Levels' },
]

export default function NewCoursePage() {
  const router = useRouter()
  const { user, userData } = useAuth()
  const [saving, setSaving] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'other' as CourseCategory,
    difficulty: 'beginner' as CourseDifficulty,
    tags: '',
  })

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title || !form.description) return toast.error('Title and description are required')
    setSaving(true)
    try {
      let thumbnailUrl = ''
      if (thumbnailFile) {
        const storageRef = ref(storage, `thumbnails/${user!.uid}/${Date.now()}_${thumbnailFile.name}`)
        const snap = await uploadBytes(storageRef, thumbnailFile)
        thumbnailUrl = await getDownloadURL(snap.ref)
      }

      const courseData = {
        title: form.title,
        description: form.description,
        thumbnail: thumbnailUrl,
        category: form.category,
        difficulty: form.difficulty,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        instructorId: user!.uid,
        instructorName: userData?.displayName || 'Instructor',
        status: 'draft',
        enrolledCount: 0,
        averageRating: 0,
        totalLessons: 0,
        totalDuration: 0,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      }

      const docRef = await addDoc(collection(db, 'courses'), courseData)
      toast.success('Course created successfully')
      router.push(`/admin/courses/${docRef.id}`)
    } catch (err) {
      console.error('Failed to create course:', err)
      toast.error('Failed to create course')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Course</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Start building your course content</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900 dark:text-gray-100">Course Details</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Course Title"
              placeholder="e.g., Introduction to React"
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe what students will learn..."
              value={form.description}
              onChange={(e) => handleChange('description', e.target.value)}
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                options={categories}
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              />
              <Select
                label="Difficulty Level"
                options={difficulties}
                value={form.difficulty}
                onChange={(e) => handleChange('difficulty', e.target.value)}
              />
            </div>

            <Input
              label="Tags"
              placeholder="react, javascript, frontend (comma separated)"
              value={form.tags}
              onChange={(e) => handleChange('tags', e.target.value)}
              helperText="Separate tags with commas"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Thumbnail Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setThumbnailFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
              />
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={saving}>Create Course</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
