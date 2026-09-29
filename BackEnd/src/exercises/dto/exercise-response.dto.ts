import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Difficulty, Equipment, ExerciseTrackingType, MuscleGroup } from '@prisma/client';
import { PaginationMetaDto } from '../../common/dto/pagination.dto';

export class ExerciseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'Développé couché' })
  name: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  description: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  instructions: string | null;

  @ApiPropertyOptional({ type: String, nullable: true })
  tips: string | null;

  @ApiProperty({ enum: MuscleGroup })
  muscleGroup: MuscleGroup;

  @ApiProperty({ enum: MuscleGroup, isArray: true })
  secondaryMuscles: MuscleGroup[];

  @ApiProperty({ enum: Equipment })
  equipment: Equipment;

  @ApiProperty({ enum: Difficulty })
  difficulty: Difficulty;

  @ApiProperty({ enum: ExerciseTrackingType, description: 'Which metrics a set records' })
  trackingType: ExerciseTrackingType;

  @ApiPropertyOptional({ type: String, nullable: true })
  mediaUrl: string | null;

  @ApiProperty({ description: "True for the user's own exercise (editable)" })
  isCustom: boolean;
}

export class ExerciseListResponseDto extends PaginationMetaDto {
  @ApiProperty({ type: ExerciseResponseDto, isArray: true })
  items: ExerciseResponseDto[];
}
