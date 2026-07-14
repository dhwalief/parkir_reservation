import express from 'express';
import ParkingZone from '../models/ParkingZone';

const router = express.Router();

router.get('/:locationId/zones', async (req, res) => {
  try {
    const { locationId } = req.params;
    const zones = await ParkingZone.find({ locationId });
    // Virtual calculation can be done here or in frontend
    const result = zones.map(zone => {
      const available_slots = Math.max(0, zone.total_capacity - zone.active_reservations - zone.active_occupants);
      return {
        ...zone.toObject(),
        available_slots
      };
    });
    res.json(result);
  } catch (error) {
    console.error('Error fetching zones:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
