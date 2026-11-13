import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Public, SignInService } from '@nestjs/authentication';
import { CredentialsService } from './credentials.service.js';
import { SignInDto, SignUpDto } from './dto/auth.dto.js';

// Вход по cookie-сессии. Маршруты публичные: пользователь ещё не вошёл.
@Public()
@Controller('auth')
export class AuthController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly signInService: SignInService,
  ) {}

  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    const user = await this.credentialsService.register(body);
    // создаёт сессию и сам ставит cookie
    await this.signInService.signIn(String(user.id), { method: 'password' });
    return user;
  }

  @Post('sign-in')
  @HttpCode(200)
  async signIn(@Body() body: SignInDto) {
    const user = await this.credentialsService.verify(
      body.email,
      body.password,
    );
    if (!user) {
      // одинаковый ответ для неизвестного email и неверного пароля
      throw new UnauthorizedException('Invalid email or password');
    }
    await this.signInService.signIn(String(user.id), { method: 'password' });
    return user;
  }

  // Завершает текущую сессию и удаляет cookie. Идемпотентен, поэтому @Public:
  // выйти можно и с уже истёкшей сессией.
  @Post('sign-out')
  @HttpCode(204)
  async signOut() {
    await this.signInService.signOut();
  }
}
