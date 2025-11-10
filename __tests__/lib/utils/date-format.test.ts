import { formatRelativeDate, formatDuration, hhmmssToMinutes } from '@/lib/utils/date-format';

describe('date-format utils', () => {
  it('formats Today with time', () => {
    const now = new Date();
    const res = formatRelativeDate(now);
    expect(res.startsWith('Today')).toBe(true);
  });

  it('formats Yesterday', () => {
    const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(d)).toBe('Yesterday');
  });

  it('formats days ago for 3 days', () => {
    const d = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    expect(formatRelativeDate(d)).toBe('3 days ago');
  });

  it('formats duration minutes', () => {
    expect(formatDuration(45)).toBe('45min');
    expect(formatDuration(60)).toBe('1h');
    expect(formatDuration(75)).toBe('1h 15min');
  });

  it('converts HH:MM:SS to minutes', () => {
    expect(hhmmssToMinutes('01:15:00')).toBe(75);
    expect(hhmmssToMinutes('00:45:30')).toBe(46); // rounds seconds
    expect(hhmmssToMinutes('15:00')).toBe(15);
  });
});

