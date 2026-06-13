'use client'


import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getDoc, doc, getDocs, collection, query, where, updateDoc, addDoc, deleteDoc, serverTimestamp, Timestamp, arrayUnion } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Course, Lesson, Enrollment, Note, Bookmark } from '@/models'
import { extractYouTubeVideoId } from '@/lib/utils'
import { Play, CheckCircle, Circle, ChevronLeft, ChevronRight, FileText, Download, Bookmark as BookmarkIcon, StickyNote, MessageSquare } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LearnPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [lessons, setLessons] = useState<Lesson[]>([])
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [enrollment, setEnrollment] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [notes, setNotes] = useState<Note[]>([])
  const [showNotes, setShowNotes] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [bookmarked, setBookmarked] = useState(false)

  useEffect(() => {
    if (!courseId || !user) return
    loadData()
  }, [courseId, user])

  async function loadData() {
    try {
      const [courseSnap, lessonsSnap, enrollSnap] = await Promise.all([
        getDoc(doc(db, 'courses', courseId)),
        getDocs(query(collection(db, 'lessons'), where('courseId', '==', courseId))),
        getDocs(query(collection(db, 'enrollments'), where('userId', '==', user!.uid), where('courseId', '==', courseId))),
      ])

      if (!courseSnap.exists() || enrollSnap.empty) { router.push('/courses'); return }

      setCourse({ id: courseSnap.id, ...courseSnap.data() } as Course)
      const sortedLessons = lessonsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Lesson)).sort((a, b) => a.order - b.order)
      setLessons(sortedLessons)
      
      const enrollData = enrollSnap.docs[0].data() as Record<string, unknown>
      setEnrollment({ id: enrollSnap.docs[0].id, ...enrollData })

      if (enrollData.currentLessonId && sortedLessons.length > 0) {
        const idx = sortedLessons.findIndex((l: Lesson) => l.id === enrollData.currentLessonId)
        if (idx >= 0) setCurrentLessonIndex(idx)
      }

      const [notesSnap, bookmarksSnap] = await Promise.all([
        getDocs(query(collection(db, 'notes'), where('userId', '==', user!.uid), where('courseId', '==', courseId))),
        getDocs(query(collection(db, 'bookmarks'), where('userId', '==', user!.uid), where('courseId', '==', courseId))),
      ])
      setNotes(notesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Note)))
      setBookmarked(!bookmarksSnap.empty)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const currentLesson = lessons[currentLessonIndex]
  const videoId = currentLesson?.youtubeVideoId || extractYouTubeVideoId(currentLesson?.youtubeUrl || '')

  const markComplete = useCallback(async () => {
    if (!enrollment || !currentLesson) return
    const completed = enrollment.completedLessons || []
    if (completed.includes(currentLesson.id)) return

    const newCompleted = [...completed, currentLesson.id]
    const progress = Math.round((newCompleted.length / lessons.length) * 100)
    
    await updateDoc(doc(db, 'enrollments', enrollment.id), {
      completedLessons: newCompleted,
      progress,
      lastAccessedAt: serverTimestamp(),
      currentLessonId: currentLesson.id,
      completedAt: progress >= 100 ? serverTimestamp() : undefined,
    })
    setEnrollment((prev: any) => ({ ...prev, completedLessons: newCompleted, progress }))

    if (progress >= 100) {
      toast.success('Course completed! 🎉')
    } else {
      toast.success('Lesson completed')
    }
  }, [enrollment, currentLesson, lessons])

  const navigateLesson = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' ? currentLessonIndex + 1 : currentLessonIndex - 1
    if (newIndex >= 0 && newIndex < lessons.length) {
      setCurrentLessonIndex(newIndex)
      if (enrollment) {
        updateDoc(doc(db, 'enrollments', enrollment.id), {
          currentLessonId: lessons[newIndex].id,
          lastAccessedAt: serverTimestamp(),
        })
      }
    }
  }

  const addNote = async () => {
    if (!noteText.trim() || !currentLesson) return
    try {
      const ref = await addDoc(collection(db, 'notes'), {
        userId: user!.uid,
        courseId,
        lessonId: currentLesson.id,
        content: noteText,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      })
      setNotes(prev => [...prev, { id: ref.id, userId: user!.uid, courseId, lessonId: currentLesson.id, content: noteText, createdAt: undefined as unknown as Timestamp, updatedAt: undefined as unknown as Timestamp }])
      setNoteText('')
      toast.success('Note added')
    } catch { toast.error('Failed to add note') }
  }

  const toggleBookmark = async () => {
    if (!currentLesson) return
    try {
      if (bookmarked) {
        const snap = await getDocs(query(collection(db, 'bookmarks'), where('userId', '==', user!.uid), where('lessonId', '==', currentLesson.id)))
        snap.docs.forEach(d => deleteDoc(d.ref))
        setBookmarked(false)
        toast.success('Bookmark removed')
      } else {
        await addDoc(collection(db, 'bookmarks'), {
          userId: user!.uid,
          courseId,
          lessonId: currentLesson.id,
          createdAt: serverTimestamp() as Timestamp,
        })
        setBookmarked(true)
        toast.success('Bookmarked')
      }
    } catch { toast.error('Failed') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
  if (!course || !currentLesson) return <div className="text-center py-12 text-gray-500">No lessons available</div>

  const completedLessons = enrollment?.completedLessons || []
  const progress = enrollment?.progress || 0

  return (
    <div className="animate-fade-in">
      <div className="grid gap-6 lg:grid-cols-4">
        <div className="lg:col-span-3 space-y-4">
          <div className="aspect-video rounded-xl overflow-hidden bg-black">
            {videoId ? (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white">
                <p>No video URL configured</p>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{currentLesson.title}</h1>
              <p className="text-sm text-gray-500">Lesson {currentLessonIndex + 1} of {lessons.length}</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={toggleBookmark}>
                <BookmarkIcon className={`h-4 w-4 ${bookmarked ? 'fill-indigo-600 text-indigo-600' : ''}`} />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowNotes(!showNotes)}>
                <StickyNote className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <p className="text-gray-600 dark:text-gray-400">{currentLesson.description}</p>

          {currentLesson.attachments && currentLesson.attachments.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
                  <Download className="h-4 w-4" /> Resources
                </h3>
                <div className="space-y-2">
                  {currentLesson.attachments.map((att, idx) => (
                    <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-between rounded-lg border border-gray-200 p-2 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{att.name}</span>
                      <Download className="h-4 w-4 text-gray-400" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={() => navigateLesson('prev')} disabled={currentLessonIndex === 0} leftIcon={<ChevronLeft className="h-4 w-4" />}>
              Previous
            </Button>
            <Button variant="outline" onClick={markComplete} leftIcon={completedLessons.includes(currentLesson.id) ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4" />}>
              {completedLessons.includes(currentLesson.id) ? 'Completed' : 'Mark Complete'}
            </Button>
            <Button variant="outline" onClick={() => navigateLesson('next')} disabled={currentLessonIndex === lessons.length - 1} rightIcon={<ChevronRight className="h-4 w-4" />}>
              Next
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Course Progress</h3>
                <span className="text-sm font-medium text-indigo-600">{progress}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${progress}%` }} />
              </div>
              <p className="mt-2 text-xs text-gray-500">{completedLessons.length} of {lessons.length} lessons completed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-2">
              <div className="space-y-1">
                {lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => setCurrentLessonIndex(idx)}
                    className={`w-full flex items-center gap-3 rounded-lg p-2 text-left text-sm transition-colors ${
                      idx === currentLessonIndex
                        ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                        : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {completedLessons.includes(lesson.id) ? (
                      <CheckCircle className="h-4 w-4 text-green-500 shrink-0" />
                    ) : (
                      <span className="flex h-4 w-4 items-center justify-center text-xs font-medium text-gray-400 shrink-0">
                        {idx + 1}
                      </span>
                    )}
                    <span className="truncate">{lesson.title}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {showNotes && (
            <Card>
              <CardContent className="p-4">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">My Notes</h3>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Write your notes here..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 p-2 text-sm dark:bg-gray-800 dark:border-gray-600"
                />
                <Button size="sm" className="mt-2 w-full" onClick={addNote}>Save Note</Button>
                {notes.filter(n => n.lessonId === currentLesson.id).map((note) => (
                  <div key={note.id} className="mt-2 rounded-lg bg-gray-50 p-2 text-sm dark:bg-gray-800/50">
                    {note.content}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
