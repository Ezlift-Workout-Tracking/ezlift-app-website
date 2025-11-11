# Performance Strategy

## Performance Budgets

**Page Load**:
- Dashboard LCP: < 2.0s (p75)
- History List LCP: < 2.5s (p75)
- Program Builder LCP: < 3.0s (p75) - More complex UI acceptable

**Interactivity**:
- Dashboard card interactions: < 100ms
- Filter changes: < 200ms to update UI
- Form inputs: < 50ms response (optimistic updates)

**Data Fetching**:
- Initial dashboard render: < 1.5s (with SSR)
- Background refetch: < 500ms
- Chart rendering: < 200ms after data available

## Optimization Techniques

**1. Code Splitting**:
```typescript
// Lazy load heavy components
const ProgramBuilder = dynamic(
  () => import('@/components/programs/ProgramBuilder'),
  { 
    loading: () => <Skeleton className="h-screen" />,
    ssr: false  // Client-only for builder
  }
);

const ImportFlow = dynamic(
  () => import('@/components/import/ImportFlow'),
  { ssr: false }
);
```

**2. Chart Lazy Loading**:
```typescript
const RechartsBarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
);
```

**3. Data Pagination**:
- Workout history: 20 sessions per page
- Infinite scroll for charts (load more data on scroll)
- Virtual scrolling for large lists (react-window if needed)

**4. Image Optimization**:
- Exercise images: Already optimized via S3 + Contentful
- Dashboard: No heavy images, chart SVGs only
- Use Next.js `<Image>` for any new images

**5. Bundle Size Management**:
```bash
# Check bundle size
npm run build
# Analyze: Look for large dependencies

# Potential optimizations:
# - Tree-shake Recharts (import only used components)
# - Defer analytics scripts (load after page interactive)
# - Lazy load PapaParse for import flow
```

---
