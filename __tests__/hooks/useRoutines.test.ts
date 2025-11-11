/**
 * Unit tests for useRoutines hook
 * Story 1.8: Active Program Card
 */

import { useRoutines } from '@/hooks/useRoutines';

describe('useRoutines', () => {
  it('should be a valid React Query hook', () => {
    // This test just ensures the hook is properly exported
    expect(useRoutines).toBeDefined();
    expect(typeof useRoutines).toBe('function');
  });
  
  // Note: Integration tests for the hook's behavior are in
  // __tests__/components/dashboard/ActiveProgramCard.test.tsx
  // which uses MSW to mock the API responses
});
