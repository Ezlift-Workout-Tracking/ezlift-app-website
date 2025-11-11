# EzLift Architecture - Session Summary

**Date**: 2025-01-10  
**Architect**: Winston  
**Status**: Architecture Complete - Decision Required

---

## 📚 Documents Created

### 1. Backend Sync Architecture Summary
**File**: `docs/backend-sync-architecture-summary.md`

**What It Covers**:
- Complete Changes table schema analysis
- Sync endpoints (push-changes, pull-changes) deep dive
- Data models (Workout, Routine, WorkoutExercise, WorkoutSession)
- WatermelonDB mobile implementation patterns
- Why sync is critical for mobile/web consistency

**Key Insight**: Mobile apps use WatermelonDB → Sync endpoints → Changes table. Web app must do the same for perfect sync (Phase 2).

---

### 2. Brownfield Public Website Architecture
**File**: `docs/architecture/brownfield-public-website.md`  
**Size**: ~400 lines

**What It Documents**:
- ✅ Current state of ezlift.app (marketing site, blog, exercise library)
- ✅ Technology stack (Next.js 15, React 18, TypeScript, Tailwind, shadcn/ui)
- ✅ Authentication flow (Firebase → backend verify → HttpOnly cookies)
- ✅ Data sources (PostgreSQL, Contentful, S3)
- ✅ Exercise library architecture (SSR + debounced search + LRU cache)
- ✅ Component inventory (40+ reusable UI primitives)
- ✅ Routing & middleware (public vs protected routes)
- ✅ Performance & SEO optimizations
- ✅ Security measures
- ✅ Deployment process (Netlify)

**Why This Matters**: 
- Identifies shared components for web app
- Documents proven patterns to reuse (ExerciseCard, DebouncedSearchInput)
- Establishes baseline architecture

---

### 3. Full-Stack Web App Architecture ⭐
**File**: `docs/architecture/fullstack-web-app.md`  
**Size**: ~3,180 lines (comprehensive)

**What It Covers**:

#### Phase 1 (MVP) - Sections:
1. **MVP Overview** - Features, constraints, success criteria
2. **Technology Stack** - React Query, Amplitude, PapaParse, MiniSearch, Recharts
3. **System Architecture** - SSR + client state management
4. **Data Architecture** - REST API pattern, client-side aggregation
5. **API Integration** - All backend endpoints, schemas, error handling
6. **Component Architecture** - 50+ components specified
7. **Feature Specifications** - Dashboard (5 cards), History, Import, Program Builder, Onboarding
8. **State Management** - React Query configuration, cache keys, optimistic updates
9. **Analytics Integration** - Amplitude + GA4, 50+ events defined
10. **Import Flow** - CSV parsing (Hevy format), fuzzy exercise matching
11. **Performance Strategy** - Budgets, code splitting, lazy loading
12. **Security** - Reuses existing auth, HTTPS, HttpOnly cookies
13. **Testing Strategy** - Unit, integration, e2e tests

#### Phase 2 (Post-MVP) - Sections:
14. **WatermelonDB Integration** - Complete schema v83, models with decorators
15. **Sync Architecture** - Pull/push changes implementation
16. **Migration Path** - Feature flag strategy, gradual cutover
17. **Development Roadmap** - 11-week Phase 1 + 4-week Phase 2

#### Critical Additions:
18. **User Data State Detection** - New vs existing user logic
19. **Program Builder Access Control** - Conditional feature access
20. **Backend Improvement Opportunities** - Post-MVP optimization ideas

---

## 🎯 Key Architectural Decisions

### 1. **MVP Constraint: New Users Only for Program Builder** 🔴

**The Rule**:
- **New users** (no existing data): ✅ Full Program Builder access
- **Existing users** (have mobile data): ❌ Read-only program view
- **Why**: Prevents mobile/web sync conflicts without WatermelonDB

**Detection**:
```typescript
const hasData = await checkUserHasData(userId);
// Checks: GET /api/workout + GET /api/logs (limit 1 each)

if (hasData) {
  // Existing user: Block Program Builder, show read-only view
} else {
  // New user: Full access to Program Builder
}
```

**User Flows**:
- **New user**: Web signup → Onboarding (9 steps) → Create program on web → Mobile syncs down → ✅ In sync
- **Existing user**: Web login → Onboarding (6 steps, skip program setup) → Dashboard → View programs (read-only)

---

### 2. **Phase 1 (MVP): Direct REST API**

**Architecture**:
```
React Components → React Query → Backend REST APIs → PostgreSQL
```

**Data Sources**:
- GET /api/workout (programs/templates)
- GET /api/routine (routines)
- GET /api/logs (workout sessions)
- GET /api/user (profile/settings)

**Writes** (new users only):
- POST /api/routine
- POST /api/workout
- PATCH /api/user

**Client-Side Computations**:
- Weekly/monthly volume aggregation
- Personal records calculation
- Progress trends (estimated 1RM)
- All dashboard stats

**Benefits**:
- ✅ No backend changes needed (maybe - see decision below)
- ✅ Faster development (familiar React patterns)
- ✅ Deliverable in 11 weeks

---

### 3. **Phase 2 (Post-MVP): WatermelonDB Sync**

**Architecture**:
```
React Components → WatermelonDB (IndexedDB) → Sync Adapter → /push-changes, /pull-changes
```

**Benefits**:
- ✅ All users can edit programs (removes new user constraint)
- ✅ Perfect mobile/web sync (Changes table updated)
- ✅ Offline support
- ✅ Faster dashboard (local queries)

**Migration**: 4 weeks, feature flag approach, zero data loss

---

## 🚨 CRITICAL DISCOVERY

### Backend REST Endpoints Don't Write to Changes Table

**Current State** (verified from backend code):
- ✅ `POST /verify` writes to Changes table (when creating default routine)
- ❌ `POST /api/routine` does NOT write to Changes table
- ❌ `POST /api/workout` does NOT write to Changes table
- ❌ `PATCH /api/routine/:id` does NOT write to Changes table
- ❌ `PATCH /api/workout/:id` does NOT write to Changes table

**Impact**:
```
New user creates program on web via POST /api/routine
  → Routine saved to routines table ✅
  → Changes table NOT updated ❌
  → Mobile calls pull-changes (lastPulledAt=0)
  → Backend queries Changes table
  → Doesn't find web-created routine ❌
  → Mobile doesn't get web programs 🔴
  → OUT OF SYNC
```

---

## 🔑 THREE OPTIONS

### Option A: Modify Backend (Recommended) ⭐

**What**: Update 6 REST endpoints to write to Changes table

**Effort**: ~18 hours (2-3 hours per endpoint)

**Pattern** (already proven in /verify):
```typescript
// After creating/updating/deleting entity
await changesRepo.save({
  userId,
  tableName: 'routines', // or 'workouts'
  recordId: entity.id,
  changeType: 'created', // or 'updated', 'deleted'
  changes: { /* entity data */ },
  timestamp: Date.now()
});
```

**Result**:
- ✅ New users can create unlimited programs on web
- ✅ Mobile syncs down all web-created programs
- ✅ Full-featured MVP
- ✅ Strong competitive position

**Timeline Impact**: +2-3 days (can be done in parallel with frontend)

---

### Option B: One Program Limit (No Backend Changes) ⚡

**What**: Limit new users to ONE program during onboarding

**Constraints**:
- During onboarding: Create one program ✅
- After onboarding: "Create Program" button shows "Use mobile app" message
- Existing users: Read-only (as planned)

**Result**:
- ✅ Zero backend changes
- ⚠️ Very limited program creation
- ⚠️ Less valuable MVP

**User Frustration Risk**: Medium-High (why can't I create more programs?)

---

### Option C: Read-Only for Everyone (Safest) 🚫

**What**: NO program editing on web for MVP

**Constraints**:
- All users: Program viewing only (read-only)
- Program Builder: Phase 2 only
- MVP focuses on: Dashboard, history, import, analytics

**Result**:
- ✅ Zero backend changes
- ✅ Zero sync risk
- ⚠️ Missing key feature (program builder)
- ⚠️ Weaker MVP value proposition

---

## 📊 Comparison

| Factor | Option A | Option B | Option C |
|--------|----------|----------|----------|
| **Backend Effort** | 18 hours | 0 hours | 0 hours |
| **Frontend Effort** | Same | Same | Less (skip builder) |
| **Timeline** | +2-3 days | 11 weeks | 10 weeks |
| **New User Programs** | Unlimited ✅ | 1 only ⚠️ | None ❌ |
| **MVP Value** | High 🟢 | Medium 🟡 | Medium 🟡 |
| **Competitive** | Strong 💪 | Weak | Weak |
| **Sync Risk** | None | None | None |
| **User Satisfaction** | High | Medium | Medium-Low |

---

## 💡 My Recommendation

### Choose Option A

**Why**:
1. **Program Builder is THE web differentiator** - Strong app's users are desperate for it
2. 18 hours (~2-3 days) is **trivial** compared to 11-week frontend timeline
3. The pattern **already exists** in `/verify` endpoint (proven, testable)
4. Delivers a **compelling MVP**, not a "limited preview"
5. Backend team likely has this pattern in other projects (common sync pattern)

**What to Tell Backend Team**:
> "We need 6 REST endpoints (routine and workout CRUD) to also write to the Changes table after their normal operations. The pattern already exists in the /verify endpoint - just replicate that pattern. Estimated 2-3 hours per endpoint, 12-18 hours total. This enables a full-featured MVP and perfect mobile sync."

**Implementation**:
- Backend team works on this during Weeks 1-2 (parallel with frontend foundation)
- Frontend team can mock the responses and build with confidence
- Integration testing in Week 3
- No timeline impact if done in parallel

---

## ⏭️ Next Steps

### If You Choose Option A:
1. ✅ Coordinate with backend team (18-hour commitment)
2. I'll update architecture with Option A details
3. Refine PRD based on full-featured MVP
4. Shard architecture documents
5. Begin story creation (11-week frontend timeline)

### If You Choose Option B:
1. I'll update architecture for 1-program limit
2. Add UI messaging for "create more on mobile"
3. Refine PRD for limited program creation
4. Shard architecture
5. Begin story creation (11-week timeline, easier scope)

### If You Choose Option C:
1. I'll simplify architecture (remove Program Builder)
2. Refine PRD for analytics-focused MVP
3. Shard architecture
4. Begin story creation (10-week timeline, no builder)

---

## 🎯 The Question

**Which option do you prefer for MVP?**

Please consider:
- Backend team capacity (~18 hours for Option A)
- MVP value proposition (program builder is huge)
- Competitive positioning (this is what users want)
- User expectations (frustration with limited features)

**I'm ready to proceed once you decide!** 🚀

---

**Related Documents**:
- `docs/architecture/fullstack-web-app.md` - Full architecture (all 3 options documented)
- `docs/architecture/brownfield-public-website.md` - Existing system
- `docs/backend-sync-architecture-summary.md` - Backend analysis

