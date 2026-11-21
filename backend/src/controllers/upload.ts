import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';
import { imagePrefix } from '../utils/files';

export default function uploadFile(req: Request, res: Response, next: NextFunction) {
  if (!req.file) return next(new BadRequestError('Необходимо передать файл в поле file'));
  return res.send({
    fileName: imagePrefix + req.file.filename,
    originalName: req.file.originalname,
  });
}
