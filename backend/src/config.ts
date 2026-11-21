import dotenv from 'dotenv';
import path from 'path';
import ms, { StringValue } from 'ms';

dotenv.config();
export const PORT = Number(process.env.PORT ?? 3000);
export const DB_ADDRESS = process.env.DB_ADDRESS ?? 'mongodb://127.0.0.1:27017/weblarek';
export const ORIGIN_ALLOW = process.env.ORIGIN_ALLOW ?? 'http://localhost:5173';
export const PUBLIC_PATH = path.resolve(__dirname, '../public');
export const UPLOAD_PATH = process.env.UPLOAD_PATH ?? 'images';
export const UPLOAD_PATH_TEMP = path.resolve(__dirname, '..', process.env.UPLOAD_PATH_TEMP ?? 'temp');
export const ACCESS_SECRET = process.env.AUTH_ACCESS_TOKEN_SECRET ?? 'development-access-secret';
export const REFRESH_SECRET = process.env.AUTH_REFRESH_TOKEN_SECRET ?? 'development-refresh-secret';
export const ACCESS_EXPIRY = (process.env.AUTH_ACCESS_TOKEN_EXPIRY ?? '10m') as StringValue;
export const REFRESH_EXPIRY = (process.env.AUTH_REFRESH_TOKEN_EXPIRY ?? '7d') as StringValue;
export const REFRESH_MAX_AGE = ms(REFRESH_EXPIRY);
