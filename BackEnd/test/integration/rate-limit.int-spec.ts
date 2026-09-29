import request from 'supertest';
import type { TestApp } from './test-app';

describe('Rate limiting (integration)', () => {
  let t: TestApp;
  const previous = process.env.AUTH_RATE_LIMIT;

  beforeAll(async () => {
    // The config is read when AppModule is first loaded: set it before importing.
    process.env.AUTH_RATE_LIMIT = '3';
    const { createTestApp } = await import('./test-app');
    t = await createTestApp();
  });

  afterAll(async () => {
    process.env.AUTH_RATE_LIMIT = previous;
    await t.app.close();
  });

  it('limits login attempts per IP', async () => {
    const attempt = () =>
      request(t.app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ email: 'nobody@vyro.test', password: 'Mauvais1' });

    for (let i = 0; i < 3; i++) await attempt().expect(401);
    const res = await attempt().expect(429);
    expect(res.body.code).toBe('TOO_MANY_REQUESTS');
  });

  it('does not apply the strict limit to other routes', async () => {
    for (let i = 0; i < 5; i++) {
      await request(t.app.getHttpServer()).get('/api/v1/health').expect(200);
    }
  });
});
