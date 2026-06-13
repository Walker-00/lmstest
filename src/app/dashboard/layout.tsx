'use client'

import { StudentLayout } from '@/components/layout/StudentLayout'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayout>{children}</StudentLayout>
}
