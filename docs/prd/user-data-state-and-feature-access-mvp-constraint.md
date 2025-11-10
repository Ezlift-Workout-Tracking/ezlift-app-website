# User Data State & Feature Access (MVP Constraint)

## User Classification

The web app MVP classifies users into two states to ensure mobile/web data synchronization:

**New Users** (No existing data):
- **Definition**: User has zero workouts, zero programs, zero sessions
- **Detection**: Query backend on login for existing data (`GET /api/workout?limit=1` + `GET /api/logs?limit=1`)
- **Feature Access**: Full program creation and editing capabilities

**Existing Users** (Have mobile app data):
- **Definition**: User has workouts/programs/sessions from mobile app
- **Detection**: API returns results for `GET /api/workout` or `GET /api/logs`
- **Feature Access**: Read-only program viewing, full dashboard/history/import

## Feature Access Matrix

| Feature | New User | Existing User | Phase 2 (All Users) |
|---------|----------|---------------|---------------------|
| Dashboard | ✅ Full (likely empty) | ✅ Full (populated) | ✅ Full |
| History View | ✅ (empty state) | ✅ (mobile data) | ✅ (synced) |
| CSV Import | ✅ Full access | ✅ Full access | ✅ Full access |
| Profile Edit | ✅ Full access | ✅ Full access | ✅ Full access |
| Program Builder | ✅ **Create/Edit/Delete** | ❌ **View Only** | ✅ **Create/Edit/Delete** |
| Program View | ✅ | ✅ | ✅ |

## Rationale

**Why This Constraint**:
- Mobile app uses WatermelonDB sync (`push-changes`/`pull-changes` endpoints)
- Web app MVP uses direct REST APIs (`POST /api/routine`, etc.)
- Backend REST endpoints write to Changes table (Option A confirmed working)
- Existing users' mobile data tracked via Changes table
- Preventing existing users from editing on web avoids any potential sync edge cases

**User Experience**:
- **New users**: Create programs on web → Mobile syncs down on first login → Perfectly in sync
- **Existing users**: See message: "Full program editing coming soon. Use mobile app to edit programs."

**Phase 2 Removes This Constraint**: 
When web app migrates to WatermelonDB (Phase 2), all users will have full editing capabilities on both web and mobile with perfect synchronization.

