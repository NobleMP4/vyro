import { PrismaService } from '../prisma/prisma.service';
import { HealthService } from './health.service';

describe('HealthService', () => {
  it('reports ok when the database answers', async () => {
    const prisma = { $queryRaw: jest.fn().mockResolvedValue([{ 1: 1 }]) };
    const service = new HealthService(prisma as unknown as PrismaService);

    await expect(service.check()).resolves.toMatchObject({ status: 'ok', database: 'up' });
  });

  it('reports degraded when the database is unreachable', async () => {
    const prisma = { $queryRaw: jest.fn().mockRejectedValue(new Error('ECONNREFUSED')) };
    const service = new HealthService(prisma as unknown as PrismaService);

    await expect(service.check()).resolves.toMatchObject({ status: 'degraded', database: 'down' });
  });
});
