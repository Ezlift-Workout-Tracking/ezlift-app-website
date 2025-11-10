/**
 * Sessions Service (Normalized Fetch)
 *
 * Fetches ALL workout sessions from the backend via our Next.js API route
 * and normalizes the response shape to a consistent format expected by
 * dashboard analytics (volume + PRs).
 */

export interface NormalizedSet {
  reps?: number;
  weight?: number;
  duration?: number;
  distance?: number;
}

export interface NormalizedLog {
  id: string; // prefer exerciseId if present, else log id
  exerciseId?: string;
  name: string; // exercise name
  sets: NormalizedSet[];
}

export interface NormalizedSession {
  id: string;
  sessionDate: string; // ISO timestamp
  duration?: string;
  logs?: NormalizedLog[];
  workoutId?: string;
  workoutTitle?: string;
}

// In-memory exercise name cache (per-session)
const exerciseNameCache = new Map<string, string>();
const workoutNameCache = new Map<string, string>();

async function fetchExerciseName(exerciseId: string): Promise<string | undefined> {
  if (!exerciseId) return undefined;
  if (exerciseNameCache.has(exerciseId)) return exerciseNameCache.get(exerciseId);
  try {
    const res = await fetch(`/api/exercise/${encodeURIComponent(exerciseId)}`, { credentials: 'include' });
    if (!res.ok) return undefined;
    const data = await res.json();
    // Accept several shapes: { name }, { exercise: { name } }, { title }
    const name = data?.name || data?.exercise?.name || data?.title || data?.exercise?.title;
    if (typeof name === 'string' && name.trim().length > 0) {
      exerciseNameCache.set(exerciseId, name);
      return name;
    }
  } catch {
    // ignore network failures
  }
  return undefined;
}

function toNumber(v: any): number | undefined {
  if (v === undefined || v === null) return undefined;
  if (typeof v === 'number') return v;
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeSets(rawSets: any): NormalizedSet[] {
  const arr: any[] = Array.isArray(rawSets) ? rawSets : [];
  return arr.map((s: any) => ({
    reps: toNumber(s?.reps ?? s?.rep ?? s?.repetitions),
    weight: toNumber(s?.weight ?? s?.kg ?? s?.lbs ?? s?.weightValue),
    duration: toNumber(s?.duration ?? s?.time),
    distance: toNumber(s?.distance),
  }));
}

function normalizeLogs(rawLogs: any): NormalizedLog[] {
  const arr: any[] = Array.isArray(rawLogs)
    ? rawLogs
    : Array.isArray(rawLogs?.logs)
    ? rawLogs.logs
    : Array.isArray(rawLogs?.exercises)
    ? rawLogs.exercises
    : [];

  return arr.map((log: any, idx: number) => {
    const exerciseObj = log?.exercise || log?.movement || null;
    const exerciseId: string | undefined = String(
      log?.exerciseId ?? log?.exercise_id ?? exerciseObj?.id ?? log?.id ?? ''
    ) || undefined;
    const id = exerciseId || String(log?.id || '');
    let name: string | undefined =
      log?.name ??
      log?.exerciseName ??
      log?.exercise_name ??
      log?.exerciseTitle ??
      log?.title ??
      log?.movementName ??
      exerciseObj?.name ??
      exerciseObj?.title ??
      exerciseObj?.displayName;

    const setsSource = log?.sets ?? log?.setEntries ?? log?.records ?? [];

    if (!name || name === 'Unknown Exercise') {
      const firstSet: any = Array.isArray(setsSource) ? setsSource[0] : undefined;
      name = (firstSet?.exerciseName || firstSet?.name || firstSet?.title || name) as string | undefined;
    }

    if (!name) name = 'Unknown Exercise';
    return {
      id,
      exerciseId,
      name,
      sets: normalizeSets(setsSource),
    };
  });
}

function normalizeSessions(raw: any): NormalizedSession[] {
  const sessions: any[] = Array.isArray(raw)
    ? raw
    : Array.isArray(raw?.sessions)
    ? raw.sessions
    : [];

  return sessions.map((s: any, idx: number) => {
    // Logs may be under different keys depending on backend/mobile version
    const logsSource =
      s?.logs ??
      s?.logExercises ??
      s?.exerciseLogs ??
      s?.exercises ??
      [];

    return {
      id: String(s?.id ?? s?.sessionId ?? idx),
      sessionDate: String(s?.sessionDate ?? s?.date ?? s?.createdAt ?? new Date().toISOString()),
      duration: s?.duration,
      logs: normalizeLogs(logsSource),
      workoutId: s?.workoutId || s?.workout_id || s?.workout?.id,
      workoutTitle: s?.workoutTitle || s?.workout_name || s?.title || s?.workout?.title,
    };
  });
}

/**
 * Fetch all workout sessions and normalize to consistent structure.
 *
 * - Uses internal API route `/api/workout-log`
 * - Handles both array and object `{ sessions: [...] }` formats
 * - Normalizes `exerciseName` -> `name` and coerces numeric fields
 */
export async function fetchAllSessionsNormalized(options?: { warnTag?: string }): Promise<NormalizedSession[]> {
  const warnTag = options?.warnTag || 'SessionsService';
  const response = await fetch('/api/workout-log', { credentials: 'include', cache: 'no-store' });

  if (!response.ok) {
    if (response.status === 401) {
      // Session expired or unauthorized. Redirect to login for a better UX.
      if (typeof window !== 'undefined') {
        try {
          const next = window.location?.pathname || '/app';
          window.location.href = `/login?redirect=${encodeURIComponent(next)}`;
        } catch {}
      }
      throw new Error('Unauthorized');
    }
    if (response.status === 404) {
      // Endpoint not implemented yet — fail safe to empty list
      console.warn(`[${warnTag}] /workout-log endpoint not implemented yet`);
      return [];
    }
    throw new Error('Failed to fetch sessions');
  }

async function fetchWorkoutName(workoutId: string): Promise<string | undefined> {
  if (!workoutId) return undefined;
  if (workoutNameCache.has(workoutId)) return workoutNameCache.get(workoutId);
  try {
    const res = await fetch(`/api/workout/${encodeURIComponent(workoutId)}`, { credentials: 'include' });
    if (!res.ok) return undefined;
    const data = await res.json();
    const name = data?.name || data?.title || data?.workout?.name || data?.workout?.title;
    if (typeof name === 'string' && name.trim().length > 0) {
      workoutNameCache.set(workoutId, name);
      return name;
    }
  } catch {}
  return undefined;
}

  const data = await response.json();
  const rawSessions: any[] = Array.isArray(data) ? data : Array.isArray(data?.sessions) ? data.sessions : [];
  const normalized = normalizeSessions(data);

  // Enrich missing exercise names using exerciseId lookups (batch with caching)
  const missingIds = new Set<string>();
  normalized.forEach(s => s.logs?.forEach(l => {
    if ((!l.name || l.name === 'Unknown Exercise') && l.exerciseId) missingIds.add(l.exerciseId);
  }));

  if (missingIds.size > 0) {
    await Promise.all(Array.from(missingIds).map((id) => fetchExerciseName(id)));
    // Patch names in-place after cache fills
    normalized.forEach(s => s.logs?.forEach(l => {
      if ((!l.name || l.name === 'Unknown Exercise') && l.exerciseId) {
        const n = exerciseNameCache.get(l.exerciseId);
        if (n) l.name = n;
      }
    }));
  }
  // Enrich workout titles via workoutId
  const missingWorkoutIds = new Set<string>();
  normalized.forEach((s) => {
    if ((!s.workoutTitle || s.workoutTitle === 'Workout') && s.workoutId) missingWorkoutIds.add(s.workoutId);
  });

  if (missingWorkoutIds.size > 0) {
    await Promise.all(Array.from(missingWorkoutIds).map((id) => fetchWorkoutName(id)));
    normalized.forEach((s) => {
      if ((!s.workoutTitle || s.workoutTitle === 'Workout') && s.workoutId) {
        const n = workoutNameCache.get(s.workoutId);
        if (n) s.workoutTitle = n;
      }
    });
  }
  if (
    process.env.NODE_ENV !== 'production' &&
    (process.env.NEXT_PUBLIC_DEBUG_STATS === 'true' || typeof window !== 'undefined')
  ) {
    try {
      const first = normalized[0];
      const firstLog = first?.logs?.[0];
      const firstSet = firstLog?.sets?.[0];
      // Safe, redacted shape-only debug
      console.log('[Stats Debug] sessions normalized', {
        count: normalized.length,
        sample: first ? {
          keys: Object.keys(first).slice(0, 6),
          sessionDate: first.sessionDate,
          logs: first.logs?.length || 0,
          logSample: firstLog ? {
            keys: Object.keys(firstLog).slice(0, 6),
            name: firstLog.name,
            sets: firstLog.sets?.length || 0,
            setSample: firstSet ? {
              hasReps: typeof firstSet.reps !== 'undefined',
              hasWeight: typeof firstSet.weight !== 'undefined',
            } : undefined,
          } : undefined,
        } : null,
        rawSample: (() => {
          const rs = rawSessions?.[0];
          const rl = rs?.logs?.[0] || rs?.logExercises?.[0] || rs?.exerciseLogs?.[0] || rs?.exercises?.[0];
          return rs ? {
            keys: Object.keys(rs).slice(0, 10),
            hasLogs: Array.isArray(rs?.logs) || Array.isArray(rs?.logExercises) || Array.isArray(rs?.exerciseLogs) || Array.isArray(rs?.exercises),
            logKeys: rl ? Object.keys(rl).slice(0, 10) : undefined,
            nested: rl ? {
              hasExerciseObj: !!(rl.exercise || rl.movement),
              exerciseObjKeys: rl.exercise ? Object.keys(rl.exercise).slice(0, 10) : rl.movement ? Object.keys(rl.movement).slice(0, 10) : undefined,
              fields: {
                name: rl.name,
                exerciseName: rl.exerciseName,
                exercise_name: rl.exercise_name,
                movementName: rl.movementName,
                title: rl.title,
                exerciseId: rl.exerciseId,
              }
            } : undefined,
            workoutId: rs?.workoutId,
            workoutTitle: rs?.workoutTitle,
          } : null;
        })(),
        nameCacheSize: exerciseNameCache.size,
        workoutCacheSize: workoutNameCache.size,
      });
    } catch {}
  }
  return normalized;
}
