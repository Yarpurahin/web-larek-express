import { celebrate, Joi, Segments } from 'celebrate';
import { Request, Response, NextFunction } from 'express';
import UnauthorizedError from '../errors/unauthorized-error';

export const validateProductBody = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30).required(),
    image: Joi.object({
      fileName: Joi.string().required(),
      originalName: Joi.string().required(),
    }).required(),
    category: Joi.string().required(),
    description: Joi.string().allow(''),
    price: Joi.number().allow(null),
  }).required(),
}, { convert: false });

export const validateOrderBody = celebrate({
  [Segments.BODY]: Joi.object({
    payment: Joi.string().valid('card', 'online').required(),
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/\S/).required(),
    address: Joi.string().pattern(/\S/).required(),
    total: Joi.number().required(),
    items: Joi.array().items(Joi.string().pattern(/^[a-f\d]{24}$/i).required()).min(1).required(),
  }).required(),
}, { convert: false });

export const validateProductUpdateBody = celebrate({
  [Segments.BODY]: Joi.object({
    title: Joi.string().min(2).max(30),
    image: Joi.object({
      fileName: Joi.string().required(), originalName: Joi.string().required(),
    }),
    category: Joi.string(),
    description: Joi.string().allow(''),
    price: Joi.number().allow(null),
  }).required(),
}, { convert: false });

export const validateProductId = celebrate({
  [Segments.PARAMS]: Joi.object({ productId: Joi.string().pattern(/^[a-f\d]{24}$/i).required() }),
});

export const validateRegisterBody = celebrate({
  [Segments.BODY]: Joi.object({
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }).required(),
}, { convert: false });

const loginSchema = Joi.object({
  email: Joi.string().email().required(), password: Joi.string().required(),
}).required();

export const validateLoginBody = (req: Request, _res: Response, next: NextFunction) => {
  const { error } = loginSchema.validate(req.body, { convert: false });
  next(error ? new UnauthorizedError('Неверная почта или пароль') : undefined);
};
