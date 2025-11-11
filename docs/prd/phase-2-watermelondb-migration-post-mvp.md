# Phase 2: WatermelonDB Migration (Post-MVP)

## Overview

**Timeline**: 4 weeks after Phase 1 MVP complete

**Goal**: Enable full program editing for all users with perfect mobile/web synchronization

## What Changes in Phase 2

**Removes MVP Constraints**:
- ✅ **All users can edit programs on web** (not just new users)
- ✅ **Perfect mobile/web sync** (Changes table updated from web)
- ✅ **Offline support** (IndexedDB persistence)
- ✅ **Faster dashboard** (local queries vs network)
- ✅ **Consistent architecture** (same as mobile)

**Technical Implementation**:
- **WatermelonDB** installed on web (IndexedDB adapter)
- **Schema** matches mobile app v83 (14+ tables)
- **Sync Adapter** uses existing backend endpoints:
  - `POST /api/sync/push-changes` - Web → Backend
  - `GET /api/sync/pull-changes` - Backend → Web
- **Migration Path**: Feature flag enables gradual cutover from React Query → WatermelonDB

## Migration Trigger

**When to Migrate**:
1. Existing users demand program editing on web
2. User data volume makes client-side aggregation slow (> 500 sessions)
3. Offline support becomes priority feature
4. Backend team prioritizes web sync integration

## Benefits of Phase 2

**For Users**:
- Edit programs on any device (web or mobile)
- Instant synchronization (changes appear immediately)
- Offline access to workout data
- Faster dashboard loading (local queries)

**For Product**:
- No feature access restrictions (all users equal)
- Simpler user messaging (no "use mobile to edit" messages)
- Competitive parity with Hevy (full web editing)
- Foundation for future web-first features

## Technical Stack Additions

**New Dependencies** (Phase 2):
- `@nozbe/watermelondb` - Local-first database
- `@babel/plugin-proposal-decorators` - For WatermelonDB models
- IndexedDB polyfills (if needed for older browsers)

**Architecture Changes**:
- Local database initialization on app load
- Background sync every 60 seconds + on visibility change
- Conflict resolution strategy (server wins for MVP)
- Database migration strategy (schema versioning)

## Success Criteria

**Phase 2 Complete When**:
- ✅ All users can create/edit/delete programs on web
- ✅ Web → Mobile sync works (programs created on web appear on mobile)
- ✅ Mobile → Web sync works (workouts tracked on mobile appear on web)
- ✅ No data loss during migration (existing React Query data migrated to WatermelonDB)
- ✅ Performance acceptable (dashboard LCP still < 2.0s)
- ✅ Offline mode works (can view data without internet)

