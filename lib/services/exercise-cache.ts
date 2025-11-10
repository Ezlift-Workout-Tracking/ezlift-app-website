import { useExerciseStore } from '../stores/exerciseStore';
import { exerciseSearch } from './exercise-search';
import { Exercise, FilterOptions, ExerciseListResponse, ExerciseFilters } from '@/types/exercise';

/**
 * Exercise Cache Service
 * Handles loading all exercises once and managing the cache
 */
class ExerciseCacheService {
  private loadPromise: Promise<void> | null = null;

  /**
   * Load all exercises from the API and populate cache + search engine
   * This is called once on first visit to Exercise Library
   */
  async loadAllExercises(): Promise<void> {
    const store = useExerciseStore.getState();

    // If already loaded and not expired, use cache
    if (store.isLoaded && !store.isExpired() && exerciseSearch.isInitialized()) {
      return;
    }

    // If currently loading, wait for that promise
    if (this.loadPromise) {
      return this.loadPromise;
    }

    // Start fresh load
    store.setLoading(true);

    this.loadPromise = (async () => {
      try {
        // Fetch ALL exercises in one request (no pagination)
        // We'll load up to 1000 exercises at once (should cover most databases)
        const response = await fetch('/api/exercises?page=1&limit=1000');
        
        if (!response.ok) {
          throw new Error(`Failed to fetch exercises: ${response.status}`);
        }

        const data: ExerciseListResponse = await response.json();
        
        // Also fetch filter options
        const filterResponse = await fetch('/api/exercises/filters');
        let filterOptions: FilterOptions = {
          primaryMuscleGroups: [],
          exerciseTypes: [],
          levels: [],
          forces: [],
          categories: [],
          equipment: [],
          mechanics: [],
        };

        if (filterResponse.ok) {
          filterOptions = await filterResponse.json();
        }

        // Store in Zustand cache
        store.setExercises(data.exercises, filterOptions);

        // Initialize search engine
        exerciseSearch.initialize(data.exercises);
      } catch (error) {
        console.error('[ExerciseCache] Error loading exercises:', error);
        store.setError(error instanceof Error ? error.message : 'Failed to load exercises');
        throw error;
      } finally {
        this.loadPromise = null;
      }
    })();

    return this.loadPromise;
  }

  /**
   * Search exercises using the cached data and search engine
   */
  searchExercises(query: string, filters?: ExerciseFilters, page: number = 1, limit: number = 15): ExerciseListResponse {
    const store = useExerciseStore.getState();

    // Ensure data is loaded
    if (!store.isLoaded) {
      return {
        exercises: [],
        total: 0,
        page,
        limit,
      };
    }

    // Perform search + filter
    const allResults = query && query.trim().length > 0
      ? exerciseSearch.search(query, filters)
      : exerciseSearch.getAll(filters);

    // Apply client-side pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedResults = allResults.slice(startIndex, endIndex);

    return {
      exercises: paginatedResults,
      total: allResults.length,
      page,
      limit,
    };
  }

  /**
   * Get filter options from cache
   */
  getFilterOptions(): FilterOptions | null {
    const store = useExerciseStore.getState();
    return store.filterOptions;
  }

  /**
   * Check if cache is ready
   */
  isReady(): boolean {
    const store = useExerciseStore.getState();
    return store.isLoaded && !store.isExpired() && exerciseSearch.isInitialized();
  }

  /**
   * Check if cache is expired
   */
  isExpired(): boolean {
    const store = useExerciseStore.getState();
    return store.isExpired();
  }

  /**
   * Force refresh the cache
   */
  async refresh(): Promise<void> {
    const store = useExerciseStore.getState();
    store.clearCache();
    exerciseSearch.clear();
    return this.loadAllExercises();
  }

  /**
   * Clear the cache
   */
  clear(): void {
    const store = useExerciseStore.getState();
    store.clearCache();
    exerciseSearch.clear();
  }

  /**
   * Get cache stats
   */
  getStats() {
    const store = useExerciseStore.getState();
    return {
      isLoaded: store.isLoaded,
      isLoading: store.isLoading,
      exerciseCount: store.exercises.length,
      lastFetched: store.lastFetched ? new Date(store.lastFetched).toISOString() : null,
      isExpired: store.isExpired(),
      searchEngineReady: exerciseSearch.isInitialized(),
    };
  }
}

// Export singleton instance
export const exerciseCache = new ExerciseCacheService();

