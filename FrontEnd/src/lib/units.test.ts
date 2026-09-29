import { cmToFeetInches, feetInchesToCm, formatHeight } from './units';

describe('units', () => {
  it('converts between cm and feet/inches', () => {
    expect(cmToFeetInches(180)).toEqual({ feet: 5, inches: 11 });
    expect(feetInchesToCm(5, 11)).toBe(180.3);
  });

  it('formats a height in the preferred unit', () => {
    expect(formatHeight(178.5, 'CM')).toBe('178,5 cm');
    expect(formatHeight(178.5, 'FT')).toBe('5 ft 10 in');
  });
});
