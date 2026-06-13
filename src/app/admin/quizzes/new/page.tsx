'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { addDoc, collection, serverTimestamp, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { QuizQuestion } from '@/models'
import toast from 'react-hot-toast'
import { Plus, Trash2, GripVertical } from 'lucide-react'

const questionTypes = [
  { value: 'multiple-choice', label: 'Multiple Choice' },
  { value: 'true-false', label: 'True/False' },
  { value: 'short-answer', label: 'Short Answer' },
]

export default function NewQuizPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    courseId: '',
    lessonId: '',
    passingScore: 70,
    maxAttempts: 3,
    timeLimit: 0,
  })
  const [questions, setQuestions] = useState<QuizQuestion[]>([])

  const addQuestion = (type: QuizQuestion['type'] = 'multiple-choice') => {
    setQuestions(prev => [...prev, {
      id: crypto.randomUUID(),
      type,
      question: '',
      options: type === 'true-false' ? ['True', 'False'] : ['', '', '', ''],
      correctAnswer: type === 'multiple-choice' ? '' : type === 'true-false' ? 'True' : '',
      points: 10,
      explanation: '',
    }])
  }

  const updateQuestion = (id: string, field: string, value: unknown) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q))
  }

  const updateOption = (qId: string, optIdx: number, value: string) => {
    setQuestions(prev => prev.map(q => q.id === qId ? {
      ...q,
      options: q.options?.map((o, i) => i === optIdx ? value : o),
    } : q))
  }

  const removeQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title) return toast.error('Title is required')
    if (questions.length === 0) return toast.error('Add at least one question')
    setSaving(true)
    try {
      await addDoc(collection(db, 'quizzes'), {
        ...form,
        timeLimit: form.timeLimit || null,
        questions,
        createdAt: serverTimestamp() as Timestamp,
        updatedAt: serverTimestamp() as Timestamp,
      })
      toast.success('Quiz created')
      router.push('/admin/quizzes')
    } catch (err) { console.error(err); toast.error('Failed to create quiz') }
    finally { setSaving(false) }
  }

  return (
    <div className="animate-fade-in mx-auto max-w-4xl space-y-6">
      <div><h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create Quiz</h1></div>

      <Card>
        <CardHeader><h2 className="font-semibold">Quiz Settings</h2></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input label="Quiz Title" value={form.title} onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))} required />
            <Textarea label="Description" value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
            <div className="grid gap-4 sm:grid-cols-3">
              <Input label="Passing Score (%)" type="number" value={form.passingScore} onChange={(e) => setForm(f => ({ ...f, passingScore: parseInt(e.target.value) || 0 }))} min="0" max="100" />
              <Input label="Max Attempts" type="number" value={form.maxAttempts} onChange={(e) => setForm(f => ({ ...f, maxAttempts: parseInt(e.target.value) || 1 }))} min="1" />
              <Input label="Time Limit (min)" type="number" value={form.timeLimit} onChange={(e) => setForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 0 }))} min="0" helperText="0 = no limit" />
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Questions ({questions.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => addQuestion('multiple-choice')} leftIcon={<Plus className="h-4 w-4" />}>MCQ</Button>
              <Button variant="outline" size="sm" onClick={() => addQuestion('true-false')} leftIcon={<Plus className="h-4 w-4" />}>T/F</Button>
              <Button variant="outline" size="sm" onClick={() => addQuestion('short-answer')} leftIcon={<Plus className="h-4 w-4" />}>Short</Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {questions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">Add your first question using the buttons above</p>
          ) : (
            questions.map((q, idx) => (
              <div key={q.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500">Question {idx + 1}</span>
                  <Button variant="ghost" size="sm" onClick={() => removeQuestion(q.id)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Enter your question"
                      value={q.question}
                      onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                      className="flex-1"
                    />
                    <select
                      value={q.type}
                      onChange={(e) => {
                        const type = e.target.value as QuizQuestion['type']
                        updateQuestion(q.id, 'type', type)
                        updateQuestion(q.id, 'options', type === 'true-false' ? ['True', 'False'] : ['', '', '', ''])
                        updateQuestion(q.id, 'correctAnswer', type === 'true-false' ? 'True' : '')
                      }}
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm dark:bg-gray-800 dark:border-gray-600"
                    >
                      {questionTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                  </div>

                  {q.type === 'multiple-choice' && (
                    <div className="space-y-2 pl-2">
                      {q.options?.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${q.id}`}
                            checked={q.correctAnswer === opt}
                            onChange={() => updateQuestion(q.id, 'correctAnswer', opt)}
                            className="text-indigo-600"
                          />
                          <input
                            placeholder={`Option ${oi + 1}`}
                            value={opt}
                            onChange={(e) => updateOption(q.id, oi, e.target.value)}
                            className="flex-1 rounded border border-gray-200 px-3 py-1.5 text-sm dark:bg-gray-800 dark:border-gray-600"
                          />
                        </div>
                      ))}
                      <p className="text-xs text-gray-500">Select the radio button for the correct answer</p>
                    </div>
                  )}

                  {q.type === 'true-false' && (
                    <div className="flex gap-4 pl-2">
                      {['True', 'False'].map(opt => (
                        <label key={opt} className="flex items-center gap-2 text-sm">
                          <input
                            type="radio"
                            name={`tf-${q.id}`}
                            checked={q.correctAnswer === opt}
                            onChange={() => updateQuestion(q.id, 'correctAnswer', opt)}
                            className="text-indigo-600"
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {q.type === 'short-answer' && (
                    <Input
                      placeholder="Enter the correct answer"
                      value={typeof q.correctAnswer === 'string' ? q.correctAnswer : ''}
                      onChange={(e) => updateQuestion(q.id, 'correctAnswer', e.target.value)}
                    />
                  )}

                  <div className="flex gap-3">
                    <Input
                      label="Points"
                      type="number"
                      value={q.points}
                      onChange={(e) => updateQuestion(q.id, 'points', parseInt(e.target.value) || 0)}
                      className="w-24"
                    />
                    <Input
                      label="Explanation (optional)"
                      value={q.explanation || ''}
                      onChange={(e) => updateQuestion(q.id, 'explanation', e.target.value)}
                      className="flex-1"
                      placeholder="Explain why this answer is correct"
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button type="submit" onClick={handleSubmit} isLoading={saving}>Save Quiz</Button>
        <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
      </div>
    </div>
  )
}
