# Technical Constraints and Integration Requirements

## Existing Technology Stack
**Languages**: TypeScript, JavaScript
**Frameworks**: Next.js 15 (App Router), React 18, Tailwind, shadcn/ui
**Database**: None client-owned; reuse existing backend APIs (PostgreSQL on server side)
**Infrastructure**: Netlify + `@netlify/plugin-nextjs`; AWS S3 for media; Contentful for blog
**External Dependencies**: Firebase auth, GA4 (Google Analytics), Amplitude

## Integration Approach
**Database Integration Strategy**: Web app does not connect directly; all data via existing backend APIs.
**API Integration Strategy**: Reuse current endpoints for workouts/history/profile; no breaking changes to mobile contracts.
**Frontend Integration Strategy**: SSR page shells with client cards; auth via HttpOnly cookies; route protection via `middleware.ts` and server-side guards.
**Testing Integration Strategy**: Unit tests for hooks/components; targeted integration tests for dashboard flows and auth redirects; analytics event smoke checks.

## Code Organization and Standards
**File Structure Approach**: Pages under `app/` (e.g., `app/app/page.tsx`, `app/history/page.tsx`); UI primitives under `components/ui/*`; feature components under `components/sections/*` or `components/exercise/*` as appropriate.
**Naming Conventions**: PascalCase for components, camelCase for functions/variables, kebab-case routes.
**Coding Standards**: TypeScript strict types; avoid any; follow existing eslint and formatting; guard server/client boundaries.
**Documentation Standards**: Update PRD and tracking plan; inline code comments for non-obvious logic only.

