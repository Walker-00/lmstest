'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { getDocs, collection, query, where, orderBy, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Note, Course, Lesson } from '@/models'
import { formatDateTime } from '@/lib/utils'
import { FileText, Trash2, Edit, Save, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function NotesPage() {
  const { user } = useAuth()
  const [notes, setNotes] = useState<(Note & { course?: Course; lesson?: Lesson })[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')

  useEffect(() => {
    if (!user) return
    loadNotes()
  }, [user])

  async function loadNotes() {
    try {
      const snap = await getDocs(query(
        collection(db, 'notes'),
        where('userId', '==', user!.uid),
        orderBy('createdAt', 'desc')
      ))
      const items = await Promise.all(
        snap.docs.map(async (d) => {
          const data = { id: d.id, ...d.data() } as Note
          const [courseSnap, lessonSnap] = await Promise.all([
            getDoc(doc(db, 'courses', data.courseId)),
            getDoc(doc(db, 'lessons', data.lessonId)),
          ])
          return {
            ...data,
            course: courseSnap.exists() ? ({ id: courseSnap.id, ...courseSnap.data() } as Course) : undefined,
            lesson: lessonSnap.exists() ? ({ id: lessonSnap.id, ...lessonSnap.data() } as Lesson) : undefined,
          }
        })
      )
      setNotes(items)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function saveEdit(id: string) {
    try {
      await updateDoc(doc(db, 'notes', id), { content: editText, updatedAt: new Date() })
      setNotes(prev => prev.map(n => n.id === id ? { ...n, content: editText } : n))
      setEditingId(null)
      toast.success('Note updated')
    } catch { toast.error('Failed to update') }
  }

  async function deleteNote(id: string) {
    if (!confirm('Delete this note?')) return
    try {
      await deleteDoc(doc(db, 'notes', id))
      setNotes(prev => prev.filter(n => n.id !== id))
      toast.success('Note deleted')
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">My Notes</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{notes.length} notes across your courses</p>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No notes yet"
              description="Take notes while watching lessons to help you remember key concepts"
              action={<Link href="/courses"><Button>Browse Courses</Button></Link>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note) => (
            <Card key={note.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">
                        {note.course?.title || 'Unknown Course'}
                      </span>
                      {note.lesson && (
                        <>
                          <span className="text-gray-300 dark:text-gray-600">/</span>
                          <span className="text-xs text-gray-500">{note.lesson.title}</span>
                        </>
                      )}
                    </div>
                    {editingId === note.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          rows={3}
                          className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:bg-gray-800 dark:border-gray-600"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(note.id)} leftIcon={<Save className="h-3 w-3" />}>Save</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} leftIcon={<X className="h-3 w-3" />}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                    )}
                    <p className="mt-2 text-xs text-gray-500">{formatDateTime(note.createdAt)}</p>
                  </div>
                  {editingId !== note.id && (
                    <div className="flex items-center gap-1 ml-2">
                      <Button variant="ghost" size="sm" onClick={() => { setEditingId(note.id); setEditText(note.content) }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteNote(note.id)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
