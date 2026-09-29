import type { DistanceUnit, WeightUnit } from '@/types/user';

/**
 * Formatting and unit conversion. The API always stores metric values
 * (kg, km, seconds); conversion to the user's units happens only for display
 * and input. Locale: fr-FR (decimal comma, narrow no-break space thousands).
 */
const LOCALE = 'fr-FR';

export const KG_PER_LB = 0.45359237;
export const KM_PER_MILE = 1.609344;

export const kgToLb = (kg: number) => kg / KG_PER_LB;
export const lbToKg = (lb: number) => lb * KG_PER_LB;
export const kmToMiles = (km: number) => km / KM_PER_MILE;
export const milesToKm = (miles: number) => miles * KM_PER_MILE;

export function formatNumber(value: number, maximumFractionDigits = 1): string {
  return new Intl.NumberFormat(LOCALE, { maximumFractionDigits }).format(value);
}

/** 12 900 → « 12,9 k » — for tight spaces (stat tiles, axes). */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(
    value,
  );
}

export function convertWeight(kg: number, unit: WeightUnit): number {
  return unit === 'LB' ? kgToLb(kg) : kg;
}

export function formatWeight(kg: number, unit: WeightUnit, fractionDigits = 1): string {
  return `${formatNumber(convertWeight(kg, unit), fractionDigits)} ${unit === 'LB' ? 'lb' : 'kg'}`;
}

export function convertDistance(km: number, unit: DistanceUnit): number {
  return unit === 'MI' ? kmToMiles(km) : km;
}

export function formatDistance(km: number, unit: DistanceUnit, fractionDigits = 1): string {
  return `${formatNumber(convertDistance(km, unit), fractionDigits)} ${unit === 'MI' ? 'mi' : 'km'}`;
}

/** 13 320 s → « 3 h 42 », 754 s → « 12 min 34 s », 45 s → « 45 s ». */
export function formatDuration(totalSeconds: number): string {
  const seconds = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')}`;
  if (m > 0) return s ? `${m} min ${String(s).padStart(2, '0')} s` : `${m} min`;
  return `${s} s`;
}

/** Stopwatch style: 754 → « 12:34 », 3 725 → « 1:02:05 ». */
export function formatClock(totalSeconds: number): string {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const mmss = `${String(m).padStart(h ? 2 : 1, '0')}:${String(s).padStart(2, '0')}`;
  return h ? `${h}:${mmss}` : mmss;
}

/** Pace from seconds per km: « 5:12 /km » or « 8:22 /mi ». */
export function formatPace(secondsPerKm: number, unit: DistanceUnit): string {
  const perUnit = unit === 'MI' ? secondsPerKm * KM_PER_MILE : secondsPerKm;
  const rounded = Math.round(perUnit);
  const m = Math.floor(rounded / 60);
  const s = rounded % 60;
  return `${m}:${String(s).padStart(2, '0')} /${unit === 'MI' ? 'mi' : 'km'}`;
}

/** Signed delta with a real minus sign: « +0,3 », « −1,2 », « 0 ». */
export function formatDelta(value: number, fractionDigits = 1): string {
  const rounded = Number(value.toFixed(fractionDigits));
  if (rounded === 0) return '0';
  const abs = formatNumber(Math.abs(rounded), fractionDigits);
  return rounded > 0 ? `+${abs}` : `−${abs}`;
}

export function formatDate(
  date: Date | string,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' },
): string {
  return new Intl.DateTimeFormat(LOCALE, options).format(new Date(date));
}

/** « aujourd’hui », « hier », « il y a 3 jours », then a short date. */
export function formatRelativeDay(date: Date | string, now: Date = new Date()): string {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOfDay(now) - startOfDay(new Date(date))) / 86_400_000);
  if (days === 0) return 'aujourd’hui';
  if (days === 1) return 'hier';
  if (days > 1 && days < 7) return `il y a ${days} jours`;
  return formatDate(date, {
    day: 'numeric',
    month: 'short',
    year: days > 300 ? 'numeric' : undefined,
  });
}
