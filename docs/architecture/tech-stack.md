# Technology Stack - EzLift Web App

**Version**: 1.0  
**Last Updated**: 2025-01-10  
**Architect**: Winston

---

## Frontend Core

### Framework
- **Next.js**: 15.1.2 (App Router, React Server Components)
- **React**: 18.2.0
- **TypeScript**: 5.2.2

### UI & Styling
- **Tailwind CSS**: 3.3.3 (utility-first styling)
- **shadcn/ui**: Radix-based accessible component primitives (40+ components)
- **Radix UI**: Accessible component primitives
- **Framer Motion**: 11.0.8 (animations)
- **Lucide React**: 0.446.0 (icons)

---

## New Dependencies for Web App (MVP)

### State Management
- **@tanstack/react-query**: ^5.62.0 (server state, caching, mutations)
- **@tanstack/react-query-devtools**: ^5.62.0 (debugging)

### Analytics
- **@amplitude/analytics-browser**: ^2.11.3 (product analytics)
- Google Analytics 4 (already integrated via `components/GoogleAnalytics.tsx`)

### CSV Parsing & Search
- **papaparse**: ^5.4.1 (CSV parsing for Hevy/Strong imports)
- **minisearch**: ^7.1.0 (fuzzy search for exercise matching)
- **@types/papaparse**: ^5.3.15 (TypeScript types)

### Charts & Visualization
- **recharts**: 2.12.7 (already installed - bar/line charts for dashboard)

### Date Handling
- **date-fns**: 3.6.0 (already installed - date parsing, formatting)

---

## Backend & Data

### Database
- **PostgreSQL**: Via `pg` 8.16.3 (exercise library, read-only from web)
- **Connection**: Direct connection for exercise data only

### CMS
- **Contentful**: 10.6.21 (headless CMS for blog and exercise content)

### Media Storage
- **AWS S3**: SDK v3 (exercise images/videos with signed URLs)

### Authentication
- **Firebase**: 10.14.1 (client SDK - auth only)
- **Firebase Admin**: 12.7.0 (server-side token verification)

---

## Form Handling

- **React Hook Form**: 7.53.0 (form state management)
- **Zod**: 3.24.1 (schema validation)
- **@hookform/resolvers**: 3.9.0 (Zod integration)

---

## Utilities

- **Axios**: 1.7.9 (HTTP client for backend API)
- **Lodash**: 4.17.21 (utility functions)
- **class-variance-authority**: 0.7.0 (component variants)
- **clsx**: 2.1.1 (conditional classnames)
- **tailwind-merge**: 2.5.2 (merge Tailwind classes)

---

## Development Tools

- **TypeScript**: 5.2.2 (type checking)
- **ESLint**: 8.49.0 (code linting)
- **PostCSS**: 8.4.49 (CSS processing)
- **Autoprefixer**: 10.4.15 (CSS vendor prefixes)

---

## Deployment

- **Netlify**: @netlify/functions 3.0.0, @netlify/plugin-nextjs
- **Platform**: Netlify (SSR, ISR, edge functions)

---

## Not Used in MVP (Phase 2)

- ❌ **WatermelonDB**: @nozbe/watermelondb (Phase 2 only)
- ❌ **IndexedDB**: Built-in (used by WatermelonDB in Phase 2)

---

## Version Compatibility

**Node.js**: 18.x or 20.x (LTS)  
**npm**: 9.x or higher  
**Browsers**: Evergreen browsers (Chrome, Safari, Firefox, Edge)

---

## Installation

```bash
npm install
```

**Installs**: All dependencies from package.json (~100+ packages)

**Verification**:
```bash
npm run dev  # Should start without errors
```

---

**Complete Details**: `docs/architecture/web-app/technology-stack-mvp.md`



