import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { dataSourceOptions } from './database/data-source.js';
import { UsersModule } from './users/users.module.js';
import { PostsModule } from './posts/posts.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';

@Module({
  imports: [
    // Аутентификация должна идти раньше авторизации: её гвард выставляет request.user
    AuthenticationModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        session: {
          absoluteTtl: '14d', // signed out after 14 days, however active
          idleTtl: '3d', // or after 3 days without a request
        },
        // JWT для мобильных клиентов (POST /auth/token)
        accessToken: {
          key: config.getOrThrow<string>('JWT_SECRET'), // не короче 32 байт
          issuer: config.get<string>('JWT_ISSUER', 'social-network'),
          audience: config.get<string>('JWT_AUDIENCE', 'social-network-app'),
          ttl: '15m',
        },
      }),
    }),
    // Читает .env и даёт ConfigService (в т.ч. фабрике аутентификации выше —
    // она выполняется при старте, когда конфиг уже загружен)
    ConfigModule.forRoot({
      isGlobal: true, // доступен во всех модулях без повторного импорта
      envFilePath: '.env',
    }),
    // Подключение к PostgreSQL; сущности подхватываются из модулей (autoLoadEntities),
    // схема меняется только миграциями (synchronize: false в data-source)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        ...dataSourceOptions,
        autoLoadEntities: true,
      }),
    }),
    UsersModule,
    PostsModule,
    // Регистрирует глобальный гвард: маршрут без @Can/@Can.Anyone/@Public закрыт (403/401).
    // Должен идти после AuthenticationModule, иначе все запросы будут «гостевыми»
    AuthorizationModule.forRoot(),
    // Контроллеры входа и провайдеры (cookie-сессия и JWT)
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
