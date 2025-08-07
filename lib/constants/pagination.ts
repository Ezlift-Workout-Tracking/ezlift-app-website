/**
 * Pagination constants for the exercise library
 * 
 * Single source of truth for pagination configuration
 */

// Page size configurations
export const PAGE_SIZES = {
  EXERCISE_LIBRARY: 15, // 3×5 grid layout
  DEFAULT: 20,          // Default for other services
} as const;

// Legacy exports for backward compatibility
export const EXERCISE_LIBRARY_PAGE_SIZE = PAGE_SIZES.EXERCISE_LIBRARY;
export const DEFAULT_PAGE_SIZE = PAGE_SIZES.DEFAULT;