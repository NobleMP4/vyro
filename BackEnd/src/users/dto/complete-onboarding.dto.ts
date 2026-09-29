import { ActivityType, DistanceUnit, HeightUnit, MainGoal, WeightUnit } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsTimeZone,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Trim } from '../../common/validation/transforms';
import { DISPLAY_NAME_MAX_LENGTH } from './update-profile.dto';

export class CompleteOnboardingDto {
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(DISPLAY_NAME_MAX_LENGTH)
  displayName: string;

  @IsEnum(MainGoal)
  mainGoal: MainGoal;

  /** Entraînements visés par semaine */
  @IsInt()
  @Min(1)
  @Max(14)
  weeklyWorkoutTarget: number;

  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(Object.keys(ActivityType).length)
  @IsEnum(ActivityType, { each: true })
  favoriteActivities: ActivityType[];

  @IsEnum(WeightUnit)
  weightUnit: WeightUnit;

  @IsEnum(DistanceUnit)
  distanceUnit: DistanceUnit;

  @IsEnum(HeightUnit)
  heightUnit: HeightUnit;

  /** IANA time zone of the device, e.g. Europe/Paris */
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
