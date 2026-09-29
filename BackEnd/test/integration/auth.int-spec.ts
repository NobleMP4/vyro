import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createTestApp, refreshCookieFrom, TestApp, uniqueEmail } from './test-app';

const PASSWORD = 'MotDePasse1';
const CLIENT = { 'X-VYRO-Client': 'web' };

describe('Auth & account (integration)', () => {
  let t: TestApp;
  const prisma = new PrismaClient();
  const http = () => request(t.app.getHttpServer());

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.app.close();
    await prisma.$disconnect();
  });

  async function register(email = uniqueEmail(), password = PASSWORD) {
    const res = await http()
      .post('/api/v1/auth/register')
      .send({ email, password, displayName: 'Alex' })
      .expect(201);
    return {
      email,
      accessToken: res.body.accessToken as string,
      refresh: refreshCookieFrom(res.headers['set-cookie'])!,
      body: res.body,
    };
  }

  const refreshWith = (token: string) =>
    http().post('/api/v1/auth/refresh').set(CLIENT).set('Cookie', `vyro_refresh=${token}`);

  describe('register', () => {
    it('creates the account, returns an access token and sets an httpOnly refresh cookie', async () => {
      const email = uniqueEmail();
      const res = await http()
        .post('/api/v1/auth/register')
        .send({ email: `  ${email.toUpperCase()} `, password: PASSWORD, displayName: ' Alex ' })
        .expect(201);

      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.expiresIn).toBe(900);
      expect(res.body.user).toMatchObject({
        email,
        role: 'USER',
        profile: { displayName: 'Alex', onboardingCompleted: false, weightUnit: 'KG' },
      });
      expect(JSON.stringify(res.body)).not.toMatch(/passwordHash|argon/);

      const cookie = (res.headers['set-cookie'] as unknown as string[]).join(';');
      expect(cookie).toMatch(/vyro_refresh=/);
      expect(cookie).toMatch(/HttpOnly/);
      expect(cookie).toMatch(/Path=\/api\/v1\/auth/);

      const stored = await prisma.user.findUniqueOrThrow({
        where: { email },
      });
      expect(stored.passwordHash).toMatch(/^\$argon2id\$/);
    });

    it('rejects an email already in use, whatever its case', async () => {
      const { email } = await register();
      const res = await http()
        .post('/api/v1/auth/register')
        .send({ email: email.toUpperCase(), password: PASSWORD, displayName: 'Bob' })
        .expect(409);
      expect(res.body.code).toBe('EMAIL_ALREADY_USED');
    });

    it('validates the payload', async () => {
      const res = await http()
        .post('/api/v1/auth/register')
        .send({ email: 'not-an-email', password: 'short', displayName: '', role: 'ADMIN' })
        .expect(400);
      expect(res.body.code).toBe('VALIDATION_FAILED');
      const fields = (res.body.details as { field: string }[]).map((d) => d.field);
      expect(fields).toEqual(expect.arrayContaining(['email', 'password', 'displayName', 'role']));
    });
  });

  describe('login', () => {
    it('logs in with valid credentials', async () => {
      const { email } = await register();
      const res = await http()
        .post('/api/v1/auth/login')
        .send({ email, password: PASSWORD })
        .expect(200);
      expect(res.body.user.email).toBe(email);
      expect(refreshCookieFrom(res.headers['set-cookie'])).toBeDefined();
    });

    it('returns the same error for a wrong password and an unknown email', async () => {
      const { email } = await register();
      const wrong = await http()
        .post('/api/v1/auth/login')
        .send({ email, password: 'Mauvais1' })
        .expect(401);
      const unknown = await http()
        .post('/api/v1/auth/login')
        .send({ email: uniqueEmail(), password: PASSWORD })
        .expect(401);
      expect(wrong.body.code).toBe('INVALID_CREDENTIALS');
      expect(unknown.body).toMatchObject({ code: wrong.body.code, message: wrong.body.message });
    });
  });

  describe('protected routes', () => {
    it('requires a valid access token', async () => {
      const none = await http().get('/api/v1/users/me').expect(401);
      expect(none.body.code).toBe('UNAUTHORIZED');
      await http()
        .get('/api/v1/users/me')
        .set('Authorization', 'Bearer forged.token.value')
        .expect(401);

      const { accessToken, email } = await register();
      const me = await http()
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(200);
      expect(me.body.email).toBe(email);
    });
  });

  describe('refresh token rotation', () => {
    it('requires the client header (CSRF protection)', async () => {
      const { refresh } = await register();
      const res = await http()
        .post('/api/v1/auth/refresh')
        .set('Cookie', `vyro_refresh=${refresh}`)
        .expect(403);
      expect(res.body.code).toBe('UNTRUSTED_CLIENT');
    });

    it('rotates the token and returns a working access token', async () => {
      const { refresh } = await register();
      const res = await refreshWith(refresh).expect(200);
      const next = refreshCookieFrom(res.headers['set-cookie']);
      expect(next).toBeDefined();
      expect(next).not.toBe(refresh);
      await http()
        .get('/api/v1/users/me')
        .set('Authorization', `Bearer ${res.body.accessToken}`)
        .expect(200);
    });

    it('treats an immediate reuse as a benign race', async () => {
      const { refresh } = await register();
      await refreshWith(refresh).expect(200);
      const res = await refreshWith(refresh).expect(401);
      expect(res.body.code).toBe('REFRESH_TOKEN_ROTATED');
    });

    it('revokes the whole session family when an old token is replayed', async () => {
      const { refresh, email } = await register();
      const rotated = await refreshWith(refresh).expect(200);
      const current = refreshCookieFrom(rotated.headers['set-cookie'])!;

      // Simulate a replay long after the rotation (outside the grace window).
      await prisma.refreshToken.updateMany({
        where: { revokedAt: { not: null }, user: { email } },
        data: { revokedAt: new Date(Date.now() - 60_000) },
      });
      const replay = await refreshWith(refresh).expect(401);
      expect(replay.body.code).toBe('INVALID_REFRESH_TOKEN');

      // The legitimate, most recent token is now revoked too.
      await refreshWith(current).expect(401);
    });

    it('rejects unknown tokens and clears the cookie', async () => {
      const res = await refreshWith('unknown-token').expect(401);
      expect(res.body.code).toBe('INVALID_REFRESH_TOKEN');
      expect((res.headers['set-cookie'] as unknown as string[]).join(';')).toMatch(
        /vyro_refresh=;/,
      );
    });
  });

  describe('logout', () => {
    it('revokes the refresh token', async () => {
      const { refresh } = await register();
      await http()
        .post('/api/v1/auth/logout')
        .set(CLIENT)
        .set('Cookie', `vyro_refresh=${refresh}`)
        .expect(204);
      await refreshWith(refresh).expect(401);
    });
  });

  describe('profile & onboarding', () => {
    it('updates the profile partially', async () => {
      const { accessToken } = await register();
      const res = await http()
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ weightUnit: 'LB', theme: 'DARK', birthDate: '1995-04-12', heightCm: 178.5 })
        .expect(200);
      expect(res.body.profile).toMatchObject({
        weightUnit: 'LB',
        theme: 'DARK',
        birthDate: '1995-04-12',
        heightCm: 178.5,
        displayName: 'Alex',
      });
    });

    it('rejects invalid values', async () => {
      const { accessToken } = await register();
      const res = await http()
        .patch('/api/v1/users/me/profile')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ weightUnit: 'STONE', weeklyWorkoutTarget: 99, onboardingCompleted: true })
        .expect(400);
      const fields = (res.body.details as { field: string }[]).map((d) => d.field);
      expect(fields).toEqual(
        expect.arrayContaining(['weightUnit', 'weeklyWorkoutTarget', 'onboardingCompleted']),
      );
    });

    it('completes the onboarding', async () => {
      const { accessToken } = await register();
      const res = await http()
        .post('/api/v1/users/me/onboarding')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          displayName: 'Sam',
          mainGoal: 'BUILD_MUSCLE',
          weeklyWorkoutTarget: 4,
          favoriteActivities: ['STRENGTH', 'RUNNING'],
          weightUnit: 'KG',
          distanceUnit: 'KM',
          heightUnit: 'CM',
        })
        .expect(200);
      expect(res.body.profile).toMatchObject({
        displayName: 'Sam',
        mainGoal: 'BUILD_MUSCLE',
        weeklyWorkoutTarget: 4,
        favoriteActivities: ['STRENGTH', 'RUNNING'],
        onboardingCompleted: true,
      });
    });
  });

  describe('change password', () => {
    it('checks the current password', async () => {
      const { accessToken } = await register();
      const res = await http()
        .post('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: 'Mauvais1', newPassword: 'Nouveau123' })
        .expect(400);
      expect(res.body.code).toBe('INVALID_PASSWORD');
    });

    it('changes it, signs out other sessions and keeps this one', async () => {
      const { accessToken, refresh, email } = await register();
      const res = await http()
        .post('/api/v1/users/me/password')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ currentPassword: PASSWORD, newPassword: 'Nouveau123' })
        .expect(200);

      await refreshWith(refresh).expect(401);
      await refreshWith(refreshCookieFrom(res.headers['set-cookie'])!).expect(200);
      await http().post('/api/v1/auth/login').send({ email, password: PASSWORD }).expect(401);
      await http().post('/api/v1/auth/login').send({ email, password: 'Nouveau123' }).expect(200);
    });
  });

  describe('password reset', () => {
    it('does not reveal whether an email exists', async () => {
      const before = t.mails.length;
      await http().post('/api/v1/auth/forgot-password').send({ email: uniqueEmail() }).expect(204);
      expect(t.mails).toHaveLength(before);
    });

    it('resets the password with the emailed token, once', async () => {
      const { email, refresh } = await register();
      await http().post('/api/v1/auth/forgot-password').send({ email }).expect(204);

      const mail = t.mails.at(-1)!;
      expect(mail.to).toBe(email);
      const token = /reset-password\?token=([\w-]+)/.exec(mail.text)?.[1];
      expect(token).toBeDefined();

      await http()
        .post('/api/v1/auth/reset-password')
        .send({ token, password: 'Reinit1234' })
        .expect(204);
      const reused = await http()
        .post('/api/v1/auth/reset-password')
        .send({ token, password: 'Autre12345' })
        .expect(400);
      expect(reused.body.code).toBe('INVALID_RESET_TOKEN');

      await refreshWith(refresh).expect(401);
      await http().post('/api/v1/auth/login').send({ email, password: 'Reinit1234' }).expect(200);
    });
  });

  describe('delete account', () => {
    it('requires the password, then deletes everything', async () => {
      const { accessToken, email, refresh } = await register();
      const auth = { Authorization: `Bearer ${accessToken}` };

      const wrong = await http()
        .delete('/api/v1/users/me')
        .set(auth)
        .send({ password: 'Mauvais1' })
        .expect(400);
      expect(wrong.body.code).toBe('INVALID_PASSWORD');

      await http().delete('/api/v1/users/me').set(auth).send({ password: PASSWORD }).expect(204);

      expect(await prisma.user.findUnique({ where: { email } })).toBeNull();
      expect(await prisma.refreshToken.count({ where: { user: { email } } })).toBe(0);
      await http().get('/api/v1/users/me').set(auth).expect(401);
      await refreshWith(refresh).expect(401);
      await http().post('/api/v1/auth/login').send({ email, password: PASSWORD }).expect(401);
    });
  });
});
