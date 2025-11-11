/**
 * Dashboard Card Skeleton
 * 
 * Loading placeholder for dashboard cards.
 * Heights match actual card dimensions to prevent layout shift (CLS = 0).
 */

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function DashboardCardSkeleton() {
  return (
    <Card className="h-[340px]">
      <CardHeader>
        <Skeleton className="h-6 w-40" /> {/* Card title */}
        <Skeleton className="h-4 w-32 mt-2" /> {/* Subtitle */}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart/Main content area */}
        <Skeleton className="h-[200px] w-full" />
        
        {/* Stats */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Full-width program card skeleton
 */
export function ProgramCardSkeleton() {
  return (
    <Card className="h-[120px]">
      <CardContent className="flex items-center justify-between p-6">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-64" /> {/* Program title */}
          <Skeleton className="h-4 w-48" /> {/* Next workout */}
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-32" /> {/* Button 1 */}
          <Skeleton className="h-10 w-32" /> {/* Button 2 */}
        </div>
      </CardContent>
    </Card>
  );
}



