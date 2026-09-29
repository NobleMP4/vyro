import type { SegmentOption } from '@/components/ui/segmented-control';
import type { DistanceUnit, HeightUnit, WeightUnit } from '@/types/user';

export const WEIGHT_UNIT_OPTIONS: SegmentOption<WeightUnit>[] = [
  { value: 'KG', label: 'kg' },
  { value: 'LB', label: 'lb' },
];
export const DISTANCE_UNIT_OPTIONS: SegmentOption<DistanceUnit>[] = [
  { value: 'KM', label: 'km' },
  { value: 'MI', label: 'miles' },
];
export const HEIGHT_UNIT_OPTIONS: SegmentOption<HeightUnit>[] = [
  { value: 'CM', label: 'cm' },
  { value: 'FT', label: 'ft / in' },
];
