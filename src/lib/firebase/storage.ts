import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
  UploadTask,
  UploadResult,
  StorageReference,
} from 'firebase/storage'
import { storage } from './config'

export function createStorageRef(path: string): StorageReference {
  return ref(storage, path)
}

export function uploadFile(
  path: string,
  file: File,
  onProgress?: (progress: number) => void
): UploadTask {
  const storageRef = ref(storage, path)
  const uploadTask = uploadBytesResumable(storageRef, file)

  if (onProgress) {
    uploadTask.on('state_changed', (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
      onProgress(progress)
    })
  }

  return uploadTask
}

export async function uploadFileAsync(
  path: string,
  file: File
): Promise<UploadResult> {
  const storageRef = ref(storage, path)
  return uploadBytesResumable(storageRef, file)
}

export async function getFileUrl(path: string): Promise<string> {
  const storageRef = ref(storage, path)
  return getDownloadURL(storageRef)
}

export async function deleteFile(path: string): Promise<void> {
  const storageRef = ref(storage, path)
  await deleteObject(storageRef)
}

export async function listFiles(path: string) {
  const storageRef = ref(storage, path)
  return listAll(storageRef)
}

export function getStoragePath(
  type: 'courses' | 'materials' | 'thumbnails' | 'certificates' | 'avatars',
  userId: string,
  fileName: string
): string {
  return `${type}/${userId}/${Date.now()}_${fileName}`
}
