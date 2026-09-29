import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/** Shape of every error returned by the API. */
export class ErrorResponseDto {
  @ApiProperty({ example: 400 })
  statusCode: number;

  @ApiProperty({ example: 'VALIDATION_FAILED' })
  code: string;

  @ApiProperty({ example: 'Les données envoyées sont invalides.' })
  message: string;

  @ApiPropertyOptional({
    example: [{ field: 'email', errors: ['email must be an email'] }],
    description: 'Extra context, e.g. per-field validation errors.',
  })
  details?: unknown;

  @ApiProperty({ example: '/api/v1/health' })
  path: string;

  @ApiProperty({ example: '2026-01-01T00:00:00.000Z' })
  timestamp: string;
}
