import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { Error as MongooseError } from 'mongoose';
import User, { IUser } from '../models/user';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import NotFoundError from '../errors/not-found-error';
import UnauthorizedError from '../errors/unauthorized-error';
import { REFRESH_SECRET } from '../config';
import {
  createTokens, readToken, cookieOptions, refreshCookieOptions,
} from '../utils/tokens';

const sendSession = (res: Response, user: IUser, tokens: ReturnType<typeof createTokens>) => {
  res.cookie('refreshToken', tokens.refreshToken, refreshCookieOptions);
  return res.send({
    user: { email: user.email, name: user.name }, success: true, accessToken: tokens.accessToken,
  });
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hash });
    const tokens = createTokens(user._id.toString());
    user.tokens = [{ token: tokens.refreshToken }];
    await user.save();
    return sendSession(res.status(201), user, tokens);
  } catch (err) {
    if (err instanceof MongooseError.ValidationError) return next(new BadRequestError(err.message));
    if (err instanceof Error && err.message.includes('E11000')) {
      return next(new ConflictError('Пользователь с таким email уже существует'));
    }
    return next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user || !await bcrypt.compare(password, user.password)) {
      throw new UnauthorizedError('Неверная почта или пароль');
    }
    const tokens = createTokens(user._id.toString());
    await User.updateOne({ _id: user._id }, { $push: { tokens: { token: tokens.refreshToken } } });
    return sendSession(res, user, tokens);
  } catch (err) {
    return next(err);
  }
};

export const getCurrentUser = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findById(res.locals.userId);
    if (!user) throw new NotFoundError('Пользователь не найден');
    return res.send({ user: { email: user.email, name: user.name }, success: true });
  } catch (err) {
    return next(err);
  }
};

const getRefreshSession = async (req: Request) => {
  const token = req.cookies?.refreshToken;
  const id = readToken(token, REFRESH_SECRET);
  if (!/^[a-f\d]{24}$/i.test(id)) throw new BadRequestError('Некорректный ID пользователя');
  const user = await User.findById(id);
  if (!user) throw new NotFoundError('Пользователь не найден');
  return { token, user };
};

export const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await getRefreshSession(req);
    const tokens = createTokens(user._id.toString());
    const result = await User.updateOne(
      { _id: user._id, 'tokens.token': token },
      { $set: { 'tokens.$.token': tokens.refreshToken } },
    );
    if (!result.matchedCount) throw new UnauthorizedError('Токен отозван');
    return sendSession(res, user, tokens);
  } catch (err) {
    return next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, user } = await getRefreshSession(req);
    const result = await User.updateOne({ _id: user._id, 'tokens.token': token }, { $pull: { tokens: { token } } });
    if (!result.matchedCount) throw new UnauthorizedError('Токен отозван');
    res.clearCookie('refreshToken', cookieOptions);
    return res.send({ success: true });
  } catch (err) {
    return next(err);
  }
};
