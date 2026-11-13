import { Policy } from '@nestjs/authorization';
import type { User } from './entities/user.entity.js';

// Правила для профилей пользователей
@Policy()
export class UserPolicy {
  // Профили публичные (соцсеть): их видят все, включая гостей.
  // Email при этом отдаётся только владельцу — это решает UsersService.
  view(_user: User | null, _target: User) {
    return true;
  }

  // Менять и удалять профиль может только сам пользователь
  update(user: User, target: User) {
    return user.id === target.id;
  }

  delete(user: User, target: User) {
    return user.id === target.id;
  }
}
