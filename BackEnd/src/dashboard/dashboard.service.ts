import { HttpStatus, Injectable } from '@nestjs/common';
import { ActivityType, Profile } from '@prisma/client';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { isValidTimeZone, weekRange } from '../common/time/zoned-date';
import { PrismaService } from '../prisma/prisma.service';
import {
  DashboardFeature,
  DashboardResponseDto,
  DashboardSectionDto,
  GettingStartedItemDto,
  GettingStartedStep,
  SectionStatus,
} from './dto/dashboard-response.dto';

const FALLBACK_TIME_ZONE = 'Europe/Paris';

const unavailable = (feature: DashboardFeature): DashboardSectionDto => ({
  status: SectionStatus.UNAVAILABLE,
  feature,
});

/**
 * Official dashboard data — the API is the source of truth for everything the
 * dashboard shows. Each section reports its status explicitly; sections whose
 * feature is not released yet are UNAVAILABLE (never zeros or made-up values).
 * Each feature phase replaces its `unavailable(...)` with a real computation.
 */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string, now: Date = new Date()): Promise<DashboardResponseDto> {
    const profile = await this.prisma.profile.findUnique({ where: { userId } });
    if (!profile) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        'Compte introuvable.',
      );
    }
    const timezone = isValidTimeZone(profile.timezone) ? profile.timezone : FALLBACK_TIME_ZONE;

    return {
      generatedAt: now,
      timezone,
      week: weekRange(now, timezone),
      plan: {
        mainGoal: profile.mainGoal,
        weeklyWorkoutTarget: profile.weeklyWorkoutTarget,
        favoriteActivities: Array.isArray(profile.favoriteActivities)
          ? (profile.favoriteActivities as ActivityType[])
          : [],
      },
      sections: {
        weekActivity: unavailable(DashboardFeature.WORKOUTS),
        weight: unavailable(DashboardFeature.WEIGHT),
        records: unavailable(DashboardFeature.RECORDS),
        streak: unavailable(DashboardFeature.WORKOUTS),
      },
      gettingStarted: this.gettingStarted(profile),
    };
  }

  private gettingStarted(profile: Profile): GettingStartedItemDto[] {
    return [
      { step: GettingStartedStep.ACCOUNT, done: true, available: true },
      {
        step: GettingStartedStep.PROFILE,
        done: profile.birthDate !== null && profile.heightCm !== null,
        available: true,
      },
      { step: GettingStartedStep.FIRST_WEIGHT, done: false, available: false },
      { step: GettingStartedStep.FIRST_WORKOUT, done: false, available: false },
    ];
  }
}
