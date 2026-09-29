import {
  formatClock,
  formatCompact,
  formatDelta,
  formatDistance,
  formatDuration,
  formatPace,
  formatRelativeDay,
  formatWeight,
  kgToLb,
  lbToKg,
} from './format';

// fr-FR uses narrow no-break spaces as thousands separators.
const normalize = (s: string) => s.replace(/[\u202f\u00a0]/g, ' ');

describe('format', () => {
  it('converts weight both ways without drift', () => {
    expect(kgToLb(100)).toBeCloseTo(220.462, 3);
    expect(lbToKg(kgToLb(78.4))).toBeCloseTo(78.4, 10);
  });

  it('formats weight and distance in the preferred unit', () => {
    expect(formatWeight(78.1, 'KG')).toBe('78,1 kg');
    expect(formatWeight(78.1, 'LB')).toBe('172,2 lb');
    expect(formatDistance(28.4, 'KM')).toBe('28,4 km');
    expect(formatDistance(10, 'MI')).toBe('6,2 mi');
  });

  it('formats durations for humans and as a clock', () => {
    expect(formatDuration(3 * 3600 + 42 * 60)).toBe('3 h 42');
    expect(formatDuration(754)).toBe('12 min 34 s');
    expect(formatDuration(600)).toBe('10 min');
    expect(formatDuration(45)).toBe('45 s');
    expect(formatClock(754)).toBe('12:34');
    expect(formatClock(3725)).toBe('1:02:05');
    expect(formatClock(5)).toBe('0:05');
  });

  it('formats pace per km or per mile', () => {
    expect(formatPace(312, 'KM')).toBe('5:12 /km');
    expect(formatPace(312, 'MI')).toBe('8:22 /mi');
  });

  it('formats signed deltas with a true minus sign', () => {
    expect(formatDelta(0.34)).toBe('+0,3');
    expect(formatDelta(-1.26)).toBe('−1,3');
    expect(formatDelta(0.01)).toBe('0');
  });

  it('formats compact numbers', () => {
    expect(normalize(formatCompact(12900))).toBe('12,9 k');
    expect(formatCompact(840)).toBe('840');
  });

  it('describes recent days relatively', () => {
    const now = new Date(2026, 8, 29, 12);
    expect(formatRelativeDay(new Date(2026, 8, 29, 8), now)).toBe('aujourd’hui');
    expect(formatRelativeDay(new Date(2026, 8, 28, 23), now)).toBe('hier');
    expect(formatRelativeDay(new Date(2026, 8, 25), now)).toBe('il y a 4 jours');
    expect(formatRelativeDay(new Date(2026, 8, 1), now)).toBe('1 sept.');
  });
});
