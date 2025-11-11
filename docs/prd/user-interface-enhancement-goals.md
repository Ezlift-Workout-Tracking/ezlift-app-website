# User Interface Enhancement Goals

## Integration with Existing UI
- Use Tailwind CSS and shadcn/ui (Radix) components consistently; respect existing design tokens, spacing, and motion guidelines.
- Ensure accessible semantics (labels, roles, focus order, keyboard navigation) and color contrast for dark/light themes.
- Prefer server-rendered shells with client components for interactions; avoid blocking scripts on first paint.
- Reuse `components/ui/*` primitives; add new primitives only when necessary and co-locate in appropriate folders.

## Modified/New Screens and Views
- Dashboard (post-login landing): grid of P0 cards — Training Volume, Top PRs, Recent Workouts, Progress over Time, Active Program/Routine Summary — with a global date range filter.
- History (list view for MVP; detail view optional in later phases).
- Profile (basics: units, bodyweight; display name).
- Import entry (modal/sheet or dedicated flow entry from dashboard card).
- Program Builder (visual, flow-based: Workout 1 → 2 → 3 → Overview → Save)
- Onboarding (9-step flow with progress indicator, branching logic for user state)

## UI Consistency Requirements
- Responsive behavior: stacked on mobile; 2x2 grid on desktop for primary cards; program card full-width below.
- Loading: skeleton loaders for each card; Error: non-blocking toasts; Empty: clear CTAs (import/log workout/create program).
- Instrumentation hooks in UI components to fire analytics events for meaningful actions.
- Feature flag boundaries wrap visible UI variants to support A/B testing without visual flicker.
- **Light mode only**: Web app uses light theme (contrasting with public site's dark theme) for analytical clarity on desktop.

