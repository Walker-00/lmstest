# Testing Strategy

## Testing Pyramid

```
     / \
    / E2E \
   /--------\
  /Integration\
 /--------------\
/   Unit Tests   \
/------------------\
```

## Unit Tests

### Framework: Vitest + React Testing Library

### Location: `__tests__/` directories co-located with components

### Test categories:
1. **Utils & Helpers** - `src/lib/utils/*.test.ts`
2. **Firebase Services** - `src/lib/firebase/*.test.ts`
3. **React Hooks** - `src/hooks/*.test.ts`
4. **Context Providers** - `src/contexts/*.test.tsx`
5. **UI Components** - `src/components/ui/*.test.tsx`

### Example test:

```typescript
// src/lib/utils/__tests__/validation.test.ts
import { isValidEmail, isValidYouTubeUrl } from '../validation'

describe('isValidEmail', () => {
  it('returns true for valid email', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
  })
  it('returns false for invalid email', () => {
    expect(isValidEmail('invalid')).toBe(false)
  })
})

describe('isValidYouTubeUrl', () => {
  it('accepts standard YouTube URLs', () => {
    expect(isValidYouTubeUrl('https://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true)
  })
  it('accepts shortened youtu.be URLs', () => {
    expect(isValidYouTubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true)
  })
  it('rejects non-YouTube URLs', () => {
    expect(isValidYouTubeUrl('https://example.com')).toBe(false)
  })
})
```

## Integration Tests

### Firestore Rules Testing

Use Firebase Emulator Suite:

```bash
firebase emulators:start --only firestore,auth
```

Test rules with `@firebase/rules-unit-testing`:

```typescript
import { assertFails, assertSucceeds, initializeTestEnvironment } from '@firebase/rules-unit-testing'

describe('Firestore Rules', () => {
  it('students cannot create courses', async () => {
    // Test that a student auth context fails when trying to write to courses
  })
  
  it('admins can publish courses', async () => {
    // Test that admin auth context succeeds in writing courses
  })
})
```

## E2E Tests

### Framework: Playwright or Cypress

### Key Flows:
1. **Authentication Flow** - Register, login, logout, password reset
2. **Admin Flow** - Create course, add lesson, publish, create quiz
3. **Student Flow** - Browse courses, enroll, watch video, take quiz
4. **Certificate Flow** - Complete course, receive certificate

### Example Cypress test:

```typescript
describe('Student Enrollment', () => {
  it('allows student to browse and enroll in a course', () => {
    cy.login('student@test.com', 'password123')
    cy.visit('/courses')
    cy.contains('Introduction to React').click()
    cy.contains('Enroll Now').click()
    cy.url().should('include', '/learn')
    cy.contains('Lesson 1').should('be.visible')
  })
})
```

## Running Tests

```bash
# Unit tests
npm run test

# Test with coverage
npm run test:coverage

# Integration tests (with emulators)
npm run test:integration

# E2E tests
npm run test:e2e
```

## CI/CD Pipeline

Tests run automatically on:
- Every PR to main branch
- Every push to main branch

### GitHub Actions:

```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
      - run: npm ci
      - run: npm run lint
      - run: npm run test
      - run: npm run build
```

## Manual Testing Checklist

### Auth
- [ ] Register with email/password
- [ ] Login with valid credentials
- [ ] Login with wrong password (shows error)
- [ ] Password reset flow
- [ ] Protected routes redirect to login

### Admin (role-based)
- [ ] Create course with all fields
- [ ] Edit course details
- [ ] Add lesson with YouTube URL
- [ ] Auto-fetch YouTube metadata
- [ ] Upload attachments (PDF, images, etc.)
- [ ] Publish/unpublish course
- [ ] Create quiz with multiple question types
- [ ] View analytics dashboard
- [ ] Manage students list
- [ ] Create announcements

### Student
- [ ] Browse course catalog
- [ ] Filter/search courses
- [ ] Enroll in course
- [ ] Watch YouTube video lesson
- [ ] Mark lesson complete
- [ ] Track progress
- [ ] Download attachments
- [ ] Take quiz and get results
- [ ] View certificate
- [ ] Bookmark lessons
- [ ] Create and edit notes
- [ ] Post comments/discussions
- [ ] Like and reply to comments
- [ ] Dark/light mode toggle
