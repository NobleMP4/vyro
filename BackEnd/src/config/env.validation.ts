import { plainToInstance, Transform } from 'class-transformer';
import { resolveDatabaseUrl } from './database-url';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

/**
 * Every variable the API reads. The process refuses to start when the
 * environment is invalid, so misconfiguration is caught at boot, not at runtime.
 */
export class EnvironmentVariables {
  @IsEnum(NodeEnv)
  NODE_ENV: NodeEnv = NodeEnv.Development;

  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT = 3000;

  /**
   * Built from DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME,
   * or given directly (see resolveDatabaseUrl).
   */
  @IsNotEmpty({ message: 'set DB_HOST, DB_USER and DB_NAME (or a full DATABASE_URL)' })
  DATABASE_URL: string;

  /** Comma-separated list of allowed CORS origins. */
  @IsString()
  @IsNotEmpty()
  FRONTEND_URL = 'http://localhost:5173';

  /** Signs access tokens (JWT). */
  @IsString()
  @MinLength(32, { message: 'JWT_SECRET must be at least 32 characters (openssl rand -base64 48)' })
  JWT_SECRET: string;

  /** Keys the HMAC of refresh and password-reset tokens stored in the database. */
  @IsString()
  @MinLength(32, {
    message: 'JWT_REFRESH_SECRET must be at least 32 characters (openssl rand -base64 48)',
  })
  JWT_REFRESH_SECRET: string;

  /** Max attempts per minute and per IP on sensitive auth routes (login, register…). */
  @Transform(({ value }: { value: unknown }) => (value === undefined ? value : Number(value)))
  @IsInt()
  @Min(1)
  AUTH_RATE_LIMIT = 10;

  /** Set to true behind a reverse proxy so rate limiting sees the real client IP. */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value === 'true' : value,
  )
  @IsBoolean()
  TRUST_PROXY?: boolean;

  // ── Email (password reset). Without SMTP_HOST, emails are only logged. ──
  @IsOptional()
  @IsString()
  SMTP_HOST?: string;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) => (value === undefined ? value : Number(value)))
  @IsInt()
  @Min(1)
  @Max(65535)
  SMTP_PORT?: number;

  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value === 'true' : value,
  )
  @IsBoolean()
  SMTP_SECURE?: boolean;

  @IsOptional()
  @IsString()
  SMTP_USER?: string;

  @IsOptional()
  @IsString()
  SMTP_PASSWORD?: string;

  @IsString()
  MAIL_FROM = 'VYRO <no-reply@localhost>';

  /** Swagger is on by default outside production. */
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value === 'true' : value,
  )
  @IsBoolean()
  SWAGGER_ENABLED?: boolean;
}

export function validateEnv(config: Record<string, unknown>): EnvironmentVariables {
  const env = plainToInstance(
    EnvironmentVariables,
    { ...config, DATABASE_URL: resolveDatabaseUrl(config as Record<string, string | undefined>) },
    {
      enableImplicitConversion: false,
      exposeDefaultValues: true,
    },
  );
  const errors = validateSync(env, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((error) => `  - ${error.property}: ${Object.values(error.constraints ?? {}).join(', ')}`)
      .join('\n');
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return env;
}
