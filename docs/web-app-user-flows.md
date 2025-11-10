# EZLift Web App - User Flows

**Document Version**: 1.0  
**Last Updated**: 2025-01-08  
**Author**: Sally (UX Expert)  
**Status**: Validated with Stakeholder

---

## Overview

This document defines the complete user flows for the EZLift Web App MVP, covering both new users (cold start) and existing users (with mobile app data). These flows inform all wireframe and implementation work.

**Key Principles**:
- Dashboard-first experience (unlike Hevy's mobile funnel approach)
- Import is for **history/stats only**, not programs
- Import is **optional and separate** from program creation
- Onboarding adapted from mobile app pattern
- Clear differentiation between new vs existing user experiences
- **User data state determines feature access** (critical MVP constraint)

---

## User Data State & Flow Branching 🔴

**Critical MVP Constraint**: User flows branch based on whether user has existing data

### User State Detection

**On Login/Signup Completion**:
```typescript
const userState = await checkUserDataState(userId);
// Queries: GET /api/workout?limit=1 + GET /workout-log (all sessions)

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
| **Onboarding Steps** | 1-9 (full) | **None** (skip entirely) |
| **Program Builder** | ✅ Create/Edit/Delete | ❌ View Only |
| **Program Viewing** | ✅ | ✅ |
| **Dashboard** | ✅ (empty states) | ✅ (populated) |
| **History** | ✅ (empty) | ✅ (mobile data) |
| **CSV Import** | ✅ | ✅ |
| **Profile Edit** | ✅ | ✅ |

### Why This Constraint

**Technical Reason**:
- Mobile app uses WatermelonDB sync (Changes table)
- Web app MVP uses direct REST APIs (Changes table writes confirmed working)
- Allowing existing users to edit prevents sync conflicts
- New users safe (mobile syncs down web-created programs on first login)

**Removed in Phase 2**: WatermelonDB integration enables full editing for all users

---

## Flow 1: New User Journey (Cold Start - Web Discovery)

### Entry Point
User discovers EZLift via marketing campaign, ad, search, or referral → lands on **public website** (`ezlift.app`)

---

### Step 1: Public Website Landing (`/`)

**User sees**:
- Hero section with value proposition
- Features overview
- Pricing information
- Social proof (testimonials, app ratings)

**Primary CTAs**:
- "Get Started" (hero CTA)
- "Sign Up" (header navigation)
- "Try EZLift" (throughout page)

**Next**: User clicks any CTA → Device detection logic

---

### Step 2: Device Detection & Routing

**Automatic detection based on user agent:**

#### If Mobile Browser (iOS/Android):
- **Show modal/banner**: 
  - Heading: "Get the best experience"
  - Message: "EZLift is optimized for [iOS/Android]. Download the app for seamless workout tracking!"
  - Primary CTA: "Download App" → App Store/Google Play
  - Secondary CTA: "Continue on Web" → Proceed to signup
- **Recommended**: Push to mobile app strongly

#### If Desktop Browser:
- **Proceed directly to signup flow**
- This is the target path for web onboarding

**Next**: Desktop users → Signup page

---

### Step 3: Signup Page (`/signup`)

**Content**:
- Heading: "Create your EZLift account"
- Subheading: "Start tracking smarter today"

**Form Elements**:
- **Social Login** (prominent):
  - "Sign up with Google" (Google logo + button)
  - "Sign up with Apple" (Apple logo + button)
- **Divider**: "Or with email"
- **Email input**: "Email address"
- **Password input**: "Password" (with show/hide toggle)
- **Terms**: Checkbox "I agree to Terms & Conditions and Privacy Policy"
- **CTA**: "Create Account" (full-width blue button)

**Footer Links**:
- "Already have an account? **Login**"

**After successful signup**: 
- Create user account
- **Redirect to**: `/onboarding/profile` (Step 1 of onboarding)

---

### Step 4: Onboarding Flow (7-9 Steps)

**Visual Pattern**:
- Progress indicator at top (9 circles/dots, current step highlighted)
- Back arrow (top-left) to go to previous step
- "Skip" link (top-right, orange button) to skip to dashboard
- Clean, centered layout with generous white space
- One primary task per screen

**Progress Indicator Pattern** (from mobile app):
- Total steps: 9 (confirmed from mobile app screenshots)
- Current step: Filled with blue/orange
- Future steps: Light gray outlines
- Shows "X of 9" below progress dots

---

#### Onboarding Step 1: Personal Info (`/onboarding/profile`)

**Progress**: ● ○ ○ ○ ○ (1 of 5)

**Content**:
- Heading: "Tell us about yourself"
- Subheading: "This helps us personalize your experience"

**Form Fields**:
1. **Gender** (Radio buttons, horizontal):
   - Male
   - Female
   - Other
   - Prefer not to say

2. **Age Range** (Dropdown or radio buttons):
   - 18-25
   - 26-35
   - 36-45
   - 46-55
   - 56+
   - Prefer not to say

**CTA**: "Next" (full-width button)  
**Skip**: "Skip for now" link

**Next**: `/onboarding/frequency`

---

#### Onboarding Step 2: Training Frequency (`/onboarding/frequency`)

**Progress**: ● ● ○ ○ ○ (2 of 5)

**Content**:
- Heading: "How often do you train?"
- Subheading: "We'll use this to recommend programs"

**Options** (Single-select cards, vertically stacked):
- **1-2 times per week** (icon: calendar with 1-2 dots)
- **3-4 times per week** (icon: calendar with 3-4 dots) ← Most common
- **5-6 times per week** (icon: calendar with 5-6 dots)
- **7+ times per week** (icon: calendar filled)

**Visual**: Each card has:
- Icon (left)
- Text (center)
- Radio button indicator (right, appears when selected)

**Selected state**: Blue border, blue background

**CTA**: "Next" (enabled after selection)  
**Skip**: "Skip for now" link

**Next**: `/onboarding/duration`

---

#### Onboarding Step 3: Training Duration (`/onboarding/duration`)

**Progress**: ● ● ● ○ ○ ○ ○ ○ ○ (3 of 9)

**Content**:
- Heading: "What is your average training duration?"
- Subheading: "This helps us recommend suitable programs"

**Options** (Single-select cards, vertically stacked):
- **30 Minutes or Less**
- **30-45 Minutes**
- **45-60 Minutes** ← Common for intermediate lifters
- **60+ Minutes**

**Visual**: Same card pattern as training frequency

**CTA**: "Next" (enabled after selection)  
**Skip**: "Skip for now" link

**Next**: `/onboarding/experience`

---

#### Onboarding Step 4: Experience Level (`/onboarding/experience`)

**Progress**: ● ● ● ● ○ ○ ○ ○ ○ (4 of 9)

**Content**:
- Heading: "What's your training experience?"
- Subheading: "This helps us match you with the right programs"

**Options** (Single-select cards):
- **Beginner** - "Less than 6 months"
- **Intermediate** - "6 months to 2 years"
- **Advanced** - "2 to 5 years"
- **Expert** - "5+ years"

**CTA**: "Next"  
**Skip**: "Skip for now"

**Next**: `/onboarding/goals`

---

#### Onboarding Step 4: Goals (`/onboarding/goals`)

**Progress**: ● ● ● ● ○ (4 of 5)

**Content**:
- Heading: "What are your primary goals?"
- Subheading: "Select all that apply"

**Options** (Multi-select cards, can select multiple):
- **Build Muscle** (icon: bicep)
- **Increase Strength** (icon: barbell)
- **Lose Weight** (icon: scale)
- **Improve Endurance** (icon: heart/running)
- **General Fitness** (icon: star)
- **Athletic Performance** (icon: trophy)

**Selected state**: Blue border, blue checkmark (top-right of card)

**CTA**: "Next" (enabled after at least one selection)  
**Skip**: "Skip for now"

**Next**: `/onboarding/equipment`

---

#### Onboarding Step 6: Equipment Available (`/onboarding/equipment`)

**Progress**: ● ● ● ● ● ● ○ ○ ○ (6 of 9)

**Content**:
- Heading: "What equipment do you have access to?"
- Subheading: "Select all that apply"

**Options** (Multi-select cards, grid layout):
- **Free Weights** (icon: dumbbell) - Barbells, dumbbells, kettlebells
- **Machines** (icon: machine) - Cable machines, smith machine, leg press
- **Resistance Bands** (icon: band)
- **Bodyweight** (icon: person) - No equipment needed
- **Cardio Equipment** (icon: treadmill) - Treadmill, bike, rower
- **Other** (icon: plus)

**Visual**: 2×3 grid on desktop, same card style as Goals step

**Selected state**: Blue background, blue checkmark (top-right of card), white text

**CTA**: "Next" (enabled after at least one selection)  
**Skip**: "Skip for now"

**Next**: BRANCHING POINT (see below)

---

#### CRITICAL BRANCHING POINT: User Data State Check

**After Login/Signup** (Before any onboarding):

```typescript
const { data: userState } = useUserDataState();

if (userState?.state === 'existing') {
  // EXISTING USER: Skip onboarding entirely
  router.push('/app');  // Direct to dashboard
} else {
  // NEW USER: Show full onboarding
  router.push('/onboarding/profile');  // Start Step 1
}
```

---

##### Path A: Existing User (Has Mobile Data)

**Trigger**: User data state check returns 'existing' immediately after login

**Flow**:
1. User logs in successfully
2. System detects existing data (has workouts or sessions)
3. **Skip all onboarding steps** (they already onboarded on mobile)
4. **Direct redirect to Dashboard** (populated with mobile data)
5. No transition screen needed

**Why No Onboarding**:
- User already answered onboarding questions on mobile app
- Repeating questions is redundant and creates friction
- Faster time to value (straight to their data)

**Analytics Event**:
```
User Data State Detected
  - state: 'existing'
  - hasWorkouts: boolean
  - hasSessions: boolean
  - redirectTo: 'dashboard_direct'
```

---

##### Path B: New User (No Existing Data)

**Trigger**: User data state check returns 'new' after signup or first login

**Flow**:
1. User signs up or logs in (first time)
2. System detects no existing data
3. **Show full 9-step onboarding** (Steps 1-9)
4. Complete all steps based on user choices
5. Redirect to Dashboard after program setup (or skip)

**Analytics Event**:
```
User Data State Detected
  - state: 'new'
  - redirectTo: 'onboarding'

Onboarding Started
  - totalSteps: 9
```

---

#### Onboarding Step 7: Program Setup (`/onboarding/program`)

⚠️ **ONLY SHOWN TO NEW USERS** - Existing users skip to dashboard after Step 6

**Prerequisite**: User data state = 'new' (no existing workouts/sessions)

**Progress**: ● ● ● ● ● ● ● ○ ○ (7 of 9)

**Content**:
- Heading: "Do you already have a training program?"
- Subheading: "We can help you get started either way"

**Two Primary Options** (Large cards, single-select):

---

##### **Option A: "Yes, I have a program"** ✅

**Auto-loads Describe Program screen** (no intermediate choice screen)

**Primary Action: Describe Your Program**
- **Screen content**:
  - Heading: "Describe your training program"
  - Subheading: "Tell us about your routine, and we'll help you set it up"
  - **Large text area** (600px × 300px):
    - Placeholder: "e.g., 'I do Push/Pull/Legs 6 days per week. Push day: Bench press, overhead press, dips...'"
    - Character counter: "X / 2000"
  - **Voice button** (🎤): Records and transcribes to text area
  - **Tip**: "💡 Include workout names, exercises, and frequency for best results"
  - **Primary CTA**: "Create My Program →" (orange button, full-width)
  
- **Secondary Option** (below primary CTA):
  - Small text: "Or prefer to build manually?"
  - Link: "Use our intuitive Program Builder instead →" (blue link)

**What happens**:
- **If "Create My Program"**:
  - AI (GPT API) parses description
  - Loading screen: "Analyzing your program... ⏳"
  - Creates draft program with workouts
  - Shows preview screen: "Here's your program (Preview & Edit)"
  - User can edit before confirming
  - → Dashboard with program activated

- **If "Use Program Builder instead"**:
  - → Program Builder interface (`/programs/create`)
  - Auto-starts with Workout 1 building (see Program Builder section)
  - Visual exercise grid, real-time metrics, flow-based
  - → Dashboard after saving program

**Note**: Import is NOT part of this decision - it's separate and optional (see below)

---

##### **Option B: "No, I need a program"** ✅

**When selected, show**:

**Heading**: "We'll suggest programs based on your goals"
**Subheading**: "Recommended for you"

**Program Recommendations** (3-4 cards based on frequency + goals + experience):

Each program card shows:
- **Name**: "Push/Pull/Legs - Intermediate"
- **Duration**: "3 days/week • 60-75 min per session"
- **Focus**: "Muscle building, strength"
- **Preview**: "Day 1: Push (Chest, Shoulders, Triceps), Day 2: Pull (Back, Biceps)..."
- **CTA**: "Select This Program" button

**Below recommendations**:
- Secondary CTA: "Browse All Programs" → Program library
- Tertiary CTA: "I'll build my own" → Routine Builder

**What happens after selection**:
- Program is added to user's routines
- Set as "Active Program"
- → Dashboard with program card populated

---

##### **Option C: "Skip" / "I'll decide later"** ✅

**Always available**: "Skip for now" link at top-right

**What happens**:
- User proceeds to dashboard
- Dashboard shows **empty state**
- **But**: Program suggestions are still visible as dashboard cards/prompts
- User can still create/select program from dashboard

---

### Step 5: Optional - Import Flow (Separate from Program Setup)

**IMPORTANT**: Import is **optional** and can happen:
- During onboarding (as an additional step)
- From dashboard at any time
- Never (user tracks going forward only)

**Import Purpose**: Import **workout history** and **stats** from other apps to populate:
- Workout History
- Training Volume charts
- Personal Records (PRs)
- Progress tracking data

**Import Does NOT**: Create programs/routines for future tracking

---

#### Import Flow UI (`/import` or modal)

**Heading**: "Import Your Workout History"  
**Subheading**: "Bring your data from Hevy or Strong"

**Options**:
1. **Import from Hevy**
   - "Import Hevy CSV"
   - Instructions: "Export from Hevy settings → Upload CSV file"
   - File upload button
   
2. **Import from Strong**
   - "Import Strong CSV"
   - Instructions: "Export from Strong settings → Upload CSV file"
   - File upload button

**Process**:
1. User uploads CSV file
2. Show progress: "Parsing workouts... 45%"
3. Show summary: "Found 127 workouts, 23 exercises, 2,341 sets"
4. **Important question**: "These are past workouts. Do you want to create routines from your history?"
   - Yes → Analyze history and suggest programs
   - No → Just import data
5. Success message: "Import complete! Your stats are ready."
6. → Dashboard (now with populated history/stats)

**When to offer**:
- **During onboarding**: After program setup step (optional prompt)
  - "Want to import your workout history from another app?" with "Yes" / "Skip for now"
- **On dashboard**: Empty history cards show "Import Data" CTA
- **In settings**: Always available under "Import/Export"

---

### Step 6: First Dashboard Experience (`/dashboard`)

**Landing experience depends on path taken:**

---

#### Scenario A: Program Selected or Created + No Import

**Dashboard shows P0 cards with initial state**:

1. **Active Program Card** (top banner or first card)
   - Shows: Program name, "Week 1 of 12"
   - Next workout: "Day 1: Push - Tomorrow"
   - CTA: "View Program Details"
   - Secondary CTA: "Start Workout" (links to mobile app)

2. **Training Volume** (empty state)
   - Chart showing 0 volume this week
   - Message: "Track your first workout to see progress"
   - CTA: "Download Mobile App"

3. **Recent Workouts** (empty state)
   - Icon: clipboard
   - Message: "No workouts yet"
   - Subtext: "Workouts are tracked on the mobile app"
   - CTA: "Get the App"

4. **Progress Over Time** (empty state)
   - Empty chart with baseline
   - Message: "Your progress will appear here"
   - CTA: "Learn More"

5. **Top PRs** (empty state)
   - Icon: trophy
   - Message: "Your personal records will show here"
   - Motivational: "Track your first workout to set your baseline!"

---

#### Scenario B: No Program + No Import (Skipped Everything)

**Dashboard shows welcome state**:

**Top: Welcome Banner**
- "Welcome to EZLift, [Name]! Let's get you started"
- Dismissible (×)

**Primary Action Cards** (Large, prominent):

1. **"Choose a Program"**
   - Icon: clipboard with checkmark
   - Description: "Browse programs based on your goals"
   - CTA: "View Programs"
   - → Program library

2. **"Create a Routine"**
   - Icon: plus/builder
   - Description: "Build your own custom program"
   - CTA: "Use Routine Builder"
   - → Routine builder

3. **"Import Your Data"** (Optional)
   - Icon: upload/arrow
   - Description: "Bring your workout history from Hevy or Strong"
   - CTA: "Import History"
   - → Import flow

**Below**: P0 Dashboard Cards (all empty states with relevant CTAs)

---

#### Scenario C: Program Selected + Import Completed

**Dashboard shows populated state** (best case):

1. **Active Program Card**
   - Current program, week progress
   - Next scheduled workout
   - CTAs: "View Program" / "Start Workout"

2. **Training Volume**
   - Bar chart with imported historical data
   - Current week: 0 (no new workouts yet)
   - Shows trend from previous weeks
   - CTA: "View Details"

3. **Recent Workouts**
   - Last 3 imported workouts shown
   - Date, program, duration, exercises
   - CTA: "View Full History"

4. **Progress Over Time**
   - Line chart with historical progress
   - Dropdown to select exercise
   - Shows estimated 1RM or volume trend
   - CTA: "Analyze Progress"

5. **Top PRs**
   - List of personal records from imported data
   - Exercise, weight, date
   - CTA: "View All PRs"

---

## Flow 2: Existing User Journey (Has Mobile App Data)

### Entry Point
User with iOS/Android app (with workout data) comes to web for analytics, planning, or routine building.

---

### Step 1: Login Page (`/login`)

**Content**:
- Heading: "Welcome back to EZLift"
- Subheading: "Login to access your workouts"

**Form Elements**:
- **Social Login**:
  - "Login with Google"
  - "Login with Apple"
- **Divider**: "Or with email"
- **Email input**
- **Password input** (with show/hide toggle)
- **"Forgot password?"** link
- **CTA**: "Login" (full-width button)

**Footer**: 
- "Don't have an account? **Sign up**"

**After successful login**:
- **No onboarding** (already onboarded on mobile app)
- **Direct redirect to**: `/dashboard` (populated with mobile data)
- System detects existing data and skips all onboarding steps

**Why No Onboarding**:
- User already answered these questions on mobile (gender, frequency, goals, etc.)
- Repeating questions is redundant and annoying
- Faster time to value (straight to dashboard)
- Mobile app already captured their preferences

---

### Step 2: Dashboard Landing (`/dashboard`)

**Populated Dashboard** - All P0 cards show real data synced from mobile app:

---

#### Card 1: Training Volume (Top-Left)

**Content**:
- Heading: "Training Volume"
- Time period: "This Week" with dropdown (This Week / Last 4 Weeks / Last 12 Weeks)
- **Bar chart**: 
  - X-axis: Weeks (last 12 weeks by default)
  - Y-axis: Total sets or total volume (kg/lbs)
  - Current week highlighted in blue
  - Previous weeks in gray
- **Stats below chart**:
  - Total sets this week: "45 sets"
  - Total volume this week: "12,500 kg"
  - Trend indicator: ↑ "+15% vs last week"
- **CTA**: "View Details" (expands to detailed view)

---

#### Card 2: Top PRs / Personal Bests (Top-Right)

**Content**:
- Heading: "Personal Records"
- Subheading: "Last 30 days"
- **List** (scrollable, max 5 visible):
  - Each PR shows:
    - 🔥 Icon (if very recent, within 7 days)
    - Exercise name: "Barbell Bench Press"
    - Weight achieved: "100 kg × 5 reps"
    - Date: "2 days ago"
- **CTA**: "View All PRs"

---

#### Card 3: Recent Workouts (Bottom-Left)

**Content**:
- Heading: "Recent Workouts"
- **List** (3 most recent):
  - Each workout card shows:
    - Date: "Today, 9:30 AM" or "Yesterday" or "Jan 7"
    - Program: "Push/Pull/Legs - Week 4"
    - Duration: "1h 15min"
    - Exercises: "8 exercises, 24 sets"
    - Mini preview: Icons for muscle groups trained
- **CTA**: "View Workout History"

---

#### Card 4: Progress Over Time (Bottom-Right)

**Content**:
- Heading: "Progress Tracking"
- **Exercise selector**: Dropdown to choose exercise (default: main compound lift)
- **Time range selector**: Tabs for 4 weeks / 12 weeks / 6 months / 1 year
- **Line chart**:
  - X-axis: Time
  - Y-axis: Weight (estimated 1RM) or volume
  - Line showing progression
  - Data points clickable to see workout details
- **Stats**:
  - Starting point: "85 kg (12 weeks ago)"
  - Current: "95 kg"
  - Progress: "+10 kg (+11.8%)"
- **CTA**: "Analyze Progress" (opens detailed analytics page)

---

#### Optional Card 5: Active Program Summary (Banner or Top Card)

**Content**:
- Program name: "Push/Pull/Legs - Intermediate"
- Progress: "Week 5 of 12"
- Next scheduled: "Pull Day - Tomorrow (Thu)"
- **CTAs**:
  - "View Program Details"
  - "Edit Program"
  - "Change Program"

---

### Step 3: Navigation & Available Actions

**Left Sidebar Navigation** (always visible):

**Logo**: EZLift logo (clickable, returns to dashboard)

**Main Navigation**:
- 🏠 **Dashboard** (current page, highlighted)
- 📋 **Routines** → View/edit/create programs
- 📖 **Workout History** → Full list of past workouts
- 📊 **Progress & Analytics** → Detailed stats, charts, PRs
- ⬆️⬇️ **Import/Export** → Data portability tools
- ⚙️ **Settings** → Preferences, units, account

**Bottom Section**:
- "Upgrade to Pro" button (if free tier)
- User avatar + name
- Logout icon

---

## Key Flow Decision Points Summary

### Decision Point 1: Device Detection (Entry)
**Trigger**: User lands on public site and clicks CTA  
**Logic**:
- If mobile browser → Show "Download App" modal (with "Continue on web" option)
- If desktop browser → Proceed to signup

---

### Decision Point 2: Program Setup (Onboarding Step 5)
**Trigger**: User reaches "Do you have a program?" step  
**Flow (Simplified - No Extra Choice Screen)**:
- **Yes, I have a program** → Auto-loads **Describe Program screen**
  - Primary: Describe via text/voice (AI parses) → Preview → Dashboard
  - Secondary: "Use Program Builder instead" link → Manual building
- **No, I need a program** → Auto-loads **Program Recommendations**
  - View suggested programs → Select one → Confirm → Dashboard
- **Skip for now** → Dashboard with empty state + program suggestions

---

### Decision Point 3: Import Flow (Optional, Separate)
**Trigger**: User chooses to import (during onboarding prompt OR from dashboard)  
**Logic**:
- Select file type: Hevy CSV or Strong CSV
- Upload and parse
- Show summary and ask: "Create routines from history?" (Yes/No)
- Import workout history and stats
- → Dashboard with populated history cards

---

### Decision Point 4: Dashboard Landing (After Login)
**Trigger**: User completes onboarding or logs in  
**Logic**:
- **If new user**:
  - If program selected → Show initial state (program card + empty stats)
  - If skipped → Show empty state + program suggestions + CTAs
  - If imported → Show populated stats + program card
- **If existing user** (mobile app data):
  - Always show fully populated dashboard (all P0 cards with data)

---

## User Flow Differences: New vs Existing

| Aspect | New User (Cold Start) | Existing User (Has Mobile Data) |
|--------|----------------------|----------------------------------|
| **Entry Point** | Public site → Signup → Onboarding (9 steps) | Login → **Direct to Dashboard** |
| **Onboarding** | Required (9-step flow with questions) | **None** (already onboarded on mobile) |
| **Dashboard State** | Empty or partial (depends on selections) | Fully populated with synced data |
| **Primary Goal** | Set up program + get started tracking | Access analytics, view programs |
| **Import Need** | Optional (if coming from other app) | Optional (import additional history) |
| **Mobile App CTA** | Prominent (need to download for tracking) | Less prominent (already have app) |
| **Program Setup** | Must create/select during onboarding (Steps 7-9) | **None** (already has programs from mobile) |
| **Program Builder Access** | ✅ Full (create/edit/delete) | ❌ View only (read-only) |
| **Program Viewing** | ✅ | ✅ |

---

## Critical UX Principles for Implementation

1. **Import Clarity**: Always communicate that import is for **history/stats**, not future programs
2. **Optional Steps**: Every step can be skipped (user can always return later)
3. **Progress Indicators**: Always show where user is in multi-step flows
4. **Empty States**: Always have clear CTAs (never just blank space)
5. **Mobile App Integration**: Clear messaging about web (planning/analytics) vs mobile (tracking)
6. **Dashboard First**: Unlike Hevy, analytics are front-and-center, not hidden
7. **Smart Defaults**: Pre-select common options (3-4x/week training, intermediate level)
8. **One Task Per Screen**: During onboarding, focus user attention on single decision
9. **Reversible Actions**: User can always go back and change selections
10. **Data Sync**: Existing users should see immediate value (populated dashboard)

---

## Next Steps

- ✅ User flows validated with stakeholder
- ⏭️ Next: Create wireframes for:
  1. Onboarding screens (5 steps)
  2. Dashboard layouts (empty vs populated states)
  3. Routine builder interface
  4. Import flow screens
  5. Program selection/recommendation screens

---

## Document Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-08 | 1.0 | Initial user flows created for new and existing users | Sally (UX Expert) |
| 2025-01-08 | 1.1 | Added 2 missing onboarding steps (Training Duration, Equipment). Updated to 9-step flow. | Sally (UX Expert) |
| 2025-01-08 | 1.2 | **FLOW SIMPLIFICATION**: Removed intermediate choice screen. "Yes, I have a program" now auto-loads Describe Program screen (primary action). Secondary option: Link to Program Builder. Applies UX philosophy of one clear action per screen. | Sally (UX Expert) |
| 2025-01-10 | 2.0 | **CRITICAL MVP CONSTRAINT INTEGRATION**: Added user data state branching based on architecture decisions. NEW SECTIONS: (1) User Data State & Flow Branching overview (detection logic, feature access matrix, constraint rationale), (2) Branching logic after Step 6 (existing user transition vs new user continuation), (3) Existing user path (6-step onboarding → welcome screen → dashboard), (4) New user path (9-step onboarding → program setup). UPDATED: Existing user login flow (now includes abbreviated onboarding), Flow differences table (added onboarding steps and program builder access rows). Synchronized with architecture (fullstack-web-app.md) and PRD (v0.2). | Sally (UX Expert) |
| 2025-01-10 | 2.1 | **ONBOARDING SIMPLIFICATION**: Existing users now skip ALL onboarding (not 6 steps). After login → Direct to dashboard. Rationale: Already onboarded on mobile app, repeating questions is redundant. Branching point is at login/signup (not after Step 6). Removed transition screen. Updated feature access table, existing user flow, branching logic. Simpler, faster, better UX. | Sally (UX Expert) |

---

**Document Status**: ✅ v2.0 Validated - Ready for Implementation  
**Last Review**: 2025-01-10 - Synchronized with Architecture (Winston) and PRD (John)  
**Version**: 2.0

