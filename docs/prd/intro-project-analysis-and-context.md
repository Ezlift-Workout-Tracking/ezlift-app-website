# Intro Project Analysis and Context

## Existing Project Overview

### Analysis Source
- IDE-based fresh analysis
- Referenced:
  - `docs/PROJECT_DOCUMENTATION.md`
  - `docs/brief.md`
  - `docs/EzLift Website + Web App — Full PRD.md`
  - `package.json`
  - `README.md`

### Current Project State
- Framework: Next.js 15 (App Router), React 18, TypeScript, Tailwind CSS, shadcn/ui (Radix)
- Areas:
  - Public site: landing, about, blog, exercise library, android waitlist, legal pages
  - Secure web app: protected `/app` entrypoint; auth pages (`/login`, `/signup`, `/forgot-password`); dashboard planned
- Data sources: PostgreSQL (exercise DB), Contentful (blog + exercise rich content), AWS S3 (media)
- Auth: Firebase client auth → server session via `POST /api/auth/session`; HttpOnly cookies; `middleware.ts` route protection
- Hosting/Deployment: Netlify with official Next.js plugin; optional CI via GitHub Actions
- SEO/Analytics: dynamic metadata, sitemap/robots; Google Analytics integrated
- Key files/paths:
  - App Router: `app/`
  - Middleware: `middleware.ts`
  - Exercise API: `app/api/exercises/route.ts`
  - Session API: `app/api/auth/session/route.ts`
  - Auth helpers: `lib/auth/guards.ts`, `lib/auth/session.ts`
  - Data services: `lib/services/*`
  - Contentful client: `lib/contentful.ts`
  - Env/config: `lib/config/environment.ts`

### Available Documentation Analysis
- Using existing project analysis; key docs:
  - `docs/PROJECT_DOCUMENTATION.md`
  - `docs/brief.md`
  - `docs/EzLift Website + Web App — Full PRD.md`

- Available Documentation (snapshot)
  - [x] Tech Stack Documentation
  - [x] Source Tree/Architecture
  - [~] Coding Standards (partial within documentation)
  - [x] API Documentation (partial; endpoints outlined in PRD; final swagger TBD)
  - [x] External API Documentation (Firebase/Contentful/S3 overview present)
  - [~] UX/UI Guidelines (implicit via Tailwind + shadcn/ui; no formal guide)
  - [x] Technical Debt/Risks (captured in brief/PRD risk sections)

> Note: If a deeper brownfield architecture output is desired, consider running a dedicated "document-project" pass to generate a focused architecture document.

