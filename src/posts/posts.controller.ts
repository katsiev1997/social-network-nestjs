import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import type { User } from '../users/entities/user.entity.js';
import { CreatePostDto } from './dto/create-post.dto.js';
import { UpdatePostDto } from './dto/update-post.dto.js';
import { PostPolicy } from './post.policy.js';
import { PostsService } from './posts.service.js';

// Глобальный AuthorizationGuard закрывает любой маршрут без @Can / @Can.Anyone / @Public,
// поэтому у каждого метода ниже есть объявление.
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // Проверка не зависит от конкретного поста — делаем её на маршруте.
  // Гость остановится ещё аутентификацией (401).
  @Post()
  @Can(PostPolicy, 'create')
  create(@CurrentUser() user: User, @Body() dto: CreatePostDto) {
    return this.postsService.create(user, dto);
  }

  // optional: true — гость пропускается с user = null, а вошедший получает своего user.
  // @Can.Anyone(): права проверяет сервис, так что гвард просто пропускает.
  @Get()
  @Authenticate({ optional: true })
  @Can.Anyone()
  findAll(@CurrentUser() user: User | null) {
    return this.postsService.findAll(user);
  }

  // Видимость конкретного поста решает сервис (черновик → только автору)
  @Get(':id')
  @Authenticate({ optional: true })
  @Can.Anyone()
  findOne(@CurrentUser() user: User | null, @Param('id', ParseIntPipe) id: number) {
    return this.postsService.findOne(user, id);
  }

  // Требует входа (по умолчанию); «только автор» проверяет сервис после загрузки поста
  @Patch(':id')
  @Can.Anyone()
  update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdatePostDto,
  ) {
    return this.postsService.update(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Can.Anyone()
  remove(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.postsService.remove(user, id);
  }
}
