# Technical Constraints (MVP)

## Backend Dependencies

**Existing Endpoints** (No modifications required for most features):
- ✅ `GET /api/user` - User profile
- ✅ `PATCH /api/user` - Update profile
- ✅ `GET /api/workout` - List workouts
- ✅ `GET /api/routine` - List routines
- ✅ `GET /api/logs` - List sessions

**Required Backend Behavior** (Option A - Confirmed working):
- ✅ `POST /api/routine` writes to Changes table (via migration)
- ✅ `POST /api/workout` writes to Changes table (via migration)
- ✅ `PATCH`/`DELETE` endpoints write to Changes table (to be formalized)

**Backend Endpoints NOT Used in MVP**:
- ❌ `POST /api/sync/push-changes` (Phase 2 only)
- ❌ `GET /api/sync/pull-changes` (Phase 2 only)

## Client-Side Computation Requirements

**Dashboard Stats** (All computed client-side):
1. Weekly/monthly training volume (sum sets, sum weight × reps)
2. Personal records (max weight × reps per exercise)
3. Progress trends (estimated 1RM using Epley formula: `weight × (1 + reps/30)`)
4. Workout frequency (sessions per week)
5. Muscle group distribution (exercise counts by muscle group)

**Performance Assumption**: < 500 sessions per user (client-side aggregation remains fast)

**Post-MVP**: Backend can add aggregation endpoints for optimization

## Mobile App Synchronization (Phase 1)

**New Users**:
- Create programs on web via REST API
- Backend writes to Changes table (via existing migration)
- Mobile first login: `pull-changes` → Receives web-created programs
- ✅ Perfectly in sync

**Existing Users**:
- Cannot edit programs on web (blocked by user data state check)
- Can view programs (read-only)
- No sync conflicts possible
- ✅ Safe

## Data Volume Limits (MVP)

**Assumptions**:
- Typical user: 50-100 sessions/year
- Active user: 200-300 sessions/year
- Maximum tested: 500 sessions

**Mitigation for Large Datasets**:
- Default date range: 30 days
- Pagination: 20 sessions per page
- Lazy loading: "Load more" for historical data
- Future: Backend aggregation endpoints

## Deployment and Operations
**Build Process Integration**: Preserve `npm run build` and Netlify plugin flow; analytics scripts loaded defer/async; env-driven configuration for GA/Amplitude keys.
**Deployment Strategy**: Incremental rollout; feature flags default to control; variants can be toggled without redeploy when integrated with external A/B tool.
**Monitoring and Logging**: GA performance reports; console error monitoring; optional Amplitude dashboards; verify event delivery.
**Configuration Management**: Use Netlify env vars (`GA_MEASUREMENT_ID`, `AMPLITUDE_API_KEY`, feature flag source id); safe defaults if unset.

## Risk Assessment and Mitigation
**Technical Risks**: Analytics overhead, flicker from late variant resolution, auth regressions, API latency affecting dashboard, client-side aggregation performance on large datasets.
**Integration Risks**: Backend endpoints missing specific fields; large CSV imports; cross-environment config drift; user data state detection failures.
**Deployment Risks**: Missing env vars causing analytics/flags to fail; misconfigured CSP blocking scripts.
**Mitigation Strategies**: Defer/async analytics, SSR-friendly flag gating with control default, incremental enablement, CSP allowlists, clear fallbacks, fail-safe defaults for user state detection.

## Monetization & Access Policy (MVP)
- Web MVP is free at launch (including stats dashboard, import/export, program builder) to maximize learning and traction.
- Long-term: web paywall aligns with existing mobile subscription; gating will be introduced later with feature hooks added in MVP for future enablement.
- Import from Hevy/Strong is initially free/early-access on web; mobile remains premium until strategy is unified.

## Rollout Strategy & Flags
- Incremental rollout to production; experimental features hidden behind flags and/or Netlify Experiments control.
- Shortlist: Netlify Experiments for variants; Amplitude + GA for measurement (verify plan limits).
- Rollback criteria: crashes post-deploy, LCP > 4s sustained, key-task failure signals in analytics; manual kill switch per feature flag.

## Backend Readiness & References
- Backend Swagger: https://ezlift-server-production.fly.dev/documentation
- Pass user token on every request via `x-jwt-token` header
- Client-side aggregation used for dashboard stats (no new backend endpoints required)
- Changes table integration confirmed working via existing migration (Option A)

