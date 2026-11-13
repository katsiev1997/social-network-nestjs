import { Injectable } from '@nestjs/common';
import {
  AuthenticationRegistry,
  SessionCookieProvider,
  type SessionRecord,
} from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';

// Провайдер аутентификации по cookie-сессии (браузерные клиенты).
// Саму сессию создаёт SignInService при входе; здесь по её userId
// достаём пользователя, который попадёт в request.user.
@Injectable()
export class SessionAuth extends SessionCookieProvider<User> {
  constructor(
    private readonly usersService: UsersService,
    registry: AuthenticationRegistry,
  ) {
    super();
    // Adds this provider to the chain the guard runs for every request.
    registry.registerProvider(this);
  }

  // Called for every request with a live session cookie.
  // Returning null (the user was deleted) ends the session.
  validate(session: SessionRecord) {
    return this.usersService.findOne(Number(session.userId));
  }
}
