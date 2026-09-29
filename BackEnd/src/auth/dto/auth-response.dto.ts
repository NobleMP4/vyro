import { ApiProperty } from '@nestjs/swagger';
import { UserResponseDto } from '../../users/dto/user-response.dto';

/** The refresh token is never in the body: it is set as an httpOnly cookie. */
export class AuthResponseDto {
  @ApiProperty({ description: 'Short-lived JWT, send it as `Authorization: Bearer <token>`' })
  accessToken: string;

  @ApiProperty({ example: 900, description: 'Access token lifetime in seconds' })
  expiresIn: number;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;
}
