import { format, isToday, isYesterday } from 'date-fns';

export function formatRelativeDate(date: Date): string {
  if (isToday(date)) {
    return `Today, ${format(date, 'h:mm a')}`;
  }
  if (isYesterday(date)) {
    return 'Yesterday';
  }
  const days = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (days >= 2 && days < 7) {
    return `${days} days ago`;
  }
  return format(date, 'MMM d');
}

export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m}min`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function hhmmssToMinutes(duration?: string | null): number | undefined {
  if (!duration) return undefined;
  const parts = duration.split(':').map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return undefined;
  let h = 0, m = 0, s = 0;
  if (parts.length === 3) [h, m, s] = parts as [number, number, number];
  else if (parts.length === 2) [m, s] = parts as [number, number];
  else if (parts.length === 1) [s] = parts as [number];
  const totalMinutes = h * 60 + m + Math.round(s / 60);
  return totalMinutes;
}

