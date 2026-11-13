import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

// Тело POST /auth/sign-up. Проверяется глобальным ValidationPipe.
export class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  // минимум 12 символов; максимум ограничивает нагрузку на хеширование (scrypt)
  @MinLength(12)
  @MaxLength(128)
  password: string;

  @IsString()
  @MinLength(2)
  @MaxLength(128)
  username: string;

  @IsString()
  @MinLength(2)
  firstName: string;

  @IsString()
  @MinLength(2)
  lastName: string;
}

// Тело POST /auth/sign-in и POST /auth/token. Длину пароля здесь не проверяем:
// неверный пароль должен давать общий ответ 401, а не подсказку о правилах.
export class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

// Тело POST /auth/token/refresh и /auth/token/revoke
export class RefreshTokenDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
