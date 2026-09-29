import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { App } from 'supertest/types';
import { AppModule } from '../../src/app.module';
import { configureApp } from '../../src/app.setup';
import { MailMessage, MailService } from '../../src/mail/mail.service';

export interface TestApp {
  app: INestApplication<App>;
  mails: MailMessage[];
}

/** Full application on the test database; emails are captured instead of sent. */
export async function createTestApp(): Promise<TestApp> {
  const mails: MailMessage[] = [];
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
    .overrideProvider(MailService)
    .useValue({ send: (message: MailMessage) => Promise.resolve(void mails.push(message)) })
    .compile();

  const app = moduleRef.createNestApplication<INestApplication<App>>();
  configureApp(app);
  await app.init();
  return { app, mails };
}

/** Extracts the refresh cookie value from a Set-Cookie header. */
export function refreshCookieFrom(setCookie: string[] | string | undefined): string | undefined {
  const cookies = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  const cookie = cookies.find((c) => c.startsWith('vyro_refresh='));
  const value = cookie?.split(';')[0].split('=')[1];
  return value || undefined;
}

let counter = 0;
export const uniqueEmail = () => `user${Date.now()}${counter++}@vyro.test`;
