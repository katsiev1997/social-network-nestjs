import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller.js';
import { SessionAuth } from './session-auth.provider.js';
import { UsersModule } from '../users/users.module.js';
import { CredentialsService } from './credentials.service.js';
import { JwtAuth } from './jwt-auth.provider.js';
import { TokensController } from './tokens.controller.js';

@Module({
  imports: [UsersModule],
  // TokensController раньше не был зарегистрирован — /auth/token не существовал
  controllers: [AuthController, TokensController],
  // SessionAuth — вход по cookie (браузер), JwtAuth — по Bearer-токену (мобильное приложение)
  providers: [SessionAuth, JwtAuth, CredentialsService],
})
export class AuthModule {}
