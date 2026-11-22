import { randomUUID } from 'crypto';
import jwt from 'jsonwebtoken';
import { CookieOptions } from 'express';
import {
  ACCESS_SECRET, REFRESH_SECRET, ACCESS_EXPIRY, REFRESH_EXPIRY, REFRESH_MAX_AGE,
} from '../config';
import UnauthorizedError from '../errors/unauthorized-error';

export const cookieOptions: CookieOptions = {
  httpOnly: true, sameSite: 'lax', secure: false, path: '/',
};
export const refreshCookieOptions = { ...cookieOptions, maxAge: REFRESH_MAX_AGE };

export const createTokens = (_id: string) => ({
  accessToken: jwt.sign({ _id }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY }),
  refreshToken: jwt.sign({ _id }, REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRY,
    header: { alg: 'HS256', typ: 'JWT', kid: randomUUID() },
  }),
});

export const readToken = (token: unknown, secret: string): string => {
  try {
    if (typeof token !== 'string') throw new Error();
    const payload = jwt.verify(token, secret, { algorithms: ['HS256'] });
    if (typeof payload === 'string' || typeof payload._id !== 'string') throw new Error();
    return payload._id;
  } catch (_err) {
    throw new UnauthorizedError('Необходима авторизация');
  }
};
