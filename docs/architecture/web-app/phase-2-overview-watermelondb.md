# Phase 2 Overview (WatermelonDB)

## Why Phase 2 Exists

**The Problem with MVP Approach**:
```
Mobile App Changes → Backend (via sync) → Changes table updated ✅
Web App Changes → Backend (via REST) → Only data tables updated ❌
                                     → Changes table NOT updated ❌
                                     → Mobile doesn't pull changes ❌
                                     → OUT OF SYNC 🔴
```

**Phase 2 Solution**:
```
Web App → WatermelonDB (IndexedDB) → Sync Adapter → /push-changes
                                                   → Changes table ✅
                                                   → Data tables ✅
Mobile App → pull-changes → Gets web changes ✅
Web App → pull-changes → Gets mobile changes ✅
                → PERFECT SYNC 🟢
```

## Migration Trigger

**When to Migrate from Phase 1 to Phase 2**:
1. **Existing users demand program editing on web** (currently read-only)
2. User reports data not syncing between web and mobile (edge cases)
3. Backend team prioritizes sync endpoints for web
4. Offline support becomes a priority feature
5. User data volume makes client-side aggregation slow

## Benefits of Phase 2 Migration

**Removes MVP Constraints**:
- ✅ **All users can edit programs on web** (not just new users)
- ✅ **Perfect mobile/web sync** (Changes table updated)
- ✅ **Offline support** (IndexedDB persistence)
- ✅ **Faster dashboard** (local queries vs network)
- ✅ **Consistent architecture** (same as mobile)

**Current Constraint (MVP)**:
- ⚠️ Existing users can only **view** programs on web, not edit
- ⚠️ New users can edit (safe because mobile syncs down on first login)

**After Phase 2**:
- ✅ All users have full editing capabilities
- ✅ Instant bidirectional sync (web ↔ mobile)

---
