# Technology Stack (MVP)

## Frontend Core (Inherits from Public Website)

- **Next.js**: 15.1.2 (App Router)
- **React**: 18.2.0
- **TypeScript**: 5.2.2
- **Tailwind CSS**: 3.3.3
- **shadcn/ui + Radix**: Component primitives

## New Dependencies for Web App

**State Management**:
- **@tanstack/react-query**: ^5.x (recommended) OR **SWR**: ^2.x
  - Server state synchronization
  - Cache management
  - Optimistic updates
  - Background refetching

**CSV Parsing**:
- **papaparse**: ^5.4.1 (same as mobile app uses)
  - Client-side CSV parsing
  - Type-safe row parsing
  - Error handling

**Analytics**:
- **@amplitude/analytics-browser**: ^2.x
  - User behavior tracking
  - Event batching
  - Session replay capabilities
- **Google Analytics** (already integrated, extend to web app)

**Charts & Data Visualization**:
- **Recharts**: 2.12.7 (already installed)
  - Bar charts (training volume)
  - Line charts (progress over time)
  - Responsive charts
  - Customizable styling

**Search & Fuzzy Matching** (for CSV import):
- **minisearch**: ^7.x (same library as mobile app)
  - Fuzzy exercise name matching
  - Exercise library integration
  - Handles typos and variations

**Date Handling**:
- **date-fns**: 3.6.0 (already installed)
  - Date parsing for CSV imports
  - Date formatting for UI
  - Relative dates ("2 days ago")

---
