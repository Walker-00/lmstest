'use client'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { getDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Lesson } from '@/models'
import { extractYouTubeVideoId, fetchYouTubeMetadata } from '@/lib/utils'
import toast from 'react-hot-toast'
import { ArrowLeft } from 'lucide-react'

export default function EditLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>()
  const router = useRouter()
  const [lesson, setLesson] = useState<Lesson | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [videoId, setVideoId] = useState('')
  const [form, setForm] = useState({ title: '', description: '', order: '1', isFree: false })

  useEffect(() => {
    if (!lessonId) return
    loadLesson()
  }, [lessonId])

  async function loadLesson() {
    try {
      const snap = await getDoc(doc(db, 'lessons', lessonId))
      if (!snap.exists()) { router.push('/admin/courses'); return }
      const data = { id: snap.id, ...snap.data() } as Lesson & { id: string }
      setLesson(data)
      setForm({ title: data.title, description: data.description, order: String(data.order), isFree: data.isFree })
      setYoutubeUrl(data.youtubeUrl || '')
      setVideoId(data.youtubeVideoId || '')
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleYoutubeChange = async (url: string) => {
    setYoutubeUrl(url)
    const id = extractYouTubeVideoId(url)
    setVideoId(id || '')
    if (id) {
      const meta = await fetchYouTubeMetadata(id)
      if (meta.title && !form.title) setForm(f => ({ ...f, title: meta.title || '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) return toast.error('Title is required')
    setSaving(true)
    try {
      await updateDoc(doc(db, 'lessons', lessonId), {
        title: form.title,
        description: form.description,
        youtubeUrl,
        youtubeVideoId: videoId,
        order: parseInt(form.order) || 1,
        isFree: form.isFree,
        updatedAt: serverTimestamp(),
      })
      toast.success('Lesson updated')
      router.push(`/admin/courses/${lesson?.courseId}`)
    } catch { toast.error('Failed to update') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
  if (!lesson) return null

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4" /></Button>
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Edit Lesson</h1></div>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Lesson Details</h2></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            <Input label="YouTube URL" value={youtubeUrl} onChange={(e) => handleYoutubeChange(e.target.value)} placeholder="https://youtube.com/watch?v=..." />
            {videoId && (
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <iframe src={`https://www.youtube.com/embed/${videoId}`} className="w-full h-full" allowFullScreen />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Order" type="number" value={form.order} onChange={(e) => setForm(f => ({ ...f, order: e.target.value }))} min="1" />
              <label className="flex items-center gap-2 pt-6">
                <input type="checkbox" checked={form.isFree} onChange={(e) => setForm(f => ({ ...f, isFree: e.target.checked }))} className="rounded border-gray-300 text-indigo-600" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Free preview</span>
              </label>
            </div>
            <div className="flex items-center gap-3">
              <Button type="submit" isLoading={saving}>Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
