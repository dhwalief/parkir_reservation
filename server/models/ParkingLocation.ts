import mongoose, { Schema, Document } from 'mongoose';

export interface IParkingLocation extends Document {
  name: string;
  address: string;
  description?: string;
  image?: string;
  radius_meters: number;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
}

const ParkingLocationSchema: Schema = new Schema({
  name: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  radius_meters: { type: Number, default: 5000 },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point', required: true },
    coordinates: {
      type: [Number],
      required: true,
      index: '2dsphere'
    }
  }
}, { timestamps: true });

export default mongoose.model<IParkingLocation>('ParkingLocation', ParkingLocationSchema);
