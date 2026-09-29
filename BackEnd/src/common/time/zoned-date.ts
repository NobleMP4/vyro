/**
 * Calendar dates in a user's time zone, using only Intl (no dependency).
 * A "local date" is an ISO string `YYYY-MM-DD`: what the user calls
 * « aujourd'hui », whatever the server's own time zone.
 */
export type IsoDate = string;

export interface WeekRange {
  /** Monday of the current week. */
  start: IsoDate;
  /** Sunday of the current week. */
  end: IsoDate;
  today: IsoDate;
  /** 0 = Monday … 6 = Sunday. */
  todayIndex: number;
}

const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export function isValidTimeZone(timeZone: string): boolean {
  try {
    new Intl.DateTimeFormat('en-US', { timeZone });
    return true;
  } catch {
    return false;
  }
}

/** The local calendar date and weekday of `instant` in `timeZone`. */
export function localDate(
  instant: Date,
  timeZone: string,
): { date: IsoDate; weekdayIndex: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'short',
  }).formatToParts(instant);
  const get = (type: Intl.DateTimeFormatPartTypes) => parts.find((p) => p.type === type)!.value;
  return {
    date: `${get('year')}-${get('month')}-${get('day')}`,
    weekdayIndex: WEEKDAYS.indexOf(get('weekday')),
  };
}

/** Pure calendar arithmetic on ISO dates (no time zone involved). */
export function addDays(date: IsoDate, days: number): IsoDate {
  const d = new Date(`${date}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Monday → Sunday week containing `instant`, in the user's time zone. */
export function weekRange(instant: Date, timeZone: string): WeekRange {
  const { date, weekdayIndex } = localDate(instant, timeZone);
  const start = addDays(date, -weekdayIndex);
  return { start, end: addDays(start, 6), today: date, todayIndex: weekdayIndex };
}
