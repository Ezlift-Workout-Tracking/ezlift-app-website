/**
 * Tests for pagination constants
 * 
 * These tests validate the pagination configuration and ensure
 * the constants are correctly defined for the exercise library.
 */

import { 
  PAGE_SIZES, 
  EXERCISE_LIBRARY_PAGE_SIZE, 
  DEFAULT_PAGE_SIZE 
} from '../pagination';

describe('Pagination Constants', () => {
  test('PAGE_SIZES object is correctly defined', () => {
    expect(PAGE_SIZES).toBeDefined();
    expect(PAGE_SIZES.EXERCISE_LIBRARY).toBe(15);
    expect(PAGE_SIZES.DEFAULT).toBe(20);
  });

  test('Legacy constants maintain backward compatibility', () => {
    expect(EXERCISE_LIBRARY_PAGE_SIZE).toBe(15);
    expect(DEFAULT_PAGE_SIZE).toBe(20);
  });

  test('Exercise library page size creates 3×5 grid', () => {
    const pageSize = EXERCISE_LIBRARY_PAGE_SIZE;
    const columns = 3;
    const expectedRows = Math.ceil(pageSize / columns);
    
    expect(expectedRows).toBe(5); // 15 items / 3 columns = 5 rows
  });

  test('Total pages calculation works correctly with new page size', () => {
    const totalExercises = 566; // Current total in database
    const pageSize = EXERCISE_LIBRARY_PAGE_SIZE;
    const expectedPages = Math.ceil(totalExercises / pageSize);
    
    expect(expectedPages).toBe(38); // 566 / 15 = 37.73... → 38 pages
  });

  test('Page size reduction from 24 to 15 is correct', () => {
    const oldPageSize = 24;
    const newPageSize = EXERCISE_LIBRARY_PAGE_SIZE;
    const reduction = (oldPageSize - newPageSize) / oldPageSize;
    
    expect(reduction).toBeCloseTo(0.375, 3); // 37.5% reduction
  });
});