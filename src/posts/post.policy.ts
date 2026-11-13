import { Policy } from '@nestjs/authorization';
import type { User } from '../users/entities/user.entity.js';
import type { Post } from './entities/post.entity.js';

// Политика — класс с правилами «может ли пользователь сделать это».
// Каждый метод — «способность» (ability); разрешает только литеральный `true`.
@Policy()
export class PostPolicy {
  // `User | null`: правило работает и для гостей (они приходят как null).
  // Опубликованные посты видят все, черновики — только автор.
  view(user: User | null, post: Post) {
    return post.published || post.authorId === user?.id;
  }

  // Проверяется на маршруте (@Can), где записи ещё нет, поэтому
  // user должен допускать null; гость получает 401.
  create(user: User | null) {
    return !!user;
  }

  // Вызываются только из сервиса, где пользователь уже точно вошёл,
  // поэтому тип User без null — компилятор не даст передать гостя.
  update(user: User, post: Post) {
    return post.authorId === user.id;
  }

  delete(user: User, post: Post) {
    return post.authorId === user.id;
  }
}
