import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity.js';
import { PostPolicy } from './post.policy.js';
import { PostsController } from './posts.controller.js';
import { PostsService } from './posts.service.js';

@Module({
  // репозиторий Post для PostsService
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  // PostPolicy — обычный провайдер: модуль авторизации находит политики сам
  providers: [PostsService, PostPolicy],
})
export class PostsModule {}
