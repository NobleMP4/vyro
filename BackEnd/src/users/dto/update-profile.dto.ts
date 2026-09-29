import {
  ActivityType,
  DistanceUnit,
  HeightUnit,
  MainGoal,
  ThemePreference,
  WeightUnit,
} from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsTimeZone,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';
import { Trim } from '../../common/validation/transforms';

export const DISPLAY_NAME_MAX_LENGTH = 50;

/** Every field is optional: only the provided ones are updated. `null` clears nullable ones. */
export class UpdateProfileDto {
  /** Prénom ou pseudo */
  @IsOptional()
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(DISPLAY_NAME_MAX_LENGTH)
  displayName?: string;

  /** YYYY-MM-DD */
  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsDateString({ strict: true })
  birthDate?: string | null;

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsNumber({ maxDecimalPlaces: 1 })
  @Min(50)
  @Max(272)
  heightCm?: number | null;

  @IsOptional()
  @IsEnum(WeightUnit)
  weightUnit?: WeightUnit;

  @IsOptional()
  @IsEnum(DistanceUnit)
  distanceUnit?: DistanceUnit;

  @IsOptional()
  @IsEnum(HeightUnit)
  heightUnit?: HeightUnit;

  @IsOptional()
  @IsEnum(ThemePreference)
  theme?: ThemePreference;

  @IsOptional()
  @IsBoolean()
  gamificationEnabled?: boolean;

  /** IANA time zone, e.g. Europe/Paris */
  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsEnum(MainGoal)
  mainGoal?: MainGoal | null;

  @IsOptional()
  @ValidateIf((_o, value) => value !== null)
  @IsInt()
  @Min(1)
  @Max(14)
  weeklyWorkoutTarget?: number | null;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(Object.keys(ActivityType).length)
  @IsEnum(ActivityType, { each: true })
  favoriteActivities?: ActivityType[];
}
