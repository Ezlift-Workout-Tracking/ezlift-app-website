/**
 * Unit tests for program utility functions
 * Story 1.8: Active Program Card
 */

import { 
  findActiveRoutine, 
  getNextWorkout,
  getCurrentWeek,
  type WorkoutSession 
} from '@/lib/utils/program-utils';
import type { Routine } from '@/types/routine';

describe('program-utils', () => {
  describe('findActiveRoutine', () => {
    const mockRoutines: Routine[] = [
      {
        id: 'routine-1',
        userId: 'user1',
        title: 'Push/Pull/Legs',
        defaultRoutine: true,
        workouts: [
          { id: 'w1', title: 'Push Day', exercises: [], order: 0 },
          { id: 'w2', title: 'Pull Day', exercises: [], order: 1 },
          { id: 'w3', title: 'Leg Day', exercises: [], order: 2 },
        ],
      },
      {
        id: 'routine-2',
        userId: 'user1',
        title: 'Upper/Lower Split',
        defaultRoutine: false,
        workouts: [
          { id: 'w4', title: 'Upper Body', exercises: [], order: 0 },
          { id: 'w5', title: 'Lower Body', exercises: [], order: 1 },
        ],
      },
    ];

    it('should return null for empty routines', () => {
      expect(findActiveRoutine([])).toBeNull();
    });

    it('should return default routine when no sessions provided', () => {
      const result = findActiveRoutine(mockRoutines);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('routine-1');
      expect(result!.title).toBe('Push/Pull/Legs');
    });

    it('should find active routine based on most recent session', () => {
      const sessions: WorkoutSession[] = [
        {
          id: 'session-1',
          workoutTitle: 'Upper Body',
          sessionDate: '2025-10-29T10:00:00Z',
        },
        {
          id: 'session-2',
          workoutTitle: 'Push Day',
          sessionDate: '2025-10-28T10:00:00Z',
        },
      ];

      const result = findActiveRoutine(mockRoutines, sessions);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('routine-2');
      expect(result!.title).toBe('Upper/Lower Split');
    });

    it('should fall back to default if workout title not found in any routine', () => {
      const sessions: WorkoutSession[] = [
        {
          id: 'session-1',
          workoutTitle: 'Unknown Workout',
          sessionDate: '2025-10-29T10:00:00Z',
        },
      ];

      const result = findActiveRoutine(mockRoutines, sessions);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('routine-1'); // Falls back to default
    });

    it('should return first routine if no default and no sessions', () => {
      const routinesNoDefault: Routine[] = [
        {
          id: 'routine-1',
          userId: 'user1',
          title: 'First Routine',
          defaultRoutine: false,
          workouts: [],
        },
        {
          id: 'routine-2',
          userId: 'user1',
          title: 'Second Routine',
          defaultRoutine: false,
          workouts: [],
        },
      ];

      const result = findActiveRoutine(routinesNoDefault);
      expect(result).not.toBeNull();
      expect(result!.id).toBe('routine-1');
    });
  });

  describe('getNextWorkout', () => {
    const mockRoutine: Routine = {
      id: 'routine-1',
      userId: 'user1',
      title: 'Push/Pull/Legs',
      workouts: [
        { id: 'w1', title: 'Push Day', exercises: [], order: 0 },
        { id: 'w2', title: 'Pull Day', exercises: [], order: 1 },
        { id: 'w3', title: 'Leg Day', exercises: [], order: 2 },
      ],
    };

    it('should return null for routine with no workouts', () => {
      const emptyRoutine: Routine = {
        id: 'r1',
        userId: 'user1',
        title: 'Empty',
        workouts: [],
      };
      
      expect(getNextWorkout(emptyRoutine)).toBeNull();
    });

    it('should return first workout when no training history', () => {
      const result = getNextWorkout(mockRoutine);
      expect(result).not.toBeNull();
      expect(result!.workout.title).toBe('Push Day');
      expect(result!.dayLabel).toBe('Start');
    });

    it('should return next workout based on last completed', () => {
      const sessions: WorkoutSession[] = [
        {
          id: 'session-1',
          workoutTitle: 'Push Day',
          sessionDate: '2025-10-29T10:00:00Z',
        },
      ];

      const result = getNextWorkout(mockRoutine, sessions);
      expect(result).not.toBeNull();
      expect(result!.workout.title).toBe('Pull Day'); // Next in sequence
    });

    it('should cycle back to first workout after last one', () => {
      const sessions: WorkoutSession[] = [
        {
          id: 'session-1',
          workoutTitle: 'Leg Day', // Last workout in routine
          sessionDate: '2025-10-29T10:00:00Z',
        },
      ];

      const result = getNextWorkout(mockRoutine, sessions);
      expect(result).not.toBeNull();
      expect(result!.workout.title).toBe('Push Day'); // Cycles back to first
    });

    it('should handle multiple sessions and use most recent', () => {
      const sessions: WorkoutSession[] = [
        {
          id: 'session-1',
          workoutTitle: 'Pull Day',
          sessionDate: '2025-10-29T10:00:00Z',
        },
        {
          id: 'session-2',
          workoutTitle: 'Push Day',
          sessionDate: '2025-10-28T10:00:00Z',
        },
      ];

      const result = getNextWorkout(mockRoutine, sessions);
      expect(result).not.toBeNull();
      expect(result!.workout.title).toBe('Leg Day'); // After Pull Day
    });
  });

  describe('getCurrentWeek', () => {
    it('should return null for MVP (not implemented)', () => {
      const mockRoutine: Routine = {
        id: 'r1',
        userId: 'user1',
        title: 'Test',
        workouts: [],
      };
      
      expect(getCurrentWeek(mockRoutine)).toBeNull();
    });
  });
});
