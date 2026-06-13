# Deployment Guide

## Architecture

```
[Browser] → Vercel (Next.js SSR)     ←→  Firebase Auth
                ↓                         Firebase Firestore
            Next.js Edge/Servers            Firebase Storage
                                           Firebase Analytics
```

**Recommended**: Vercel (free Hobby tier) for hosting + Firebase for backend services.

## Option A: Vercel (Recommended, Free)

Vercel supports Next.js SSR natively — dynamic routes, API routes, and ISR all work out of the box.

### Steps

1. Push to GitHub:
   ```bash
   git init && git add . && git commit -m "initial commit"
   gh repo create edulearn-lms --public --push
   ```

2. Import to Vercel:
   - Go to [vercel.com](https://vercel.com/new)
   - Import the repo
   - Framework: **Next.js** (auto-detected)
   - Environment variables: add all `NEXT_PUBLIC_FIREBASE_*` vars
   - Deploy

3. Set up custom domain (optional):
   - Vercel Project → Domains → Add your domain

### Cost: **$0/month** (Vercel Hobby + Firebase Spark)

## Option B: Firebase App Hosting (SSR)

Firebase App Hosting supports Next.js SSR. It's in preview but works for production.

```bash
firebase init apphosting
# Select your Firebase project
# It will create a Cloud Build pipeline
```

## Option C: Firebase Hosting (Static SPA)

For static export, dynamic routes (ƒ) fall back to client-side rendering via SPA rewrites.

1. Configure `next.config.ts`:
   ```ts
   const nextConfig = {
     output: 'export',
     images: { unoptimized: true },
   }
   ```

2. Add `generateStaticParams` exports to all dynamic route layout files.

3. Build and deploy:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Environment Variables

Required in `.env.local`:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Initial Setup

1. **Firebase Project**: Create at [console.firebase.google.com](https://console.firebase.google.com)
2. **Auth**: Enable Email/Password sign-in
3. **Firestore**: Create database (start in test mode)
4. **Storage**: Enable (start in test mode)
5. **Admin user**: Register via app → set `role: "admin"` in Firestore `users/{uid}`

## Cost Breakdown (Free Tier)

| Service | Limit | Monthly Cost |
|---------|-------|-------------|
| Vercel Hobby | 100GB bandwidth, 6000 build min | $0 |
| Firebase Auth | 50K MAU | $0 |
| Firestore | 10GB, 50K reads/day | $0 |
| Storage | 5GB, 1GB download/day | $0 |
| **Total** | | **$0/month** |
