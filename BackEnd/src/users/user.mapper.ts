import { ActivityType, Prisma, Profile, User } from '@prisma/client';
import { ProfileResponseDto, UserResponseDto } from './dto/user-response.dto';

export const userWithProfile = { profile: true } satisfies Prisma.UserInclude;
export type UserWithProfile = User & { profile: Profile | null };

const ACTIVITY_TYPES = new Set<string>(Object.values(ActivityType));

function toActivities(value: Prisma.JsonValue | null): ActivityType[] {
  return Array.isArray(value)
    ? value.filter((v): v is ActivityType => typeof v === 'string' && ACTIVITY_TYPES.has(v))
    : [];
}

function toProfile(profile: Profile): ProfileResponseDto {
  return {
    displayName: profile.displayName,
    avatarUrl: profile.avatarUrl,
    birthDate: profile.birthDate ? profile.birthDate.toISOString().slice(0, 10) : null,
    heightCm: profile.heightCm ? profile.heightCm.toNumber() : null,
    weightUnit: profile.weightUnit,
    distanceUnit: profile.distanceUnit,
    heightUnit: profile.heightUnit,
    theme: profile.theme,
    gamificationEnabled: profile.gamificationEnabled,
    mainGoal: profile.mainGoal,
    weeklyWorkoutTarget: profile.weeklyWorkoutTarget,
    favoriteActivities: toActivities(profile.favoriteActivities),
    onboardingCompleted: profile.onboardingCompleted,
  };
}

/** Public representation of a user: never exposes the password hash. */
export function toUserResponse(user: UserWithProfile): UserResponseDto {
  if (!user.profile) {
    throw new Error(`User ${user.id} has no profile`);
  }
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    profile: toProfile(user.profile),
  };
}
