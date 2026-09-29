import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configureApp, SWAGGER_PATH } from './app.setup';
import { EnvironmentVariables } from './config/env.validation';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const port = app.get(ConfigService<EnvironmentVariables, true>).get('PORT', { infer: true });
  await app.listen(port);

  const logger = new Logger('Bootstrap');
  const url = await app.getUrl();
  logger.log(`VYRO API listening on ${url}/api/v1`);
  logger.log(`Swagger (if enabled): ${url}/${SWAGGER_PATH}`);
}

void bootstrap();
