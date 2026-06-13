'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/shared/EmptyState'
import { getDocs, collection, query, where, orderBy, getDoc, doc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Bookmark, Lesson, Course } from '@/models'
import { Bookmark as BookmarkIcon, Trash2, Play, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function BookmarksPage() {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState<(Bookmark & { lesson?: Lesson; course?: Course })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    loadBookmarks()
  }, [user])

  async function loadBookmarks() {
    try {
      const snap = await getDocs(query(
        collection(db, 'bookmarks'),
        where('userId', '==', user!.uid),
        orderBy('createdAt', 'desc')
      ))
      const items = await Promise.all(
        snap.docs.map(async (d) => {
          const data = { id: d.id, ...d.data() } as Bookmark
          const [lessonSnap, courseSnap] = await Promise.all([
            getDoc(doc(db, 'lessons', data.lessonId)),
            getDoc(doc(db, 'courses', data.courseId)),
          ])
          return {
            ...data,
            lesson: lessonSnap.exists() ? ({ id: lessonSnap.id, ...lessonSnap.data() } as Lesson) : undefined,
            course: courseSnap.exists() ? ({ id: courseSnap.id, ...courseSnap.data() } as Course) : undefined,
          }
        })
      )
      setBookmarks(items)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function removeBookmark(id: string) {
    try {
      await deleteDoc(doc(db, 'bookmarks', id))
      setBookmarks(prev => prev.filter(b => b.id !== id))
      toast.success('Bookmark removed')
    } catch { toast.error('Failed to remove') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Bookmarks</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your saved lessons for quick access</p>
      </div>

      {bookmarks.length === 0 ? (
        <Card>
          <CardContent>
            <EmptyState
              icon={<BookmarkIcon className="h-12 w-12" />}
              title="No bookmarks yet"
              description="Bookmark lessons while learning to access them quickly"
              action={<Link href="/courses"><Button>Browse Courses</Button></Link>}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {bookmarks.map((bm) => (
            <Card key={bm.id} hover>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {bm.lesson?.title || 'Unknown Lesson'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{bm.course?.title || 'Unknown Course'}</p>
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Link href={`/courses/${bm.courseId}/learn`}>
                      <Button variant="ghost" size="sm"><Play className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => removeBookmark(bm.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
