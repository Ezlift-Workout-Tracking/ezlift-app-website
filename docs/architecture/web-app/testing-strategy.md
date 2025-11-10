# Testing Strategy

## Unit Tests

**What to Test**:
- Client-side aggregation functions (volume, PRs, progress)
- CSV parsing logic (Hevy format → WorkoutSession objects)
- Exercise fuzzy matching (MiniSearch integration)
- Date formatting utilities
- Analytics event tracking (mock Amplitude/GA)

**Framework**: Jest (already configured in public website)

**Example**:
```typescript
// __tests__/aggregations/weeklyVolume.test.ts
import { aggregateByWeek } from '@/lib/stats/aggregations';

describe('aggregateByWeek', () => {
  it('groups sessions by week correctly', () => {
    const sessions = [
      { sessionDate: '2025-01-06', logs: [...] },
      { sessionDate: '2025-01-08', logs: [...] },
      { sessionDate: '2025-01-13', logs: [...] }  // Different week
    ];
    
    const result = aggregateByWeek(sessions);
    
    expect(result).toHaveLength(2);  // 2 weeks
    expect(result[0].totalSets).toBe(/* expected */);
  });
});
```

## Integration Tests

**What to Test**:
- Dashboard renders with real data
- Import flow end-to-end (upload CSV → create sessions)
- Program builder saves program correctly
- Profile updates persist

**Framework**: Testing Library + MSW (Mock Service Worker)

**Example**:
```typescript
// __tests__/integration/dashboard.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/logs', (req, res, ctx) => {
    return res(ctx.json({ sessions: mockSessions }));
  })
);

test('dashboard loads and displays training volume', async () => {
  render(<DashboardPage />);
  
  await waitFor(() => {
    expect(screen.getByText('Training Volume')).toBeInTheDocument();
    expect(screen.getByText('45 sets this week')).toBeInTheDocument();
  });
});
```

## E2E Tests (Optional for MVP)

**Tool**: Playwright or Cypress

**Critical Flows**:
- Signup → Onboarding → Dashboard (happy path)
- Import CSV → View imported sessions in history
- Create program → See in programs list

---

## Performance Testing

### Dashboard Aggregation Performance

**Why Critical**: Dashboard cards compute stats client-side (weekly volume, PRs, progress). Must verify performance with realistic data volumes.

**Test Scenarios**:

**1. Typical User** (100 workout sessions, ~500 sets total):
- **Target**: Aggregation < 50ms
- **Test**: Load dashboard with 100 sessions from last 3 months
- **Measure**: Time from data fetch complete to chart render
- **Device**: Desktop (modern CPU)

**2. Active User** (300 workout sessions, ~1,500 sets):
- **Target**: Aggregation < 100ms
- **Test**: Load dashboard with 300 sessions from last year
- **Measure**: Weekly volume aggregation + PR calculation time
- **Device**: Desktop (modern CPU)

**3. Power User** (500 workout sessions, ~2,500 sets):
- **Target**: Aggregation < 200ms
- **Test**: Load dashboard with 500 sessions (all-time data)
- **Measure**: All dashboard card aggregations combined
- **Device**: Low-end simulation (CPU throttling 6x in DevTools)

**Test Environment**:
```bash
# Chrome DevTools → Performance Tab
# 1. Set CPU throttling to 6x slowdown
# 2. Record performance profile
# 3. Load dashboard
# 4. Measure JavaScript execution time for aggregation functions
```

**Failure Thresholds**:
- **Warning**: > 100ms for typical user (100 sessions)
- **Concern**: > 200ms for active user (300 sessions)
- **Block Release**: > 500ms for power user (500 sessions)

**Mitigation If Tests Fail**:
1. Implement date range limits (default to 30 days)
2. Add pagination to session fetching
3. Optimize aggregation algorithms (memoization, indexing)
4. Consider backend aggregation endpoints (Phase 2 or post-MVP)

---

### Mobile Web Performance Testing

**Test Devices**:
- iPhone Safari (iOS 16+)
- Chrome Mobile (Android 12+)
- Tablet (iPad, Android tablet)

**Test Scenarios**:
- Touch targets ≥ 44px
- Cards stack properly on mobile
- Charts render correctly on small screens
- No horizontal scrolling
- Responsive breakpoints work (640px, 1024px)

**Tools**:
- Chrome DevTools device emulation
- Real device testing (recommended)
- Lighthouse mobile audit

---

### Performance Acceptance Criteria (Story 1.4)

**Add to Story 1.4 (Training Volume Card)**:
```markdown
7. Performance: Weekly volume aggregation completes in < 100ms for 30 days of data (tested on CPU-throttled device 6x)
8. Performance: Aggregation for 500 sessions completes in < 200ms
9. Performance test executed with realistic data volumes (100, 300, 500 sessions)
10. Performance results documented in story completion notes
```

---
