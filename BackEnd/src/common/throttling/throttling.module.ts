import { ExecutionContext, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { EnvironmentVariables } from '../../config/env.validation';
import { SENSITIVE_THROTTLE_KEY } from './sensitive-throttle.decorator';

const MINUTE_MS = 60_000;

const isSensitive = (context: ExecutionContext): boolean =>
  Reflect.getMetadata(SENSITIVE_THROTTLE_KEY, context.getHandler()) === true;

/**
 * Two in-memory limiters per client IP:
 * - `default`: generous global limit against abuse;
 * - `sensitive`: strict limit, only on routes marked @SensitiveThrottle().
 * In-memory storage is fine for a single instance; use a shared store when scaling out.
 */
@Module({
  imports: [
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) => ({
        throttlers: [
          { name: 'default', ttl: MINUTE_MS, limit: 300 },
          {
            name: 'sensitive',
            ttl: MINUTE_MS,
            limit: config.get('AUTH_RATE_LIMIT', { infer: true }),
            skipIf: (context) => !isSensitive(context),
          },
        ],
        errorMessage: 'Trop de tentatives. Réessaie dans une minute.',
      }),
    }),
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class ThrottlingModule {}
