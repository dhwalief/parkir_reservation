import express from 'express';
import ParkingZone from '../models/ParkingZone';
import Reservation from '../models/Reservation';

const router = express.Router();

router.get('/stats', async (req, res) => {
  try {
    const active_reservations = await Reservation.countDocuments({ status: 'active_reservation' });
    const occupants = await Reservation.countDocuments({ status: 'Occupied' });
    const anomalies = await Reservation.countDocuments({ isReportedFull: true });

    res.json({ active_reservations, occupants, anomalies });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/zones', async (req, res) => {
  try {
    const zones = await ParkingZone.find().populate('locationId');
    res.json(zones);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/zones/:id', async (req, res) => {
  try {
    const { total_capacity, price_per_hour } = req.body;
    const zone = await ParkingZone.findByIdAndUpdate(req.params.id, {
      total_capacity: Number(total_capacity),
      price_per_hour: Number(price_per_hour)
    }, { returnDocument: 'after' });
    
    if (!zone) return res.status(404).json({ error: 'Zona tidak ditemukan' });
    res.json(zone);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/zones/:id/override', async (req, res) => {
  try {
    const zone = await ParkingZone.findByIdAndUpdate(req.params.id, {
      total_capacity: 0
    }, { returnDocument: 'after' });
    
    if (!zone) return res.status(404).json({ error: 'Zona tidak ditemukan' });
    res.json({ message: 'Zona berhasil ditutup paksa' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
