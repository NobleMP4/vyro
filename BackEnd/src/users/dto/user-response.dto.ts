import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ActivityType,
  DistanceUnit,
  HeightUnit,
  MainGoal,
  ThemePreference,
  UserRole,
  WeightUnit,
} from '@prisma/client';

export class ProfileResponseDto {
  @ApiProperty({ example: 'Alex' })
  displayName: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  avatarUrl: string | null;

  @ApiPropertyOptional({ type: String, nullable: true, example: '1995-04-12' })
  birthDate: string | null;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 178.5 })
  heightCm: number | null;

  @ApiProperty({ enum: WeightUnit })
  weightUnit: WeightUnit;

  @ApiProperty({ enum: DistanceUnit })
  distanceUnit: DistanceUnit;

  @ApiProperty({ enum: HeightUnit })
  heightUnit: HeightUnit;

  @ApiProperty({ enum: ThemePreference })
  theme: ThemePreference;

  @ApiProperty()
  gamificationEnabled: boolean;

  @ApiPropertyOptional({ enum: MainGoal, nullable: true })
  mainGoal: MainGoal | null;

  @ApiPropertyOptional({ type: Number, nullable: true, example: 4 })
  weeklyWorkoutTarget: number | null;

  @ApiProperty({ enum: ActivityType, isArray: true })
  favoriteActivities: ActivityType[];

  @ApiProperty()
  onboardingCompleted: boolean;
}

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'alex@example.com' })
  email: string;

  @ApiProperty({ enum: UserRole })
  role: UserRole;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: ProfileResponseDto })
  profile: ProfileResponseDto;
}
