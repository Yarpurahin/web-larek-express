import { Router } from 'express';
import { createProduct, getProducts } from '../controllers/product';
import { validateProductBody } from '../middlewares/validation';

const router = Router();

router.post('/', validateProductBody, createProduct);
router.get('/', getProducts);

export default router;
