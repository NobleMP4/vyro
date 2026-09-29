import { HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PasswordService } from '../auth/password.service';
import { SessionService, SessionTokens } from '../auth/session.service';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { PrismaService } from '../prisma/prisma.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { toUserResponse, userWithProfile } from './user.mapper';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
  ) {}

  async getMe(userId: string): Promise<UserResponseDto> {
    return toUserResponse(await this.findOrFail(userId));
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<UserResponseDto> {
    const { birthDate, ...rest } = dto;
    const data: Prisma.ProfileUpdateInput = { ...rest };
    if (birthDate !== undefined) {
      data.birthDate = birthDate === null ? null : this.parseBirthDate(birthDate);
    }
    return this.updateAndReturn(userId, data);
  }

  completeOnboarding(userId: string, dto: CompleteOnboardingDto): Promise<UserResponseDto> {
    return this.updateAndReturn(userId, { ...dto, onboardingCompleted: true });
  }

  /** Changes the password and signs out every other device. Returns a fresh session. */
  async changePassword(
    userId: string,
    dto: ChangePasswordDto,
    userAgent?: string,
  ): Promise<SessionTokens> {
    const user = await this.findOrFail(userId);
    await this.assertPassword(user.passwordHash, dto.currentPassword);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: await this.passwords.hash(dto.newPassword) },
    });
    await this.sessions.revokeAllForUser(userId);
    return this.sessions.create(user, userAgent);
  }

  /** Permanently deletes the account and all its data (cascade). */
  async deleteAccount(userId: string, password: string): Promise<void> {
    const user = await this.findOrFail(userId);
    await this.assertPassword(user.passwordHash, password);
    await this.prisma.user.delete({ where: { id: userId } });
  }

  private async updateAndReturn(
    userId: string,
    data: Prisma.ProfileUpdateInput,
  ): Promise<UserResponseDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { profile: { update: data } },
      include: userWithProfile,
    });
    return toUserResponse(user);
  }

  private async findOrFail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: userWithProfile,
    });
    // The access token can outlive a deleted account by a few minutes.
    if (!user) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.UNAUTHORIZED,
        'Compte introuvable.',
      );
    }
    return user;
  }

  private async assertPassword(hash: string, password: string): Promise<void> {
    if (!(await this.passwords.verify(hash, password))) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_PASSWORD,
        'Mot de passe actuel incorrect.',
      );
    }
  }

  private parseBirthDate(value: string): Date {
    const date = new Date(`${value}T00:00:00.000Z`);
    const now = new Date();
    if (date > now || date.getUTCFullYear() < 1900) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.VALIDATION_FAILED,
        'Date de naissance invalide.',
        [{ field: 'birthDate', errors: ['birthDate must be between 1900 and today'] }],
      );
    }
    return date;
  }
}
