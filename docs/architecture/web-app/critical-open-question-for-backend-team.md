# 🔴 CRITICAL OPEN QUESTION FOR BACKEND TEAM

**Issue**: For new users to create programs on web and have mobile sync them on first login, the backend's REST endpoints (POST /api/routine, POST /api/workout, etc.) **MUST write to Changes table**.

**Current State** (from code review):
- ✅ `/verify` endpoint writes to Changes table when creating default routine
- ❌ `POST /api/routine` does NOT write to Changes table (only writes to routines table)
- ❌ `POST /api/workout` likely does NOT write to Changes table

**Options for MVP**:

**Option A: Modify Backend REST Endpoints** (Recommended):
- Update POST/PATCH/DELETE for routines and workouts to also write to Changes table
- Ensures mobile's initial sync (pull-changes with lastPulledAt=0) retrieves web-created programs
- Estimated effort: 2-3 hours per endpoint × 6 endpoints = ~12-18 hours
- ✅ Enables full Program Builder for new users
- ✅ Perfect sync with mobile

**Option B: Limit Web Program Creation** (Simpler, No Backend Changes):
- New users can create ONE program during onboarding only
- Disable "Create New Program" for ALL users after onboarding
- Message: "Create additional programs on mobile app"
- ✅ Zero backend changes
- ⚠️ Very limited web functionality (less valuable MVP)

**Option C: Pure Read-Only for Everyone** (Safest):
- ALL users (new and existing) can only VIEW programs on web
- Program Builder available only in Phase 2 (WatermelonDB)
- ✅ Zero sync issues
- ✅ Zero backend changes
- ⚠️ Least valuable MVP (dashboard and history only)

**Recommendation**: **Option A** if backend team can commit ~18 hours to modify 6 endpoints. Otherwise **Option B** for zero-backend-change MVP.

---

**Document Status**: ✅ Architecture Complete - **Pending Backend Team Decision on Option A vs B vs C**  
**Next Steps**:
1. **URGENT**: Clarify with backend team (Option A, B, or C)
2. Update architecture based on decision
3. Refine PRD with Product team
4. Shard architecture documents
5. Begin story creation

