'use client';

/**
 * Training Volume Card Component
 * Displays weekly training volume as a bar chart with stats.
 */

import { useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Dumbbell } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { useDateRange } from '@/contexts/DateRangeContext';
import { aggregateByWeek, calculatePercentageChange, formatVolume } from '@/lib/stats/aggregations';
import { fetchAllSessionsNormalized, type NormalizedSession } from '@/lib/services/sessions';

type WorkoutSession = NormalizedSession;

async function fetchSessions(): Promise<WorkoutSession[]> {
  return fetchAllSessionsNormalized({ warnTag: 'TrainingVolumeCard' });
}

function EmptyVolumeState() {
  const getMobileAppLink = () => {
    if (typeof window === 'undefined') return '#';
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);
    if (isIOS) return 'https://apps.apple.com/app/ezlift';
    if (isAndroid) return 'https://play.google.com/store/apps/details?id=com.ezlift';
    return '#';
  };

  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Activity className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">Track your first workout</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        Start tracking workouts to see your training volume and progress over time
      </p>
      <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
        <a href={getMobileAppLink()} target="_blank" rel="noopener noreferrer">
          Download Mobile App
        </a>
      </Button>
    </div>
  );
}

export function TrainingVolumeCard() {
  const { startDate, endDate, range } = useDateRange();

  const { data: sessions = [], isLoading, error } = useQuery({
    queryKey: ['sessions', 'all'],
    queryFn: () => fetchSessions(),
    staleTime: 5 * 60 * 1000,
  });

  const weeklyData = useMemo(() => {
    return aggregateByWeek(sessions, startDate, endDate);
  }, [sessions, startDate, endDate]);

  const currentWeek = weeklyData.find((w) => w.isCurrentWeek);
  const previousWeek = weeklyData[weeklyData.length - 2];
  const currentSets = currentWeek?.totalSets || 0;
  const currentVolume = currentWeek?.totalVolume || 0;
  const previousSets = previousWeek?.totalSets || 0;
  const percentChange = calculatePercentageChange(currentSets, previousSets);
  const isIncrease = percentChange > 0;
  const isDecrease = percentChange < 0;

  if (isLoading || error) {
    return (
      <DashboardCard
        title="Training Volume"
        description="Weekly workout volume"
        icon={<Dumbbell className="h-5 w-5 text-brand-blue" />}
        cardType="volume"
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load training data"
        analyticsProps={{
          hasData: weeklyData.length > 0,
          dateRange: range,
          sessionsCount: sessions.length,
          weeksDisplayed: weeklyData.length,
        }}
      >
        {/* Body not shown during loading/error */}
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Training Volume"
      description="Weekly sets and volume tracked"
      icon={<Dumbbell className="h-5 w-5 text-brand-blue" />}
      cardType="volume"
      analyticsProps={{
        hasData: weeklyData.length > 0,
        dateRange: range,
        sessionsCount: sessions.length,
        weeksDisplayed: weeklyData.length,
      }}
    >
      {weeklyData.length === 0 ? (
        <EmptyVolumeState />
      ) : (
        <>
        <div className="h-[200px] w-full" role="img" aria-label="Weekly training volume in sets">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="weekLabel" tick={{ fontSize: 12 }} stroke="#A4ABB8" />
              <YAxis tick={{ fontSize: 12 }} stroke="#A4ABB8" label={{ value: 'Sets', angle: -90, position: 'insideLeft', style: { fill: '#A4ABB8', fontSize: 12 } }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#fff', border: '1px solid #DFE1E6', borderRadius: '8px' }}
                formatter={(value: number) => [`${value} sets`, 'Total Sets']}
              />
              <Bar dataKey="totalSets" radius={[4, 4, 0, 0]} cursor="pointer" onClick={(data) => {
                console.log('[Analytics] Dashboard Card Interaction', { cardType: 'volume', action: 'bar_clicked', week: data?.activeLabel });
              }}>
                {weeklyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.isCurrentWeek ? '#1099F5' : '#A4ABB8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-baseline gap-2">
              <p className="text-2xl font-bold text-text-primary">{currentSets} sets</p>
              <p className="text-sm text-muted-foreground">this week</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-lg text-text-secondary">{formatVolume(currentVolume)} total</p>
            </div>
            {previousWeek && (
              <div className="flex items-center gap-2">
                {isIncrease && (
                  <>
                    <TrendingUp className="h-4 w-4 text-success-green" />
                    <p className="text-sm font-medium text-success-green">+{Math.abs(percentChange).toFixed(0)}% vs last week</p>
                  </>
                )}
                {isDecrease && (
                  <>
                    <TrendingDown className="h-4 w-4 text-destructive" />
                    <p className="text-sm font-medium text-destructive">{Math.abs(percentChange).toFixed(0)}% vs last week</p>
                  </>
                )}
                {!isIncrease && !isDecrease && <p className="text-sm text-muted-foreground">No change vs last week</p>}
              </div>
            )}
          </div>
        </>
      )}
    </DashboardCard>
  );
}

export default TrainingVolumeCard;
