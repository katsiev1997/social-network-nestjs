// Использование: npm run sign-up -- [email] [password] [username]
// Базовый URL можно переопределить: API_URL=http://localhost:5000 npm run sign-up
import { existsSync } from 'node:fs';

if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

const baseUrl = process.env.API_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
const suffix = Date.now();

const [
  email = `user${suffix}@example.com`,
  password = 'password-123456',
  username = `user${suffix}`,
] = process.argv.slice(2);

const body = { email, password, username, firstName: 'Test', lastName: 'User' };

const res = await fetch(`${baseUrl}/auth/sign-up`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
});

const text = await res.text();
console.log(`POST ${baseUrl}/auth/sign-up -> ${res.status}`);
console.log(text);
console.log('Set-Cookie:', res.headers.getSetCookie());

if (!res.ok) {
  process.exitCode = 1;
}
