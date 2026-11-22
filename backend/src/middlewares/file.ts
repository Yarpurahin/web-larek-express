import multer from 'multer';
import { randomUUID } from 'crypto';
import { mkdir } from 'fs';
import { UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';

const extensions: Record<string, string> = {
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
  'image/svg+xml': '.svg',
};

export default multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => {
      mkdir(UPLOAD_PATH_TEMP, { recursive: true }, (err) => callback(err, UPLOAD_PATH_TEMP));
    },
    filename: (_req, file, callback) => callback(null, randomUUID() + extensions[file.mimetype]),
  }),
  limits: { fileSize: 5 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => {
    if (!extensions[file.mimetype]) {
      return callback(new BadRequestError('Допустимы изображения PNG, JPEG, WebP и SVG'));
    }
    return callback(null, true);
  },
});
