'use client';

import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Area } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { DashboardCard } from '@/components/dashboard/DashboardCard';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Tooltip as UiTooltip, TooltipTrigger as UiTooltipTrigger, TooltipContent as UiTooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { fetchAllSessionsNormalized, type NormalizedSession } from '@/lib/services/sessions';
import { extractUniqueExercises, mostFrequentExercise, type UniqueExercise } from '@/lib/utils/exercise-extraction';
import { calculateEstimated1RM, extractProgressData, summarizeProgress, type ProgressDataPoint } from '@/lib/stats/one-rep-max';
import { aggregateWeeklyMetrics, summarizeSeries } from '@/lib/stats/progress-metrics';
import { format } from 'date-fns';
import { useDateRange, type DateRangeOption } from '@/contexts/DateRangeContext';

type RangeKey = '4w' | '12w' | '6m' | '1y';

function rangeToDates(range: RangeKey): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date(end);
  if (range === '4w') start.setDate(end.getDate() - 28);
  else if (range === '12w') start.setDate(end.getDate() - 84);
  else if (range === '6m') start.setMonth(end.getMonth() - 6);
  else if (range === '1y') start.setFullYear(end.getFullYear() - 1);
  return { start, end };
}

function EmptyProgressState() {
  return (
    <div className="py-12 text-center">
      <div className="inline-flex items-center justify-center rounded-full bg-muted p-3 mb-3">
        <TrendingUp className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="text-sm text-muted-foreground">Select an exercise to track progress</p>
    </div>
  );
}

export function ProgressChartCard() {
  const { range: globalRange } = useDateRange();
  // Map global range to local range key
  const mapGlobalToLocal = (r: DateRangeOption): RangeKey => {
    if (r === '7days') return '4w';
    if (r === '30days') return '4w';
    if (r === '90days') return '12w';
    return '1y'; // 'all'
  };
  const [range, setRange] = useState<RangeKey>(mapGlobalToLocal(globalRange));
  const { data: sessions = [], isLoading, error } = useQuery<NormalizedSession[]>({
    queryKey: ['sessions', 'all'],
    queryFn: () => fetchAllSessionsNormalized({ warnTag: 'ProgressChartCard' }),
    staleTime: 5 * 60 * 1000,
  });

  // Build exercise options
  const allExercises = useMemo<UniqueExercise[]>(() => extractUniqueExercises(sessions), [sessions]);
  const [selected, setSelected] = useState<string | null>(null);
  const [exerciseOpen, setExerciseOpen] = useState(false);

  const { start, end } = useMemo(() => rangeToDates(range), [range]);

  // Compute per-exercise count of valid weekly data points in the current range
  // We aggregate by week to avoid the "two sessions in one week → only one plotted point" bug.
  const eligibleExercises = useMemo<UniqueExercise[]>(() => {
    const map = new Map<string, UniqueExercise>();
    // Build a set of candidate exercise ids+names from raw logs first
    sessions.forEach((s) => (s.logs || []).forEach((l) => {
      const id = l.exerciseId || l.id;
      if (!id) return;
      if (!map.has(id)) map.set(id, { id, name: l.name || 'Unknown Exercise', frequency: 0 });
    }));
    // For each candidate, count weekly aggregated points (> 1) within range
    const result: UniqueExercise[] = [];
    Array.from(map.entries()).forEach(([id, entry]) => {
      const weekly = aggregateWeeklyMetrics(sessions, id, start, end, 1);
      const validPoints = weekly.filter((w) => (w.est1rm ?? 0) > 0 || (w.maxWeight ?? 0) > 0 || (w.totalWeight ?? 0) > 0).length;
      if (validPoints > 1) result.push({ ...entry, frequency: validPoints });
    });
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }, [sessions, start, end]);

  // Ensure selected exercise is valid for current range; default to first eligible
  useEffect(() => {
    if (selected && eligibleExercises.some((e) => e.id === selected)) return;
    if (eligibleExercises.length > 0) {
      setSelected(eligibleExercises[0].id);
    } else {
      setSelected(null);
    }
  }, [eligibleExercises, selected]);

  const progress = useMemo<ProgressDataPoint[]>(() => {
    if (!selected) return [];
    return extractProgressData(sessions, selected, start, end);
  }, [sessions, selected, start, end]);

  // Weekly aggregated metrics for the multi-metric chart
  const weekly = useMemo(() => {
    if (!selected) return [] as ReturnType<typeof aggregateWeeklyMetrics>;
    return aggregateWeeklyMetrics(sessions, selected, start, end, 1);
  }, [sessions, selected, start, end]);

  const [metrics, setMetrics] = useState<{ est: boolean; max: boolean; total: boolean }>(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('progress.metrics');
        if (raw) return JSON.parse(raw);
      } catch {}
    }
    return { est: true, max: false, total: false };
  });

  useEffect(() => {
    try { if (typeof window !== 'undefined') window.localStorage.setItem('progress.metrics', JSON.stringify(metrics)); } catch {}
  }, [metrics]);

  const seriesData = useMemo(() =>
    weekly.map((w) => ({ x: w.weekStart, est: w.est1rm, max: w.maxWeight, total: w.totalWeight })),
  [weekly]);

  // Unit preference (kg/lb) — read-only respect
  const getUnit = () => {
    if (typeof window === 'undefined') return 'kg' as 'kg' | 'lbs';
    const v = window.localStorage.getItem('unitPreference');
    return v === 'lbs' ? 'lbs' : 'kg';
  };
  const [unit, setUnit] = useState<'kg' | 'lbs'>(getUnit());
  useEffect(() => {
    const handle = () => setUnit(getUnit());
    if (typeof window !== 'undefined') window.addEventListener('storage', handle);
    return () => { if (typeof window !== 'undefined') window.removeEventListener('storage', handle); };
  }, []);
  const toUnit = (v: number | null | undefined) => {
    if (v == null || !Number.isFinite(v)) return null as any;
    return unit === 'lbs' ? v * 2.2046226218 : v;
  };
  const unitLabel = unit === 'lbs' ? 'lb' : 'kg';

  const chartData = useMemo(() => seriesData.map(d => ({ x: (d.x as Date)?.getTime?.() ? (d.x as Date).getTime() : (d.x as any), est: toUnit(d.est), max: toUnit(d.max), total: toUnit(d.total) })), [seriesData, unit]);

  // Determine primary metric for footer stats by priority
  const primaryKey = metrics.est ? 'est' : metrics.max ? 'max' : 'total';
  const primaryLabel = primaryKey === 'est' ? 'Est. 1RM' : primaryKey === 'max' ? 'Max weight' : 'Total weight';
  const stats = useMemo(() => {
    if (primaryKey === 'est') return summarizeSeries(seriesData.map((d) => d.est ?? null));
    if (primaryKey === 'max') return summarizeSeries(seriesData.map((d) => d.max ?? null));
    return summarizeSeries(seriesData.map((d) => (typeof d.total === 'number' ? d.total : null)));
  }, [primaryKey, seriesData]);

  const primaryDates = useMemo(() => {
    const pick = (d: typeof seriesData[number]) => (primaryKey === 'est' ? d.est : primaryKey === 'max' ? d.max : (typeof d.total === 'number' ? d.total : null));
    let first: Date | null = null;
    let last: Date | null = null;
    for (let i = 0; i < seriesData.length; i++) {
      const v = pick(seriesData[i]);
      if (v != null && Number.isFinite(v)) { first = seriesData[i].x as Date; break; }
    }
    for (let i = seriesData.length - 1; i >= 0; i--) {
      const v = pick(seriesData[i]);
      if (v != null && Number.isFinite(v)) { last = seriesData[i].x as Date; break; }
    }
    return { startDate: first, endDate: last };
  }, [seriesData, primaryKey]);

  useEffect(() => {
    console.log('[Analytics] Dashboard Card Viewed', {
      cardType: 'progress',
      hasData: progress.length > 0,
      exerciseId: selected,
      timestamp: new Date().toISOString(),
    });
  }, [selected, progress.length]);

  const applyExerciseSelection = (id: string | null) => {
    setSelected(id);
    const name = eligibleExercises.find((x) => x.id === id)?.name || 'Unknown';
    console.log('[Analytics] Dashboard Card Interaction', {
      cardType: 'progress',
      action: 'exercise_selected',
      exerciseId: id,
      exerciseName: name,
      timestamp: new Date().toISOString(),
    });
  };
  const onExerciseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    applyExerciseSelection(e.target.value || null);
  };

  // Loading and error handling
  // Wrap with shared DashboardCard for consistent header/states
  if (isLoading || error) {
    return (
      <DashboardCard
        title="Progress Tracking"
        description="Exercise 1RM over time"
        isLoading={isLoading}
        isError={!!error}
        errorMessage="Failed to load progress data"
      >
        {/* Body not shown during loading/error */}
      </DashboardCard>
    );
  }

  const exerciseOptions = eligibleExercises.map((ex) => (
    <option key={ex.id} value={ex.id}>
      {ex.name}
    </option>
  ));

  const MetricChip = ({ id, label, color, pressed, onToggle, tooltip }: { id: 'est' | 'max' | 'total'; label: string; color: string; pressed: boolean; onToggle: () => void; tooltip: string }) => (
    <TooltipProvider>
      <UiTooltip>
        <UiTooltipTrigger asChild>
          <button
            type="button"
            className={`h-8 px-3 rounded-pill border text-xs inline-flex items-center gap-2 transition ${pressed ? 'bg-muted' : 'bg-transparent'} focus:outline-none focus:ring-2 focus:ring-ring`}
            aria-pressed={pressed}
            onClick={() => {
              onToggle();
              console.log('[Analytics] Dashboard Card Interaction', { cardType: 'progress', action: 'metric_toggled', metric: id, enabled: !pressed });
            }}
          >
            <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
            {label}
            {pressed && <span aria-hidden>✓</span>}
          </button>
        </UiTooltipTrigger>
        <UiTooltipContent side="top" className="max-w-xs text-xs">
          {tooltip}
        </UiTooltipContent>
      </UiTooltip>
    </TooltipProvider>
  );

  return (
    <DashboardCard title="Progress Tracking" description="Estimated 1RM over time" analyticsProps={{ metricsOn: Object.entries(metrics).filter(([_, v]) => v).map(([k]) => k) }}>
        {/* Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
          {/* Exercise Combobox */}
          <Popover open={exerciseOpen} onOpenChange={setExerciseOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="justify-between h-10 w-full">
                {eligibleExercises.find((e) => e.id === selected)?.name || 'Select exercise…'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-[min(320px,90vw)]">
              <Command>
                <CommandInput placeholder="Search exercises..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup>
                    {eligibleExercises.map((ex) => (
                      <CommandItem
                        key={ex.id}
                        value={ex.name}
                        onSelect={() => {
                          applyExerciseSelection(ex.id);
                          setExerciseOpen(false);
                        }}
                      >
                        {ex.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>

          {/* Time range Select */}
          <Select value={range} onValueChange={(v) => setRange(v as RangeKey)}>
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Last 12 weeks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4w">Last 4 weeks</SelectItem>
              <SelectItem value="12w">Last 12 weeks</SelectItem>
              <SelectItem value="6m">Last 6 months</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Custom per-card range is allowed silently; no global reset notice */}

        {/* Metrics chips */}
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground mr-1 inline-flex items-center gap-1">
            Metrics:
            <TooltipProvider>
              <UiTooltip>
                <UiTooltipTrigger asChild>
                  <button className="text-xs underline text-muted-foreground/80 hover:text-text-secondary" aria-label="Metrics info">i</button>
                </UiTooltipTrigger>
                <UiTooltipContent side="bottom" className="p-3 w-[min(320px,90vw)] text-xs">
                  <p className="mb-2"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{background:'#1099F5'}} /> Est. 1RM — Epley formula: weight × (1 + reps/30). Uses the best set for each week.</p>
                  <p className="mb-2"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{background:'#FF6600'}} /> Max weight — Highest single-set weight performed that week.</p>
                  <p><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{background:'#7c3aed'}} /> Total weight — Weekly sum of weight×reps across all sets.</p>
                </UiTooltipContent>
              </UiTooltip>
            </TooltipProvider>
            {/* Keep click-driven popover as well for mobile users without hover */}
            <Popover>
              <PopoverTrigger asChild>
                <button className="sr-only" aria-label="Open metrics info">info</button>
              </PopoverTrigger>
              <PopoverContent className="p-3 w-[min(320px,90vw)] text-xs">
                <p className="mb-2"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{background:'#1099F5'}} /> Est. 1RM — Epley formula: weight × (1 + reps/30). Uses the best set for each week.</p>
                <p className="mb-2"><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{background:'#FF6600'}} /> Max weight — Highest single-set weight performed that week.</p>
                <p><span className="inline-block w-2.5 h-2.5 rounded-full mr-2" style={{background:'#7c3aed'}} /> Total weight — Weekly sum of weight×reps across all sets.</p>
              </PopoverContent>
            </Popover>
          </span>
          <MetricChip id="est" label="Est. 1RM" color="#1099F5" pressed={metrics.est} onToggle={() => setMetrics({ ...metrics, est: !metrics.est })} tooltip="Estimated 1RM using Epley formula; best set per week" />
          <MetricChip id="max" label="Max weight" color="#FF6600" pressed={metrics.max} onToggle={() => setMetrics({ ...metrics, max: !metrics.max })} tooltip="Highest single-set weight per week" />
          <MetricChip id="total" label="Total weight" color="#7c3aed" pressed={metrics.total} onToggle={() => setMetrics({ ...metrics, total: !metrics.total })} tooltip="Sum of weight×reps across the week" />
        </div>

        {/* Body */}
        {!selected ? (
          <EmptyProgressState />
        ) : progress.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">Not enough data for selected exercise</div>
        ) : (
          <div className="flex flex-col">
            <div className="h-[340px] w-full mx-auto" role="img" aria-label="Progress metrics over time">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#DFE1E6" />
                  <XAxis
                    dataKey="x"
                    type="number"
                    domain={["dataMin", "dataMax"]}
                    tickFormatter={(d: number) => {
                      const dt = new Date(d);
                      return isNaN(dt.getTime()) ? '' : format(dt, 'MMM d');
                    }}
                    stroke="#A4ABB8"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis yAxisId={0} stroke="#94a3b8" tick={{ fontSize: 12 }} label={{ value: `Weight (${unitLabel})`, angle: -90, position: 'insideLeft', style: { fill: '#94a3b8', fontSize: 12 } }} />
                  {metrics.total && (
                    <YAxis
                      yAxisId={1}
                      orientation="right"
                      stroke="#A4ABB8"
                      tick={{ fontSize: 12 }}
                      label={{ value: `Total (${unitLabel})`, angle: 90, position: 'insideRight', style: { fill: '#94a3b8', fontSize: 12 } }}
                      type="number"
                      domain={[0, 'dataMax']}
                      allowDecimals={false}
                      allowDataOverflow
                    />
                  )}
                  <Tooltip
                    trigger="hover"
                    cursor={{ stroke: '#A4ABB8', strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #DFE1E6', borderRadius: 8 }}
                    formatter={(value: number, name: string) => {
                      const labelMap: Record<string,string> = { est: 'Est. 1RM', max: 'Max weight', total: 'Total weight' };
                      const roundedValue = typeof value === 'number' ? value.toFixed(2) : value;
                      return [`${roundedValue} ${unitLabel}`, labelMap[name] || name];
                    }}
                    labelFormatter={(label) => {
                      const dt = new Date(label as any);
                      return isNaN(dt.getTime()) ? '' : format(dt, 'PP');
                    }}
                  />
                  {metrics.est && (
                    <Line yAxisId={0} type="monotone" dataKey="est" name="est" stroke="#1099F5" dot={{ r: 2 }} activeDot={{ r: 3 }} strokeWidth={2} connectNulls />
                  )}
                  {metrics.max && (
                    <Line yAxisId={0} type="monotone" dataKey="max" name="max" stroke="#FF6600" strokeDasharray="6 6" dot={{ r: 2 }} activeDot={{ r: 3 }} strokeWidth={2} connectNulls />
                  )}
                  {metrics.total && (
                    <Line
                      key={`total-${unit}-${range}-${selected}`}
                      yAxisId={1}
                      type="linear"
                      dataKey="total"
                      name="total"
                      stroke="#7c3aed"
                      strokeDasharray="2 4"
                      dot={{ r: 2 }}
                      activeDot={{ r: 3 }}
                      strokeWidth={2.5}
                      connectNulls
                      isAnimationActive={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Horizontal stats bar */}
            {stats && (
              <div className="mt-3 border-t pt-3 grid grid-cols-3 gap-3 text-center">
                <div className="col-span-3 -mt-1 mb-1 text-[11px] text-muted-foreground">Summary based on {primaryLabel}</div>
                <div>
                  <p className="text-xs text-muted-foreground">Starting</p>
                  <p className="text-base font-medium text-text-secondary">
                    {toUnit(stats.start).toFixed(2)} {unitLabel}
                    {primaryDates.startDate ? (
                      <span className="text-xs text-muted-foreground"> ({format(primaryDates.startDate, 'MMM d')})</span>
                    ) : null}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Current</p>
                  <p className="text-base font-semibold text-text-primary">{toUnit(stats.current).toFixed(2)} {unitLabel}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Progress</p>
                  <p className={`text-base font-medium ${stats.changeAbs > 0 ? 'text-success-green' : stats.changeAbs < 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                    {stats.changeAbs >= 0 ? '+' : ''}{toUnit(stats.changeAbs).toFixed(2)} {unitLabel} {stats.changePct ? `(${stats.changePct >= 0 ? '+' : ''}${stats.changePct.toFixed(1)}%)` : ''}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
    </DashboardCard>
  );
}

export default ProgressChartCard;
