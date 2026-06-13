# EduLearn - Serverless Learning Management System

A production-ready, serverless LMS built with **Next.js 16**, **TypeScript**, and **Firebase**. Zero VPS required - fully hosted on Firebase free tier.

## Architecture

```
[Browser] → Firebase Hosting (CDN) → Next.js Static SPA
                ↓
         Firebase Services:
         - Auth (Email/Password)
         - Cloud Firestore (NoSQL DB)
         - Cloud Storage (Files/Materials)
         - Analytics (Optional)
```

## Tech Stack

- **Frontend**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Dark/Light mode
- **State**: Zustand (persisted)
- **Backend**: Firebase (Auth, Firestore, Storage, Hosting)
- **Icons**: Lucide React

## Features

### Admin Portal
- Dashboard with platform metrics
- Course CRUD (create, edit, publish, archive)
- Lesson management with YouTube video embedding
- Auto-fetch YouTube metadata (title, thumbnail)
- File uploads (PDF, PPTX, DOCX, ZIP, images)
- Quiz builder (MCQ, True/False, Short Answer)
- Student management
- Analytics dashboard
- Announcement system

### Student Portal
- Browse/search/filter course catalog
- One-click enrollment
- Embedded YouTube player with resume
- Lesson progress tracking
- Downloadable resources
- Quiz system with scoring and retakes
- Certificate of completion
- Bookmark lessons
- Personal notes per lesson
- Discussion/comments with likes and replies
- Dark/light mode

### Security
- Role-based access (admin/student)
- Firestore security rules
- Storage security rules
- Protected routes
- Enrollment-gated content

## Project Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── admin/                  # Admin portal
│   │   ├── dashboard/
│   │   ├── courses/
│   │   ├── lessons/
│   │   ├── quizzes/
│   │   ├── students/
│   │   ├── analytics/
│   │   └── announcements/
│   ├── auth/                   # Authentication pages
│   ├── courses/                # Student course pages
│   ├── dashboard/              # Student dashboard
│   ├── bookmarks/
│   ├── notes/
│   ├── discussions/
│   └── settings/
├── components/
│   ├── ui/                     # Reusable UI primitives
│   ├── layout/                 # App shell (Navbar, Sidebar)
│   ├── shared/                 # Shared components
│   └── ...
├── contexts/                   # React contexts
├── lib/
│   ├── firebase/               # Firebase services
│   └── utils/                  # Helpers
├── models/                     # TypeScript types
└── store/                      # Zustand state
```

## Getting Started

### 1. Clone & Install

```bash
git clone <repo-url>
cd edulearn-lms
npm install
```

### 2. Firebase Setup

1. Create project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** (Email/Password)
3. Create **Cloud Firestore** database
4. Enable **Firebase Storage**
5. Register web app, copy config

### 3. Environment

```bash
cp .env.local.example .env.local
# Fill in your Firebase config values
```

### 4. Run Dev Server

```bash
npm run dev
```

### 5. Create Admin User

1. Register via `/auth/register`
2. In Firestore Console, find `users/{uid}` and set `role: "admin"`

### 6. Build & Deploy

```bash
# Build for production
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

## API Design

All backend logic uses **Firebase Client SDK** directly from the browser. No custom backend API needed.

| Operation | Firebase Service |
|-----------|-----------------|
| Auth | Firebase Auth SDK |
| CRUD | Firestore SDK |
| Files | Firebase Storage SDK |
| Analytics | Firebase Analytics |

## Cost

**$0/month** on Firebase free tier for up to:
- 50K monthly active users (Auth)
- 50K reads/day, 20K writes/day (Firestore)
- 5GB storage, 1GB download/day (Storage)
- 10GB hosting bandwidth

## Database Collections

- `users` - Student/admin profiles
- `courses` - Course catalog
- `lessons` - Course lessons with YouTube links
- `enrollments` - Student enrollments & progress
- `quizzes` - Quiz configurations
- `quizAttempts` - Student quiz results
- `certificates` - Issued certificates
- `discussions` - Comments & replies
- `announcements` - Platform announcements
- `notifications` - User notifications
- `notes` - Student personal notes
- `bookmarks` - Saved bookmarks

## License

MIT
