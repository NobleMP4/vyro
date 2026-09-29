const FALLBACK = 'Europe/Paris';

/** IANA time zone of this device (used for « today », weeks and streaks). */
export function deviceTimeZone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || FALLBACK;
  } catch {
    return FALLBACK;
  }
}
