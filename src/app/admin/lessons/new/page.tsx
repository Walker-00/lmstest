'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { useAuth } from '@/contexts/AuthContext'
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { extractYouTubeVideoId, fetchYouTubeMetadata } from '@/lib/utils'
import toast from 'react-hot-toast'
import { Youtube, Link as LinkIcon, Upload, X } from 'lucide-react'

export default function NewLessonPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get('courseId')
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [fetchingMeta, setFetchingMeta] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [attachments, setAttachments] = useState<{ file: File; name: string }[]>([])
  const [form, setForm] = useState({
    title: '',
    description: '',
    order: '1',
    isFree: false,
  })

  const handleYoutubeUrlChange = async (url: string) => {
    setYoutubeUrl(url)
    const id = extractYouTubeVideoId(url)
    if (id) {
      setVideoId(id)
      setFetchingMeta(true)
      const meta = await fetchYouTubeMetadata(id)
      if (meta.title && !form.title) {
        setForm(f => ({ ...f, title: meta.title || '' }))
      }
      setFetchingMeta(false)
    } else {
      setVideoId('')
    }
  }

  const handleAttachmentAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach(file => {
        setAttachments(prev => [...prev, { file, name: file.name }])
      })
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseId) return toast.error('Course ID is missing')
    if (!form.title || !videoId) return toast.error('Title and YouTube URL are required')
    setSaving(true)

    try {
      const attachmentData = []
      for (const att of attachments) {
        const result = await uploadToCloudinary(att.file, `materials/${courseId}`)
        attachmentData.push({
          name: att.name,
          url: result.secure_url,
          type: att.file.type || 'application/octet-stream',
          size: att.file.size,
        })
      }

      await addDoc(collection(db, 'lessons'), {
        courseId,
        title: form.title,
        description: form.description,
        youtubeUrl,
        youtubeVideoId: videoId,
        duration: 0,
        order: parseInt(form.order) || 1,
        attachments: attachmentData,
        isFree: form.isFree,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      })

      const coursesSnap = await import('firebase/firestore').then(m => m.getDoc(m.doc(db, 'courses', courseId)))
      if (coursesSnap.exists()) {
        const lessonsSnap = await import('firebase/firestore').then(m =>
          m.getDocs(m.query(m.collection(db, 'lessons'), m.where('courseId', '==', courseId)))
        )
        await import('firebase/firestore').then(m =>
          m.updateDoc(m.doc(db, 'courses', courseId), {
            totalLessons: lessonsSnap.size,
            updatedAt: serverTimestamp(),
          })
        )
      }

      toast.success('Lesson created')
      router.push(`/admin/courses/${courseId}`)
    } catch (err) {
      console.error('Failed to create lesson:', err)
      toast.error('Failed to create lesson')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create New Lesson</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add a lesson to your course</p>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Lesson Details</h2></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Lesson Title"
              value={form.title}
              onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g., Introduction to Variables"
              required
            />

            <Textarea
              label="Description"
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="What will students learn in this lesson?"
            />

            <div className="space-y-2">
              <Input
                label="YouTube Video URL"
                value={youtubeUrl}
                onChange={(e) => handleYoutubeUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
              />
              {fetchingMeta && <p className="text-xs text-indigo-500">Fetching video metadata...</p>}
              {videoId && (
                <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <iframe
                    src={`https://www.youtube.com/embed/${videoId}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Order"
                type="number"
                value={form.order}
                onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))}
                min="1"
              />
              <label className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  checked={form.isFree}
                  onChange={(e) => setForm(f => ({ ...f, isFree: e.target.checked }))}
                  className="rounded border-gray-300 text-indigo-600"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Free preview (no enrollment required)</span>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Attachments (PDF, PPTX, DOCX, ZIP, Images)
              </label>
              <div className="flex items-center gap-2">
                <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-800">
                  <Upload className="h-4 w-4" />
                  Upload Files
                  <input type="file" multiple className="hidden" onChange={handleAttachmentAdd} />
                </label>
              </div>
              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((att, idx) => (
                    <div key={idx} className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 dark:border-gray-700">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{att.name}</span>
                      <button type="button" onClick={() => removeAttachment(idx)} className="text-red-500 hover:text-red-700">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={saving}>Create Lesson</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
