import { describe, it, expect } from 'vitest'
import { extractYouTubeVideoId, getYouTubeEmbedUrl } from '../youtube'

describe('extractYouTubeVideoId', () => {
  it('extracts from standard watch URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from youtu.be URL', () => {
    expect(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from embed URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe('dQw4w9WgXcQ')
  })

  it('extracts from shorts URL', () => {
    expect(extractYouTubeVideoId('https://www.youtube.com/shorts/abc123def45')).toBe('abc123def45')
  })

  it('returns null for invalid URL', () => {
    expect(extractYouTubeVideoId('https://example.com')).toBeNull()
  })
})

describe('getYouTubeEmbedUrl', () => {
  it('generates correct embed URL', () => {
    expect(getYouTubeEmbedUrl('dQw4w9WgXcQ')).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ')
  })
})
