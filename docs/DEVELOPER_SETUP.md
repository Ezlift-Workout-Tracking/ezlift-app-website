# Developer Setup Guide - EzLift Web App

**Version**: 1.0  
**Last Updated**: 2025-01-10  
**Maintained By**: Winston (Architect)

---

## Prerequisites

**Required**:
- **Node.js**: 18.x or 20.x (LTS recommended)
- **npm**: 9.x or higher
- **Git**: Latest version
- **Code Editor**: VS Code recommended (with TypeScript extension)

**Helpful**:
- PostgreSQL client (for database exploration)
- Postman or similar (for API testing)
- Chrome DevTools (for debugging)

---

## Initial Setup

### 1. Clone Repository

```bash
git clone <repo-url>
cd ezlift-app-website
```

### 2. Install Dependencies

```bash
npm install
```

**Expected Duration**: 2-3 minutes

**Verify**: No errors during installation

---

### 3. Configure Environment Variables

Create `.env.local` in project root:

```env
# ============================================
# FIREBASE AUTHENTICATION (Required)
# ============================================
# Get these from Firebase Console (https://console.firebase.google.com)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ============================================
# DATABASE (Required for Exercise Library)
# ============================================
DATABASE_URL=postgresql://user:password@host:5432/ezlift

# ============================================
# BACKEND API (Optional - defaults to production)
# ============================================
NEXT_PUBLIC_BACKEND_API=https://ezlift-server-production.fly.dev
# For local backend development:
# NEXT_PUBLIC_BACKEND_API=http://localhost:8080

# Backend verification (optional for development)
BACKEND_BASE_URL=https://ezlift-server-production.fly.dev/verify
AUTH_DEV_MODE=true  # Skip backend verification in development

# ============================================
# AWS S3 (Optional - Exercise Images)
# ============================================
EZLIFT_AWS_ACCESS_KEY_ID=your_access_key
EZLIFT_AWS_SECRET_ACCESS_KEY=your_secret_key
EZLIFT_AWS_REGION=us-east-1
EZLIFT_AWS_S3_BUCKET_NAME=your_bucket_name

# ============================================
# CONTENTFUL CMS (Optional - Blog Content)
# ============================================
CONTENTFUL_SPACE_ID=your_space_id
CONTENTFUL_ACCESS_TOKEN=your_access_token
CONTENTFUL_ENVIRONMENT=master
# CONTENTFUL_PREVIEW_ACCESS_TOKEN=preview_token  # Optional

# ============================================
# ANALYTICS (Required for Web App)
# ============================================
# Get your Amplitude API key from: https://analytics.amplitude.com/settings/projects
# Note: Create a separate Amplitude project for development/testing
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_api_key_here

# GA Measurement ID already in public code (update if needed)

# ============================================
# FEATURE FLAGS (Phase 2)
# ============================================
# NEXT_PUBLIC_USE_WATERMELON=false  # Not used in Phase 1
```

**Minimal Setup** (to get started):
```env
# Only these are REQUIRED for basic development:
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
DATABASE_URL=postgresql://...
AUTH_DEV_MODE=true
```

---

### 4. Verify Setup

#### **Test 1: Development Server Starts**

```bash
npm run dev
```

**Expected Output**:
```
> nextjs@0.1.0 dev
> next dev

  ▲ Next.js 15.1.2
  - Local:        http://localhost:3000
  - Environments: .env.local

 ✓ Starting...
 ✓ Ready in 2.1s
```

**Verify**: Server starts without errors

---

#### **Test 2: Public Website Works**

1. Open browser: `http://localhost:3000`
2. **Verify Landing Page**:
   - ✅ Hero section loads
   - ✅ Features section visible
   - ✅ Pricing section visible
   - ✅ No console errors

3. **Verify Exercise Library**:
   - Navigate to: `http://localhost:3000/exercise-library`
   - ✅ Exercise grid loads
   - ✅ Search works (type "bench")
   - ✅ Filters work (select "Chest")
   - ✅ Pagination works

4. **Verify Blog** (if Contentful configured):
   - Navigate to: `http://localhost:3000/blog`
   - ✅ Blog posts load (or empty state if no Contentful)

---

#### **Test 3: Authentication Flow**

1. **Create Test Account**:
   - Navigate to: `http://localhost:3000/signup`
   - Sign up with email/password or Google/Apple
   - ✅ Redirects to `/app` after signup

2. **Login**:
   - Navigate to: `http://localhost:3000/login`
   - Login with test account
   - ✅ Redirects to `/app` (placeholder dashboard)

3. **Logout**:
   - Click logout button (if available)
   - ✅ Redirects to home page
   - ✅ Cookies cleared (check DevTools)

---

#### **Test 4: Protected Routes**

1. **Without Login**:
   - Navigate to: `http://localhost:3000/app`
   - ✅ Redirects to `/login?redirect=/app`

2. **With Login**:
   - Login first
   - Navigate to: `http://localhost:3000/app`
   - ✅ Shows placeholder dashboard (or implemented dashboard if development started)

---

## Development Workflow

### **Starting a New Story**

```bash
# 1. Ensure main branch is up to date
git checkout main
git pull origin main

# 2. Create feature branch
git checkout -b feature/story-1.x-description
# Example: feature/story-1.4-training-volume-card

# 3. Verify environment is ready
npm run dev  # Test that dev server starts

# 4. Read story file
# Location: docs/stories/1.x.story-name.story.md
# Contains: All requirements, acceptance criteria, technical guidance

# 5. Reference architecture docs
# Primary: docs/architecture/web-app/
# Specific sections as needed for your story
```

---

### **During Development**

```bash
# 1. Make changes
# Follow architecture patterns in docs/architecture/web-app/

# 2. Test locally
npm run dev
# Manual testing in browser
# Check console for errors

# 3. Run linter
npm run lint
# Fix any linting errors

# 4. Build test (before committing)
npm run build
# Ensure no build errors

# 5. Commit changes
git add .
git commit -m "Story 1.x: Brief description of changes"
# Example: "Story 1.4: Implement Training Volume Card with client-side aggregation"

# 6. Push to remote
git push origin feature/story-1.x-description

# 7. Create Pull Request
# GitHub will prompt you to create PR after push
```

---

### **Testing Your Changes**

**Manual Testing**:
1. Test happy path (feature works as expected)
2. Test edge cases (empty states, errors, loading)
3. Test responsive design (mobile, tablet, desktop)
4. Test keyboard navigation
5. Test with network throttling (DevTools)

**Automated Testing** (when available):
```bash
npm test  # Run unit tests (when test suite exists)
```

---

## Common Issues & Solutions

### **Issue: "Firebase config missing" Error**

**Symptom**: Error on page load: "Firebase: Error (auth/invalid-api-key)"

**Solution**:
1. Verify all `NEXT_PUBLIC_FIREBASE_*` env vars are set in `.env.local`
2. Ensure no spaces or quotes around values
3. Restart dev server after adding env vars

---

### **Issue: Database Connection Failed**

**Symptom**: Error: "connect ECONNREFUSED" or "no pg_hba.conf entry"

**Solutions**:
1. Verify `DATABASE_URL` is correct and accessible
2. Check if PostgreSQL is running (if local)
3. Verify SSL mode matches your database (production DBs usually need SSL)
4. Test connection: `psql $DATABASE_URL`

---

### **Issue: Exercise Images Not Loading**

**Symptom**: Exercise cards show placeholder images

**Solution**:
1. Check if AWS credentials are set in `.env.local`
2. Verify bucket name is correct
3. Verify credentials have S3 read permissions
4. Check browser console for S3 errors

**Workaround**: Exercise library works without images (graceful degradation)

---

### **Issue: "Module not found" Error**

**Symptom**: Import errors for new dependencies

**Solution**:
```bash
# Delete node_modules and reinstall
rm -rf node_modules
npm install

# Or try clearing Next.js cache
rm -rf .next
npm run dev
```

---

### **Issue: Build Fails on Netlify**

**Symptom**: Local build works, Netlify build fails

**Common Causes**:
1. **Missing env vars** in Netlify dashboard
   - Go to: Site Settings → Environment Variables
   - Add all variables from `.env.local`

2. **ESLint errors**:
   - Netlify runs `next lint` during build
   - Fix lint errors or disable (already configured in next.config.js)

3. **TypeScript errors**:
   - Run `npm run build` locally to catch before pushing
   - Fix type errors

---

## Project Structure Reference

```
ezlift-app-website/
├── app/                    # Next.js App Router pages
│   ├── (legal)/           # Legal pages group
│   ├── about/             # About page
│   ├── api/               # API routes
│   │   ├── auth/          # Session management
│   │   └── exercises/     # Exercise library API
│   ├── app/               # 🔐 Protected: Web app area (dashboard, etc.)
│   ├── blog/              # Blog pages
│   ├── contact/           # Contact page
│   ├── exercise-library/  # Exercise library
│   ├── login/             # Login page
│   ├── signup/            # Signup page
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── auth/              # Auth components (LoginForm, SignupForm, etc.)
│   ├── dashboard/         # 🆕 Dashboard cards (to be created)
│   ├── exercise/          # Exercise library components (reuse for Program Builder)
│   ├── ui/                # shadcn/ui primitives (40+ components)
│   └── ...
├── lib/                   # Utilities and services
│   ├── api/               # 🆕 API client (to be created)
│   ├── auth/              # Auth helpers (session, guards)
│   ├── services/          # Data services (database, s3, contentful)
│   └── ...
├── docs/                  # 📚 All documentation
│   ├── prd/               # Product requirements (15 sections)
│   ├── architecture/      # Architecture docs
│   │   ├── web-app/       # 25 sharded sections
│   │   └── brownfield-public-website.md
│   ├── ux-design-brief.md
│   ├── wireframes.md
│   └── ...
├── middleware.ts          # Route protection (auth guards)
├── .env.local             # Your local environment variables
└── package.json           # Dependencies
```

---

## Key Architecture Documents

**Before Starting Any Story**:
1. Read your story file: `docs/stories/1.x.*.story.md`
2. Reference architecture: `docs/architecture/web-app/index.md`
3. Check wireframes: `docs/wireframes.md`

**During Development**:
- **API Details**: `docs/architecture/web-app/api-integration-mvp.md`
- **Component Patterns**: `docs/architecture/web-app/component-architecture.md`
- **State Management**: `docs/architecture/web-app/state-management.md`
- **Testing**: `docs/architecture/web-app/testing-strategy.md`

---

## Getting Help

### **Documentation**:
- **README**: `docs/README.md` (navigation guide)
- **PRD**: `docs/prd/index.md` (requirements)
- **Architecture**: `docs/architecture/web-app/index.md` (technical specs)
- **UX Design**: `docs/ux-design-brief.md` (design system)

### **Questions**:
- Technical architecture: Ask Winston (Architect)
- Product requirements: Ask Belal (Product Owner)
- UX/design: Ask Sally (UX Expert)
- Story clarification: Ask Bob (Scrum Master)

### **Useful Commands**:
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run linter
npm run generate-sitemap  # Generate sitemap
```

---

## What's Next

After setup is complete:
1. ✅ Verify all tests pass
2. ✅ Read your assigned story file
3. ✅ Reference architecture sections as needed
4. ✅ Begin implementation
5. ✅ Follow development workflow above

**Happy coding!** 🚀

