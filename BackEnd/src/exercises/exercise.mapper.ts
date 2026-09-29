import { Exercise, MuscleGroup, Prisma } from '@prisma/client';
import { ExerciseResponseDto } from './dto/exercise-response.dto';

const MUSCLE_GROUPS = new Set<string>(Object.values(MuscleGroup));

function toMuscles(value: Prisma.JsonValue | null): MuscleGroup[] {
  return Array.isArray(value)
    ? value.filter((v): v is MuscleGroup => typeof v === 'string' && MUSCLE_GROUPS.has(v))
    : [];
}

export function toExerciseResponse(exercise: Exercise): ExerciseResponseDto {
  return {
    id: exercise.id,
    name: exercise.name,
    description: exercise.description,
    instructions: exercise.instructions,
    tips: exercise.tips,
    muscleGroup: exercise.muscleGroup,
    secondaryMuscles: toMuscles(exercise.secondaryMuscles),
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    trackingType: exercise.trackingType,
    mediaUrl: exercise.mediaUrl,
    isCustom: exercise.ownerId !== null,
  };
}
