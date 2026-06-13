'use client'

import { StudentLayout } from '@/components/layout/StudentLayout'

export default function CoursesLayout({ children }: { children: React.ReactNode }) {
  return <StudentLayout>{children}</StudentLayout>
}
