# EZLift Web App - Wireframes

**Document Version**: 1.0  
**Last Updated**: 2025-01-08  
**Designer**: Sally (UX Expert)  
**Status**: Initial Draft - Ready for Review

---

## Document Overview

This document contains wireframes for all key screens in the EZLift Web App MVP. Wireframes are presented in order of user flow, with both desktop and mobile layouts where applicable.

**Wireframe Notation**:
- `[Component Name]` = Interactive element (button, link, input)
- `{Content}` = Dynamic/variable content
- `───` = Divider/separator
- `▸` = Dropdown/expandable
- Desktop layouts: 1440px × 900px (typical)
- Mobile layouts: 375px × 812px (iPhone standard)

---

## Table of Contents

### 1. Onboarding Flow
- 1.1 Signup Page
- 1.2 Onboarding Step 1: Personal Info (Gender, Age)
- 1.3 Onboarding Step 2: Training Frequency (1-2, 3-4, 5-6, 7+ days/week)
- 1.4 Onboarding Step 3: Training Duration (30min or less, 30-45, 45-60, 60+)
- 1.5 Onboarding Step 4: Experience Level (Beginner, Intermediate, Advanced, Expert)
- 1.6 Onboarding Step 5: Goals (Build Muscle, Strength, Weight Loss, etc.)
- 1.7 Onboarding Step 6: Equipment Available (Multi-select) - NEW USERS ONLY
- 1.8 Onboarding Step 7: Program Setup (Do you have a program?) - NEW USERS ONLY
- 1.9 Describe Your Program (Primary path - auto-lands here if "Yes") - NEW USERS ONLY
- 1.10 Program Builder ⭐ REDESIGNED (Secondary path - if user skips describe) - NEW USERS ONLY
  - Workout 1 Initial State (visual cards, metrics panel)
  - Workout 1 With Exercises (drag-drop, inline editing)
  - Exercise Detail Modal (reuses Exercise Library page)
  - Workout 2 Auto-Transition (smart suggestions)
  - Program Overview (final confirmation)
- 1.10.1 Program Builder Blocked State ⚠️ NEW - Read-only message for existing users
- 1.11 Program Recommendations (Step 8-9) - NEW USERS ONLY

### 2. Dashboard Layouts
- 2.1 Dashboard - Populated State (Desktop)
- 2.2 Dashboard - Empty State (Desktop)
- 2.3 Dashboard - Populated State (Mobile)
- 2.4 Dashboard - Empty State (Mobile)

### 3. Program Setup Screens
- 3.1 Program Description with AI
- 3.2 Routine Builder Interface
- 3.3 Program Recommendations List
- 3.4 Program Detail Preview

### 4. Import Flow
- 4.1 Import Landing / Selection
- 4.2 Import Upload & Processing
- 4.3 Import Success Summary

### 5. Navigation & Layout
- 5.1 Top Horizontal Navigation (Desktop) ⭐ DECISION MADE
- 5.2 Mobile Navigation (Hamburger Drawer)

---

# 1. ONBOARDING FLOW

## Onboarding Flow Overview

Based on mobile app screenshots, the complete onboarding flow has **9 total steps** for **NEW USERS ONLY**.

**EXISTING USERS**: Skip onboarding entirely after login, go directly to dashboard (already onboarded on mobile app).

**Steps 1-7** (Data Collection & Program Setup) - NEW USERS ONLY:
1. **Personal Info**: Gender, Age Range
2. **Training Frequency**: 1-2, 3-4, 5-6, 7+ days/week
3. **Training Duration**: 30min or less, 30-45, 45-60, 60+ minutes ✨ NEW
4. **Experience Level**: Beginner, Intermediate, Advanced, Expert
5. **Goals**: Build Muscle, Strength, Weight Loss, etc. (multi-select)
6. **Equipment Available**: Free Weights, Machines, Bands, Bodyweight, etc. (multi-select) ✨ NEW
7. **Program Setup**: Do you have a program? (Yes/No/Skip)

**Steps 8-9** (Program Configuration - varies by Step 7 choice) - NEW USERS ONLY:
- **Path A ("Yes, I have a program")**: 
  - Auto-loads → Step 8 = **Describe program** (text/voice → AI creates it)
  - Secondary option: "Use Program Builder instead" → Manual building workflow
  - Step 9 = Review AI-generated program OR Program overview (if manual)
- **Path B ("No, I need a program")**:
  - Auto-loads → Step 8 = **View recommendations** (based on onboarding data)
  - Step 9 = Confirm selected program
- **Path C ("Skip for now")**:
  - Goes directly to dashboard with empty state

**Key Design Pattern** (from mobile app):
- Orange "Skip" button (top-right) - #FF6B2C
- Orange "Next" button (bottom) - #FF6B2C
- Back arrow (top-left, gray)
- Progress dots: Blue/orange for current, gray for future
- Single-select: Radio buttons (right side of card)
- Multi-select: Checkboxes (top-right corner of card)

**UX Philosophy Applied**:
- **One clear primary action per screen** (no overwhelming choices)
- **Smart defaults** (auto-navigate to most common path)
- **Secondary options available** but not prominent (e.g., "Use Program Builder instead" as a link, not a big button)
- **Respect user context** (existing users skip onboarding entirely, new users get full flow)

**Critical Branching Logic**:
- **After Login/Signup**: System checks user data state
- **Existing user** → Skip ALL onboarding → Direct to dashboard
- **New user** → Show full 9-step onboarding → Dashboard

**Result**: Existing users never see any onboarding screens (they already completed similar flow on mobile)

---

## 1.1 Signup Page (`/signup`)

### Desktop Layout (1440px × 900px)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│  [EZLift Logo]                                            [Already have     │
│                                                            an account? Login]│
│                                                                              │
│                                                                              │
│                        Create your EZLift account                           │
│                        Start tracking smarter today                         │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  [G] Sign up with Google               │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  [] Sign up with Apple                 │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                        ── Or with email ──                                  │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  Email address                         │                     │
│              │  [________________________]            │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  Password                     👁        │                     │
│              │  [________________________]            │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ☑ I agree to Terms & Conditions and Privacy Policy             │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │        [Create Account]                │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│  Terms & Conditions  |  Pricing  |  Privacy  |  Contact                    │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Form max-width: 400px, centered
- Logo: Top-left, 48px height
- Heading: 32px, bold, dark gray (#1a1a1a)
- Subheading: 16px, regular, medium gray (#6b7280)
- Social buttons: Full-width within form, 48px height, white background, gray border, logo left-aligned
- Divider: 12px margin top/bottom
- Input fields: 48px height, light gray border, rounded 8px
- Password toggle: Eye icon, clickable
- Checkbox: 16px, blue when checked, label 14px
- CTA button: Full-width, 48px height, blue (#2563eb), white text, rounded 8px
- Footer links: 14px, gray, centered

---

## 1.2 Onboarding Step 1: Personal Info (`/onboarding/profile`)

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [EZLift Logo]                                            [Skip for now →]  │
│                                                                              │
│                                                                              │
│                    ● ○ ○ ○ ○ ○ ○ ○ ○                                        │
│                         1 of 9                                              │
│                                                                              │
│                                                                              │
│                        Tell us about yourself                               │
│                    This helps us personalize your experience                │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  Gender                                │                     │
│              │                                        │                     │
│              │  ○ Male    ○ Female    ○ Other         │                     │
│              │            ○ Prefer not to say         │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  Age Range                             │                     │
│              │                                        │                     │
│              │  [Select age range ▾]                  │                     │
│              │  • 18-25                               │                     │
│              │  • 26-35                               │                     │
│              │  • 36-45                               │                     │
│              │  • 46-55                               │                     │
│              │  • 56+                                 │                     │
│              │  • Prefer not to say                   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │              [Next →]                  │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Progress dots: 12px diameter, blue for current, light gray for future
- Step indicator: "1 of 5", 14px, gray, centered below dots
- Heading: 32px, bold, centered
- Subheading: 16px, regular, gray, centered
- Content container: Max-width 500px, centered
- Radio buttons: 20px, blue when selected, label 16px, horizontal layout for gender
- Dropdown: Full-width, 48px height, gray border, chevron icon right-aligned
- Next button: Full-width, 48px height, blue, white text
- Skip link: Top-right, 14px, gray, underline on hover

---

## 1.3 Onboarding Step 2: Training Frequency (`/onboarding/frequency`)

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                                  [Skip for now →]  │
│                                                                              │
│                                                                              │
│                    ● ● ○ ○ ○ ○ ○ ○ ○                                        │
│                         2 of 9                                              │
│                                                                              │
│                                                                              │
│                       How often do you train?                               │
│                   We'll use this to recommend programs                      │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  📅  1-2 times per week                │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  📅  3-4 times per week                │ ← Most common       │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  📅  5-6 times per week                │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  📅  7+ times per week (Daily)         │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │              [Next →]                  │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Back arrow: Top-left, 24px icon, clickable, gray
- Progress: 2nd dot filled blue
- Option cards: Full-width (max 500px), 72px height, white background, gray border (2px), rounded 12px
- Card hover: Light blue background (#eff6ff), blue border (#2563eb)
- Card selected: Blue background (#2563eb), white text, blue border, radio filled
- Icon: Left side of card, 24px
- Label: 18px, card center-left
- Radio: Right side, 20px
- Next button: Disabled (gray) until selection, enabled (blue) after selection

---

## 1.4 Onboarding Step 3: Training Duration (`/onboarding/duration`)

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                                  [Skip for now →]  │
│                                                                              │
│                                                                              │
│                    ● ● ● ○ ○ ○ ○ ○ ○                                        │
│                         3 of 9                                              │
│                                                                              │
│                                                                              │
│                   What is your average training duration?                   │
│                     This helps us recommend suitable programs               │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  ⏱️  30 Minutes or Less                 │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  ⏱️  30-45 Minutes                      │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  ⏱️  45-60 Minutes                      │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  ⏱️  60+ Minutes                        │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │              [Next →]                  │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Progress: 3rd dot filled (orange in mobile app)
- Same card styling as frequency step
- Single-select radio buttons
- Cards: 72px height, white background, gray border
- Selected state: Blue/orange background (use orange to match mobile Skip button), white text
- Timer icon: 24px, left side of each card
- Next button: Orange (#FF6B2C from mobile app) to match Skip button color

---

## 1.5 Onboarding Step 4: Experience Level (`/onboarding/experience`)

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                                  [Skip for now →]  │
│                                                                              │
│                    ● ● ● ● ○ ○ ○ ○ ○                                        │
│                         4 of 9                                              │
│                                                                              │
│                    What's your training experience?                         │
│              This helps us match you with the right programs                │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  🌱 Beginner                           │                     │
│              │     Less than 6 months            ○    │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  💪 Intermediate                       │                     │
│              │     6 months to 2 years           ○    │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  🏋️ Advanced                            │                     │
│              │     2 to 5 years                  ○    │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  🏆 Expert                             │                     │
│              │     5+ years                      ○    │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │              [Next →]                  │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Progress: 3rd dot filled
- Cards: Same styling as frequency step
- Two lines per card:
  - Line 1: Icon + Level name (18px, bold)
  - Line 2: Description (14px, gray)
- Vertical spacing between cards: 16px

---

## 1.6 Onboarding Step 5: Goals (`/onboarding/goals`)

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                                  [Skip for now →]  │
│                                                                              │
│                    ● ● ● ● ● ○ ○ ○ ○                                        │
│                         5 of 9                                              │
│                                                                              │
│                     What are your primary goals?                            │
│                          Select all that apply                              │
│                                                                              │
│                                                                              │
│         ┌────────────────────┐  ┌────────────────────┐                     │
│         │  💪                 │  │  🏋️                 │                     │
│         │  Build Muscle      │  │  Increase Strength │                     │
│         │                 ☑  │  │                 ☐  │                     │
│         └────────────────────┘  └────────────────────┘                     │
│                                                                              │
│         ┌────────────────────┐  ┌────────────────────┐                     │
│         │  ⚖️                 │  │  🏃                 │                     │
│         │  Lose Weight       │  │  Improve Endurance │                     │
│         │                 ☐  │  │                 ☐  │                     │
│         └────────────────────┘  └────────────────────┘                     │
│                                                                              │
│         ┌────────────────────┐  ┌────────────────────┐                     │
│         │  ⭐                 │  │  🏆                 │                     │
│         │  General Fitness   │  │  Athletic Perform. │                     │
│         │                 ☐  │  │                 ☐  │                     │
│         └────────────────────┘  └────────────────────┘                     │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │              [Next →]                  │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Progress: 4th dot filled
- Grid layout: 2 columns, 3 rows
- Card size: 220px × 140px each
- Gap between cards: 20px (horizontal and vertical)
- Card structure:
  - Icon at top (48px)
  - Label below icon (16px)
  - Checkbox at bottom-right corner (24px)
- Unselected: White background, gray border
- Selected: Blue background (#eff6ff), blue border (#2563eb), blue checkmark
- Next button: Enabled only after at least 1 selection

---

## 1.7 Onboarding Step 6: Equipment Available (`/onboarding/equipment`)

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                                  [Skip for now →]  │
│                                                                              │
│                    ● ● ● ● ● ● ○ ○ ○                                        │
│                         6 of 9                                              │
│                                                                              │
│                      What equipment do you have access to?                  │
│                          Select all that apply                              │
│                                                                              │
│                                                                              │
│         ┌────────────────────┐  ┌────────────────────┐                     │
│         │  🏋️                 │  │  🔩                 │                     │
│         │  Free Weights      │  │  Machines          │                     │
│         │                 ☑  │  │                 ☑  │                     │
│         └────────────────────┘  └────────────────────┘                     │
│                                                                              │
│         ┌────────────────────┐  ┌────────────────────┐                     │
│         │  🎯                 │  │  💪                 │                     │
│         │  Resistance Bands  │  │  Bodyweight        │                     │
│         │                 ☐  │  │                 ☑  │                     │
│         └────────────────────┘  └────────────────────┘                     │
│                                                                              │
│         ┌────────────────────┐  ┌────────────────────┐                     │
│         │  🏃                 │  │  🎾                 │                     │
│         │  Cardio Equipment  │  │  Other             │                     │
│         │                 ☐  │  │                 ☐  │                     │
│         └────────────────────┘  └────────────────────┘                     │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │              [Next →]                  │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Progress: 6th dot filled
- Grid layout: 2 columns × 3 rows
- Card size: 220px × 140px each
- Gap: 20px horizontal and vertical
- Multi-select checkboxes (top-right corner of each card)
- Unselected: Light gray background (#f3f4f6), gray border
- Selected: Blue background (#2563eb from mobile app screenshots), white text, blue checkmark
- Icons: 48px, centered at top of card
- Label: 16px, centered below icon
- Next button: Enabled after at least 1 selection (orange #FF6B2C)

**Mobile App Color Note**: The mobile screenshots show this using **blue for selected items** (not orange), so we should use the blue from the color palette.

**Note for Existing Users**: Existing users **never see onboarding** (not even Steps 1-6). After login, they go directly to dashboard. Only new users see the full 9-step onboarding flow.

---

## 1.8 Onboarding Step 7: Program Setup (`/onboarding/program`)

⚠️ **ENTIRE ONBOARDING (Steps 1-9) ONLY SHOWN TO NEW USERS**

**Existing users**: Skip all onboarding after login, go directly to dashboard

**Prerequisite**: User data state = 'new' (no existing workouts/sessions)

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                                  [Skip for now →]  │
│                                                                              │
│                    ● ● ● ● ● ● ● ○ ○                                        │
│                         7 of 9                                              │
│                                                                              │
│                  Do you already have a training program?                    │
│                     We can help you get started either way                  │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  ✅ Yes, I have a program              │                     │
│              │                                        │                     │
│              │  I'll describe it or build it myself   │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │  🔍 No, I need a program               │                     │
│              │                                        │                     │
│              │  Show me recommended programs          │                     │
│              │                                    ○   │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│                                                                              │
│                     [Skip - I'll decide later]                              │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │              [Next →]                  │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Progress: 7 of 9 dots filled (orange)
- Two main option cards: Same style as previous steps
- Card height: 100px (taller to accommodate 2 text lines)
- First line: Main option (18px, bold) + emoji/icon
- Second line: Description (14px, gray)
- Skip link: Below options, 14px, gray text, centered
- Next button: Proceeds based on selection

**Flow (Updated)**:
- **If "Yes, I have a program"** → Auto-loads **Describe Program screen** (1.9) - primary AI path
- **If "No, I need a program"** → Auto-loads **Program Recommendations** (1.11)
- **If "Skip for now"** → Go to **Dashboard** with empty state + program suggestions

---

## 1.9 Describe Your Program (Step 8 of 9)

**Auto-loads when user selects "Yes, I have a program" in Step 7**

⚠️ **Access Control**: Only accessible to users with userState = 'new'

**For existing users**: Show blocked state (see Section 1.10.1)

**UX Philosophy**: Direct user to AI-powered description (primary action), with manual builder as secondary option for those who prefer it.

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                                  [Skip for now →]  │
│                                                                              │
│                    ● ● ● ● ● ● ● ● ○                                        │
│                         8 of 9                                              │
│                                                                              │
│                         Describe your training program                      │
│                    Tell us about your routine, and we'll help you set it up │
│                                                                              │
│                                                                              │
│              ┌────────────────────────────────────────────────────────────┐ │
│              │  Describe your program...                                  │ │
│              │                                                            │ │
│              │  e.g., "I do Push/Pull/Legs 6 days per week.              │ │
│              │  Push day: Bench press, overhead press, dips...           │ │
│              │  Pull day: Deadlifts, rows, pullups...                    │ │
│              │  Leg day: Squats, leg press, lunges..."                   │ │
│              │                                                            │ │
│              │                                                            │ │
│              │                                                            │ │
│              │                                                            │ │
│              │                                                            │ │
│              │ __________________________________________________ [🎤]    │ │
│              │                                             300 / 2000     │ │
│              └────────────────────────────────────────────────────────────┘ │
│                                                                              │
│              💡 Tip: Include workout names, exercises, and frequency for    │
│                 best results                                                │
│                                                                              │
│              ┌────────────────────────────────────────┐                     │
│              │        [Create My Program →]           │                     │
│              └────────────────────────────────────────┘                     │
│                                                                              │
│              Or prefer to build manually?                                   │
│              [Use our intuitive Program Builder instead →]                  │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Text area: 600px wide × 300px tall, light gray border, rounded corners
- Placeholder text: Gray, italic, example program description
- Character counter: Bottom-right, 14px, gray (shows current / max 2000)
- Voice button: 32px icon, orange (#FF6B2C), clickable (opens voice recording modal)
- Tip callout: Light blue background (#eff6ff), blue text (#2563eb), info icon
- Primary CTA: "Create My Program →" (orange #FF6B2C, full-width max 400px, centered, enabled after 50+ characters)
- Secondary option text: 14px, gray, centered, "Or prefer to build manually?"
- Secondary link: Blue (#2563eb), underline on hover, "Use our intuitive Program Builder instead →"

**Flow**:
- **Click "Create My Program"** → AI processing screen → Program preview
- **Click "Use Program Builder instead"** → Go to Program Builder (section 1.10)
- **Click "Skip for now"** → Go to dashboard with empty state

**After clicking "Create My Program"**:
- Show loading state: "Analyzing your program... ⏳"
- AI processes description via GPT API
- Parse into workout structure
- → Go to Program Preview screen (show parsed program, allow edits)

---

## 1.10 Program Builder (Secondary Path)

**Route**: `/programs/create`

⚠️ **Access Control**: Only accessible to users with userState = 'new'

**For existing users**: Show blocked state (see Section 1.10.1)

**Triggered when** (new users only):
- User clicks "Use our intuitive Program Builder instead" from Describe Program screen (1.9)
- User clicks "Create a Program" from dashboard
- User navigates to Programs → New Program

**Note**: Can be accessed anytime by new users, not just during onboarding.

**Design Philosophy**: 
- Auto-start building (no empty state)
- Visual, card-based (reuses Exercise Library components)
- Flow-based experience (Workout 1 → 2 → 3 → Overview → Done)
- Real-time feedback (metrics panel)
- Desktop-optimized (leverage big screens)

### Desktop Layout - Workout 1 (Initial State)

**User lands directly in building mode - no empty state asking for program name**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Programs  History  Import              [Avatar ▾]        │
├──────────────────────────────────────────────────────────────────────────────┤
│  Program Builder: Workout 1                              [Save Draft] [×]   │
├────────┬─────────────────────────────────────────────────────────────────────┤
│        │  ┌─────────────────────────────────────────────────────────────┐   │
│ SIDE   │  │  Program: [Untitled Program_____________]  ✎  [Rename]     │   │
│ PANEL  │  └─────────────────────────────────────────────────────────────┘   │
│        │                                                                      │
│ ┌────┐ │  ┌─────────────────────────────────────────────────────────────┐   │
│ │ 📋 │ │  │  🏋️ Workout 1                              [Rename] [⋮]     │   │
│ │ W1 │ │  │  ─────────────────────────────────────────────────────────  │   │
│ │[●] │ │  │                                                             │   │
│ └────┘ │  │  Exercises in this workout: 0                               │   │
│        │  │                                                             │   │
│ ┌────┐ │  │  💡 Tip: Start by adding your first exercise                │   │
│ │ 📋 │ │  └─────────────────────────────────────────────────────────────┘   │
│ │ W2 │ │                                                                      │
│ │[○] │ │  ┌─────────────────────────────────────────────────────────────┐   │
│ └────┘ │  │  🔍 Search exercises...                        [Show Filters]│   │
│        │  └─────────────────────────────────────────────────────────────┘   │
│ ─────  │                                                                      │
│        │  Popular Exercises for Getting Started:                             │
│ [+Add  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│ Workout│  │  [Image]  │ │  [Image]  │ │  [Image]  │ │  [Image]  │          │
│ ]      │  │           │ │           │ │           │ │           │          │
│        │  │  Barbell  │ │  Barbell  │ │  Barbell  │ │  Pull-ups │          │
│ ─────  │  │  Bench    │ │  Squat    │ │  Deadlift │ │           │          │
│        │  │  Press    │ │           │ │           │ │  [Lats]   │          │
│Metrics │  │           │ │           │ │           │ │  Pull     │          │
│        │  │  [Chest]  │ │  [Quads]  │ │  [Back]   │ │  Intermed │          │
│📊 Musc │  │  Push     │ │  Push     │ │  Pull     │ │           │          │
│ Covered│  │  Begin.   │ │  Intermed │ │  Advanced │ │  [+Add]   │          │
│        │  │           │ │           │ │           │ │           │          │
│None    │  │  [+Add]   │ │  [+Add]   │ │  [+Add]   │ │           │          │
│        │  └───────────┘ └───────────┘ └───────────┘ └───────────┘          │
│⏱ Durat │                                                                      │
│ion     │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│        │  │  [Image]  │ │  [Image]  │ │  [Image]  │ │  [Image]  │          │
│0 min   │  │           │ │           │ │           │ │           │          │
│        │  │  Overhead │ │  Barbell  │ │  Dumbbell │ │  Leg      │          │
│🎯 Exerc│  │  Press    │ │  Row      │ │  Curl     │ │  Press    │          │
│ Variety│  │           │ │           │ │           │ │           │          │
│        │  │  [Should] │ │  [Back]   │ │  [Biceps] │ │  [Quads]  │          │
│0 Push  │  │  Push     │ │  Pull     │ │  Pull     │ │  Push     │          │
│0 Pull  │  │  Intermed │ │  Intermed │ │  Begin.   │ │  Intermed │          │
│        │  │           │ │           │ │           │ │           │          │
│        │  │  [+Add]   │ │  [+Add]   │ │  [+Add]   │ │  [+Add]   │          │
│        │  └───────────┘ └───────────┘ └───────────┘ └───────────┘          │
│        │                                                                      │
│        │  [Show More Exercises →]                                            │
│        │                                                                      │
└────────┴──────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:

**Top Navigation Bar** (First row, 64px):
- Same as dashboard: Logo + Dashboard/Programs/History/Import + Avatar dropdown
- Programs link is active (underlined or highlighted)

**Page Header Bar** (Second row, 56px):
- Title: "Program Builder: Workout 1" (left-aligned, 24px bold)
- Actions: "Save Draft" (gray button), Close × (right-aligned)
- Background: Light gray (#f9fafb)
- Border-bottom: 1px gray

**Left Side Panel** (200px width, fixed):
- **Workout Navigation**:
  - Workout 1 [●] ← Current (blue circle, filled)
  - Workout 2 [○] ← Not started (gray circle, empty)
  - Divider
  - [+ Add Workout] button (full-width, gray)
  - Divider
  
- **Real-Time Metrics** (updates as user adds exercises):
  - **📊 Muscles Covered**: "None" → "Chest, Shoulders, Triceps"
  - **⏱ Duration**: "0 min" → "45 min" (based on sets + rest time)
  - **🎯 Exercise Variety**:
    - "0 Push, 0 Pull" → "4 Push, 3 Pull"
    - "0 Upper, 0 Lower" → "5 Upper, 2 Lower"

**Main Content Area** (1240px width):
- **Program Name** (top):
  - Inline editable: "Untitled Program"
  - Pencil icon + "Rename" link
  
- **Current Workout Card** (collapsible):
  - Header: "🏋️ Workout 1" + Rename + Menu (⋮)
  - Content: "Exercises in this workout: 0"
  - Tip: "💡 Tip: Start by adding your first exercise"
  
- **Search Bar** (full-width):
  - Search input with magnifying glass icon
  - "Show Filters" button (expands filter panel below)

- **Exercise Grid** (4 columns, 280px × 420px cards):
  - **Reuses Exercise Library card design exactly**:
    - Exercise illustration (280px × 200px)
    - Exercise name (18px bold, 2-line max)
    - Primary muscle icon + Exercise type
    - Tag pills (muscle, push/pull, difficulty)
    - Brief description (14px, gray, 2 lines)
    - **"+ Add" button** (blue, full-width, 40px) instead of "View Details"
  
  - **Interaction**:
    - Click **image or name** → Opens exercise detail modal
    - Click **"+ Add"** → Adds exercise to current workout
    - After adding: Button shows "✓ Added" (green, 2 sec) then reverts

- **Section Headers**: Context-aware suggestions:
  - Initially: "Popular Exercises for Getting Started:"
  - After adding: "Continue Building with More Exercises:"
  
- **Load More**: "[Show More Exercises →]" link

**No "Add Exercise Modal"** - Exercise grid is always visible in main content area!

---

### Desktop Layout - Workout 1 (With Exercises Added)

**After user adds 4 exercises:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Programs  History  Import              [Avatar ▾]        │
├──────────────────────────────────────────────────────────────────────────────┤
│  Program Builder: Workout 1                              [Save Draft] [×]   │
├────────┬─────────────────────────────────────────────────────────────────────┤
│        │  ┌─────────────────────────────────────────────────────────────┐   │
│ SIDE   │  │  Program: [Push/Pull/Legs_______________]  ✎                │   │
│ PANEL  │  └─────────────────────────────────────────────────────────────┘   │
│        │                                                                      │
│ ┌────┐ │  ┌─────────────────────────────────────────────────────────────┐   │
│ │ 📋 │ │  │  🏋️ Workout 1: Push Day                      [Done] [⋮]      │   │
│ │ W1 │ │  │  ─────────────────────────────────────────────────────────  │   │
│ │[●] │ │  │  Exercises: 4  •  Est. Duration: 45 min  •  24 sets total   │   │
│ └────┘ │  └─────────────────────────────────────────────────────────────┘   │
│        │                                                                      │
│ ┌────┐ │  ┌─────────────────────────────────────────────────────────────┐   │
│ │ 📋 │ │  │  Exercises in Workout 1:                    [Collapse ▲]    │   │
│ │ W2 │ │  │  ═══════════════════════════════════════════════════════    │   │
│ │[○] │ │  │                                                             │   │
│ └────┘ │  │  1. 💪 Barbell Bench Press           [↕] [×] [⋮]            │   │
│        │  │     • 4 sets × 8-10 reps @ 80 kg                            │   │
│ ─────  │  │     • Chest, Shoulders, Triceps                             │   │
│        │  │     ─────────────────────────────────────────────────────   │   │
│ [+Add  │  │                                                             │   │
│ Workout│  │  2. 💪 Incline Dumbbell Press        [↕] [×] [⋮]            │   │
│ ]      │  │     • 3 sets × 10-12 reps @ 30 kg per hand                  │   │
│        │  │     • Chest, Shoulders                                      │   │
│ ─────  │  │     ─────────────────────────────────────────────────────   │   │
│        │  │                                                             │   │
│Metrics │  │  3. 💪 Overhead Press                 [↕] [×] [⋮]            │   │
│        │  │     • 3 sets × 8-12 reps @ 50 kg                            │   │
│📊 Musc │  │     • Shoulders, Triceps                                    │   │
│ Covered│  │     ─────────────────────────────────────────────────────   │   │
│        │  │                                                             │   │
│ Chest  │  │  4. 💪 Tricep Pushdowns               [↕] [×] [⋮]            │   │
│ Should │  │     • 3 sets × 12-15 reps @ 40 kg                           │   │
│ Tricep │  │     • Triceps                                               │   │
│        │  │                                                             │   │
│⏱ Durat │  │  [+ Add Another Exercise]                                   │   │
│ion     │  └─────────────────────────────────────────────────────────────┘   │
│        │                                                                      │
│45 min  │  ┌─────────────────────────────────────────────────────────────┐   │
│        │  │  🔍 Search for exercises...                   [Show Filters]│   │
│🎯 Exerc│  └─────────────────────────────────────────────────────────────┘   │
│ Variety│                                                                      │
│        │  Continue Building with More Exercises:                             │
│4 Push  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│0 Pull  │  │  [Image]  │ │  [Image]  │ │  [Image]  │ │  [Image]  │          │
│        │  │  Lateral  │ │  Cable    │ │  Chest    │ │  Skull    │          │
│4 Upper │  │  Raises   │ │  Fly      │ │  Dips     │ │  Crushers │          │
│0 Lower │  │           │ │           │ │           │ │           │          │
│        │  │  [Should] │ │  [Chest]  │ │  [Chest]  │ │  [Tricep] │          │
│        │  │  Isolat.  │ │  Push     │ │  Push     │ │  Push     │          │
│        │  │  Intermed │ │  Begin.   │ │  Intermed │ │  Intermed │          │
│        │  │  [+Add]   │ │  [+Add]   │ │  [+Add]   │ │  [+Add]   │          │
│        │  └───────────┘ └───────────┘ └───────────┘ └───────────┘          │
│        │                                                                      │
│        │  ┌─────────────────────────────────────────────────────────────┐   │
│        │  │           [Workout 1 Complete - Next Workout →]             │   │
│        │  └─────────────────────────────────────────────────────────────┘   │
│        │                                                                      │
└────────┴──────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:

**Exercise List** (when exercises added):
- Each exercise shows:
  - Drag handle [↕]: 6-dot icon, left edge (desktop only)
  - Number: Exercise order (1, 2, 3, 4...)
  - Icon + Name: Clickable (opens detail modal)
  - Sets/Reps/Weight: Editable inline (click to edit)
  - Muscles: Gray text, comma-separated
  - Actions: Delete [×], Menu [⋮]
  - Drag-to-reorder enabled (desktop feature)

**Menu Options** (⋮):
- Edit sets/reps/weight
- Duplicate exercise
- Move to different workout
- Remove from workout

**Bottom CTA**:
- "[Workout 1 Complete - Next Workout →]" (full-width blue button)
- Enabled after at least 1 exercise added
- Clicking → Auto-saves Workout 1, transitions to Workout 2

---

### Exercise Detail Modal

**When user clicks exercise image or name:**

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Barbell Bench Press (Incline)                                     [×]  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  [████████████████ Large Exercise Image/Illustration ████████████████]  │
│  [Showing proper form with muscle groups highlighted in red]           │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  📋 Exercise Details                                              │ │
│  │  ────────────────────────────────────────────────────────────     │ │
│  │                                                                   │ │
│  │  Primary Muscle:    Chest          │  Secondary Muscles:         │ │
│  │  Exercise Type:     Weight & Reps  │  Shoulders, Triceps         │ │
│  │  Force Type:        Push           │                             │ │
│  │  Difficulty Level:  Intermediate   │  Equipment: Barbell         │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  ▸ Instructional Video                          [Click to expand]│ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  ▸ How-To Instructions                          [Click to expand]│ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │  💪 Add to Workout 1:                                             │ │
│  │  ────────────────────────────────────────────────────────────     │ │
│  │                                                                   │ │
│  │  Sets:  [4__]  ×  Reps: [8-10____]  @  Weight: [80___] kg       │ │
│  │                                                                   │ │
│  │  Rest between sets: [90___] seconds (optional)                   │ │
│  │                                                                   │ │
│  │  Notes: [_______________________________________________]         │ │
│  │                                                                   │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  ┌───────────────────────────────────────────────────────────────────┐ │
│  │              [Add to Workout 1 →]                                 │ │
│  └───────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│  [Just View Info - Close]                                              │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

**Modal Design Specs**:
- Width: 700px, centered
- Height: Auto (max 80vh, scrollable)
- Overlay: Dark semi-transparent background
- Exercise image: 600px wide, aspect ratio preserved
- Details grid: 2 columns
- Collapsible sections: Video and Instructions (start collapsed)
- Sets/Reps form: Inline inputs with labels
- Default values: 3 sets, 8-12 reps, weight TBD
- Add button: Blue, full-width
- After adding: Modal closes, exercise appears in workout list

**Reuses Existing Exercise Detail Page**:
- Same layout as `/exercise-library/[id]` page
- Just shown in modal instead of full page
- Maintains consistency across site

---

### Desktop Layout - Workout 2 (Auto-Transition)

**After user clicks "Workout 1 Complete - Next Workout":**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Programs  History  Import              [Avatar ▾]        │
├──────────────────────────────────────────────────────────────────────────────┤
│  Program Builder: Workout 2                              [Save Draft] [×]   │
├────────┬─────────────────────────────────────────────────────────────────────┤
│        │  ┌─────────────────────────────────────────────────────────────┐   │
│ SIDE   │  │  Program: [Push/Pull/Legs_______________]  ✎                │   │
│ PANEL  │  └─────────────────────────────────────────────────────────────┘   │
│        │                                                                      │
│ ┌────┐ │  ┌─────────────────────────────────────────────────────────────┐   │
│ │ 📋 │ │  │  ✓ Workout 1: Push Day (4 exercises)        [View] [Edit]   │   │
│ │ W1 │ │  └─────────────────────────────────────────────────────────────┘   │
│ │[✓] │ │                                                                      │
│ └────┘ │  ┌─────────────────────────────────────────────────────────────┐   │
│        │  │  🏋️ Workout 2                              [Rename] [⋮]     │   │
│ ┌────┐ │  │  ─────────────────────────────────────────────────────────  │   │
│ │ 📋 │ │  │                                                             │   │
│ │ W2 │ │  │  Exercises in this workout: 0                               │   │
│ │[●] │ │  │                                                             │   │
│ └────┘ │  │  💡 Great! Now let's build Workout 2                        │   │
│        │  └─────────────────────────────────────────────────────────────┘   │
│ ┌────┐ │                                                                      │
│ │ 📋 │ │  ┌─────────────────────────────────────────────────────────────┐   │
│ │ W3 │ │  │  🔍 Search exercises...                        [Show Filters]│   │
│ │[○] │ │  └─────────────────────────────────────────────────────────────┘   │
│ └────┘ │                                                                      │
│        │  💡 Based on Workout 1 (Push), we suggest Pull exercises:           │
│ ─────  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐          │
│        │  │  [Image]  │ │  [Image]  │ │  [Image]  │ │  [Image]  │          │
│ [+Add  │  │  Barbell  │ │  Pull-ups │ │  Barbell  │ │  Face     │          │
│ Workout│  │  Deadlift │ │           │ │  Row      │ │  Pulls    │          │
│ ]      │  │           │ │  [Lats]   │ │           │ │           │          │
│        │  │  [Back]   │ │  Pull     │ │  [Back]   │ │  [Rear D] │          │
│ ─────  │  │  Pull     │ │  Intermed │ │  Pull     │ │  Pull     │          │
│        │  │  Advanced │ │           │ │  Intermed │ │  Begin.   │          │
│Metrics │  │  [+Add]   │ │  [+Add]   │ │  [+Add]   │ │  [+Add]   │          │
│ (Total)│  └───────────┘ └───────────┘ └───────────┘ └───────────┘          │
│        │                                                                      │
│📊 Musc │  [Show More Exercises →]                                            │
│ Covered│                                                                      │
│        │  ┌─────────────────────────────────────────────────────────────┐   │
│ Chest  │  │        [Workout 2 Complete - Next Workout →]                │   │
│ Should │  │              [Or Finish Program →]                          │   │
│ Tricep │  └─────────────────────────────────────────────────────────────┘   │
│ *Back* │                                                                      │
│ *Lats* │                                                                      │
│        │                                                                      │
│⏱ Total │                                                                      │
│ Durat. │                                                                      │
│        │                                                                      │
│90 min  │                                                                      │
│(2 work)│                                                                      │
│        │                                                                      │
│🎯 Varie│                                                                      │
│ty      │                                                                      │
│(Total) │                                                                      │
│        │                                                                      │
│4 Push  │                                                                      │
│4 Pull  │                                                                      │
│        │                                                                      │
│8 Upper │                                                                      │
│0 Lower │                                                                      │
└────────┴──────────────────────────────────────────────────────────────────────┘
```

**Key Changes from Workout 1**:
- **Workout 1 collapsed** - Shows checkmark [✓], summary, View/Edit buttons
- **Workout 2 active** - Blue filled circle [●] in sidebar
- **Workout 3 added** - Gray empty circle [○], ready for next
- **Metrics updated to TOTAL** - Shows cumulative across all workouts:
  - Muscles: Adds new muscles from Workout 2 (*italics* = newly added)
  - Duration: 90 min (45 min W1 + 45 min W2)
  - Variety: Total counts (4 Push from W1, 4 Pull from W2)
- **Smart suggestions** - "Based on Workout 1 (Push), we suggest Pull exercises"
- **Two CTAs** - "Next Workout" OR "Finish Program" (user can stop at 2 workouts)

---

### Program Overview (Final Step)

**After user clicks "Finish Program" from any workout:**

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Programs  History  Import              [Avatar ▾]        │
├──────────────────────────────────────────────────────────────────────────────┤
│  [← Back to Builder]      Program Overview                 [Save & Finish]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                         Your Program Is Ready! 🎉                           │
│                          Review and confirm below                           │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Program Name: [Push/Pull/Legs_______________]  [Edit Name]         │   │
│  │                                                                      │   │
│  │  📊 Program Stats:                                                   │   │
│  │  • 3 workouts                                                        │   │
│  │  • 21 total exercises                                                │   │
│  │  • Estimated duration: 45-60 min per workout                         │   │
│  │  • Muscles trained: Chest, Shoulders, Triceps, Back, Lats, Biceps,  │   │
│  │    Quads, Hamstrings, Glutes, Calves                                │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  📋 Workout 1: Push Day                     [Edit] [View Details ▾] │   │
│  │  ──────────────────────────────────────────────────────────────      │   │
│  │  • 4 exercises • 45 min • Trains: Chest, Shoulders, Triceps         │   │
│  │                                                                      │   │
│  │  1. Barbell Bench Press - 4×8-10 @ 80kg                             │   │
│  │  2. Incline Dumbbell Press - 3×10-12 @ 30kg                         │   │
│  │  3. Overhead Press - 3×8-12 @ 50kg                                  │   │
│  │  4. Tricep Pushdowns - 3×12-15 @ 40kg                               │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  📋 Workout 2: Pull Day                     [Edit] [View Details ▾] │   │
│  │  ──────────────────────────────────────────────────────────────      │   │
│  │  • 4 exercises • 50 min • Trains: Back, Lats, Biceps                │   │
│  │                                                                      │   │
│  │  1. Barbell Deadlift - 4×5-8 @ 120kg                                │   │
│  │  2. Pull-ups - 3×8-12 @ Bodyweight                                  │   │
│  │  3. Barbell Row - 3×8-12 @ 70kg                                     │   │
│  │  4. Barbell Curls - 3×10-12 @ 30kg                                  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  📋 Workout 3: Leg Day                      [Edit] [View Details ▾] │   │
│  │  ──────────────────────────────────────────────────────────────      │   │
│  │  • 5 exercises • 55 min • Trains: Quads, Hamstrings, Glutes, Calves│   │
│  │                                                                      │   │
│  │  1. Barbell Squat - 4×6-10 @ 100kg                                  │   │
│  │  2. Romanian Deadlift - 3×8-12 @ 80kg                               │   │
│  │  3. Leg Press - 3×10-15 @ 150kg                                     │   │
│  │  4. Leg Curls - 3×12-15 @ 50kg                                      │   │
│  │  5. Calf Raises - 4×15-20 @ 60kg                                    │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │              [Save Program & Go to Dashboard →]                      │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  [← Back to Edit]                                                           │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Program Overview Design Specs**:
- No side panel (full width for overview)
- Celebration heading: "Your Program Is Ready! 🎉"
- Program name: Editable at top
- **Program Stats Card**: Summary of entire program (workouts, exercises, duration, muscles)
- **Workout Summary Cards**: Collapsible
  - Shows: Workout name + stats (exercises count, duration, muscles)
  - Exercise list (collapsed by default)
  - Click "View Details ▾" to expand full exercise list
  - Edit button → Returns to that workout's builder screen
- **Final CTA**: "Save Program & Go to Dashboard" (blue, full-width)
- **Back link**: Returns to last workout for edits

**After clicking "Save & Go to Dashboard"**:
- Program saved to user's programs
- Set as Active Program
- → Redirect to Dashboard with program card populated

---

## 1.10.1 Program Builder - Blocked State (Existing Users) ⚠️ NEW

**Route**: `/programs/create`

**Triggered when**: Existing user tries to access Program Builder

**Purpose**: Gracefully block access while showing value and alternatives

**User State**: 'existing' (has workout data from mobile app)

### Desktop Layout

```
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
```

**Design Specs**:
- Alert/Info card: Light blue background (#eff6ff), blue border (#2563eb), rounded 12px
- Icon: Info icon (ℹ️), 24px, blue, top-left of card
- Heading: "Coming Soon" (positive framing, not "Access Denied")
- Body text: 16px, gray, explains why + what they can do
- Checklist: Green checkmarks (✅), 16px, left-aligned
- Program list card: White background, shows user's existing programs (from mobile)
- Program items: Bullet list with "View Details" links (opens read-only program view)
- CTAs: 
  - Primary: "View All Programs" (blue, takes to programs list page)
  - Secondary: "Download Mobile App" (gray, opens app store)
  - Tertiary: "Import Workout History" (gray, opens import flow)
- Back button: Returns to dashboard
- {Y} is dynamic (actual program count)

**Analytics Events**:
```
Program Builder Access Blocked
  - userState: 'existing'
  - programCount: {Y}
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

## 1.11 Program Recommendations (Step 8-9 of 9)

**Route**: `/onboarding/program-recommendations`

**Auto-loads when user selects "No, I need a program" in Step 7**

⚠️ **Access Control**: Only accessible to users with userState = 'new' (Step 7 only shown to new users)

**For existing users**: Never reach this screen (skip to dashboard after Step 6)

**Progress**: Step 8 = View recommendations, Step 9 = Confirm program

### Desktop Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                                  [Skip for now →]  │
│                                                                              │
│                                                                              │
│                    Programs recommended for you                             │
│                 Based on your goals and training frequency                  │
│                                                                              │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  💪 Push/Pull/Legs - Intermediate                   [Select Program]  │ │
│  │  ────────────────────────────────────────────────────────────────     │ │
│  │  📅 3 days/week  •  ⏱ 60-75 min per session  •  🎯 Muscle & Strength  │ │
│  │                                                                        │ │
│  │  Day 1: Push (Chest, Shoulders, Triceps)                              │ │
│  │  Day 2: Pull (Back, Biceps, Rear Delts)                               │ │
│  │  Day 3: Legs (Quads, Hamstrings, Glutes, Calves)                      │ │
│  │                                                                        │ │
│  │  [View Full Program Details →]                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  🏋️ Upper/Lower Split - Intermediate            [Select Program]      │ │
│  │  ────────────────────────────────────────────────────────────────     │ │
│  │  📅 4 days/week  •  ⏱ 60-90 min per session  •  🎯 Strength Focus     │ │
│  │                                                                        │ │
│  │  Day 1: Upper Power • Day 2: Lower Power                              │ │
│  │  Day 3: Upper Hypertrophy • Day 4: Lower Hypertrophy                  │ │
│  │                                                                        │ │
│  │  [View Full Program Details →]                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  ⭐ Full Body - Beginner                          [Select Program]     │ │
│  │  ────────────────────────────────────────────────────────────────     │ │
│  │  📅 3 days/week  •  ⏱ 45-60 min per session  •  🎯 General Fitness    │ │
│  │                                                                        │ │
│  │  Day 1: Full Body A • Day 2: Full Body B • Day 3: Full Body C         │ │
│  │                                                                        │ │
│  │  [View Full Program Details →]                                        │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│                                                                              │
│              [Browse All Programs]      [I'll Build My Own]                 │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Program cards: Full-width, white background, gray border, 16px padding
- Card header: Program name (20px, bold) + icon + "Select Program" button (right-aligned)
- Meta row: Icons + text (14px, gray), separated by bullets
- Preview: 2-3 lines showing workout split (14px, regular)
- View Details link: Blue, underline on hover, expands card to show full program
- Select button: Blue, white text, 40px height
- Bottom links: Gray, centered, 16px spacing between

**After selecting a program**:
- Show confirmation: "✅ Program added!"
- → Redirect to dashboard with program activated

---

# 2. DASHBOARD LAYOUTS

---

## 2.1 Dashboard - Populated State (Desktop 1440px × 900px)

### Full Layout with Top Navigation

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Programs  History  Import              [Avatar ▾]        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Dashboard                            [Date Range: Last 30 Days ▾] [Refresh]│
│                                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────────┐            │
│  │  Training Volume           │  │  Personal Records          │            │
│  │  ─────────────────────     │  │  ─────────────────────     │            │
│  │  [This Week ▾]             │  │  Last 30 days              │            │
│  │                            │  │                            │            │
│  │      📊 Bar Chart          │  │  🔥 Barbell Bench Press    │            │
│  │      [12 weeks view]       │  │     100 kg × 5 reps        │            │
│  │      ▃ ▄ ▅ ▆ █ ▆ ▇ █       │  │     2 days ago             │            │
│  │      ║ ║ ║ ║ ║ ║ ║ ║       │  │                            │            │
│  │  ─────────────────────     │  │  💪 Barbell Squat          │            │
│  │  This Week                 │  │     140 kg × 8 reps        │            │
│  │  • 45 sets                 │  │     Yesterday              │            │
│  │  • 12,500 kg volume        │  │                            │            │
│  │  • ↑ +15% vs last week     │  │  🏋️ Deadlift               │            │
│  │                            │  │     180 kg × 3 reps        │            │
│  │  [View Details →]          │  │     3 days ago             │            │
│  └────────────────────────────┘  │                            │            │
│                                  │  [View All PRs →]          │            │
│                                  └────────────────────────────┘            │
│                                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────────┐            │
│  │  Recent Workouts           │  │  Progress Tracking         │            │
│  │  ─────────────────────     │  │  ─────────────────────     │            │
│  │                            │  │  Exercise: [Bench Press ▾] │            │
│  │  📅 Today, 9:30 AM         │  │  Range: [12 weeks ▾]       │            │
│  │  Push Day - Week 4         │  │                            │            │
│  │  1h 15min • 8 exercises    │  │      📈 Line Chart          │            │
│  │  💪 Chest, Shoulders       │  │         ╱                  │            │
│  │  ─────────────────────     │  │       ╱                    │            │
│  │  📅 Yesterday              │  │     ╱                      │            │
│  │  Pull Day - Week 4         │  │   ╱                        │            │
│  │  1h 05min • 7 exercises    │  │  ─────────────────────     │            │
│  │  💪 Back, Biceps           │  │  Starting: 85 kg (12w ago) │            │
│  │  ─────────────────────     │  │  Current:  95 kg           │            │
│  │  📅 Jan 6                  │  │  Progress: +10 kg (+11.8%) │            │
│  │  Leg Day - Week 3          │  │                            │            │
│  │  1h 30min • 6 exercises    │  │  [Analyze Progress →]      │            │
│  │  💪 Legs, Glutes           │  └────────────────────────────┘            │
│  │                            │                                              │
│  │  [View History →]          │                                              │
│  └────────────────────────────┘                                              │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  Active Program: Push/Pull/Legs - Week 5 of 12                       │   │
│  │  Next workout: Pull Day - Tomorrow (Thu)                             │   │
│  │  [View Program]  [Edit Program]  [Start Workout on Mobile]           │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:

**Top Navigation Bar** (64px height, full-width):
- Background: White (#ffffff)
- Border-bottom: 1px solid gray (#e5e7eb)
- Logo: Left, 40px height, 16px padding
- Nav items: Horizontal, center-aligned
  - Dashboard (active: underline or highlight)
  - Programs
  - History
  - Import
- User avatar: Right, 32px circle, click for dropdown
- Avatar dropdown: Profile, Settings, Logout

**Main Content Area** (Full width: 1440px - 64px padding = 1376px):
- Page heading: "Dashboard", 32px bold, left-aligned
- Global controls: Date range filter (right), Refresh button
- Dashboard grid: 2×2 layout for top 4 cards
- Card dimensions: 664px × 340px each (wider than sidebar version!)
- Gap between cards: 24px (horizontal and vertical)
- Active Program card: Full-width below, 1376px × 120px
- Card padding: 24px
- Card background: White
- Card border: 1px solid gray (#e5e7eb), rounded 12px
- Card shadow: Subtle (0 1px 3px rgba(0,0,0,0.1))

**Card Components**:
- Heading: 20px, bold, dark gray
- Subheading/meta: 14px, regular, medium gray
- Divider: 1px solid light gray, 16px margin top/bottom
- Chart area: 200px height
- Stats section: Icons + text, 16px
- CTA links: Blue, underline on hover, arrow icon

**Charts**:
- Bar chart: Blue bars (#2563eb), gray axis, labels 12px
- Line chart: Blue line (#2563eb), gray grid, data points clickable
- Hover states: Tooltip showing exact values

**Key Differences from Sidebar Version**:
- ✅ **More horizontal space**: Cards are 664px wide (vs 580px with sidebar)
- ✅ **Cleaner layout**: Top nav less cluttered than sidebar
- ✅ **Consistent with public site**: Same nav pattern throughout

---

## 2.2 Dashboard - Empty State (Desktop)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Programs  History  Import              [Avatar ▾]        │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Dashboard                                                                   │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐   │
│  │  👋 Welcome to EZLift, {Name}! Let's get you started            [×]  │   │
│  └──────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────────┐            │
│  │  🎯 Choose a Program       │  │  🔧 Create a Program       │            │
│  │  ────────────────────       │  │  ────────────────────       │            │
│  │  Browse programs based on  │  │  Build your own custom     │            │
│  │  your goals and experience │  │  training program          │            │
│  │                            │  │                            │            │
│  │  [View Programs →]         │  │  [Use Program Builder →]   │            │
│  └────────────────────────────┘  └────────────────────────────┘            │
│                                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────────┐            │
│  │  ⬆️ Import Your Data       │  │  📱 Download Mobile App    │            │
│  │  ────────────────────       │  │  ────────────────────       │            │
│  │  Bring your workout        │  │  Track workouts in the     │            │
│  │  history from Hevy/Strong  │  │  gym with EzLift mobile    │            │
│  │                            │  │                            │            │
│  │  [Import History →]        │  │  [Get the App →]           │            │
│  └────────────────────────────┘  └────────────────────────────┘            │
│                                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────────┐            │
│  │  Training Volume           │  │  Personal Records          │            │
│  │  ─────────────────────     │  │  ─────────────────────     │            │
│  │                            │  │                            │            │
│  │       🏋️                   │  │        🏆                  │            │
│  │                            │  │                            │            │
│  │  No workouts yet           │  │  Your personal records     │            │
│  │                            │  │  will show here            │            │
│  │  Track your first workout  │  │                            │            │
│  │  to see progress           │  │  Track workouts to set     │            │
│  │                            │  │  your baseline!            │            │
│  │  [Get Mobile App →]        │  └────────────────────────────┘            │
│  └────────────────────────────┘                                              │
│                                                                              │
│  ┌────────────────────────────┐  ┌────────────────────────────┐            │
│  │  Recent Workouts           │  │  Progress Tracking         │            │
│  │  ─────────────────────     │  │  ─────────────────────     │            │
│  │                            │  │                            │            │
│  │       📅                   │  │        📈                  │            │
│  │                            │  │                            │            │
│  │  No workouts yet           │  │  Your progress will        │            │
│  │                            │  │  appear here               │            │
│  │  Workouts are tracked on   │  │                            │            │
│  │  the mobile app            │  │  Track workouts to see     │            │
│  │                            │  │  your trends               │            │
│  │  [Get the App →]           │  │                            │            │
│  └────────────────────────────┘  └────────────────────────────┘            │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Top nav: Same 64px height as populated state
- Welcome banner: Full-width (1376px), light blue background (#eff6ff), 16px padding, dismissible (× button)
- Action cards (top row, 2×2): 664px × 100px each, white background, blue border on hover
- Card structure: Icon (left, 32px) + Text (2 lines) + Arrow/CTA (right)
- Empty state cards (bottom, 2×2): 664px × 340px each, same as populated state
- Empty state pattern:
  - Large icon (48px) centered
  - Message (16px, gray) centered
  - Sub-message (14px, light gray) centered
  - CTA link (blue) centered
- All empty states have clear next steps
- **Full-width layout**: Utilizes entire 1376px width (no sidebar loss)

---

## 2.3 Dashboard - Populated State (Mobile 375px × 812px)

```
┌──────────────────────────────┐
│  ☰ EzLift             {Av▾}  │ ← Top nav (hamburger + avatar)
├──────────────────────────────┤
│                              │
│ ┌──────────────────────────┐ │
│ │  Training Volume         │ │
│ │  ───────────────────     │ │
│ │  [This Week ▾]           │ │
│ │                          │ │
│ │    📊 Bar Chart          │ │
│ │    [4 weeks visible]     │ │
│ │    ▃ ▅ █ ▇               │ │
│ │    ║ ║ ║ ║               │ │
│ │  ───────────────────     │ │
│ │  This Week               │ │
│ │  • 45 sets               │ │
│ │  • 12,500 kg             │ │
│ │  • ↑ +15%                │ │
│ │                          │ │
│ │  [View Details →]        │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  Personal Records        │ │
│ │  ───────────────────     │ │
│ │  Last 30 days            │ │
│ │                          │ │
│ │  🔥 Bench Press          │ │
│ │     100 kg × 5           │ │
│ │     2 days ago           │ │
│ │                          │ │
│ │  💪 Squat                │ │
│ │     140 kg × 8           │ │
│ │     Yesterday            │ │
│ │                          │ │
│ │  🏋️ Deadlift             │ │
│ │     180 kg × 3           │ │
│ │     3 days ago           │ │
│ │                          │ │
│ │  [View All →]            │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  Recent Workouts         │ │
│ │  ───────────────────     │ │
│ │                          │ │
│ │  📅 Today, 9:30 AM       │ │
│ │  Push Day - Week 4       │ │
│ │  1h 15m • 8 exercises    │ │
│ │  💪 Chest, Shoulders     │ │
│ │  ───────────────────     │ │
│ │  📅 Yesterday            │ │
│ │  Pull Day - Week 4       │ │
│ │  1h 05m • 7 exercises    │ │
│ │  💪 Back, Biceps         │ │
│ │  ───────────────────     │ │
│ │  📅 Jan 6                │ │
│ │  Leg Day - Week 3        │ │
│ │  1h 30m • 6 exercises    │ │
│ │                          │ │
│ │  [View History →]        │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  Progress Tracking       │ │
│ │  ───────────────────     │ │
│ │  [Bench Press ▾]         │ │
│ │  [12 weeks ▾]            │ │
│ │                          │ │
│ │      📈 Line Chart        │ │
│ │         ╱                │ │
│ │       ╱                  │ │
│ │     ╱                    │ │
│ │   ╱                      │ │
│ │  ───────────────────     │ │
│ │  85 kg → 95 kg           │ │
│ │  +10 kg (+11.8%)         │ │
│ │                          │ │
│ │  [Analyze →]             │ │
│ └──────────────────────────┘ │
│                              │
│                              │
│ ┌──────────────────────────┐ │
│ │🏠  📋  💪  👤  ⚙️         │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Mobile Design Specs**:
- Top bar: 56px height, hamburger menu (left), avatar (right)
- Cards: Full-width (subtract 32px total padding), stacked vertically
- Card padding: 16px
- Vertical gap between cards: 16px
- Charts: Simplified, shows fewer data points
- Text sizes: Reduced by 2px from desktop
- Bottom nav: 64px height, 5 icons, centered labels below icons
- Sticky bottom nav: Always visible

---

## 2.4 Dashboard - Empty State (Mobile)

```
┌──────────────────────────────┐
│  ☰ EzLift             {Av▾}  │ ← Top nav bar
├──────────────────────────────┤
│                              │
│ ┌──────────────────────────┐ │
│ │ 👋 Welcome to EZLift!    │ │
│ │ Let's get you started[×] │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  🎯 Choose a Program     │ │
│ │  Browse programs based   │ │
│ │  on your goals           │ │
│ │                          │ │
│ │  [View Programs →]       │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  🔧 Create a Routine     │ │
│ │  Build your own custom   │ │
│ │  training program        │ │
│ │                          │ │
│ │  [Use Builder →]         │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  ⬆️ Import Your Data     │ │
│ │  Bring your history from │ │
│ │  Hevy or Strong          │ │
│ │                          │ │
│ │  [Import →]              │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  Training Volume         │ │
│ │  ───────────────────     │ │
│ │         🏋️               │ │
│ │                          │ │
│ │  No workouts yet         │ │
│ │                          │ │
│ │  Track your first        │ │
│ │  workout to see progress │ │
│ │                          │ │
│ │  [Get App →]             │ │
│ └──────────────────────────┘ │
│                              │
│ ┌──────────────────────────┐ │
│ │  Personal Records        │ │
│ │  ───────────────────     │ │
│ │         🏆               │ │
│ │                          │ │
│ │  Your PRs will show here │ │
│ │                          │ │
│ │  Track workouts to set   │ │
│ │  your baseline!          │ │
│ └──────────────────────────┘ │
│                              │
│ (Scroll for more cards...)   │
│                              │
│ ┌──────────────────────────┐ │
│ │🏠  📋  💪  👤  ⚙️         │ │
│ └──────────────────────────┘ │
└──────────────────────────────┘
```

**Mobile Empty State Specs**:
- Same stacking pattern as populated
- Action cards (top 3): 100px height to fit 3 lines of text
- Empty state cards: Taller (180px) to accommodate centered content
- All text sizes reduced for mobile readability
- CTAs remain prominent and touchable (44px minimum height)

---

# 3. PROGRAM SETUP SCREENS

---

## 3.1 Program Description with AI (Expanded from 1.7.1)

**See section 1.7.1 for full wireframe**

**Additional Screens in this Flow**:

### 3.1.1 AI Processing Screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [EZLift Logo]                                                               │
│                                                                              │
│                                                                              │
│                                                                              │
│                                                                              │
│                        Creating your program...                             │
│                                                                              │
│                           ⏳ (Animated spinner)                              │
│                                                                              │
│                      Analyzing your description                             │
│                      Identifying exercises                                  │
│                      Organizing workouts                                    │
│                                                                              │
│                                                                              │
│                      This usually takes 10-15 seconds                       │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

### 3.1.2 Program Preview & Edit Screen

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  [← Back]  [EZLift Logo]                       [Edit] [Save Program]        │
│                                                                              │
│                   Here's your program - Review & Edit                       │
│              We created this based on your description                      │
│                                                                              │
│  Program Name: [Push/Pull/Legs_______________]                [✎ Edit]     │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📋 Workout 1: Push Day                                    [Edit] [×]│   │
│  │  ────────────────────────────────────────────────────────────────   │   │
│  │                                                                      │   │
│  │  Exercises:                                                          │   │
│  │  1. Barbell Bench Press            4 sets × 8-10 reps        [✎]    │   │
│  │  2. Incline Dumbbell Press         3 sets × 10-12 reps       [✎]    │   │
│  │  3. Overhead Press                 3 sets × 8-12 reps        [✎]    │   │
│  │  4. Lateral Raises                 3 sets × 12-15 reps       [✎]    │   │
│  │  5. Tricep Pushdowns               3 sets × 12-15 reps       [✎]    │   │
│  │                                                                      │   │
│  │  [+ Add Exercise]                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📋 Workout 2: Pull Day                                    [Edit] [×]│   │
│  │  ────────────────────────────────────────────────────────────────   │   │
│  │                                                                      │   │
│  │  Exercises:                                                          │   │
│  │  1. Barbell Deadlift               4 sets × 5-8 reps         [✎]    │   │
│  │  2. Pull-ups                       3 sets × 8-12 reps        [✎]    │   │
│  │  3. Barbell Rows                   3 sets × 8-12 reps        [✎]    │   │
│  │  4. Face Pulls                     3 sets × 12-15 reps       [✎]    │   │
│  │  5. Barbell Curls                  3 sets × 10-12 reps       [✎]    │   │
│  │                                                                      │   │
│  │  [+ Add Exercise]                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  📋 Workout 3: Leg Day                                     [Edit] [×]│   │
│  │  ────────────────────────────────────────────────────────────────   │   │
│  │                                                                      │   │
│  │  Exercises:                                                          │   │
│  │  1. Barbell Squat                  4 sets × 6-10 reps        [✎]    │   │
│  │  2. Romanian Deadlift              3 sets × 8-12 reps        [✎]    │   │
│  │  3. Leg Press                      3 sets × 10-15 reps       [✎]    │   │
│  │  4. Leg Curls                      3 sets × 12-15 reps       [✎]    │   │
│  │  5. Calf Raises                    4 sets × 15-20 reps       [✎]    │   │
│  │                                                                      │   │
│  │  [+ Add Exercise]                                                    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
│              [Looks Good - Save & Continue →]   [Start Over]                │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Same layout as Routine Builder (section 1.8)
- All fields are editable (pencil icons)
- User can add/remove exercises
- User can add/remove entire workouts
- "Start Over" returns to description input
- "Save & Continue" → Dashboard with program activated

---

## 3.2 Routine Builder Interface

**See section 1.8 for full wireframe**

**No additional screens needed - covered in onboarding section**

---

## 3.3 Program Recommendations List

**See section 1.9 for full wireframe**

**Additional Detail View**:

### 3.3.1 Program Detail Expanded Card

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  💪 Push/Pull/Legs - Intermediate                          [Select Program]  │
│  ────────────────────────────────────────────────────────────────────────    │
│  📅 3 days/week  •  ⏱ 60-75 min per session  •  🎯 Muscle & Strength        │
│                                                                              │
│  ▾ Workout Details:                                         [Collapse ▲]    │
│  ────────────────────────────────────────────────────────────────────────    │
│                                                                              │
│  Day 1: Push (Chest, Shoulders, Triceps)                                    │
│  • Barbell Bench Press - 4 sets × 8-10 reps                                 │
│  • Incline Dumbbell Press - 3 sets × 10-12 reps                             │
│  • Overhead Press - 3 sets × 8-12 reps                                      │
│  • Lateral Raises - 3 sets × 12-15 reps                                     │
│  • Tricep Pushdowns - 3 sets × 12-15 reps                                   │
│                                                                              │
│  Day 2: Pull (Back, Biceps, Rear Delts)                                     │
│  • Deadlift - 4 sets × 5-8 reps                                             │
│  • Pull-ups - 3 sets × 8-12 reps                                            │
│  • Barbell Rows - 3 sets × 8-12 reps                                        │
│  • Face Pulls - 3 sets × 12-15 reps                                         │
│  • Barbell Curls - 3 sets × 10-12 reps                                      │
│                                                                              │
│  Day 3: Legs (Quads, Hamstrings, Glutes, Calves)                            │
│  • Barbell Squat - 4 sets × 6-10 reps                                       │
│  • Romanian Deadlift - 3 sets × 8-12 reps                                   │
│  • Leg Press - 3 sets × 10-15 reps                                          │
│  • Leg Curls - 3 sets × 12-15 reps                                          │
│  • Calf Raises - 4 sets × 15-20 reps                                        │
│                                                                              │
│  ────────────────────────────────────────────────────────────────────────    │
│  Recommended for:                                                            │
│  • Intermediate lifters (6 months - 2 years experience)                     │
│  • Building muscle mass and strength                                        │
│  • Training 3 days per week with rest days in between                       │
│                                                                              │
│  [Select This Program]                                       [Close]         │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

# 4. IMPORT FLOW

---

## 4.1 Import Landing / Selection (`/import` or modal)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Import Your Workout History                                           [×]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                        Bring your data from another app                     │
│                     Your stats and history will be populated                │
│                                                                              │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  📱 Import from Hevy                                    [Choose File]  │ │
│  │  ───────────────────────────────────────────────────────────────      │ │
│  │  1. Open Hevy app → Settings → Export Data                            │ │
│  │  2. Download CSV file to your device                                  │ │
│  │  3. Upload the CSV file below                                         │ │
│  │                                                                        │ │
│  │  [📎 Choose File]                           No file chosen            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  💪 Import from Strong                                  [Choose File]  │ │
│  │  ───────────────────────────────────────────────────────────────      │ │
│  │  1. Open Strong app → Settings → Export Data                          │ │
│  │  2. Download CSV file to your device                                  │ │
│  │  3. Upload the CSV file below                                         │ │
│  │                                                                        │ │
│  │  [📎 Choose File]                           No file chosen            │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│                                                                              │
│  💡 What gets imported:                                                     │
│  • All your past workouts                                                   │
│  • Exercise history and personal records                                    │
│  • Training volume and progress data                                        │
│                                                                              │
│  ℹ️ Note: This imports workout history only. You'll still need to          │
│     create or select a program for future tracking.                         │
│                                                                              │
│                                                                              │
│  [Cancel]                                            [Import Data →]        │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Modal: 700px wide, centered, white background
- Close button (×): Top-right, gray, clickable
- Import cards: Full-width within modal, white, gray border
- Collapse/expand: Click card header to toggle instructions
- File input: Native file picker, accepts .csv only
- Import button: Disabled until file selected, enabled (blue) after file chosen
- Informational sections: Light blue background, rounded

---

## 4.2 Import Upload & Processing

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Import Your Workout History                                           [×]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                                                                              │
│                         Processing your workout history...                  │
│                                                                              │
│                           ⏳ (Animated progress bar)                         │
│                         ▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░  45%                          │
│                                                                              │
│                                                                              │
│  ✓ File validated (hevy-export-2025.csv)                                   │
│  ✓ Parsing workouts... 127 workouts found                                  │
│  ⏳ Identifying exercises...                                                │
│  ⏳ Calculating personal records...                                         │
│  ⏳ Building stats...                                                       │
│                                                                              │
│                                                                              │
│                    This may take a minute for large files                   │
│                                                                              │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Progress bar: 400px wide, centered, blue fill
- Percentage: Below bar, 18px, gray
- Status list: Left-aligned, 16px
  - ✓ (green checkmark) = completed
  - ⏳ (spinner) = in progress
  - Empty = pending
- Cannot close modal during processing

---

## 4.3 Import Success Summary

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Import Complete! 🎉                                                   [×]  │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│                      Your workout history has been imported                 │
│                                                                              │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  📊 Import Summary                                                     │ │
│  │  ───────────────────────────────────────────────────────────────      │ │
│  │                                                                        │ │
│  │  ✓ 127 workouts imported                                              │ │
│  │  ✓ 23 unique exercises identified                                     │ │
│  │  ✓ 2,341 total sets logged                                            │ │
│  │  ✓ 18 personal records found                                          │ │
│  │                                                                        │ │
│  │  Date range: Jan 2023 - Dec 2024 (24 months)                          │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐ │
│  │  📋 Create Programs from Your History? (Optional)                     │ │
│  │  ───────────────────────────────────────────────────────────────      │ │
│  │                                                                        │ │
│  │  We detected patterns in your workout history. Would you like us to   │ │
│  │  create programs based on your past routines?                         │ │
│  │                                                                        │ │
│  │  ○ Yes, suggest programs based on my history                          │ │
│  │  ○ No, I'll create my own programs                                    │ │
│  └───────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
│                                                                              │
│  Your stats are ready to view on your dashboard! 📈                         │
│                                                                              │
│                                                                              │
│  [Skip This Step]                                  [Continue →]             │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

**Design Specs**:
- Success icon (🎉): 48px, top center
- Summary card: Light green background (#f0fdf4), green border
- Stats: Checkmarks + numbers, 18px
- Optional question card: White background, blue border
- Radio buttons: Standard, blue when selected
- Continue button: Blue, proceeds based on selection
- Skip button: Gray text, goes directly to dashboard

**After clicking Continue**:
- If "Yes" selected → Show program suggestions based on history
- If "No" selected → Go to dashboard with populated history cards
- If "Skip" → Go directly to dashboard

---

# 5. NAVIGATION & LAYOUT

---

## 5.1 Top Horizontal Navigation (Desktop)

### Navigation Bar Layout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ [Logo]  Dashboard  Programs  History  Import              [Avatar ▾]        │
└──────────────────────────────────────────────────────────────────────────────┘
    ↑       ↑         ↑         ↑        ↑                    ↑
   Logo    Active   Nav Item  Nav Item Nav Item        User Avatar + Dropdown
```

**Navigation Items** (Left to Right):
1. **Logo** (Left edge, clickable → Dashboard)
2. **Dashboard** (Active page highlighted)
3. **Programs** (View/create programs)
4. **History** (Workout session list)
5. **Import** (CSV import flow)
6. **Avatar Dropdown** (Right edge)

**Desktop Top Nav Specs**:
- Height: 64px, full-width
- Background: White (#ffffff)
- Border-bottom: 1px solid gray (#e5e7eb)
- Sticky: Fixed to top on scroll
- Logo: Left, 40px height, 16px padding, clickable
- Nav items: Horizontal, centered in remaining space
  - Text: 16px, medium weight
  - Padding: 16px horizontal, 20px vertical
  - Hover: Light gray background (#f9fafb), transition 150ms
  - Active: Underline (2px blue #2563eb) or light blue background (#eff6ff)
  - Spacing: 24px between items
- User avatar: Right, 32px circle, 16px margin-right
  - Click opens dropdown menu
  - Hover: Subtle shadow

**Avatar Dropdown Menu**:

```
┌─────────────────────┐
│ ○ {User Name}       │
│ user@email.com      │
├─────────────────────┤
│ 👤 Profile          │
│ ⚙️  Settings        │
├─────────────────────┤
│ 🔒 Logout           │
└─────────────────────┘
```

**Dropdown Specs**:
- Width: 220px
- Position: Absolute, right-aligned under avatar
- Background: White, rounded 8px
- Shadow: 0 4px 12px rgba(0,0,0,0.15)
- Items: 48px height, hover light gray
- Dividers: 1px gray between sections

**Responsive Behavior** (Desktop):
- < 1024px: Nav items compress slightly (reduce spacing)
- < 768px: Switch to mobile hamburger menu (see Section 5.2)

**Consistent with Public Site**:
- ✅ Same top nav pattern as ezlift.app
- ✅ Same logo placement
- ✅ Same visual style (just different links)

---

## 5.2 Mobile Navigation

### Mobile Top Bar

```
┌──────────────────────────────┐
│  ☰ EzLift             {Av▾}  │ ← Top navigation bar (56px height)
└──────────────────────────────┘
```

**Mobile Top Bar Specs**:
- Height: 56px
- Background: White (#ffffff)
- Border-bottom: 1px solid gray (#e5e7eb)
- Shadow: Subtle shadow below (0 1px 3px rgba(0,0,0,0.1))
- Sticky: Fixed to top on scroll

**Elements**:
- **Hamburger icon** (left): 24px, tappable area 44px × 44px, opens drawer
- **Logo/Brand** (center-left): "EzLift" text, 18px bold
- **Avatar** (right): 24px circle, opens user dropdown, 16px margin-right

---

### Hamburger Menu Drawer (Mobile)

**Triggered by tapping hamburger icon (☰)**

```
┌──────────────────────────────┐
│  [EzLift Logo]          [×]  │ ← Header (64px)
│                              │
│  ○ {User Name}               │ ← User section
│  user@email.com              │
│  ────────────────────────    │
│                              │
│  🏠  Dashboard               │ ← Nav items
│  📋  Programs                │
│  📖  History                 │
│  ⬆️  Import                  │
│  ────────────────────────    │
│  👤  Profile                 │
│  ⚙️  Settings                │
│  ────────────────────────    │
│  🔒  Logout                  │
│                              │
└──────────────────────────────┘
```

**Drawer Specs**:
- Slides in from left, 280px width
- Overlay: Dark semi-transparent background (rgba(0,0,0,0.5))
- Animation: 300ms ease-out slide
- Close methods:
  - Tap × button (top-right)
  - Tap overlay (outside drawer)
  - Tap any nav item (navigates and closes)
  - Swipe left gesture

**Drawer Content**:
- Logo: Top, 40px height, 16px padding
- User section: Avatar (40px) + name + email, 64px height
- Nav items: Same 5 as desktop (Dashboard, Programs, History, Import)
- Settings section: Profile, Settings (below divider)
- Logout: Bottom, separated by divider
- Tappable items: 56px height, full-width, hover gray background

**Consistent with Public Site Mobile Nav**:
- ✅ Same hamburger icon pattern
- ✅ Same drawer slide-in animation
- ✅ Same close behaviors

---

## WIREFRAME DOCUMENT END

---

## Next Steps

These wireframes are now ready for review and refinement. Please review:

1. **Onboarding flow** - Are the 5 steps clear and well-structured?
2. **Dashboard layouts** - Do the populated and empty states make sense?
3. **Program setup** - Are the 3 paths (describe, build, select) intuitive?
4. **Import flow** - Is the process clear and user-friendly?
5. **Navigation** - Is the left sidebar + mobile nav pattern appropriate?

**Priority feedback areas**:
- Which screens need the most refinement?
- Are there any missing screens or states?
- Do the layouts support the user flows effectively?
- Should we create higher-fidelity wireframes for specific screens?

---

## Document Changelog

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-08 | 1.0 | Initial wireframes created for all key screens (onboarding, dashboard, program setup, import) | Sally (UX Expert) |
| 2025-01-08 | 1.1 | **CORRECTED ONBOARDING FLOW**: Added 2 missing screens (Training Duration, Equipment Available). Updated from 5-step to 9-step onboarding based on mobile app screenshots. Progress indicators updated throughout. Added orange color (#FF6B2C) for Skip/Next buttons to match mobile app. | Sally (UX Expert) |
| 2025-01-08 | 1.2 | **PROGRAM BUILDER REDESIGN INTEGRATED**: Replaced old mobile-clone routine builder (sections 1.10) with completely redesigned Program Builder. New design: (1) Auto-starts with Workout 1, (2) 4-column visual exercise grid reusing Exercise Library cards, (3) Real-time metrics side panel, (4) Flow-based W1→W2→W3→Overview, (5) Exercise detail modals, (6) Smart suggestions between workouts. Desktop-optimized with search/filter/drag-drop. Terminology updated: Routine→Program throughout. | Sally (UX Expert) |
| 2025-01-08 | 1.3 | **ONBOARDING FLOW SIMPLIFICATION**: Removed intermediate choice screen (old 1.9). Now "Yes, I have a program" → Auto-loads Describe Program screen with text/voice input as PRIMARY action. Secondary option: "Use Program Builder instead" link (not a big choice). Applies same UX philosophy: One clear primary action per screen, smart defaults, secondary options available but not prominent. Updated flows in both wireframes.md and web-app-user-flows.md. | Sally (UX Expert) |
| 2025-01-10 | 2.0 | **CRITICAL MVP CONSTRAINT INTEGRATION**: Integrated user data state branching based on architecture decisions (fullstack-web-app.md). NEW WIREFRAME: Section 1.10.1: Program Builder Blocked State (positive read-only message for existing users). ACCESS CONTROL NOTES: Added to ALL onboarding steps and Program Builder (marked "NEW USERS ONLY"). Existing users skip ALL onboarding (go direct to dashboard after login). Updated table of contents. Messaging tone: Positive, educational, emphasizes what users CAN do. Synchronized with architecture and PRD v0.2. | Sally (UX Expert) |
| 2025-01-10 | 2.1 | **ONBOARDING SIMPLIFICATION**: Removed Section 1.7.1 (Existing User Transition screen). Existing users now skip ALL onboarding steps (not just 7-9), go directly to dashboard after login. Rationale: They already onboarded on mobile app, repeating questions creates friction. Branching point moved from "after Step 6" to "after login/signup". Simpler architecture, better UX. Updated user-flows.md and ux-design-brief.md to match. | Sally (UX Expert) |
| 2025-01-10 | 2.2 | **🔴 NAVIGATION PATTERN UPDATED - BLOCKER RESOLVED**: Changed ALL wireframes from left sidebar to top horizontal navigation. UPDATED: Section 2.1 (Dashboard Populated), Section 2.2 (Dashboard Empty), Section 2.3-2.4 (Mobile dashboards), Program Builder screens (added top nav, kept metrics side panel), Section 5.1 (Top Nav specs), Section 5.2 (Mobile nav). DECISION: Top nav for consistency with public site, more screen space (664px cards vs 580px), faster implementation, mobile-friendly. Navigation decision documented in ux-design-brief.md. Unblocks Story 1.1 development. | Sally (UX Expert) |

---

**Document Status**: ✅ v2.2 Complete - Navigation Decision Final  
**Last Updated**: 2025-01-10  
**Designer**: Sally (UX Expert)

**Highlights**:
- 🔴 **User data state branching** - NEW vs EXISTING users have different flows
- ⭐ **Top horizontal navigation** - Decision final, unblocks Story 1.1
- ⭐ Program Builder completely redesigned (v2.0) - desktop-first, visual cards, flow-based
- ⚠️ **Access control** - Steps 7-9 and Program Builder: NEW USERS ONLY
- ✅ Existing user wireframes - Blocked state with positive messaging
- ✅ 9-step onboarding (new users) / No onboarding (existing users → direct to dashboard)
- ✅ Dashboard layouts (populated + empty states) with top nav
- ✅ Import flow (history/stats only, all users)
- ✅ All navigation patterns updated (top nav desktop, hamburger mobile)

**MVP Constraint**: Existing users cannot edit programs on web (read-only view). Phase 2 removes this constraint.

**Critical Decision**: **Top horizontal navigation** (not sidebar) - Consistent with public site, more screen space, faster MVP.

**Note**: Program Builder reuses Exercise Library components for consistency and faster development.

