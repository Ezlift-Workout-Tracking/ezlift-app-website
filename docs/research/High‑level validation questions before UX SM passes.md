# High‑level validation questions before UX/SM passes

- **Target users & jobs**
    - Who is the primary web user (segments) and top 3 jobs they’ll do on desktop?
        - **Primary user segments for the web dashboard:**
            1. **Advanced & intermediate lifters** who already use the mobile app regularly for logging workouts.
            2. **Coaches / personal trainers** who want a broader view of multiple clients’ progress (future but relevant to keep in mind).
            3. **Power users / data nerds** who care about analyzing their performance trends over time and want more screen real estate for it.
            4. **Data/Tech Savy users** who would like to use our advanced AI features early on or would like to take advantage of the MCP/Data import/export ecosystem; i.e. they would like to talk to chatGPT about their fitness data through EzLift’s web MCP, etc.
        - **Top 3 jobs they’ll do on desktop:**
        1. **Review & analyze training progress**
            
            → Look at charts, personal records, volume/intensity trends, exercise history, etc., in more detail than the mobile app can comfortably show.
            
        2. **Plan and edit workout routines**
            
            → Build or adjust full programs (e.g., weeks of progression, supersets, accessories) faster using keyboard/mouse and bigger layouts.
            
        3. **Import/export & manage data**
            
            → Bulk import historical data (e.g., from spreadsheets or other apps), export logs, and manage exercise libraries more efficiently.
            
        4. 👉 In short: **the web app is the “command center”** for power users — not a replacement for the mobile logging experience.
    - Biggest mobile pain points we should solve differently on web?
        1. **Limited space & clunky editing for complex routines**
            
            → On mobile, editing multi-week routines, supersets, or custom exercises can feel cramped. Web can give a proper drag-and-drop, spreadsheet-like interface.
            
        2. **Historical data analysis**
            
            → Mobile UI is optimized for quick logging, not deep analytics. Web can offer richer charts, filters, comparisons over time, and downloadable data.
            
        3. **Bulk operations**
            
            → Things like editing many exercises, importing logs, or switching entire programs are cumbersome on mobile. Web can make these fast and efficient.
            
- **Differentiation vs mobile**
    - Which mobile features should we intentionally NOT mirror on web?
        1. **Workout logging flow** (timer, rest periods, in-set navigation)
            
            → Core strength of mobile. Web shouldn’t try to replicate the in-gym experience; users won’t have laptops mid-set.
            
        2. **Scanner/import from handwritten notes (camera)**
            
            → Mobile-native feature; not relevant for desktop.
            
        3. **Push notifications & real-time workout reminders**
            
            → These are OS/mobile capabilities; unnecessary for web MVP.
            
    - Which net‑new web‑first features are we open to piloting in MVP?
        1. **Advanced routine builder**
            
            → A more powerful, spreadsheet-like editor with drag & drop, multi-week programming, and bulk actions — a pain point on mobile.
            
        2. **Analytics dashboard**
            
            → Rich charts, historical comparisons, PR tracking, volume/intensity graphs, filters — taking advantage of screen space.
            
        3. **Import/export tools**
            
            → Allow importing legacy data (CSV/Sheets, Hevy/Strong export files), and exporting logs for personal analysis.
            
        4. **Feature flag playground / early experiments**
            
            → Web is a good place to pilot new UI components (e.g. custom exercise tagging, program templates) before pushing them to mobile.
            
- **MVP scope sanity check**
    - Are the five dashboard cards still the P0 set? Any must‑add/must‑drop?
        
        Yes — the original five still make sense as MVP essentials for the dashboard homepage:
        
        1. **Training Volume (per week)**
        2. **Top PRs / Personal Bests**
        3. **Recent Workouts**
        4. **Progress over time (e.g. estimated 1RM or intensity)**
        5. **Active Program / Routine Summary**
        
        These give users immediate value when they land on the dashboard, without requiring feature creep.
        
        **Potential must-add:**
        
        - A simple **date range filter** at the top (global filter for all cards). That’s more UX than a separate card, but likely essential for power users.
    - Any dependency we’re unsure the backend can serve on day 1 (fields, aggregations)?
        - **Aggregations for training volume & intensity over time** → We need to confirm the mobile backend exposes clean aggregation endpoints (weekly/monthly totals, PR calculations) rather than only raw logs.
        - **Historical imports** → Depending on how far along the import parsers (e.g. Hevy/Strong/CSV) are, this might need staged rollout.
        - **Advanced filters** → If the backend doesn’t yet support flexible date ranges, exercise-type filters, or user-defined groupings, the analytics cards may need temporary hardcoded time windows (e.g. “last 4 weeks”).
        
        👉 Basically: the raw workout logs exist, but we need to verify that **the aggregation and historical data APIs** are performant and available before committing to all analytics cards on day 1.
        
- **Paywall policy (web)**
    - Free vs paid boundaries at launch (by feature, usage, or capability)?
        - We are currently in the process of switching the paywall conditions from “Track your first 5 workouts for free then pay to continue using the app” to “Tracking will remain forever free, but access to premium features requires payment”
        - Current suggestion for premium features:
            - Stats
            - Scanning workouts
            - Import from Hevy/Strong
            - AI features
        - We will start by making the web app for free including all the stats dashboard and import/export and AI features because otherwise we will make all of it only paid which is then against the point of using it for early validation of new features. But as we build it out more, we can then introduce a smarter paywall.
    - Does web access ride on existing mobile subscription, or separate plans?
        - Once the paywall is also applied to the web app, it will ride on the existing mobile plans
    - Is Import (Hevy/Strong) free, paid, or “early access” gated?
        - I will provide a reference for the different business models in the market in a different document
- **Analytics & experimentation**
    - North‑star metric for the web app (and supporting activation metrics)?
        - Weekly active users is the most important north-star metric for now which can be directly tracked
    - Event taxonomy preference (names/properties) and owner?
        - The tracking events should be part of the success criteria of each ticket handled by the dev, you as the PM and/or the scrum master should bake these event descriptions into your created stories and tasks
    - A/B tool shortlist (e.g., Optimizely, VWO, Netlify Experiments, LaunchDarkly/Flags)? Any vendor constraints?
        - Netlify Experiments seem appropriate since we already use Netlify for deployments, not sure our current package covers it though.
        - But we also have an Amplitude subscription that we use to track events in the mobile app and can be used for web.
    - Consent model (cookie banner) and IP anonymization requirements?
        - The default according to GDPR and laws in Germany, no specific IP anonymization requirements otherwise.
- **Backend readiness**
    - Confirm available endpoints for: recent workout, history list/filters, profile read/write, import start:
        - Swagger docs for the backend: [https://ezlift-server-production.fly.dev/documentation](https://ezlift-server-production.fly.dev/documentation)
    - Any rate limits/CORS/security constraints we should account for?
        - No known constraints for now, But the user token has to be passed with every request
- **Performance, security, compliance**
    - Performance budgets firm at LCP < 2.5s / INP < 200ms for dashboard?
        - LCP should be under 2s only, INP < 200ms is fine.
    - CSP changes needed for GA/A/B scripts? Any PII restrictions beyond GA defaults?
        - No extra rules for handling personal data beyond Google Analytics’ built-in privacy
- **Release plan**
    - Desired timeline/phasing (soft‑launch behind invite/flag, public after)?
        - There aren’t many users yet so we don’t want to complicate the process, as long as features are tested and working locally, we can incrementally roll-out to production. Experimental features could be hidden behind feature flags for A/B testing.
    - `Rollback criteria and “control” variant definition for flags?
        - Rollback conditions:
            - If the app is crashing after a new deployment
            - If performance drops below target (e.g. LCP > 4s)
            - If analytics show users are failing key tasks
            - And/Or simply: “we want a manual switch to disable it if bugs pop up.”
- **Competition**
    - Which competitors to benchmark for desktop web (Hevy, Strong, others)? Key gaps we aim to leapfrog now vs later?
        - I will reference two documents:
            1. One that talks about the competition in general and about the market and so on, which I think is useful
            2. Another document specifically about the desktop or web version of the competitors
- **Success criteria**
    - First 4‑week targets (adoption, activation, import attempts, retention)?
        
        ### **First 4-week success criteria**
        
        **👉 Quantitative targets (baseline MVP goals):**
        
        | **Metric** | **Target** | **Rationale** |
        | --- | --- | --- |
        | **Adoption** | ≥ 20% of active mobile users try the web dashboard at least once | Establish early interest and validate cross-platform value |
        | **Activation** | ≥ 50% of those who try it complete at least one meaningful action (e.g. view analytics, edit routine, or export data) | Show that web isn’t just a curiosity, but drives actual usage |
        | **Import attempts** | ≥ 30% of new web users attempt at least one data import (CSV or competitor export) | Test appetite for the “power user” feature set |
        | **Retention** | ≥ 30% of activated users return ≥ 3 times in their first 4 weeks | Signal early stickiness and confirm web adds ongoing value (e.g. for planning/analyzing sessions) |
        
    - Any qualitative bar (UX heuristics, support load expectations)?
        - **Qualitative bar**
            - **UX heuristics**
                - Core flows (routine editing, dashboard viewing, imports) should be *intuitive without documentation* for power users.
                - No more than 1 “WTF moment” in a basic session (i.e. user confusion or dead ends).
                - Pages should load fast (LCP < 2.5s) and interactions should feel snappy (INP < 200ms).
            - **Support load expectations**
                - Fewer than **5 inbound support tickets per 100 web users** in the first month.
                - Common issues should be addressable with lightweight in-product tooltips or a short FAQ — we don’t want web MVP to become a support burden.

Answer inline (even brief bullets are fine). I’ll incorporate responses in the PRD at a high level and hold on story tickets until after UX and SM weigh in.