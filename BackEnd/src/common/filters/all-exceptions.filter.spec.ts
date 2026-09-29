import { ArgumentsHost, BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { AppException } from '../errors/app.exception';
import { ErrorCode } from '../errors/error-codes';
import { AllExceptionsFilter } from './all-exceptions.filter';

function createHost(method = 'GET', url = '/api/v1/test') {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  const host = {
    switchToHttp: () => ({
      getRequest: () => ({ method, url }),
      getResponse: () => ({ status }),
    }),
  } as unknown as ArgumentsHost;
  return { host, status, json };
}

describe('AllExceptionsFilter', () => {
  const filter = new AllExceptionsFilter();

  it('keeps the code, message and details of an AppException', () => {
    const { host, status, json } = createHost();
    filter.catch(
      new AppException(HttpStatus.BAD_REQUEST, 'INVALID_WEIGHT', 'Le poids fourni est invalide.', {
        max: 500,
      }),
      host,
    );

    expect(status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        code: 'INVALID_WEIGHT',
        message: 'Le poids fourni est invalide.',
        details: { max: 500 },
        path: '/api/v1/test',
      }),
    );
  });

  it('maps a plain HttpException to a default code and message', () => {
    const { host, json } = createHost();
    filter.catch(new BadRequestException('internal detail'), host);

    expect(json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 400,
        code: ErrorCode.BAD_REQUEST,
        message: 'La requête est invalide.',
      }),
    );
  });

  it('flags unknown routes with ROUTE_NOT_FOUND', () => {
    const { host, json } = createHost('GET', '/api/v1/unknown');
    filter.catch(new NotFoundException('Cannot GET /api/v1/unknown'), host);

    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: ErrorCode.ROUTE_NOT_FOUND }));
  });

  it('maps Prisma unique constraint violations to 409 CONFLICT', () => {
    const { host, status, json } = createHost();
    const error = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
      code: 'P2002',
      clientVersion: 'test',
    });
    filter.catch(error, host);

    expect(status).toHaveBeenCalledWith(409);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ code: ErrorCode.CONFLICT }));
  });

  it('never leaks internal error messages or stacks', () => {
    const { host, status, json } = createHost();
    jest.spyOn(filter['logger'], 'error').mockImplementation(() => undefined);
    filter.catch(new Error('SELECT * FROM secrets failed'), host);

    expect(status).toHaveBeenCalledWith(500);
    const body = json.mock.calls[0][0] as Record<string, unknown>;
    expect(body.code).toBe(ErrorCode.INTERNAL_ERROR);
    expect(JSON.stringify(body)).not.toContain('secrets');
    expect(body).not.toHaveProperty('stack');
  });
});
