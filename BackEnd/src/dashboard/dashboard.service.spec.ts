import { Prisma, Profile } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard.service';
import { GettingStartedStep, SectionStatus } from './dto/dashboard-response.dto';

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: 'p1',
    userId: 'u1',
    displayName: 'Alex',
    avatarUrl: null,
    birthDate: null,
    heightCm: null,
    weightUnit: 'KG',
    distanceUnit: 'KM',
    heightUnit: 'CM',
    theme: 'SYSTEM',
    timezone: 'Europe/Paris',
    gamificationEnabled: true,
    mainGoal: 'BUILD_MUSCLE',
    weeklyWorkoutTarget: 4,
    favoriteActivities: ['STRENGTH'],
    onboardingCompleted: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

const serviceWith = (p: Profile | null) =>
  new DashboardService({
    profile: { findUnique: jest.fn().mockResolvedValue(p) },
  } as unknown as PrismaService);

describe('DashboardService', () => {
  const now = new Date('2026-09-27T23:30:00Z');

  it('computes the week in the user time zone', async () => {
    const paris = await serviceWith(profile()).getDashboard('u1', now);
    expect(paris.week).toMatchObject({ start: '2026-09-28', today: '2026-09-28', todayIndex: 0 });

    const la = await serviceWith(profile({ timezone: 'America/Los_Angeles' })).getDashboard(
      'u1',
      now,
    );
    expect(la.week).toMatchObject({ start: '2026-09-21', today: '2026-09-27', todayIndex: 6 });
  });

  it('falls back to Europe/Paris for an invalid stored time zone', async () => {
    const res = await serviceWith(profile({ timezone: 'Nope/Nowhere' })).getDashboard('u1', now);
    expect(res.timezone).toBe('Europe/Paris');
  });

  it('never invents data for features that are not released', async () => {
    const res = await serviceWith(profile()).getDashboard('u1', now);
    for (const section of Object.values(res.sections)) {
      expect(section.status).toBe(SectionStatus.UNAVAILABLE);
      expect(section.data).toBeUndefined();
    }
  });

  it('marks the profile step done only when height and birth date are set', async () => {
    const incomplete = await serviceWith(profile()).getDashboard('u1', now);
    const complete = await serviceWith(
      profile({ birthDate: new Date('1995-04-12'), heightCm: new Prisma.Decimal(178) }),
    ).getDashboard('u1', now);
    const step = (items: typeof incomplete.gettingStarted) =>
      items.find((i) => i.step === GettingStartedStep.PROFILE)!;
    expect(step(incomplete.gettingStarted).done).toBe(false);
    expect(step(complete.gettingStarted).done).toBe(true);
  });
});
