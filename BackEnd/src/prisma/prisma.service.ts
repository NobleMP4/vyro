import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit(): Promise<void> {
    // Don't crash the API when MySQL is not up yet: Prisma reconnects lazily
    // on the next query and /health reports the database as down meanwhile.
    try {
      await this.$connect();
    } catch (error) {
      this.logger.warn(
        `Database unreachable at startup: ${error instanceof Error ? error.message.split('\n')[0] : String(error)}`,
      );
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
