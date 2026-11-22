import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';

const createOrder = async (req: Request, res: Response, next: NextFunction) => {
  const { total, items } = req.body || {};

  try {
    const products = await Promise.all(items.map((id: string) => Product.findById(id)));
    if (products.some((product) => !product)) {
      return next(new BadRequestError('Товар не найден'));
    }

    if (products.some((product) => product?.price == null)) {
      return next(new BadRequestError('Товар не продается'));
    }

    const orderTotal = products.reduce(
      (sum, product) => sum + (product?.price ?? 0),
      0,
    );

    if (orderTotal !== total) {
      return next(new BadRequestError('Неверная сумма заказа'));
    }

    return res.status(200).send({ id: randomUUID(), total: orderTotal });
  } catch (err) {
    return next(err);
  }
};
export default createOrder;
