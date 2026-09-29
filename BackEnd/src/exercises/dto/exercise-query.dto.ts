import { Difficulty, Equipment, MuscleGroup } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { Trim } from '../../common/validation/transforms';

export enum ExerciseScope {
  /** Catalog + the user's own exercises */
  ALL = 'all',
  CATALOG = 'catalog',
  MINE = 'mine',
}

export class ExerciseQueryDto extends PaginationQueryDto {
  /** Name contains (case and accent insensitive) */
  @IsOptional()
  @Trim()
  @IsString()
  @MaxLength(100)
  search?: string;

  @IsOptional()
  @IsEnum(MuscleGroup)
  muscleGroup?: MuscleGroup;

  @IsOptional()
  @IsEnum(Equipment)
  equipment?: Equipment;

  @IsOptional()
  @IsEnum(Difficulty)
  difficulty?: Difficulty;

  @IsOptional()
  @IsEnum(ExerciseScope)
  scope: ExerciseScope = ExerciseScope.ALL;
}
