import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserRole } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { generateToken, hashToken } from '../common/crypto/tokens';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { EnvironmentVariables } from '../config/env.validation';
import { PrismaService } from '../prisma/prisma.service';
import {
  ACCESS_TOKEN_TTL_SECONDS,
  REFRESH_REUSE_GRACE_MS,
  REFRESH_TOKEN_TTL_DAYS,
} from './auth.constants';
import type { AccessTokenPayload } from './auth.types';

export interface SessionTokens {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Access tokens: short-lived JWTs, verified statelessly.
 * Refresh tokens: opaque random strings stored as HMACs, rotated on every use.
 * Reusing an already-rotated token (outside a short grace window) revokes the
 * whole token family — the signature of a stolen token.
 */
@Injectable()
export class SessionService {
  private readonly logger = new Logger(SessionService.name);
  private readonly refreshSecret: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    config: ConfigService<EnvironmentVariables, true>,
  ) {
    this.refreshSecret = config.get('JWT_REFRESH_SECRET', { infer: true });
  }

  /** Starts a new session (login, register, password change). */
  async create(user: { id: string; role: UserRole }, userAgent?: string): Promise<SessionTokens> {
    return this.issue(user, randomUUID(), userAgent);
  }

  /** Exchanges a refresh token for a new pair. */
  async rotate(
    rawToken: string | undefined,
    userAgent?: string,
  ): Promise<SessionTokens & { userId: string }> {
    if (!rawToken) throw this.invalid();

    const record = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashToken(rawToken, this.refreshSecret) },
      include: { user: { select: { id: true, role: true } } },
    });
    if (!record) throw this.invalid();

    if (record.revokedAt) {
      if (Date.now() - record.revokedAt.getTime() < REFRESH_REUSE_GRACE_MS) {
        throw this.rotated();
      }
      this.logger.warn(`Refresh token reuse detected for user ${record.userId}: revoking family`);
      await this.revokeFamily(record.family);
      throw this.invalid();
    }
    if (record.expiresAt.getTime() <= Date.now()) throw this.invalid();

    // Conditional update: only one concurrent request can win the rotation.
    const { count } = await this.prisma.refreshToken.updateMany({
      where: { id: record.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (count === 0) throw this.rotated();

    const tokens = await this.issue(record.user, record.family, userAgent);
    return { ...tokens, userId: record.userId };
  }

  /** Logout: revokes the given refresh token (no-op if unknown). */
  async revoke(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashToken(rawToken, this.refreshSecret), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Signs out every device (password change/reset). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  /** Housekeeping: drops a user's tokens that expired or were revoked long ago. */
  async pruneForUser(userId: string): Promise<void> {
    const cutoff = new Date(Date.now() - REFRESH_TOKEN_TTL_DAYS * DAY_MS);
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        OR: [{ expiresAt: { lt: new Date() } }, { revokedAt: { lt: cutoff } }],
      },
    });
  }

  private async issue(
    user: { id: string; role: UserRole },
    family: string,
    userAgent?: string,
  ): Promise<SessionTokens> {
    const payload: AccessTokenPayload = { sub: user.id, role: user.role };
    const accessToken = await this.jwt.signAsync(payload, { expiresIn: ACCESS_TOKEN_TTL_SECONDS });

    const refreshToken = generateToken();
    const refreshExpiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_DAYS * DAY_MS);
    await this.prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(refreshToken, this.refreshSecret),
        family,
        expiresAt: refreshExpiresAt,
        userAgent: userAgent?.slice(0, 255),
      },
    });
    return { accessToken, refreshToken, refreshExpiresAt };
  }

  private revokeFamily(family: string) {
    return this.prisma.refreshToken.updateMany({
      where: { family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private invalid() {
    return new AppException(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.INVALID_REFRESH_TOKEN,
      'Session expirée, reconnecte-toi.',
    );
  }

  private rotated() {
    return new AppException(
      HttpStatus.UNAUTHORIZED,
      ErrorCode.REFRESH_TOKEN_ROTATED,
      'Session déjà renouvelée, réessaie.',
    );
  }
}
