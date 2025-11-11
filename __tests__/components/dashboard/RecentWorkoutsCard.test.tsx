import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RecentWorkoutsCard } from '@/components/dashboard/RecentWorkoutsCard';

// Mock fetch used by sessions service
global.fetch = jest.fn();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

const now = new Date();
const day = 24 * 60 * 60 * 1000;

const mockSessions = [
  { id: 'a', sessionDate: new Date(now.getTime() - 1 * day).toISOString(), duration: '01:15:00', logs: [{ id: 'x', sets: [{}] }] },
  { id: 'b', sessionDate: new Date(now.getTime() - 2 * day).toISOString(), duration: '00:45:00', logs: [{ id: 'y', sets: [{}] }] },
  { id: 'c', sessionDate: new Date(now.getTime() - 3 * day).toISOString(), duration: '00:30:00', logs: [{ id: 'z', sets: [{}] }] },
];

describe('RecentWorkoutsCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading spinner', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<RecentWorkoutsCard />, { wrapper: createWrapper() });
    expect(screen.getByText('Recent Workouts')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('renders empty state', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ sessions: [] }) });
    render(<RecentWorkoutsCard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('No workouts yet')).toBeInTheDocument();
    });
  });

  it('renders recent sessions list', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ sessions: mockSessions }) });
    render(<RecentWorkoutsCard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Recent Workouts')).toBeInTheDocument();
      // Should show at least one meta line with exercise count (singular or plural)
      const matches = [
        ...(screen.queryAllByText(/\bexercise\b/i) || []),
        ...(screen.queryAllByText(/\bexercises\b/i) || []),
      ];
      expect(matches.length).toBeGreaterThan(0);
    });
  });
});
