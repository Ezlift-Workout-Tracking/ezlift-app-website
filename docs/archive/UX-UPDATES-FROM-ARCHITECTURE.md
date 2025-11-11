# UX Document Updates from Architecture Decisions

**Date**: 2025-01-10  
**From**: Winston (Architect)  
**To**: Sally (UX Expert)  
**Re**: Critical UX Changes for MVP - User Data State Constraint

---

## Executive Summary

The architecture work has revealed a **critical MVP constraint** that fundamentally changes user flows and wireframes:

**🔴 CRITICAL CHANGE**: Program Builder access depends on user data state

**New Users** (no existing data):
- ✅ Full Program Builder access (create/edit/delete)
- ✅ Complete 9-step onboarding (including Steps 7-9: Program Setup)

**Existing Users** (have mobile app data):
- ❌ Program Builder **READ-ONLY** (view programs, cannot edit)
- ✅ Abbreviated 6-step onboarding (skip Steps 7-9: Program Setup)
- 💬 Message: "Full program editing coming soon. Use mobile app to edit programs."

**Why**: Prevents mobile/web sync conflicts in MVP. Backend REST APIs don't use WatermelonDB sync endpoints yet. This constraint is removed in Phase 2 (WatermelonDB integration).

---

## Required UX Document Updates

### 1. **Update UX Design Brief** (`docs/ux-design-brief.md`)

#### Add New Section: "MVP Technical Constraint - User Data State"

**Insert after "MVP Scope & Constraints" section** (around line 106):

```markdown
### MVP Technical Constraint: User Data State 🔴

**Critical Design Implication**: User data state determines feature access

**User Classification**:

**New Users** (No existing workout data):
- **Definition**: User has zero workouts, zero programs, zero sessions in backend
- **Detection**: Web app queries backend on login (GET /api/workout + GET /api/logs, limit 1 each)
- **Onboarding**: Full 9-step flow including Program Setup (Steps 7-9)
- **Program Builder**: ✅ Full create/edit/delete access
- **Dashboard**: Mostly empty states with CTAs
- **Why This Works**: Programs created on web → Mobile syncs down on first login → Perfect sync

**Existing Users** (Have mobile app data):
- **Definition**: User has workouts/programs/sessions from mobile app
- **Detection**: Backend API returns results for workouts or sessions
- **Onboarding**: Abbreviated 6-step flow (Steps 1-6 only, skip program setup)
- **Program Builder**: ❌ Read-only view + "Use mobile app to edit" message
- **Dashboard**: Fully populated with mobile-tracked data
- **Why This Constraint**: Prevents sync conflicts until Phase 2 (WatermelonDB)

**UX Messaging Strategy**:

**For Existing Users (Program Builder Blocked)**:
```
┌──────────────────────────────────────────────────────┐
│ ℹ️  Full Program Editing Coming Soon                 │
│                                                       │
│ Program creation and editing is currently available  │
│ for new accounts only. For existing users, full      │
│ editing capabilities will be available in our next   │
│ update.                                              │
│                                                       │
│ Why? This ensures your data stays perfectly synced   │
│ between web and mobile.                              │
│                                                       │
│ For now, you can:                                    │
│ • View your existing programs (created on mobile)    │
│ • Use the mobile app to edit or create programs      │
│ • Import workout history from Hevy or Strong         │
│ • View analytics and progress on your dashboard      │
│                                                       │
│ [View My Programs]  [Download Mobile App]            │
└──────────────────────────────────────────────────────┘
```

**Tone**: Positive, educational, not apologetic
- Emphasize what they CAN do (dashboard, analytics, import, view programs)
- Explain the technical reason (sync integrity)
- Provide alternatives (mobile app for editing)
- Show timeline ("next update" = Phase 2)

**Phase 2 Removes Constraint**:
- When web app migrates to WatermelonDB (4 weeks post-MVP)
- All users will have full program editing on web
- Perfect bidirectional sync (web ↔ mobile)
```

---

#### Update "What's OUT of Scope for MVP" Section

**Current** (line 82-90):
```markdown
### What's OUT of Scope for MVP

- Full routine/builder authoring or editing flows (future)
- Deep analytics beyond weekly overview (future)
- AI assistant modes (Coach/Analyst/Advisor) (future)
...
```

**Change to**:
```markdown
### What's OUT of Scope for MVP

- **Program editing for existing users** (read-only view; full editing in Phase 2) ← NEW
- Deep analytics beyond weekly overview (future)
- AI assistant modes (Coach/Analyst/Advisor) (future)
- MCP/Token-gated data export (future)
- Direct Google Sheets sync and health platform integrations (future)
- Coach collaboration/sharing features (future)
- **Live workout tracking/logging** (mobile-only permanently)
- **Offline support** (Phase 2 with WatermelonDB)
```

**Explanation**: Add clarification that program builder is available for new users only in MVP.

---

#### Update "Workflow 2: Existing User with Data"

**Current** (lines 153-185):
Shows existing users can "Edit existing workouts" and "Create complex new routines"

**Change to** (lines 160-162):
```markdown
**Context**: User comes to web for desktop advantages:
- More sophisticated stats visualization
- Import/export data management
- **View existing programs** (read-only in MVP; editing available on mobile)  ← CHANGED
- Review long-term progress on bigger screen
- **Future (Phase 2)**: Edit programs on web with full sync  ← NEW
```

**And update line 181** (Expected Dashboard Interactions):
```markdown
4. **Manage data**: Import/export options
5. **View programs**: See program structure (read-only; edit on mobile)  ← CHANGED
6. **Edit profile**: Units, bodyweight, preferences
```

---

### 2. **Update User Flows** (`docs/web-app-user-flows.md`)

#### Add User Data State Detection Section

**Insert after "Overview" section** (around line 22):

```markdown
## User Data State & Flow Branching 🔴

**Critical MVP Constraint**: User flows branch based on whether user has existing data

### User State Detection

**On Login/Signup Completion**:
```typescript
const userState = await checkUserDataState(userId);
// Queries: GET /api/workout?limit=1 + GET /api/logs?limit=1

if (has workouts OR has sessions) {
  userState = 'existing';  // Has mobile app data
} else {
  userState = 'new';  // First-time user or web-first user
}
```

**States**:
- **'new'**: No workouts, no sessions → Full feature access
- **'existing'**: Has data from mobile → Limited feature access
- **'unknown'**: Detection failed → Default to 'existing' (safe mode)

### Feature Access by User State

| Feature | New User | Existing User |
|---------|----------|---------------|
| **Onboarding Steps** | 1-9 (full) | 1-6 (skip program setup) |
| **Program Builder** | ✅ Create/Edit/Delete | ❌ View Only |
| **Program Viewing** | ✅ | ✅ |
| **Dashboard** | ✅ (empty states) | ✅ (populated) |
| **History** | ✅ (empty) | ✅ (mobile data) |
| **CSV Import** | ✅ | ✅ |
| **Profile Edit** | ✅ | ✅ |

### Why This Constraint

**Technical Reason**:
- Mobile app uses WatermelonDB sync (Changes table)
- Web app MVP uses direct REST APIs (no Changes table writes)
- Allowing existing users to edit creates sync conflicts
- New users safe (mobile syncs down web-created programs on first login)

**Removed in Phase 2**: WatermelonDB integration enables full editing for all users
```

---

#### Update Flow 1 - Add Branching After Step 6

**Current**: Steps 7-9 shown for all new users

**Add after Step 6** (Equipment Available):

```markdown
---

#### CRITICAL BRANCHING POINT: User Data State Check

**After Step 6 Completion**:

```typescript
const { data: userState } = useUserDataState();

if (userState?.state === 'existing') {
  // EXISTING USER PATH
  showExistingUserTransition();
} else {
  // NEW USER PATH
  continueToStep7();
}
```

---

##### Path A: Existing User (Has Mobile Data)

**Trigger**: User data state check returns 'existing' after Step 6

**Flow**:
1. User completes Step 6 (Equipment Available)
2. System detects existing data (has workouts or sessions)
3. Show transition screen:

```
┌───────────────────────────────────────────┐
│         Welcome Back! 👋                  │
│                                           │
│ Your programs and workouts from the       │
│ mobile app are ready to view.             │
│                                           │
│ Your dashboard has:                       │
│ • Training volume and stats               │
│ • Workout history                         │
│ • Personal records                        │
│ • Progress tracking                       │
│                                           │
│ [Go to Dashboard →]                       │
└───────────────────────────────────────────┘
```

4. Redirect to Dashboard (populated with mobile data)
5. Skip Steps 7-9 (Program Setup) entirely

**Analytics Event**:
```
Onboarding Completed
  - userState: 'existing'
  - completedSteps: 6
  - programSetup: 'skipped_has_mobile_data'
  - redirectTo: 'dashboard'
```

---

##### Path B: New User (No Existing Data)

**Trigger**: User data state check returns 'new' after Step 6

**Flow**:
1. User completes Step 6 (Equipment Available)
2. System detects no existing data
3. Continue to Step 7 (Program Setup: "Do you have a program?")
4. Complete Steps 7-9 based on choice
5. Redirect to Dashboard after program setup

**Analytics Event**:
```
Onboarding Completed
  - userState: 'new'
  - completedSteps: 9
  - programSetup: 'created' | 'selected' | 'skipped'
  - redirectTo: 'dashboard'
```

---

**Update Onboarding Step 7** note:
```markdown
⚠️ **Note**: This step (and Steps 8-9) only shown to NEW USERS.
Existing users skip directly to dashboard after Step 6.
```
```

---

#### Update Flow 2 (Existing User) - Add Onboarding

**Current**: Shows "No onboarding" for existing users (line 534)

**Change to**:
```markdown
**After successful login**:
- **Abbreviated onboarding** (if first web login)
- **Steps 1-6 only**: Personal info through Equipment (for future features)
- **Skip Steps 7-9**: Program setup (user already has programs from mobile)
- **Direct redirect to**: `/dashboard` (populated)

**Onboarding Purpose for Existing Users**:
- Collect web preferences (analytics only, not persisted in MVP)
- Track user characteristics for product insights (Amplitude events)
- Can skip entirely if user wants (all steps skippable)
```

---

#### Add Section: "Decision Point 5: Onboarding Branching (NEW)"

**Insert before "User Flow Differences" table** (around line 689):

```markdown
---

### Decision Point 5: Onboarding Branching After Step 6 ⚠️ NEW
**Trigger**: User completes Step 6 (Equipment Available)  
**Logic**:

```typescript
// Check user data state
const userState = await checkUserDataState(userId);

if (userState === 'existing') {
  // Has mobile app data
  analytics.track('Onboarding Branched', {
    userState: 'existing',
    stepsCompleted: 6,
    action: 'skip_to_dashboard'
  });
  
  showTransitionScreen({
    title: 'Welcome Back!',
    message: 'Your programs from mobile are ready to view.',
    cta: 'Go to Dashboard'
  });
  
  router.push('/app');  // Skip Steps 7-9
  
} else {
  // New user (no data)
  analytics.track('Onboarding Continued', {
    userState: 'new',
    nextStep: 7
  });
  
  router.push('/onboarding/program');  // Continue to Step 7
}
```

**User Experience**:
- **Existing users**: See welcoming message explaining their data is ready, skip program setup
- **New users**: Continue naturally to program setup (unaware of branching)
```

---

#### Update "User Flow Differences" Table

**Add rows for Onboarding and Program Builder**:

```markdown
| Aspect | New User (Cold Start) | Existing User (Has Mobile Data) |
|--------|----------------------|----------------------------------|
| **Entry Point** | Public site → Signup → Onboarding (9 steps) | Login → Onboarding (6 steps) ← UPDATED |
| **Onboarding** | Required (9-step flow with questions) | Abbreviated (6 steps, skip program setup) ← UPDATED |
| **Dashboard State** | Empty or partial (depends on selections) | Fully populated with synced data |
| **Primary Goal** | Set up program + get started tracking | Access analytics, view programs |
| **Import Need** | Optional (if coming from other app) | Not needed (data already synced) |
| **Mobile App CTA** | Prominent (need to download for tracking) | Less prominent (already have app) |
| **Program Setup** | Must create/select during onboarding | Skipped (already has programs) ← UPDATED |
| **Program Builder Access** | ✅ Full (create/edit/delete) | ❌ View only (read-only) ← NEW |
| **Program Viewing** | ✅ | ✅ |
```

---

### 3. **Update Wireframes** (`docs/wireframes.md`)

#### Add New Wireframe: Onboarding Transition for Existing Users

**Insert after Section 1.7 (Onboarding Step 6: Equipment Available)**:

```markdown
---

## 1.7.1 Onboarding Branching - Existing User Transition ⚠️ NEW

**Triggered when**: User completes Step 6 and system detects existing data

**Route**: `/onboarding/transition` (intermediate screen before dashboard)

### Desktop Layout

\`\`\`
┌──────────────────────────────────────────────────────────────────────────────┐
│  [EZLift Logo]                                                               │
│                                                                              │
│                                                                              │
│                    ● ● ● ● ● ● ✓ ✓ ✓                                        │
│                      Onboarding Complete                                    │
│                                                                              │
│                                                                              │
│                           Welcome Back! 👋                                  │
│                  Your data from the mobile app is ready                     │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  Your Dashboard Includes:              │                     │
│              │  ─────────────────────────────────     │                     │
│              │                                        │                     │
│              │  ✅ Training volume and stats          │                     │
│              │  ✅ Workout history ({X} sessions)     │                     │
│              │  ✅ Personal records                   │                     │
│              │  ✅ Progress tracking                  │                     │
│              │  ✅ Your programs (view-only)          │                     │
│              │                                        │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              💡 Tip: Full program editing on web will be available          │
│                 in our next update. For now, use the mobile app             │
│                 to create or edit programs.                                 │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │        [Go to Dashboard →]             │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
\`\`\`

**Design Specs**:
- Progress indicator shows Steps 7-9 auto-completed (checkmarks)
- Welcoming tone (not apologetic or limiting)
- Shows value (what they DO have access to)
- Brief explanation of program editing constraint
- Positive framing ("next update")
- Single clear CTA: Go to Dashboard
- {X} is dynamic (shows actual session count from their mobile data)

**Analytics Event**:
```
Existing User Onboarding Completed
  - workoutCount: number
  - programCount: number
  - sessionCount: number
  - stepsCompleted: 6
```

---
```

#### Add New Wireframe: Program Builder Blocked State (Existing Users)

**Insert after Section 1.10 (Program Builder)**:

```markdown
---

## 1.10.1 Program Builder - Blocked State (Existing Users) ⚠️ NEW

**Route**: `/programs/create`

**Triggered when**: Existing user tries to access Program Builder

**Purpose**: Gracefully block access while showing value and alternatives

### Desktop Layout

\`\`\`
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]      Program Builder                               │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  ℹ️  Full Program Editing Coming Soon                                │   │
│  │  ───────────────────────────────────────────────────────────────     │   │
│  │                                                                       │   │
│  │  Program creation and editing is currently available for new         │   │
│  │  accounts only. For existing users, full editing capabilities will   │   │
│  │  be available in our next update.                                    │   │
│  │                                                                       │   │
│  │  **Why this limitation?**                                            │   │
│  │  This ensures your data stays perfectly synced between web and       │   │
│  │  mobile. Our next update will enable full editing for everyone!      │   │
│  │                                                                       │   │
│  │  **What you can do now:**                                            │   │
│  │                                                                       │   │
│  │  ✅ View your existing programs (created on mobile app)              │   │
│  │  ✅ Use the mobile app to create or edit programs                    │   │
│  │  ✅ Import workout history from Hevy or Strong                       │   │
│  │  ✅ View analytics and progress on your dashboard                    │   │
│  │  ✅ Track all your workouts on the mobile app                        │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  📋 Your Programs ({Y} total)                                        │   │
│  │  ───────────────────────────────────────────────────────────────     │   │
│  │                                                                       │   │
│  │  • Push/Pull/Legs - Intermediate                    [View Details]   │   │
│  │  • Upper/Lower Split                                [View Details]   │   │
│  │  • Full Body - 3x/week                              [View Details]   │   │
│  │                                                                       │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                                                                              │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐   │
│  │  [View All Programs →]   │  │  [Download Mobile App]               │   │
│  └──────────────────────────┘  └──────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  [Import Workout History]                                            │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
\`\`\`

**Design Specs**:
- Alert/Info card: Light blue background (#eff6ff), blue border (#2563eb), rounded 12px
- Icon: Info icon (ℹ️), 24px, blue, top-left of card
- Heading: "Coming Soon" (positive framing, not "Access Denied")
- Body text: 16px, gray, explains why + what they can do
- Checklist: Green checkmarks (✅), 16px, left-aligned
- Program list: Shows user's existing programs (from mobile)
- CTAs: 
  - Primary: "View All Programs" (blue, takes to programs list page)
  - Secondary: "Download Mobile App" (gray, opens app store)
  - Tertiary: "Import Workout History" (gray, opens import flow)
- Back button: Returns to dashboard

**Analytics Events**:
```
Program Builder Access Blocked
  - userState: 'existing'
  - programCount: number
  - source: 'direct_navigation' | 'onboarding' | 'dashboard_cta'

Program Builder Blocked CTA Clicked
  - action: 'view_programs' | 'download_app' | 'import_history'
```

**Tone**: Positive, not restrictive
- Focus on what they CAN do, not what they can't
- Educational (explain why)
- Forward-looking ("next update")
- Provide clear alternatives (view programs, use mobile, import)

---
```

#### Update Section 1.8 (Program Setup Step 7)

**Add note at the beginning**:
```markdown
## 1.8 Onboarding Step 7: Program Setup (`/onboarding/program`)

⚠️ **ONLY SHOWN TO NEW USERS** - Existing users skip to dashboard after Step 6

**Prerequisite**: User data state = 'new' (no existing workouts/sessions)
```

---

#### Update Sections 1.9 and 1.10 (Describe Program, Program Builder)

**Add note at the beginning of each**:
```markdown
⚠️ **Access Control**: Only accessible to users with userState = 'new'

**For existing users**: Show blocked state (see Section 1.10.1)
```

---

### 4. **Analytics Event Updates**

#### Add to UX Design Brief - Analytics Section

**New Events to Add** (around line 730):

```markdown
**User State Events** (NEW):
```
User Data State Detected
  - state: 'new' | 'existing' | 'unknown'
  - hasWorkouts: boolean
  - hasSessions: boolean
  - hasRoutines: boolean

Onboarding Branched
  - userState: 'existing'
  - stepsCompleted: 6
  - action: 'skip_to_dashboard'

Program Builder Access Blocked
  - userState: 'existing'
  - programCount: number
  - source: 'direct_navigation' | 'onboarding' | 'dashboard_cta'

Program Builder Blocked CTA Clicked
  - action: 'view_programs' | 'download_app' | 'import_history'

Existing User Welcomed
  - sessionCount: number
  - programCount: number
  - latestWorkoutDate: string
```
```

---

## Summary of Changes

### UX Design Brief Updates:
1. ✅ Add "MVP Technical Constraint: User Data State" section
2. ✅ Update "Out of Scope" to clarify program builder limitation
3. ✅ Update existing user workflow (read-only programs)
4. ✅ Add new analytics events (user state detection, blocked access)

### User Flows Updates:
1. ✅ Add "User Data State & Flow Branching" overview section
2. ✅ Add branching logic after Onboarding Step 6
3. ✅ Add Existing User Transition flow (6-step → dashboard)
4. ✅ Add New User continuation (9-step → program setup)
5. ✅ Update existing user login flow (mention 6-step onboarding)
6. ✅ Update flow differences table (add onboarding steps, program access)
7. ✅ Add Decision Point 5 (onboarding branching)

### Wireframes Updates:
1. ✅ Add Section 1.7.1: Existing User Transition Screen (after Step 6)
2. ✅ Add Section 1.10.1: Program Builder Blocked State (for existing users)
3. ✅ Add notes to Steps 7-9 (new users only)
4. ✅ Add notes to Program Builder sections (access control)

---

## UX Messaging Principles

**For Existing Users (Seeing Read-Only Message)**:

**Do**:
- ✅ Emphasize what they CAN do (dashboard, analytics, import, view programs)
- ✅ Explain WHY briefly and clearly (sync integrity)
- ✅ Provide alternatives (mobile app for editing, import history)
- ✅ Show timeline ("next update" = Phase 2)
- ✅ Use positive, welcoming tone

**Don't**:
- ❌ Apologize excessively ("Sorry, you can't...")
- ❌ Technical jargon (don't mention "WatermelonDB" or "Changes table")
- ❌ Make it feel like punishment
- ❌ Hide their existing programs (show them! Just read-only)
- ❌ Block all features (dashboard, history, import still work)

**Tone Examples**:
- ✅ "Coming Soon" (positive, forward-looking)
- ✅ "Available in next update" (gives hope, shows it's prioritized)
- ✅ "Ensures data stays synced" (explains benefit)
- ❌ "Not available yet" (negative framing)
- ❌ "Sorry, you don't have access" (punitive)
- ❌ "For technical reasons..." (too much detail)

---

## Implementation Checklist for UX Expert

### Immediate Updates:

- [ ] **UX Design Brief** (`docs/ux-design-brief.md`):
  - [ ] Add "MVP Technical Constraint" section (after line 106)
  - [ ] Update "Out of Scope" section (line 83)
  - [ ] Update "Workflow 2: Existing User" section (lines 153-185)
  - [ ] Add new analytics events to event taxonomy (line 730+)

- [ ] **User Flows** (`docs/web-app-user-flows.md`):
  - [ ] Add "User Data State & Flow Branching" section (after line 22)
  - [ ] Add branching logic after Step 6 (new section)
  - [ ] Update existing user login flow (line 534)
  - [ ] Add Decision Point 5 (before line 689)
  - [ ] Update flow differences table (lines 692-702)

- [ ] **Wireframes** (`docs/wireframes.md`):
  - [ ] Add Section 1.7.1: Existing User Transition Screen
  - [ ] Add Section 1.10.1: Program Builder Blocked State
  - [ ] Add access control notes to Steps 7-9 (lines 510-633)
  - [ ] Add access control notes to Program Builder (lines 635-1099)

### Review After Updates:

- [ ] Verify all user flows account for user data state
- [ ] Ensure messaging is consistent (positive, welcoming)
- [ ] Confirm wireframes show both new and existing user paths
- [ ] Validate analytics events cover all branching scenarios

---

## Questions for UX Expert

1. **Onboarding Skip Behavior**: If an existing user clicks "Skip" during abbreviated onboarding (Steps 1-6), should they go straight to dashboard without completing any steps?

2. **Transition Screen Design**: Do you prefer the full-screen transition (as wireframed) or a simpler toast/banner?

3. **Program Builder Blocked Messaging**: Is the suggested copy too technical or just right for transparency?

4. **Analytics Tracking**: Should we also track HOW MANY TIMES existing users try to access Program Builder (to measure demand for Phase 2)?

5. **Mobile Web Experience**: Should existing users on mobile browsers ALSO see the read-only constraint, or push them even harder to download the app?

---

## Phase 2 Considerations

**When Phase 2 Launches** (WatermelonDB integration):

**UX Changes Needed**:
1. Remove all "new user only" constraints
2. Remove "coming soon" messaging
3. Update analytics events (remove "blocked" events)
4. Update user flows (remove branching logic)
5. Update wireframes (remove blocked state screens)

**Keep**:
- User data state detection (for other purposes)
- Onboarding questions (will be persisted to backend in Phase 2)
- Program builder design (same UI, just accessible to all)

---

## Next Steps

1. **Sally reviews this document** and asks clarifying questions
2. **Sally updates the 3 UX documents** based on recommendations
3. **Winston (Architect) reviews** updated UX docs for technical accuracy
4. **PM uses updated UX docs** when refining PRD
5. **All documents sharded** when ready for story creation

---

**This is a critical update!** The user data state constraint fundamentally changes onboarding flows and program builder access. Please prioritize these UX updates. 🎨

