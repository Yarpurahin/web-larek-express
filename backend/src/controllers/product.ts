import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';

export const getProducts = (
  _req: Request,
  res: Response,
  next: NextFunction,
) => Product.find({})
  .then((products) => res.send({ items: products, total: products.length }))
  .catch(next);

export const createProduct = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const {
    description, image, title, category, price,
  } = req.body || {};

  return Product.create({
    description,
    image,
    title,
    category,
    price,
  })
    .then((product) => res.status(201).send({ data: product }))
    .catch((err: unknown) => {
      if (err instanceof MongooseError.ValidationError) {
        return next(new BadRequestError(err.message));
      }

      if (err instanceof Error && err.message.includes('E11000')) {
        return next(new ConflictError('Товар с таким названием уже существует'));
      }

      return next(err);
    });
};
