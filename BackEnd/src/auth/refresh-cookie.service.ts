import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { CookieOptions, Request, Response } from 'express';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { EnvironmentVariables, NodeEnv } from '../config/env.validation';
import { CLIENT_HEADER, REFRESH_COOKIE_NAME, REFRESH_COOKIE_PATH } from './auth.constants';

/**
 * The refresh token lives in an httpOnly cookie scoped to /api/v1/auth, so page
 * scripts can never read it. In production FrontEnd and BackEnd may sit on
 * different domains, hence SameSite=None + Secure there.
 */
@Injectable()
export class RefreshCookieService {
  private readonly options: CookieOptions;

  constructor(config: ConfigService<EnvironmentVariables, true>) {
    const production = config.get('NODE_ENV', { infer: true }) === NodeEnv.Production;
    this.options = {
      httpOnly: true,
      secure: production,
      sameSite: production ? 'none' : 'lax',
      path: REFRESH_COOKIE_PATH,
    };
  }

  set(res: Response, token: string, expiresAt: Date): void {
    res.cookie(REFRESH_COOKIE_NAME, token, { ...this.options, expires: expiresAt });
  }

  clear(res: Response): void {
    res.clearCookie(REFRESH_COOKIE_NAME, this.options);
  }

  read(req: Request): string | undefined {
    const cookies = req.cookies as Record<string, string | undefined> | undefined;
    return cookies?.[REFRESH_COOKIE_NAME];
  }

  /** CSRF protection for cookie-authenticated routes (see CLIENT_HEADER). */
  assertTrustedClient(req: Request): void {
    if (!req.headers[CLIENT_HEADER]) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        ErrorCode.UNTRUSTED_CLIENT,
        `Missing ${CLIENT_HEADER} header.`,
      );
    }
  }
}
