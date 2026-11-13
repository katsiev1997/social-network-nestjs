import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Проверяет тела запросов по декораторам class-validator в DTO:
  // whitelist — отбрасывает поля, которых нет в DTO (защита от лишних данных),
  // transform — превращает JSON в экземпляры DTO.
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT');
  await app.listen(port ?? 3000);
}
await bootstrap();
