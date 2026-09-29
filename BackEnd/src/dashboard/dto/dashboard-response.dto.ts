import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType, MainGoal } from '@prisma/client';

export enum SectionStatus {
  /** Data available. */
  READY = 'READY',
  /** Feature available, but the user has no data yet. */
  EMPTY = 'EMPTY',
  /** Feature not released yet: shown as « bientôt », never with made-up numbers. */
  UNAVAILABLE = 'UNAVAILABLE',
}

export enum DashboardFeature {
  WORKOUTS = 'WORKOUTS',
  WEIGHT = 'WEIGHT',
  RECORDS = 'RECORDS',
  ACTIVITIES = 'ACTIVITIES',
}

export class DashboardSectionDto {
  @ApiProperty({ enum: SectionStatus })
  status: SectionStatus;

  @ApiProperty({ enum: DashboardFeature })
  feature: DashboardFeature;

  @ApiPropertyOptional({ description: 'Section payload when status is READY', type: Object })
  data?: Record<string, unknown>;
}

export class DashboardWeekDto {
  @ApiProperty({ example: '2026-09-28', description: 'Monday, in the user time zone' })
  start: string;

  @ApiProperty({ example: '2026-10-04', description: 'Sunday, in the user time zone' })
  end: string;

  @ApiProperty({ example: '2026-09-30' })
  today: string;

  @ApiProperty({ example: 2, description: '0 = Monday … 6 = Sunday' })
  todayIndex: number;
}

export class DashboardPlanDto {
  @ApiPropertyOptional({ enum: MainGoal, nullable: true })
  mainGoal: MainGoal | null;

  @ApiPropertyOptional({ type: Number, nullable: true })
  weeklyWorkoutTarget: number | null;

  @ApiProperty({ enum: ActivityType, isArray: true })
  favoriteActivities: ActivityType[];
}

export enum GettingStartedStep {
  ACCOUNT = 'ACCOUNT',
  PROFILE = 'PROFILE',
  FIRST_WEIGHT = 'FIRST_WEIGHT',
  FIRST_WORKOUT = 'FIRST_WORKOUT',
}

export class GettingStartedItemDto {
  @ApiProperty({ enum: GettingStartedStep })
  step: GettingStartedStep;

  @ApiProperty()
  done: boolean;

  @ApiProperty({ description: 'False while the related feature is not released' })
  available: boolean;
}

export class DashboardSectionsDto {
  @ApiProperty({ type: DashboardSectionDto })
  weekActivity: DashboardSectionDto;

  @ApiProperty({ type: DashboardSectionDto })
  weight: DashboardSectionDto;

  @ApiProperty({ type: DashboardSectionDto })
  records: DashboardSectionDto;

  @ApiProperty({ type: DashboardSectionDto })
  streak: DashboardSectionDto;
}

export class DashboardResponseDto {
  @ApiProperty()
  generatedAt: Date;

  @ApiProperty({ example: 'Europe/Paris' })
  timezone: string;

  @ApiProperty({ type: DashboardWeekDto })
  week: DashboardWeekDto;

  @ApiProperty({ type: DashboardPlanDto })
  plan: DashboardPlanDto;

  @ApiProperty({ type: DashboardSectionsDto })
  sections: DashboardSectionsDto;

  @ApiProperty({ type: GettingStartedItemDto, isArray: true })
  gettingStarted: GettingStartedItemDto[];
}
