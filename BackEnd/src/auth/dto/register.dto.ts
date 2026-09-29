import { IsEmail, IsNotEmpty, IsString, MaxLength } from 'class-validator';
import { IsPassword } from '../../common/validation/password';
import { NormalizeEmail, Trim } from '../../common/validation/transforms';
import { DISPLAY_NAME_MAX_LENGTH } from '../../users/dto/update-profile.dto';

export class RegisterDto {
  /** @example alex@example.com */
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;

  @IsPassword()
  password: string;

  /** Prénom ou pseudo @example Alex */
  @Trim()
  @IsString()
  @IsNotEmpty()
  @MaxLength(DISPLAY_NAME_MAX_LENGTH)
  displayName: string;
}
