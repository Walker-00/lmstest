'use client'

import { useEffect, useState } from 'react'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Badge } from '@/components/ui/Badge'
import { EmptyState } from '@/components/shared/EmptyState'
import { getDocs, collection, query, orderBy, addDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { useAuth } from '@/contexts/AuthContext'
import { Announcement } from '@/models'
import { formatDateTime } from '@/lib/utils'
import { Megaphone, Plus, Trash2, Send } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminAnnouncementsPage() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState<(Announcement & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', targetRole: 'all' as 'all' | 'students' | 'admin' })
  const [sending, setSending] = useState(false)

  useEffect(() => { loadAnnouncements() }, [])

  async function loadAnnouncements() {
    try {
      const q = query(collection(db, 'announcements'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() } as Announcement & { id: string })))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.title || !form.content) return toast.error('Fill in all fields')
    setSending(true)
    try {
      await addDoc(collection(db, 'announcements'), {
        title: form.title,
        content: form.content,
        targetRole: form.targetRole,
        courseId: null,
        createdBy: user!.uid,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      })
      toast.success('Announcement sent')
      setForm({ title: '', content: '', targetRole: 'all' })
      setShowForm(false)
      loadAnnouncements()
    } catch { toast.error('Failed to send') }
    finally { setSending(false) }
  }

  async function deleteAnnouncement(id: string) {
    if (!confirm('Delete this announcement?')) return
    try {
      await deleteDoc(doc(db, 'announcements', id))
      toast.success('Deleted')
      loadAnnouncements()
    } catch { toast.error('Failed to delete') }
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Announcements</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Communicate with students</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} leftIcon={showForm ? undefined : <Plus className="h-4 w-4" />}>
          {showForm ? 'Cancel' : 'New Announcement'}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><h2 className="font-semibold">Create Announcement</h2></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
              <Textarea label="Content" value={form.content} onChange={(e) => setForm(f => ({ ...f, content: e.target.value }))} required rows={4} />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Target</label>
                <select
                  value={form.targetRole}
                  onChange={(e) => setForm(f => ({ ...f, targetRole: e.target.value as 'all' | 'students' | 'admin' }))}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="admin">Admins Only</option>
                </select>
              </div>
              <Button type="submit" isLoading={sending} leftIcon={<Send className="h-4 w-4" />}>Send Announcement</Button>
            </form>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-32"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
      ) : announcements.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState icon={<Megaphone className="h-12 w-12" />} title="No announcements" description="Create your first announcement" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((a) => (
            <Card key={a.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{a.title}</h3>
                      <Badge size="sm">{a.targetRole}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{a.content}</p>
                    <p className="mt-2 text-xs text-gray-500">{formatDateTime(a.createdAt)}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => deleteAnnouncement(a.id)}>
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
