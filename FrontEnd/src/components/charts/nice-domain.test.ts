import { niceDomain } from './nice-domain';

describe('niceDomain', () => {
  it('rounds a weight range to whole ticks', () => {
    expect(niceDomain([78.1, 79.4, 80.3])).toEqual({ domain: [78, 81], ticks: [78, 79, 80, 81] });
  });

  it('includes zero for magnitudes (bars)', () => {
    expect(niceDomain([3, 4, 5, 2], { includeZero: true })).toEqual({
      domain: [0, 6],
      ticks: [0, 2, 4, 6],
    });
  });

  it('handles a flat series and empty input', () => {
    expect(niceDomain([80, 80]).domain[0]).toBeLessThan(80);
    expect(niceDomain([80, 80]).domain[1]).toBeGreaterThan(80);
    expect(niceDomain([])).toEqual({ domain: [0, 1], ticks: [0, 1] });
  });
});
