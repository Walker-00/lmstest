import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  onAuthStateChanged,
  UserCredential,
} from 'firebase/auth'
import { doc, setDoc, getDoc, serverTimestamp, Timestamp } from 'firebase/firestore'
import { auth, db } from './config'
import { AppUser, UserRole } from '@/models'

export async function registerUser(
  email: string,
  password: string,
  displayName: string
): Promise<UserCredential> {
  const credential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(credential.user, { displayName })

  const userData: AppUser = {
    uid: credential.user.uid,
    email: credential.user.email!,
    displayName,
    photoURL: credential.user.photoURL || null,
    role: 'student',
    createdAt: serverTimestamp() as Timestamp,
    lastLogin: serverTimestamp() as Timestamp,
    isActive: true,
  }

  await setDoc(doc(db, 'users', credential.user.uid), userData)
  return credential
}

export async function loginUser(email: string, password: string): Promise<UserCredential> {
  const credential = await signInWithEmailAndPassword(auth, email, password)
  await setDoc(
    doc(db, 'users', credential.user.uid),
    { lastLogin: serverTimestamp() },
    { merge: true }
  )
  return credential
}

export async function logoutUser(): Promise<void> {
  await signOut(auth)
}

export async function resetPassword(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email)
}

export async function getUserData(uid: string): Promise<AppUser | null> {
  const docSnap = await getDoc(doc(db, 'users', uid))
  return docSnap.exists() ? (docSnap.data() as AppUser) : null
}

export function onAuthChange(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback)
}

export function getCurrentUser(): User | null {
  return auth.currentUser
}
