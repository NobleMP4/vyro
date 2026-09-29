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
