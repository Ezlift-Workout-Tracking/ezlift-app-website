import MiniSearch from 'minisearch';
import { Exercise, ExerciseFilters } from '@/types/exercise';

/**
 * Client-side search engine for exercises using MiniSearch
 * Provides instant fuzzy search with scoring and ranking
 */
class ExerciseSearchService {
  private searchEngine: MiniSearch<Exercise> | null = null;
  private exercises: Exercise[] = [];

  /**
   * Initialize the search engine with exercises
   */
  initialize(exercises: Exercise[]): void {
    this.exercises = exercises;
    
    // Configure MiniSearch with exercise-specific fields
    this.searchEngine = new MiniSearch({
      fields: ['name', 'aliases', 'primaryMuscleGroup', 'exerciseType', 'equipment'], // fields to index for full-text search
      storeFields: ['id', 'name', 'primaryMuscleGroup', 'exerciseType', 'equipment', 'level', 'force'], // fields to return with search results
      searchOptions: {
        boost: { name: 2, aliases: 1.5 }, // boost name matches higher than alias matches
        fuzzy: 0.2, // allow some typos
        prefix: true, // match prefixes (e.g., "ben" matches "bench press")
        combineWith: 'AND', // require all terms to match
      },
    });

    // Add all exercises to the search index
    this.searchEngine.addAll(exercises);
  }

  /**
   * Search exercises by query string with fuzzy matching
   */
  search(query: string, filters?: ExerciseFilters): Exercise[] {
    if (!this.searchEngine || !query || query.trim().length === 0) {
      return this.applyFilters(this.exercises, filters);
    }

    // Perform search
    const results = this.searchEngine.search(query.trim());
    
    // Map search results back to full exercise objects
    const searchedExercises = results.map(result => {
      return this.exercises.find(ex => ex.id === result.id)!;
    }).filter(Boolean);

    // Apply additional filters
    return this.applyFilters(searchedExercises, filters);
  }

  /**
   * Apply filters to exercises (muscle group, type, level, etc.)
   */
  private applyFilters(exercises: Exercise[], filters?: ExerciseFilters): Exercise[] {
    if (!filters) return exercises;

    let filtered = exercises;

    if (filters.exerciseType) {
      filtered = filtered.filter(ex => ex.exerciseType === filters.exerciseType);
    }

    if (filters.primaryMuscleGroup) {
      filtered = filtered.filter(ex => ex.primaryMuscleGroup === filters.primaryMuscleGroup);
    }

    if (filters.force) {
      filtered = filtered.filter(ex => ex.force === filters.force);
    }

    if (filters.level) {
      filtered = filtered.filter(ex => ex.level === filters.level);
    }

    if (filters.equipment) {
      filtered = filtered.filter(ex => ex.equipment === filters.equipment);
    }

    if (filters.category) {
      filtered = filtered.filter(ex => ex.category === filters.category);
    }

    if (filters.mechanic) {
      filtered = filtered.filter(ex => ex.mechanic === filters.mechanic);
    }

    return filtered;
  }

  /**
   * Get all exercises (with optional filters, no search)
   */
  getAll(filters?: ExerciseFilters): Exercise[] {
    return this.applyFilters(this.exercises, filters);
  }

  /**
   * Check if search engine is initialized
   */
  isInitialized(): boolean {
    return this.searchEngine !== null && this.exercises.length > 0;
  }

  /**
   * Clear the search engine and data
   */
  clear(): void {
    this.searchEngine = null;
    this.exercises = [];
  }

  /**
   * Get total exercise count
   */
  getCount(): number {
    return this.exercises.length;
  }
}

// Export singleton instance
export const exerciseSearch = new ExerciseSearchService();

