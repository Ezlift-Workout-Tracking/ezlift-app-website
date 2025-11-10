/**
 * Integration tests for ActiveProgramCard component
 * Story 1.8: Active Program Card
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveProgramCard } from '@/components/dashboard/ActiveProgramCard';
import * as useRoutinesHook from '@/hooks/useRoutines';
import * as useWorkoutLogsHook from '@/hooks/useWorkoutLogs';
import * as useUserDataStateHook from '@/hooks/useUserDataState';
import * as programUtils from '@/lib/utils/program-utils';
import type { Routine } from '@/types/routine';

// Mock Next.js router
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock hooks
jest.mock('@/hooks/useRoutines');
jest.mock('@/hooks/useWorkoutLogs');
jest.mock('@/hooks/useUserDataState');
jest.mock('@/lib/utils/program-utils');

const mockUseRoutines = useRoutinesHook.useRoutines as jest.MockedFunction<typeof useRoutinesHook.useRoutines>;
const mockUseWorkoutLogs = useWorkoutLogsHook.useWorkoutLogs as jest.MockedFunction<typeof useWorkoutLogsHook.useWorkoutLogs>;
const mockUseUserDataState = useUserDataStateHook.useUserDataState as jest.MockedFunction<typeof useUserDataStateHook.useUserDataState>;
const mockFindActiveRoutine = programUtils.findActiveRoutine as jest.MockedFunction<typeof programUtils.findActiveRoutine>;
const mockGetNextWorkout = programUtils.getNextWorkout as jest.MockedFunction<typeof programUtils.getNextWorkout>;
const mockGetCurrentWeek = programUtils.getCurrentWeek as jest.MockedFunction<typeof programUtils.getCurrentWeek>;

describe('ActiveProgramCard', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    
    mockPush.mockClear();
    jest.clearAllMocks();
    
    // Default mocks
    mockUseWorkoutLogs.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    } as any);
    
    // Mock console.log to avoid test output clutter
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <ActiveProgramCard />
      </QueryClientProvider>
    );
  };

  describe('Loading state', () => {
    it('should show loading spinner while fetching routines', () => {
      mockUseRoutines.mockReturnValue({
        data: undefined,
        isLoading: true,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'existing',
        isLoading: false,
      } as any);

      renderComponent();
      
      expect(screen.getByText('Active Program')).toBeInTheDocument();
      // Loading state shows a spinner via the animate-spin class
      const cardContent = screen.getByText('Active Program').closest('.rounded-lg');
      expect(cardContent?.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should show error message when fetch fails', () => {
      mockUseRoutines.mockReturnValue({
        data: undefined,
        isLoading: false,
        error: new Error('Network error'),
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'existing',
        isLoading: false,
      } as any);

      renderComponent();
      
      expect(screen.getByText('Failed to load programs')).toBeInTheDocument();
    });
  });

  describe('Empty state for new users', () => {
    it('should show create program CTA for new users with no routines', () => {
      mockUseRoutines.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'new',
        isLoading: false,
      } as any);

      renderComponent();
      
      expect(screen.getByText('Create your first program to get started')).toBeInTheDocument();
      expect(screen.getByText('Create Program')).toBeInTheDocument();
      expect(screen.getByText('Browse Programs')).toBeInTheDocument();
    });
  });

  describe('Empty state for existing users', () => {
    it('should show mobile sync message for existing users with no routines', () => {
      mockUseRoutines.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'existing',
        isLoading: false,
      } as any);

      renderComponent();
      
      expect(screen.getByText('Your programs from mobile will appear here')).toBeInTheDocument();
      expect(screen.getByText('Download Mobile App')).toBeInTheDocument();
    });
  });

  describe('Active program display', () => {
    // Use a future day (Friday) to ensure consistent test behavior
    const mockRoutine: Routine = {
      id: 'routine-1',
      userId: 'user-1',
      title: 'Push/Pull/Legs',
      description: 'A 3-day split program',
      defaultRoutine: true,
      workouts: [
        {
          id: 'workout-1',
          title: 'Push Day',
          dayOfWeek: 1, // Monday
          exercises: [],
          order: 0,
        },
        {
          id: 'workout-2',
          title: 'Pull Day',
          dayOfWeek: 3, // Wednesday
          exercises: [],
          order: 1,
        },
        {
          id: 'workout-3',
          title: 'Leg Day',
          dayOfWeek: 5, // Friday
          exercises: [],
          order: 2,
        },
      ],
    };

    beforeEach(() => {
      // Set a consistent date for tests (Tuesday)
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 0, 14, 12, 0, 0)); // Tuesday Jan 14, 2025
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should display program name and description', () => {
      mockUseRoutines.mockReturnValue({
        data: [mockRoutine],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(mockRoutine);
      mockGetNextWorkout.mockReturnValue({
        workout: mockRoutine.workouts[1],
        dayLabel: 'Tomorrow',
        fullDate: 'Jan 15',
      });
      mockGetCurrentWeek.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'existing',
        isLoading: false,
      } as any);

      renderComponent();
      
      expect(screen.getByText('Push/Pull/Legs')).toBeInTheDocument();
      expect(screen.getByText('A 3-day split program')).toBeInTheDocument();
    });

    it('should display next workout information', () => {
      mockUseRoutines.mockReturnValue({
        data: [mockRoutine],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(mockRoutine);
      mockGetNextWorkout.mockReturnValue({
        workout: mockRoutine.workouts[1],
        dayLabel: 'Tomorrow',
        fullDate: 'Jan 15',
      });
      mockGetCurrentWeek.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'existing',
        isLoading: false,
      } as any);

      renderComponent();
      
      // Next workout should be Wednesday (Pull Day) - tomorrow
      expect(screen.getByText(/Next workout:/)).toBeInTheDocument();
      expect(screen.getByText(/Pull Day/)).toBeInTheDocument();
    });

    it('should show action buttons', () => {
      mockUseRoutines.mockReturnValue({
        data: [mockRoutine],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(mockRoutine);
      mockGetNextWorkout.mockReturnValue({
        workout: mockRoutine.workouts[1],
        dayLabel: 'Tomorrow',
        fullDate: 'Jan 15',
      });
      mockGetCurrentWeek.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'existing',
        isLoading: false,
      } as any);

      renderComponent();
      
      expect(screen.getByText('View Program')).toBeInTheDocument();
      expect(screen.getByText('Edit Program')).toBeInTheDocument();
      expect(screen.getByText('Start Workout on Mobile')).toBeInTheDocument();
    });
  });

  describe('User state-based edit access', () => {
    const mockRoutine: Routine = {
      id: 'routine-1',
      userId: 'user-1',
      title: 'Test Program',
      workouts: [
        {
          id: 'w1',
          title: 'Workout A',
          dayOfWeek: 5, // Friday
          exercises: [],
          order: 0,
        },
      ],
    };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 0, 14, 12, 0, 0)); // Tuesday
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should allow edit navigation for new users', async () => {
      mockUseRoutines.mockReturnValue({
        data: [mockRoutine],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(mockRoutine);
      mockGetNextWorkout.mockReturnValue({
        workout: mockRoutine.workouts[0],
        dayLabel: 'Friday',
        fullDate: 'Jan 17',
      });
      mockGetCurrentWeek.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'new',
        isLoading: false,
      } as any);

      renderComponent();
      
      const editButton = screen.getByText('Edit Program');
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/app/programs/routine-1/edit');
      });
    });

    it('should show read-only dialog for existing users', async () => {
      mockUseRoutines.mockReturnValue({
        data: [mockRoutine],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(mockRoutine);
      mockGetNextWorkout.mockReturnValue({
        workout: mockRoutine.workouts[0],
        dayLabel: 'Friday',
        fullDate: 'Jan 17',
      });
      mockGetCurrentWeek.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'existing',
        isLoading: false,
      } as any);

      renderComponent();
      
      const editButton = screen.getByText('Edit Program');
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByText('Program editing on mobile only')).toBeInTheDocument();
      });
      
      expect(mockPush).not.toHaveBeenCalled();
    });

    it('should block edit for unknown user state', async () => {
      mockUseRoutines.mockReturnValue({
        data: [mockRoutine],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(mockRoutine);
      mockGetNextWorkout.mockReturnValue({
        workout: mockRoutine.workouts[0],
        dayLabel: 'Friday',
        fullDate: 'Jan 17',
      });
      mockGetCurrentWeek.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'unknown',
        isLoading: false,
      } as any);

      renderComponent();
      
      const editButton = screen.getByText('Edit Program');
      fireEvent.click(editButton);
      
      await waitFor(() => {
        expect(screen.getByText('Program editing on mobile only')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    const mockRoutine: Routine = {
      id: 'routine-1',
      userId: 'user-1',
      title: 'Test Program',
      workouts: [
        {
          id: 'w1',
          title: 'Workout A',
          dayOfWeek: 5, // Friday
          exercises: [],
          order: 0,
        },
      ],
    };

    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(2025, 0, 14, 12, 0, 0)); // Tuesday
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should navigate to program detail on View Program click', async () => {
      mockUseRoutines.mockReturnValue({
        data: [mockRoutine],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(mockRoutine);
      mockGetNextWorkout.mockReturnValue({
        workout: mockRoutine.workouts[0],
        dayLabel: 'Friday',
        fullDate: 'Jan 17',
      });
      mockGetCurrentWeek.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'existing',
        isLoading: false,
      } as any);

      renderComponent();
      
      const viewButton = screen.getByText('View Program');
      fireEvent.click(viewButton);
      
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/app/programs/routine-1');
      });
    });
  });

  describe('Analytics', () => {
    it('should track card viewed event on mount', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      
      mockUseRoutines.mockReturnValue({
        data: [],
        isLoading: false,
        error: null,
      } as any);
      
      mockFindActiveRoutine.mockReturnValue(null);
      
      mockUseUserDataState.mockReturnValue({
        state: 'new',
        isLoading: false,
      } as any);

      renderComponent();
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '[Analytics] Dashboard Card Viewed',
        expect.objectContaining({
          cardType: 'program',
          hasData: false,
          hasActiveProgram: false,
        })
      );
      
      consoleSpy.mockRestore();
    });
  });
});

