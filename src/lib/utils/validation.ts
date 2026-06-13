export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidPassword(password: string): boolean {
  return password.length >= 8
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/(?:www\.)?youtube\.com\/watch\?v=[\w-]{11}/,
    /^https?:\/\/youtu\.be\/[\w-]{11}/,
    /^https?:\/\/(?:www\.)?youtube\.com\/embed\/[\w-]{11}/,
  ]
  return patterns.some((p) => p.test(url))
}

export function isFileSizeValid(size: number, maxMb: number = 50): boolean {
  return size <= maxMb * 1024 * 1024
}

export function isAllowedFileType(type: string): boolean {
  const allowed = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'video/mp4',
    'text/plain',
  ]
  return allowed.includes(type)
}
