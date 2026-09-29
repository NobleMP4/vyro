import { periodStart } from './period';

describe('periodStart', () => {
  const now = new Date(2026, 8, 29, 15, 30);

  it('includes today in day-based periods', () => {
    expect(periodStart('7d', now)).toEqual(new Date(2026, 8, 23));
    expect(periodStart('30d', now)).toEqual(new Date(2026, 7, 31));
  });

  it('handles month and year periods', () => {
    expect(periodStart('3m', now)).toEqual(new Date(2026, 5, 29));
    expect(periodStart('1y', now)).toEqual(new Date(2025, 8, 29));
    expect(periodStart('all', now)).toBeNull();
  });
});
