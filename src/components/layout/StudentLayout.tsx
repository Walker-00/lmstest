'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Sidebar } from './Sidebar'
import { Navbar } from './Navbar'
import { cn } from '@/lib/utils'
import { useAppStore } from '@/store/appStore'

export function StudentLayout({ children }: { children: ReactNode }) {
  const { userData, loading } = useAuth()
  const { sidebarOpen } = useAppStore()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !userData) {
      router.push('/auth/login')
    }
  }, [userData, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  if (!userData) return null

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />
      <Sidebar />
      <main
        className={cn(
          'pt-16 transition-all duration-300',
          sidebarOpen ? 'lg:ml-64' : 'lg:ml-16'
        )}
      >
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}
