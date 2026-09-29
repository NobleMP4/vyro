import { IsEmail, MaxLength } from 'class-validator';
import { NormalizeEmail } from '../../common/validation/transforms';

export class ForgotPasswordDto {
  @NormalizeEmail()
  @IsEmail()
  @MaxLength(254)
  email: string;
}
