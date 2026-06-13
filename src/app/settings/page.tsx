'use client'

import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Card, CardHeader, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useState } from 'react'
import { User, Mail, Sun, Moon, LogOut, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const { user, userData, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const [displayName, setDisplayName] = useState(userData?.displayName || '')

  const handleLogout = async () => {
    await logout()
    router.push('/')
    toast.success('Signed out')
  }

  return (
    <div className="animate-fade-in mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your account preferences</p>
      </div>

      <Card>
        <CardHeader><h2 className="font-semibold">Profile</h2></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-xl font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400">
              {userData?.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">{userData?.displayName}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Input label="Display Name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Button>Save Changes</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold">Appearance</h2></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? <Moon className="h-5 w-5 text-gray-600" /> : <Sun className="h-5 w-5 text-gray-600" />}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</p>
                <p className="text-xs text-gray-500">Current: {theme === 'dark' ? 'Dark' : 'Light'} mode</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={toggleTheme}>
              Switch to {theme === 'dark' ? 'Light' : 'Dark'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><h2 className="font-semibold text-red-600">Account</h2></CardHeader>
        <CardContent className="space-y-3">
          <Button variant="outline" className="w-full" onClick={handleLogout} leftIcon={<LogOut className="h-4 w-4" />}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
