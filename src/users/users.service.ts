import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorizationService } from '@nestjs/authorization';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { User } from './entities/user.entity.js';
import { UserPolicy } from './user.policy.js';

// Профиль для ответа API: email виден только владельцу
export type UserProfile = Omit<User, 'email'> & { email?: string };

// Убирает undefined-поля, чтобы Object.assign не затирал ими сущность
const definedOnly = <T extends object>(dto: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(dto).filter(([, value]) => value !== undefined),
  ) as Partial<T>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly authorizationService: AuthorizationService,
  ) {}

  create(createUserDto: CreateUserDto) {
    const user = this.usersRepository.save(createUserDto);
    return user;
  }

  findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }

  findOne(id: number): Promise<User | null> {
    return this.usersRepository.findOneBy({ id });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ email });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ username });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOneBy({ id: Number(id) });
  }

  // Единственное место, где читается passwordHash. Пользователь возвращается
  // без хеша, чтобы он не попал в ответ API.
  async findCredentials(email: string) {
    const row = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
    if (!row?.passwordHash) {
      return undefined;
    }
    const { passwordHash, ...user } = row;
    return { user: user as User, passwordHash };
  }

  async updatePasswordHash(id: number, passwordHash: string) {
    await this.usersRepository.update({ id }, { passwordHash });
  }

  // ---- методы для UsersController (с проверкой прав и скрытием email) ----

  async listProfiles(viewer: User | null): Promise<UserProfile[]> {
    return (await this.findAll()).map((user) => this.toProfile(viewer, user));
  }

  async getProfile(viewer: User | null, id: number): Promise<UserProfile> {
    const target = await this.getOrFail(id);
    await this.authorizationService.authorize(UserPolicy, 'view', viewer, target);
    return this.toProfile(viewer, target);
  }

  async updateProfile(
    viewer: User,
    id: number,
    dto: UpdateUserDto,
  ): Promise<UserProfile> {
    const target = await this.getOrFail(id);
    await this.authorizationService.authorize(UserPolicy, 'update', viewer, target);
    try {
      // непереданные поля DTO равны undefined — не даём им затереть профиль
      await this.usersRepository.save(Object.assign(target, definedOnly(dto)));
    } catch (error) {
      // username уникален: гонка или занятое имя → 409, а не 500
      if (
        error instanceof QueryFailedError &&
        (error.driverError as { code?: string })?.code === '23505'
      ) {
        throw new ConflictException('Username already registered');
      }
      throw error;
    }
    return this.toProfile(viewer, target);
  }

  async removeProfile(viewer: User, id: number) {
    const target = await this.getOrFail(id);
    await this.authorizationService.authorize(UserPolicy, 'delete', viewer, target);
    await this.usersRepository.remove(target);
  }

  private async getOrFail(id: number) {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException();
    }
    return user;
  }

  private toProfile(viewer: User | null, user: User): UserProfile {
    if (viewer?.id === user.id) {
      return user;
    }
    const { email, ...profile } = user;
    return profile;
  }
}
