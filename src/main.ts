import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Проверяет тела запросов по декораторам class-validator в DTO:
  // whitelist — отбрасывает поля, которых нет в DTO (защита от лишних данных),
  // transform — превращает JSON в экземпляры DTO.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  // Swagger UI: /docs, JSON-схема: /docs-json
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Social Network API')
    .setDescription(
      'API социальной сети. Для проверки в браузере войдите через POST /auth/sign-in (cookie-сессия подставится автоматически) или вставьте JWT из POST /auth/token через кнопку Authorize.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'docs',
    app,
    SwaggerModule.createDocument(app, swaggerConfig),
  );
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  await app.listen(port ?? 3000);
}
await bootstrap();
