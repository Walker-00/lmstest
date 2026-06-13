import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth, connectAuthEmulator, Auth } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator, Firestore } from 'firebase/firestore'
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const
const missingKeys = requiredKeys.filter((k) => !firebaseConfig[k])

export function isFirebaseConfigured(): boolean {
  return missingKeys.length === 0
}

if (!isFirebaseConfigured() && typeof window !== 'undefined') {
  console.warn(
    `Firebase is not configured. Missing env vars: ${missingKeys.join(', ')}\n` +
      'Set NEXT_PUBLIC_FIREBASE_* in .env.local or Vercel Dashboard.'
  )
}

let app: FirebaseApp
let auth: Auth
let db: Firestore
let analytics: Analytics | null = null

const isDev = process.env.NODE_ENV === 'development'

export function initFirebase() {
  if (!isFirebaseConfigured()) {
    throw new Error(
      `Firebase not configured. Missing: ${missingKeys.join(', ')}. ` +
        'Set NEXT_PUBLIC_FIREBASE_* environment variables.'
    )
  }

  if (!getApps().length) {
    app = initializeApp(firebaseConfig as Record<string, string>)
    auth = getAuth(app)
    db = getFirestore(app)

    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported) {
          analytics = getAnalytics(app)
        }
      })
    }

    if (isDev && process.env.NEXT_PUBLIC_USE_EMULATOR === 'true') {
      connectAuthEmulator(auth, 'http://localhost:9099')
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
  } else {
    app = getApps()[0]
    auth = getAuth(app)
    db = getFirestore(app)
  }

  return { app, auth, db, analytics }
}

export { app, auth, db, analytics }
export type { Auth, Firestore, Analytics }
