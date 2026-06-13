import { uploadToCloudinary } from '@/lib/cloudinary'
import type { CloudinaryUploadResult } from '@/lib/cloudinary'

export function getStoragePath(
  type: 'courses' | 'materials' | 'thumbnails' | 'certificates' | 'avatars',
  userId: string,
  fileName: string
): string {
  return `${type}/${userId}/${Date.now()}_${fileName}`
}

export async function uploadFileAsync(path: string, file: File): Promise<CloudinaryUploadResult> {
  const folder = path.split('/').slice(0, -1).join('/')
  return uploadToCloudinary(file, folder)
}
