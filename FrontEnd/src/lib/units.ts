const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = Math.round(cm / CM_PER_INCH);
  return { feet: Math.floor(totalInches / INCHES_PER_FOOT), inches: totalInches % INCHES_PER_FOOT };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * INCHES_PER_FOOT + inches) * CM_PER_INCH * 10) / 10;
}

export function formatHeight(cm: number, unit: 'CM' | 'FT'): string {
  if (unit === 'CM') return `${cm.toLocaleString('fr-FR')} cm`;
  const { feet, inches } = cmToFeetInches(cm);
  return `${feet} ft ${inches} in`;
}
