import mongoose from 'mongoose';
import { removeImage } from '../utils/files';

interface IProduct {
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description?: string;
  price?: number | null;
}

const productSchema = new mongoose.Schema<IProduct>({
  title: {
    type: String,
    minlength: 2,
    maxlength: 30,
    required: true,
    unique: true,
  },
  image: {
    type: new mongoose.Schema({
      fileName: {
        type: String,
        required: true,
      },
      originalName: {
        type: String,
        required: true,
      },
    }, { _id: false }),
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  price: {
    type: Number,
    required: false,
    default: null,
  },
});

productSchema.post('findOneAndDelete', async (product) => {
  if (product && !await mongoose.model('product').exists({ 'image.fileName': product.image.fileName })) {
    await removeImage(product.image.fileName);
  }
});

export default mongoose.model<IProduct>('product', productSchema);
