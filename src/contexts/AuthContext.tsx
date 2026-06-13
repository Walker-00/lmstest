'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthChange, getUserData, loginUser, registerUser, logoutUser } from '@/lib/firebase/auth'
import { initFirebase, isFirebaseConfigured } from '@/lib/firebase/config'
import { AppUser } from '@/models'

interface AuthContextType {
  user: User | null
  userData: AppUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isStudent: boolean
  firebaseReady: boolean
  firebaseError: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<AppUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [firebaseReady, setFirebaseReady] = useState(false)
  const [firebaseError, setFirebaseError] = useState<string | null>(null)

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      setFirebaseError(
        'Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables in Vercel Dashboard.'
      )
      setLoading(false)
      return
    }

    try {
      initFirebase()
      setFirebaseReady(true)

      const unsubscribe = onAuthChange(async (firebaseUser) => {
        setUser(firebaseUser)
        if (firebaseUser) {
          const data = await getUserData(firebaseUser.uid)
          setUserData(data)
        } else {
          setUserData(null)
        }
        setLoading(false)
      })
      return unsubscribe
    } catch (err) {
      setFirebaseError(err instanceof Error ? err.message : 'Failed to initialize Firebase')
      setLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    await loginUser(email, password)
  }

  const register = async (email: string, password: string, name: string) => {
    await registerUser(email, password, name)
  }

  const logout = async () => {
    await logoutUser()
  }

  if (firebaseError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-4">
        <div className="max-w-md rounded-xl border border-red-800 bg-gray-900 p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-900/50">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-bold text-red-400">Configuration Required</h2>
          <p className="mb-6 text-sm text-gray-400">{firebaseError}</p>
          <p className="text-xs text-gray-500">
            Add the required environment variables in your Vercel project dashboard, then redeploy.
          </p>
        </div>
      </div>
    )
  }

  if (!firebaseReady && loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Initializing...</p>
        </div>
      </div>
    )
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        userData,
        loading,
        login,
        register,
        logout,
        isAdmin: userData?.role === 'admin',
        isStudent: userData?.role === 'student',
        firebaseReady,
        firebaseError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
