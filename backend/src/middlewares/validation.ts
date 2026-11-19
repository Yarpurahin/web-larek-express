import { celebrate, Joi, Segments } from 'celebrate';

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
