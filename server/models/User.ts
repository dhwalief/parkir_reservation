import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  phoneNumber: string;
  licensePlates: string[];
  role: 'user' | 'gate_staff' | 'admin';
}

const UserSchema: Schema = new Schema({
  phoneNumber: { type: String, required: true, unique: true },
  licensePlates: [{ type: String }],
  role: { type: String, enum: ['user', 'gate_staff', 'admin'], default: 'user' }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);
