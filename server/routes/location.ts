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
        },
        {
          $match: {
            $expr: {
              $lte: ['$distance', { $ifNull: ['$radius_meters', 5000] }]
            }
          }
        },
        {
          $lookup: {
            from: 'parkingzones',
            localField: '_id',
            foreignField: 'locationId',
            as: 'zones'
          }
        },
        {
          $addFields: {
            total_capacity: {
              $reduce: {
                input: '$zones',
                initialValue: 0,
                in: {
                  $add: [
                    '$$value',
                    {
                      $max: [
                        0,
                        {
                          $subtract: [
                            '$$this.total_capacity',
                            { $add: ['$$this.active_reservations', '$$this.active_occupants'] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            zones: 0
          }
        }
      ]);
      return res.json(locations);
    } else {
      // Fallback: list all
      const locations = await ParkingLocation.aggregate([
        {
          $lookup: {
            from: 'parkingzones',
            localField: '_id',
            foreignField: 'locationId',
            as: 'zones'
          }
        },
        {
          $addFields: {
            total_capacity: {
              $reduce: {
                input: '$zones',
                initialValue: 0,
                in: {
                  $add: [
                    '$$value',
                    {
                      $max: [
                        0,
                        {
                          $subtract: [
                            '$$this.total_capacity',
                            { $add: ['$$this.active_reservations', '$$this.active_occupants'] }
                          ]
                        }
                      ]
                    }
                  ]
                }
              }
            }
          }
        },
        {
          $project: {
            zones: 0
          }
        }
      ]);
      return res.json(locations);
    }
  } catch (error) {
    console.error('Error fetching locations:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
