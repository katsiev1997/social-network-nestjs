import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { Authenticate, CurrentUser } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { UpdateUserDto } from './dto/update-user.dto.js';
import type { User } from './entities/user.entity.js';
import { UsersService } from './users.service.js';

// Без @Can/@Can.Anyone/@Public глобальный гвард авторизации закрывает маршрут,
// поэтому раньше findOne/update/remove отвечали 403 всем.
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Профили публичные. optional: true — гость проходит с user = null,
  // а вошедший получает своего user (чтобы увидеть свой email).
  @Get()
  @Authenticate({ optional: true })
  @Can.Anyone()
  findAll(@CurrentUser() user: User | null) {
    return this.usersService.listProfiles(user);
  }

  @Get(':id')
  @Authenticate({ optional: true })
  @Can.Anyone()
  findOne(
    @CurrentUser() user: User | null,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.usersService.getProfile(user, id);
  }

  // Требуют входа; «только свой профиль» проверяет сервис через UserPolicy
  @Patch(':id')
  @Can.Anyone()
  update(
    @CurrentUser() user: User,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.updateProfile(user, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @Can.Anyone()
  remove(@CurrentUser() user: User, @Param('id', ParseIntPipe) id: number) {
    return this.usersService.removeProfile(user, id);
  }
}
