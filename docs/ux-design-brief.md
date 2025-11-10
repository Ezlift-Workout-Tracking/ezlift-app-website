# EZLift Web App MVP - UX Design Brief

**Document Status**: Living Document - In Progress  
**Last Updated**: 2025-01-08  
**UX Designer**: Sally (UX Expert)  
**Stakeholder**: Belal Gouda (Product Owner)

---

## Executive Summary

This document captures the complete UX design context for the EZLift Web App MVP. It consolidates insights from the project brief, PRD, competitive research, and stakeholder discussions to guide the design of a dashboard-first web application that complements the existing iOS/Android mobile apps.

**Core Mission**: Design a web companion app that excels at what desktop browsers do best - planning, analytics, data management, and onboarding experimentation - while mobile apps handle live workout tracking.

---

## Project Context

### What is EZLift?

EZLift is a cross-platform strength training companion built by lifters for lifters. It combines frictionless workout logging with advanced programming tools and analytics across iOS, Android, and web.

**Key Differentiators**:
- **Import-First**: Digitizes handwritten logs via OCR scanning; supports CSV imports from Hevy/Strong
- **Advanced Routine Setup**: Supersets, drop sets, and complex programming
- **Data Portability**: Import/export capabilities, planned MCP integration for user-owned data
- **Ad-Free**: Simple monthly/yearly subscription model
- **Cross-Platform**: Mobile for gym tracking, web for planning and analytics

**Current State**:
- iOS app live in App Store (6737275723)
- Public website live at ezlift.app (Next.js 15, Tailwind, shadcn/ui)
- Secure web app area exists but is currently a placeholder (`/app` route)
- Firebase auth with HttpOnly cookies and middleware protection
- Backend APIs already built and shared across mobile + web

### Technology Stack

**Frontend**:
- Next.js 15 (App Router)
- React 18
- TypeScript
- Tailwind CSS + shadcn/ui (Radix primitives)
- Framer Motion (animations)

**Backend & Data**:
- Shared backend API (serves iOS, Android, Web)
- PostgreSQL (exercise database)
- Contentful CMS (blog + exercise content)
- AWS S3 (media)
- Firebase Authentication

**Hosting**:
- Netlify + @netlify/plugin-nextjs
- GitHub Actions CI

---

## MVP Scope & Constraints

### What's IN Scope for MVP

**Core Features**:
1. **Authentication & Sessions**: Reuse existing Firebase login/signup with secure server sessions
2. **Dashboard Cards** (P0):
   - Training Volume (per week)
   - Top PRs/Personal Bests
   - Recent Workouts
   - Progress over time (est 1RM or intensity)
   - Active Program/Routine Summary
3. **Workout History**: Paginated list with date range filter
4. **Import Entry (Early Access)**: CSV upload for Hevy/Strong
5. **Profile Basics**: View/edit display name, units, bodyweight
6. **Empty States & Onboarding**: Zero-state CTAs, skeletons, clear guidance

**Analytics & Experimentation**:
- Google Analytics (GA4) + optional Amplitude
- A/B testing readiness via feature flags
- Event taxonomy for dashboard/history/profile/import flows

### What's OUT of Scope for MVP

- **Program editing for existing users** (read-only view in MVP; full editing in Phase 2) ← NEW
- Deep analytics beyond weekly overview (future)
- AI assistant modes (Coach/Analyst/Advisor) (future)
- MCP/Token-gated data export (future)
- Direct Google Sheets sync and health platform integrations (future)
- Coach collaboration/sharing features (future)
- **Live workout tracking/logging** (mobile-only permanently)
- **Offline support** (Phase 2 with WatermelonDB)

### Success Criteria

**Performance**:
- LCP < 2.5s (p75) on dashboard
- INP < 200ms (p75)
- Error rate < 1%

**User Activation** (First Week):
- Complete at least one of: [import history, view 3+ workouts, configure profile]
- Import completion rate for eligible users ≥ 60%
- Onboarding completion rate ≥ 70% (skippable steps)

**Conversion**:
- Improve landing → signup conversion via A/B testing (+15-30% vs baseline)

---

## MVP Technical Constraint: User Data State 🔴

**Critical Design Implication**: User data state determines feature access and onboarding flow

### User Classification

The web app MVP classifies users into two states to ensure mobile/web data synchronization:

**New Users** (No existing workout data):
- **Definition**: User has zero workouts, zero programs, zero sessions in backend
- **Detection**: Web app queries backend on login (`GET /api/workout?limit=1` + `GET /workout-log` (all sessions))
- **Onboarding**: Full 9-step flow including Program Setup (Steps 7-9)
- **Program Builder**: ✅ Full create/edit/delete access
- **Dashboard**: Mostly empty states with CTAs ("Create Program", "Import History")
- **Why This Works**: Programs created on web → Mobile syncs down on first login → Perfect sync

**Existing Users** (Have mobile app data):
- **Definition**: User has workouts/programs/sessions from mobile app
- **Detection**: Backend API returns results for workouts or workout sessions  
- **Onboarding**: **None** (already onboarded on mobile, skip directly to dashboard)
- **Program Builder**: ❌ Read-only view + "Use mobile app to edit" message
- **Dashboard**: Fully populated with mobile-tracked data
- **Why This Constraint**: Prevents sync conflicts until Phase 2 (WatermelonDB)

### UX Messaging Strategy

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

**Messaging Tone**: Positive, educational, not apologetic
- Emphasize what they CAN do (dashboard, analytics, import, view programs)
- Explain the technical reason (sync integrity)
- Provide alternatives (mobile app for editing)
- Show timeline ("next update" = Phase 2)

**Phase 2 Removes Constraint**:
- When web app migrates to WatermelonDB (4 weeks post-MVP)
- All users will have full program editing on web
- Perfect bidirectional sync (web ↔ mobile)

---

## Navigation Pattern Decision 🔴 BLOCKER RESOLVED

**Decision Date**: 2025-01-10  
**Decided By**: Sally (UX Expert)  
**Approved By**: Belal Gouda (Product Owner)  
**Status**: ✅ **DECISION: Top Horizontal Navigation**

### **The Decision**

The EzLift secure web app will use **top horizontal navigation** (not left sidebar).

**Navigation Pattern**:
- **Desktop**: Horizontal nav bar at top (logo left, nav items center, user avatar right)
- **Mobile**: Same pattern with hamburger menu (collapses nav items)
- **Authenticated vs Public**: Same top nav pattern, different links

### **Rationale**

**Why Top Nav (Not Sidebar)**:

1. ✅ **Consistency**: Public site already uses top nav → Maintain same pattern in secure area
2. ✅ **Screen Real Estate**: Dashboards need maximum width for charts (sidebar loses 220px)
3. ✅ **Faster MVP**: Reuse existing `Header` component, just add authenticated nav items
4. ✅ **Mobile-Friendly**: Same pattern on mobile (hamburger menu), no slide-out drawer needed
5. ✅ **Scope Discipline**: Simpler pattern = faster development (~1 week time savings)
6. ✅ **Navigation Items Fit**: Only 5 primary items (Dashboard, Programs, History, Import, Profile dropdown)

**Why Not Sidebar**:
- ❌ Different from public site (inconsistent UX)
- ❌ Loses valuable horizontal space for charts
- ❌ More complex (new layout pattern, more components)
- ❌ Longer implementation time
- ❌ Can add in Phase 2 if users demand it

### **Navigation Items**

**Primary Nav** (horizontal links):
1. **Dashboard** - Home, landing page
2. **Programs** - View/create programs (gated by user state)
3. **History** - Workout session list
4. **Import** - CSV import flow
5. **User Avatar Dropdown** ▾:
   - Profile
   - Settings
   - Logout

**Mobile Nav**:
- Hamburger menu (☰) - Opens drawer with same 5 items
- User avatar (top-right) - Same dropdown

### **Visual Pattern**

**Desktop** (1440px):
```
┌──────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Programs  History  Import       [Avatar ▾]    │
└──────────────────────────────────────────────────────────────────┘
```

**Mobile** (375px):
```
┌──────────────────────┐
│ ☰  EzLift   [Avatar] │
└──────────────────────┘
```

**Hover/Active States**:
- Active page: Underline or background highlight (matches public site pattern)
- Hover: Subtle color change

### **Reuse from Public Site**

**Components to Reuse**:
- ✅ `components/layout/Header.tsx` - Adapt for authenticated context
- ✅ Logo component
- ✅ Navigation link pattern
- ✅ Mobile hamburger menu (if exists)

**New Components Needed**:
- `components/layout/AuthenticatedNav.tsx` - Different links than public nav
- User avatar dropdown component
- Logout functionality

### **Implementation Notes**

**For Story 1.1 (Auth Layout & Navigation)**:
- Extend existing `Header` component with authenticated variant
- Add new nav items (Dashboard, Programs, History, Import)
- Add user avatar dropdown (Profile, Settings, Logout)
- Maintain visual consistency with public site
- Test responsive collapse on mobile

### **Phase 2 Consideration**

**Can migrate to sidebar later if**:
- User feedback strongly prefers sidebar
- Navigation items exceed 7 (too crowded horizontally)
- Power users want persistent navigation context

**Migration would be straightforward** (just layout change, same components).

---

## Target User Workflows

### Workflow 1: New User Discovery (Empty State / Cold Start)

**Entry Point**: User discovers EZLift through web campaign/SEO

**Device Context**:
- **Mobile Browser (iOS)**: Redirect to App Store
- **Mobile Browser (Android)**: Redirect to Play Store (when available)
- **Desktop Browser**: Convert to signup → onboarding → dashboard

**Journey**:
1. Land on marketing site
2. Click signup CTA
3. Complete Firebase authentication
4. **Redirect to dashboard (empty state)**
5. **CRITICAL**: Onboarding flow starts

**Onboarding Questions** (Similar to mobile, but can be improved):
- What's your gender?
- How often do you train? (sessions per week)
- What's your primary goal? (strength/muscle/weight loss)
- What's your experience level?
- Do you already have a program?

**Onboarding Outcomes**:

**Path A - No Existing Program**:
- Show suggested programs based on goals/frequency/level
- User selects a program
- Dashboard populates with program structure
- Empty workout history, but active routine is set

**Path B - Has Existing Program**:
- Options to bring program in:
  1. **Import from CSV** (Hevy/Strong/Google Sheets)
  2. **Describe in text/voice** (voice-to-text feature)
  3. **Manual creation** (search exercises, build routine)
- After import/creation, dashboard shows imported data

**Key Design Requirement**: Empty states must be graceful, not overwhelming, with clear next actions.

---

### Workflow 2: Existing User with Data (Heavy Usage)

**Entry Point**: User has been tracking workouts on iOS/Android app consistently

**Context**: User comes to web for desktop advantages:
- More sophisticated stats visualization
- Import/export data management
- **View existing programs** (read-only in MVP; editing available on mobile)
- Review long-term progress on bigger screen
- **Future (Phase 2)**: Edit programs on web with full sync

**Journey**:
1. Login via desktop browser
2. **Land on populated dashboard** with 5 P0 cards showing real data
3. **Primary Action**: Review stats and insights

**Expected Dashboard Interactions**:
1. **Glance at cards**: Quick overview of current state
   - Current workout streak
   - Most recent PRs
   - Workout frequency curve (sessions per week)
   - Weekly training volume
   - Active program summary
2. **Click into card details**: Drill down for more info
   - "Recent Workout" → See last 3-5 workouts, details, PRs achieved
   - "Progress Over Time" → Charts showing est 1RM trends
   - "Training Volume" → Weekly/monthly volume breakdowns
3. **Navigate to History**: Full paginated workout list with filters
4. **Manage data**: Import/export options
5. **View programs**: See program structure (read-only; edit on mobile)
6. **Edit profile**: Units, bodyweight, preferences

**Key Design Requirement**: Dashboard must make complex data clear and actionable, not overwhelming. Progressive disclosure is critical.

---

## Design Principles & Emotional Goals

### Visual Identity Alignment

**Use Mobile App Design System**:
- **Colors**: Extract color palette from mobile app (light mode only)
- **Typography**: Match mobile app fonts
- **Component Style**: Consistent with mobile patterns

**Critical Decision**: Web app uses **LIGHT MODE ONLY** for MVP
- Mobile app supports dark + light mode
- Web app will only use light/bright mode
- Public website (marketing) also needs light mode redesign (separate project)

### Emotional Design Goals

**Motivating** (30%):
- Celebrate achievements (PRs, streaks)
- Positive reinforcement for consistency
- Visual feedback for progress

**Analytical** (50%):
- Clean, data-driven presentation
- Clear charts and metrics
- No chart junk or unnecessary decoration
- Information hierarchy: most important data first

**Efficient** (20%):
- Simple, intuitive navigation
- Minimal clicks to key actions
- Fast loading with skeletons
- Graceful empty states without wasted space

**Overall Feeling**: "Serious lifter's analytical dashboard" - motivating but not gamified, clear but not clinical, powerful but not overwhelming.

---

## Competitive Intelligence

### Apps with Web Interfaces (From Research)

#### Hevy - Gold Standard for Web Planning
**What They Do Well**:
- Web interface described as "insanely useful" for workout planning
- Superior template creation and routine management
- Drag-and-drop functionality for workout builder
- Social features: follow athletes, save routines, community engagement
- Detailed note-taking for exercises
- Seamless mobile ↔ web sync

**Key Insight**: Users specifically come to Hevy's web for complex program planning that's cumbersome on mobile.

#### StrengthLog - Recently Launched Web
**What They Do Well**:
- Users say "web app is so good to prepare your routine"
- Focus on routine preparation vs comprehensive analytics
- Maintains free tier for core features
- Exercise library browsing with detailed instructions

**Key Insight**: Even a basic web interface for routine prep is highly valued by users.

#### Strava - Premium Analytics
**What They Do Well**:
- Substantially more analytical depth on web than mobile
- Advanced route creation and editing
- Detailed performance metrics and heatmaps
- Professional-grade exports

**Key Insight**: Web excels at data visualization that mobile screens can't accommodate.

#### MyFitnessPal - Enhanced Web Functionality
**What They Do Well**:
- Custom BMR calculations
- Additional graphs and reports vs mobile
- Better data export options
- Comprehensive account management

**Key Insight**: Power users prefer web for data management and detailed analysis.

### Apps WITHOUT Web (User Frustration)

#### Strong - Most Requested Missing Feature
- 5+ million users
- Web interface "promised 3 years ago" but never delivered
- Users resort to Google Sheets workarounds
- Primary pain: creating detailed workout plans on mobile is tedious

**Opportunity**: This is a massive unmet need in the market!

#### Alpha Progression
- AI-driven workout recommendations
- Growing demand for web interface for routine planning
- No web version exists

### Key Competitive Insights

**What Works on Web**:
✅ Enhanced workout plan creation (keyboard input, larger screen)
✅ Complex routine building with notes and organization
✅ Superior data visualization and analytics
✅ Community/social features with better UX than mobile
✅ Data import/export workflows
✅ Multi-exercise template editing

**What Doesn't Need Web**:
❌ Live workout tracking (mobile is superior in gym)
❌ Simple exercise logging
❌ Quick stats glance (mobile is faster)

**Market Positioning Insight**: "Web interfaces are no longer optional for serious fitness tracking applications" - users expect cross-platform experiences where mobile handles real-time tracking and web handles planning/analysis.

---

## Live Site Analysis (Screenshots & Patterns)

### Hevy Web Dashboard - Gold Standard Reference

**URL**: https://hevy.com (redirects to login at https://hevy.com/login)

**Login Page Design**:
- **Ultra-clean white background** with generous white space
- **Blue accent colors** (similar to EZLift's blue!) for decorative curved elements
- **Social login prioritized**: Google and Apple buttons prominent
- **Email login as fallback**: "Or with email" divider
- **Device mockups on right**: Clever trust-building showing mobile + desktop side-by-side
- **Footer**: Simple, unobtrusive links (Terms, Pricing, Privacy, Contact)

**Dashboard Layout** (from marketing site screenshot):
- **Left Sidebar Navigation**: Persistent icon menu (collapsible)
- **Main Content Area**: Multiple card sections organized vertically
  - **Profile/Social Feed** at top: User avatar, stats, follower counts
  - **Statistics Section**: Beautiful bar chart showing training volume over ~15 weeks
  - **Calendar View**: Monthly workout calendar with **color-coded activity dots** (blue for workout days)
  - **Workouts Feed**: Recent workout cards with social engagement (likes, comments)

**Key Visual Patterns**:
- **Card-based layout** with subtle shadows (`0 2px 8px rgba(0,0,0,0.08)`)
- **Data visualization**: Bar charts and bubble charts prominently featured
- **Blue primary color** for interactive elements and data viz
- **Gray cards** on white background for visual hierarchy
- **Left-to-right reading flow**: Sidebar → Main content → Details
- **Generous spacing** between elements
- **Icons + labels** in navigation

**Features They Promote**:
- ✅ "Create And Plan Routines" (desktop advantage)
- ✅ "Analyze Exercise Progress" (big screen analytics)
- ✅ "Save Athlete's Routines" (social feature)
- ✅ "Use Hevy on Web → hevy.com"

**Key Takeaway**: Hevy's web interface is **data-rich without being overwhelming**. They use **progressive disclosure** (summary cards → detailed views) and **clear visual hierarchy** (left sidebar, main content, secondary details).

---

### Hevy Authenticated Web App - Complete Onboarding & Dashboard Analysis

**Tested**: Created fresh account and explored entire new user experience (2025-01-08)

#### **Onboarding Flow** (4 Steps with Progress Indicator)

**Step 1: Username**
- **URL**: `/onboarding/username`
- **Progress Breadcrumb**: Username (blue) → Units → Plans → Get started
- **Layout**: Ultra-minimal, centered form with massive white space
- **Content**:
  - Heading: "Let's set a username"
  - Value prop: "Your username will identify you in the app, so people can find you!"
  - Single input field (username)
  - Blue checkbox (checked): "I have read and accept the terms and conditions"
  - Full-width blue CTA: "Continue"
- **Key Insight**: ONE task per screen, no distractions

**Step 2: Units**
- **URL**: `/onboarding/units`
- **Content**: "Set units" heading
- **Three toggle groups** (segmented button pattern):
  - **Weight**: Kg | Lbs (Lbs selected by default for US users)
  - **Distance**: Kilometers | Miles
  - **Measurements**: Cm | In
- **Visual Pattern**: Unselected = white bg, Selected = blue bg + white text
- **CTA**: "Continue" button at bottom
- **Key Insight**: Clear defaults, easy to change, no explanation needed

**Step 3: Plans** (Monetization During Onboarding!)
- **URL**: `/onboarding/plans`
- **Heading**: "Pick your Hevy plan" + "No commitments. Cancel anytime."
- **Layout**: Full pricing page embedded in onboarding!
- **Pricing Tiers**:
  1. **Monthly**: $2.99/month (blue border when selected)
  2. **Yearly**: $23.99/year (saves ~33%)
  3. **Lifetime**: $74.99 one-time
- **Feature Comparison Table**:
  - Free: 4 max routines, 7 max custom exercises, 3 months graph history
  - PRO: Unlimited everything
- **CTAs**:
  - Primary: "Continue with [Selected] Plan - $X"
  - Secondary (gray): "Continue with Free Plan"
- **Discount code input** (optional)
- **Social proof below**:
  - App Store ratings (4.9 stars, 31K+ reviews)
  - Google Play ratings (4.9 stars, 47K+ reviews)
  - User testimonials (4 cards)
  - Featured by logos (App Store, Google Play, others)
  - FAQ accordion (7 common questions)
- **Key Insight**: Convert during momentum, but don't block free users

**Step 4: Get Started** (Mobile App Push)
- **URL**: `/onboarding/finish`
- **Heading**: "Almost done"
- **Message**: "Hevy is best used on your mobile device. You can easily take your phone to the gym and log your workouts."
- **Two-column layout**:
  - **Left**: Download app (QR code + store badges)
  - **Right**: Log in instructions (screenshot showing login button)
- **Bottom CTA**: "Continue with Web App" (still allows web access!)
- **Key Insight**: Push mobile hard, but don't gate web access

---

#### **Authenticated Dashboard - Empty State Experience**

**Landing Page: Feed** (`/` after login)
- **URL**: `hevy.com/`
- **Page Title**: "Home"
- **Main Content**: **100% Mobile Acquisition Focus** (NOT dashboard!)
  - Large card: "Hello [username], welcome to Hevy!"
  - **Mobile app mockup** image prominently displayed
  - **3-step checklist** with blue circle icons:
    1. Download Hevy mobile app (QR + store badges)
    2. Log in with account you created
    3. Log your first workout with Hevy App
  - **NO analytics, NO charts, NO workout data cards!**
- **Right Sidebar**:
  - Profile card (0 workouts, 0 followers, 0 following)
  - "See your profile" button
  - "Suggested Athletes" list (5 users to follow with Follow buttons)
- **Key Insight**: Hevy's "Home" is a **mobile funnel**, NOT a dashboard!

**Profile Page: Where Analytics Actually Live** (`/profile`)
- **URL**: `hevy.com/profile`
- **Layout**: Two-column (main + right sidebar)
- **Main Column**:
  - **Profile Header**: Avatar, username, "Edit Profile" button
  - **Stats Row**: Workouts 0 | Followers 0 | Following 0
  - **Statistics Card**:
    - Tabs: Duration (default) | Reps
    - **Chart Area**: Bar chart showing "0min This week" with "Last 12 weeks" dropdown
    - **Empty state**: Flat line at 0 hrs
    - **Date range**: Jul 28 → Oct 06 (shows ~12 weeks)
  - **Workouts Section**:
    - Heading: "Workouts"
    - **Empty state**: Blue dumbbell icon + "No workouts yet." + "Use the mobile app to log a workout"
- **Right Sidebar**:
  - **Calendar Widget**:
    - Month view (October 2025)
    - Previous/Next month arrows
    - Clean, minimal day grid
    - Empty (no workout dots yet)
- **Key Insight**: Analytics exist but are **hidden on Profile page**, not front-and-center

**Routines Page: Main Web Feature** (`/routines`)
- **URL**: `hevy.com/routines`
- **Header**: "My Routines" + blue "New Routine" button (icon + text)
- **Empty State**:
  - Blue clipboard icon (centered)
  - "Get started"
  - "Start by creating a routine!"
- **Key Insight**: Routines are THE killer web feature, but empty state is very minimal

**Navigation: Left Sidebar** (persistent, ~200px width)
- **Logo** at top
- **Search users** input (light gray)
- **Navigation Links** (icon + label):
  - Feed (house icon)
  - Routines (list icon)
  - Exercises (dumbbell icon)
  - Profile (person icon)
  - Settings (gear icon)
- **Bottom Section**:
  - "Hevy PRO" badge (yellow "PRO" text)
  - Blue "Unlock" button
  - User avatar + username (logout icon on hover)
- **Active State**: Light blue background for selected item
- **Key Insight**: Simple, icon-first navigation

---

#### **Hevy UX Patterns Summary**

**What They Do Well**:
1. **Ultra-clean onboarding**: One task per screen, clear progress
2. **Smart monetization**: Pricing during onboarding when momentum is high
3. **Social proof**: Ratings, testimonials, featured logos during upsell
4. **Mobile-first messaging**: Clear about mobile being primary, web as companion
5. **Simple navigation**: Icon + label pattern, easy to scan
6. **Generous white space**: Never feels cluttered
7. **Blue consistency**: Same accent color everywhere
8. **Empty states**: Always have a CTA, never just blank

**What's Different from EZLift Needs**:
1. ❌ **Home is NOT a dashboard** - it's a mobile app funnel
2. ❌ **Analytics hidden on Profile** - not dashboard-first
3. ❌ **Very social-focused** - feed, followers, suggested athletes
4. ❌ **No onboarding questions** - just username/units, no goals/training frequency
5. ❌ **No import flow highlighted** - not emphasized for existing users
6. ❌ **Free tier very limited** - 4 routines max, 3 months history

**EZLift Should Differentiate By**:
1. ✅ **Dashboard-first landing** - analytics/stats immediately visible
2. ✅ **Onboarding captures goals** - training frequency, experience level, programs
3. ✅ **Import-first for existing users** - Hevy/Strong CSV import prominent
4. ✅ **Less social, more personal** - focus on your data, not community
5. ✅ **Desktop-native thinking** - optimize for large screens, not mobile fallback
6. ✅ **Analytics front-and-center** - don't hide on profile page

---

### StrengthLog Web App

**URL**: https://app.strengthlog.com

**Login Page Design**:
- **Dark theme** (navy/charcoal background)
- **Bold orange CTA** button for "Log In"
- **Social login options**: Apple, Facebook, Google (all prominent)
- **Centered modal dialog** approach vs full-page layout
- **Logo + brand lockup** on right side
- **Terms acceptance** on signup

**Visual Comparison**:
- Very different approach from Hevy's light theme
- More "gamified" feeling with dark theme
- Orange accent color vs blue (StrengthLog brand)

**Key Takeaway**: Dark themes work for mobile apps but Hevy's light approach is better for **analytical dashboard work on desktop**. We'll follow Hevy's lead with **light mode only for web**.

---

### Current EZLift.app Public Site

**URL**: https://ezlift.app

**Current Design**:
- **Dark theme** with hero background image
- **Orange accent color** (`#FF6B35` approx) for brand
- **Bold headline**: "Your Personal **Fitness Journey** Starts Here" (orange highlight on "Fitness Journey")
- **App store badges** prominently featured
- **Feature cards**: 6 cards showing key features (Personalized Routines, Seamless Tracking, Supersets, Scanning, Google Sheets, Weekly Stats)
- **Pricing section**: Flexible ($4.99/mo) and Committed ($39.99/yr) tiers

**Observations**:
- Current site is **mobile-app focused** (no web app mentioned)
- **Dark theme dominates** (hero, footer, cards)
- **Orange CTA buttons** consistent with brand
- Clean, modern design but **lacks web app positioning**

**Key Takeaway for Web App**: We need to **differentiate the web app experience** from the marketing site. The web app should:
1. Use **light mode** (contrasting with marketing site's dark theme)
2. Feel more **analytical and data-driven**
3. **Leverage desktop advantages** (big screen, charts, planning)

---

## Competitive Pattern Summary

### What We're Adopting from Hevy:
✅ **Light theme** for analytical clarity on desktop
✅ **Left sidebar navigation** (or top nav, to be decided in wireframes)
✅ **Card-based dashboard** with data visualization
✅ **Progressive disclosure**: Summary cards → detailed views
✅ **Clean white background** with subtle shadows
✅ **Blue accent colors** (consistent with EZLift mobile app)
✅ **Generous white space** for breathing room
✅ **Social proof elements** (workout counts, streaks)

### What We're Avoiding:
❌ **Dark theme for web dashboard** (StrengthLog approach)
❌ **Overly complex navigation** with too many sections
❌ **Chart overload** - keep data focused
❌ **Gamification** that distracts from analytical focus

### Design Language Decision Matrix:

| Element | Hevy (Light) | StrengthLog (Dark) | EZLift Choice |
|---------|--------------|-------------------|---------------|
| **Background** | White | Dark Navy | **White** (analytical) |
| **Primary Accent** | Blue | Orange | **Blue** (matches mobile) |
| **Secondary Accent** | — | — | **Orange** (from mobile branding) |
| **Navigation** | Left Sidebar | Modal/Centered | **Left Sidebar or Top Nav** (TBD) |
| **Cards** | White on gray bg | Dark cards | **White with shadows** |
| **Data Viz** | Blue charts | Orange charts | **Blue charts** (primary) |
| **Typography** | Clean sans-serif | Bold sans-serif | **System sans-serif** (SF Pro) |
| **Spacing** | Generous | Moderate | **Generous** (desktop advantage) |

---

## Design Decisions Made

### Dashboard Card Priority & Information Architecture

**Primary Dashboard View** (Post-Login Landing):

**Layout Structure**:
- **Desktop**: 2x2 grid for top 4 cards + row for 5th card (Active Program)
- **Mobile Web**: Stacked vertically

**Card Priority Order** (based on user conversation):
1. **Training Volume (Per Week)** - Current week's volume + recent trend
2. **Top PRs / Personal Bests** - Most recent PRs, maybe top 3
3. **Recent Workouts** - Last workout summary with quick link to details
4. **Progress Over Time** - Visual chart (est 1RM or volume curve)
5. **Active Program/Routine Summary** - Current program name + upcoming sessions

**Card Interaction Pattern**:
- **Glanceable**: Key metric visible on card surface
- **Clickable**: Card expands or navigates to detail view
- **Empty State**: Each card shows appropriate CTA when no data

**Global Controls**:
- **Date Range Filter** (top of dashboard): Scopes all cards coherently
- **Session Sticky**: Filter choice persists per session
- **Analytics Event**: Fire event on filter change

### Onboarding Flow Design Principles

**Key Requirements**:
- **Skippable Steps**: User can skip and come back later
- **Progressive Save**: Save partial progress, don't lose data
- **Clear CTAs**: Always obvious what happens next
- **Completion Rate Target**: ≥70% completion

**Question Sequence** (draft, can refine):
1. Welcome screen with value prop
2. Gender (optional/skip)
3. Training frequency (times per week)
4. Primary goal (strength/muscle/weight loss/general fitness)
5. Experience level (beginner/intermediate/advanced)
6. **Branching point**: Do you have an existing program?
   - **No** → Show suggested programs based on answers
   - **Yes** → Show import/creation options

**Import/Creation Options** (for users with programs):
- Import from CSV (Hevy/Strong/Google Sheets)
- Describe in text (text input with guidance)
- Describe via voice (voice-to-text feature)
- Build manually (exercise search + routine builder)

**Design Challenge**: How to make routine creation easy enough for onboarding without overwhelming? May need simplified version for MVP with "finish setup later" option.

### Empty State Strategy

**Philosophy**: Empty states are opportunities, not dead ends.

**Empty State Categories**:

1. **New User (Zero Data)**:
   - Friendly welcome message
   - Clear explanation of what this card will show
   - Primary CTA: Complete onboarding / Import data / Create first workout
   - Secondary CTA: Learn more (help docs)

2. **Partial Data**:
   - Show what's available
   - Explain what's missing
   - CTA to complete the data

3. **Error State**:
   - Clear error message
   - What happened and why
   - Recovery action (retry, contact support)

**Visual Treatment**:
- Illustration or icon (not just text)
- Concise copy (1-2 sentences max)
- Single prominent CTA button
- Minimal wasted space

### Navigation Architecture

**Primary Navigation** (persistent):
- Dashboard (home icon)
- History
- Workouts/Programs (future)
- Profile/Settings

**Mobile Web Navigation**:
- Bottom nav bar (mobile UX pattern)
- Or hamburger menu (evaluate in wireframes)

**Desktop Navigation**:
- Sidebar (collapsed/expanded state)
- Or top horizontal nav
- (Decision: Evaluate in wireframes based on space needs)

---

## Performance & Technical Requirements

### Performance Budgets

**Dashboard Loading**:
- LCP < 2.0s (p75) with analytics enabled
- INP < 200ms (p75)
- Use skeleton loaders for cards during fetch
- Defer/async analytics loading

**Interaction Performance**:
- Card click → detail view < 100ms perceived
- Filter change → card update < 200ms
- No layout shift (CLS = 0)

### Responsive Design Requirements

**Breakpoints** (Tailwind default):
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile-First Approach**:
- Design for mobile viewport first
- Enhance for larger screens
- Cards stack on mobile, grid on desktop
- Touch targets ≥ 44x44px
- Thumb-friendly zones on mobile

### Accessibility Requirements

**WCAG 2.1 AA Compliance**:
- Color contrast ≥ 4.5:1 for text
- Semantic HTML (proper headings, landmarks)
- Keyboard navigation (focus indicators, tab order)
- Screen reader support (ARIA labels where needed)
- Form labels and error messages
- No reliance on color alone to convey info

**Testing**:
- Lighthouse accessibility score ≥ 90
- Screen reader testing (VoiceOver/NVDA)
- Keyboard-only navigation testing

---

## Analytics & Experimentation Strategy

### Event Taxonomy (MVP)

**Page Views**:
- Dashboard viewed
- History viewed
- Profile viewed
- Import flow entered

**Dashboard Interactions**:
- Card viewed (which card)
- Card clicked (drill-down)
- Date range filter changed
- Empty state CTA clicked

**History Interactions**:
- Workout list filtered
- Workout detail viewed
- Pagination used

**Import Flow**:
- Import started (source: Hevy/Strong/CSV)
- Import completed
- Import failed (error type)

**Profile**:
- Profile viewed
- Profile updated (field: units/bodyweight)

**User State Events** (NEW):
- User Data State Detected (state: 'new' | 'existing' | 'unknown', hasWorkouts: boolean, hasSessions: boolean, hasRoutines: boolean)
- Onboarding Branched (userState: 'existing', stepsCompleted: 6, action: 'skip_to_dashboard')
- Existing User Welcomed (sessionCount: number, programCount: number, latestWorkoutDate: string)
- Program Builder Access Blocked (userState: 'existing', programCount: number, source: 'direct_navigation' | 'onboarding' | 'dashboard_cta')
- Program Builder Blocked CTA Clicked (action: 'view_programs' | 'download_app' | 'import_history')

### A/B Testing Capabilities

**Feature Flag Architecture**:
- External A/B tool integration (Netlify Experiments shortlist)
- SSR-safe variant assignment
- Sticky variants per user/session
- No flicker on load
- Control default fallback

**Testable Elements** (MVP):
- Dashboard card layouts (2x2 grid vs vertical)
- Onboarding question sequence
- Empty state messaging
- CTA button copy
- Card visualization styles

---

## Design Artifacts Needed

### Phase 1: Research & Patterns (Current Phase)

**Tasks**:
- [x] Receive mobile app screenshots
- [x] Extract color palette from mobile app
- [x] Browse Hevy web interface (hevy.com)
- [x] Browse StrengthLog web app (app.strengthlog.com)
- [x] Browse current EZLift.app public site
- [x] Document visual patterns, component styles
- [x] Screenshot competitor dashboard layouts

**Deliverables**:
- Pattern library (screenshots + notes) ✅
- Color palette extracted from mobile ✅
- Font specifications ✅
- Spacing/sizing system ✅

---

## Mobile App Design System (Extracted from Screenshots)

> **⚠️ IMPORTANT**: The color values below were approximate extractions from mobile app screenshots. **The authoritative source of truth for all EzLift colors is `theme.ts`**. See `docs/design-system.md` for the complete, accurate color palette from `theme.ts`.

### Color Palette

**Primary Colors** (from `theme.ts`):
- **Brand Orange**: `#FF6600` (primary-500) - Primary buttons, CTAs, "Skip" button, active icons
  - Used for: Primary actions, progress indicators, brand identity
  - Full scale: 50 (`#FFF0E5`) → 500 (`#FF6600`)
- **Selection Blue**: `#1099F5` (secondary-100) - Selected states, active progress bars
  - Used for: Selected options, interactive elements, links
  - Full scale: 25 (`#4CB3F8`) → 300 (`#0988DD`)
- **Light Gray Background**: `#F8F9FB` (grayscale-0) - Page background
- **Card White**: `#FFFFFF` - Card backgrounds, elevated surfaces

**Grayscale System** (from `theme.ts`):
- Complete scale: 0 (`#F8F9FB`) → 900 (`#0D0D12`)
- Border Gray: `#DFE1E6` (grayscale-100)
- Primary Text: `#1A1B25` (grayscale-800)
- Secondary Text: `#666D80` (grayscale-500)
- Disabled Text: `#A4ABB8` (grayscale-300)

**Muscle Group Colors** (from `theme.ts`):
- Shoulders: `#523173`
- Middle Back: `#7E2EB3`
- Chest: `#6B2B06`
- Quadriceps: `#69583A`
- Triceps: `#505D75`
- Biceps: `#151D30`
- And 11 more muscle groups (see `theme.ts` for complete list)

**Text Colors** (from `theme.ts`):
- **Primary Text**: `#1A1B25` (grayscale-800) - Headers, body text
- **Secondary Text**: `#666D80` (grayscale-500) - Subtitles, metadata
- **Disabled/Placeholder**: `#A4ABB8` (grayscale-300) - Inactive elements

**UI Element Colors** (from `theme.ts`):
- **Border/Divider**: `#DFE1E6` (grayscale-100) - Subtle separators
- **Shadow**: Subtle drop shadows on cards (rgba(0,0,0,0.08))
- **Success Colors**: Multiple success color scales (see `theme.ts`)
- **Error Colors**: Alert error scale (`#DF1C41` primary)
- **Warning Colors**: Alert warning scale (`#FFB04C` primary)

### Typography

**Font Family**: Sans-serif system font (likely SF Pro on iOS)

**Hierarchy**:
- **Page Title/H1**: ~28-32px, Bold/Heavy
- **Section Headers/H2**: ~20-24px, Bold
- **Card Titles/H3**: ~18-20px, Semibold
- **Body Text**: ~16px, Regular
- **Secondary/Meta**: ~14px, Regular
- **Small Text**: ~12px, Regular

**Text Styles**:
- Question text in onboarding: Large (20-24px), bold
- Button text: 16-18px, semibold
- Card metric numbers: Large (24-32px), bold
- Card labels: Small (14px), regular

### Component Styles

**Buttons**:
- **Primary (Orange)**:
  - Background: Brand orange
  - Text: White or black
  - Border radius: `12-16px` (very rounded)
  - Height: `~56px` (large touch target)
  - Full width on mobile
  - Font: Semibold, 16-18px

- **Secondary/Option Buttons** (unselected):
  - Background: Light gray `#F0F0F0`
  - Text: Black
  - Border radius: `12-16px`
  - Padding: `16px 24px`

- **Selected State**:
  - Background: Selection blue
  - Text: White
  - Checkmark icon on right

**Cards**:
- Background: White
- Border radius: `16px`
- Padding: `16-20px`
- Shadow: Subtle `0 2px 8px rgba(0,0,0,0.08)`
- Margin between cards: `12-16px`

**Progress Indicator** (top of onboarding):
- Thin bar: `2-3px` height
- Active segments: Blue
- Inactive segments: Light gray
- Full width at top of screen

**Tags/Pills** (muscle groups):
- Border radius: `20px` (fully rounded)
- Padding: `8px 16px`
- Font: 14px, medium
- Various background colors (purple, brown, slate, navy)
- White text

**Input Fields**:
- Background: White
- Border: Light gray or none
- Border radius: `12px`
- Height: `~52px`
- Placeholder: Gray text
- Label: Above field, small text

**Icons**:
- Outline style (not filled)
- Orange for active/primary
- Gray for inactive
- Size: `24x24px` typical

### Layout & Spacing

**Mobile Layout**:
- Screen padding: `16-20px` horizontal
- Vertical spacing between elements: `12-16px`
- Card internal padding: `16-20px`
- Bottom nav bar: `~56px` height with icons

**Component Spacing**:
- Progress bar to content: `24px`
- Back button to title: `16px`
- Title to options: `24-32px`
- Between option buttons: `12px`
- Button to screen bottom: `24px` (safe area)

**Touch Targets**:
- Minimum: `44x44px` (iOS standard)
- Buttons: `56px` height (generous)
- Icons in nav: `24px` with padding to hit `44px`

### Interaction Patterns

**Onboarding Flow**:
- Progress bar shows current step
- "Skip" button in top right (orange)
- Back arrow in top left
- Question at top (large, bold)
- Options stacked vertically
- Single-select with immediate visual feedback
- "Next" button at bottom (full width, orange)

**Dashboard/Stats Cards**:
- Icon + title in header (orange icon)
- Primary metric large and bold
- Secondary info smaller below
- Chevron arrow for cards that expand
- Calendar uses orange dots for workout days

**Empty States**:
- Centered content
- Instructional text
- Primary CTA button(s)
- Clean, not cluttered

**Navigation**:
- Bottom tab bar: 3 items (Stats, Train, Settings)
- Active tab: Orange icon + text
- Inactive tab: Gray icon + text

### Motion/Animation Hints

From the screenshots, likely includes:
- Smooth transitions between screens
- Button press states (scale down slightly)
- Selection state changes (color fade)
- Progress bar increments (smooth fill)

---

### Phase 2: User Flows & Wireframes (Next Phase)

**User Flows to Map**:
1. New user signup → onboarding → empty dashboard
2. New user onboarding → program import → populated dashboard
3. Existing user login → dashboard → card drill-down
4. User → history → workout detail
5. User → import flow → success/error states

**Wireframes Needed**:
1. Dashboard (desktop 2x2 grid layout)
2. Dashboard (mobile stacked layout)
3. Dashboard empty states (all cards)
4. Onboarding screens (all steps + branching)
5. History list view + filters
6. Import flow screens
7. Profile view/edit
8. Workout detail view (if time permits)

**Wireframe Fidelity**: Mid-fidelity (grayscale, actual content, clear interactions)

### Phase 3: High-Fidelity Mockups (Future)

**Mockups Needed**:
- Dashboard (populated state)
- Dashboard (empty states)
- Onboarding flow
- History + filters
- Import screens

**Visual Design Specs**:
- Component library (shadcn/ui customization)
- Color system (from mobile app)
- Typography scale
- Icon system
- Spacing system
- Animation/motion guidelines

### Phase 4: Prototypes (Future)

**Interactive Prototypes**:
- Onboarding flow (clickable)
- Dashboard card interactions
- Empty state CTAs → actions

---

## Open Questions & Risks

### Open Questions

**Dashboard Card Design**:
- What specific data visualization for "Progress Over Time"? (Line chart? Bar chart? Sparkline?)
- How to show "Training Volume" - just a number, or visual representation?
- Should cards be equal height or dynamic based on content?
- Mobile: how many cards visible without scrolling?

**Onboarding Flow**:
- How simplified should routine creation be for onboarding?
- Voice-to-text for program description - which API/service?
- Should onboarding be skippable entirely, or require minimum info?
- What happens if user abandons onboarding mid-flow?

**Import Flow**:
- CSV format validation - how strict? Show errors inline or summary?
- File size limits for CSV import?
- Import time - async processing, how to show progress?
- What if import partially fails (some workouts succeed, some fail)?

**Navigation**:
- Sidebar vs top nav for desktop?
- How to handle future sections (Workouts, Programs, Analytics) in nav structure?

### Design Risks

**Risk 1: Onboarding Complexity**
- Creating a routine is complex; simplified version may frustrate advanced users
- **Mitigation**: Offer "finish setup later" escape hatch, link to mobile app for scanning

**Risk 2: Empty State Overload**
- New users see 5 empty cards, may feel overwhelmed
- **Mitigation**: Use progressive disclosure, maybe onboarding creates sample data, clear CTAs

**Risk 3: Analytics Overhead**
- Too many events could impact performance
- **Mitigation**: Defer analytics, batch events, monitor performance budgets

**Risk 4: Mobile Web Experience**
- User on mobile browser may be frustrated by "download app" push
- **Mitigation**: Allow light usage on mobile web, make app suggestion helpful not blocking

**Risk 5: Feature Parity Expectations**
- Users may expect full workout creation on web (out of scope)
- **Mitigation**: Clear messaging about what web is for vs mobile

---

## Next Steps (Agreed Plan)

### ✅ Completed This Session

1. **Browse Live Sites** ✅
   - ✅ Visited hevy.com web interface (marketing + login)
   - ✅ Visited app.strengthlog.com (login screen)
   - ✅ Visited ezlift.app current public site
   - ✅ Documented patterns, layouts, components
   - ✅ Screenshot key screens for reference

2. **Extract Design System** ✅
   - ✅ Received mobile app screenshots from stakeholder
   - ✅ Extracted color palette (light mode)
   - ✅ Identified typography scale
   - ✅ Documented component styles (buttons, cards, inputs, icons)
   - ✅ Noted layout/spacing system

3. **Define User Flows** ✅
   - ✅ Mapped complete new user journey (cold start + onboarding)
   - ✅ Mapped existing user journey (with mobile app data)
   - ✅ Clarified import flow (history/stats only, not programs)
   - ✅ Defined program setup decision tree (describe vs build vs select)
   - ✅ Documented all flows in **`docs/web-app-user-flows.md`**
   - ✅ Validated with stakeholder

### Immediate Next Steps (Next Session)

4. **Create Wireframes** ✅
   - ✅ Created comprehensive wireframes document: **`docs/wireframes.md`**
   - ✅ Onboarding wireframes (5 steps + program setup variations)
   - ✅ Dashboard wireframes (populated + empty states, desktop + mobile)
   - ✅ Program setup screens (describe/AI, builder, recommendations)
   - ✅ Import flow screens (selection, processing, success)
   - ✅ Navigation patterns (sidebar, mobile bottom nav, slide-out menu)
   - ✅ 25+ screen layouts with detailed component specifications

### Immediate Next Steps (Next Session)

5. **Review & Refine Wireframes**:
   - Gather stakeholder feedback on initial wireframes
   - Identify priority screens for detailed refinement
   - Create higher-fidelity versions of key screens
   - Validate layouts against user flows
   - **Mobile layouts**:
     - Dashboard stacked (populated)
     - Dashboard empty states
     - Bottom nav consideration
   - **Onboarding screens**:
     - Welcome screen
     - Question screens (gender, frequency, goals, etc.)
     - Program selection/import branching
     - Completion/dashboard transition

5. **Define Component Library**:
   - Dashboard cards (5 types)
   - Navigation (sidebar vs top nav decision)
   - Empty state patterns
   - Data visualization components (charts)
   - Form elements (filters, inputs)

### Future Sessions

6. **High-Fidelity Mockups**:
   - Apply extracted color system
   - Design with actual content
   - Polish visual details

7. **Interactive Prototypes**:
   - Clickable onboarding flow
   - Dashboard card interactions
   - Import flow prototype

---

## Reference Links

**EZLift**:
- Public website: https://ezlift.app/
- iOS App Store: https://apps.apple.com/de/app/ezlift-pro/id6737275723?l=en-GB
- Backend API docs: https://ezlift-server-production.fly.dev/documentation

**Competitor Web Interfaces**:
- Hevy: https://hevy.com
- StrengthLog: https://app.strengthlog.com
- Strava: https://www.strava.com

**Design Resources**:
- Tailwind CSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/
- Radix Primitives: https://www.radix-ui.com/

---

## Document Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-08 | 1.0 | Initial design brief created from stakeholder discussions | Sally (UX Expert) |
| 2025-01-08 | 1.1 | Added mobile app design system extraction (colors, typography, components) | Sally (UX Expert) |
| 2025-01-08 | 1.2 | Added live site analysis (Hevy, StrengthLog, EZLift), competitive pattern summary, design language decision matrix | Sally (UX Expert) |
| 2025-01-08 | 1.3 | **MAJOR UPDATE**: Added complete Hevy authenticated web app analysis - created account, documented entire onboarding flow (4 steps), explored dashboard empty states, analyzed navigation patterns. CRITICAL FINDING: Hevy's "Home" is mobile acquisition funnel, NOT analytics dashboard (analytics hidden on Profile page). This informs our dashboard-first design approach for EZLift. | Sally (UX Expert) |
| 2025-01-08 | 1.4 | **USER FLOWS COMPLETE**: Created comprehensive user flow document (`docs/web-app-user-flows.md`). Defined complete new user journey (9-step onboarding, program setup paths, import flow) and existing user journey. KEY CLARIFICATIONS: Import is for history/stats only (not programs); Import is optional and separate from program creation; Program setup has 3 paths (describe/build/select). Flows validated with stakeholder. | Sally (UX Expert) |
| 2025-01-08 | 1.5 | **WIREFRAMES COMPLETE**: Created comprehensive wireframes document (`docs/wireframes.md`). Includes 28+ screen layouts covering: Signup, 9-step onboarding (added Training Duration + Equipment Available from mobile app), program setup variations (describe/build/recommendations), dashboard states (populated/empty, desktop/mobile), import flow, routine builder, and navigation patterns. All layouts include desktop (1440px) and mobile (375px) responsive designs with detailed component specs. | Sally (UX Expert) |
| 2025-01-08 | 1.6 | **ONBOARDING CORRECTION**: Updated both wireframes and user flows to reflect complete 9-step onboarding based on mobile app screenshots. Added 2 missing screens: Step 3 (Training Duration: 30min, 30-45, 45-60, 60+) and Step 6 (Equipment Available: Free Weights, Machines, Bands, Bodyweight, etc.). Updated all progress indicators. Added orange color (#FF6B2C) for Skip/Next buttons to match mobile app. Steps 8-9 details TBD (program confirmation/setup completion). | Sally (UX Expert) |
| 2025-01-08 | 1.7 | **PROGRAM BUILDER REDESIGN**: Created `docs/program-builder-redesign.md` with completely redesigned Program Builder based on Exercise Library components. Key changes: (1) Auto-starts with Workout 1 (no empty state), (2) Visual exercise cards with images (reuses Exercise Library 4-column grid), (3) Real-time metrics panel (muscles covered, duration, variety), (4) Flow-based (W1→W2→W3→Overview→Done), (5) Desktop-optimized with search/filter, (6) Click exercise image→detail modal, (7) Smart suggestions between workouts. Solves all mobile pain points (confusion, typing, visualization, guidance). | Sally (UX Expert) |
| 2025-01-08 | 1.8 | **INTEGRATION COMPLETE**: Integrated Program Builder redesign into main `docs/wireframes.md` (v1.2, section 1.10). Replaced old mobile-clone routine builder with new visual, flow-based design. Added 5 subsections: Initial state, With exercises, Detail modal, Workout 2 transition, Program overview. Updated table of contents and terminology (Routine→Program). Standalone redesign document can be archived. All wireframes now in single unified document. | Sally (UX Expert) |
| 2025-01-08 | 1.9 | **FLOW SIMPLIFICATION**: Removed intermediate choice screen from onboarding. "Yes, I have a program" now auto-loads Describe Program screen (text/voice input) as PRIMARY action. Secondary option: "Use Program Builder instead" (link, not big button). Applies consistent UX philosophy: One clear primary action per screen, smart defaults, secondary options available but not prominent. Updated wireframes.md (v1.3) and web-app-user-flows.md. | Sally (UX Expert) |
| 2025-01-10 | 2.0 | **CRITICAL MVP CONSTRAINT INTEGRATION**: Integrated user data state branching from architecture (fullstack-web-app.md) and PRD (v0.2). ADDED: (1) MVP Technical Constraint section explaining new vs existing user classification, (2) UX messaging strategy for blocked features (positive, educational tone), (3) Updated Out of Scope (program editing for existing users), (4) Updated Workflow 2 (existing user has read-only programs), (5) Added new analytics events (user state detection, onboarding branching, program builder blocked). Synchronized all UX docs with architecture decisions. | Sally (UX Expert) |
| 2025-01-10 | 2.1 | **ONBOARDING SIMPLIFICATION**: Existing users now skip ALL onboarding (no Steps 1-6). After login → Direct to dashboard. Rationale: Already onboarded on mobile, repeating is redundant. Branching at login (not after Step 6). Simpler architecture, faster time to value, better UX. Updated constraint section and workflow 2. | Sally (UX Expert) |
| 2025-01-10 | 2.2 | **🔴 BLOCKER RESOLVED - NAVIGATION DECISION**: Made critical navigation pattern decision: **Top Horizontal Navigation** (not left sidebar). Rationale: Consistent with public site, more screen space for charts, faster implementation (~1 week saved), mobile-friendly, simpler architecture. Documented decision, navigation items (Dashboard, Programs, History, Import, Avatar dropdown), visual patterns, component reuse strategy, Phase 2 migration option. UNBLOCKS Story 1.1 development. | Sally (UX Expert) |

---

**Status**: ✅ Phase 1 Complete (Research & Pattern Discovery)  
**Status**: ✅ Phase 2A Complete (User Flow Definition)  
**Status**: ✅ Phase 2B Complete (Wireframing - Initial + Redesign)  
**Status**: ✅ Phase 3 Complete (Architecture Integration - MVP Constraints)  
**Current Phase**: Ready for Story Creation  
**Last Sync**: 2025-01-10 - Synchronized with Architecture (fullstack-web-app.md) and PRD (v0.2)

**Critical Documents**:
- ✅ `docs/ux-design-brief.md` (v2.0) - Master design brief with MVP constraint integration
- ✅ `docs/web-app-user-flows.md` (v2.0) - Complete user flows with data state branching
- ✅ `docs/wireframes.md` (v2.0) - ⭐ UNIFIED wireframes (32+ screens including constraint states)
- ✅ `docs/wireframes-summary.md` - Summary of changes and review priorities
- ✅ `docs/architecture/fullstack-web-app.md` - Complete MVP + Phase 2 architecture
- ✅ `docs/prd.md` (v0.2) - PRD with user state constraints and epic/stories

