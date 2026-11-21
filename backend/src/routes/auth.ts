import { Router } from 'express';
import {
  register, login, logout, refreshAccessToken, getCurrentUser,
} from '../controllers/auth';
import { validateRegisterBody, validateLoginBody } from '../middlewares/validation';
import auth from '../middlewares/auth';

const router = Router();
router.post('/register', validateRegisterBody, register);
router.post('/login', validateLoginBody, login);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', auth, getCurrentUser);
export default router;
