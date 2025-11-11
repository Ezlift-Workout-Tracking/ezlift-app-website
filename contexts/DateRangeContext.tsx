'use client';

/**
 * Date Range Context
 * 
 * Provides global date range state for all dashboard cards.
 * Range is synced with URL query parameter for persistence.
 */

import { createContext, useContext, useMemo, ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { subDays } from 'date-fns';

export type DateRangeOption = '7days' | '30days' | '90days' | 'all';

interface DateRangeContextValue {
  range: DateRangeOption;
  startDate: Date;
  endDate: Date;
  label: string;
}

const DateRangeContext = createContext<DateRangeContextValue | null>(null);

/**
 * Calculate start/end dates based on range option
 */
function getDateRange(range: DateRangeOption): { startDate: Date; endDate: Date; label: string } {
  const now = new Date();
  const endDate = now;

  switch (range) {
    case '7days':
      return {
        startDate: subDays(now, 7),
        endDate,
        label: 'Last 7 Days',
      };
    case '30days':
      return {
        startDate: subDays(now, 30),
        endDate,
        label: 'Last 30 Days',
      };
    case '90days':
      return {
        startDate: subDays(now, 90),
        endDate,
        label: 'Last 90 Days',
      };
    case 'all':
      return {
        startDate: new Date(0), // Unix epoch
        endDate,
        label: 'All Time',
      };
    default:
      return {
        startDate: subDays(now, 30),
        endDate,
        label: 'Last 30 Days',
      };
  }
}

export function DateRangeProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const range = (searchParams.get('range') || '30days') as DateRangeOption;

  const value = useMemo(() => {
    const { startDate, endDate, label } = getDateRange(range);
    return { range, startDate, endDate, label };
  }, [range]);

  return (
    <DateRangeContext.Provider value={value}>
      {children}
    </DateRangeContext.Provider>
  );
}

/**
 * Hook to access date range context
 * 
 * @example
 * ```tsx
 * function TrainingVolumeCard() {
 *   const { startDate, endDate, range } = useDateRange();
 *   
 *   const { data } = useQuery({
 *     queryKey: ['sessions', startDate, endDate],
 *     queryFn: () => fetchSessions({ startDate, endDate })
 *   });
 * }
 * ```
 */
export function useDateRange(): DateRangeContextValue {
  const context = useContext(DateRangeContext);
  if (!context) {
    throw new Error('useDateRange must be used within DateRangeProvider');
  }
  return context;
}



