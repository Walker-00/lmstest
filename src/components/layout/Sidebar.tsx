'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useAppStore } from '@/store/appStore'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BarChart3,
  Megaphone,
  GraduationCap,
  Bookmark,
  MessageSquare,
  FileText,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'

const adminLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/courses', label: 'Courses', icon: BookOpen },
  { href: '/admin/lessons', label: 'Lessons', icon: FileText },
  { href: '/admin/quizzes', label: 'Quizzes', icon: HelpCircle },
  { href: '/admin/students', label: 'Students', icon: Users },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/admin/announcements', label: 'Announcements', icon: Megaphone },
]

const studentLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/courses', label: 'My Courses', icon: BookOpen },
  { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/discussions', label: 'Discussions', icon: MessageSquare },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isAdmin } = useAuth()
  const { sidebarOpen, toggleSidebar } = useAppStore()

  const links = isAdmin ? adminLinks : studentLinks
  const isAdminRoute = pathname.startsWith('/admin')

  if (!isAdminRoute && !pathname.startsWith('/dashboard') && 
      !pathname.startsWith('/courses') && !pathname.startsWith('/bookmarks') &&
      !pathname.startsWith('/notes') && !pathname.startsWith('/discussions')) {
    return null
  }

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={toggleSidebar}
        />
      )}
      <aside
        className={cn(
          'fixed left-0 top-16 z-30 h-[calc(100vh-4rem)] border-r border-gray-200 bg-white transition-all duration-300 dark:border-gray-700 dark:bg-gray-900',
          sidebarOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full lg:w-16 lg:translate-x-0'
        )}
      >
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 hidden rounded-full border border-gray-200 bg-white p-1 shadow-sm dark:border-gray-700 dark:bg-gray-800 lg:block"
        >
          {sidebarOpen ? <ChevronLeft className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
        </button>

        <nav className="flex flex-col gap-1 p-3 overflow-y-auto h-full">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(link.href + '/')
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                )}
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span className={cn('transition-opacity', !sidebarOpen && 'lg:hidden')}>
                  {link.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}
