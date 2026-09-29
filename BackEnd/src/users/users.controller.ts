import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ACCESS_TOKEN_TTL_SECONDS } from '../auth/auth.constants';
import type { AuthUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthResponseDto } from '../auth/dto/auth-response.dto';
import { RefreshCookieService } from '../auth/refresh-cookie.service';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { SensitiveThrottle } from '../common/throttling/sensitive-throttle.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CompleteOnboardingDto } from './dto/complete-onboarding.dto';
import { DeleteAccountDto } from './dto/delete-account.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('users')
@ApiBearerAuth('access-token')
@ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'UNAUTHORIZED | TOKEN_EXPIRED' })
@Controller('users/me')
export class UsersController {
  constructor(
    private readonly users: UsersService,
    private readonly cookie: RefreshCookieService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Current user and profile' })
  @ApiOkResponse({ type: UserResponseDto })
  getMe(@CurrentUser() user: AuthUser): Promise<UserResponseDto> {
    return this.users.getMe(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update profile fields (partial)' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'VALIDATION_FAILED' })
  updateProfile(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateProfileDto,
  ): Promise<UserResponseDto> {
    return this.users.updateProfile(user.id, dto);
  }

  @Post('onboarding')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Save onboarding answers and mark onboarding as completed' })
  @ApiOkResponse({ type: UserResponseDto })
  completeOnboarding(
    @CurrentUser() user: AuthUser,
    @Body() dto: CompleteOnboardingDto,
  ): Promise<UserResponseDto> {
    return this.users.completeOnboarding(user.id, dto);
  }

  @Post('password')
  @HttpCode(HttpStatus.OK)
  @SensitiveThrottle()
  @ApiOperation({
    summary: 'Change password',
    description: 'Signs out every other device and returns a fresh session for this one.',
  })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'INVALID_PASSWORD' })
  async changePassword(
    @CurrentUser() user: AuthUser,
    @Body() dto: ChangePasswordDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const session = await this.users.changePassword(user.id, dto, req.headers['user-agent']);
    this.cookie.set(res, session.refreshToken, session.refreshExpiresAt);
    return {
      accessToken: session.accessToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: await this.users.getMe(user.id),
    };
  }

  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  @SensitiveThrottle()
  @ApiOperation({ summary: 'Permanently delete the account and all its data' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'INVALID_PASSWORD' })
  async deleteAccount(
    @CurrentUser() user: AuthUser,
    @Body() dto: DeleteAccountDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.users.deleteAccount(user.id, dto.password);
    this.cookie.clear(res);
  }
}
