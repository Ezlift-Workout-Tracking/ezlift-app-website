/**
 * Routine (Program) Type Definitions
 * 
 * Based on backend API schema and Story 1.8 requirements
 */

export interface Routine {
  id: string;
  userId: string;
  title: string;
  description?: string;
  defaultRoutine?: boolean;  // True if this is the active/default routine
  lastUsedAt?: string;  // ISO date string
  workouts: Workout[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Workout {
  id: string;
  title: string;
  dayOfWeek?: number;  // 0-6 (Sunday-Saturday)
  exercises: WorkoutExercise[];
  description?: string;
  order?: number;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  exerciseName: string;
  sets: number;
  reps: number | string;  // Can be range like "8-12"
  weight?: number;
  restTime?: number;
  notes?: string;
  order: number;
}

export interface RoutinesResponse {
  routines: Routine[];
}

