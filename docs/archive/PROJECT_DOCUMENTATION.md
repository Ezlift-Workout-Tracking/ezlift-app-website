# EZLift Website & Secure Web App – Comprehensive Project Documentation

## Overview

- Framework: Next.js 15 (App Router), TypeScript, React 18
- UI: Tailwind CSS + shadcn/ui (Radix primitives), Framer Motion animations
- Areas: Public marketing website (no auth) and secure web app (auth required)
- Data sources: PostgreSQL (exercise database), Contentful CMS (blog + exercise rich content), AWS S3 (exercise media)
- Auth: Firebase (Email/Password + Google + Apple), session cookies via API
- Hosting/Deployment: Netlify with the official Next.js plugin (SSR/ISR supported); standard Next build; optional CI via GitHub Actions

## Site Areas: Public vs Secure

### Public Website (no login required)

- Landing/Home: `/` (Hero, Features, Pricing, CTA)
- About: `/about`
- Exercise Library: `/exercise-library` and `/exercise-library/[id]`
- Blog: `/blog` and `/blog/[slug]`
- Android waitlist: `/android`
- Contact: `/contact`
- Legal: `(legal)/cookies`, `(legal)/privacy`, `(legal)/terms`, `(legal)/eula`

Behaviors:
- Exercise Library is fully browsable/searchable without auth
- Blog is generated from Contentful content

### Secure Web App (login required)

- Dashboard placeholder: `/app` (current protected entrypoint to the future web app)
- Additional protected paths configured in middleware: `/dashboard`, `/profile`, `/settings`, `/workouts`, `/progress`

Access control:
- `middleware.ts` enforces auth for protected routes and redirects guests to `/login`
- Auth routes (`/login`, `/signup`, `/forgot-password`) auto-redirect authenticated users to `/app`

## Routing and Layout

- App Router structure under `app/`
- Global layout in `app/layout.tsx` sets fonts, dark theme, cookie banner, and Google Analytics
- ISR used selectively (e.g., blog list revalidates hourly)

## Authentication

Authentication uses Firebase on the client and a session cookie flow on the server.

Key files:
- Guards: `lib/auth/guards.ts` (server-side helpers: `requireUser`, `isAuthenticated`, etc.)
- Session API: `app/api/auth/session/route.ts` (POST create session, DELETE logout, GET validate)
- Session helpers: `lib/auth/session.ts` (verify token with backend, set/clear cookies)
- Login/Signup/Forgot: `components/auth/*`, pages in `app/login`, `app/signup`, `app/forgot-password`
- Firebase client init: `lib/firebase/client.ts` (validates required NEXT_PUBLIC_* envs on load and throws if missing)

Flow:
1. Client authenticates with Firebase (email/password, Google, or Apple)
2. Client obtains Firebase ID token
3. Client calls `POST /api/auth/session` with `{ idToken }`
4. Server verifies token via `verifyWithBackend` (default `BACKEND_BASE_URL=https://ezlift-server-production.fly.dev/verify`; dev fallback supported via `AUTH_DEV_MODE`)
5. Server sets HttpOnly cookies:
   - `session-token` (JWT/session)
   - `user-info` (non-sensitive summary; also HttpOnly)
6. Middleware and server components read cookies to gate access; client is redirected to `/app`

Cookies:
- HttpOnly, `SameSite=Lax`, `Secure` in production (see `setSessionCookies`)
- Read on the server via Next `cookies()` API; not readable on client

Route protection:
- `middleware.ts` guards protected paths and redirects guests
- Server components may also call `requireUser()` for defense-in-depth

Logout:
- `DELETE /api/auth/session` clears cookies and redirects to `/`

Apple Sign-In specifics:
- Popup-first with automatic redirect fallback on Safari/iOS or when popups are blocked (`lib/auth/signInWithApple.ts`, `lib/auth/firebaseClient.ts`)
- Call `completeAppleRedirect()` on mount in auth pages to complete redirect-based sign-ins
- Guidance for account-exists-with-different-credential flows via `handleAccountExistsError(email)`

## Exercise Library Architecture

Server page:
- `app/exercise-library/page.tsx` (SSR)
  - Parses `searchParams`
  - Fetches data via `lib/services/exercise-data.ts`
  - Renders list, filter options, and pagination counts

Client UX:
- `components/exercise/ExerciseLibraryClient.tsx`
- Debounced search UX: `hooks/useDebouncedSearch.ts` + `components/exercise/DebouncedSearchInput.tsx`
  - Trailing-only debounce (desktop 250ms, mobile 350ms)
  - Minimum length: 1 character; clearing input immediately restores default list
  - Abort in-flight requests with `AbortController`; only latest response updates UI
  - Client-side LRU cache (20 entries, 10-minute TTL) with background revalidation
  - Enter key bypasses debounce (immediate search)
  - IME-safe (respects `compositionstart`/`compositionend`)

API endpoint:
- `app/api/exercises/route.ts` – GET with `search`, `page`, `limit`, and filter params

Data orchestration:
- `lib/services/exercise-data.ts`
  - Always fetches base records from PostgreSQL via `lib/services/database.ts`
  - Optionally enriches exercises with S3 media (signed URLs) when AWS is configured
  - Optionally enriches with Contentful exercise content (how-to rich text, mapped by exercise ID) when Contentful is configured

Pagination:
- Page size constants: `lib/constants/pagination.ts`

## Data Sources & Integrations

### PostgreSQL (Exercise DB)

File: `lib/services/database.ts`
- Uses `pg.Pool` with smart SSL config:
  - Local: no SSL
  - Production or `sslmode=require`: SSL with `rejectUnauthorized: false` (for managed DBs)
- Read-only queries: list, detail, facets, stats
- Parameterized SQL for safety

Environment:
- `DATABASE_URL` required (read via `lib/config/environment.ts`)

### AWS S3 (Exercise Media)

File: `lib/services/s3.ts`
- AWS SDK v3 client with credentials/region from env
- Checks object existence (HeadObject)
- Generates 1-hour signed URLs for images and videos
- Looks up media by convention:
  - Images: `images/{exerciseId}.png`
  - Videos: `videos/{exerciseId}.mp4` (or `.gif`), plus legacy multi-format fallback

Environment (all optional for local, recommended/required in prod):
- `EZLIFT_AWS_ACCESS_KEY_ID`, `EZLIFT_AWS_SECRET_ACCESS_KEY`, `EZLIFT_AWS_REGION`, `EZLIFT_AWS_S3_BUCKET_NAME`

### Contentful CMS (Blog + Exercise Rich Content)

File: `lib/contentful.ts`
- Blog: list, slugs, and single post fetchers
- Exercise content: fetched by database exercise ID or by slug; mapped to include how-to rich text and author
- Uses delivery API; optional preview client when `CONTENTFUL_PREVIEW_ACCESS_TOKEN` is set

Environment:
- `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN` (preview token optional)

### Google Analytics

File: `components/GoogleAnalytics.tsx`
- GA tracking integrated; consider externalizing the tracking ID to env

### Forms

- Contact and Android waitlist forms post to Google Forms (see `components/forms/*`)

## Environment & Configuration

Central config helper: `lib/config/environment.ts`
- Handles static-export builds by reading from `process.env` at build time and baked variables at runtime
- Exposes `config.database`, `config.aws`, and `config.contentful`
- Helpers: `isS3Configured()`, `isContentfulConfigured()`, `validateEnvironment()`

Environment variables (summary):
- Required: `DATABASE_URL`
- Optional (recommended in prod):
  - AWS: `EZLIFT_AWS_ACCESS_KEY_ID`, `EZLIFT_AWS_SECRET_ACCESS_KEY`, `EZLIFT_AWS_REGION`, `EZLIFT_AWS_S3_BUCKET_NAME`
  - Contentful: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`, `CONTENTFUL_PREVIEW_ACCESS_TOKEN`, `CONTENTFUL_ENVIRONMENT`
  - Auth backend: `BACKEND_BASE_URL` (defaults to production server), `AUTH_DEV_MODE`
  - Firebase client: `NEXT_PUBLIC_FIREBASE_*` (standard web SDK vars)

Local vs Production differences:
- Database SSL settings adapt automatically (see DB service)
- Cookies set with `secure=true` only in production
- Build-time variable inlining: env vars must be present at build time
- Netlify build uses `netlify.toml` and the Next.js plugin

## Local Development

Prerequisites:
- Node.js 18+ (Node 20 recommended to match CI)
- PostgreSQL (or a reachable managed instance)

Setup:
1. Copy env file: `cp .env.example .env.local` (or create `.env.local`)
2. Fill at minimum: `DATABASE_URL`
3. Optional for full parity: Contentful and AWS S3 variables
4. Install deps: `npm install`
5. Run dev server: `npm run dev`

Notes:
- If Contentful/AWS aren’t configured, features gracefully degrade (e.g., media placeholders, empty blog list)
- Exercise API and SSR pages continue to function with database-only data

## Production Deployment

- Platform: Netlify + `@netlify/plugin-nextjs`
- Config: `netlify.toml` (build command, headers, plugin)
- Next config: `next.config.js` (ESLint ignored during builds; `images.unoptimized=true`)
- Optional CI/CD: Example pipeline can be adapted as needed (ensure all env vars provided at build time)

Checklist:
1. Set environment variables in Netlify (or via CI build step)
2. Ensure `DATABASE_URL` and Contentful/AWS secrets are available at build time
3. Build command: `npm run build` (generates sitemap, builds Next output)

## SEO & Sitemaps

- Sitemap generation: `lib/generateSiteMap.ts` builds `public/sitemap.xml` using Contentful and exercise pagination data
- Robots and dynamic metadata:
  - `app/robots.ts`
  - `app/exercise-library/page.tsx` sets canonical/prev/next links per page
- Structured data:
  - Exercise Library emits JSON-LD (`ItemList` and a `WebSite` SearchAction) for better search results

## Security Considerations

- Session cookies are HttpOnly and `Secure` in production; access gated by middleware and server guards
- Database access is read-only
- S3 access is via signed URLs; clients don’t receive raw credentials
- Contentful uses Delivery API tokens; no Management API used on the site
- Netlify sets additional security headers (X-Frame-Options, X-XSS-Protection, CSP frame-ancestors)

## Testing

- Unit tests: `__tests__/useDebouncedSearch.test.ts` (covers debounce edges, abort, caching, IME behavior)
- Manual verification: exercise filters, pagination, and SSR results; auth redirects via middleware

## Troubleshooting

- Empty blog list: verify `CONTENTFUL_*` envs at build time
- Missing media: verify AWS credentials and S3 bucket naming conventions
- DB connection SSL errors: rely on built-in smart SSL; check `DATABASE_URL` (may need `sslmode=require`)
- Auth session fails locally: set `AUTH_DEV_MODE=true` for dev-only JWT decode fallback, or ensure `BACKEND_BASE_URL` is reachable

## Key Paths Reference

- Public landing: `app/page.tsx`
- Secure dashboard (placeholder): `app/app/page.tsx`
- Middleware (route protection): `middleware.ts`
- Exercise library SSR page: `app/exercise-library/page.tsx`
- Exercise API: `app/api/exercises/route.ts`
- Blog index/slug: `app/blog/page.tsx`, `app/blog/[slug]/page.tsx`
- Auth session API: `app/api/auth/session/route.ts`
- Auth guards/session: `lib/auth/guards.ts`, `lib/auth/session.ts`
- Data services: `lib/services/exercise-data.ts`, `lib/services/database.ts`, `lib/services/s3.ts`
- Contentful client: `lib/contentful.ts`
- Env/config: `lib/config/environment.ts`
- Build/deploy: `netlify.toml`, `next.config.js`, `package.json` scripts

## Public vs Secure Summary (quick)

- Public: marketing pages, exercise library, blog
- Secure: `/app` (future web app area) and other planned paths; require login
- Middleware controls access; auth powered by Firebase and backend token verification with HttpOnly cookies


