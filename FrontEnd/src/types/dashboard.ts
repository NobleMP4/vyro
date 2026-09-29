import type { ActivityType, MainGoal } from './user';

export type SectionStatus = 'READY' | 'EMPTY' | 'UNAVAILABLE';
export type DashboardFeature = 'WORKOUTS' | 'WEIGHT' | 'RECORDS' | 'ACTIVITIES';

export interface DashboardSection {
  status: SectionStatus;
  feature: DashboardFeature;
  data?: Record<string, unknown>;
}

export type GettingStartedStep = 'ACCOUNT' | 'PROFILE' | 'FIRST_WEIGHT' | 'FIRST_WORKOUT';

export interface Dashboard {
  generatedAt: string;
  timezone: string;
  week: { start: string; end: string; today: string; todayIndex: number };
  plan: {
    mainGoal: MainGoal | null;
    weeklyWorkoutTarget: number | null;
    favoriteActivities: ActivityType[];
  };
  sections: {
    weekActivity: DashboardSection;
    weight: DashboardSection;
    records: DashboardSection;
    streak: DashboardSection;
  };
  gettingStarted: { step: GettingStartedStep; done: boolean; available: boolean }[];
}
