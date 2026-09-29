export type WeightUnit = 'KG' | 'LB';
export type DistanceUnit = 'KM' | 'MI';
export type HeightUnit = 'CM' | 'FT';
export type ThemePreferenceApi = 'LIGHT' | 'DARK' | 'SYSTEM';
export type MainGoal =
  'LOSE_WEIGHT' | 'BUILD_MUSCLE' | 'GET_STRONGER' | 'IMPROVE_ENDURANCE' | 'STAY_ACTIVE';
export type ActivityType =
  | 'RUNNING'
  | 'WALKING'
  | 'CYCLING'
  | 'SWIMMING'
  | 'STRENGTH'
  | 'FOOTBALL'
  | 'BASKETBALL'
  | 'BOXING'
  | 'HIKING'
  | 'CLIMBING'
  | 'YOGA'
  | 'HIIT'
  | 'OTHER';

export interface Profile {
  displayName: string;
  avatarUrl: string | null;
  birthDate: string | null;
  heightCm: number | null;
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  heightUnit: HeightUnit;
  theme: ThemePreferenceApi;
  timezone: string;
  gamificationEnabled: boolean;
  mainGoal: MainGoal | null;
  weeklyWorkoutTarget: number | null;
  favoriteActivities: ActivityType[];
  onboardingCompleted: boolean;
}

export interface User {
  id: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  profile: Profile;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: User;
}

export type UpdateProfileInput = Partial<Omit<Profile, 'avatarUrl' | 'onboardingCompleted'>>;

export interface OnboardingInput {
  displayName: string;
  mainGoal: MainGoal;
  weeklyWorkoutTarget: number;
  favoriteActivities: ActivityType[];
  weightUnit: WeightUnit;
  distanceUnit: DistanceUnit;
  heightUnit: HeightUnit;
  timezone?: string;
}
