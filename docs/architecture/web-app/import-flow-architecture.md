# Import Flow Architecture

## CSV Import Process (Client-Side Parsing)

Based on mobile app implementation at `/Users/belalgouda/Development_Projects/Active_Projects/ezlift-rn-app/src/common/utils/parseCsvToWorkoutLogs.ts`

**Hevy CSV Structure** (Confirmed from sample):
```csv
title, start_time, end_time, description, exercise_title, superset_id,
exercise_notes, set_index, set_type, weight_kg, reps, distance_km,
duration_seconds, rpe
```

**Example Rows**:
```csv
"Full Body B","18 Dec 2024, 21:13","18 Dec 2024, 21:58","","Leg Press (Machine)",,"",0,"normal",250,15,,,
"Full Body B","18 Dec 2024, 21:13","18 Dec 2024, 21:58","","Leg Press (Machine)",,"",1,"normal",250,14,,,
```

## Import Implementation

**Step 1: Upload & Parse**

```typescript
// components/import/CsvImportFlow.tsx
import { parse } from 'papaparse';

async function handleFileUpload(file: File) {
  const text = await file.text();
  
  const { data, errors } = parse<HevyRow>(text, {
    header: true,
    skipEmptyLines: true,
    transform: (value) => value.trim()
  });
  
  if (errors.length > 0) {
    toast.error(`CSV parsing error: ${errors[0].message}`);
    return;
  }
  
  // Process rows
  setImportState({ status: 'parsing', rows: data });
}
```

**Step 2: Group by Workout**

```typescript
// lib/import/parser.ts
function groupByWorkout(rows: HevyRow[]) {
  const workouts: Map<string, HevyRow[]> = new Map();
  
  rows.forEach(row => {
    const key = `${row.title}-${row.start_time}-${row.end_time}`;
    if (!workouts.has(key)) {
      workouts.set(key, []);
    }
    workouts.get(key)!.push(row);
  });
  
  return workouts;
}
```

**Step 3: Fuzzy Match Exercises**

```typescript
import MiniSearch from 'minisearch';

// Initialize search index with exercise library
const miniSearch = new MiniSearch({
  fields: ['name', 'aliases'],
  storeFields: ['id', 'name', 'primaryMuscleGroup', 'exerciseType'],
  searchOptions: { fuzzy: 0.2 }
});

// Add all exercises from library
miniSearch.addAll(exerciseLibrary);

// Match Hevy exercise names
function matchExercise(hevyExerciseName: string) {
  const results = miniSearch.search(hevyExerciseName, { fuzzy: 0.2 });
  return results[0] || null;  // Best match or null
}
```

**Step 4: Create Session Records**

```typescript
interface ParsedImport {
  sessions: WorkoutSession[];
  unmappedExercises: string[];  // For user review
  mappedExercises: { oldName: string; newName: string }[];
  totalWorkouts: number;
  totalSets: number;
}

function parseHevyCsv(
  rows: HevyRow[],
  exerciseLibrary: Exercise[]
): ParsedImport {
  const sessions: WorkoutSession[] = [];
  const unmappedExercises: Set<string> = new Set();
  const mappedExercises: { oldName: string; newName: string }[] = [];
  
  const workoutGroups = groupByWorkout(rows);
  
  workoutGroups.forEach(([key, rows]) => {
    const [title, startTime, endTime] = key.split('-');
    const startDate = parse(startTime, 'dd MMM yyyy, HH:mm', new Date());
    const endDate = parse(endTime, 'dd MMM yyyy, HH:mm', new Date());
    
    const session: WorkoutSession = {
      id: generateUUID(),
      workoutTitle: normalizeTitle(title),
      sessionDate: startDate.toISOString(),
      duration: formatDuration(differenceInSeconds(endDate, startDate)),
      notes: '',
      isImported: true,
      importedAt: new Date().toISOString(),
      logs: []
    };
    
    // Group exercises by title (multiple sets per exercise)
    const exerciseGroups = groupBy(rows, r => r.exercise_title);
    
    Object.entries(exerciseGroups).forEach(([exerciseTitle, sets], index) => {
      const match = matchExercise(exerciseTitle);
      
      if (!match) {
        unmappedExercises.add(exerciseTitle);
      } else {
        mappedExercises.push({ 
          oldName: exerciseTitle, 
          newName: match.name 
        });
      }
      
      const logExercise: LogExercise = {
        id: generateUUID(),
        sessionId: session.id,
        exerciseId: match?.id || '-1',
        name: match?.name || exerciseTitle,
        primaryMuscleGroup: match?.primaryMuscleGroup || 'unknown',
        exerciseType: match?.exerciseType,
        order: index,
        notes: sets[0].exercise_notes || '',
        sets: sets.map((set, setIndex) => ({
          id: generateUUID(),
          index: setIndex,
          reps: set.reps ? Number(set.reps) : undefined,
          weight: set.weight_kg ? Number(set.weight_kg) : undefined,
          duration: set.duration_seconds ? Number(set.duration_seconds) : undefined,
          distance: set.distance_km ? Number(set.distance_km) : undefined,
          rpe: set.rpe ? Number(set.rpe) : undefined
        }))
      };
      
      session.logs!.push(logExercise);
    });
    
    sessions.push(session);
  });
  
  return {
    sessions,
    unmappedExercises: Array.from(unmappedExercises),
    mappedExercises,
    totalWorkouts: sessions.length,
    totalSets: sessions.reduce((sum, s) => 
      sum + s.logs!.reduce((sum2, e) => sum2 + e.sets.length, 0), 0)
  };
}
```

**Step 5: Review & Confirm**

```typescript
// Show import summary to user
function ImportSummary({ parsed }: { parsed: ParsedImport }) {
  return (
    <Card>
      <h3>Import Summary</h3>
      <Stats>
        <Stat label="Workouts" value={parsed.totalWorkouts} />
        <Stat label="Exercises" value={parsed.sessions.reduce(...)} />
        <Stat label="Total Sets" value={parsed.totalSets} />
      </Stats>
      
      {parsed.unmappedExercises.length > 0 && (
        <Alert variant="warning">
          <p>{parsed.unmappedExercises.length} exercises couldn't be matched:</p>
          <ul>
            {parsed.unmappedExercises.map(name => <li>{name}</li>)}
          </ul>
          <p>These will be imported as custom exercises.</p>
        </Alert>
      )}
      
      <Button onClick={handleConfirmImport}>
        Import {parsed.totalWorkouts} Workouts
      </Button>
    </Card>
  );
}
```

**Step 6: Bulk Create Sessions**

```typescript
// For MVP: POST sessions one-by-one or bulk endpoint if available
async function importSessions(sessions: WorkoutSession[]) {
  const { mutateAsync } = useCreateSession();
  
  // Show progress
  setProgress({ current: 0, total: sessions.length });
  
  for (let i = 0; i < sessions.length; i++) {
    try {
      await mutateAsync(sessions[i]);
      setProgress({ current: i + 1, total: sessions.length });
    } catch (error) {
      // Log failed session, continue with others
      console.error(`Failed to import session ${i}:`, error);
    }
  }
  
  // Invalidate queries to refresh dashboard
  queryClient.invalidateQueries({ queryKey: ['sessions'] });
  
  toast.success(`Imported ${sessions.length} workouts successfully!`);
}
```

## Import Flow UX

**Screen 1: Select Source**
- Upload Hevy CSV
- Upload Strong CSV (future)
- Upload Google Sheets (future)

**Screen 2: Processing**
- Parse CSV (client-side)
- Match exercises with fuzzy search
- Show progress bar

**Screen 3: Review**
- Display import summary
- Show unmapped exercises
- Allow user to manually map or skip
- Confirm button

**Screen 4: Importing**
- Progress bar (X of Y workouts)
- Show current workout being imported
- Cancel button (abort remaining)

**Screen 5: Success**
- Summary: "127 workouts, 23 exercises, 2,341 sets imported"
- CTA: "View Dashboard" or "View History"
- Option: "Import More"

---
