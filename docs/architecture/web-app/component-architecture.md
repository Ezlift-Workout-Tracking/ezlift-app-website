# Component Architecture

## Page Structure

```
app/
├── app/                         # Secure web app area
│   ├── layout.tsx              # Authenticated layout (sidebar/nav)
│   ├── page.tsx                # Dashboard (main landing after login)
│   ├── history/
│   │   └── page.tsx            # Workout history list
│   ├── programs/
│   │   ├── page.tsx            # Program list
│   │   ├── [id]/
│   │   │   └── page.tsx        # Program detail
│   │   └── create/
│   │       └── page.tsx        # Program builder
│   ├── import/
│   │   └── page.tsx            # Import flow
│   ├── profile/
│   │   └── page.tsx            # Profile management
│   └── onboarding/
│       ├── [step]/
│       │   └── page.tsx        # Onboarding steps (1-9)
│       └── layout.tsx          # Onboarding layout (progress bar)
```

## Reused Components (From Public Website)

**UI Primitives** (all from `components/ui/`):
- ✅ `button.tsx`, `card.tsx`, `input.tsx`, `select.tsx`
- ✅ `dialog.tsx`, `toast.tsx`, `skeleton.tsx`, `table.tsx`
- ✅ `tabs.tsx`, `pagination.tsx`, `progress.tsx`
- ✅ 30+ other Radix-based primitives

**Feature Components**:
- ✅ `exercise/ExerciseCard.tsx` - **Reuse in Program Builder**
- ✅ `exercise/DebouncedSearchInput.tsx` - **Reuse for exercise search**
- ✅ `exercise/ExerciseFilters.tsx` - **Reuse for muscle group filtering**
- ✅ `auth/*` - Login, signup, logout components

**Utilities**:
- ✅ `animations/FadeIn.tsx` - Page transitions
- ✅ `animations/ScrollAnimation.tsx` - Scroll effects

## New Components (Web App Specific)

### Dashboard Components

```
components/
├── dashboard/
│   ├── DashboardShell.tsx          # Main dashboard layout (grid/stack)
│   ├── DashboardCard.tsx           # Base card component
│   ├── TrainingVolumeCard.tsx      # Bar chart of weekly/monthly volume
│   ├── PersonalRecordsCard.tsx     # List of recent PRs
│   ├── RecentWorkoutsCard.tsx      # Last 3-5 sessions preview
│   ├── ProgressChartCard.tsx       # Line chart for exercise progress
│   ├── ActiveProgramCard.tsx       # Current program summary
│   ├── DateRangeFilter.tsx         # Global date range selector
│   └── EmptyDashboard.tsx          # Empty state with CTAs
```

**Dashboard Card Pattern**:
```typescript
// components/dashboard/DashboardCard.tsx
interface DashboardCardProps {
  title: string;
  icon?: React.ReactNode;
  isLoading?: boolean;
  isEmpty?: boolean;
  emptyState?: React.ReactNode;
  children: React.ReactNode;
  onCardClick?: () => void;
}

export function DashboardCard({ 
  title, 
  icon, 
  isLoading, 
  isEmpty, 
  emptyState,
  children,
  onCardClick 
}: DashboardCardProps) {
  // Fire analytics on mount
  useEffect(() => {
    analytics.track('Dashboard Card Viewed', {
      cardType: title.toLowerCase().replace(/\s/g, '_'),
      hasData: !isEmpty
    });
  }, []);
  
  if (isLoading) {
    return <Skeleton className="h-[300px]" />;
  }
  
  if (isEmpty && emptyState) {
    return (
      <Card className="h-[300px] flex items-center justify-center">
        {emptyState}
      </Card>
    );
  }
  
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition"
      onClick={() => {
        if (onCardClick) {
          analytics.track('Dashboard Card Clicked', { cardType: title });
          onCardClick();
        }
      }}
    >
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
```

### Program Builder Components

**⚠️ MVP Constraint**: Program Builder only accessible to **new users** (no existing data). Existing users see read-only view.

```
components/
├── programs/
│   ├── ProgramBuilder/
│   │   ├── ProgramBuilderShell.tsx     # Main builder layout (NEW USERS ONLY)
│   │   ├── WorkoutEditor.tsx           # Edit single workout
│   │   ├── ExerciseSelector.tsx        # Visual exercise grid (reuses ExerciseCard)
│   │   ├── ExerciseSearchPanel.tsx     # Search + filters (reuses existing)
│   │   ├── SetConfigurator.tsx         # Configure sets for exercise
│   │   ├── MetricsPanel.tsx            # Real-time metrics (muscles, duration)
│   │   ├── WorkoutFlowNav.tsx          # Workout 1 → 2 → 3 → Overview
│   │   └── ProgramOverview.tsx         # Final preview before save
│   ├── ProgramBuilderGate.tsx          # Data state check + read-only message
│   ├── ProgramCard.tsx                 # Program list item
│   ├── ProgramDetailView.tsx           # View program structure (ALL USERS)
│   └── ReadOnlyProgramView.tsx         # View-only for existing users
```

**Program Builder Gate Logic**:
```typescript
// components/programs/ProgramBuilderGate.tsx
export function ProgramBuilderGate({ children }: { children: React.ReactNode }) {
  const { data: userState, isLoading } = useUserDataState();
  
  if (isLoading) {
    return <ProgramBuilderSkeleton />;
  }
  
  // Existing user → Block access
  if (userState?.state === 'existing') {
    return <ReadOnlyProgramMessage />;
  }
  
  // Unknown state (error) → Block access (safe default)
  if (userState?.state === 'unknown') {
    return <ReadOnlyProgramMessage />;
  }
  
  // New user → Full access
  return <>{children}</>;
}

// Usage
export default function ProgramBuilderPage() {
  return (
    <ProgramBuilderGate>
      <ProgramBuilder />  {/* Only renders for new users */}
    </ProgramBuilderGate>
  );
}
```

### History Components

```
components/
├── history/
│   ├── WorkoutHistoryList.tsx      # Paginated list
│   ├── WorkoutHistoryItem.tsx      # Single session row
│   ├── WorkoutDetailModal.tsx      # Session detail view
│   ├── HistoryFilters.tsx          # Date range, exercise filters
│   └── HistoryEmptyState.tsx       # No workouts yet CTA
```

### Import Components

```
components/
├── import/
│   ├── ImportFlow.tsx              # Multi-step import wizard
│   ├── CsvUploader.tsx             # File upload component
│   ├── ImportSummary.tsx           # Review before import
│   ├── ImportProgress.tsx          # Progress bar during import
│   ├── ExerciseMappingReview.tsx   # Show unmapped exercises
│   └── ImportSuccess.tsx           # Success screen with stats
```

### Onboarding Components

**⚠️ MVP Constraint**: **Existing users skip ALL onboarding**. Onboarding (all 9 steps) only shown to new users.

```
components/
├── onboarding/
│   ├── OnboardingShell.tsx         # Layout with progress bar (NEW USERS ONLY)
│   ├── OnboardingProgress.tsx      # Step indicator (1 of 9) (NEW USERS ONLY)
│   ├── QuestionCard.tsx            # Question screen template (NEW USERS ONLY)
│   ├── PersonalInfoStep.tsx        # Step 1: Gender, age (NEW USERS ONLY)
│   ├── TrainingFrequencyStep.tsx   # Step 2: Frequency (NEW USERS ONLY)
│   ├── TrainingDurationStep.tsx    # Step 3: Duration (NEW USERS ONLY)
│   ├── ExperienceLevelStep.tsx     # Step 4: Experience (NEW USERS ONLY)
│   ├── GoalsStep.tsx               # Step 5: Multi-select goals (NEW USERS ONLY)
│   ├── EquipmentStep.tsx           # Step 6: Equipment available (NEW USERS ONLY)
│   ├── ProgramSetupStep.tsx        # Step 7: Do you have a program? (NEW USERS ONLY)
│   ├── DescribeProgramStep.tsx     # Step 8a: Text/voice input (NEW USERS ONLY)
│   └── SelectProgramStep.tsx       # Step 8b: Choose from recommendations (NEW USERS ONLY)
```

**Routing Logic** (Simplified):
```typescript
// After login/signup success (BEFORE showing any onboarding)
async function handlePostAuth(userId: string) {
  const userState = await checkUserDataState(userId);
  
  if (userState.state === 'existing') {
    // Existing user: NO onboarding at all
    analytics.track('User Data State Detected', {
      state: 'existing',
      hasWorkouts: userState.hasWorkouts,
      hasSessions: userState.hasSessions,
      redirectTo: 'dashboard_direct'
    });
    
    router.push('/app');  // Direct to dashboard (no stops)
    
  } else {
    // New user: Start full onboarding
    analytics.track('User Data State Detected', {
      state: 'new',
      redirectTo: 'onboarding'
    });
    
    analytics.track('Onboarding Started', {
      totalSteps: 9
    });
    
    router.push('/onboarding/profile');  // Step 1
  }
}

// No need to check user state DURING onboarding
// Only new users ever see onboarding screens
```

## Component Composition Strategy

**Atomic Design Principles**:

**Atoms** (primitives from shadcn/ui):
- Button, Input, Select, Card, Skeleton, etc.

**Molecules** (composed primitives):
- `DashboardCard` (Card + CardHeader + CardContent + analytics)
- `WorkoutHistoryItem` (Card + stats + action buttons)
- `ExerciseSelector` (SearchInput + Filters + ExerciseGrid)

**Organisms** (feature components):
- `TrainingVolumeCard` (DashboardCard + Recharts BarChart + data aggregation)
- `ProgramBuilder` (ExerciseSelector + WorkoutEditor + MetricsPanel)
- `ImportFlow` (Multi-step wizard with state machine)

**Templates** (page layouts):
- `DashboardShell` (Grid of dashboard cards)
- `OnboardingShell` (Centered content + progress bar)
- `ProgramBuilderShell` (Sidebar + main content + metrics panel)

---
