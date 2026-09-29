import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { DashboardService } from './dashboard.service';
import { DashboardResponseDto } from './dto/dashboard-response.dto';

@ApiTags('dashboard')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ type: ErrorResponseDto })
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get()
  @ApiOperation({
    summary: 'Dashboard summary for the current user',
    description:
      'Week boundaries use the user time zone. Each section has a status: READY, EMPTY or UNAVAILABLE (feature not released yet).',
  })
  @ApiOkResponse({ type: DashboardResponseDto })
  get(@CurrentUser() user: AuthUser): Promise<DashboardResponseDto> {
    return this.dashboard.getDashboard(user.id);
  }
}
