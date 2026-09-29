import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiHeader,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { AppException } from '../common/errors/app.exception';
import { ErrorCode } from '../common/errors/error-codes';
import { SensitiveThrottle } from '../common/throttling/sensitive-throttle.decorator';
import { ACCESS_TOKEN_TTL_SECONDS, CLIENT_HEADER } from './auth.constants';
import { AuthResult, AuthService } from './auth.service';
import { Public } from './decorators/public.decorator';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RefreshCookieService } from './refresh-cookie.service';

@ApiTags('auth')
@ApiTooManyRequestsResponse({ type: ErrorResponseDto })
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly cookie: RefreshCookieService,
  ) {}

  @Post('register')
  @SensitiveThrottle()
  @ApiOperation({ summary: 'Create an account and start a session' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'VALIDATION_FAILED' })
  @ApiConflictResponse({ type: ErrorResponseDto, description: 'EMAIL_ALREADY_USED' })
  async register(
    @Body() dto: RegisterDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.respond(res, await this.auth.register(dto, req.headers['user-agent']));
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @SensitiveThrottle()
  @ApiOperation({ summary: 'Log in with email and password' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({ type: ErrorResponseDto, description: 'INVALID_CREDENTIALS' })
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    return this.respond(res, await this.auth.login(dto, req.headers['user-agent']));
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Rotate the refresh cookie and get a new access token',
    description: 'Also used on app start to restore the session.',
  })
  @ApiHeader({ name: CLIENT_HEADER, required: true, example: 'web' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'INVALID_REFRESH_TOKEN | REFRESH_TOKEN_ROTATED',
  })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    this.cookie.assertTrustedClient(req);
    try {
      return this.respond(
        res,
        await this.auth.refresh(this.cookie.read(req), req.headers['user-agent']),
      );
    } catch (error) {
      // A parallel tab already rotated the token: keep the cookie it received.
      if (!AppException.hasCode(error, ErrorCode.REFRESH_TOKEN_ROTATED)) {
        this.cookie.clear(res);
      }
      throw error;
    }
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'End the current session' })
  @ApiHeader({ name: CLIENT_HEADER, required: true, example: 'web' })
  @ApiNoContentResponse()
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    this.cookie.assertTrustedClient(req);
    await this.auth.logout(this.cookie.read(req));
    this.cookie.clear(res);
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SensitiveThrottle()
  @ApiOperation({
    summary: 'Send a password reset link',
    description: 'Always returns 204, whether the email exists or not.',
  })
  @ApiNoContentResponse()
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<void> {
    await this.auth.forgotPassword(dto.email);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @SensitiveThrottle()
  @ApiOperation({ summary: 'Set a new password with a reset token (signs out every device)' })
  @ApiNoContentResponse()
  @ApiBadRequestResponse({ type: ErrorResponseDto, description: 'INVALID_RESET_TOKEN' })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    await this.auth.resetPassword(dto);
  }

  private respond(res: Response, result: AuthResult): AuthResponseDto {
    this.cookie.set(res, result.refreshToken, result.refreshExpiresAt);
    return {
      accessToken: result.accessToken,
      expiresIn: ACCESS_TOKEN_TTL_SECONDS,
      user: result.user,
    };
  }
}
