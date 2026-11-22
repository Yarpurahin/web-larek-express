import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/product';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import { moveImage, restoreImage } from '../utils/files';

const handleProductError = (err: unknown, next: NextFunction) => {
  if (err instanceof MongooseError.ValidationError || err instanceof MongooseError.CastError) {
    return next(new BadRequestError(err.message));
  }
  if (err instanceof Error && err.message.includes('E11000')) {
    return next(new ConflictError('Товар с таким названием уже существует'));
  }
  return next(err);
};

export const getProducts = (_req: Request, res: Response, next: NextFunction) => Product.find({})
  .then((products) => res.send({ items: products, total: products.length }))
  .catch(next);

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  let moved = false;
  try {
    const product = new Product(req.body);
    await product.validate();
    moved = await moveImage(product.image.fileName);
    await product.save();
    return res.status(201).send(product);
  } catch (err) {
    if (moved) {
      try { await restoreImage(req.body.image.fileName); } catch (restoreError) {
        return next(restoreError);
      }
    }
    return handleProductError(err, next);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  let moved = false;
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) throw new NotFoundError('Товар не найден');
    product.set(req.body);
    await product.validate();
    if (req.body.image) moved = await moveImage(req.body.image.fileName);
    await product.save();
    return res.send(product);
  } catch (err) {
    if (moved) {
      try { await restoreImage(req.body.image.fileName); } catch (restoreError) {
        return next(restoreError);
      }
    }
    return handleProductError(err, next);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) throw new NotFoundError('Товар не найден');
    return res.send(product);
  } catch (err) {
    return handleProductError(err, next);
  }
};
