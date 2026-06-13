import { describe, it, expect } from 'vitest'
import { isValidEmail, isValidPassword, isValidYouTubeUrl, isFileSizeValid } from '../validation'

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })

  it('returns false for email without @', () => {
    expect(isValidEmail('invalid')).toBe(false)
  })

  it('returns false for empty string', () => {
    expect(isValidEmail('')).toBe(false)
  })
})

describe('isValidPassword', () => {
  it('returns true for 8+ characters', () => {
    expect(isValidPassword('password123')).toBe(true)
  })

  it('returns false for short password', () => {
    expect(isValidPassword('short')).toBe(false)
  })
})

describe('isValidYouTubeUrl', () => {
  it('accepts standard youtube.com URLs', () => {
    expect(isValidYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
  })

  it('accepts youtu.be short URLs', () => {
    expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
  })

  it('accepts embed URLs', () => {
    expect(isValidYouTubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(true)
  })

  it('rejects non-YouTube URLs', () => {
    expect(isValidYouTubeUrl('https://example.com')).toBe(false)
  })
})

describe('isFileSizeValid', () => {
  it('returns true for files under limit', () => {
    expect(isFileSizeValid(1024 * 1024, 50)).toBe(true)
  })

  it('returns false for files over limit', () => {
    expect(isFileSizeValid(100 * 1024 * 1024, 50)).toBe(false)
  })
})
