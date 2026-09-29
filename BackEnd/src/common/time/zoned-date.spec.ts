import { addDays, isValidTimeZone, localDate, weekRange } from './zoned-date';

describe('zoned-date', () => {
  it('validates IANA time zones', () => {
    expect(isValidTimeZone('Europe/Paris')).toBe(true);
    expect(isValidTimeZone('America/Los_Angeles')).toBe(true);
    expect(isValidTimeZone('Mars/Olympus')).toBe(false);
  });

  it('gives the local date, not the UTC one', () => {
    // 23:30 UTC on Sunday 27 Sept is already Monday 28 in Paris (UTC+2)…
    const instant = new Date('2026-09-27T23:30:00Z');
    expect(localDate(instant, 'Europe/Paris')).toEqual({ date: '2026-09-28', weekdayIndex: 0 });
    // …and still Sunday afternoon in Los Angeles.
    expect(localDate(instant, 'America/Los_Angeles')).toEqual({
      date: '2026-09-27',
      weekdayIndex: 6,
    });
  });

  it('computes the Monday–Sunday week in the user time zone', () => {
    expect(weekRange(new Date('2026-09-30T10:00:00Z'), 'Europe/Paris')).toEqual({
      start: '2026-09-28',
      end: '2026-10-04',
      today: '2026-09-30',
      todayIndex: 2,
    });
    // Same instant, different week for a user in Los Angeles.
    expect(weekRange(new Date('2026-09-27T23:30:00Z'), 'America/Los_Angeles').start).toBe(
      '2026-09-21',
    );
  });

  it('adds days across months and years', () => {
    expect(addDays('2026-12-30', 3)).toBe('2027-01-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});
