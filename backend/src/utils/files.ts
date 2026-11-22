import path from 'path';
import { promises as fs } from 'fs';
import cron from 'node-cron';
import { PUBLIC_PATH, UPLOAD_PATH, UPLOAD_PATH_TEMP } from '../config';
import BadRequestError from '../errors/bad-request-error';

export const imageDirectory = path.join(PUBLIC_PATH, UPLOAD_PATH);
export const imagePrefix = `/${UPLOAD_PATH.replace(/\\/g, '/')}/`;

export const imageName = (fileName: string) => {
  if (!fileName.startsWith(imagePrefix)) throw new BadRequestError('Некорректный путь изображения');
  const name = fileName.slice(imagePrefix.length);
  if (!name || name === '.' || name === '..' || /[/\\:]/.test(name) || name.includes('\0')) {
    throw new BadRequestError('Некорректный путь изображения');
  }
  return name;
};

export const prepareDirectories = async () => {
  await Promise.all([
    fs.mkdir(imageDirectory, { recursive: true }),
    fs.mkdir(UPLOAD_PATH_TEMP, { recursive: true }),
  ]);
};

export const moveImage = async (fileName: string): Promise<boolean> => {
  const name = imageName(fileName);
  await prepareDirectories();
  try {
    await fs.rename(path.join(UPLOAD_PATH_TEMP, name), path.join(imageDirectory, name));
    return true;
  } catch (err) {
    if ((err as { code?: string }).code !== 'ENOENT') throw err;
    try {
      await fs.access(path.join(imageDirectory, name));
      return false;
    } catch (_err) {
      throw new BadRequestError('Сначала загрузите изображение');
    }
  }
};

export const restoreImage = async (fileName: string) => {
  const name = imageName(fileName);
  await fs.rename(path.join(imageDirectory, name), path.join(UPLOAD_PATH_TEMP, name));
};

export const removeImage = async (fileName: string) => {
  await fs.rm(path.join(imageDirectory, imageName(fileName)), { force: true });
};

export const cleanupTempFiles = async (now = Date.now()) => {
  await prepareDirectories();
  const entries = await fs.readdir(UPLOAD_PATH_TEMP, { withFileTypes: true });
  await Promise.all(entries.filter((entry) => entry.isFile()).map(async (entry) => {
    const file = path.join(UPLOAD_PATH_TEMP, entry.name);
    try {
      const stat = await fs.stat(file);
      if (now - stat.mtimeMs > 24 * 60 * 60 * 1000) await fs.unlink(file);
    } catch (err) {
      if ((err as { code?: string }).code !== 'ENOENT') throw err;
    }
  }));
};

export const startCleanup = () => cron.schedule('0 3 * * *', async () => {
  try {
    await cleanupTempFiles();
  } catch (err) {
    console.error('Не удалось очистить временные файлы:', err);
  }
});
