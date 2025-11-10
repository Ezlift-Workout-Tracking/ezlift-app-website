# Deployment Strategy

## Environment Variables (Netlify)

**New Variables for Web App**:
```env
# Analytics
NEXT_PUBLIC_AMPLITUDE_API_KEY=your_amplitude_key
# GA key already exists

# Backend API (optional override)
NEXT_PUBLIC_BACKEND_API=https://ezlift-server-production.fly.dev

# Feature Flags (Phase 2)
NEXT_PUBLIC_USE_WATERMELON=false  # true when migrating
```

## Build Configuration

**No Changes**: Same build process as public website
```bash
npm run generate-sitemap
npm run build
```

## Monitoring

**Metrics to Track**:
- Dashboard page load times (LCP, INP)
- API request failures (backend errors)
- CSV import success rate
- Analytics event delivery rate
- User session duration

**Tools**:
- Google Analytics (built-in)
- Amplitude (user behavior)
- Netlify Analytics (traffic, performance)
- Browser DevTools (Core Web Vitals)

---
