'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { getDocs, collection, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { AppUser } from '@/models'
import { formatDate } from '@/lib/utils'
import { Search, Users, Mail, Calendar, Clock } from 'lucide-react'

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<(AppUser & { id: string })[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    loadStudents()
  }, [])

  async function loadStudents() {
    try {
      const q = query(collection(db, 'users'), where('role', '==', 'student'))
      const snap = await getDocs(q)
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() } as AppUser & { id: string })))
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const filtered = students.filter(s =>
    s.displayName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <div className="flex items-center justify-center h-64"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Students</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage enrolled students ({students.length})</p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="search"
          placeholder="Search students..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center py-12">
              <Users className="h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500">{search ? 'No students match your search' : 'No students enrolled yet'}</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filtered.map((student) => (
                <div key={student.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-medium text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
                    {student.displayName?.charAt(0)?.toUpperCase() || 'S'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{student.displayName || 'Unknown'}</p>
                    <p className="text-xs text-gray-500">{student.email}</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {formatDate(student.createdAt)}</span>
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {formatDate(student.lastLogin)}</span>
                  </div>
                  <Badge variant={student.isActive ? 'success' : 'default'}>{student.isActive ? 'Active' : 'Inactive'}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
