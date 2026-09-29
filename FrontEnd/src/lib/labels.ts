import type { Difficulty, Equipment, MuscleGroup, TrackingType } from '@/types/exercise';
import type { ActivityType, MainGoal } from '@/types/user';

export const MAIN_GOAL_LABELS: Record<MainGoal, { label: string; description: string }> = {
  BUILD_MUSCLE: { label: 'Prendre du muscle', description: 'Hypertrophie et volume' },
  GET_STRONGER: { label: 'Gagner en force', description: 'Soulever plus lourd' },
  LOSE_WEIGHT: { label: 'Perdre du poids', description: 'Affiner sa silhouette' },
  IMPROVE_ENDURANCE: {
    label: 'Améliorer mon endurance',
    description: 'Courir, rouler, nager plus loin',
  },
  STAY_ACTIVE: { label: 'Rester en forme', description: 'Bouger régulièrement' },
};

export const ACTIVITY_LABELS: Record<ActivityType, string> = {
  STRENGTH: 'Musculation',
  RUNNING: 'Course',
  WALKING: 'Marche',
  CYCLING: 'Vélo',
  SWIMMING: 'Natation',
  HIIT: 'HIIT',
  YOGA: 'Yoga',
  HIKING: 'Randonnée',
  CLIMBING: 'Escalade',
  BOXING: 'Boxe',
  FOOTBALL: 'Football',
  BASKETBALL: 'Basketball',
  OTHER: 'Autre',
};

export const ACTIVITY_TYPES = Object.keys(ACTIVITY_LABELS) as ActivityType[];
export const MAIN_GOALS = Object.keys(MAIN_GOAL_LABELS) as MainGoal[];

// ── Exercises ──────────────────────────────────────────────────

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  CHEST: 'Pectoraux',
  BACK: 'Dos',
  SHOULDERS: 'Épaules',
  BICEPS: 'Biceps',
  TRICEPS: 'Triceps',
  FOREARMS: 'Avant-bras',
  CORE: 'Abdominaux',
  QUADRICEPS: 'Quadriceps',
  HAMSTRINGS: 'Ischio-jambiers',
  GLUTES: 'Fessiers',
  CALVES: 'Mollets',
  FULL_BODY: 'Corps entier',
  CARDIO: 'Cardio',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  BODYWEIGHT: 'Poids du corps',
  BARBELL: 'Barre',
  DUMBBELL: 'Haltères',
  KETTLEBELL: 'Kettlebell',
  MACHINE: 'Machine',
  CABLE: 'Poulie',
  BAND: 'Élastique',
  EZ_BAR: 'Barre EZ',
  SMITH_MACHINE: 'Smith machine',
  OTHER: 'Autre',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  BEGINNER: 'Débutant',
  INTERMEDIATE: 'Intermédiaire',
  ADVANCED: 'Avancé',
};

export const TRACKING_TYPE_LABELS: Record<TrackingType, { label: string; description: string }> = {
  WEIGHT_REPS: { label: 'Charge × répétitions', description: 'Ex. 60 kg × 10' },
  REPS: { label: 'Répétitions', description: 'Au poids du corps, ex. 12 pompes' },
  DURATION: { label: 'Durée', description: 'Ex. gainage 45 s' },
  DISTANCE_DURATION: { label: 'Distance et durée', description: 'Ex. 2 km en 10 min' },
};

export const MUSCLE_GROUPS = Object.keys(MUSCLE_GROUP_LABELS) as MuscleGroup[];
export const EQUIPMENTS = Object.keys(EQUIPMENT_LABELS) as Equipment[];
export const DIFFICULTIES = Object.keys(DIFFICULTY_LABELS) as Difficulty[];
export const TRACKING_TYPES = Object.keys(TRACKING_TYPE_LABELS) as TrackingType[];
