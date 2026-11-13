import { IsBoolean, IsOptional, IsString, MinLength } from 'class-validator';

// Тело запроса POST /posts. UpdatePostDto наследует его через PartialType.
// Автор сюда не входит: он берётся из токена/сессии, а не от клиента.
export class CreatePostDto {
  @IsString()
  @MinLength(1)
  content: string;

  // не передан — пост опубликован (значение по умолчанию в сущности)
  @IsOptional()
  @IsBoolean()
  published?: boolean;
}
