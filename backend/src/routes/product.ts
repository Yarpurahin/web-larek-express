import { Router } from 'express';
import {
  createProduct, getProducts, updateProduct, deleteProduct,
} from '../controllers/product';
import { validateProductBody, validateProductUpdateBody, validateProductId } from '../middlewares/validation';
import auth from '../middlewares/auth';

const router = Router();
router.get('/', getProducts);
router.post('/', auth, validateProductBody, createProduct);
router.patch('/:productId', auth, validateProductId, validateProductUpdateBody, updateProduct);
router.delete('/:productId', auth, validateProductId, deleteProduct);
export default router;
