import { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'student'

export interface AppUser {
  uid: string
  email: string
  displayName: string
  photoURL?: string | null
  role: UserRole
  createdAt: Timestamp
  lastLogin: Timestamp
  isActive: boolean
}

export interface Course {
  id: string
  title: string
  description: string
  thumbnail?: string
  category: CourseCategory
  difficulty: CourseDifficulty
  tags: string[]
  instructorId: string
  instructorName: string
  status: CourseStatus
  enrolledCount: number
  averageRating: number
  totalLessons: number
  totalDuration: number
  createdAt: Timestamp
  updatedAt: Timestamp
  publishedAt?: Timestamp
}

export type CourseCategory =
  | 'programming'
  | 'design'
  | 'business'
  | 'marketing'
  | 'data-science'
  | 'ai-ml'
  | 'mobile-dev'
  | 'web-dev'
  | 'devops'
  | 'cybersecurity'
  | 'cloud'
  | 'other'

export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced' | 'all-levels'

export type CourseStatus = 'draft' | 'published' | 'archived'

export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  youtubeUrl: string
  youtubeVideoId: string
  duration: number
  order: number
  attachments: Attachment[]
  isFree: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Attachment {
  name: string
  url: string
  type: string
  size: number
}

export interface Enrollment {
  id: string
  userId: string
  courseId: string
  enrolledAt: Timestamp
  completedLessons: string[]
  currentLessonId?: string
  progress: number
  completedAt?: Timestamp
  certificateIssued: boolean
  certificateId?: string
  lastAccessedAt: Timestamp
}

export interface Quiz {
  id: string
  courseId: string
  lessonId: string
  title: string
  description: string
  timeLimit?: number
  passingScore: number
  maxAttempts: number
  questions: QuizQuestion[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface QuizQuestion {
  id: string
  type: 'multiple-choice' | 'true-false' | 'short-answer'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  points: number
  explanation?: string
}

export interface QuizAttempt {
  id: string
  userId: string
  quizId: string
  courseId: string
  answers: Record<string, string | string[]>
  score: number
  totalPoints: number
  passed: boolean
  startedAt: Timestamp
  completedAt: Timestamp
  attemptNumber: number
}

export interface Certificate {
  id: string
  certificateId: string
  userId: string
  courseId: string
  courseTitle: string
  studentName: string
  instructorName: string
  issuedAt: Timestamp
  qrCodeUrl: string
  verificationUrl: string
}

export interface Discussion {
  id: string
  courseId: string
  lessonId: string
  userId: string
  userName: string
  userPhoto?: string
  content: string
  parentId?: string | null
  likes: number
  likedBy: string[]
  isModerated: boolean
  isFlagged: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Announcement {
  id: string
  title: string
  content: string
  courseId?: string
  targetRole: 'all' | 'students' | 'admin'
  createdBy: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  link?: string
  read: boolean
  createdAt: Timestamp
}

export type NotificationType =
  | 'new-course'
  | 'new-lesson'
  | 'announcement'
  | 'quiz-result'
  | 'certificate'
  | 'enrollment'
  | 'comment-reply'

export interface Note {
  id: string
  userId: string
  courseId: string
  lessonId: string
  content: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface Bookmark {
  id: string
  userId: string
  courseId: string
  lessonId: string
  createdAt: Timestamp
}

export interface AnalyticsEvent {
  id: string
  eventType: string
  userId?: string
  courseId?: string
  lessonId?: string
  metadata: Record<string, unknown>
  timestamp: Timestamp
}
