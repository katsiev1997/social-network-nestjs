import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  JwtBearerProvider,
  type JwtClaims,
} from '@nestjs/authentication';
import { User } from '../users/entities/user.entity.js';
import { UsersService } from '../users/users.service.js';

// Провайдер аутентификации по заголовку Authorization: Bearer <JWT>.
// Подпись, срок и claims проверяет базовый класс по настройкам accessToken
// из app.module; здесь только превращаем токен в пользователя.
@Injectable()
export class JwtAuth extends JwtBearerProvider<User> {
  constructor(
    private readonly userService: UsersService,
    registry: AuthenticationRegistry,
  ) {
    // The key, issuer and audience come from the `accessToken` options.
    super({ realm: 'social-network' });
    // Adds this provider to the chain the guard runs for every request.
    // у каждого провайдера свой порядок: SessionAuth — 0, JwtAuth — 1
    registry.registerProvider(this, { order: 1 });
  }

  // Called after the signature and claims checked out.
  // Returning null (the user was deleted) rejects the token.
  validate({ sub }: JwtClaims) {
    return sub ? this.userService.findById(sub) : null;
  }
}
