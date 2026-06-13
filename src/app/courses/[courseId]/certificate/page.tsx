'use client'


import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { getDoc, doc, getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { Course, Enrollment } from '@/models'
import { Award, Download, CheckCircle, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CertificatePage() {
  const { courseId } = useParams<{ courseId: string }>()
  const router = useRouter()
  const { user, userData } = useAuth()
  const [course, setCourse] = useState<Course | null>(null)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!courseId || !user) return
    loadData()
  }, [courseId, user])

  async function loadData() {
    try {
      const [courseSnap, enrollSnap] = await Promise.all([
        getDoc(doc(db, 'courses', courseId)),
        getDocs(query(collection(db, 'enrollments'), where('userId', '==', user!.uid), where('courseId', '==', courseId))),
      ])
      if (!courseSnap.exists() || enrollSnap.empty) { router.push('/courses'); return }
      setCourse({ id: courseSnap.id, ...courseSnap.data() } as Course)
      setEnrollment({ id: enrollSnap.docs[0].id, ...enrollSnap.docs[0].data() } as Enrollment)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const issueCertificate = async () => {
    toast.success('Certificate will be available soon!')
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>
  if (!course || !enrollment) return null

  const canGetCertificate = enrollment.progress >= 100

  return (
    <div className="animate-fade-in mx-auto max-w-2xl">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="h-4 w-4" /> Back
      </button>

      <Card>
        <CardContent className="p-8 text-center">
          {canGetCertificate ? (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Award className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Congratulations!</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                You have completed <strong>{course.title}</strong>
              </p>

              <div className="mt-8 rounded-xl border-2 border-gray-200 bg-white p-8 dark:border-gray-700 dark:bg-gray-800">
                <div className="border-b border-gray-200 pb-4 dark:border-gray-700">
                  <p className="text-xs uppercase tracking-wider text-gray-500">Certificate of Completion</p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-gray-100">{course.title}</p>
                </div>
                <div className="py-6">
                  <p className="text-sm text-gray-600 dark:text-gray-400">This certifies that</p>
                  <p className="mt-1 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {userData?.displayName || 'Student'}
                  </p>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    has successfully completed the course with all requirements fulfilled.
                  </p>
                </div>
                <div className="border-t border-gray-200 pt-4 dark:border-gray-700">
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Issued: {new Date().toLocaleDateString()}</span>
                    <span>Instructor: {course.instructorName}</span>
                  </div>
                </div>
              </div>

              <Button className="mt-6" onClick={issueCertificate} leftIcon={<Download className="h-4 w-4" />}>
                Download Certificate
              </Button>
            </>
          ) : (
            <>
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
                <Award className="h-10 w-10 text-gray-400" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Complete the Course</h1>
              <p className="mt-2 text-gray-500">Complete all lessons to earn your certificate.</p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {enrollment.completedLessons?.length || 0} of {course.totalLessons || 0} lessons completed
                </span>
              </div>
              <div className="mt-4 h-2 rounded-full bg-gray-200 dark:bg-gray-700 max-w-xs mx-auto">
                <div className="h-full rounded-full bg-indigo-500" style={{ width: `${enrollment.progress}%` }} />
              </div>
              <p className="mt-2 text-sm text-gray-500">{Math.round(enrollment.progress)}% complete</p>
              <Button className="mt-6" onClick={() => router.push(`/courses/${courseId}/learn`)}>
                Continue Learning
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
