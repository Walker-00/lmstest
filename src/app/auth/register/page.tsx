'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { BookOpen, User, Mail, Lock, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { register } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !email || !password) return toast.error('Please fill in all fields')
    if (password.length < 8) return toast.error('Password must be at least 8 characters')
    if (password !== confirmPassword) return toast.error('Passwords do not match')
    setIsLoading(true)
    try {
      await register(email, password, name)
      toast.success('Account created successfully!')
      router.push('/dashboard')
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string }
      if (error.code === 'auth/email-already-in-use') {
        toast.error('An account with this email already exists')
      } else if (error.code === 'auth/weak-password') {
        toast.error('Password is too weak')
      } else if (error.code === 'auth/invalid-email') {
        toast.error('Invalid email address')
      } else {
        toast.error(error.message || 'Registration failed')
      }
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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Create your account</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start your learning journey today</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  helperText="At least 8 characters"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Input
                label="Confirm Password"
                type="password"
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <Button type="submit" className="w-full" isLoading={isLoading}>
                Create Account
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400">
                Sign in
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
