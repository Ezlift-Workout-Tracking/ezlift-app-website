# Analytics Integration

## Event Tracking Strategy

**Two Providers**:
1. **Google Analytics 4** (GA4) - General web analytics, traffic sources
2. **Amplitude** - Detailed user behavior, product analytics, funnels

**Unified Interface**:

```typescript
// lib/analytics/tracker.ts
interface EventProperties {
  [key: string]: string | number | boolean | undefined;
}

class AnalyticsTracker {
  track(eventName: string, properties?: EventProperties) {
    // Send to GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, properties);
    }
    
    // Send to Amplitude
    if (amplitude.isInitialized()) {
      amplitude.track(eventName, properties);
    }
  }
  
  identify(userId: string, traits?: Record<string, any>) {
    amplitude.setUserId(userId);
    if (traits) {
      amplitude.setUserProperties(traits);
    }
  }
  
  page(pageName: string, properties?: EventProperties) {
    // GA handles page views automatically
    // Amplitude needs explicit page tracking
    this.track('Page Viewed', { page: pageName, ...properties });
  }
}

export const analytics = new AnalyticsTracker();
```

## Event Taxonomy

**Authentication Events**:
```
User Signed Up
  - method: 'email' | 'google' | 'apple'
  - source: 'web'

User Logged In
  - method: 'email' | 'google' | 'apple'

User Logged Out
```

**Onboarding Events**:
```
Onboarding Started

Onboarding Step Completed
  - step: 1-9
  - stepName: 'Personal Info' | 'Training Frequency' | ...

Onboarding Question Answered
  - step: number
  - question: 'gender' | 'frequency' | 'goals' | ...
  - answer: string | string[]  // Multi-select = array

Onboarding Skipped
  - lastStep: number

Onboarding Completed (NEW USERS ONLY)
  - userState: 'new'
  - completedSteps: 9
  - programSetup: 'selected' | 'created' | 'skipped'
```

**Dashboard Events**:
```
Dashboard Viewed
  - hasData: boolean
  - cardsDisplayed: string[]  // ['volume', 'prs', 'recent', ...]

Dashboard Card Viewed
  - cardType: 'volume' | 'prs' | 'recent' | 'progress' | 'program'
  - hasData: boolean

Dashboard Card Clicked
  - cardType: string
  - action: 'view_detail' | 'drill_down'

Dashboard Filter Changed
  - filterType: 'dateRange'
  - value: '7days' | '30days' | '90days' | 'all'

Dashboard Card CTA Clicked
  - cardType: string
  - ctaAction: 'import' | 'create_program' | 'log_workout'
```

**Program Builder Events**:
```
Program Builder Opened
  - source: 'onboarding' | 'dashboard' | 'programs_page'

Program Exercise Added
  - exerciseId: string
  - exerciseName: string
  - workoutIndex: number

Program Exercise Removed
  - exerciseId: string

Program Set Added
  - exerciseId: string
  - setConfig: { reps, weight, etc. }

Program Saved
  - workoutCount: number
  - exerciseCount: number
  - totalSets: number
  - timeToBuild: number  // seconds

Program Builder Abandoned
  - progress: number  // 0-100%
  - abandonReason: 'back_button' | 'timeout' | 'error'
```

**Import Events**:
```
Import Started
  - source: 'hevy' | 'strong'

Import CSV Uploaded
  - fileSize: number
  - rowCount: number

Import Parsed
  - workoutsFound: number
  - exercisesFound: number
  - setsFound: number
  - unmappedExercises: number

Import Confirmed
  - workoutsToImport: number

Import Progress
  - current: number
  - total: number

Import Completed
  - workoutsImported: number
  - timeToComplete: number  // seconds
  - errors: number

Import Failed
  - error: string
  - stage: 'upload' | 'parse' | 'match' | 'create'
```

**History Events**:
```
History Viewed
  - workoutCount: number

History Filtered
  - filterType: 'date' | 'exercise' | 'muscleGroup'
  - value: string

History Paginated
  - page: number

Workout Detail Viewed
  - workoutId: string
  - sessionDate: string
```

**Profile Events**:
```
Profile Viewed

Profile Updated
  - fields: string[]  // ['weightUnit', 'bodyweight']

Settings Changed
  - setting: string
  - oldValue: any
  - newValue: any
```

## Analytics Initialization

```typescript
// lib/analytics/init.ts
import * as amplitude from '@amplitude/analytics-browser';

export function initializeAnalytics() {
  // Initialize Amplitude
  amplitude.init(process.env.NEXT_PUBLIC_AMPLITUDE_API_KEY!, {
    defaultTracking: {
      sessions: true,
      pageViews: false,  // We'll track manually
      formInteractions: false,
      fileDownloads: false
    }
  });
  
  // GA4 already initialized in layout.tsx
}

// Call in root layout after user authentication
useEffect(() => {
  if (user) {
    initializeAnalytics();
    analytics.identify(user.id, {
      email: user.email,
      name: user.name
    });
  }
}, [user]);
```

## Privacy & Consent

**Cookie Consent Integration**:
```typescript
// Only track if user accepted cookies
if (cookieConsent.analytics) {
  analytics.track('Dashboard Viewed');
}
```

**PII Protection**:
- ❌ Never send: Email, full name, IP address
- ✅ OK to send: User ID (hashed), anonymous usage patterns
- ✅ Anonymize: Exercise names (send IDs not names), workout titles

---
