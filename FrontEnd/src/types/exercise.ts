export type MuscleGroup =
  | 'CHEST'
  | 'BACK'
  | 'SHOULDERS'
  | 'BICEPS'
  | 'TRICEPS'
  | 'FOREARMS'
  | 'CORE'
  | 'QUADRICEPS'
  | 'HAMSTRINGS'
  | 'GLUTES'
  | 'CALVES'
  | 'FULL_BODY'
  | 'CARDIO';

export type Equipment =
  | 'BODYWEIGHT'
  | 'BARBELL'
  | 'DUMBBELL'
  | 'KETTLEBELL'
  | 'MACHINE'
  | 'CABLE'
  | 'BAND'
  | 'EZ_BAR'
  | 'SMITH_MACHINE'
  | 'OTHER';

export type Difficulty = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type TrackingType = 'WEIGHT_REPS' | 'REPS' | 'DURATION' | 'DISTANCE_DURATION';
export type ExerciseScope = 'all' | 'catalog' | 'mine';

export interface Exercise {
  id: string;
  name: string;
  description: string | null;
  instructions: string | null;
  tips: string | null;
  muscleGroup: MuscleGroup;
  secondaryMuscles: MuscleGroup[];
  equipment: Equipment;
  difficulty: Difficulty;
  trackingType: TrackingType;
  mediaUrl: string | null;
  isCustom: boolean;
}

export interface ExerciseFilters {
  search?: string;
  muscleGroup?: MuscleGroup;
  equipment?: Equipment;
  difficulty?: Difficulty;
  scope?: ExerciseScope;
}

export interface ExerciseInput {
  name: string;
  description?: string;
  instructions?: string;
  tips?: string;
  muscleGroup: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment: Equipment;
  difficulty?: Difficulty;
  trackingType?: TrackingType;
}

export interface Page<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
