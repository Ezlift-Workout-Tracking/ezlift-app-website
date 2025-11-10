'use client';

/**
 * Personal Records Card Component
 * Displays top 5 personal records (max weight × reps per exercise).
 */

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Flame, Dumbbell, Trophy, Badge as LucideBadge } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { useDateRange } from '@/contexts/DateRangeContext';
import { calculatePersonalRecords, formatRelativeDate, formatWeight } from '@/lib/stats/personal-records';
import { fetchAllSessionsNormalized, type NormalizedSession } from '@/lib/services/sessions';
import { toast } from '@/hooks/use-toast';

type WorkoutSession = NormalizedSession;

async function fetchSessions(): Promise<WorkoutSession[]> {
  return fetchAllSessionsNormalized({ warnTag: 'PersonalRecordsCard' });
}

function EmptyPRsState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Trophy className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Your personal records</h3>
      <p className="text-sm text-muted-foreground mb-2">will appear here</p>
      <p className="text-sm text-muted-foreground">Track your first workout to set your baseline!</p>
    </div>
  );
}

export function PersonalRecordsCard() {
  const { startDate, endDate, range } = useDateRange();

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['sessions', 'all'],
    queryFn: () => fetchSessions(),
    staleTime: 5 * 60 * 1000,
  });

  const prs = useMemo(() => {
    return calculatePersonalRecords(sessions, startDate, endDate);
  }, [sessions, startDate, endDate]);

  if (isLoading || error) {
    return (
      <DashboardCard
        title="Personal Records"
        description="Top strength achievements"
        icon={<Dumbbell className="h-5 w-5 text-brand-blue" />}
        cardType="prs"
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load personal records"
      >
        {null}
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Personal Records"
      description="Top strength achievements from selected period"
      icon={<Dumbbell className="h-5 w-5 text-brand-blue" />}
      cardType="prs"
      analyticsProps={{ hasData: prs.length > 0, prCount: prs.length, dateRange: range }}
    >
      {prs.length === 0 ? (
        <EmptyPRsState />
      ) : (
        <div className="space-y-2">
          {prs.map((pr) => (
            <div
              key={pr.exerciseId}
              className="flex items-start gap-3 p-2 rounded hover:bg-muted cursor-pointer transition"
              onClick={() => toast({ title: 'Details coming soon', description: 'PR detail view is planned.' })}
            >
              <div className="mt-1">
                {pr.isRecent ? (
                  <Flame className="h-5 w-5 text-brand-orange" />
                ) : (
                  <Dumbbell className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-base text-text-primary truncate flex items-center gap-2">
                  {pr.exerciseName}
                  {pr.isRecent && (
                    <span className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-[2px] rounded-pill">New</span>
                  )}
                </p>
                <p className="text-sm text-text-secondary">{formatWeight(pr.weight)} × {pr.reps} reps</p>
                <p className="text-xs text-muted-foreground">{formatRelativeDate(pr.date)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardCard>
  );
}

export default PersonalRecordsCard;
