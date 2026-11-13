import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

// Таблица "user". Email и username уникальны на уровне БД —
// это страхует от гонок при регистрации (см. CredentialsService.register).
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  username: string;

  // не попадает в выборки по умолчанию; для проверки пароля см. findCredentials
  @Column({ select: false })
  passwordHash: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  // зарезервировано под деактивацию аккаунта (пока нигде не проверяется)
  @Column({ default: true })
  isActive: boolean;
}
