import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Exercise, FilterOptions } from '@/types/exercise';

interface ExerciseState {
  // All exercises cached from the database
  exercises: Exercise[];
  
  // Filter options (muscle groups, types, etc.)
  filterOptions: FilterOptions | null;
  
  // Cache metadata
  isLoaded: boolean;
  isLoading: boolean;
  lastFetched: number | null;
  error: string | null;
  
  // Actions
  setExercises: (exercises: Exercise[], filterOptions: FilterOptions) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  clearCache: () => void;
  isExpired: () => boolean;
}

// Cache expiration time: 1 hour (in milliseconds)
const CACHE_TTL = 60 * 60 * 1000;

export const useExerciseStore = create<ExerciseState>()(
  persist(
    (set, get) => ({
      exercises: [],
      filterOptions: null,
      isLoaded: false,
      isLoading: false,
      lastFetched: null,
      error: null,

      setExercises: (exercises, filterOptions) => {
        set({
          exercises,
          filterOptions,
          isLoaded: true,
          isLoading: false,
          lastFetched: Date.now(),
          error: null,
        });
      },

      setLoading: (isLoading) => {
        set({ isLoading });
      },

      setError: (error) => {
        set({ error, isLoading: false });
      },

      clearCache: () => {
        set({
          exercises: [],
          filterOptions: null,
          isLoaded: false,
          isLoading: false,
          lastFetched: null,
          error: null,
        });
      },

      isExpired: () => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > CACHE_TTL;
      },
    }),
    {
      name: 'exercise-cache', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => sessionStorage), // (optional) by default, 'localStorage' is used
      // Only persist the essential data, not loading/error states
      partialize: (state) => ({
        exercises: state.exercises,
        filterOptions: state.filterOptions,
        lastFetched: state.lastFetched,
        isLoaded: state.isLoaded,
      }),
    }
  )
);

