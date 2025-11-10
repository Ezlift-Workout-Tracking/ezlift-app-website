# Amplitude Integration Guide

**Project**: ezlift-website  
**Project ID**: 100016347  
**Created**: 2025-01-10  
**Environment**: Production & Development

---

## Credentials

**API Key** (Public - safe to use in client-side code):
```
bc567f65128dc624a565d42c6e269381
```

**Secret Key** (Private - server-side only, NOT IN CLIENT CODE):
```
a5d3016df5ebb24d75e1d8e080daf2ed
```

**URL Scheme** (Mobile Deep Linking):
```
amp-991aad3dd7a6ba6b
```

**⚠️ Security Note**: API Key is public (goes in `NEXT_PUBLIC_*` env var). Secret Key must NEVER be in client code.

---

## Environment Variable Setup

### Local Development (`.env.local`)

```env
# Amplitude Analytics
NEXT_PUBLIC_AMPLITUDE_API_KEY=bc567f65128dc624a565d42c6e269381
```

### Netlify Production

**Add Environment Variable**:
1. Go to: Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Click "Add a variable"
3. **Key**: `NEXT_PUBLIC_AMPLITUDE_API_KEY`
4. **Value**: `bc567f65128dc624a565d42c6e269381`
5. Click "Create variable"
6. Trigger rebuild (or variable will apply on next deploy)

---

## Implementation

### Initialize Amplitude

**File**: `lib/analytics/amplitude.ts` (to be created in Story 1.1)

```typescript
import * as amplitude from '@amplitude/analytics-browser';

export function initializeAmplitude() {
  const apiKey = process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY;
  
  if (!apiKey) {
    console.warn('Amplitude API key not configured');
    return;
  }
  
  amplitude.init(apiKey, {
    defaultTracking: {
      sessions: true,        // Track sessions automatically
      pageViews: false,      // We'll track manually
      formInteractions: false,
      fileDownloads: false
    }
  });
  
  console.log('Amplitude initialized');
}
```

### Track Events

**File**: `lib/analytics/tracker.ts` (to be created in Story 1.1)

```typescript
import * as amplitude from '@amplitude/analytics-browser';

export const analytics = {
  track(eventName: string, properties?: Record<string, any>) {
    // Track in Amplitude
    if (amplitude.isInitialized()) {
      amplitude.track(eventName, properties);
    }
    
    // Also track in GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }
  },
  
  identify(userId: string, traits?: Record<string, any>) {
    if (amplitude.isInitialized()) {
      amplitude.setUserId(userId);
      if (traits) {
        amplitude.setUserProperties(traits);
      }
    }
  }
};
```

### Usage Example

```typescript
// In React component
import { analytics } from '@/lib/analytics/tracker';

function DashboardPage() {
  useEffect(() => {
    analytics.track('Dashboard Viewed', {
      hasData: true,
      cardsDisplayed: ['volume', 'prs', 'recent', 'progress', 'program']
    });
  }, []);
  
  return <Dashboard />;
}
```

---

## Verify Integration

### Test Event Delivery

**After implementing analytics in Story 1.1**:

1. **Fire Test Event**:
```typescript
analytics.track('Test Event', {
  testProperty: 'test value',
  timestamp: new Date().toISOString()
});
```

2. **Check Amplitude Dashboard**:
   - Go to: https://analytics.amplitude.com
   - Login with your account
   - Select project: "ezlift-website"
   - Go to: User Look-Up or Events tab
   - Search for "Test Event"
   - ✅ Verify event appears with properties

3. **Verify Session Tracking**:
   - Amplitude auto-tracks sessions
   - Check "Active Users" chart
   - Should show your test session

---

## Event Taxonomy (50+ Events)

**All events documented in**: `docs/architecture/web-app/analytics-integration.md`

**Categories**:
1. Authentication (signup, login, logout)
2. User Data State (detection, blocking)
3. Onboarding (9 steps, all tracked)
4. Dashboard (card views, clicks, filters)
5. Program Builder (exercises added, program saved)
6. Import (CSV uploaded, parsed, imported)
7. History (viewed, filtered)
8. Profile (updated)

**Example Events**:
```typescript
// Onboarding
analytics.track('Onboarding Started', { totalSteps: 9 });
analytics.track('Onboarding Step Completed', { step: 1, stepName: 'Personal Info' });

// Dashboard
analytics.track('Dashboard Viewed', { hasData: true });
analytics.track('Dashboard Card Clicked', { cardType: 'volume' });

// Program Builder
analytics.track('Program Saved', { 
  workoutCount: 3, 
  exerciseCount: 15, 
  timeToBuild: 420 
});
```

---

## Privacy & Compliance

**PII Protection**:
- ❌ Never send: Email addresses, full names, IP addresses
- ✅ OK to send: User IDs (hashed), anonymous behavior data
- ✅ Anonymize: Workout titles, exercise names (use IDs)

**Cookie Consent**:
- Amplitude tracking only enabled if user accepts analytics cookies
- Implemented in cookie banner component

**GDPR Compliance**:
- User can opt-out via cookie preferences
- Data retention: Follow Amplitude defaults (or configure)

---

## Amplitude Dashboard Setup

### Recommended Charts (Post-Launch)

**User Engagement**:
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Session duration
- Sessions per user

**Conversion Funnels**:
1. Signup → Onboarding Started → Onboarding Completed → Dashboard Viewed
2. Dashboard Viewed → Import Started → Import Completed
3. Onboarding → Program Builder Opened → Program Saved

**Retention**:
- Day 1, Day 7, Day 30 retention cohorts
- Feature usage over time

**Key Metrics**:
- Onboarding completion rate (target: ≥ 70%)
- Import completion rate (target: ≥ 60%)
- Dashboard engagement (card views, interactions)

---

## Troubleshooting

### Events Not Appearing in Amplitude

**Check**:
1. API key correct in environment variables?
2. Amplitude initialized before tracking events?
3. Browser console errors?
4. Network tab shows requests to `api2.amplitude.com`?

**Debug**:
```typescript
// Enable debug mode
amplitude.init(apiKey, {
  logLevel: amplitude.Types.LogLevel.Debug
});
```

### Events Delayed

**Normal**: Amplitude batches events (sends every ~30 seconds)

**Flush Immediately** (for testing):
```typescript
await amplitude.flush();
```

---

## Next Steps

1. ✅ API key added to DEVELOPER_SETUP.md
2. ⏭️ **Belal**: Add API key to Netlify environment variables
3. ⏭️ **Developer**: Implement analytics client in Story 1.1
4. ⏭️ **Developer**: Test event delivery
5. ⏭️ **Belal**: Set up Amplitude dashboards post-launch

---

**BLOCKER #3 RESOLVED!** Analytics integration is now unblocked. 🎉



