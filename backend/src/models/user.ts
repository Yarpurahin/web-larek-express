import mongoose from 'mongoose';
import validator from 'validator';

export interface IUser {
  name: string;
  email: string;
  password: string;
  tokens: { token: string }[];
}

const userSchema = new mongoose.Schema<IUser>({
  name: {
    type: String, minlength: 2, maxlength: 30, default: 'Ё-мое',
  },
  email: {
    type: String, required: true, unique: true, validate: validator.isEmail,
  },
  password: {
    type: String, required: true, minlength: 6, select: false,
  },
  tokens: {
    type: [new mongoose.Schema({ token: { type: String, required: true } }, { _id: false })],
    default: [],
    select: false,
  },
});

export default mongoose.model<IUser>('user', userSchema);
