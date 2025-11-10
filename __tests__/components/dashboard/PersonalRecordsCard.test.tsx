/**
 * Personal Records Card Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PersonalRecordsCard } from '@/components/dashboard/PersonalRecordsCard';
import { DateRangeProvider } from '@/contexts/DateRangeContext';

global.fetch = jest.fn();
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

function createWrapper() {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <DateRangeProvider>{children}</DateRangeProvider>
      </QueryClientProvider>
    );
  };
}

const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

const mockSessionsWithPRs = [
  {
    id: 'session-1',
    sessionDate: yesterday.toISOString(),
    logs: [
      { id: 'bench-press', name: 'Bench Press', sets: [{ reps: 10, weight: 100 }, { reps: 8, weight: 110 }] },
      { id: 'squat', name: 'Barbell Squat', sets: [{ reps: 10, weight: 140 }] },
    ],
  },
];

describe('PersonalRecordsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('shows loading spinner', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<PersonalRecordsCard />, { wrapper: createWrapper() });
    expect(screen.getByText('Personal Records')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ sessions: [] }) });
    render(<PersonalRecordsCard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Your personal records')).toBeInTheDocument();
    });
  });

  it('renders PRs when data exists', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ sessions: mockSessionsWithPRs }) });
    render(<PersonalRecordsCard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Bench Press')).toBeInTheDocument();
      expect(screen.getByText('Barbell Squat')).toBeInTheDocument();
    });
  });
});

