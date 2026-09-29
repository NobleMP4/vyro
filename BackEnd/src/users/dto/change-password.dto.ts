import { IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsPassword, PASSWORD_MAX_LENGTH } from '../../common/validation/password';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(PASSWORD_MAX_LENGTH)
  currentPassword: string;

  @IsPassword()
  newPassword: string;
}
