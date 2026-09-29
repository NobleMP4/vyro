import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ThrottlingModule } from './common/throttling/throttling.module';
import { validateEnv } from './config/env.validation';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExercisesModule } from './exercises/exercises.module';
import { HealthModule } from './health/health.module';
import { MailModule } from './mail/mail.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, cache: true, validate: validateEnv }),
    PrismaModule,
    MailModule,
    // Registered before AuthModule so rate limiting runs before authentication.
    ThrottlingModule,
    AuthModule,
    UsersModule,
    DashboardModule,
    ExercisesModule,
    HealthModule,
  ],
})
export class AppModule {}
