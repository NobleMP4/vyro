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
