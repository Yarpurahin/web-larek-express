import { Request, Response, NextFunction } from 'express';
import { ACCESS_SECRET } from '../config';
import { readToken } from '../utils/tokens';
import UnauthorizedError from '../errors/unauthorized-error';

export default function auth(req: Request, res: Response, next: NextFunction) {
  try {
    const match = req.headers.authorization?.match(/^Bearer (\S+)$/i);
    const id = readToken(match?.[1], ACCESS_SECRET);
    if (!/^[a-f\d]{24}$/i.test(id)) throw new UnauthorizedError('Некорректный токен');
    res.locals.userId = id;
    next();
  } catch (err) {
    next(err);
  }
}
