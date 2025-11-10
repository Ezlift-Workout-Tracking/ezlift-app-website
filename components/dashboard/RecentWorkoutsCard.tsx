'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { CalendarDays, ClipboardList } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Button } from '@/components/ui/button';
import { fetchAllSessionsNormalized, type NormalizedSession } from '@/lib/services/sessions';
import { formatRelativeDate, formatDuration, hhmmssToMinutes } from '@/lib/utils/date-format';

function EmptyWorkoutsState() {
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
        <ClipboardList className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">No workouts yet</h3>
      <p className="text-sm text-muted-foreground mb-6">Download mobile app to track workouts</p>
      <Button asChild className="bg-brand-orange hover:bg-brand-orange/90">
        <a href={getMobileAppLink()} target="_blank" rel="noopener noreferrer">Download App</a>
      </Button>
    </div>
  );
}

export function RecentWorkoutsCard() {
  const { data: sessions = [], isLoading, error } = useQuery<NormalizedSession[]>({
    queryKey: ['sessions', 'all'],
    queryFn: () => fetchAllSessionsNormalized({ warnTag: 'RecentWorkoutsCard' }),
    staleTime: 5 * 60 * 1000,
  });

  const recent = useMemo(() => {
    const sorted = [...(sessions || [])].sort((a, b) =>
      new Date(b.sessionDate).getTime() - new Date(a.sessionDate).getTime()
    );
    return sorted.slice(0, 4);
  }, [sessions]);

  // Duplicate label map to optionally include time for ties
  const duplicateLabelMap = useMemo(() => {
    const counts = new Map<string, number>();
    recent.forEach((s) => {
      const label = formatRelativeDate(new Date(s.sessionDate));
      counts.set(label, (counts.get(label) || 0) + 1);
    });
    return counts;
  }, [recent]);

  const computeDurationMinutes = (s: NormalizedSession): number | undefined => {
    // 1) Prefer explicit HH:MM:SS string
    const fromString = hhmmssToMinutes((s as any).duration);
    if (fromString && fromString > 0) return fromString;

    // 2) Numeric minutes variants
    const directMinutes = (s as any).durationMinutes || (s as any).minutes || (s as any).estimatedDuration;
    if (typeof directMinutes === 'number' && directMinutes > 0) return directMinutes;

    // 3) Derive from logs (sets × avg set time + rests)
    const logs = s.logs || [];
    let totalSets = 0;
    logs.forEach((l) => { totalSets += (l.sets || []).length; });
    if (totalSets > 0) {
      const AVG_SET_SEC = 50;
      const AVG_REST_SEC = 60;
      const totalSec = totalSets * AVG_SET_SEC + Math.max(0, totalSets - 1) * AVG_REST_SEC;
      return Math.max(1, Math.round(totalSec / 60));
    }
    return undefined; // Unknown
  };

  const guessGroupsByName = (name?: string): { primary?: string; secondary?: string[] } => {
    if (!name) return {};
    const n = name.toLowerCase();
    const entry = (keyword: RegExp, primary: string, secondary: string[] = []) => ({ primary, secondary, ok: keyword.test(n) });
    const rules = [
      entry(/bench|chest press|pec/i, 'Chest', ['Shoulders', 'Triceps']),
      entry(/overhead press|ohp|shoulder press|military press|lateral raise|rear delt/i, 'Shoulders', ['Triceps']),
      entry(/row|pulldown|pull[- ]?up|chin[- ]?up|lat/i, 'Back', ['Biceps']),
      entry(/deadlift|rdl|good morning/i, 'Hamstrings', ['Back', 'Glutes']),
      entry(/squat|leg press|hack squat|front squat/i, 'Quads', ['Glutes', 'Hamstrings']),
      entry(/lunge|split squat|step[- ]?up/i, 'Glutes', ['Quads', 'Hamstrings']),
      entry(/hip thrust|glute bridge/i, 'Glutes', ['Hamstrings']),
      entry(/curl|biceps/i, 'Biceps', []),
      entry(/triceps|pushdown|extension|skull crusher|dip/i, 'Triceps', ['Chest']),
      entry(/calf/i, 'Calves', []),
      entry(/crunch|plank|ab|core|sit[- ]?up/i, 'Core', []),
    ];
    const hit = rules.find(r => r.ok);
    if (!hit) return {};
    return { primary: hit.primary, secondary: hit.secondary };
  };

  const computeSessionGroups = (s: NormalizedSession): string | null => {
    const scores = new Map<string, number>();
    let total = 0;
    (s.logs || []).forEach((log) => {
      const sets = log.sets || [];
      // score: sum of weight*reps; fallback reps; fallback 1 per set
      let score = 0;
      sets.forEach((set) => {
        if (typeof set.weight === 'number' && typeof set.reps === 'number') {
          score += set.weight * set.reps;
        } else if (typeof set.reps === 'number') {
          score += set.reps;
        } else {
          score += 1;
        }
      });
      if (score <= 0) score = sets.length > 0 ? sets.length : 1;

      const { primary, secondary } = guessGroupsByName(log.name);
      if (!primary && (!secondary || secondary.length === 0)) return; // unknown

      const add = (g: string, w: number) => {
        if (!g) return;
        scores.set(g, (scores.get(g) || 0) + score * w);
        total += score * w;
      };
      if (primary) add(primary, 1.0);
      (secondary || []).forEach((g) => add(g, 0.5));
    });

    const ranked = Array.from(scores.entries()).sort((a, b) => b[1] - a[1]);
    if (ranked.length === 0) return null;
    // Full body rule
    if (ranked.length >= 4 && ranked.every(([, v]) => v < 0.4 * total)) {
      return '💪 Full body';
    }
    const top2 = ranked.slice(0, 2).map(([g]) => g).join(', ');
    return `💪 ${top2}`;
  };

  const handleClick = (s: NormalizedSession) => {
    console.log('[Analytics] Dashboard Card Clicked', {
      action: 'view_detail',
      workoutId: s.workoutId || s.id,
      cardType: 'recent',
      timestamp: new Date().toISOString(),
    });
    toast({ title: 'Workout details', description: 'Coming soon' });
  };

  // Card "Viewed" analytics handled centrally by DashboardCard wrapper

  if (isLoading || error) {
    return (
      <DashboardCard
        title="Recent Workouts"
        description="Latest sessions"
        icon={<CalendarDays className="h-5 w-5 text-brand-blue" />}
        cardType="recent"
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load recent workouts"
        analyticsProps={{ hasData: recent.length > 0, workoutCount: recent.length }}
      >
        {/* Body hidden during loading/error */}
      </DashboardCard>
    );
  }

  return (
    <DashboardCard
      title="Recent Workouts"
      description="Last 3–5 sessions"
      icon={<CalendarDays className="h-5 w-5 text-brand-blue" />}
      cardType="recent"
      analyticsProps={{ hasData: recent.length > 0, workoutCount: recent.length }}
    >
        {(!recent || recent.length === 0) ? (
          <EmptyWorkoutsState />
        ) : (
        <>
        <div className="divide-y divide-border">
          {recent.slice(0, 4).map((s) => {
            const minutes = computeDurationMinutes(s);
            const exCount = s.logs?.length || 0;
            const baseLabel = formatRelativeDate(new Date(s.sessionDate));
            const needsTime = (duplicateLabelMap.get(baseLabel) || 0) > 1 && !baseLabel.startsWith('Today');
            const displayLabel = needsTime ? `${baseLabel}, ${format(new Date(s.sessionDate), 'h:mm a')}` : baseLabel;
            const groupsLabel = computeSessionGroups(s);
            return (
              <div key={s.id} className="py-3 first:pt-0 last:pb-0">
                <div className="p-2 rounded-lg hover:bg-muted cursor-pointer transition" onClick={() => handleClick(s)}>
                  <p className="text-sm font-semibold text-text-primary">
                    {displayLabel}
                  </p>
                  <p className="text-base text-text-secondary">
                    {s.workoutTitle || (s as any).routineTitle || 'Workout'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {minutes ? formatDuration(minutes) : '—'} • {exCount} {exCount === 1 ? 'exercise' : 'exercises'}
                  </p>
                  {groupsLabel && (
                    <p className="text-sm text-muted-foreground truncate">{groupsLabel}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-4">
          <Link href="/app/history" className="text-brand-blue hover:underline text-sm font-medium">
            View History →
          </Link>
        </div>
        </>
        )}
    </DashboardCard>
  );
}

export default RecentWorkoutsCard;
