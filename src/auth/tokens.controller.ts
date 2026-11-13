import {
  Body,
  Controller,
  HttpCode,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { Public, TokenService } from '@nestjs/authentication';
import { CredentialsService } from './credentials.service.js';
import { RefreshTokenDto, SignInDto } from './dto/auth.dto.js';

// Вход по JWT: access-токен + одноразовый refresh-токен (для мобильных клиентов)
@Public()
@Controller('auth/token')
export class TokensController {
  constructor(
    private readonly credentialsService: CredentialsService,
    private readonly tokenService: TokenService,
  ) {}

  @Post()
  @HttpCode(200)
  async issue(@Body() body: SignInDto) {
    const user = await this.credentialsService.verify(
      body.email,
      body.password,
    );
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.tokenService.issue(String(user.id), {
      method: 'password',
      // `amr` goes into this access token and into every refreshed one.
      claims: { amr: ['pwd'] },
    });
  }

  // Меняет refresh-токен на новую пару. Повторное использование старого токена
  // отзывает всю цепочку; RefreshTokenError превращается в 401.
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() body: RefreshTokenDto) {
    return this.tokenService.refresh(body.refreshToken);
  }

  // Выход одного устройства. Ответ всегда 204, чтобы не раскрывать, существовал ли токен.
  @Post('revoke')
  @HttpCode(204)
  async revoke(@Body() body: RefreshTokenDto) {
    await this.tokenService.revoke(body.refreshToken);
  }
}
