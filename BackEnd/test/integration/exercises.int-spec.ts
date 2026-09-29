import { PrismaClient } from '@prisma/client';
import request from 'supertest';
import { createTestApp, TestApp, uniqueEmail } from './test-app';

describe('Exercises (integration)', () => {
  let t: TestApp;
  const prisma = new PrismaClient();
  const http = () => request(t.app.getHttpServer());
  // Unique marker so assertions only see this run's catalog rows.
  const run = `t${Date.now()}`;

  beforeAll(async () => {
    t = await createTestApp();
    await prisma.exercise.createMany({
      data: [
        {
          slug: `${run}-bench`,
          name: `${run} Développé couché`,
          muscleGroup: 'CHEST',
          equipment: 'BARBELL',
          difficulty: 'INTERMEDIATE',
        },
        {
          slug: `${run}-pushup`,
          name: `${run} Pompes`,
          muscleGroup: 'CHEST',
          equipment: 'BODYWEIGHT',
          trackingType: 'REPS',
        },
        {
          slug: `${run}-squat`,
          name: `${run} Squat`,
          muscleGroup: 'QUADRICEPS',
          equipment: 'BARBELL',
          difficulty: 'INTERMEDIATE',
        },
        {
          slug: `${run}-plank`,
          name: `${run} Gainage`,
          muscleGroup: 'CORE',
          equipment: 'BODYWEIGHT',
          trackingType: 'DURATION',
          deletedAt: new Date(),
        },
      ],
    });
  });

  afterAll(async () => {
    await t.app.close();
    await prisma.$disconnect();
  });

  async function user() {
    const res = await http()
      .post('/api/v1/auth/register')
      .send({ email: uniqueEmail(), password: 'MotDePasse1', displayName: 'Alex' })
      .expect(201);
    return { Authorization: `Bearer ${res.body.accessToken as string}` };
  }

  const list = (auth: Record<string, string>, query: Record<string, string | number>) =>
    http()
      .get('/api/v1/exercises')
      .set(auth)
      .query({ search: run, ...query });

  it('requires authentication', async () => {
    await http().get('/api/v1/exercises').expect(401);
  });

  it('searches the catalog case- and accent-insensitively, sorted by name', async () => {
    const auth = await user();
    const res = await list(auth, { search: `${run} developpe` }).expect(200);
    expect(res.body.items.map((e: { name: string }) => e.name)).toEqual([
      `${run} Développé couché`,
    ]);

    const all = await list(auth, {}).expect(200);
    expect(all.body.items.map((e: { name: string }) => e.name)).toEqual([
      `${run} Développé couché`,
      `${run} Pompes`,
      `${run} Squat`,
    ]);
    expect(all.body.items[0]).toMatchObject({ isCustom: false, secondaryMuscles: [] });
  });

  it('filters by muscle group, equipment and difficulty', async () => {
    const auth = await user();
    const chest = await list(auth, { muscleGroup: 'CHEST' }).expect(200);
    expect(chest.body.total).toBe(2);
    const bodyweight = await list(auth, { muscleGroup: 'CHEST', equipment: 'BODYWEIGHT' }).expect(
      200,
    );
    expect(bodyweight.body.items.map((e: { name: string }) => e.name)).toEqual([`${run} Pompes`]);
    const hard = await list(auth, { difficulty: 'INTERMEDIATE' }).expect(200);
    expect(hard.body.total).toBe(2);
  });

  it('paginates', async () => {
    const auth = await user();
    const page1 = await list(auth, { pageSize: 2, page: 1 }).expect(200);
    const page2 = await list(auth, { pageSize: 2, page: 2 }).expect(200);
    expect(page1.body).toMatchObject({ total: 3, page: 1, pageSize: 2, hasMore: true });
    expect(page2.body).toMatchObject({ page: 2, hasMore: false });
    expect(page2.body.items).toHaveLength(1);
  });

  it('validates query parameters', async () => {
    const auth = await user();
    const res = await list(auth, { muscleGroup: 'WINGS', pageSize: 500 }).expect(400);
    const fields = (res.body.details as { field: string }[]).map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['muscleGroup', 'pageSize']));
  });

  it('lets a user manage their own exercises, invisible to others', async () => {
    const alice = await user();
    const bob = await user();

    const created = await http()
      .post('/api/v1/exercises')
      .set(alice)
      .send({
        name: `${run} Tirage prise serrée`,
        muscleGroup: 'BACK',
        secondaryMuscles: ['BICEPS'],
        equipment: 'CABLE',
      })
      .expect(201);
    const id = created.body.id as string;
    expect(created.body).toMatchObject({
      isCustom: true,
      difficulty: 'BEGINNER',
      trackingType: 'WEIGHT_REPS',
    });

    const mine = await list(alice, { scope: 'mine' }).expect(200);
    expect(mine.body.items.map((e: { id: string }) => e.id)).toEqual([id]);
    const catalog = await list(alice, { scope: 'catalog' }).expect(200);
    expect(catalog.body.total).toBe(3);

    // Bob can neither see nor touch it.
    expect((await list(bob, {}).expect(200)).body.total).toBe(3);
    const hidden = await http().get(`/api/v1/exercises/${id}`).set(bob).expect(404);
    expect(hidden.body.code).toBe('EXERCISE_NOT_FOUND');
    await http().patch(`/api/v1/exercises/${id}`).set(bob).send({ name: 'x' }).expect(404);

    const updated = await http()
      .patch(`/api/v1/exercises/${id}`)
      .set(alice)
      .send({ difficulty: 'ADVANCED' })
      .expect(200);
    expect(updated.body).toMatchObject({
      difficulty: 'ADVANCED',
      name: `${run} Tirage prise serrée`,
    });

    await http().delete(`/api/v1/exercises/${id}`).set(alice).expect(204);
    await http().get(`/api/v1/exercises/${id}`).set(alice).expect(404);
    // Soft-deleted: kept for workout history.
    expect(await prisma.exercise.findUnique({ where: { id } })).toMatchObject({
      deletedAt: expect.any(Date),
    });
  });

  it('keeps the catalog read-only', async () => {
    const auth = await user();
    const bench = await prisma.exercise.findUniqueOrThrow({ where: { slug: `${run}-bench` } });

    const detail = await http().get(`/api/v1/exercises/${bench.id}`).set(auth).expect(200);
    expect(detail.body.name).toBe(`${run} Développé couché`);

    const res = await http()
      .patch(`/api/v1/exercises/${bench.id}`)
      .set(auth)
      .send({ name: 'Hack' })
      .expect(403);
    expect(res.body.code).toBe('EXERCISE_NOT_EDITABLE');
    await http().delete(`/api/v1/exercises/${bench.id}`).set(auth).expect(403);
  });

  it('validates custom exercises', async () => {
    const auth = await user();
    const res = await http()
      .post('/api/v1/exercises')
      .set(auth)
      .send({ name: '   ', muscleGroup: 'CHEST', equipment: 'SPACESHIP', ownerId: 'someone' })
      .expect(400);
    const fields = (res.body.details as { field: string }[]).map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['name', 'equipment', 'ownerId']));
  });
});
