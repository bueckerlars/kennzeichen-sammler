import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../models/User';
import { LicensePlate } from '../models/LicensePlate';
import { UserCollection } from '../models/UserCollection';

const isProduction = process.env.NODE_ENV === 'production';
const usePostgres = process.env.DB_TYPE === 'postgres';
// Allow synchronize to be overridden via env var
const synchronize = process.env.DB_SYNCHRONIZE === 'true' || !isProduction;

export const getDatabaseConfig = (): DataSourceOptions => {
  if (usePostgres) {
    return {
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'kennzeichen_sammler',
      entities: [User, LicensePlate, UserCollection],
      synchronize: synchronize,
      logging: !isProduction || process.env.DB_LOGGING === 'true',
    };
  } else {
    return {
      type: 'sqlite',
      database: process.env.DB_PATH || 'database.sqlite',
      entities: [User, LicensePlate, UserCollection],
      synchronize: synchronize,
      logging: !isProduction || process.env.DB_LOGGING === 'true',
    };
  }
};

export const AppDataSource = new DataSource(getDatabaseConfig());

