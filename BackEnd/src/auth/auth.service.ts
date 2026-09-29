import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import { generateToken, hashToken } from '../common/crypto/tokens';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { EnvironmentVariables } from '../config/env.validation';
import { MailService } from '../mail/mail.service';
import { passwordResetEmail } from '../mail/templates';
import { PrismaService } from '../prisma/prisma.service';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { toUserResponse, userWithProfile } from '../users/user.mapper';
import { PASSWORD_RESET_TTL_MINUTES } from './auth.constants';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { PasswordService } from './password.service';
import { SessionService, SessionTokens } from './session.service';

export interface AuthResult extends SessionTokens {
  user: UserResponseDto;
}

@Injectable()
export class AuthService {
  private readonly refreshSecret: string;
  private readonly frontendUrl: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly passwords: PasswordService,
    private readonly sessions: SessionService,
    private readonly mail: MailService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.refreshSecret = config.get('JWT_REFRESH_SECRET', { infer: true });
    this.frontendUrl = config.get('FRONTEND_URL', { infer: true }).split(',')[0].trim();
  }

  async register(dto: RegisterDto, userAgent?: string): Promise<AuthResult> {
    const passwordHash = await this.passwords.hash(dto.password);
    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          passwordHash,
          profile: { create: { displayName: dto.displayName } },
        },
        include: userWithProfile,
      });
      const tokens = await this.sessions.create(user, userAgent);
      return { ...tokens, user: toUserResponse(user) };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new AppException(
          HttpStatus.CONFLICT,
          ErrorCode.EMAIL_ALREADY_USED,
          'Un compte existe déjà avec cet email.',
        );
      }
      throw error;
    }
  }

  async login(dto: LoginDto, userAgent?: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: userWithProfile,
    });
    const valid = user
      ? await this.passwords.verify(user.passwordHash, dto.password)
      : await this.passwords.verifyAgainstDummy(dto.password);
    if (!user || !valid) {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.INVALID_CREDENTIALS,
        'Email ou mot de passe incorrect.',
      );
    }

    await Promise.all([
      this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } }),
      this.sessions.pruneForUser(user.id),
    ]);
    const tokens = await this.sessions.create(user, userAgent);
    return { ...tokens, user: toUserResponse(user) };
  }

  async refresh(rawToken: string | undefined, userAgent?: string): Promise<AuthResult> {
    const { userId, ...tokens } = await this.sessions.rotate(rawToken, userAgent);
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: userWithProfile,
    });
    return { ...tokens, user: toUserResponse(user) };
  }

  logout(rawToken: string | undefined): Promise<void> {
    return this.sessions.revoke(rawToken);
  }

  /**
   * Always resolves the same way whether the email exists or not,
   * so the endpoint can't be used to discover registered emails.
   */
  async forgotPassword(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: { select: { displayName: true } } },
    });
    if (!user) return;

    const token = generateToken();
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
      this.prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(token, this.refreshSecret),
          expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MINUTES * 60_000),
        },
      }),
    ]);

    const resetUrl = `${this.frontendUrl}/reset-password?token=${encodeURIComponent(token)}`;
    await this.mail.send(
      passwordResetEmail({
        to: user.email,
        displayName: user.profile?.displayName ?? '',
        resetUrl,
        ttlMinutes: PASSWORD_RESET_TTL_MINUTES,
      }),
    );
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const record = await this.prisma.passwordResetToken.findUnique({
      where: { tokenHash: hashToken(dto.token, this.refreshSecret) },
    });
    if (!record || record.usedAt || record.expiresAt.getTime() <= Date.now()) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_RESET_TOKEN,
        'Ce lien de réinitialisation est invalide ou expiré.',
      );
    }

    const passwordHash = await this.passwords.hash(dto.password);
    await this.prisma.$transaction([
      this.prisma.passwordResetToken.update({
        where: { id: record.id },
        data: { usedAt: new Date() },
      }),
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    ]);
    await this.sessions.revokeAllForUser(record.userId);
  }
}
