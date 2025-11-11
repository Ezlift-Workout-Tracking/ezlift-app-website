# 🔴 CRITICAL MVP DECISION REQUIRED

**Date**: 2025-01-10  
**From**: Winston (Architect)  
**To**: Belal Gouda (Product Owner) + Backend Team  
**Re**: Web App MVP - Sync Architecture Decision

---

## The Issue

Your clarification about new users vs existing users is brilliant for avoiding sync conflicts. However, I discovered a **critical backend requirement** that needs your decision.

### The Problem

**For new users creating programs on web to sync with mobile**, the backend's REST endpoints **must write to the Changes table**. Currently, they don't.

**Current Backend Behavior** (verified from code):
```typescript
POST /api/routine → Writes to routines table ✅
                  → Does NOT write to Changes table ❌

Result: Mobile's pull-changes won't see web-created programs 🔴
```

**What Works Today**:
```typescript
POST /verify → Creates default routine ✅
            → Writes to routines table ✅
            → Writes to Changes table ✅  // This is good!

Result: Mobile gets default routine on first sync ✅
```

---

## Three Options for MVP

### Option A: Modify Backend REST Endpoints ⭐ (Recommended)

**What**: Update POST/PATCH/DELETE endpoints to also write to Changes table

**Backend Changes Required**:
```typescript
// Example: POST /api/routine
async function createRoutine(req, reply) {
  // 1. Create routine (existing code)
  const routine = await routineRepo.save({...});
  
  // 2. ✅ ADD THIS: Write to Changes table
  await changesRepo.save({
    userId: req.headers.uid,
    tableName: 'routines',
    recordId: routine.id,
    changeType: 'created',
    changes: { /* routine data */ },
    timestamp: Date.now()
  });
  
  return routine;
}
```

**Endpoints to Modify** (6 total):
1. `POST /api/routine` - Create routine
2. `POST /api/workout` - Create workout template
3. `PATCH /api/routine/:id` - Update routine
4. `PATCH /api/workout/:id` - Update workout
5. `DELETE /api/routine/:id` - Delete routine
6. `DELETE /api/workout/:id` - Delete workout

**Estimated Effort**: 2-3 hours per endpoint = **12-18 hours total**

**Pros**:
- ✅ Enables full Program Builder for new users
- ✅ Perfect sync with mobile (mobile gets web-created programs)
- ✅ Valuable MVP (program creation is key differentiator)
- ✅ Consistent with how /verify already works

**Cons**:
- ⚠️ Requires backend code changes (~18 hours)
- ⚠️ Need to test Changes table writes don't break anything
- ⚠️ Slight delay to MVP timeline

---

### Option B: One Program Only (No Backend Changes) ⚡

**What**: Severely limit web program creation to avoid backend changes

**Frontend Constraints**:
- New users can create **ONE program during onboarding only**
- After onboarding: "Create Program" button disabled
- Message: "Create additional programs on the mobile app"
- Program viewing/dashboard/history/import still work fully

**User Experience**:
```
New User Flow:
1. Sign up on web ✅
2. Onboarding: Create first program via builder ✅
3. Dashboard: View program, see stats ✅
4. Try to create second program → ❌ "Use mobile app"

Existing User Flow:
1. Log in to web ✅
2. View programs from mobile ✅
3. View dashboard/history ✅
4. Try to create/edit program → ❌ "Use mobile app"
```

**Pros**:
- ✅ **Zero backend changes** (fastest to market)
- ✅ Still provides value (dashboard, history, ONE program)
- ✅ Zero sync risk

**Cons**:
- ⚠️ Very limited program creation (1 program total)
- ⚠️ Less differentiation vs competitors
- ⚠️ User frustration ("why can't I create more programs?")

---

### Option C: Pure Read-Only Programs 🚫 (Safest)

**What**: No program editing on web for anyone, wait for Phase 2

**Frontend Constraints**:
- ALL users (new and existing): Program viewing only
- Dashboard, history, import: Fully functional
- Program Builder: Available only in Phase 2 (WatermelonDB)

**User Experience**:
```
Any User:
1. Log in to web ✅
2. View dashboard with full analytics ✅
3. View workout history ✅
4. Import Hevy/Strong data ✅
5. View existing programs (read-only) ✅
6. Try to create/edit program → ❌ "Coming in next update"
```

**Pros**:
- ✅ **Zero backend changes** (fastest to market)
- ✅ **Zero sync risk** (no writes to programs)
- ✅ Still valuable (dashboard, analytics, import)

**Cons**:
- ⚠️ No program creation at all (major feature missing)
- ⚠️ Hevy/StrengthLog's key differentiator is web program builder
- ⚠️ MVP less compelling

---

## Comparison Matrix

| Aspect | Option A (Backend Mods) | Option B (One Program) | Option C (Read-Only) |
|--------|-------------------------|------------------------|----------------------|
| **Backend Changes** | ~18 hours | 0 hours | 0 hours |
| **Time to MVP** | +2-3 days | 11 weeks | 11 weeks |
| **New User Program Creation** | Unlimited ✅ | 1 only ⚠️ | None ❌ |
| **Existing User Programs** | Read-only | Read-only | Read-only |
| **Sync Risk** | None | None | None |
| **MVP Value** | High 🟢 | Medium 🟡 | Medium 🟡 |
| **Competitive** | Strong | Weak | Weak |
| **User Frustration** | Low | Medium | Medium-High |

---

## My Recommendation 🏗️

**Option A** - Invest the ~18 hours of backend work.

**Why**:
1. **Program Builder is a key differentiator** vs competitors
2. Strong app has 5M+ users frustrated by lack of web builder
3. Hevy users specifically cite web builder as "insanely useful"
4. 18 hours is ~2-3 days, not a major timeline impact
5. The pattern already exists (see /verify endpoint)
6. Enables valuable MVP, not just "half-featured" version

**Implementation**:
- Backend team adds Changes table writes to 6 endpoints
- Pattern already proven in /verify endpoint (copy and adapt)
- Testing: Verify mobile sync still works after modifications
- Timeline: Can be done in parallel with frontend work (Weeks 1-2)

---

## Decision Needed

**Please choose**:
- [ ] **Option A** - Backend modifies 6 endpoints (~18 hours)
- [ ] **Option B** - Frontend limits to 1 program (0 backend hours)
- [ ] **Option C** - Pure read-only programs (0 backend hours)

**Next Steps After Decision**:
1. I'll update the architecture document based on your choice
2. We'll refine the PRD to reflect the chosen approach
3. We'll shard the architecture for story creation
4. Development can begin!

---

---

## ✅ DECISION MADE: Option A

**Date**: 2025-01-10  
**Decision**: Option A - Backend modifies REST endpoints to write to Changes table  
**Status**: Migration already handles this for new users (confirmed working)

**Next Steps**:
1. ✅ Backend team to formalize migration pattern in REST endpoints
2. ✅ Architecture updated to reflect Option A
3. ⏭️ PRD refinement (incorporate architecture recommendations)
4. ⏭️ Document sharding (PRD + Architecture)
5. ⏭️ Story creation

**Decision Confirmed By**: Belal Gouda  
**Rationale**: Existing migration already provides this functionality for new users. Formalizing in REST endpoints ensures maintainability.

---

**This decision document is now RESOLVED.** ✅

