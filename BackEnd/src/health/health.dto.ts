import { ApiProperty } from '@nestjs/swagger';

export type ServiceState = 'up' | 'down';

export class HealthResponseDto {
  @ApiProperty({ enum: ['ok', 'degraded'], example: 'ok' })
  status: 'ok' | 'degraded';

  @ApiProperty({ enum: ['up', 'down'], example: 'up' })
  database: ServiceState;

  @ApiProperty({ example: '0.1.0' })
  version: string;

  @ApiProperty({ example: 42, description: 'Process uptime in seconds' })
  uptime: number;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  timestamp: string;
}
