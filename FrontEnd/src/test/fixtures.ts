import { deviceTimeZone } from '@/lib/timezone';
import type { Dashboard } from '@/types/dashboard';
import type { Exercise } from '@/types/exercise';
import type { AuthResponse, User } from '@/types/user';

export function makeUser(
  overrides: { profile?: Partial<User['profile']> } & Partial<Omit<User, 'profile'>> = {},
): User {
  const { profile, ...rest } = overrides;
  return {
    id: 'user-1',
    email: 'alex@vyro.test',
    role: 'USER',
    createdAt: '2026-09-01T10:00:00.000Z',
    ...rest,
    profile: {
      displayName: 'Alex',
      avatarUrl: null,
      birthDate: null,
      heightCm: null,
      weightUnit: 'KG',
      distanceUnit: 'KM',
      heightUnit: 'CM',
      theme: 'SYSTEM',
      // Same as the test device, so TimezoneSync stays idle unless a test wants it.
      timezone: deviceTimeZone(),
      gamificationEnabled: true,
      mainGoal: 'BUILD_MUSCLE',
      weeklyWorkoutTarget: 4,
      favoriteActivities: ['STRENGTH', 'RUNNING'],
      onboardingCompleted: true,
      ...profile,
    },
  };
}

export function authResponse(user: User = makeUser(), accessToken = 'access-1'): AuthResponse {
  return { accessToken, expiresIn: 900, user };
}

export const healthy = {
  status: 'ok',
  database: 'up',
  version: '0.1.0',
  uptime: 1,
  timestamp: '2026-01-01T00:00:00.000Z',
};

export function makeDashboard(overrides: Partial<Dashboard> = {}): Dashboard {
  return {
    generatedAt: '2026-09-30T10:00:00.000Z',
    timezone: 'Europe/Paris',
    week: { start: '2026-09-28', end: '2026-10-04', today: '2026-09-30', todayIndex: 2 },
    plan: {
      mainGoal: 'BUILD_MUSCLE',
      weeklyWorkoutTarget: 4,
      favoriteActivities: ['STRENGTH', 'RUNNING'],
    },
    sections: {
      weekActivity: { status: 'UNAVAILABLE', feature: 'WORKOUTS' },
      weight: { status: 'UNAVAILABLE', feature: 'WEIGHT' },
      records: { status: 'UNAVAILABLE', feature: 'RECORDS' },
      streak: { status: 'UNAVAILABLE', feature: 'WORKOUTS' },
    },
    gettingStarted: [
      { step: 'ACCOUNT', done: true, available: true },
      { step: 'PROFILE', done: false, available: true },
      { step: 'FIRST_WEIGHT', done: false, available: false },
      { step: 'FIRST_WORKOUT', done: false, available: false },
    ],
    ...overrides,
  };
}

export function makeExercise(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: 'ex-bench',
    name: 'Développé couché',
    description: 'Exercice polyarticulaire de référence pour les pectoraux.',
    instructions: 'Descends la barre au milieu de la poitrine puis pousse.',
    tips: 'Omoplates serrées.',
    muscleGroup: 'CHEST' as const,
    secondaryMuscles: ['TRICEPS' as const, 'SHOULDERS' as const],
    equipment: 'BARBELL' as const,
    difficulty: 'INTERMEDIATE' as const,
    trackingType: 'WEIGHT_REPS' as const,
    mediaUrl: null,
    isCustom: false,
    ...overrides,
  };
}

export function page<T>(items: T[], { total = items.length, page = 1, pageSize = 24 } = {}) {
  return { items, total, page, pageSize, hasMore: page * pageSize < total };
}
