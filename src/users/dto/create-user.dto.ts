// Внутренний тип для UsersService.create (вызывается из регистрации).
// Не используется как @Body: клиент сюда passwordHash передавать не должен.
export class CreateUserDto {
  email: string;
  passwordHash: string;
  username: string;
  firstName: string;
  lastName: string;
}
