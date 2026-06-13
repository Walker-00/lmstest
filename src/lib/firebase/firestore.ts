import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  DocumentData,
  QueryConstraint,
  Timestamp,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  DocumentReference,
  CollectionReference,
  WithFieldValue,
} from 'firebase/firestore'
import { db } from './config'

export function getCollection<T = DocumentData>(path: string): CollectionReference<T> {
  return collection(db, path) as CollectionReference<T>
}

export function getDocument<T = DocumentData>(path: string, ...segments: string[]): DocumentReference<T> {
  return doc(db, path, ...segments) as DocumentReference<T>
}

export async function createDoc<T extends DocumentData>(
  collectionPath: string,
  data: WithFieldValue<T>,
  id?: string
): Promise<string> {
  if (id) {
    await setDoc(doc(db, collectionPath, id), data)
    return id
  }
  const docRef = await addDoc(collection(db, collectionPath), data)
  return docRef.id
}

export async function updateDocData(path: string, data: Partial<DocumentData>): Promise<void> {
  await updateDoc(doc(db, path), data)
}

export async function deleteDocData(path: string): Promise<void> {
  await deleteDoc(doc(db, path))
}

export async function getDocData<T = DocumentData>(path: string): Promise<T | null> {
  const snap = await getDoc(doc(db, path))
  return snap.exists() ? (snap.data() as T) : null
}

export async function queryDocs<T = DocumentData>(
  collectionPath: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, collectionPath), ...constraints)
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T))
}

export async function getDocsWhere<T = DocumentData>(
  collectionPath: string,
  field: string,
  operator: '==' | '!=' | '>' | '>=' | '<' | '<=',
  value: unknown
): Promise<T[]> {
  const q = query(collection(db, collectionPath), where(field, operator, value))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as unknown as T))
}

export {
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  increment,
  arrayUnion,
  arrayRemove,
  Timestamp,
}
export type { DocumentReference, CollectionReference, DocumentData, QueryConstraint }
