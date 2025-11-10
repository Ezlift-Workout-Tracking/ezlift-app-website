# EzLift Web App Documentation

**Status**: ✅ Production-Ready - Aligned and Ready for Story Creation  
**Last Updated**: 2025-01-10  
**Version**: MVP Phase 1 Specifications

---

## 📋 Quick Navigation

### For Product Owner & Scrum Master (Story Creation):

**Start Here**:
1. 📘 [`prd/index.md`](./prd/index.md) - **Sharded PRD** (15 sections, v0.2)
2. 🏗️ [`architecture/fullstack-web-app.md`](./architecture/fullstack-web-app.md) - **Web App Architecture**
3. 🎨 [`ux-design-brief.md`](./ux-design-brief.md) - **Design System & Patterns**

**Reference Docs**:
4. 📊 [`web-app-user-flows.md`](./web-app-user-flows.md) - Complete user flows
5. 🖼️ [`wireframes.md`](./wireframes.md) - 30+ screen wireframes
6. 🏛️ [`architecture/brownfield-public-website.md`](./architecture/brownfield-public-website.md) - Existing system

---

## 📚 Document Inventory

### Product Requirements (Primary Reference)

#### **Sharded PRD** (`prd/` folder) ⭐
**Version**: 0.2 (refined with architecture)  
**Sections**: 15 total

**Key Sections**:
- [`user-data-state-and-feature-access-mvp-constraint.md`](./prd/user-data-state-and-feature-access-mvp-constraint.md) 🔴 **CRITICAL** - New vs existing user constraint
- [`requirements.md`](./prd/requirements.md) - FR1-FR14, NFR1-NFR7, CR1-CR6
- [`epic-1-secure-web-app-mvp.md`](./prd/epic-1-secure-web-app-mvp.md) - **13 Stories Defined**
- [`technical-constraints-mvp.md`](./prd/technical-constraints-mvp.md) - MVP constraints
- [`phase-2-watermelondb-migration-post-mvp.md`](./prd/phase-2-watermelondb-migration-post-mvp.md) - Future roadmap

**Complete Index**: See [`prd/index.md`](./prd/index.md)

---

### Architecture (Technical Specifications)

#### **Full-Stack Web App Architecture** ⭐ **SHARDED**
**Location**: [`architecture/web-app/`](./architecture/web-app/)  
**Index**: [`architecture/web-app/index.md`](./architecture/web-app/index.md)  
**Version**: 1.2  
**Sections**: 25 organized files  
**Total Size**: 3,180 lines

**Contents**:
- **Phase 1 (MVP)**: Direct REST API integration, client-side aggregation, 11-week roadmap
- **Phase 2 (Post-MVP)**: WatermelonDB integration, perfect mobile sync, offline support
- **Component Specifications**: 50+ components specified
- **API Integration**: All endpoints, schemas, error handling
- **Analytics**: 50+ events with Amplitude + GA4
- **CSV Import**: Hevy format, fuzzy matching, client-side parsing
- **User Data State**: Detection logic, access control, feature gating
- **Testing Strategy**: Unit, integration, e2e

**Key Sections for Story Creation**:
- 🔴 `mvp-overview-phase-1.md` - MVP constraints & user data state
- ⭐ `feature-specifications.md` - Dashboard cards (5 cards detailed)
- ⭐ `component-architecture.md` - All 50+ components
- ⭐ `api-integration-mvp.md` - Backend endpoints & schemas
- ⭐ `import-flow-architecture.md` - Complete CSV import implementation
- ⭐ `development-roadmap.md` - 11-week timeline

**See**: [`architecture/web-app/index.md`](./architecture/web-app/index.md) for complete table of contents

---

#### **Brownfield Public Website Architecture**
**File**: [`architecture/brownfield-public-website.md`](./architecture/brownfield-public-website.md)  
**Version**: 1.0  
**Purpose**: Baseline of existing system

**Contents**:
- Current tech stack (Next.js 15, React 18, TypeScript)
- Authentication flow (Firebase → session cookies)
- Data sources (PostgreSQL, Contentful, S3)
- Exercise library architecture (SSR + debounced search)
- Shared components for web app (40+ UI primitives)
- Deployment process (Netlify)

**Key for Developers**: Shows what components already exist and can be reused

---

### UX & Design Specifications

#### **UX Design Brief** ⭐
**File**: [`ux-design-brief.md`](./ux-design-brief.md)  
**Version**: 2.1  
**Updated**: 2025-01-10 (Sally)

**Contents**:
- Mobile app design system (colors, typography, components)
- Competitive analysis (Hevy, StrengthLog patterns)
- MVP constraints (user data state, program builder access)
- UX messaging strategy (positive tone guidelines)
- Design principles (analytical, motivating, efficient)

**Critical Section**:
- Lines 110-171: MVP Technical Constraint - User Data State 🔴

---

#### **User Flows**
**File**: [`web-app-user-flows.md`](./web-app-user-flows.md)  
**Version**: 2.1  
**Updated**: 2025-01-10 (Sally)

**Contents**:
- Complete new user journey (signup → onboarding → dashboard)
- Complete existing user journey (login → dashboard direct)
- User data state branching logic
- Import flow (CSV upload → parse → import)
- Feature access matrix by user state

**Critical Section**:
- Lines 24-69: User Data State & Flow Branching 🔴

---

#### **Wireframes**
**File**: [`wireframes.md`](./wireframes.md)  
**Version**: 2.1  
**Updated**: 2025-01-10 (Sally)

**Contents**:
- 30+ screen layouts (desktop + mobile)
- Onboarding flow (9 steps, new users only)
- Dashboard layouts (populated + empty states)
- Program Builder (visual, flow-based, desktop-optimized)
- **NEW**: Program Builder Blocked State (existing users)
- Import flow screens (6 screens)
- Navigation patterns (sidebar + mobile nav)

**Critical Wireframes**:
- Section 1.10.1: Program Builder Blocked State 🔴
- Section 2.1-2.4: Dashboard layouts (4 variants)

**Summary**: [`wireframes-summary.md`](./wireframes-summary.md) - Quick overview of changes

---

### Research & Context

#### **Competitive Research** (`research/` folder)
- Competitive Market Analysis - Workout tracking apps
- Web Interfaces Analysis - Hevy, Strong, StrengthLog patterns
- Validation questions - Pre-UX/SM handoff

**Use For**: Understanding competitive landscape and user expectations

---

## 🔑 Critical Constraints (Must Read)

### 1. **User Data State Constraint** 🔴

**What**: Program Builder access depends on user data state

**New Users** (no existing data):
- ✅ Full Program Builder (create/edit/delete programs)
- ✅ Complete 9-step onboarding
- ✅ Empty dashboard with CTAs

**Existing Users** (have mobile data):
- ❌ Program Builder **READ-ONLY** (view only, cannot edit)
- ✅ Skip ALL onboarding (direct to dashboard)
- ✅ Populated dashboard (mobile data)
- 💬 Message: "Full program editing coming soon. Use mobile app to edit."

**Why**: Prevents mobile/web sync conflicts in MVP  
**Removed In**: Phase 2 (WatermelonDB integration)

**Documented In**:
- PRD: [`prd/user-data-state-and-feature-access-mvp-constraint.md`](./prd/user-data-state-and-feature-access-mvp-constraint.md)
- Architecture: `fullstack-web-app.md` (lines 73-227)
- UX Brief: `ux-design-brief.md` (lines 110-171)

---

### 2. **Onboarding Flow** 🔴

**New Users**: 9-step onboarding
- Steps 1-6: Questions (personal info, frequency, goals, etc.)
- Step 7: Program setup (Do you have a program?)
- Steps 8-9: Program configuration (varies by choice)

**Existing Users**: **No onboarding** (skip entirely)
- After login → Direct to `/app` (dashboard)
- Already onboarded on mobile app
- Repeating questions creates friction

**Branching**: Immediately after Firebase auth success (before any routing)

---

### 3. **Client-Side Aggregation** ⚠️

**Dashboard Stats Computed in Browser**:
- Weekly/monthly volume (sum sets, sum weight × reps)
- Personal records (max weight × reps per exercise)
- Progress trends (estimated 1RM using Epley formula)
- All aggregations cached in React Query

**Why**: No backend changes required for MVP  
**Performance**: < 100ms for typical datasets (< 500 sessions)  
**Optimized In**: Phase 2 or post-MVP backend improvements

---

### 4. **CSV Import** 📥

**Implementation**: Client-side parsing (like mobile app)
- PapaParse library (CSV → JSON)
- MiniSearch fuzzy matching (exercise names)
- Batch create via POST /api/logs
- Progress tracking during import

**Supported**: Hevy CSV format (18 columns)  
**Future**: Strong CSV, Google Sheets

---

## 📖 How to Use These Docs

### For Story Creation (Scrum Master):

**Process**:
1. Read Epic 1 in PRD: [`prd/epic-1-secure-web-app-mvp.md`](./prd/epic-1-secure-web-app-mvp.md)
2. For each story, reference:
   - **Requirements** from PRD
   - **Technical details** from Architecture
   - **UX specifications** from Wireframes
   - **User flows** for context
3. Create story file in `docs/stories/` with all context

**Story Template**: Use BMAD story template (`.bmad-core/templates/story-tmpl.yaml`)

---

### For Development (Developers):

**Before Starting a Story**:
1. Read story file (contains all necessary context)
2. Reference architecture for technical patterns
3. Reference wireframes for UI specifications
4. Reference UX brief for design system (colors, typography, spacing)

**During Development**:
- Architecture provides code examples and patterns
- UX brief provides exact color codes and measurements
- Wireframes show expected layouts
- User flows explain user expectations

---

## 📊 Document Versions & Status

| Document | Version | Last Updated | Status |
|----------|---------|--------------|--------|
| **PRD (Sharded)** | v0.2 | 2025-01-10 | ✅ Production |
| **Architecture (Web App)** | v1.2 | 2025-01-10 | ✅ Production |
| **Architecture (Brownfield)** | v1.0 | 2025-01-10 | ✅ Production |
| **UX Design Brief** | v2.1 | 2025-01-10 | ✅ Production |
| **User Flows** | v2.1 | 2025-01-10 | ✅ Production |
| **Wireframes** | v2.1 | 2025-01-10 | ✅ Production |

**Alignment**: ✅ 100% (All documents synchronized)

---

## 🚀 Next Steps

### Immediate:
1. ✅ Documentation complete (all agents' work done)
2. ⏭️ **Create stories** from Epic 1 (13 stories total)
3. ⏭️ **Begin development** (11-week Phase 1 timeline)

### Optional:
- Shard architecture (create `docs/architecture/web-app/` folder)
- Create development environment setup guide
- Create contributor guide

---

## 📁 Archive

**Location**: [`archive/`](./archive/)  
**Contents**: 11 superseded or temporary documents  
**Purpose**: Historical reference, preserved context

See [`archive/README.md`](./archive/README.md) for complete archive inventory.

---

**Questions?** Reference the appropriate document above or ask the relevant agent (PM, Architect, UX Expert, Scrum Master).

**Ready to build!** 🎉

