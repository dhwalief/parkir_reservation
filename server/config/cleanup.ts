import Reservation from '../models/Reservation';
import ParkingZone from '../models/ParkingZone';

export const startCleanupJob = () => {
  // Run cleanup every 30 seconds
  setInterval(async () => {
    try {
      const now = new Date();

      // Find expired holds
      const expiredHolds = await Reservation.find({
        status: 'pending_hold',
        holdExpiresAt: { $lt: now }
      });

      for (const hold of expiredHolds) {
        // Rollback capacity using atomic $inc
        await ParkingZone.findByIdAndUpdate(hold.zoneId, {
          $inc: { active_reservations: -1 }
        });
        hold.status = 'expired';
        await hold.save();
        console.log(`Cleaned up expired hold: ${hold._id}`);
      }

      // Find expired reservations
      const expiredReservations = await Reservation.find({
        status: 'active_reservation',
        reservationExpiresAt: { $lt: now }
      });

      for (const res of expiredReservations) {
        await ParkingZone.findByIdAndUpdate(res.zoneId, {
          $inc: { active_reservations: -1 }
        });
        res.status = 'expired';
        await res.save();
        console.log(`Cleaned up expired reservation: ${res._id}`);
      }
    } catch (err) {
      console.error('Error in cleanup job:', err);
    }
  }, 30000);
  console.log('Background cleanup job started');
};
