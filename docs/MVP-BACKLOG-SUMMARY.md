# EzLift Web App MVP - Complete Backlog Summary

**Created**: 2025-01-12  
**Created By**: Bob (Scrum Master)  
**Epic**: Epic 1 - Secure Web App MVP  
**Total Stories**: 15 (including Stories 1.0 Design System + 1.0.1 Auth Pages)  
**Estimated Duration**: 11 weeks (per architecture roadmap)

---

## 📋 Complete Story List

### Phase 0: Design System (Week 1, First 2-3 Days) - Stories 1.0, 1.0.1 🎨
**Story 1.0**: Design System Foundation (🔴 MUST COMPLETE FIRST)
- Configure Tailwind with brand colors (#FF6B00 orange, #0B87D9 blue)
- Configure typography scale and component styles
- Theme shadcn/ui components
- Create design system documentation

**Story 1.0.1**: Update Login/Signup Pages with Design System
- Apply brand colors to existing auth pages
- Update form inputs, buttons, and layout to match mobile app
- Ensure Hevy-like clean aesthetic
- Visual QA against mobile app screenshots

**Dependencies**: Story 1.0.1 depends on Story 1.0 (design system must be configured first)

**⚠️ CRITICAL**: Complete Story 1.0, then 1.0.1, BEFORE any other work!

---

### Phase 1A: Foundation (Weeks 1-2) - Stories 1.1-1.3
**Story 1.1**: Foundation - Auth Layout & Navigation  
**Story 1.2**: User Data State Detection (🔴 CRITICAL MVP CONSTRAINT)  
**Story 1.3**: Dashboard Shell & Date Range Filter

**Dependencies**: Story 1.0 (Design System) must be completed first

---

### Phase 1B: Dashboard Cards (Weeks 3-4) - Stories 1.4-1.8
**Story 1.4**: Training Volume Card (Client-Side Aggregation)  
**Story 1.5**: Personal Records Card  
**Story 1.6**: Recent Workouts Card  
**Story 1.7**: Progress Over Time Card  
**Story 1.8**: Active Program Card

**Dependencies**: Requires Stories 1.1-1.3 complete

---

### Phase 1C: History & Profile (Week 5) - Stories 1.9, 1.12
**Story 1.9**: Workout History Page  
**Story 1.12**: Profile Management

**Dependencies**: Requires foundation stories (1.1-1.3)

---

### Phase 1D: Import Flow (Week 6) - Story 1.10
**Story 1.10**: CSV Import Flow

**Dependencies**: Requires Stories 1.1-1.3, benefits from 1.9 (history page)

---

### Phase 1E: Program Builder (Weeks 7-8) - Story 1.11
**Story 1.11**: Program Builder (🔴 NEW USERS ONLY)

**Dependencies**: Requires Story 1.2 (user state detection) CRITICAL

---

### Phase 1F: Onboarding (Weeks 9-10) - Story 1.13
**Story 1.13**: Onboarding Flow with User State Branching

**Dependencies**: Requires Story 1.2 (user state detection) and Story 1.11 (program builder)

---

## 🎯 Story Quality Standards Applied

### 🎨 **CRITICAL: Design System Foundation (Story 1.0)**

**Story 1.0 must be completed FIRST** before any other development work!

**What Story 1.0 Provides**:
- Tailwind CSS configured with brand colors from mobile app
  - Brand Orange (#FF6B00) for primary actions
  - Selection Blue (#0B87D9) for selected states
  - Complete color palette matching mobile app
- Typography scale and font configuration
- shadcn/ui components themed with brand colors
- Component style specifications (buttons, cards, inputs)
- Spacing/sizing system from mobile app patterns
- Design system documentation for reference

**Why This Matters**:
Without Story 1.0, developers will use default Tailwind colors (blue-500, gray-200, etc.) instead of your brand colors. The app won't look like EzLift - it will look generic.

**Example**:
- ❌ Without Story 1.0: `<Button className="bg-blue-500">Next</Button>` (default blue)
- ✅ With Story 1.0: `<Button variant="primary">Next</Button>` (brand orange #FF6B00)

**All other stories reference Story 1.0** in their Dev Notes with specific design guidance.

---

Every story includes:

### ✅ Complete Documentation References
- 🔧 **Developer Setup**: Links to `docs/DEVELOPER_SETUP.md` with prerequisites
- 📐 **User Flows**: References to `docs/web-app-user-flows.md` with specific sections
- 🎨 **Wireframes**: Actual ASCII wireframes from `docs/wireframes.md` embedded in each story
- 🏗️ **Architecture**: References to sharded architecture docs in `docs/architecture/web-app/`

### ✅ Comprehensive Technical Context
- Data models and API specifications
- Component architecture and reuse strategies
- State management patterns
- Performance optimization requirements
- Security and authentication details

### ✅ Clear Acceptance Criteria
- Numbered, testable criteria from epic
- Integration verification points (IV1, IV2, etc.)
- Success criteria clearly defined

### ✅ Detailed Tasks & Subtasks
- Sequential, actionable tasks
- Mapped to specific AC numbers
- Includes testing as explicit subtasks
- Clear implementation guidance

### ✅ Testing Requirements
- Unit test scenarios and coverage targets (>80-90%)
- Integration test requirements
- Performance test scenarios
- Test file locations specified

### ✅ Design Specifications
- Visual wireframes with exact measurements
- Color codes and typography specs
- Responsive behavior defined
- Empty states and error states

---

## 🔴 Critical MVP Constraints

### User Data State Detection (Story 1.2)
**Constraint**: User state determines feature access

| Feature | New User | Existing User |
|---------|----------|---------------|
| **Onboarding** | All 9 steps | None (skip entirely) |
| **Program Builder** | ✅ Full access | ❌ View only |
| **Dashboard** | Empty states | Populated with mobile data |
| **History** | Empty or imported | Mobile workout data |
| **CSV Import** | ✅ Available | ✅ Available |
| **Profile** | ✅ Full edit | ✅ Full edit |

**Why**: Prevents sync conflicts with WatermelonDB (mobile app)  
**Removed in**: Phase 2 (WatermelonDB on web enables full editing)

---

## 📊 Story Dependencies & Order

### Critical Path (Must Follow Order):
1. **Story 1.0** → Design System Foundation (🔴 MUST BE FIRST - Required for ALL stories)
2. **Story 1.0.1** → Update Login/Signup Pages (🔴 SECOND - Apply design system to entry pages)
3. **Story 1.1** → Auth layout (required for all pages)
4. **Story 1.2** → User state detection (gates 1.11 and 1.13)
4. **Story 1.3** → Dashboard shell (required for 1.4-1.8)
5. **Stories 1.4-1.8** → Dashboard cards (can be parallel after 1.0 and 1.3)
6. **Story 1.11** → Program builder (requires 1.0, 1.2)
7. **Story 1.13** → Onboarding (requires 1.0, 1.2, and 1.11)

### Can Be Developed in Parallel:
- Stories 1.4-1.8 (dashboard cards) - Independent from each other
- Stories 1.9 and 1.12 (history and profile) - Independent
- Story 1.10 (import) - Independent after foundation

### Recommended Development Order:
```
Week 1 (Days 1-2): 1.0 (Design System) 🎨 MUST BE FIRST
Week 1 (Day 3): 1.0.1 (Update Login/Signup) 🎨 Apply design system
Week 1-2: 1.1 → 1.2 → 1.3 (Foundation)
Week 3: 1.4, 1.5 (Dashboard cards 1-2)
Week 4: 1.6, 1.7, 1.8 (Dashboard cards 3-5)
Week 5: 1.9, 1.12 (History & Profile)
Week 6: 1.10 (Import Flow)
Week 7-8: 1.11 (Program Builder)
Week 9-10: 1.13 (Onboarding)
Week 11: Integration testing, bug fixes, polish
```

---

## 🧪 Testing Requirements Summary

### Unit Test Coverage Targets
- **Critical business logic**: >90% (aggregations, calculations, state management)
- **Components**: >85% (UI components)
- **Utilities**: >90% (parsers, converters)

### Integration Test Requirements
- All user flows end-to-end
- All dashboard cards with data and empty states
- Complete import flow
- Complete onboarding flow
- User state branching

### Performance Testing
- Dashboard aggregation: < 100ms (typical), < 200ms (power user)
- CSV parsing: < 1 second (100 workouts)
- Page load: < 300ms
- Chart rendering: < 200ms

### E2E Tests (Recommended)
- New user journey: Signup → Onboarding → Dashboard
- Existing user journey: Login → Dashboard (no onboarding)
- Import flow: Upload CSV → Review → Import → Dashboard refresh
- Program creation: Builder → Create program → Dashboard shows program

---

## 📦 New Dependencies Required

Install these packages as stories are implemented:

```bash
# Story 1.1: State management
npm install @tanstack/react-query

# Story 1.10: CSV import
npm install papaparse minisearch
npm install -D @types/papaparse

# Story 1.11: Drag-and-drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# Already installed (verify in package.json):
# - recharts (charts for Stories 1.4, 1.7)
# - date-fns (date handling)
# - @amplitude/analytics-browser (analytics)
```

---

## 📈 Analytics Events Coverage

**Total Unique Events**: 50+ events across all stories

### By Story:
- **Story 1.1**: Navigation interactions
- **Story 1.2**: User data state detection
- **Story 1.3**: Dashboard viewed, filter changed
- **Stories 1.4-1.8**: Dashboard card events (viewed, clicked, interactions)
- **Story 1.9**: History viewed, filtered, paginated, workout clicked
- **Story 1.10**: Complete import funnel (7 events)
- **Story 1.11**: Program builder funnel (6 events)
- **Story 1.12**: Profile viewed, updated
- **Story 1.13**: Complete onboarding funnel (9+ events)

**Amplitude Project**: ezlift-website (ID: 100016347)

---

## 🎨 Design System Applied

### Color Palette (Consistent across all stories):
- **Primary Actions**: Orange (#FF6B2C) - From mobile app
- **Selection States**: Blue (#2563eb) or light blue (#eff6ff)
- **Success**: Green (#10b981)
- **Error**: Red (#ef4444)
- **Text**: Dark gray (#1f2937), Medium gray (#6b7280), Light gray (#9ca3af)
- **Borders**: Light gray (#e5e7eb)

### Typography:
- **Headings**: 32px (page), 24px (section), 20px (card), 18px (subsection)
- **Body**: 16px (primary), 14px (secondary), 12px (meta)
- **Font**: Inter (from Tailwind)

### Spacing:
- **Card padding**: 24px
- **Section gaps**: 24px
- **Item gaps**: 12px
- **Component gaps**: 8px

### Components (shadcn/ui):
All stories use consistent UI primitives from existing component library

---

## 🚀 Ready for Development

### Story Files Location
All stories created in: `docs/stories/`

**Files Created** (15 stories total):
- `1.0.design-system-foundation.md` 🎨 **COMPLETE FIRST!**
- `1.0.1.update-auth-pages-design.md` 🎨 **COMPLETE SECOND!**
- `1.1.foundation-auth-layout-navigation.md`
- `1.2.user-data-state-detection.md`
- `1.3.dashboard-shell-date-range-filter.md`
- `1.4.training-volume-card.md`
- `1.5.personal-records-card.md`
- `1.6.recent-workouts-card.md`
- `1.7.progress-over-time-card.md`
- `1.8.active-program-card.md`
- `1.9.workout-history-page.md`
- `1.10.csv-import-flow.md`
- `1.11.program-builder.md`
- `1.12.profile-management.md`
- `1.13.onboarding-flow.md`

### Next Steps for Development Team

1. **Review Story 1.1** - Ensure developer setup complete
2. **Start with Foundation** - Stories 1.1 → 1.2 → 1.3 (in order)
3. **Dashboard Cards** - Stories 1.4-1.8 (can parallelize after 1.3)
4. **Remaining Features** - Follow recommended order
5. **Testing** - Continuous testing as each story completes
6. **Integration** - Week 11 for final integration and polish

### Developer Assignment Recommendations
- **Foundation Team** (2 developers): Stories 1.1-1.3 (critical path)
- **Dashboard Team** (2-3 developers): Stories 1.4-1.8 (can work in parallel)
- **Features Team** (2 developers): Stories 1.9, 1.10, 1.12
- **Complex Features Team** (Senior developer): Stories 1.11, 1.13

---

## ✅ Backlog Completeness Checklist

- [x] All 13 stories from Epic 1 created
- [x] Each story has developer setup references
- [x] Each story has user flow references
- [x] Each story has wireframes (ASCII diagrams)
- [x] Each story has architecture context
- [x] Each story has detailed tasks/subtasks
- [x] Each story has testing requirements
- [x] Each story has analytics events
- [x] Each story has performance targets
- [x] All stories follow consistent format
- [x] Critical MVP constraints documented
- [x] Dependencies identified
- [x] Recommended development order provided

---

## 📝 Notes for Product Owner / Scrum Master

### Story Validation
All stories are currently in **Draft** status. Recommended next steps:

1. **PO Review**: Have Product Owner review each story for accuracy
2. **Architecture Validation**: Confirm technical approach with Architect
3. **Estimation**: Development team to estimate effort for each story
4. **Sprint Planning**: Assign stories to sprints based on dependencies
5. **Status Update**: Change status from "Draft" to "Approved" after validation

### Story Refinement Sessions
Consider refinement sessions for:
- **Story 1.11** (Program Builder) - Most complex, may benefit from breakdown
- **Story 1.13** (Onboarding Flow) - 9 steps, complex branching
- **Story 1.10** (CSV Import) - Multi-step flow, error handling complexity

---

## 🎯 Success Metrics (From PRD)

### Phase 1 Completion Criteria:
- All 13 stories completed and deployed
- >90% test coverage for critical business logic
- Performance targets met (dashboard < 300ms, aggregations < 200ms)
- Analytics instrumented (50+ events)
- Zero critical bugs
- Mobile responsive (all breakpoints)

### User Acceptance:
- New users can complete onboarding and create programs
- Existing users can view dashboard with mobile data
- Import flow works for Hevy CSV (>90% exercise matching)
- All features work on desktop and mobile web

---

**Status**: ✅ Complete MVP Backlog - Ready for Development

**Next Action**: Assign Story 1.1 to development team and begin Sprint 1

