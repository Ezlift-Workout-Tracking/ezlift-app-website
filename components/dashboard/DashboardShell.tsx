'use client';

/**
 * Dashboard Shell Component
 * 
 * Main container for dashboard with header and date range filter.
 * Wraps all dashboard cards in DateRangeProvider for global filter state.
 */

import { ReactNode, useEffect } from 'react';
import { DateRangeProvider } from '@/contexts/DateRangeContext';
import { DateRangeFilter } from './DateRangeFilter';
import { useUserDataState } from '@/hooks/useUserDataState';

interface DashboardShellProps {
  children: ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const { state } = useUserDataState();

  // Analytics: Dashboard Viewed
  useEffect(() => {
    console.log('[Analytics] Dashboard Viewed', {
      hasData: state === 'existing',
      dateRange: '30days', // Will be dynamic once filter integrated
      timestamp: new Date().toISOString(),
    });
  }, [state]);

  return (
    <DateRangeProvider>
      <div className="space-y-6">
        {/* Dashboard Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-section-header text-text-primary">Dashboard</h1>
            <p className="text-secondary text-text-secondary mt-1">
              Track your progress and performance
            </p>
          </div>
          <DateRangeFilter />
        </div>

        {/* Dashboard Content */}
        {children}
      </div>
    </DateRangeProvider>
  );
}


