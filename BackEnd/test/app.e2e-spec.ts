import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

/**
 * Boots the full HTTP pipeline (prefix, versioning, filters, Swagger) with the
 * database mocked, so it runs in CI without MySQL.
 */
describe('VYRO API (e2e)', () => {
  let app: INestApplication<App>;
  const prisma = {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]),
  };

  beforeAll(async () => {
    process.env.DATABASE_URL ??= 'mysql://test:test@localhost:3306/vyro_test';
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue(prisma)
      .compile();

    app = moduleRef.createNestApplication();
    configureApp(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/v1/health returns ok when the database is up', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('GET /api/v1/health returns 503 when the database is down', async () => {
    prisma.$queryRaw.mockRejectedValueOnce(new Error('down'));
    const res = await request(app.getHttpServer()).get('/api/v1/health').expect(503);
    expect(res.body).toMatchObject({ status: 'degraded', database: 'down' });
  });

  it('serves routes only under the versioned prefix', async () => {
    await request(app.getHttpServer()).get('/health').expect(404);
  });

  it('returns the standard error shape for unknown routes', async () => {
    const res = await request(app.getHttpServer()).get('/api/v1/does-not-exist').expect(404);
    expect(res.body).toEqual({
      statusCode: 404,
      code: 'ROUTE_NOT_FOUND',
      message: expect.any(String),
      path: '/api/v1/does-not-exist',
      timestamp: expect.any(String),
    });
  });

  it('exposes the OpenAPI document', async () => {
    const res = await request(app.getHttpServer()).get('/api/docs-json').expect(200);
    expect(res.body.info.title).toBe('VYRO API');
    expect(res.body.paths).toHaveProperty('/api/v1/health');
  });
});
