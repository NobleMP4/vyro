import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength, MinLength } from 'class-validator';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 128;

/** Password policy shared by register, reset and change password. */
export function IsPassword() {
  return applyDecorators(
    ApiProperty({
      minLength: PASSWORD_MIN_LENGTH,
      maxLength: PASSWORD_MAX_LENGTH,
      description: 'At least 8 characters, including a letter and a digit.',
      example: 'MonMotDePasse1',
    }),
    IsString(),
    MinLength(PASSWORD_MIN_LENGTH),
    MaxLength(PASSWORD_MAX_LENGTH),
    Matches(/\p{L}/u, { message: 'password must contain a letter' }),
    Matches(/\d/, { message: 'password must contain a digit' }),
  );
}
