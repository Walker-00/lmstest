const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || ''
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || ''

export function isCloudinaryConfigured(): boolean {
  return !!cloudName && !!uploadPreset
}

export interface CloudinaryUploadResult {
  secure_url: string
  public_id: string
  format: string
  bytes: number
  width?: number
  height?: number
  asset_id: string
}

export async function uploadToCloudinary(
  file: File,
  folder: string = 'uploads'
): Promise<CloudinaryUploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error(
      'Cloudinary not configured. Set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET.'
    )
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', uploadPreset)
  formData.append('folder', folder)

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    { method: 'POST', body: formData }
  )

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: { message: res.statusText } }))
    throw new Error(err.error?.message || 'Cloudinary upload failed')
  }

  return res.json()
}

export function getCloudinaryUrl(publicId: string, options?: {
  width?: number
  height?: number
  quality?: number
  format?: string
}): string {
  let base = `https://res.cloudinary.com/${cloudName}/image/upload`
  if (options) {
    const transforms: string[] = []
    if (options.width) transforms.push(`w_${options.width}`)
    if (options.height) transforms.push(`h_${options.height}`)
    if (options.quality) transforms.push(`q_${options.quality}`)
    if (options.format) transforms.push(`f_${options.format}`)
    if (transforms.length > 0) base += '/' + transforms.join(',')
  }
  return `${base}/${publicId}`
}
