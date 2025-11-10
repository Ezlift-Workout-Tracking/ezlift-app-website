# EzLift Website + Web App — Full PRD (Draft v0.3)

## **1. Vision & Strategy**

EzLift started as a **frictionless workout tracker built for advanced lifters**. Its core value remains the same: helping lifters log and analyze their training with speed and precision. But the **longer-term vision expands beyond fitness tracking** into becoming the **central hub for all personal fitness data**.

### **Near-Term Vision (next 2–4 weeks)**

- Deliver a **web app companion** to the mobile app.
- Provide a **dashboard experience** with workout history, streaks, progress stats, and profile management.
- Give lifters a reason to open EzLift on desktop/laptop for **analytics and control**.

### **Mid-Term Vision (within ~3 months)**

- **Centralize fitness data** by supporting:
    - Imports from **competitor apps** (Hevy, Strong, Sheets, Notion, Google Docs).
    - Integrations with **Apple Health, Google Fit, Fitbit, Samsung Health**.
    - Future **diet and recovery tracking**.
- **AI-powered coaching and analysis**:
    - Copy-paste freeform text (e.g. a workout plan from ChatGPT) → EzLift interprets it into structured routines.
    - AI assistant with multiple modes (Coach, Analyst, Advisor).
- Enable **sharing and collaboration**: lifters can expose selected data to trainers, peers, or communities.

### **Long-Term Vision (6–12 months)**

- EzLift as the **fitness data operating system**:
    - Expose user data via a **Model Context Protocol (MCP)**, giving each user a secure token to query/export their own data.
    - Allow external tools (ChatGPT, Cursor, dashboards) to connect and build on user data.
    - Position EzLift as the **state-of-the-art hub for agentic fitness workflows**.

This vision informs present-day decisions: even MVP architecture should keep **data portability and MCP integration** in mind.

---

## **2. Current State (Baseline)**

- **Framework & Stack**: Next.js 15 (App Router), React 18, TypeScript, Tailwind + shadcn/ui【docs/PROJECT_DOCUMENTATION.md】.
- **Auth**: Firebase (Email/Password, Google, Apple). Sessions managed server-side【docs/PROJECT_DOCUMENTATION.md】.
- **Data**: PostgreSQL for exercises, S3 for media, Contentful for blog【docs/PROJECT_DOCUMENTATION.md】.
- **Site Verticals**:
    - Marketing site (landing, about, pricing)
    - Exercise Library (searchable, filterable, paginated)
    - Blog (Contentful-backed)
    - Auth flows (login, signup, forgot password)
    - Legal pages (privacy, cookies, terms, EULA)
- **CI/CD**: GitHub Actions → Netlify.
- **SEO**: dynamic metadata, OpenGraph, sitemap, robots.txt【docs/PROJECT_DOCUMENTATION.md】.

This baseline must remain intact as we expand.

---

## **3. MVP: Web App (v0.1)**

**Objective**: Provide immediate value with a simple but powerful dashboard.

### **Features**

- **Authentication** (login, signup, existing account recognition). ✅ already functional.
- **Dashboard Landing Page**:
    - **Most Recent Workout card**: shows last session (sets, reps, highlights, notes).
    - **History Snapshot**: preview of last 3–5 workouts with quick links to details.
    - **Weekly Overview**: volume trend, sets/reps totals, streak counter, PR highlights.
    - **Profile Quick View**: editable basics (display name, weight, units).
    - **Import Panel (Early Access)**: entry point for importing data exported from **Hevy** or **Strong**. Initially links to upload/manual import flow (backend integration TBD). Positioned as a dashboard card (“Import your history”) so users see it immediately.
- **Workout History Page**:
    - Paginated list of past workouts.
    - Filters by date range & workout type.
- **Stretch**:
    - Profile editing.
    - Streak tracker widget.
    - CSV/PDF export (web-exclusive value add).

### **Non-Functional Requirements**

- Keep frontend **lightweight**; reuse existing backend APIs.
- Build with **extendability** in mind (imports, charts, AI assistant, MCP).
- Maintain **performance parity** with mobile app.

### **MVP Acceptance Criteria (per card)**

- **Recent Workout**: Displays correct sets/reps, volume, and notes for the most recent session; if none exist, shows empty state with CTA to import or log.
- **Weekly Overview**: Accurately aggregates current week’s sets, volume, and streak; empty state text if no data.
- **History Snapshot**: Lists last 3–5 sessions with date, name, and quick link; empty state CTA to import or log.
- **Import Panel**: Accepts Hevy/Strong file upload; shows confirmation of job started.
- **Profile Quick View**: Displays name, units, bodyweight; updates persist via PATCH and reflected after reload.

---

## **4. Roadmap: Web App Expansions**

- **v0.2**: In-depth statistics (charts, PR tracking, volume analytics).
- **v0.3**: Routines/workouts management (view, edit, create).
- **v0.4**: Exercise library integration (search + add custom exercises).
- **v0.5**: AI assistant (Coach, Analyst, Advisor modes) — backend orchestrated.
- **v0.6**: MCP-based data export API (token-gated, user-owned).

---

## **5. Blog & SEO/AEO Strategy**

- Link blog posts to exercise library for topic clustering.
- Use **AEO (Answer Engine Optimization)** to optimize for LLM-driven queries.
- Introduce **Q&A funnel with Moe’s expertise**:
    - Dedicated page for users to submit fitness questions.
    - Moe answers → published to blog + YouTube.
    - Long-tail Q&A improves discoverability in both SEO and AEO contexts.

---

## **6. Landing Page Optimization**

- Redesign for **conversion-first flow**.
- Add **A/B testing infrastructure** (Netlify experiments or third-party).
- Integrate **dynamic CTAs** pointing to:
    - Web app login/signup.
    - Blog & Q&A posts.
    - YouTube content.

---

## **7. Integrations & Dependencies**

- Firebase (auth)
- PostgreSQL (exercise data)
- S3 (exercise media)
- Contentful (blog content)
- Backend API (workout history, stats)
- Analytics + A/B testing (TBD)
- MCP-compatible interface (future)
- **Imports backend parsers for Hevy & Strong (critical for MVP)**

---

## **8. Risks & Constraints**

- Avoid regressions in existing login & CMS flows.
- Keep UX **fast and minimal** — gym context demands low-friction.
- Ensure SEO & AEO work with **SPA navigation**.
- MCP adoption is early-stage — need flexible integration strategy.
- **Onboarding fatigue risk**: too many questions may discourage new users. *Mitigation: all steps skippable, progressive saves, clear “Skip for now” CTA.*

---

## **9. Success Metrics**

- % of mobile lifters using web app weekly.
- Blog traffic uplift (SEO + AEO share).
- Landing page conversion rate.
- Moe’s Q&A → backlinks & LLM citations.
- Developer productivity (time-to-deploy of new features).
- **Import adoption**: ≥30% of new users with prior app history attempt Hevy/Strong import within first 30 days.

---

## **10. Empty State & Onboarding Flow**

### **Empty State Rules**

- If a user has **0 workouts logged** and **0 imports**, they should not be shown the normal dashboard.
- Instead, they enter the **web onboarding flow** (default for new users).
- Dashboard fallback states (if reached without onboarding):
    - Recent Workout card: “No workouts yet. [Import history] or [Log first workout]”.
    - Weekly Overview: “Your stats will appear after your first logged workout.”
    - History Snapshot: CTA to import or log.
    - Import Panel: Highlighted as entry point.

### **Onboarding Flow (Web)**

1. **Welcome Screen**
    - Text: “Welcome to EzLift Web! Let’s get you started.”
    - Options: Import history, create routine, or explore recommended programs.
2. **Profile Basics** (optional, skippable)
    - Gender (Male, Female, Other, Prefer not to say).
    - Units preference.
    - Bodyweight (optional).
3. **Training Background**
    - Do you have an existing training program? (Yes / No).
    - If Yes → option to import or describe.
    - If No → suggest recommended programs.
4. **Experience & Preferences**
    - Years training (0–1, 1–3, 3+).
    - Sessions per week (1–2, 3–4, 5+).
    - Training duration (30 min or less, 30–45, 45–60, 60+).
    - Equipment access (Free weights, Machines, Bands, Bodyweight, Kettlebells).
5. **Goals**
    - Build muscle, Lose weight, Improve endurance, Other.
6. **Imports**
    - “Have you been using another app?”
    - If user selects Hevy or Strong → show instructions for exporting + upload box.
    - If other → free text (helps us learn about competitors).
7. **Program Setup**
    - Based on answers, recommend suitable starter programs (e.g. Fullbody 3x/week, Minimalist 2x/week).
    - Or allow them to skip and go directly to builder (future).
    - “Coming soon” label where builder not yet implemented.
8. **Confirmation Screen**
    - Show summary of choices.
    - CTA → “Go to Dashboard”.

### **Flow Outcome**

- After onboarding, user lands on dashboard with:
    - Imported data or starter program visible.
    - Empty stats but clear path forward.

---

## **11. Appendix A — Architecture Notes**

- **Frontend**: Next.js App Router, SSR + CSR hybrid.
- **APIs**: Reuse mobile backend (sessions, workouts, stats).
- **Data portability**: structure backend APIs so they can later be exposed via MCP.
- **CI/CD**: GitHub Actions → Netlify, environment secrets validated.
- **UI System**: Tailwind + shadcn/ui, Radix primitives【docs/PROJECT_DOCUMENTATION.md】.
- **Testing**: Jest + React Testing Library for hooks (e.g. useDebouncedSearch).

---

## **12. Appendix B — MVP Wireframe**

### **Visual Mock (Box Layout)**

```
+------------------------------------------------+
|                Dashboard (Desktop)             |
+------------------------------------------------+
| Recent Workout        | Weekly Overview        |
| (card: sets/reps,     | (card: volume trend,   |
| notes, highlights)    | streak, PRs)           |
+-----------------------+------------------------+
| History Snapshot      | Import Panel (Hevy/    |
| (last 3–5 sessions,   | Strong upload/manual)  |
| quick links)          |                        |
+-----------------------+------------------------+
| Profile Quick View (display name, units, wt)   |
+------------------------------------------------+
```

**Mobile (stacked layout):**

```
[ Recent Workout ]
[ Weekly Overview ]
[ History Snapshot ]
[ Import Panel ]
[ Profile Quick View ]
```

### **Detailed Wireframe Description**

**1. Recent Workout Card**

- Top-left (desktop), first card (mobile).
- Shows: workout date, name, notes, top lifts, total sets/reps.
- CTA: “View full session”.

**2. Weekly Overview Card**

- Top-right (desktop).
- Displays weekly volume (kg/lb), sets count, streak counter, PR count.
- Visualization: simple bar graph or sparkline.

**3. History Snapshot Card**

- Bottom-left (desktop).
- List of last 3–5 workouts with quick links.
- Each entry: date, workout title, duration, volume summary.

**4. Import Panel (Hevy/Strong)**

- Bottom-right (desktop).
- Title: “Import your history”.
- Options: drag-and-drop file upload (CSV), or connect flow.
- CTA: “Start Import”.

**5. Profile Quick View**

- Full-width row below grid (desktop); bottom card (mobile).
- Shows avatar/initials, display name, bodyweight, units.
- Edit button → navigates to Profile page.

**Navigation (top bar)**

- Tabs: Dashboard | History | Profile.
- Logout and Settings under Profile.

**Responsive Rules**

- ≥1024px: 2x2 grid (Recent + Weekly on row 1; History + Import on row 2); Profile below.
- <1024px: stacked single column (cards vertical).

**States**

- Loading: skeleton loaders for each card.
- Empty: “No workouts yet” placeholder in Recent + History.
- Error: toast with retry option.

---

## **13. Appendix C — Onboarding Flow (Web)**

### **Screen Sketches**

```
[ Welcome Screen ]
  → CTA: Import | Create Program | Explore Programs

[ Profile Basics ]
  → Gender | Units | Bodyweight

[ Training Background ]
  → Existing program? (Yes/No)

[ Preferences ]
  → Sessions/week | Duration | Equipment | Years training

[ Goals ]
  → Build Muscle | Lose Weight | Endurance | Other

[ Import Apps ]
  → Hevy | Strong | Other (free text)

[ Program Setup ]
  → Recommend routines OR link to builder (future)

[ Confirmation ]
  → Show summary → CTA: Go to Dashboard
```

### **Notes**

- Skippable at every stage.
- Data saved progressively to profile.
- Output → ensures user lands on dashboard with at least a starter point (imported logs or assigned program).

---

## **14. Appendix D — Endpoint & Data Mapping (MVP+)**

> Updated with exact paths from current Swagger export
> 
> 
> **(TBD)**
> 
>
### **14.1 Global Auth & Session**

- **Verify Firebase token → server session**: POST /verify → { success, data: { email } }
- **Who am I / profile**: GET /api/user-profile/ → { name, email, yearsOfTraining, gender, height, weight, settings, subscription* }
- **Update profile + onboarding fields**: PATCH /api/user-profile/
- **Defaults for settings**: GET /api/user-profile/settings/defaults

### **14.2 Dashboard Cards**

**A) Recent Workout**: GET /api/workout-log/ (latest)

**B) Weekly Overview**: aggregate client-side for MVP; propose /api/stats/weekly for v0.2

**C) Streak**: compute client-side for MVP; propose /api/stats/streak for v0.2

**D) History Snapshot**: GET /api/workout-log/

**E) Import Panel**: (TBD) /api/imports/hevy, /api/imports/strong

**F) Profile Quick View**: GET /api/user-profile/, PATCH /api/user-profile/

### **14.3 History Pages**

- **List**: GET /api/workout-log/
- **Detail (log)**: GET /api/workout-log/{id}
- **Detail (by workout id)**: GET /api/workout-log/workout/{id}
- **Last set for exercise**: GET /api/workout-log/exercise/{exerciseId}/last

### **14.4 Routines & Workouts (roadmap)**

- Routines: GET/POST /api/routine/, PATCH/DELETE /api/routine/{id}
- Workouts: GET/POST /api/workout/, PATCH/DELETE /api/workout/{id}
- Scan workout: POST /api/workout/scan

### **14.5 Logging**

- Create log: POST /api/workout-log/
- Scan log: POST /api/workout-log/scan

### **14.6 Exercise Library**

- List: GET /api/exercise/
- Get: GET /api/exercise/{id}
- Create/Update/Delete: POST, PATCH, DELETE /api/exercise/{id}
- Bulk create: POST /api/exercise/bulk
- Meta: GET /api/exercise/meta-data

### **14.7 Exports (Future)**

- (TBD) POST /api/exports/workouts

### **14.8 Onboarding Detection**

- **Zero-state detection**: GET /api/workout-log/ length === 0
- **Optional check**: GET /api/routine/
- **Store answers**: PATCH /api/user-profile/ with