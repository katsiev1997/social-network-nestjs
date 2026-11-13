import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { User } from './entities/user.entity.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPolicy } from './user.policy.js';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  // UserPolicy — провайдер: модуль авторизации находит политики сам
  providers: [UsersService, UserPolicy],
  exports: [UsersService],
})
export class UsersModule {}
