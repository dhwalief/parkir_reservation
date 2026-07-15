import express from 'express';
import { z } from 'zod';
import Reservation from '../models/Reservation';
import ParkingZone from '../models/ParkingZone';
import User from '../models/User';

const router = express.Router();

const holdSchema = z.object({
  zoneId: z.string(),
  locationId: z.string()
});

router.post('/hold', async (req, res) => {
  try {
    const { zoneId, locationId } = holdSchema.parse(req.body);

    // Atomic check and update for soft-lock
    const zone = await ParkingZone.findOneAndUpdate(
      {
        _id: zoneId,
        $expr: {
          $lt: [
            { $add: ["$active_reservations", "$active_occupants"] },
            "$total_capacity"
          ]
        }
      },
      {
        $inc: { active_reservations: 1 }
      },
      { returnDocument: 'after' }
    );

    if (!zone) {
      return res.status(400).json({ error: 'Zona penuh atau tidak ditemukan.' });
    }

    // 2 minutes from now
    const holdExpiresAt = new Date(Date.now() + 2 * 60 * 1000);

    const reservation = new Reservation({
      zoneId,
      locationId,
      status: 'pending_hold',
      holdExpiresAt
    });
    
    await reservation.save();
    res.json({ reservationId: reservation._id, holdExpiresAt });
  } catch (error) {
    console.error('Hold error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const confirmSchema = z.object({
  reservationId: z.string(),
  licensePlate: z.string(),
  phoneNumber: z.string()
});

router.post('/confirm', async (req, res) => {
  try {
    const { reservationId, licensePlate, phoneNumber } = confirmSchema.parse(req.body);
    
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservasi tidak ditemukan.' });
    }
    if (reservation.status !== 'pending_hold') {
      return res.status(400).json({ error: 'Reservasi tidak dapat dikonfirmasi (kadaluwarsa atau sudah aktif).' });
    }

    let user = await User.findOne({ phoneNumber });
    if (!user) {
      user = new User({ phoneNumber, licensePlates: [licensePlate] });
    } else {
      if (!user.licensePlates.includes(licensePlate)) {
        user.licensePlates.push(licensePlate);
      }
    }
    await user.save();

    reservation.userId = user._id as any;
    reservation.licensePlate = licensePlate;
    reservation.status = 'active_reservation';
    reservation.paymentStatus = 'paid';
    reservation.paymentAmount = 10000; // Mock 
    // 15 minutes from now
    reservation.reservationExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    // Generate simple token for QR
    reservation.qrCodeData = `TICKET-${reservation._id}-${Date.now()}`;
    
    await reservation.save();
    res.json(reservation);
  } catch (error) {
    console.error('Confirm error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/history', async (req, res) => {
  try {
    const { phoneNumber } = req.query;
    if (!phoneNumber) return res.json([]);
    
    const user = await User.findOne({ phoneNumber });
    if (!user) return res.json([]);

    const reservations = await Reservation.find({
      userId: user._id,
      status: { $in: ['active_reservation', 'Occupied', 'cancelled', 'expired'] }
    })
    .populate('locationId')
    .populate('zoneId')
    .sort({ createdAt: -1 });
    
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('zoneId')
      .populate('locationId');
    if (!reservation) return res.status(404).json({ error: 'Not found' });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

router.post('/report-full', async (req, res) => {
  try {
    const { reservationId } = req.body;
    const reservation = await Reservation.findById(reservationId);
    if (!reservation || reservation.status !== 'active_reservation') {
       return res.status(400).json({ error: 'Valid active reservation required.' });
    }
    
    // Atomic rollback capacity
    await ParkingZone.findByIdAndUpdate(reservation.zoneId, {
      $inc: { active_reservations: -1 }
    });
    
    reservation.status = 'cancelled';
    reservation.paymentStatus = 'refunded';
    reservation.isReportedFull = true;
    await reservation.save();
    
    res.json({ message: 'Laporan diterima, dana dikembalikan.', reservation });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
