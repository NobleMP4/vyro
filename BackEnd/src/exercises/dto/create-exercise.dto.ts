import { Difficulty, Equipment, ExerciseTrackingType, MuscleGroup } from '@prisma/client';
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { Trim } from '../../common/validation/transforms';

export class CreateExerciseDto {
  /** @example Tirage poitrine prise serrée */
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(4000)
  instructions?: string;

  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(2000)
  tips?: string;

  @IsEnum(MuscleGroup)
  muscleGroup: MuscleGroup;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @ArrayMaxSize(6)
  @IsEnum(MuscleGroup, { each: true })
  secondaryMuscles?: MuscleGroup[];

  @IsEnum(Equipment)
  equipment: Equipment;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(ExerciseTrackingType)
  trackingType?: ExerciseTrackingType;
}
