import type { NormalizedSession } from '@/lib/services/sessions';

export interface UniqueExercise {
  id: string;
  name: string;
  frequency: number;
}

export function extractUniqueExercises(sessions: NormalizedSession[] = []): UniqueExercise[] {
  const map = new Map<string, UniqueExercise>();
  sessions.forEach((s) => {
    (s.logs || []).forEach((l) => {
      const id = l.exerciseId || l.id;
      if (!id) return;
      const name = l.name || 'Unknown Exercise';
      if (!map.has(id)) {
        map.set(id, { id, name, frequency: 0 });
      }
      map.get(id)!.frequency += 1;
    });
  });
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export function mostFrequentExercise(exercises: UniqueExercise[]): UniqueExercise | null {
  if (!exercises.length) return null;
  return exercises.reduce((acc, cur) => (cur.frequency > acc.frequency ? cur : acc), exercises[0]);
}

