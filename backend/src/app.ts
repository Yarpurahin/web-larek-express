import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';
import {
  DB_ADDRESS, PORT, ORIGIN_ALLOW, PUBLIC_PATH,
} from './config';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import authRouter from './routes/auth';
import uploadRouter from './routes/upload';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';
import NotFoundError from './errors/not-found-error';
import { prepareDirectories, startCleanup } from './utils/files';

const app = express();
app.use(requestLogger);
app.use(cors({ origin: ORIGIN_ALLOW.split(',').map((origin) => origin.trim()), credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.static(PUBLIC_PATH));
app.use('/auth', authRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use('/upload', uploadRouter);
app.use((_req, _res, next) => next(new NotFoundError('Маршрут не найден')));
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);

Promise.all([mongoose.connect(DB_ADDRESS), prepareDirectories()])
  .then(() => {
    startCleanup();
    app.listen(PORT);
  })
  .catch((err: unknown) => {
    console.error('Не удалось запустить сервер:', err);
    process.exitCode = 1;
    mongoose.disconnect();
  });
