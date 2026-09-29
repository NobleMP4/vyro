/**
 * Y-axis domain with round bounds and round ticks (1 / 2 / 2.5 / 5 × 10ⁿ),
 * so axes read 78 · 79 · 80 instead of 78,1 · 78,7 · 79,2.
 */
export function niceDomain(
  values: number[],
  { tickCount = 5, includeZero = false }: { tickCount?: number; includeZero?: boolean } = {},
): { domain: [number, number]; ticks: number[] } {
  const finite = values.filter(Number.isFinite);
  if (!finite.length) return { domain: [0, 1], ticks: [0, 1] };

  let min = Math.min(...finite);
  let max = Math.max(...finite);
  if (includeZero) min = Math.min(0, min);
  if (min === max) {
    const pad = Math.abs(min) * 0.05 || 1;
    min -= pad;
    max += pad;
  }

  const rawStep = (max - min) / Math.max(1, tickCount - 1);
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep)!;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;

  const ticks: number[] = [];
  for (let t = lo; t <= hi + step / 2; t += step) ticks.push(Number(t.toFixed(10)));
  return { domain: [lo, hi], ticks };
}
