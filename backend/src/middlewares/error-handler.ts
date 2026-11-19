import { Request, Response, NextFunction } from 'express';

export default function errorHandler(
  err: Error & { statusCode?: number },
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const status = err.statusCode ?? 500;
  let message;

  if (status === 500) {
    message = 'На сервере произошла ошибка';
  } else {
    message = err.message;
  }

  res.status(status).send({ message });
}
