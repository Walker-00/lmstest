'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { getDocs, collection, query, orderBy, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Quiz } from '@/models'
import { Plus, HelpCircle, Trash2, Edit, Eye } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminQuizzesPage() {
  const [quizzes, setQuizzes] = useState<(Quiz & { id: string })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadQuizzes()
  }, [])

  async function loadQuizzes() {
    try {
      const q = query(collection(db, 'quizzes'), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() } as Quiz & { id: string })))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  async function deleteQuiz(quizId: string) {
    if (!confirm('Delete this quiz?')) return
    try {
      await deleteDoc(doc(db, 'quizzes', quizId))
      toast.success('Quiz deleted')
      loadQuizzes()
    } catch { toast.error('Failed to delete') }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Quizzes</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create and manage quizzes</p>
        </div>
        <Link href="/admin/quizzes/new">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Quiz</Button>
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <Card>
          <CardContent>
            <div className="flex flex-col items-center py-12 text-center">
              <HelpCircle className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">No quizzes yet</h3>
              <p className="mt-1 text-sm text-gray-500">Create quizzes to test student knowledge</p>
              <Link href="/admin/quizzes/new"><Button className="mt-4" leftIcon={<Plus className="h-4 w-4" />}>Create Quiz</Button></Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} hover>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                    <HelpCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{quiz.title}</h3>
                    <p className="text-xs text-gray-500">{quiz.questions?.length || 0} questions | Pass: {quiz.passingScore}% | Max attempts: {quiz.maxAttempts}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={quiz.passingScore > 70 ? 'warning' : 'info'}>{quiz.passingScore}% pass</Badge>
                  <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => deleteQuiz(quiz.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
