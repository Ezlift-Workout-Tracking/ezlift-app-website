# Source Tree - EzLift Web App

**Version**: 1.0  
**Last Updated**: 2025-01-10  
**Architect**: Winston

---

## Project Structure

```
ezlift-app-website/
├── app/                          # Next.js App Router (pages & API routes)
│   ├── (legal)/                 # Route group: Legal pages
│   │   ├── cookies/page.tsx
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   └── eula/page.tsx
│   ├── about/page.tsx
│   ├── android/page.tsx          # Android waitlist
│   ├── api/                      # API routes
│   │   ├── auth/
│   │   │   └── session/route.ts # Session management (POST/DELETE/GET)
│   │   └── exercises/route.ts   # Exercise library API
│   ├── app/                      # 🔐 PROTECTED: Secure web app area
│   │   ├── layout.tsx           # 🆕 Authenticated layout (to create)
│   │   ├── page.tsx             # 🆕 Dashboard (to implement)
│   │   ├── programs/            # 🆕 Program management (to create)
│   │   │   ├── page.tsx         # Program list
│   │   │   ├── [id]/page.tsx    # Program detail
│   │   │   └── create/page.tsx  # Program builder
│   │   ├── history/             # 🆕 Workout history (to create)
│   │   │   └── page.tsx
│   │   ├── import/              # 🆕 CSV import (to create)
│   │   │   └── page.tsx
│   │   ├── profile/             # 🆕 Profile management (to create)
│   │   │   └── page.tsx
│   │   └── onboarding/          # 🆕 Onboarding flow (to create)
│   │       ├── [step]/page.tsx
│   │       └── layout.tsx
│   ├── blog/
│   │   ├── page.tsx             # Blog list
│   │   └── [slug]/page.tsx      # Blog post
│   ├── contact/page.tsx
│   ├── exercise-library/
│   │   ├── page.tsx             # Exercise grid (SSR + client)
│   │   └── [id]/page.tsx        # Exercise detail
│   ├── forgot-password/page.tsx
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   ├── layout.tsx                # Root layout (global)
│   ├── page.tsx                  # Home/landing page
│   ├── globals.css               # Global styles
│   └── robots.ts                 # SEO robots config
│
├── components/                   # React components
│   ├── animations/
│   │   ├── FadeIn.tsx           # Fade-in animation
│   │   └── ScrollAnimation.tsx   # Scroll-triggered animations
│   ├── auth/                     # ✅ REUSE: Authentication components
│   │   ├── LoginForm.tsx
│   │   ├── SignupForm.tsx
│   │   ├── ForgotPasswordForm.tsx
│   │   └── LogoutButton.tsx
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogPostContent.tsx
│   │   ├── BlogSidebar.tsx
│   │   └── RichTextRenderer.tsx
│   ├── brand/
│   │   └── Logo.tsx
│   ├── cards/                    # Marketing cards
│   │   ├── FeatureCard.tsx
│   │   ├── PricingCard.tsx
│   │   └── TestimonialCard.tsx
│   ├── cookies/
│   │   └── CookieBanner.tsx
│   ├── exercise/                 # ✅ REUSE: Exercise library components
│   │   ├── ExerciseCard.tsx     # **MUST REUSE in Program Builder**
│   │   ├── DebouncedSearchInput.tsx  # **MUST REUSE**
│   │   ├── ExerciseFilters.tsx  # **MUST REUSE**
│   │   ├── ExerciseLibraryClient.tsx
│   │   ├── PaginationClient.tsx
│   │   └── ExerciseErrorBoundary.tsx
│   ├── dashboard/                # 🆕 Dashboard components (to create)
│   │   ├── DashboardShell.tsx
│   │   ├── DashboardCard.tsx
│   │   ├── TrainingVolumeCard.tsx
│   │   ├── PersonalRecordsCard.tsx
│   │   ├── RecentWorkoutsCard.tsx
│   │   ├── ProgressChartCard.tsx
│   │   └── ActiveProgramCard.tsx
│   ├── programs/                 # 🆕 Program builder (to create)
│   │   └── ProgramBuilder/
│   │       ├── ProgramBuilderShell.tsx
│   │       ├── ExerciseSelector.tsx
│   │       ├── WorkoutEditor.tsx
│   │       └── MetricsPanel.tsx
│   ├── history/                  # 🆕 History components (to create)
│   │   ├── WorkoutHistoryList.tsx
│   │   └── WorkoutHistoryItem.tsx
│   ├── import/                   # 🆕 Import components (to create)
│   │   ├── ImportFlow.tsx
│   │   ├── CsvUploader.tsx
│   │   └── ImportSummary.tsx
│   ├── onboarding/               # 🆕 Onboarding (to create)
│   │   ├── OnboardingShell.tsx
│   │   ├── PersonalInfoStep.tsx
│   │   └── ... (9 steps total)
│   ├── layout/
│   │   ├── Header.tsx            # Public site header
│   │   └── Footer.tsx
│   ├── ui/                       # ✅ REUSE: shadcn/ui primitives (40+ components)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   ├── toast.tsx
│   │   └── ... (40+ more)
│   └── GoogleAnalytics.tsx
│
├── lib/                          # Utilities and services
│   ├── api/                      # 🆕 API client (to create)
│   │   ├── client.ts            # Base API client with auth
│   │   ├── workouts.ts          # Workout API functions
│   │   ├── routines.ts          # Routine API functions
│   │   ├── sessions.ts          # Session API functions
│   │   └── user.ts              # User API functions
│   ├── analytics/                # 🆕 Analytics (to create in Story 1.1)
│   │   ├── tracker.ts           # Unified analytics interface
│   │   └── amplitude.ts         # Amplitude initialization
│   ├── stats/                    # 🆕 Client-side aggregations (to create)
│   │   └── aggregations.ts      # Weekly volume, PRs, progress calculations
│   ├── import/                   # 🆕 CSV import logic (to create)
│   │   └── parser.ts            # PapaParse + MiniSearch integration
│   ├── auth/                     # ✅ EXISTING: Auth helpers
│   │   ├── guards.ts            # Server-side auth guards (requireUser, etc.)
│   │   ├── session.ts           # Session cookie management
│   │   ├── signInWithApple.ts   # Apple Sign-In helpers
│   │   └── firebaseClient.ts    # Firebase client helpers
│   ├── config/
│   │   ├── environment.ts       # Environment variable access
│   │   └── firebase.ts          # Firebase config
│   ├── services/                 # ✅ EXISTING: Data services
│   │   ├── database.ts          # PostgreSQL connection
│   │   ├── s3.ts                # AWS S3 signed URLs
│   │   └── exercise-data.ts     # Exercise data orchestration
│   ├── contentful.ts             # Contentful CMS client
│   ├── utils.ts                  # Generic utilities (cn, etc.)
│   └── ... (other utilities)
│
├── hooks/                        # React hooks
│   ├── api/                      # 🆕 API hooks (to create)
│   │   ├── useWorkouts.ts       # useQuery for workouts
│   │   ├── useRoutines.ts       # useQuery for routines
│   │   ├── useSessions.ts       # useQuery for sessions
│   │   └── useUser.ts           # useQuery for user profile
│   ├── useUserDataState.ts       # 🆕 User data state detection (to create)
│   ├── useDebouncedSearch.ts     # ✅ EXISTING: Debounced search hook
│   └── use-toast.ts              # ✅ EXISTING: Toast notifications
│
├── types/                        # TypeScript type definitions
│   ├── exercise.ts               # ✅ EXISTING
│   ├── workout.ts                # 🆕 To create
│   ├── session.ts                # 🆕 To create
│   ├── routine.ts                # 🆕 To create
│   └── user.ts                   # 🆕 To create
│
├── middleware.ts                 # ✅ EXISTING: Route protection
│
├── docs/                         # 📚 Documentation
│   ├── prd/                      # Product requirements (15 sections)
│   ├── architecture/             # Technical specs
│   │   ├── web-app/             # Sharded architecture (25 sections)
│   │   └── brownfield-public-website.md
│   ├── ux-design-brief.md
│   ├── wireframes.md
│   └── DEVELOPER_SETUP.md
│
├── __tests__/                    # Test files
│   ├── useDebouncedSearch.test.ts
│   └── ... (more tests to be added)
│
├── public/                       # Static assets
│   ├── favicon/
│   ├── images/
│   └── ...
│
├── .env.local                    # Local environment variables (gitignored)
├── .env.example                  # Environment variable template (if created)
├── package.json                  # Dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.ts            # Tailwind config
├── next.config.js                # Next.js config
├── netlify.toml                  # Netlify deployment config
└── middleware.ts                 # Route protection
```

---

## Key Directories Explained

### `app/` (Next.js App Router)
- **Purpose**: All pages and API routes
- **Pattern**: File-based routing
- **Server Components**: Default (use `'use client'` for client components)

### `components/`
- **Purpose**: Reusable React components
- **Organization**: By feature or domain
- **Reuse Strategy**: Use existing components before creating new ones

### `lib/`
- **Purpose**: Utilities, services, and business logic
- **Organization**: By concern (api, auth, analytics, etc.)
- **Pattern**: Pure functions, no UI

### `hooks/`
- **Purpose**: Custom React hooks
- **Pattern**: Prefix with `use` (e.g., `useWorkouts`)
- **Types**: API hooks (React Query), UI hooks (state)

### `types/`
- **Purpose**: Shared TypeScript type definitions
- **Pattern**: One file per domain (workout, session, etc.)

---

## File Naming Conventions

**Components**: PascalCase.tsx
```
DashboardCard.tsx
TrainingVolumeCard.tsx
```

**Utilities**: camelCase.ts
```
client.ts
aggregations.ts
```

**Hooks**: camelCase.ts (prefix with `use`)
```
useWorkouts.ts
useUserDataState.ts
```

**Pages**: page.tsx, layout.tsx, route.ts
```
app/dashboard/page.tsx
app/dashboard/layout.tsx
app/api/workout/route.ts
```

---

## Import Paths

**Absolute Imports** (preferred):
```typescript
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api/client';
import { useWorkouts } from '@/hooks/api/useWorkouts';
```

**Relative Imports** (only when necessary):
```typescript
import { helper } from './helper';
```

---

## Component Organization Pattern

**By Feature** (web app components):
```
components/
├── dashboard/     # Dashboard-specific components
├── programs/      # Program builder components
├── history/       # History page components
├── import/        # Import flow components
└── onboarding/    # Onboarding components
```

**By Domain** (existing):
```
components/
├── auth/          # Authentication
├── exercise/      # Exercise library
├── blog/          # Blog
└── ui/            # Primitives
```

---

## What Exists vs What to Create

### ✅ **Existing** (Reuse These):
- `app/api/auth/session/route.ts` - Session API
- `app/login/page.tsx` - Login page
- `app/signup/page.tsx` - Signup page
- `components/auth/*` - All auth components
- `components/exercise/*` - Exercise library components (**MUST REUSE**)
- `components/ui/*` - All 40+ UI primitives
- `lib/auth/*` - Auth helpers and guards
- `lib/services/*` - Database, S3, Contentful services
- `middleware.ts` - Route protection

### 🆕 **To Create** (New for Web App):
- `app/app/layout.tsx` - Authenticated layout
- `app/app/page.tsx` - Dashboard
- `app/app/programs/` - Program pages
- `app/app/history/` - History page
- `app/app/import/` - Import flow
- `app/app/profile/` - Profile page
- `app/app/onboarding/` - Onboarding flow
- `components/dashboard/*` - Dashboard cards
- `components/programs/*` - Program builder
- `components/history/*` - History components
- `components/import/*` - Import components
- `components/onboarding/*` - Onboarding steps
- `lib/api/*` - API client layer
- `lib/analytics/*` - Analytics wrapper
- `lib/stats/*` - Client-side aggregations
- `lib/import/*` - CSV parsing logic
- `hooks/api/*` - React Query hooks
- `hooks/useUserDataState.ts` - User state detection
- `types/workout.ts` - Workout types
- `types/session.ts` - Session types
- `types/routine.ts` - Routine types

---

## Protected vs Public Routes

### Public Routes (No Auth):
```
/                    # Landing page
/about               # About page
/blog                # Blog list
/blog/[slug]         # Blog post
/exercise-library    # Exercise grid
/exercise-library/[id]  # Exercise detail
/contact             # Contact form
/android             # Android waitlist
/(legal)/*           # Legal pages
```

### Auth Routes (Redirect if logged in):
```
/login               # Login form
/signup              # Signup form
/forgot-password     # Password reset
```

### Protected Routes (Auth Required):
```
/app                 # Dashboard (post-login landing)
/app/programs        # Program list
/app/programs/create # Program builder (new users only!)
/app/history         # Workout history
/app/import          # CSV import
/app/profile         # Profile management
/app/onboarding/*    # Onboarding flow (new users only!)
```

**Protection**: `middleware.ts` enforces auth for `/app` routes

---

## Critical File Locations

### Authentication
- `lib/auth/guards.ts` - Server-side guards (`requireUser()`, `isAuthenticated()`)
- `lib/auth/session.ts` - Cookie management (`setSessionCookies()`, `clearSessionCookies()`)
- `app/api/auth/session/route.ts` - Session API endpoints

### Data Access
- `lib/services/database.ts` - PostgreSQL queries (exercise library)
- `lib/services/s3.ts` - AWS S3 signed URLs
- `lib/contentful.ts` - Contentful CMS client
- `lib/api/client.ts` - **To create**: Backend API client

### Configuration
- `lib/config/environment.ts` - Environment variable access
- `lib/config/firebase.ts` - Firebase configuration
- `.env.local` - Local environment variables (not committed)

### Utilities
- `lib/utils.ts` - Generic utilities (`cn()`, etc.)
- `hooks/useDebouncedSearch.ts` - Debounced search (250ms desktop, 350ms mobile)
- `hooks/use-toast.ts` - Toast notifications

---

## Environment Variables

**Required Files**:
- `.env.local` - Your local config (gitignored, see DEVELOPER_SETUP.md)
- `.env.example` - Template (if created)

**Location**: Project root (same level as package.json)

**Reference**: `docs/DEVELOPER_SETUP.md` for complete env var list

---

## Build Output

```
.next/                # Next.js build output (gitignored)
├── cache/           # Build cache
├── server/          # Server-side code
├── static/          # Static files
└── types/           # Generated types
```

**Build Command**: `npm run build`

---

## Key Entry Points

**Public Website**: `app/page.tsx` (landing page)  
**Web App**: `app/app/page.tsx` (dashboard)  
**Authentication**: `middleware.ts` (route protection)  
**API**: `app/api/*` (API routes)

---

**Complete Architecture**: `docs/architecture/web-app/` (25 sharded sections)  
**Component Details**: `docs/architecture/web-app/component-architecture.md`  
**System Architecture**: `docs/architecture/web-app/system-architecture-mvp.md`



