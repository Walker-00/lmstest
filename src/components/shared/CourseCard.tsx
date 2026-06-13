'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn, truncate } from '@/lib/utils'
import { Course } from '@/models'
import { BookOpen, Clock, Users, Star } from 'lucide-react'

interface CourseCardProps {
  course: Course
  href?: string
  progress?: number
  className?: string
  showProgress?: boolean
}

const difficultyColors: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
  beginner: 'success',
  intermediate: 'warning',
  advanced: 'danger',
  'all-levels': 'info',
}

export function CourseCard({ course, href, progress, className, showProgress }: CourseCardProps) {
  const linkHref = href || `/courses/${course.id}`
  const categories: Record<string, string> = {
    programming: 'Programming',
    design: 'Design',
    business: 'Business',
    marketing: 'Marketing',
    'data-science': 'Data Science',
    'ai-ml': 'AI & ML',
    'mobile-dev': 'Mobile Dev',
    'web-dev': 'Web Dev',
    devops: 'DevOps',
    cybersecurity: 'Cybersecurity',
    cloud: 'Cloud',
    other: 'Other',
  }

  return (
    <Link href={linkHref}>
      <Card hover className={cn('group overflow-hidden', className)}>
        <div className="relative aspect-video bg-gradient-to-br from-indigo-500 to-purple-600">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <BookOpen className="h-12 w-12 text-white/50" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <Badge variant={difficultyColors[course.difficulty] || 'default'} size="sm">
              {course.difficulty === 'all-levels' ? 'All Levels' : course.difficulty.charAt(0).toUpperCase() + course.difficulty.slice(1)}
            </Badge>
          </div>
          {showProgress && progress !== undefined && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          )}
          {showProgress && progress !== undefined && (
            <div className="absolute bottom-12 left-3 right-3">
              <div className="h-1.5 rounded-full bg-white/30">
                <div
                  className="h-full rounded-full bg-green-500 transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {truncate(course.title, 50)}
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
            {truncate(course.description, 80)}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <BookOpen className="h-3.5 w-3.5" />
              {course.totalLessons || 0} lessons
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              {course.enrolledCount || 0}
            </span>
            {course.averageRating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="h-3.5 w-3.5 text-yellow-500" />
                {course.averageRating.toFixed(1)}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
