# Project Brief: EZLift

## Executive Summary

EzLift is a cross‑platform strength training companion built by lifters for lifters, combining frictionless workout logging with advanced programming tools and analytics across iOS, Android, and a new web app. It uniquely digitizes handwritten logs and emphasizes data portability via imports and future integrations.

Key points:
- Advanced routine setup (supersets, drop sets) and a fast, clean logging UI designed for in‑gym focus
- Scan handwritten workouts to instantly digitize history; planned imports from Hevy/Strong and Google Sheets sync
- Public website for SEO/AEO, content (blog + exercise library), and A/B‑testable messaging; analytics‑driven optimization
- Secure web app companion: near‑term dashboard (recent workout, weekly overview, history snapshot, import entry, profile quick view) with a roadmap for deeper stats, routines, AI assistant, and MCP data export
- Simple, ad‑free pricing (monthly/yearly) with continuous feature delivery

References: [Website](https://ezlift.app/), [App Store](https://apps.apple.com/de/app/ezlift-pro/id6737275723?l=en-GB)

## MVP Scope

### Core Features (Must Have)
- **Authentication & Sessions:** Reuse existing Firebase login/signup with secure server sessions. Guard protected routes and redirect to `/app` when authenticated.  
  Rationale: Enables immediate access to the web companion with minimal backend change.
- **Dashboard Cards:** Recent Workout, Weekly Overview, History Snapshot, Import Panel (Hevy/Strong early access), Profile Quick View.  
  Rationale: High‑leverage surface that provides value on day one and composes well for future features.
- **Workout History:** Paginated list of past workouts with basic date range filter and quick links to details.  
  Rationale: Core review capability for desktop workflows.
- **Import Entry (Early Access):** CSV upload start for Hevy/Strong; show confirmation that a job was started (backend processing TBD).  
  Rationale: Signals portability; captures demand and validates UX.
- **Profile Basics:** View display name, units, bodyweight; allow updating units and bodyweight.  
  Rationale: Minimal profile control that unlocks calculation consistency.
- **Empty States & Onboarding Hooks:** Zero‑state CTAs (import history, log workout) and links into onboarding; skeletons and clear guidance.  
  Rationale: Smooths first‑time experience.

### Out of Scope for MVP
- Full routine/builder authoring or editing flows
- Deep analytics beyond weekly overview (advanced charts/PR analytics)
- AI assistant modes (Coach/Analyst/Advisor)
- MCP/Token‑gated data export
- Direct Google Sheets sync and health platform integrations (Apple Health, Google Fit, Fitbit, Samsung Health)
- Coach collaboration/sharing features

### MVP Success Criteria
- Recent Workout: shows latest session details (sets/reps/volume/notes) or empty state with CTAs.
- Weekly Overview: aggregates current week’s sets/volume/streak; empty state text when no data.
- History Snapshot: lists last 3–5 sessions with date/name/quick link.
- Import Panel: accepts Hevy/Strong CSV upload and confirms job started.
- Profile Quick View: displays name/units/bodyweight; updates persist via PATCH and reflect on reload.
- Performance: LCP < 2.5s (p75), INP < 200ms (p75) on dashboard.  
  References: [Website](https://ezlift.app/), [App Store](https://apps.apple.com/de/app/ezlift-pro/id6737275723?l=en-GB)

## Next Steps

### Immediate Actions
1. Finalize MVP dashboard scope and acceptance criteria with engineering.
2. Define minimum viable import schemas for Hevy and Strong; prepare early‑access flow and instrumentation.
3. Implement dashboard cards and history list using existing backend; wire profile basics.
4. Add zero‑state onboarding hooks and empty states per rules; ensure skeletons and error toasts.
5. Set up analytics + A/B testing on landing (tooling decision), define initial experiments for conversion.
6. Establish performance budgets and monitoring (Core Web Vitals dashboards) for landing and dashboard.

### PM Handoff
This Project Brief provides the full context for EZLift. Please start in PRD generation mode, review the brief, and collaborate with engineering to plan the MVP delivery and experiment roadmap.

## Appendices

### A. Research Summary
- Sources: `docs/PROJECT_DOCUMENTATION.md`, `docs/EzLift — Built by Lifters, for Lifters.md`, `docs/EzLift Website + Web App — Full PRD.md`, live [Website](https://ezlift.app/), [App Store](https://apps.apple.com/de/app/ezlift-pro/id6737275723?l=en-GB)
- Highlights: Import‑first differentiation; OCR scanning of paper logs; advanced routine setup; SEO/AEO content strategy; web app MVP centered on dashboard/history.

### B. Stakeholder Input
- To be appended from founder/coach interviews and early adopter feedback.

### C. References
- Architecture & stack: see `docs/PROJECT_DOCUMENTATION.md`
- Differentiation & positioning: see `docs/EzLift — Built by Lifters, for Lifters.md`
- Web app vision & endpoints: see `docs/EzLift Website + Web App — Full PRD.md`

## Risks & Open Questions

### Key Risks
- **Regression Risk:** Changes to auth/session or SSR/CSR balance could impact existing flows.  
  Mitigation: Incremental rollout, integration tests on auth paths, feature flags, strict cookie handling.
- **Import Complexity:** Parsing Hevy/Strong formats may be more complex than anticipated.  
  Mitigation: Start with CSV subset, publish early‑access constraints, instrument failures, iterate parsers.
- **Performance Drift:** Dashboard data aggregation could grow slow.  
  Mitigation: Cache hot queries, precompute weekly aggregates where appropriate, monitor Core Web Vitals.
- **Onboarding Fatigue:** Web onboarding may create friction for zero‑state users.  
  Mitigation: Skippable steps, progressive save, clear CTAs, measure completion and drop‑off.

### Open Questions
- Which analytics/experimentation stack for A/B tests on landing (Netlify experiments vs third‑party)?
- Do we need a lightweight “workout detail” page in MVP or is snapshot + quick links sufficient?
- Minimum viable import schema for Hevy/Strong (columns and validation rules)?
- Which early stats require an API vs can be computed client‑side (weekly volume, streaks)?

### Areas Needing Further Research
- Competitive import formats and public docs; user interest in Sheets vs other integrations.
- AEO (Answer Engine Optimization) tactics producing best lift for Q&A content in our domain.
- MCP export patterns and security models applicable to user‑owned data.

## Constraints & Assumptions

### Constraints
- **Budget/Resourcing:** Focus on leveraging current backend and infra; limit net‑new services for MVP.
- **Timeline:** Deliver web app MVP within ~4–6 weeks; experimentation runs in parallel on landing.
- **Technical:** Maintain existing auth/session model; avoid breaking changes to blog/exercise library.
- **Backend:** Single shared backend for iOS/Android/Web; web‑driven API changes will be coordinated and must not break mobile apps.
- **Compliance/Security:** Maintain secure cookies, least‑privilege tokens, and storage of uploads.

### Key Assumptions
- Existing backend endpoints can serve dashboard/history with minor adjustments.
- Users with prior history will engage with imports; early‑access import UX can ship before full automation.
- Content and Q&A can drive incremental organic traffic to support testing and conversion improvements.
- API documentation and/or backend code will be provided; the backend team will accept prioritized change requests needed by the web app while preserving mobile compatibility.

## Technical Considerations

### Platform Requirements
- **Target Platforms:** iOS, Android, Web (desktop & mobile web)
- **Browser/OS Support:** Evergreen browsers (Chrome, Safari, Firefox, Edge), iOS 13.4+, Android modern
- **Performance Requirements:** Dashboard LCP < 2.5s (p75), INP < 200ms (p75); minimal blocking scripts on landing

### Technology Preferences
- **Frontend:** Next.js 15 (App Router), React 18, TypeScript, Tailwind + shadcn/ui (Radix primitives)
- **Backend:** Reuse existing mobile backend (sessions, workouts, stats); progressive endpoints for imports and stats
- **Shared Backend Model:** One backend serves iOS, Android, and Web; the web app reuses the same API contracts. Backend change requests will be coordinated with the backend owner; API documentation and/or backend code will be provided to the web team.
- **Database:** PostgreSQL (exercise DB)
- **Hosting/Infrastructure:** Netlify + `@netlify/plugin-nextjs`; GitHub Actions CI; AWS S3 for media; Contentful for blog

### Architecture Considerations
- **Repository Structure:** App Router under `app/`; protected routes behind `middleware.ts`; consistent components and feature folders
- **Service Architecture:** SSR/CSR hybrid; server actions or API routes for authenticated operations; keep import processing server‑side/back‑jobs
- **Integration Requirements:** Firebase auth with secure server sessions; Contentful delivery API; S3 signed URLs; analytics + experimentation on web
- **Security/Compliance:** HttpOnly cookies, `Secure` in production, least‑privilege tokens, rate limiting on auth and upload endpoints

## Post-MVP Vision

### Phase 2 Features
- Deeper statistics: PR tracking, volume analytics over time, comparative charts.
- Enhanced history exploration: filters, tags, session exports (CSV/PDF).
- Routine management: view/edit/create routines with advanced set types.

### Long‑Term Vision
- AI assistant modes (Coach, Analyst, Advisor) to interpret freeform plans and suggest adjustments.
- Ecosystem integrations: Google Sheets sync, Apple Health, Google Fit, Fitbit, Samsung Health.
- MCP‑style token‑gated data export so users can programmatically access their data.

### Expansion Opportunities
- Coach tools and collaboration: share read‑only dashboards or program templates.
- Community features: opt‑in data sharing for leaderboards or PR comparisons.
- Content flywheel: Q&A submissions answered by experts, syndicated to blog/YouTube for AEO/SEO.

## Goals & Success Metrics

### Business Objectives
- Launch web app MVP (dashboard, history, import entry, profile quick view) and achieve a meaningful post‑launch adoption signal (target: establish ≥ baseline WAU and ≥ baseline DAU/WAU within first 4 weeks; exact baselines set via analytics).
- Improve landing → signup conversion via A/B‑tested messaging and CTAs (target: +15–30% vs current baseline after 4–6 weeks of experiments).
- Grow content‑driven acquisition: increase organic blog traffic and exercise‑library sessions (targets set after baseline; aim for steady MoM growth).
- Maintain site reliability and performance during rollout (target: error rate <1%, Core Web Vitals in “Good” for ≥75% of sessions).
- Ensure import capability readiness (UX, copy, instrumentation) for Hevy/Strong early access.

### User Success Metrics
- Time to log a set (median) ≤ 1s; taps per logged set ≤ 2 in common flows.
- First‑week activation (web): complete at least one of [import history, view 3+ workouts, configure profile].
- Import completion rate for eligible users (who start import) ≥ 60%.
- Onboarding completion rate (web zero‑state users) ≥ 70% with skippable steps.
- Page performance: LCP < 2.5s (p75), INP < 200ms (p75) on landing and dashboard.

### KPIs (with target/definition examples)
- Conversion Rate: landing → signup → activation (target improvements vs baseline per experiment cycle).
- Import Adoption: ≥ 30% of new users with prior app history attempt Hevy/Strong import within 30 days.
- Weekly Engagement: % of mobile lifters using web app weekly (tracked as WAU) and session depth on dashboard/history.
- Content Performance: organic sessions, time on page, and assisted conversions from blog/Q&A entries.
- Retention: D7 and D30 cohort retention for web users (targets to be set post‑baseline collection).

## Target Users

### Primary User Segment: Advanced Lifters
- Demographic/firmographic: Experienced strength athletes and serious gym‑goers (typically 18–45) training 3–6 days/week; iOS, Android, and desktop access.
- Behaviors & workflows: Log with paper or basic apps; run structured programs; care about PRs, volume, and progression; want minimal‑tap logging and reliable offline behavior.
- Needs & pain points: Advanced set types (supersets, drop sets), fast in‑gym UI, hybrid paper‑to‑digital via scanning, imports from Hevy/Strong, trustworthy analytics.
- Goals: Increase strength and consistency, analyze trends and PRs, manage routines with low friction, maintain complete, portable training history.

### Secondary User Segment: Data‑Driven Gym‑Goers & Coaches
- Demographic/firmographic: Early adopters, spreadsheet users, and personal trainers/coaches who value desktop workflows and data ownership.
- Behaviors & workflows: Track and review on web; export/share insights with clients or peers; rely on routine/program iteration.
- Needs & pain points: Web dashboard with history and weekly stats, CSV/Sheets sync (planned), import tooling to consolidate prior history, clear empty states and onboarding.
- Goals: Centralize data, streamline review and coaching workflows, preserve portability for long‑term use.

## Problem Statement

Current state and pain points:
- Advanced lifters face friction capturing workouts (paper notebooks, slow/clunky UIs, too many taps) that interrupt training flow.
- Training history is fragmented across paper logs and other apps, making it hard to analyze progress or switch tools without losing data.
- Existing trackers often lack advanced programming features (supersets, drop sets), hybrid paper‑to‑digital workflows, or reliable offline behavior.
- Mobile‑only experiences limit desktop analytics and cross‑device continuity; web access is increasingly expected.

Impact of the problem:
- Time lost during sessions reduces adherence and training quality; insights remain buried or delayed.
- Incomplete or siloed data undermines progression planning, PR tracking, and long‑term decision‑making.
- Migration barriers trap users in incumbent apps, slowing adoption of better tools.

Why existing solutions fall short:
- Generic, one‑size‑fits‑all trackers prioritize breadth over the depth serious lifters need.
- Vendor lock‑in and weak import tooling make switching costly; paper‑to‑digital workflows are rarely first‑class.
- Ads, cluttered interfaces, and limited advanced set types create friction precisely where speed and focus are critical.

Urgency and importance:
- The mobile app is live with compelling differentiators (scanning, advanced setup); a companion web app will unify cross‑device value and expand analytics use cases.
- The public website already supports SEO/AEO and content; improving conversion and launching the web app together compound growth via discoverability + retention.


## Proposed Solution

Core concept and approach:
- Two-surface product: (1) a public marketing website optimized for SEO/AEO, content, analytics, and A/B testing; (2) a secure web app companion that delivers desktop analytics and cross‑device continuity.
- Web app MVP focuses on a responsive dashboard composed of cards: Recent Workout, Weekly Overview, History Snapshot, Import Panel (Hevy/Strong early access), and Profile Quick View, plus a History page. This provides immediate value while establishing extensible surfaces for future features.
- Imports & data portability: support CSV imports from Hevy and Strong; Google Sheets sync planned. Preserve hybrid workflows by continuing paper‑to‑digital via scanning.
- UX principles: minimal‑tap flows, distraction‑free, ad‑free; mobile‑first responsiveness; fast SSR/CSR hybrid; accessibility‑minded components; clear empty states and onboarding.
- Architecture & integrations: reuse existing backend APIs and Firebase auth with secure server sessions; Contentful for blog; PostgreSQL for exercise data; S3 for media; analytics + experimentation for the website.

Key differentiators:
- Import‑first and OCR scanning of paper logs reduce switching costs and preserve training history.
- Advanced routine setup (supersets, drop sets) and performance‑oriented logging UX tailored for serious lifters.
- Data portability roadmap (including MCP‑style export) positions EzLift as a trustworthy long‑term hub.

Why this will succeed:
- Removes friction in‑gym and during migration, addressing the top adoption blockers.
- Combines content‑driven acquisition (SEO/AEO + Q&A) with a compelling first‑run web experience.
- Cross‑device continuity increases engagement and perceived value.

High‑level vision:
- Near‑term (v0.1): dashboard and history with import entry point.
- Mid‑term (v0.2–v0.5): deeper statistics, routine management, AI assistant modes.
- Long‑term (v0.6+): user‑owned data export via token‑gated API (MCP‑style) and broader ecosystem integrations.

References: [Website](https://ezlift.app/), [App Store](https://apps.apple.com/de/app/ezlift-pro/id6737275723?l=en-GB)

