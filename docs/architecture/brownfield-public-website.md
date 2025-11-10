# EzLift Public Website - Brownfield Architecture

**Document Version**: 1.0  
**Created**: 2025-01-10  
**Architect**: Winston  
**Status**: Initial Architecture Documentation

---

## Executive Summary

This document captures the **current state** of the EzLift public website (ezlift.app) as a brownfield architecture reference. The public website serves as the marketing and content platform, providing SEO/AEO-optimized pages, blog content, and a comprehensive exercise library - all without requiring authentication.

**Purpose**: Baseline architecture for planning the secure web app, identifying shared components, and understanding integration constraints.

**Scope**: Public-facing website only (no authenticated web app areas)

---

## Table of Contents

1. [Introduction](#introduction)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Data Sources & Integrations](#data-sources--integrations)
5. [Authentication & Session Management](#authentication--session-management)
6. [Component Architecture](#component-architecture)
7. [Routing & Middleware](#routing--middleware)
8. [Performance & Optimization](#performance--optimization)
9. [Security Considerations](#security-considerations)
10. [Deployment & Infrastructure](#deployment--infrastructure)
11. [Shared Components for Web App](#shared-components-for-web-app)
12. [Technical Debt & Constraints](#technical-debt--constraints)

---

## Introduction

### Project Context

**EzLift Public Website** is a Next.js-based marketing and content platform that:
- Provides information about the EzLift mobile app
- Hosts a blog with fitness content (Contentful CMS)
- Offers a comprehensive searchable exercise library (PostgreSQL + S3 + Contentful)
- Handles user authentication (Firebase) for future web app access
- Serves as the entry point for user acquisition and conversion

**Current State**:
- ✅ Production-ready public website live at ezlift.app
- ✅ Firebase authentication integrated
- ✅ Exercise library with 1000+ exercises, images, and instructional content
- ✅ Blog powered by Contentful CMS
- ✅ Deployed on Netlify with SSR/ISR support
- 🚧 Secure web app area exists but is placeholder-only (`/app` route)

### Relationship to Existing Systems

**Backend Integration**:
- Uses shared backend API at `https://ezlift-server-production.fly.dev`
- Backend serves iOS, Android, and Web clients
- Firebase token verification endpoint: `POST /verify`

**Mobile App Relationship**:
- Web and mobile share same backend and Firebase auth
- Exercise library data shared across platforms
- User accounts work across web and mobile seamlessly

---

## Technology Stack

### Frontend Framework

**Core**:
- **Next.js**: 15.1.2 (App Router, React Server Components)
- **React**: 18.2.0
- **TypeScript**: 5.2.2

**Why Next.js 15 App Router**:
- Server-side rendering (SSR) for SEO
- Incremental Static Regeneration (ISR) for blog/exercise pages
- File-based routing with layouts
- API routes for backend proxy
- Middleware for authentication guards

### UI Libraries

**Component Library**:
- **shadcn/ui**: Radix-based accessible component primitives
- **Radix UI**: ~20 primitive components (Dialog, Dropdown, Toast, etc.)
- **Tailwind CSS**: 3.3.3 (utility-first styling)
- **Tailwind Plugins**:
  - `@tailwindcss/typography` - Blog content styling
  - `tailwindcss-animate` - Animation utilities
  - `@tailwindcss/line-clamp` - Text truncation

**Animation**:
- **Framer Motion**: 11.0.8 (scroll animations, page transitions)

**Icons**:
- **Lucide React**: 0.446.0 (icon library)

### Data & Content Management

**CMS**:
- **Contentful**: 10.6.21 (headless CMS for blog and exercise content)
- **Rich Text Rendering**: `@contentful/rich-text-react-renderer` 15.19.4

**Database**:
- **PostgreSQL**: Via `pg` 8.16.3 (connection pooling)
- **Exercise database** accessed directly (read-only queries)

**Media Storage**:
- **AWS S3**: SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`)
- Signed URLs with 1-hour expiration

### Authentication

**Firebase**:
- **Firebase Client SDK**: 10.14.1 (auth only, no Firestore)
- **Firebase Admin SDK**: 12.7.0 (server-side token verification)
- **Providers**: Email/Password, Google, Apple Sign-In

### State Management & Data Fetching

**Current Approach**:
- Server Components for initial data (SSR)
- Client Components for interactivity
- **No global state library** (React state + URL params)
- **No React Query/SWR yet** (to be added for web app)

### Form Handling

- **React Hook Form**: 7.53.0
- **Zod**: 3.24.1 (schema validation)
- **Resolvers**: `@hookform/resolvers` 3.9.0

### Utilities

**CSV Parsing** (for future import):
- *(Not yet implemented on web, will use PapaParse like mobile)*

**Date Handling**:
- **date-fns**: 3.6.0

**HTTP Client**:
- **Axios**: 1.7.9 (for backend API calls)

**Search**:
- *(Exercise search handled via PostgreSQL queries, no client-side search library yet)*

**Spam Detection**:
- **bad-words**: 4.0.0
- **sanitize-html**: 2.14.0
- **spam-detection**: 1.0.3

### Build & Development Tools

**Package Manager**: npm (lock file present)

**Build Tools**:
- **TypeScript Compiler**: 5.2.2
- **TSX**: 4.19.2 (for build scripts)
- **Next Sitemap**: 4.2.3 (sitemap generation)

**Deployment**:
- **Netlify Functions**: 3.0.0
- **@netlify/plugin-nextjs**: (specified in netlify.toml)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Users (Browser)                           │
│              Desktop | Mobile Web | Tablet                   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Netlify Edge (CDN)                          │
│          SSL/TLS | Headers | Caching | Routing              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              Next.js 15 Application                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Public     │  │  Auth Pages  │  │  Protected   │      │
│  │   Pages      │  │  /login      │  │  /app        │      │
│  │   SSR/ISR    │  │  /signup     │  │  (Placeholder)│     │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│                                                               │
│  ┌──────────────────────────────────────────────────┐       │
│  │            Middleware (Route Protection)          │       │
│  │  - Check session cookies                          │       │
│  │  - Redirect logic (auth ↔ protected)             │       │
│  └──────────────────────────────────────────────────┘       │
└────────────────────────┬────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┬────────────────┐
        ▼                ▼                ▼                ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│  PostgreSQL  │ │  Contentful  │ │   AWS S3     │ │   Backend    │
│  (Exercises) │ │  (Blog CMS)  │ │  (Media)     │ │   API        │
│  Read-only   │ │  Delivery    │ │  Signed URLs │ │  (Firebase)  │
└──────────────┘ └──────────────┘ └──────────────┘ └──────────────┘
```

### Application Layers

**1. Presentation Layer** (React Components)
- Server Components (SSR, data fetching)
- Client Components (interactivity, state)
- Layouts (nested, persistent UI)

**2. Routing Layer** (Next.js App Router)
- File-based routing under `app/`
- Route groups for organization
- Middleware for protection

**3. Data Layer** (Multiple sources)
- PostgreSQL service (exercise data)
- Contentful client (blog/content)
- S3 service (media with signed URLs)
- Backend API client (auth verification)

**4. Infrastructure Layer** (Netlify + CDN)
- SSR/ISR rendering
- Edge caching
- Security headers
- Deployment automation

---

## Data Sources & Integrations

### 1. PostgreSQL (Exercise Database)

**Purpose**: Primary exercise library data source

**Location**: `lib/services/database.ts`

**Connection**:
```typescript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false  // For managed DB (Fly.io, etc.)
  }
});
```

**SSL Strategy**:
- Local development: No SSL
- Production or `sslmode=require` in URL: SSL enabled automatically

**Tables Accessed** (Read-Only):
- `exercise` - Exercise definitions (id, name, aliases, muscle groups, etc.)
- Potentially others for filtering/facets

**Query Patterns**:
```typescript
// List exercises with pagination
SELECT id, name, aliases, "primaryMuscleGroup", "exerciseType", instructions, difficulty
FROM exercise
WHERE name ILIKE $1 OR aliases ILIKE $1
ORDER BY name
LIMIT $2 OFFSET $3;

// Get single exercise
SELECT * FROM exercise WHERE id = $1;
```

**Service**: `lib/services/exercise-data.ts`
- Orchestrates PostgreSQL + S3 + Contentful
- Returns enriched exercise objects

---

### 2. Contentful CMS

**Purpose**: Blog posts and exercise instructional content

**Location**: `lib/contentful.ts`

**Client Setup**:
```typescript
import { createClient } from 'contentful';

const client = createClient({
  space: process.env.CONTENTFUL_SPACE_ID!,
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN!,
  environment: process.env.CONTENTFUL_ENVIRONMENT || 'master'
});
```

**Content Types**:

**Blog Posts**:
- Entry type: `blogPost`
- Fields: `title`, `slug`, `content` (rich text), `publishedDate`, `author`, `excerpt`
- Fetchers:
  - `getBlogPosts()` - List all with pagination
  - `getBlogPostSlugs()` - For static path generation
  - `getBlogPostBySlug(slug)` - Single post

**Exercise Content**:
- Entry type: `exerciseContent`
- Fields: `exerciseId` (links to PostgreSQL), `howTo` (rich text), `tips`, `commonMistakes`
- Fetcher: `getExerciseContent(exerciseId)` or `getExerciseContentBySlug(slug)`

**Rich Text Rendering**:
- Component: `components/blog/RichTextRenderer.tsx`
- Uses `@contentful/rich-text-react-renderer`
- Custom node renderers for embedded assets, code blocks, etc.

**Revalidation Strategy**:
- Blog list page: ISR with 1-hour revalidation (`revalidate: 3600`)
- Individual blog posts: On-demand revalidation
- Exercise content: Cached in exercise API responses

---

### 3. AWS S3 (Exercise Media)

**Purpose**: Host exercise images and video demonstrations

**Location**: `lib/services/s3.ts`

**Client Setup**:
```typescript
import { S3Client, HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const s3Client = new S3Client({
  credentials: {
    accessKeyId: process.env.EZLIFT_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.EZLIFT_AWS_SECRET_ACCESS_KEY!
  },
  region: process.env.EZLIFT_AWS_REGION!
});
```

**Media Conventions**:
- **Images**: `images/{exerciseId}.png`
- **Videos**: `videos/{exerciseId}.mp4` or `.gif`
- **Bucket**: `process.env.EZLIFT_AWS_S3_BUCKET_NAME`

**Signed URL Strategy**:
- Generate signed URLs with 1-hour expiration
- Check object existence before signing (HeadObject)
- Return `null` if media doesn't exist (graceful degradation)

**Integration with Exercise Data**:
```typescript
// lib/services/exercise-data.ts
async function enrichWithMedia(exercise) {
  const image = await getExerciseImage(exercise.id);
  const video = await getExerciseVideo(exercise.id);
  return { ...exercise, imageUrl: image, videoUrl: video };
}
```

---

### 4. Backend API (EzLift Server)

**Base URL**: `https://ezlift-server-production.fly.dev`

**Current Integration**:

**Firebase Token Verification**:
- Endpoint: `POST /verify`
- Purpose: Validate Firebase ID tokens, create user if first login
- Request: `{ token: string }`
- Response: `{ success: boolean, data: { email: string } }`
- Used by: `lib/auth/session.ts` → `verifyWithBackend()`

**What Backend Does on First Login**:
1. Verify Firebase token with Admin SDK
2. Create UserProfile in PostgreSQL if not exists
3. Create default UserSettings
4. Create default Routine ("Default routine")
5. **Write to Changes table** for settings + routine
6. Return success

**Development Mode** (`AUTH_DEV_MODE=true`):
- Skips backend verification
- Decodes JWT client-side only
- For local development without backend access

---

## Authentication & Session Management

### Firebase Authentication

**Providers Configured**:
- Email/Password (native)
- Google OAuth
- Apple Sign-In (with popup + redirect fallback)

**Client Initialization**: `lib/firebase/client.ts`
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  // ... other config
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
```

**Validation on Init**:
- Throws error if any `NEXT_PUBLIC_FIREBASE_*` env vars missing
- Prevents app from starting with misconfigured auth

### Session Cookie Flow

**Authentication Process**:
```
1. User signs in with Firebase (client-side)
   ↓
2. Firebase returns ID token (JWT)
   ↓
3. Client calls POST /api/auth/session { idToken }
   ↓
4. Server verifies token with backend (/verify endpoint)
   ↓
5. Server sets HttpOnly cookies:
   - session-token (JWT/session ID)
   - user-info (non-sensitive summary)
   ↓
6. Client redirects to /app (protected route)
   ↓
7. Middleware reads cookies, allows access
```

**Session API**: `app/api/auth/session/route.ts`

**Endpoints**:
- `POST /api/auth/session` - Create session (sets cookies)
- `DELETE /api/auth/session` - Logout (clears cookies)
- `GET /api/auth/session` - Validate session

**Cookie Configuration**:
```typescript
// lib/auth/session.ts - setSessionCookies()
{
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 60 * 60 * 24 * 7,  // 7 days
  path: '/'
}
```

**Server-Side Session Helpers**: `lib/auth/guards.ts`
- `requireUser()` - Throws if not authenticated
- `isAuthenticated()` - Returns boolean
- `getUserFromCookies()` - Extracts user info from cookies

---

## Component Architecture

### Component Organization

**Structure**:
```
components/
├── animations/
│   ├── FadeIn.tsx (reusable fade-in animation)
│   └── ScrollAnimation.tsx (intersection observer animations)
├── auth/
│   ├── LoginForm.tsx (email/password + social)
│   ├── SignupForm.tsx (email/password + social)
│   ├── ForgotPasswordForm.tsx (password reset)
│   └── LogoutButton.tsx (sign out + clear session)
├── blog/
│   ├── BlogCard.tsx (post preview card)
│   ├── BlogPostContent.tsx (full post with rich text)
│   ├── BlogSidebar.tsx (categories, recent posts)
│   └── RichTextRenderer.tsx (Contentful rich text → React)
├── brand/
│   └── Logo.tsx (SVG logo component)
├── cards/
│   ├── BlogCard.tsx
│   ├── FeatureCard.tsx (marketing feature cards)
│   ├── PricingCard.tsx (subscription tiers)
│   ├── TeamMemberCard.tsx (about page)
│   └── TestimonialCard.tsx (social proof)
├── cookies/
│   └── CookieBanner.tsx (GDPR compliance)
├── exercise/
│   ├── ExerciseCard.tsx (grid item with image)
│   ├── ExerciseFilters.tsx (SSR filter controls)
│   ├── ExerciseFiltersClient.tsx (client-side filter state)
│   ├── ExerciseLibraryClient.tsx (main client wrapper)
│   ├── DebouncedSearchInput.tsx (search with debounce)
│   ├── PaginationClient.tsx (pagination controls)
│   └── ExerciseErrorBoundary.tsx (error handling)
├── features/
│   └── FeatureIcon.tsx (icon backgrounds for features)
├── forms/
│   ├── ContactForm.tsx (contact page with hCaptcha)
│   └── AndroidWaitListForm.tsx (pre-launch signup)
├── layout/
│   ├── Header.tsx (site navigation)
│   └── Footer.tsx (site footer with links)
├── sections/
│   ├── Hero.tsx (landing hero section)
│   ├── Features.tsx (marketing features grid)
│   ├── Pricing.tsx (subscription tiers)
│   ├── Testimonials.tsx (user reviews)
│   └── CTASection.tsx (call-to-action sections)
├── theme/
│   └── ThemeProvider.tsx (next-themes wrapper)
├── ui/ (shadcn/ui primitives)
│   ├── button.tsx
│   ├── card.tsx
│   ├── dialog.tsx
│   ├── input.tsx
│   ├── select.tsx
│   ├── toast.tsx
│   └── ... (40+ primitive components)
└── GoogleAnalytics.tsx (GA4 integration)
```

### Shared Components for Web App 🔗

**Components that will be reused in secure web app**:

**UI Primitives** (all of `components/ui/`):
- ✅ `button.tsx` - Button component (variants: default, outline, ghost, etc.)
- ✅ `card.tsx` - Card container (used for dashboard cards)
- ✅ `input.tsx` - Form inputs
- ✅ `select.tsx` - Dropdown selects
- ✅ `dialog.tsx` - Modal dialogs
- ✅ `toast.tsx` + `toaster.tsx` - Notifications
- ✅ `skeleton.tsx` - Loading states (for dashboard cards)
- ✅ `table.tsx` - Data tables (for history list)
- ✅ `tabs.tsx` - Tab navigation
- ✅ `pagination.tsx` - Pagination controls (reuse for history)
- ✅ Many others...

**Feature Components**:
- ✅ `exercise/ExerciseCard.tsx` - **Critical for Program Builder** (visual exercise selection)
- ✅ `exercise/DebouncedSearchInput.tsx` - **Reuse in Program Builder** (exercise search)
- ✅ `exercise/ExerciseFilters.tsx` - **Reuse in Program Builder** (muscle group filters)
- ✅ `brand/Logo.tsx` - Branding consistency
- ✅ `animations/FadeIn.tsx` - Smooth transitions
- ✅ `animations/ScrollAnimation.tsx` - Page transitions

**Auth Components** (already ready for web app):
- ✅ `auth/LoginForm.tsx`
- ✅ `auth/SignupForm.tsx`
- ✅ `auth/LogoutButton.tsx`
- ✅ `auth/ForgotPasswordForm.tsx`

**Layout Components**:
- ⚠️ `layout/Header.tsx` - May need different nav for authenticated vs public
- ⚠️ `layout/Footer.tsx` - May be lighter in web app

---

## Routing & Middleware

### Public Routes (No Auth Required)

**Marketing Pages**:
- `/` - Landing page (Hero, Features, Pricing, Testimonials, CTA)
- `/about` - About us, team, mission
- `/contact` - Contact form (Google Forms integration)
- `/android` - Android waitlist signup

**Content Pages**:
- `/blog` - Blog post list (ISR, revalidates hourly)
- `/blog/[slug]` - Individual blog post (ISR, on-demand revalidation)
- `/exercise-library` - Exercise list with search/filters (SSR with client enhancements)
- `/exercise-library/[id]` - Exercise detail page (SSR)

**Legal Pages** (Route group):
- `/(legal)/privacy` - Privacy policy
- `/(legal)/terms` - Terms of service
- `/(legal)/cookies` - Cookie policy
- `/(legal)/eula` - End user license agreement

**Auth Pages** (Public, but redirect if already logged in):
- `/login` - Login form
- `/signup` - Signup form
- `/forgot-password` - Password reset

### Protected Routes (Auth Required)

**Web App Area**:
- `/app` - Dashboard (placeholder currently)
- `/dashboard` - Dashboard (alias/future)
- `/profile` - User profile
- `/settings` - User settings
- `/workouts` - Workout management
- `/progress` - Progress tracking

**Middleware Protection**: `middleware.ts`
```typescript
const protectedRoutes = ['/app', '/dashboard', '/profile', '/settings', '/workouts', '/progress'];
const authRoutes = ['/login', '/signup', '/forgot-password'];

// Logic:
// - protectedRoute + !authenticated → redirect to /login?redirect={pathname}
// - authRoute + authenticated → redirect to /app
```

### API Routes

**Auth**:
- `POST /api/auth/session` - Create session from Firebase token
- `DELETE /api/auth/session` - Logout
- `GET /api/auth/session` - Validate session

**Data**:
- `GET /api/exercises` - Exercise list (proxy to PostgreSQL + S3 + Contentful)

---

## Exercise Library Architecture (Deep Dive)

### SSR + Client Hybrid Pattern

**Why This Matters**: This pattern will be reused for dashboard data fetching in web app.

**Server-Side** (`app/exercise-library/page.tsx`):
```typescript
export default async function ExerciseLibraryPage({
  searchParams
}: {
  searchParams: { search?: string; page?: string; /* filters */ }
}) {
  // 1. Parse URL params (SSR)
  const search = searchParams.search || '';
  const page = parseInt(searchParams.page || '1');
  
  // 2. Fetch data server-side
  const { exercises, total } = await getExercises({ 
    search, 
    page, 
    limit: 24 
  });
  
  // 3. Render with data (SSR, SEO-friendly)
  return (
    <ExerciseLibraryClient
      initialExercises={exercises}
      initialTotal={total}
      initialSearch={search}
      initialPage={page}
    />
  );
}
```

**Client-Side** (`components/exercise/ExerciseLibraryClient.tsx`):
```typescript
'use client';

export function ExerciseLibraryClient({ 
  initialExercises, 
  initialTotal, 
  initialSearch,
  initialPage 
}) {
  // State mirrors URL params
  const [exercises, setExercises] = useState(initialExercises);
  const [search, setSearch] = useState(initialSearch);
  
  // Debounced search
  const debouncedSearch = useDebouncedSearch(search);
  
  // Update URL when filters change (client-side navigation)
  useEffect(() => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set('search', debouncedSearch);
    if (page > 1) params.set('page', page.toString());
    router.push(`?${params.toString()}`, { scroll: false });
  }, [debouncedSearch, page]);
  
  // Render grid
  return (
    <>
      <DebouncedSearchInput value={search} onChange={setSearch} />
      <ExerciseGrid exercises={exercises} />
      <Pagination page={page} total={total} />
    </>
  );
}
```

**Benefits of This Pattern**:
- ✅ SEO-friendly (SSR with initial data)
- ✅ Fast initial render (no loading spinner)
- ✅ Progressive enhancement (client-side filtering)
- ✅ URL-based state (shareable links)
- ✅ Works without JavaScript (basic functionality)

**This pattern will be used for**:
- ✅ Dashboard cards (SSR initial data, client-side refresh)
- ✅ History list (SSR + client-side pagination)
- ✅ Profile page (SSR + client-side edits)

---

### Debounced Search Implementation

**Hook**: `hooks/useDebouncedSearch.ts`

**Features**:
- Desktop: 250ms delay
- Mobile: 350ms delay (slower typing)
- Minimum 1 character to search
- Clear input → instant reset
- Enter key → bypass debounce (instant search)
- Abort in-flight requests (AbortController)
- LRU cache (20 entries, 10-min TTL) with background revalidation
- IME-safe (respects composition events for Asian languages)

**Component**: `components/exercise/DebouncedSearchInput.tsx`
- Manages input state
- Shows loading indicator during debounce
- Clear button when search active

**Test Coverage**: `__tests__/useDebouncedSearch.test.ts`
- ✅ Debounce timing
- ✅ Abort logic
- ✅ Cache behavior
- ✅ IME handling
- ✅ Edge cases

**Reusable for Web App**:
- ✅ Program Builder exercise search
- ✅ Workout history filtering
- ✅ Any search/filter UI

---

## Performance & Optimization

### Core Web Vitals Targets

**Current Performance** (Public Website):
- LCP (Largest Contentful Paint): < 2.5s (p75)
- INP (Interaction to Next Paint): < 200ms (p75)
- CLS (Cumulative Layout Shift): < 0.1

**Optimization Strategies**:

**Images**:
- Next.js `<Image>` component with optimization
- `unoptimized: true` in config (manual optimization via Contentful/S3)
- WebP format for hero images
- Lazy loading below fold

**Fonts**:
- System fonts (no custom font loading)
- Reduced FOIT (Flash of Invisible Text)

**Code Splitting**:
- Automatic via Next.js App Router
- Client components loaded on-demand
- Route-based splitting

**Incremental Static Regeneration (ISR)**:
- Blog list: 1-hour revalidation
- Exercise pages: On-demand revalidation
- Reduces build time, keeps content fresh

**Caching Strategy**:
- Static assets: CDN cache (Netlify)
- API responses: No caching (dynamic)
- S3 signed URLs: 1-hour cache implicit in signature

---

### SEO Optimization

**Sitemap Generation**:
- Script: `lib/generateSiteMap.ts`
- Runs on build: `npm run generate-sitemap`
- Outputs: `public/sitemap.xml`
- Includes: Blog posts (from Contentful), Exercise pages (from PostgreSQL)

**Metadata**:
- Dynamic per page via Next.js `metadata` export
- Canonical URLs for pagination (`<link rel="canonical" />`)
- Prev/Next links for paginated content

**Structured Data** (JSON-LD):
- Exercise Library: `ItemList` schema + `SearchAction`
- Blog posts: Article schema (in blog post pages)

**Robots.txt**: `app/robots.ts`
```typescript
export default function robots() {
  return {
    rules: { userAgent: '*', allow: '/', disallow: '/app/' },
    sitemap: 'https://ezlift.app/sitemap.xml'
  };
}
```

---

## Security Considerations

### Current Security Measures

**Authentication**:
- ✅ Firebase handles password security (bcrypt, salting)
- ✅ OAuth handled by Google/Apple (no credential storage)
- ✅ Server-side token verification (not just client-side)

**Session Security**:
- ✅ HttpOnly cookies (XSS protection)
- ✅ Secure flag in production (HTTPS only)
- ✅ SameSite: Lax (CSRF mitigation)
- ✅ 7-day expiration (reasonable timeout)

**Database Access**:
- ✅ Read-only PostgreSQL connection
- ✅ Parameterized queries (SQL injection protection)
- ✅ No write operations from web frontend

**External API Security**:
- ✅ S3 signed URLs (no public bucket access)
- ✅ Contentful delivery API tokens (read-only)
- ✅ AWS credentials server-side only (not exposed to client)

**Content Security**:
- ✅ Sanitize user inputs (contact form, comments)
- ✅ Bad word filtering for user-generated content
- ✅ Spam detection on form submissions

**Headers** (via `netlify.toml`):
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "frame-ancestors 'none'"
```

### Security Constraints for Web App

**Must Maintain**:
- ✅ HttpOnly cookies for session
- ✅ Server-side authentication validation
- ✅ No credentials in client-side code
- ✅ HTTPS in production (Netlify enforces)

**Additional Needs for Web App**:
- API rate limiting (not yet implemented)
- CSRF protection for mutations (consider token)
- Input validation on writes
- Audit logging for data changes

---

## Deployment & Infrastructure

### Netlify Configuration

**File**: `netlify.toml`

**Build Settings**:
```toml
[build]
  command = "npm run build"
  publish = ".next"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

**Why Netlify + Next.js Plugin**:
- ✅ SSR support (Netlify Functions for server rendering)
- ✅ ISR support (on-demand regeneration)
- ✅ Automatic cache invalidation
- ✅ Edge deployment (global CDN)
- ✅ Zero-config HTTPS
- ✅ Environment variable management

**Environment Variables** (Netlify dashboard):

**Required**:
- `DATABASE_URL` - PostgreSQL connection string

**Optional (Recommended)**:
- `CONTENTFUL_SPACE_ID`
- `CONTENTFUL_ACCESS_TOKEN`
- `CONTENTFUL_ENVIRONMENT`
- `EZLIFT_AWS_ACCESS_KEY_ID`
- `EZLIFT_AWS_SECRET_ACCESS_KEY`
- `EZLIFT_AWS_REGION`
- `EZLIFT_AWS_S3_BUCKET_NAME`
- `BACKEND_BASE_URL` (defaults to production)
- `AUTH_DEV_MODE` (for development only)

**Firebase (Public)**:
- `NEXT_PUBLIC_FIREBASE_API_KEY`
- `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
- `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `NEXT_PUBLIC_FIREBASE_APP_ID`

### Build Process

**Commands**:
```bash
npm run generate-sitemap  # Generate sitemap from Contentful + DB
npm run build              # Next.js build (SSR + static pages)
npm run start              # Production server (not used on Netlify)
npm run dev                # Local development
```

**Build Output**:
- `.next/` directory
- SSR pages → Netlify Functions
- Static pages → CDN
- API routes → Netlify Functions

### Deployment Strategy

**Current Approach**:
- Git push to `main` → Netlify auto-deploy
- Build runs on Netlify infrastructure
- Environment variables injected at build time
- Atomic deployments (instant rollback capability)

**No CI/CD Pipeline Currently**:
- Optional GitHub Actions setup possible
- Netlify handles build + deploy
- Simple workflow for now

---

## Technical Debt & Constraints

### Known Issues

**Environment Variable Handling**:
- ⚠️ Some variables must be present at **build time** (Next.js inlining)
- Config helper (`lib/config/environment.ts`) reads from `process.env` during build
- Missing build-time vars cause runtime errors

**Graceful Degradation**:
- ✅ Missing Contentful → Empty blog list (not an error)
- ✅ Missing S3 → Exercise cards without images
- ✅ Missing preview token → Only published content shown
- ⚠️ Missing DATABASE_URL → Hard failure (exercises don't load)

**Next.js Configuration**:
- `images.unoptimized = true` - Using manual optimization
- ESLint ignored during builds (may hide issues)

### Constraints for Web App Development

**Must Preserve**:
1. **Public website behavior** - No regressions to marketing pages, blog, exercise library
2. **Auth flow** - Firebase + session cookies pattern
3. **Middleware logic** - Route protection and redirects
4. **Database access** - PostgreSQL connection (read-only from web)
5. **Environment config pattern** - Build-time variable access

**Shared Components**:
- Exercise library components are **production-tested** and should be reused as-is
- UI primitives are already styled and accessible
- Don't rebuild what exists - compose with existing components

**Backend API**:
- ⚠️ Currently optimized for mobile sync pattern (push/pull changes)
- ⚠️ Direct REST endpoints exist but may have gaps
- ⚠️ No aggregation endpoints for stats (compute client-side for MVP)
- ✅ Can POST/PATCH/DELETE workouts, routines, sessions via existing endpoints
- ✅ Will document gaps for future backend improvements

---

## Appendix: File System Reference

### Key Files by Function

**Configuration**:
- `next.config.js` - Next.js configuration
- `tailwind.config.ts` - Tailwind theme customization
- `tsconfig.json` - TypeScript compiler options
- `netlify.toml` - Deployment configuration
- `components.json` - shadcn/ui configuration

**Data Access**:
- `lib/services/database.ts` - PostgreSQL connection and queries
- `lib/services/s3.ts` - AWS S3 client and signed URL generation
- `lib/services/exercise-data.ts` - Exercise data orchestration (DB + S3 + Contentful)
- `lib/contentful.ts` - Contentful CMS client

**Authentication**:
- `lib/firebase/client.ts` - Firebase client initialization
- `lib/auth/session.ts` - Server session cookie management
- `lib/auth/guards.ts` - Server-side auth helpers
- `lib/auth/signInWithApple.ts` - Apple Sign-In with fallback
- `lib/auth/firebaseClient.ts` - Firebase auth helpers
- `app/api/auth/session/route.ts` - Session API endpoints

**Utilities**:
- `lib/utils.ts` - Generic utilities (cn, formatters, etc.)
- `lib/config/environment.ts` - Environment variable access
- `lib/cookies.ts` - Cookie banner state management
- `lib/contentFilters.ts` - Content moderation utilities
- `lib/generateSiteMap.ts` - Sitemap generation script

**Types**:
- `types/exercise.ts` - Exercise data types
- `types/team.ts` - Team member types

**Testing**:
- `__tests__/useDebouncedSearch.test.ts` - Debounce hook tests

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-10 | 1.0 | Initial brownfield architecture documentation | Winston (Architect) |

---

**Next Document**: Full-Stack Web App Architecture (includes MVP Phase 1 + Phase 2 WatermelonDB evolution)



