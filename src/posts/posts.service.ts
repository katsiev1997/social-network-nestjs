import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthorizationService } from '@nestjs/authorization';
import { Repository } from 'typeorm';
import type { User } from '../users/entities/user.entity.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { Post } from './entities/post.entity.js';
import { PostPolicy } from './post.policy.js';

// Убирает undefined-поля, чтобы Object.assign не затирал ими сущность
const definedOnly = <T extends object>(dto: T): Partial<T> =>
  Object.fromEntries(
    Object.entries(dto).filter(([, value]) => value !== undefined),
  ) as Partial<T>;

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    // сервис, через который вызываются правила из PostPolicy
    private readonly authorizationService: AuthorizationService,
  ) {}

  // Права на создание уже проверены на маршруте (@Can), автор — текущий пользователь
  create(user: User, dto: CreatePostDto) {
    return this.postsRepository.save({ ...dto, authorId: user.id });
  }

  // Списки фильтруем в запросе, а не проверяем политикой каждый пост:
  // опубликованные + собственные черновики (для гостя — только опубликованные)
  findAll(user: User | null) {
    const query = this.postsRepository
      .createQueryBuilder('post')
      .where('post.published = true')
      .orderBy('post.createdAt', 'DESC');
    if (user) {
      query.orWhere('post.authorId = :userId', { userId: user.id });
    }
    return query.getMany();
  }

  // authorize() бросает ошибку, если правило запретило: гость → 401, вошедший → 403
  async findOne(user: User | null, id: number) {
    const post = await this.find(id);
    await this.authorizationService.authorize(PostPolicy, 'view', user, post);
    return post;
  }

  // Сначала загружаем пост, затем проверяем, что пользователь — его автор
  async update(user: User, id: number, dto: UpdatePostDto) {
    const post = await this.find(id);
    await this.authorizationService.authorize(PostPolicy, 'update', user, post);
    // после transform в DTO непереданные поля равны undefined — не даём им затереть пост
    return this.postsRepository.save(Object.assign(post, definedOnly(dto)));
  }

  async remove(user: User, id: number) {
    const post = await this.find(id);
    await this.authorizationService.authorize(PostPolicy, 'delete', user, post);
    await this.postsRepository.remove(post);
  }

  // Загружает пост или отвечает 404
  private async find(id: number) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException();
    }
    return post;
  }
}
