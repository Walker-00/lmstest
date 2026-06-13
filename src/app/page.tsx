'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { CourseCard } from '@/components/shared/CourseCard'
import { Course } from '@/models'
import { queryDocs, where, orderBy, limit } from '@/lib/firebase/firestore'
import { BookOpen, BarChart3, Award, Shield, ArrowRight, Play, CheckCircle, Zap } from 'lucide-react'

export default function HomePage() {
  const { user, isAdmin } = useAuth()
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await queryDocs<Course>(
          'courses',
          where('status', '==', 'published'),
          orderBy('enrolledCount', 'desc'),
          limit(6)
        )
        setCourses(data)
      } catch {}
    }
    loadCourses()
  }, [])

  return (
    <div className="min-h-screen">
      {/* Nav */}
      <nav className="fixed top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-950/80">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-indigo-600" />
            <span className="text-lg font-bold">EduLearn</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link href={isAdmin ? '/admin/dashboard' : '/dashboard'}>
                <Button>Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link href="/auth/login"><Button variant="ghost">Sign In</Button></Link>
                <Link href="/auth/register"><Button>Get Started</Button></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-28">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-indigo-950/30" />
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-indigo-200/30 blur-3xl dark:bg-indigo-800/10" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-purple-200/30 blur-3xl dark:bg-purple-800/10" />
        <div className="relative mx-auto max-w-7xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl dark:text-gray-100">
            Learn Without
            <span className="block text-indigo-600 dark:text-indigo-400">Limits</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 dark:text-gray-400">
            Access premium courses, track your progress, earn certificates, and advance your career - all from one platform.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link href={user ? '/courses' : '/auth/register'}>
              <Button size="lg" className="gap-2">
                Start Learning <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="outline" size="lg">Explore Features</Button>
            </Link>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Free to start</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> No credit card</span>
            <span className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Lifetime access</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">Everything You Need</h2>
          <p className="mt-2 text-center text-gray-600 dark:text-gray-400">
            A complete learning platform built for modern education
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Play, title: 'Video Lessons', desc: 'Embedded YouTube videos with progress tracking and resume watching' },
              { icon: BarChart3, title: 'Track Progress', desc: 'Monitor your learning journey with detailed progress analytics' },
              { icon: Award, title: 'Certificates', desc: 'Earn verifiable certificates with unique QR codes upon completion' },
              { icon: BookOpen, title: 'Rich Materials', desc: 'Access PDFs, presentations, documents, and more resources' },
              { icon: Zap, title: 'Interactive Quizzes', desc: 'Test your knowledge with multiple question types and instant feedback' },
              { icon: Shield, title: 'Secure Platform', desc: 'Enterprise-grade security with role-based access control' },
            ].map((feature) => (
              <div key={feature.title} className="group rounded-xl border border-gray-200 bg-white p-6 transition-all hover:shadow-lg dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Courses */}
      {courses.length > 0 && (
        <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Popular Courses</h2>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Start learning from our top-rated courses</p>
              </div>
              <Link href="/courses">
                <Button variant="outline" className="gap-2">View All <ArrowRight className="h-4 w-4" /></Button>
              </Link>
            </div>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 p-12">
            <h2 className="text-3xl font-bold text-white">Ready to Start Learning?</h2>
            <p className="mt-4 text-lg text-indigo-100">Join thousands of students already learning on our platform.</p>
            <Link href={user ? '/courses' : '/auth/register'}>
              <Button size="lg" variant="secondary" className="mt-8 gap-2">
                Get Started Free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>© {new Date().getFullYear()} EduLearn. All rights reserved. Built with Next.js & Firebase.</p>
        </div>
      </footer>
    </div>
  )
}
