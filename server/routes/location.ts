import express from 'express';
import ParkingLocation from '../models/ParkingLocation';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (lat && lng) {
      // Find locations near the user using $geoNear
      const locations = await ParkingLocation.aggregate([
        {
          $geoNear: {
            near: {
              type: 'Point',
              coordinates: [parseFloat(lng as string), parseFloat(lat as string)]
            },
            distanceField: 'distance',
            spherical: true
          }
        }
      ]);
      return res.json(locations);
    } else {
      // Fallback: list all
      const locations = await ParkingLocation.find({});
      return res.json(locations);
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
