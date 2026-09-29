import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Request, Response } from 'express';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { ErrorCode } from '../errors/error-codes';

interface NormalizedError {
  statusCode: number;
  code: string;
  message: string;
  details?: unknown;
}

const DEFAULT_CODES: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ErrorCode.BAD_REQUEST,
  [HttpStatus.UNAUTHORIZED]: ErrorCode.UNAUTHORIZED,
  [HttpStatus.FORBIDDEN]: ErrorCode.FORBIDDEN,
  [HttpStatus.NOT_FOUND]: ErrorCode.NOT_FOUND,
  [HttpStatus.CONFLICT]: ErrorCode.CONFLICT,
  [HttpStatus.PAYLOAD_TOO_LARGE]: ErrorCode.PAYLOAD_TOO_LARGE,
  [HttpStatus.TOO_MANY_REQUESTS]: ErrorCode.TOO_MANY_REQUESTS,
  [HttpStatus.SERVICE_UNAVAILABLE]: ErrorCode.SERVICE_UNAVAILABLE,
};

const DEFAULT_MESSAGES: Partial<Record<number, string>> = {
  [HttpStatus.BAD_REQUEST]: 'La requête est invalide.',
  [HttpStatus.UNAUTHORIZED]: 'Authentification requise.',
  [HttpStatus.FORBIDDEN]: 'Accès refusé.',
  [HttpStatus.NOT_FOUND]: 'Ressource introuvable.',
  [HttpStatus.CONFLICT]: 'Cette ressource existe déjà.',
  [HttpStatus.PAYLOAD_TOO_LARGE]: 'La requête est trop volumineuse.',
  [HttpStatus.TOO_MANY_REQUESTS]: 'Trop de requêtes, réessaie dans un instant.',
  [HttpStatus.SERVICE_UNAVAILABLE]: 'Service momentanément indisponible.',
};

const INTERNAL: NormalizedError = {
  statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
  code: ErrorCode.INTERNAL_ERROR,
  message: 'Une erreur inattendue est survenue.',
};

/**
 * Turns every thrown value into the single VYRO error shape:
 * `{ statusCode, code, message, details?, path, timestamp }`.
 * Stack traces and internal messages are logged, never sent to the client.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    const error = this.normalize(exception, request);
    if (error.statusCode >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${error.statusCode}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const body: ErrorResponseDto = {
      ...error,
      path: request.url,
      timestamp: new Date().toISOString(),
    };
    response.status(error.statusCode).json(body);
  }

  private normalize(exception: unknown, request: Request): NormalizedError {
    if (exception instanceof HttpException) {
      return this.fromHttpException(exception, request);
    }
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      return this.fromPrismaError(exception);
    }
    return INTERNAL;
  }

  private fromHttpException(exception: HttpException, request: Request): NormalizedError {
    const statusCode: HttpStatus = exception.getStatus();
    const payload = exception.getResponse();

    // AppException (or any HttpException built with an explicit code)
    if (typeof payload === 'object' && payload !== null && 'code' in payload) {
      const { code, message, details } = payload as {
        code: string;
        message?: string;
        details?: unknown;
      };
      return {
        statusCode,
        code,
        message: message ?? DEFAULT_MESSAGES[statusCode] ?? INTERNAL.message,
        ...(details !== undefined && { details }),
      };
    }

    // Unknown route: Nest throws a NotFoundException from its router.
    if (statusCode === HttpStatus.NOT_FOUND && this.isRouteNotFound(exception, request)) {
      return {
        statusCode,
        code: ErrorCode.ROUTE_NOT_FOUND,
        message: 'Cette route n’existe pas.',
      };
    }

    if (statusCode >= HttpStatus.INTERNAL_SERVER_ERROR) {
      return { ...INTERNAL, statusCode };
    }

    return {
      statusCode,
      code: DEFAULT_CODES[statusCode] ?? ErrorCode.BAD_REQUEST,
      message: DEFAULT_MESSAGES[statusCode] ?? exception.message,
    };
  }

  private isRouteNotFound(exception: HttpException, request: Request): boolean {
    return exception.message === `Cannot ${request.method} ${request.url}`;
  }

  private fromPrismaError(error: Prisma.PrismaClientKnownRequestError): NormalizedError {
    switch (error.code) {
      case 'P2002': // unique constraint
        return {
          statusCode: HttpStatus.CONFLICT,
          code: ErrorCode.CONFLICT,
          message: DEFAULT_MESSAGES[HttpStatus.CONFLICT]!,
        };
      case 'P2025': // record not found
        return {
          statusCode: HttpStatus.NOT_FOUND,
          code: ErrorCode.NOT_FOUND,
          message: DEFAULT_MESSAGES[HttpStatus.NOT_FOUND]!,
        };
      default:
        return INTERNAL;
    }
  }
}
