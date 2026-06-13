export function extractYouTubeVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
    /(?:youtube\.com\/shorts\/)([^?]+)/,
  ]
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  return null
}

export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
}

export function getYouTubeThumbnailMedium(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

export async function fetchYouTubeMetadata(videoId: string) {
  try {
    const response = await fetch(
      `https://noembed.com/embed?url=https://www.youtube.com/watch?v=${videoId}`
    )
    const data = await response.json()
    return {
      title: data.title || null,
      authorName: data.author_name || null,
      duration: null,
      thumbnail: getYouTubeThumbnailUrl(videoId),
    }
  } catch {
    return {
      title: null,
      authorName: null,
      duration: null,
      thumbnail: getYouTubeThumbnailUrl(videoId),
    }
  }
}
