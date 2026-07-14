import express from 'express';
import { z } from 'zod';
import Reservation from '../models/Reservation';
import ParkingZone from '../models/ParkingZone';

const router = express.Router();

const scanSchema = z.object({
  qrCodeData: z.string(),
  gateLocationId: z.string() // Staff gate location
});

router.post('/check-in', async (req, res) => {
  try {
    const { qrCodeData, gateLocationId } = scanSchema.parse(req.body);
    
    const reservation = await Reservation.findOne({ qrCodeData });
    if (!reservation) {
      return res.status(404).json({ error: 'Tiket tidak ditemukan.' });
    }
    
    if (reservation.status !== 'active_reservation') {
      return res.status(400).json({ error: `Tiket tidak valid. Status saat ini: ${reservation.status}` });
    }
    
    if (reservation.locationId.toString() !== gateLocationId) {
      return res.status(400).json({ error: 'Salah lokasi! Tiket ini bukan untuk gedung ini.' });
    }
    
    // Valid. Move from active_reservations to active_occupants
    await ParkingZone.findByIdAndUpdate(reservation.zoneId, {
      $inc: { active_reservations: -1, active_occupants: 1 }
    });
    
    reservation.status = 'occupied';
    reservation.checkInTime = new Date();
    await reservation.save();
    
    res.json({ message: 'Check-in sukses. Palang terbuka.', reservation });
  } catch (error) {
    console.error('Check-in error:', error);
    res.status(500).json({ error: 'Internal error' });
  }
});

export default router;
