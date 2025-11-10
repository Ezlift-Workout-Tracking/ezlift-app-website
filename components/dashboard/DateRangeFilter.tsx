'use client';

/**
 * Date Range Filter Component
 * 
 * Global filter for dashboard analytics cards.
 * Syncs with URL query parameter and updates all cards simultaneously.
 */

import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from 'lucide-react';
import type { DateRangeOption } from '@/contexts/DateRangeContext';

const dateRangeOptions: { value: DateRangeOption; label: string }[] = [
  { value: '7days', label: 'Last 7 Days' },
  { value: '30days', label: 'Last 30 Days' },
  { value: '90days', label: 'Last 90 Days' },
  { value: 'all', label: 'All Time' },
];

export function DateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentRange = (searchParams.get('range') || '30days') as DateRangeOption;

  const handleRangeChange = (newRange: string) => {
    // Update URL query param
    const params = new URLSearchParams(searchParams);
    params.set('range', newRange);
    router.push(`/app?${params.toString()}`);

    // Analytics: Fire filter changed event
    console.log('[Analytics] Dashboard Filter Changed', {
      previousRange: currentRange,
      newRange,
      timestamp: new Date().toISOString(),
    });
  };

  return (
    <div className="flex items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      <Select value={currentRange} onValueChange={handleRangeChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {dateRangeOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}



