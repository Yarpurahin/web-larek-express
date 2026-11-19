import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import { DB_ADDRESS, PORT } from './config';
import productRouter from './routes/product';
import orderRouter from './routes/order';
import errorHandler from './middlewares/error-handler';
import { requestLogger, errorLogger } from './middlewares/logger';
import NotFoundError from './errors/not-found-error';

const cors = require('cors');

const app = express();

mongoose.connect(DB_ADDRESS)
  .then(() => {
    app.listen(PORT);
  })
  .catch((err: unknown) => {
    console.error('Не удалось подключиться к MongoDB:', err);
    process.exitCode = 1;
  });

app.use(requestLogger);
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));
app.use('/product', productRouter);
app.use('/order', orderRouter);
app.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
app.use(errorLogger);
app.use(errors());
app.use(errorHandler);
