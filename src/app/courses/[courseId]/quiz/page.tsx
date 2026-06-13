'use client'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { getDocs, collection, query, where, addDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Quiz, QuizAttempt } from '@/models'
import { Clock, CheckCircle, XCircle, ArrowLeft, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function QuizPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const router = useRouter()
  const { user } = useAuth()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [loading, setLoading] = useState(true)
  const [started, setStarted] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<{ score: number; total: number; passed: boolean; percentage: number } | null>(null)

  useEffect(() => {
    if (!courseId) return
    loadQuiz()
  }, [courseId])

  async function loadQuiz() {
    try {
      const quizSnap = await getDocs(query(collection(db, 'quizzes'), where('courseId', '==', courseId)))
      if (!quizSnap.empty) {
        setQuiz({ id: quizSnap.docs[0].id, ...quizSnap.docs[0].data() } as Quiz)
      }
      if (user) {
        const attSnap = await getDocs(query(
          collection(db, 'quizAttempts'),
          where('userId', '==', user.uid),
          where('courseId', '==', courseId)
        ))
        setAttempts(attSnap.docs.map(d => ({ id: d.id, ...d.data() } as QuizAttempt)))
      }
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const startQuiz = () => {
    if (quiz && attempts.length >= (quiz.maxAttempts || 3)) {
      toast.error(`Maximum ${quiz.maxAttempts} attempts reached`)
      return
    }
    setStarted(true)
    setResult(null)
    setAnswers({})
  }

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const submitQuiz = async () => {
    if (!quiz) return
    setSubmitting(true)
    try {
      let score = 0
      let total = 0
      quiz.questions.forEach(q => {
        total += q.points
        const userAnswer = answers[q.id]
        if (q.type === 'multiple-choice' && userAnswer === q.correctAnswer) score += q.points
        else if (q.type === 'true-false' && userAnswer === q.correctAnswer) score += q.points
        else if (q.type === 'short-answer' && typeof userAnswer === 'string' && userAnswer.toLowerCase().trim() === (q.correctAnswer as string).toLowerCase().trim()) score += q.points
      })

      const percentage = total > 0 ? Math.round((score / total) * 100) : 0
      const passed = percentage >= (quiz.passingScore || 70)
      setResult({ score, total, passed, percentage })

      if (user) {
        await addDoc(collection(db, 'quizAttempts'), {
          userId: user.uid,
          quizId: quiz.id,
          courseId,
          answers,
          score,
          totalPoints: total,
          passed,
          startedAt: serverTimestamp() as Timestamp,
          completedAt: serverTimestamp() as Timestamp,
          attemptNumber: attempts.length + 1,
        })
      }

      if (passed) toast.success('Congratulations! You passed! 🎉')
      else toast.error('You did not pass. Try again!')
    } catch { toast.error('Failed to submit') }
    finally { setSubmitting(false) }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
  if (!quiz) return <div className="text-center py-12 text-gray-500">No quiz available for this course</div>

  const totalPoints = quiz.questions.reduce((sum, q) => sum + q.points, 0)

  return (
    <div className="animate-fade-in mx-auto max-w-3xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back to course
      </button>

      {!started ? (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h1>
              <Badge variant={result?.passed ? 'success' : 'warning'}>{quiz.passingScore}% to pass</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">{quiz.description}</p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="text-gray-500">Questions</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{quiz.questions.length}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="text-gray-500">Total Points</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{totalPoints}</p>
              </div>
              {quiz.timeLimit && (
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                  <p className="text-gray-500">Time Limit</p>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{quiz.timeLimit} min</p>
                </div>
              )}
              <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                <p className="text-gray-500">Attempts</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">{attempts.length}/{quiz.maxAttempts || 3}</p>
              </div>
            </div>
            {result && (
              <div className={`rounded-lg p-4 ${result.passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                <div className="flex items-center gap-2">
                  {result.passed ? <CheckCircle className="h-5 w-5 text-green-600" /> : <XCircle className="h-5 w-5 text-red-600" />}
                  <span className="font-semibold">{result.passed ? 'Passed' : 'Failed'}</span>
                </div>
                <p className="text-sm mt-1">Score: {result.score}/{result.total} ({result.percentage}%)</p>
              </div>
            )}
            <Button className="w-full" onClick={startQuiz} leftIcon={<RefreshCw className="h-4 w-4" />}>
              {result ? 'Retake Quiz' : 'Start Quiz'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">{quiz.title}</h1>
            <span className="text-sm text-gray-500">{quiz.questions.length} questions</span>
          </div>

          {quiz.questions.map((q, idx) => (
            <Card key={q.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-medium text-gray-900 dark:text-gray-100">
                    {idx + 1}. {q.question}
                  </h3>
                  <Badge size="sm" variant="default">{q.points} pts</Badge>
                </div>

                {q.type === 'multiple-choice' && q.options?.map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 rounded-lg border p-3 mb-2 cursor-pointer transition-colors ${
                    answers[q.id] === opt ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)}
                      className="text-indigo-600"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{opt}</span>
                  </label>
                ))}

                {q.type === 'true-false' && ['True', 'False'].map((opt) => (
                  <label key={opt} className={`flex items-center gap-3 rounded-lg border p-3 mb-2 cursor-pointer ${
                    answers[q.id] === opt ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <input
                      type="radio"
                      name={`q-${q.id}`}
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswer(q.id, opt)}
                      className="text-indigo-600"
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}

                {q.type === 'short-answer' && (
                  <input
                    type="text"
                    placeholder="Type your answer..."
                    value={typeof answers[q.id] === 'string' ? answers[q.id] as string : ''}
                    onChange={(e) => handleAnswer(q.id, e.target.value)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
                  />
                )}
              </CardContent>
            </Card>
          ))}

          <Button className="w-full" onClick={submitQuiz} isLoading={submitting}>
            Submit Quiz
          </Button>
        </div>
      )}
    </div>
  )
}
