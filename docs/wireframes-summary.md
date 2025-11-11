# Wireframes Update Summary

**Date**: 2025-01-08  
**UX Designer**: Sally (UX Expert)  
**Status**: Ready for Review

---

## Changes Made Based on Feedback

### 1. ✅ Onboarding Flow Corrected (5 Steps → 9 Steps)

**Added 2 Missing Screens**:
- **Step 3: Training Duration** ✨ NEW
  - Options: 30min or less, 30-45, 45-60, 60+ minutes
  - Purpose: Helps recommend programs that fit user's time availability
  
- **Step 6: Equipment Available** ✨ NEW
  - Multi-select: Free Weights, Machines, Resistance Bands, Bodyweight, Cardio, Other
  - Purpose: Filters program recommendations to match available equipment

**Updated Sequence** (Now 9 Steps Total):
1. Personal Info (Gender, Age)
2. Training Frequency (1-2, 3-4, 5-6, 7+ days/week)
3. **Training Duration** ✨ NEW
4. Experience Level (Beginner, Intermediate, Advanced, Expert)
5. Goals (Multi-select: Muscle, Strength, Weight Loss, etc.)
6. **Equipment Available** ✨ NEW
7. Program Setup (Do you have a program? Yes/No/Skip)
8-9. Program Configuration (varies by path chosen)

**All progress indicators updated** from "X of 5" to "X of 9"

---

### 2. ✅ Program Builder Completely Redesigned

**Based on Exercise Library Components + Desktop-First Thinking**

**OLD Design** (Mobile-clone):
- ❌ Empty state asking for program name
- ❌ List-based exercise selection (dropdowns)
- ❌ No visual recognition of exercises
- ❌ Sequential: Create program → Add workout → Name workout → Add exercises
- ❌ No real-time feedback on what you're building

**NEW Design** (Desktop-optimized, Flow-based):
- ✅ **Auto-start with Workout 1** - No empty state, immediately building
- ✅ **Default names** - "Workout 1", "Workout 2", etc. (rename optional)
- ✅ **Visual exercise cards** - Reuses Exercise Library 3-column grid (4-column in builder)
- ✅ **Large images** - Recognize exercises visually
- ✅ **Search & filter** - Reuses existing Exercise Library components
- ✅ **Click image** → Opens exercise detail page (modal)
- ✅ **Click "+ Add"** → Adds to current workout
- ✅ **Real-time metrics panel** - Shows:
  - Muscles covered (dynamically updates)
  - Estimated duration (based on sets + rest)
  - Exercise variety (Push/Pull, Upper/Lower, Compound/Isolation)
- ✅ **Flow-based** - Workout 1 → Workout 2 → Workout 3 → Overview → Done
- ✅ **Smart suggestions** - "Based on Workout 1 (Push), here are Pull exercises"

**See**: `docs/program-builder-redesign.md` for complete wireframes

---

### 3. ✅ Terminology Changes

**Throughout all documents**:
- ❌ "Routine" → ✅ "Program"
- ❌ "Routine Builder" → ✅ "Program Builder"

Updated in:
- `docs/wireframes.md`
- `docs/web-app-user-flows.md`
- `docs/program-builder-redesign.md`

---

### 4. ✅ Import Flow Clarified

**Clarification**: Import is for **workout history and stats only**, NOT for creating programs.

**Import Purpose**:
- ✅ Populate workout history
- ✅ Fill in personal records (PRs)
- ✅ Show training volume charts
- ✅ Display progress tracking data

**Import Does NOT**:
- ❌ Create programs for future tracking
- ❌ Set up workout routines

**Optional Question After Import**:
- "Create programs from your history?" (Yes/No)
- If Yes → AI analyzes patterns and suggests programs
- If No → Just import the historical data

---

## Updated Document Structure

### Primary Documents:

1. **`docs/ux-design-brief.md`** (v1.6)
   - Master design brief with all context, research, decisions
   - Updated to reflect 9-step onboarding

2. **`docs/web-app-user-flows.md`** (v1.1)
   - Complete user flows for new and existing users
   - Updated with 9-step onboarding sequence
   - Clarified import flow purpose

3. **`docs/wireframes.md`** (v1.3) ⭐ UPDATED
   - Comprehensive wireframes for all screens
   - Updated onboarding (9 steps with Training Duration + Equipment)
   - **⭐ Simplified onboarding flow**: Removed choice screen, "Yes" → directly to Describe Program
   - Dashboard layouts (populated + empty)
   - Import flow (with history-only clarification)
   - Navigation patterns (desktop + mobile)
   - **⭐ Program Builder REDESIGNED and INTEGRATED** (section 1.10):
     - Auto-starts with Workout 1 (no empty state)
     - 4-column visual exercise grid (reuses Exercise Library cards)
     - Real-time metrics side panel
     - Flow-based: W1 → W2 → W3 → Overview → Done
     - Exercise detail modals
     - Smart suggestions between workouts
     - Desktop-optimized with search/filter/drag-drop
     - Accessed via secondary link from Describe Program OR direct from dashboard

4. ~~`docs/program-builder-redesign.md`~~ ✅ INTEGRATED INTO WIREFRAMES.MD
   - This standalone document has been integrated into section 1.10 of wireframes.md
   - Can be archived or deleted

---

## Screen Count Summary

| Category | Screens | Status |
|----------|---------|--------|
| **Onboarding** | 11 | ✅ Complete (9 main steps + program setup variations) |
| **Dashboard** | 4 | ✅ Complete (populated + empty, desktop + mobile) |
| **Program Builder** | 6 | ✅ Redesigned (see program-builder-redesign.md) |
| **Import Flow** | 3 | ✅ Complete (selection, processing, success) |
| **Navigation** | 4 | ✅ Complete (sidebar, mobile nav, slide-out) |
| **TOTAL** | **28+** | ✅ Ready for Review |

---

## Priority Review Order

### Highest Priority (MVP Critical):

1. **Program Builder Redesign** ⭐⭐⭐
   - Completely new design, needs validation
   - Desktop-first approach
   - Reuses Exercise Library components
   - Flow-based experience (Workout 1 → 2 → 3 → Done)

2. **Dashboard Populated State** ⭐⭐⭐
   - This is the hero screen for existing users
   - 5 P0 cards with analytics
   - Needs to show immediate value

3. **Dashboard Empty State** ⭐⭐
   - First experience for new users
   - Clear CTAs (Program, Import, etc.)
   - Can't feel overwhelming

### Medium Priority:

4. **Onboarding Steps 1-7** ⭐⭐
   - Flow is standard, low risk
   - Visual pattern matches mobile app
   - Need to confirm Steps 8-9 details

5. **Import Flow** ⭐
   - Standard upload/process/success pattern
   - Clear messaging needed ("history only")

---

## Open Questions

### Program Builder:
1. Should exercise detail open in **modal** or **new tab**?
   - Modal = stays in context, faster
   - New tab = can keep exercise list open for reference
   
2. Should we show **muscle map visualization** in metrics panel?
   - Could add body diagram showing trained muscles
   - Helpful or too complex for MVP?

3. **Drag-and-drop for exercises** - Desktop only or mobile too?
   - Desktop: Standard drag handle pattern
   - Mobile: Long-press to drag, or just use menu "Move up/down"?

4. **Auto-save** or manual "Save Draft"?
   - Auto-save: Less friction, saves after each exercise added
   - Manual: More control, but risk of losing work

### Onboarding Steps 8-9:
5. What happens in the final 2 steps of onboarding?
   - Need mobile app screenshots or description
   - Could be program confirmation, welcome screen, or additional preferences

---

## Next Steps

1. **Review Program Builder redesign** - Validate flow and components
2. **Confirm onboarding Steps 8-9** - Get details or screenshots
3. **Prioritize refinements** - Which screens need higher fidelity?
4. **Define component library** - Extract reusable components from wireframes

---

**All wireframes ready for review!** 🎨  
**Key innovation**: Program Builder reuses Exercise Library = faster development + consistent UX

