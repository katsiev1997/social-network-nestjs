import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

// Что пользователь может менять в профиле. Намеренно НЕ наследуем CreateUserDto:
// в нём есть email и passwordHash, их через PATCH менять нельзя
// (иначе можно подставить чужой хеш пароля).
export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(128)
  username?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  lastName?: string;
}
