import request from 'supertest';
import { createTestApp, TestApp, uniqueEmail } from './test-app';

describe('Dashboard (integration)', () => {
  let t: TestApp;
  const http = () => request(t.app.getHttpServer());

  beforeAll(async () => {
    t = await createTestApp();
  });

  afterAll(async () => {
    await t.app.close();
  });

  async function onboardedUser(timezone?: string) {
    const res = await http()
      .post('/api/v1/auth/register')
      .send({ email: uniqueEmail(), password: 'MotDePasse1', displayName: 'Alex' })
      .expect(201);
    const auth = { Authorization: `Bearer ${res.body.accessToken as string}` };
    await http()
      .post('/api/v1/users/me/onboarding')
      .set(auth)
      .send({
        displayName: 'Alex',
        mainGoal: 'LOSE_WEIGHT',
        weeklyWorkoutTarget: 3,
        favoriteActivities: ['RUNNING'],
        weightUnit: 'KG',
        distanceUnit: 'KM',
        heightUnit: 'CM',
        ...(timezone && { timezone }),
      })
      .expect(200);
    return auth;
  }

  it('requires authentication', async () => {
    await http().get('/api/v1/dashboard').expect(401);
  });

  it('returns the week, the plan and honest section statuses', async () => {
    const auth = await onboardedUser('America/New_York');
    const res = await http().get('/api/v1/dashboard').set(auth).expect(200);

    expect(res.body.timezone).toBe('America/New_York');
    expect(res.body.week.start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(`${res.body.week.start}T00:00:00Z`).getUTCDay()).toBe(1); // Monday
    expect(res.body.plan).toEqual({
      mainGoal: 'LOSE_WEIGHT',
      weeklyWorkoutTarget: 3,
      favoriteActivities: ['RUNNING'],
    });
    expect(res.body.sections.weight).toEqual({ status: 'UNAVAILABLE', feature: 'WEIGHT' });
    expect(res.body.gettingStarted).toEqual(
      expect.arrayContaining([{ step: 'ACCOUNT', done: true, available: true }]),
    );
  });

  it('reflects profile completion in the getting-started checklist', async () => {
    const auth = await onboardedUser();
    await http()
      .patch('/api/v1/users/me/profile')
      .set(auth)
      .send({ birthDate: '1995-04-12', heightCm: 178 })
      .expect(200);
    const res = await http().get('/api/v1/dashboard').set(auth).expect(200);
    expect(res.body.gettingStarted).toEqual(
      expect.arrayContaining([{ step: 'PROFILE', done: true, available: true }]),
    );
  });

  it('rejects an invalid time zone', async () => {
    const auth = await onboardedUser();
    const res = await http()
      .patch('/api/v1/users/me/profile')
      .set(auth)
      .send({ timezone: 'Mars/Olympus' })
      .expect(400);
    expect(res.body.details).toEqual([{ field: 'timezone', errors: expect.any(Array) }]);
  });
});
