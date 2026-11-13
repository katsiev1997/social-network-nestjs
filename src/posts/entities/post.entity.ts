import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';

// Пост пользователя — таблица "post" в БД
@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  // false — черновик: виден только автору (см. PostPolicy.view)
  @Column({ default: true })
  published: boolean;

  // id автора вынесен в отдельную колонку, чтобы политика могла сравнивать
  // post.authorId с user.id, не загружая связь
  @Column()
  authorId: number;

  // при удалении пользователя его посты удаляются каскадом
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  author: User;

  @CreateDateColumn()
  createdAt: Date;
}
