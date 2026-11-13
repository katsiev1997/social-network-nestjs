import { ConflictException, Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { QueryFailedError } from 'typeorm';
import { UsersService } from '../users/users.service.js';
import { User } from '../users/entities/user.entity.js';
import { SignUpDto } from './dto/auth.dto.js';

// Приводим email к единому виду, иначе Alice@x.com и alice@x.com — разные аккаунты
const normalizeEmail = (email: string) =>
  email.trim().normalize('NFC').toLowerCase();

@Injectable()
export class CredentialsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
  ) {}

  async register(signUpDto: SignUpDto): Promise<User> {
    const email = normalizeEmail(signUpDto.email);
    const { username, password } = signUpDto;
    if (await this.usersService.findByEmail(email)) {
      throw new ConflictException('Email already registered');
    }
    if (await this.usersService.findByUsername(username)) {
      throw new ConflictException('Username already registered');
    }
    try {
      const { id } = await this.usersService.create({
        email,
        username,
        firstName: signUpDto.firstName,
        lastName: signUpDto.lastName,
        passwordHash: await this.passwordHasher.hash(password),
      });
      // перечитываем, чтобы в ответ не попал passwordHash
      return (await this.usersService.findOne(id))!;
    } catch (error) {
      // два одновременных запроса прошли проверки выше — уникальный индекс БД
      // (код 23505 в PostgreSQL) должен дать 409, а не 500
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Email or username already registered');
      }
      throw error;
    }
  }

  /** The user, or `null` when the email or the password is wrong. */
  async verify(email: string, password: string): Promise<User | null> {
    const found = await this.usersService.findCredentials(
      normalizeEmail(email),
    );
    // при неизвестном email verify() сверяет фиктивный хеш — время ответа
    // не выдаёт, какие email зарегистрированы
    const valid = await this.passwordHasher.verify(
      password,
      found?.passwordHash,
    );
    if (!valid || !found) {
      return null;
    }
    // параметры хеширования изменились — обновляем хеш, пока есть пароль в открытом виде
    if (this.passwordHasher.needsRehash(found.passwordHash)) {
      await this.usersService.updatePasswordHash(
        found.user.id,
        await this.passwordHasher.hash(password),
      );
    }
    return found.user;
  }
}
