/**
 * React Query client configuration for EzLift web app
 * 
 * Configures global query and mutation defaults for data fetching
 * and caching across the application.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes - data is fresh for 5 minutes
      gcTime: 10 * 60 * 1000,    // 10 minutes - cached data kept for 10 minutes
      retry: 3,                   // Retry failed requests 3 times
      refetchOnWindowFocus: true, // Refetch when window regains focus
      refetchOnReconnect: true,   // Refetch when internet reconnects
    },
    mutations: {
      retry: 1,                   // Retry failed mutations once
    },
  },
});



