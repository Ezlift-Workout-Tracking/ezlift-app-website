/**
 * Training Volume Card Component Tests
 */

import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TrainingVolumeCard } from '@/components/dashboard/TrainingVolumeCard';
import { DateRangeProvider } from '@/contexts/DateRangeContext';

// Mock fetch
global.fetch = jest.fn();

// Mock console.log for analytics
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <DateRangeProvider>{children}</DateRangeProvider>
      </QueryClientProvider>
    );
  };
}

const now = new Date();
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

const mockSessions = [
  {
    id: '1',
    sessionDate: yesterday.toISOString(),
    logs: [
      { id: 'log1', name: 'Bench Press', sets: [{ reps: 10, weight: 100 }, { reps: 8, weight: 110 }] },
    ],
  },
  {
    id: '2',
    sessionDate: twoDaysAgo.toISOString(),
    logs: [
      { id: 'log2', name: 'Squats', sets: [{ reps: 10, weight: 150 }, { reps: 10, weight: 150 }] },
    ],
  },
];

describe('TrainingVolumeCard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockClear();
  });

  it('should show loading spinner while fetching data', async () => {
    (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
    const { container } = render(<TrainingVolumeCard />, { wrapper: createWrapper() });
    expect(screen.getByText('Training Volume')).toBeInTheDocument();
    expect(container.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should show error message when API fails', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));
    render(<TrainingVolumeCard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Failed to load training data')).toBeInTheDocument();
    });
  });

  it('should handle 404 gracefully (endpoint not implemented)', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: false, status: 404 });
    const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    render(<TrainingVolumeCard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(mockConsoleWarn).toHaveBeenCalled();
    });
    mockConsoleWarn.mockRestore();
  });

  it('should render card with title', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ sessions: mockSessions }) });
    render(<TrainingVolumeCard />, { wrapper: createWrapper() });
    await waitFor(() => {
      expect(screen.getByText('Training Volume')).toBeInTheDocument();
    });
  });

  it('should track analytics on mount', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({ ok: true, json: async () => ({ sessions: mockSessions }) });
    render(<TrainingVolumeCard />, { wrapper: createWrapper() });
    await waitFor(() => {
      const call = mockConsoleLog.mock.calls.find((c) => c[0] === '[Analytics] Dashboard Card Viewed' && c[1].cardType === 'volume');
      expect(call).toBeDefined();
    });
  });
});

