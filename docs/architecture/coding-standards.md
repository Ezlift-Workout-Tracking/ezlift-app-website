# Coding Standards - EzLift Web App

**Version**: 1.0  
**Last Updated**: 2025-01-10  
**Architect**: Winston

---

## Language & Framework Standards

### TypeScript

**Configuration**: `tsconfig.json` (strict mode enabled)

**Rules**:
- ✅ Use strict TypeScript (no `any` types)
- ✅ Explicit return types for functions
- ✅ Interface over type for object shapes
- ✅ Avoid `as` type assertions (use type guards)

**Example**:
```typescript
// ✅ Good
interface UserProfile {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<UserProfile> {
  return api.get<UserProfile>(`/api/user/${id}`);
}

// ❌ Avoid
function getUser(id: any): any {
  return api.get(`/api/user/${id}`);
}
```

---

### React & Next.js

**Component Patterns**:

**Server Components** (default):
```typescript
// app/dashboard/page.tsx
export default async function DashboardPage() {
  // Fetch data server-side
  const user = await getUser();
  const sessions = await getSessions();
  
  // Pass to client component
  return <DashboardClient initialData={{ user, sessions }} />;
}
```

**Client Components** (when needed):
```typescript
// components/dashboard/DashboardClient.tsx
'use client';

export function DashboardClient({ initialData }) {
  const [state, setState] = useState(initialData);
  // ... interactivity
}
```

**When to Use Each**:
- **Server Component**: Data fetching, SEO, static content
- **Client Component**: Interactivity, state, event handlers, React hooks

---

### File Naming

**Components**: PascalCase
```
components/dashboard/TrainingVolumeCard.tsx
components/programs/ProgramBuilder.tsx
```

**Utilities/Helpers**: camelCase
```
lib/api/client.ts
lib/utils/formatDate.ts
hooks/useUserDataState.ts
```

**Pages** (App Router): kebab-case
```
app/dashboard/page.tsx
app/exercise-library/page.tsx
app/onboarding/[step]/page.tsx
```

**Types**: PascalCase with `.ts` extension
```
types/workout.ts
types/session.ts
```

---

## Code Organization

### Import Order

```typescript
// 1. React/Next imports
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { useQuery } from '@tanstack/react-query';
import { parse } from 'papaparse';

// 3. Internal utilities
import { api } from '@/lib/api/client';
import { analytics } from '@/lib/analytics/tracker';

// 4. Components
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

// 5. Types
import type { Workout, Session } from '@/types';

// 6. Styles (if any)
import styles from './styles.module.css';
```

---

### Component Structure

```typescript
// 1. Imports
import { ... };

// 2. Types/Interfaces
interface ComponentProps {
  title: string;
  data: any[];
}

// 3. Component
export function Component({ title, data }: ComponentProps) {
  // 3a. Hooks
  const router = useRouter();
  const [state, setState] = useState();
  
  // 3b. Derived state
  const processedData = useMemo(() => process(data), [data]);
  
  // 3c. Effects
  useEffect(() => {
    // Side effects
  }, []);
  
  // 3d. Event handlers
  const handleClick = () => {
    // Handle event
  };
  
  // 3e. Early returns
  if (!data) return <LoadingState />;
  
  // 3f. Render
  return (
    <div>
      {/* JSX */}
    </div>
  );
}

// 4. Sub-components (if small and only used here)
function SubComponent() {
  return <div>...</div>;
}
```

---

## Styling

### Tailwind CSS

**Preferred Approach**: Use Tailwind utility classes

```typescript
<div className="flex items-center justify-between p-4 rounded-lg bg-white shadow-sm">
  <h2 className="text-2xl font-bold text-gray-900">Title</h2>
  <Button>Action</Button>
</div>
```

**Utility Function** (for conditional classes):
```typescript
import { cn } from '@/lib/utils';

<div className={cn(
  "base classes",
  isActive && "active classes",
  variant === 'primary' && "primary classes"
)}>
```

**Component Variants** (shadcn/ui pattern):
```typescript
import { cva } from 'class-variance-authority';

const buttonVariants = cva(
  "base-classes",
  {
    variants: {
      variant: {
        default: "bg-primary text-white",
        outline: "border border-primary"
      },
      size: {
        sm: "px-3 py-1.5 text-sm",
        md: "px-4 py-2 text-base"
      }
    }
  }
);
```

---

## State Management

### React Query (for server state)

**Configuration**: See `docs/architecture/web-app/state-management.md`

**Pattern**:
```typescript
// hooks/api/useWorkouts.ts
export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => api.get('/api/workout'),
    staleTime: 5 * 60 * 1000  // 5 minutes
  });
}

// Usage in component
function Component() {
  const { data, isLoading, error } = useWorkouts();
  
  if (isLoading) return <Skeleton />;
  if (error) return <Error error={error} />;
  
  return <WorkoutList workouts={data} />;
}
```

**Mutations**:
```typescript
export function useCreateWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (workout) => api.post('/api/workout', workout),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      toast.success('Workout created!');
    }
  });
}
```

---

### React State (for UI state)

```typescript
// Local component state
const [isOpen, setIsOpen] = useState(false);

// Derived state (use useMemo for expensive computations)
const sortedData = useMemo(() => {
  return data.sort((a, b) => a.name.localeCompare(b.name));
}, [data]);

// URL state (for filters, pagination)
const searchParams = useSearchParams();
const page = Number(searchParams.get('page') || '1');
```

---

## Error Handling

### API Errors

```typescript
try {
  const data = await api.get('/api/workout');
  return data;
} catch (error) {
  if (error.status === 401) {
    // Session expired
    router.push('/login');
  } else if (error.status >= 500) {
    toast.error('Server error. Please try again.');
  } else {
    toast.error(error.message || 'An error occurred');
  }
  throw error; // Re-throw for React Query to handle
}
```

### Error Boundaries

```typescript
// components/ErrorBoundary.tsx
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<Props> {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return this.props.fallback || <DefaultErrorUI />;
    }
    return this.props.children;
  }
}

// Usage
<ErrorBoundary fallback={<ErrorFallback />}>
  <DashboardCards />
</ErrorBoundary>
```

---

## Performance

### Code Splitting

**Lazy Load Heavy Components**:
```typescript
import dynamic from 'next/dynamic';

const ProgramBuilder = dynamic(
  () => import('@/components/programs/ProgramBuilder'),
  { 
    loading: () => <Skeleton className="h-screen" />,
    ssr: false  // Client-only component
  }
);
```

**Lazy Load Libraries**:
```typescript
// Only load Recharts when needed
const BarChart = dynamic(
  () => import('recharts').then(mod => mod.BarChart),
  { ssr: false }
);
```

---

### Memoization

**useMemo** (for expensive computations):
```typescript
const aggregatedData = useMemo(() => {
  return sessions.reduce((acc, session) => {
    // Expensive aggregation logic
    return acc;
  }, {});
}, [sessions]);  // Only recompute when sessions change
```

**useCallback** (for stable function references):
```typescript
const handleSubmit = useCallback((data) => {
  // Submit logic
}, [/* dependencies */]);
```

---

## Testing

### Unit Tests

**Location**: `__tests__/` folder (mirrors `src/` structure)

**Naming**: `ComponentName.test.tsx` or `functionName.test.ts`

**Pattern**:
```typescript
import { render, screen } from '@testing-library/react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';

describe('DashboardCard', () => {
  it('renders with title and content', () => {
    render(
      <DashboardCard title="Test Card">
        <div>Content</div>
      </DashboardCard>
    );
    
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
  
  it('shows loading skeleton when isLoading=true', () => {
    render(<DashboardCard title="Test" isLoading={true} />);
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
  });
});
```

---

## Analytics

### Event Tracking

**Pattern**:
```typescript
import { analytics } from '@/lib/analytics/tracker';

function Component() {
  useEffect(() => {
    // Track page view on mount
    analytics.track('Page Viewed', {
      page: 'dashboard',
      hasData: true
    });
  }, []);
  
  const handleClick = () => {
    analytics.track('Button Clicked', {
      button: 'create_program',
      location: 'dashboard'
    });
    // ... button logic
  };
}
```

**Event Naming**: Title Case with spaces (Amplitude convention)
- ✅ "Dashboard Viewed"
- ✅ "Program Saved"
- ❌ "dashboard_viewed" or "DASHBOARD_VIEWED"

---

## Comments

### When to Comment

**DO Comment**:
- ✅ Complex business logic (e.g., est 1RM formula)
- ✅ Non-obvious workarounds
- ✅ TODO items with context
- ✅ Public API functions (JSDoc)

```typescript
/**
 * Calculate estimated 1-rep max using Epley formula
 * Formula: weight × (1 + reps/30)
 * 
 * @param weight - Weight lifted in kg or lbs
 * @param reps - Number of repetitions performed
 * @returns Estimated 1RM in same units as weight
 */
function calculateEst1RM(weight: number, reps: number): number {
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}
```

**DON'T Comment**:
- ❌ Obvious code (let code be self-documenting)
- ❌ What code does (code should be clear)
- ✅ Instead: Why code does it (intent)

---

## Git Commit Messages

**Format**:
```
Story 1.X: Brief description of change

- Bullet point of what changed
- Another change
- Reference to architecture section if applicable
```

**Examples**:
```
Story 1.1: Create authenticated layout with top navigation

- Add AuthenticatedNav component
- Implement hamburger menu for mobile
- Add logout functionality
- Reference: architecture/web-app/component-architecture.md

Story 1.4: Implement Training Volume Card with client-side aggregation

- Create TrainingVolumeCard component
- Implement weekly aggregation logic (Epley formula)
- Add Recharts BarChart visualization
- Add skeleton loading state
- Performance tested: < 100ms for 300 sessions
```

---

## Security

### Never Commit Secrets

**❌ NEVER commit**:
- API keys (Firebase, Amplitude, AWS)
- Database credentials
- Secret keys
- .env.local file

**✅ Instead**:
- Use environment variables
- Document required vars in DEVELOPER_SETUP.md
- Use .env.example for templates (no real values)

### Client vs Server

**Client-Side (Public)**: Can include in `NEXT_PUBLIC_*` vars
- ✅ Firebase API key (public)
- ✅ Amplitude API key (public)

**Server-Side (Private)**: Regular env vars
- ❌ Database credentials
- ❌ AWS secret keys
- ❌ Amplitude secret key

---

## Accessibility

### Required

**Semantic HTML**:
```typescript
// ✅ Good
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/dashboard">Dashboard</a></li>
  </ul>
</nav>

// ❌ Avoid
<div onClick={goToDashboard}>Dashboard</div>
```

**ARIA Labels**:
```typescript
<button aria-label="Close dialog">
  <X className="h-4 w-4" />
</button>

<input 
  type="text" 
  aria-label="Search exercises"
  placeholder="Search..."
/>
```

**Keyboard Navigation**:
- All interactive elements focusable
- Tab order logical
- Enter/Space activate buttons
- Escape closes modals

---

## Component Reuse (CRITICAL for MVP)

### **DO Reuse Existing Components**:

**From Public Website** (already tested in production):
- ✅ `components/ui/*` - All shadcn/ui primitives
- ✅ `components/exercise/ExerciseCard.tsx` - **MUST REUSE in Program Builder**
- ✅ `components/exercise/DebouncedSearchInput.tsx` - **MUST REUSE**
- ✅ `components/exercise/ExerciseFilters.tsx` - **MUST REUSE**
- ✅ `components/auth/*` - Login/Signup forms (already working)

**Why Reuse**:
- ✅ Already tested and working
- ✅ Consistent UX across site
- ✅ Faster development
- ✅ Less code to maintain

**How to Verify Reuse**:
```typescript
// In your new component
import { ExerciseCard } from '@/components/exercise/ExerciseCard';

// Use it directly - don't rebuild it!
<ExerciseCard exercise={exercise} onSelect={handleSelect} />
```

---

## Linting

**ESLint**: Configured in `.eslintrc.json` (Next.js defaults)

**Run Linter**:
```bash
npm run lint
```

**Auto-Fix**:
```bash
npm run lint -- --fix
```

**Pre-Commit**: Run linter before committing

---

## Documentation

### Code Documentation

**JSDoc for Public Functions**:
```typescript
/**
 * Aggregate workout sessions by week
 * 
 * @param sessions - Array of workout sessions
 * @param startDate - Start of date range
 * @param endDate - End of date range
 * @returns Array of weekly aggregations
 */
export function aggregateByWeek(
  sessions: WorkoutSession[],
  startDate: Date,
  endDate: Date
): WeeklyData[] {
  // Implementation
}
```

### Story Documentation

**Update Story File** (as developer):
- Mark tasks complete: `- [x] Task description`
- Add to Debug Log: Any issues encountered
- Add to Completion Notes: What was implemented
- Update File List: All files created/modified

---

## Best Practices Summary

**DO**:
- ✅ Use TypeScript strictly (no `any`)
- ✅ Server Components for data fetching
- ✅ React Query for API state management
- ✅ Reuse existing components (ExerciseCard, DebouncedSearchInput, etc.)
- ✅ Track analytics on user actions
- ✅ Handle errors gracefully (toast notifications)
- ✅ Test performance with realistic data (100-500 sessions)
- ✅ Follow file naming conventions
- ✅ Keep imports organized

**DON'T**:
- ❌ Use `any` type
- ❌ Commit secrets or API keys
- ❌ Rebuild components that already exist
- ❌ Skip error handling
- ❌ Forget analytics tracking
- ❌ Ignore performance (test aggregations!)
- ❌ Mix client/server component patterns incorrectly

---

**Reference**: Complete architecture in `docs/architecture/web-app/`



