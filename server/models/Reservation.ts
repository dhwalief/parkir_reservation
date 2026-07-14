import mongoose, { Schema, Document } from 'mongoose';

export interface IReservation extends Document {
  userId?: mongoose.Types.ObjectId; // Optional initially for soft-hold
  zoneId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  licensePlate?: string;
  status: 'pending_hold' | 'active_reservation' | 'occupied' | 'completed' | 'expired' | 'cancelled';
  holdExpiresAt?: Date;
  reservationExpiresAt?: Date;
  checkInTime?: Date;
  checkOutTime?: Date;
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  paymentAmount: number;
  qrCodeData?: string;
  isReportedFull: boolean;
}

const ReservationSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  zoneId: { type: Schema.Types.ObjectId, ref: 'ParkingZone', required: true },
  locationId: { type: Schema.Types.ObjectId, ref: 'ParkingLocation', required: true },
  licensePlate: { type: String },
  status: { 
    type: String, 
    enum: ['pending_hold', 'active_reservation', 'occupied', 'completed', 'expired', 'cancelled'], 
    default: 'pending_hold' 
  },
  holdExpiresAt: { type: Date },
  reservationExpiresAt: { type: Date },
  checkInTime: { type: Date },
  checkOutTime: { type: Date },
  paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
  paymentAmount: { type: Number, default: 0 },
  qrCodeData: { type: String },
  isReportedFull: { type: Boolean, default: false }
}, { timestamps: true });

export default mongoose.model<IReservation>('Reservation', ReservationSchema);
