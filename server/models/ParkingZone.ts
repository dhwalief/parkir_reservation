import mongoose, { Schema, Document } from 'mongoose';

export interface IParkingZone extends Document {
  locationId: mongoose.Types.ObjectId;
  name: string;
  total_capacity: number;
  active_reservations: number;
  active_occupants: number;
  price_per_hour: number;
}

const ParkingZoneSchema: Schema = new Schema({
  locationId: { type: Schema.Types.ObjectId, ref: 'ParkingLocation', required: true },
  name: { type: String, required: true },
  total_capacity: { type: Number, required: true },
  active_reservations: { type: Number, default: 0 },
  active_occupants: { type: Number, default: 0 },
  price_per_hour: { type: Number, required: true },
}, { timestamps: true });

export default mongoose.model<IParkingZone>('ParkingZone', ParkingZoneSchema);
