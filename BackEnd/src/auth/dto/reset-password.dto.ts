import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsPassword } from '../../common/validation/password';

export class ResetPasswordDto {
  /** Token received by email */
  @IsString()
  @IsNotEmpty()
  @MaxLength(128)
  token: string;

  @IsPassword()
  password: string;
}
