import { join } from 'node:path';
import { existsSync } from 'node:fs';
import { DataSource, DataSourceOptions } from 'typeorm';

// CLI запускается вне Nest, поэтому .env подгружаем сами
if (existsSync('.env')) {
  process.loadEnvFile('.env');
}

// Пути считаются от скомпилированных файлов в dist/
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.HOST,
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [join(import.meta.dirname, '../**/*.entity.js')],
  migrations: [join(import.meta.dirname, 'migrations/*.js')],
  synchronize: false,
};

export default new DataSource(dataSourceOptions);
