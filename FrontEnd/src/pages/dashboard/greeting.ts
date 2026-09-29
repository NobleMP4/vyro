/** « Bonjour » in the daytime, « Bonsoir » from 18h. */
export function greeting(now: Date = new Date()): string {
  const hour = now.getHours();
  return hour >= 18 || hour < 5 ? 'Bonsoir' : 'Bonjour';
}

/** « mardi 30 septembre » */
export function longToday(isoDate: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(new Date(`${isoDate}T12:00:00Z`));
}

/** « 28 sept. – 4 oct. » for a week given as ISO dates. */
export function weekLabel(start: string, end: string): string {
  const format = (iso: string) =>
    new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(
      new Date(`${iso}T12:00:00Z`),
    );
  return `${format(start)} – ${format(end)}`;
}
