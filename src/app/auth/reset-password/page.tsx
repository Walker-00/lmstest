'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { resetPassword } from '@/lib/firebase/auth'
import { BookOpen, Mail, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    setIsLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
      toast.success('Reset link sent to your email')
    } catch (err: unknown) {
      const error = err as { code?: string }
      if (error.code === 'auth/user-not-found') toast.error('No account found with this email')
      else toast.error('Failed to send reset email')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4 dark:from-gray-950 dark:via-gray-950 dark:to-indigo-950/30">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">EduLearn</span>
          </Link>
        </div>
        <Card>
          <CardHeader>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Reset Password</h1>
            <p className="text-sm text-gray-500">
              {sent ? 'Check your email for the reset link' : 'Enter your email and we\'ll send you a reset link'}
            </p>
          </CardHeader>
          <CardContent>
            {sent ? (
              <div className="text-center space-y-4">
                <div className="rounded-full bg-green-100 p-3 w-fit mx-auto">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <p className="text-sm text-gray-600">If an account exists with that email, you will receive a password reset link shortly.</p>
                <Link href="/auth/login"><Button variant="outline">Back to Sign In</Button></Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <Button type="submit" className="w-full" isLoading={isLoading}>Send Reset Link</Button>
                <Link href="/auth/login" className="flex items-center justify-center gap-2 text-sm text-indigo-600 hover:text-indigo-500">
                  <ArrowLeft className="h-4 w-4" /> Back to Sign In
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
