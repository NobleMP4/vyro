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
  ValidateIf,
  validateSync,
} from 'class-validator';

export enum NodeEnv {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

const isProduction = (env: EnvironmentVariables): boolean => env.NODE_ENV === NodeEnv.Production;

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

  // JWT secrets are consumed from Phase 2 (auth). They are mandatory in production.
  @ValidateIf((env: EnvironmentVariables) => isProduction(env) || !!env.JWT_SECRET)
  @IsString()
  @MinLength(32)
  JWT_SECRET?: string;

  @ValidateIf((env: EnvironmentVariables) => isProduction(env) || !!env.JWT_REFRESH_SECRET)
  @IsString()
  @MinLength(32)
  JWT_REFRESH_SECRET?: string;

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
