import express from 'express';
import ParkingLocation from '../models/ParkingLocation';
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

router.get('/locations', async (req, res) => {
  try {
    const locations = await ParkingLocation.find().sort({ createdAt: -1 });
    res.json(locations);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/locations', async (req, res) => {
  try {
    const { name, address, lng, lat, radius_meters } = req.body;
    const loc = await ParkingLocation.create({
      name,
      address,
      radius_meters: Number(radius_meters) || 5000,
      location: {
        type: 'Point',
        coordinates: [Number(lng), Number(lat)]
      }
    });
    res.status(201).json(loc);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/locations/:id', async (req, res) => {
  try {
    const { name, address, radius_meters } = req.body;
    const loc = await ParkingLocation.findByIdAndUpdate(req.params.id, {
      name,
      address,
      radius_meters: Number(radius_meters)
    }, { returnDocument: 'after' });
    if (!loc) return res.status(404).json({ error: 'Gedung tidak ditemukan' });
    res.json(loc);
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/locations/:id', async (req, res) => {
  try {
    const loc = await ParkingLocation.findByIdAndDelete(req.params.id);
    if (!loc) return res.status(404).json({ error: 'Gedung tidak ditemukan' });
    await ParkingZone.deleteMany({ locationId: req.params.id });
    res.json({ message: 'Gedung berhasil dihapus' });
  } catch (err) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/zones', async (req, res) => {
  try {
    const { locationId, name, floor_level, total_capacity, price_per_hour } = req.body;
    const zone = await ParkingZone.create({
      locationId,
      name,
      floor_level,
      total_capacity: Number(total_capacity),
      active_reservations: 0,
      active_occupants: 0,
      price_per_hour: Number(price_per_hour)
    });
    res.status(201).json(zone);
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

router.delete('/zones/:id', async (req, res) => {
  try {
    const zone = await ParkingZone.findByIdAndDelete(req.params.id);
    if (!zone) return res.status(404).json({ error: 'Zona tidak ditemukan' });
    res.json({ message: 'Zona berhasil dihapus' });
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
