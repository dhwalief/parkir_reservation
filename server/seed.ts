import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ParkingLocation from './models/ParkingLocation';
import ParkingZone from './models/ParkingZone';
import Reservation from './models/Reservation';

dotenv.config();

const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/nyewaparkiran';

async function seed() {
    try {
        await mongoose.connect(DB_URL);
        console.log("🔌 Connected to MongoDB...");

        // 1. Clear existing data
        console.log("🗑️ Clearing existing data...");
        await ParkingLocation.deleteMany({});
        await ParkingZone.deleteMany({});
        await Reservation.deleteMany({});
        
        // 2. Create Locations
        console.log("🏢 Creating parking locations...");
        const locA = new ParkingLocation({
            name: 'Gedung Sudirman Park',
            address: 'Jl. Jend. Sudirman Kav. 12, Jakarta Selatan',
            location: {
                type: 'Point',
                coordinates: [106.8227, -6.2023] // [Longitude, Latitude]
            },
            total_capacity: 100
        });

        const locB = new ParkingLocation({
            name: 'Mal Grand Indonesia',
            address: 'Jl. M.H. Thamrin No.1, Jakarta Pusat',
            location: {
                type: 'Point',
                coordinates: [106.8200, -6.1950]
            },
            total_capacity: 150
        });

        const locC = new ParkingLocation({
            name: 'Kawasan Stasiun MRT Dukuh Atas',
            address: 'Dukuh Atas, Sudirman',
            location: {
                type: 'Point',
                coordinates: [106.8211, -6.2012]
            },
            total_capacity: 50
        });

        await Promise.all([locA.save(), locB.save(), locC.save()]);

        // 3. Create Zones
        console.log("🅿️ Creating parking zones...");
        
        // Zones for Loc A
        await ParkingZone.create([
            { locationId: locA._id, name: 'Basement 1', floor_level: 'B1', total_capacity: 40, active_reservations: 0, active_occupants: 0, price_per_hour: 5000 },
            { locationId: locA._id, name: 'Basement 2', floor_level: 'B2', total_capacity: 60, active_reservations: 0, active_occupants: 0, price_per_hour: 5000 }
        ]);

        // Zones for Loc B
        await ParkingZone.create([
            { locationId: locB._id, name: 'Area VIP Valet', floor_level: 'Lobi Utama', total_capacity: 30, active_reservations: 0, active_occupants: 0, price_per_hour: 15000 },
            { locationId: locB._id, name: 'Gedung Parkir Barat', floor_level: 'Lantai 2-4', total_capacity: 120, active_reservations: 0, active_occupants: 0, price_per_hour: 4000 }
        ]);

        // Zones for Loc C
        await ParkingZone.create([
            { locationId: locC._id, name: 'Parkir Terbuka A', floor_level: 'Outdoor', total_capacity: 20, active_reservations: 0, active_occupants: 0, price_per_hour: 3000 },
            { locationId: locC._id, name: 'Parkir Motor/Sepeda', floor_level: 'Outdoor', total_capacity: 30, active_reservations: 0, active_occupants: 0, price_per_hour: 2000 }
        ]);

        console.log("✅ Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
