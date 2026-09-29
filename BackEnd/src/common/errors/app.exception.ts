import { HttpException, HttpStatus } from '@nestjs/common';

export interface AppExceptionBody {
  code: string;
  message: string;
  details?: unknown;
}

/**
 * Business exception carrying a stable error `code` (see ErrorCode, or a feature-specific one).
 * Throw it from services: `throw new AppException(400, 'INVALID_WEIGHT', 'Le poids fourni est invalide.')`.
 */
export class AppException extends HttpException {
  constructor(status: HttpStatus, code: string, message: string, details?: unknown) {
    const body: AppExceptionBody = { code, message, ...(details !== undefined && { details }) };
    super(body, status);
  }

  /** True when `error` is an AppException carrying `code`. */
  static hasCode(error: unknown, code: string): boolean {
    if (!(error instanceof AppException)) return false;
    return (error.getResponse() as AppExceptionBody).code === code;
  }
}
