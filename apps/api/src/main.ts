import 'reflect-metadata';


import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';
import type { ApiEnvironment } from './config/environment.validation';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';

async function bootstrap(): Promise<void> {
  const application = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = application.get(Logger);
  const configuration = application.get(ConfigService<ApiEnvironment, true>);

  application.useLogger(logger);
  application.use(helmet());
  application.enableCors({ credentials: true, origin: configuration.getOrThrow('CORS_ORIGIN') });
  application.setGlobalPrefix(configuration.getOrThrow('API_PREFIX'));
  application.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  application.useGlobalFilters(new GlobalExceptionFilter());
  application.enableShutdownHooks();

  if (configuration.getOrThrow('SWAGGER_ENABLED')) {
    const documentConfiguration = new DocumentBuilder()
      .setTitle('StadiumSphere AI API Foundation')
      .setDescription('Technical API foundation; no business capabilities are exposed.')
      .setVersion('v1')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(application, documentConfiguration);
    SwaggerModule.setup('api-docs', application, document);
  }

  const port = configuration.getOrThrow('PORT');
  await application.listen(port);
  logger.log({ port }, 'API foundation started');
}

void bootstrap();
