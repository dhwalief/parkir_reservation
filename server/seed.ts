import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ParkingLocation from './models/ParkingLocation';
import ParkingZone from './models/ParkingZone';
import Reservation from './models/Reservation';

dotenv.config();

const DB_URL = process.env.DB_URL || 'mongodb://127.0.0.1:27017/nyewaparkiran_db';

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
        
        // --- Existing Jakarta Locations ---
        const locA = new ParkingLocation({
            name: 'Gedung Sudirman Park',
            address: 'Jl. Jend. Sudirman Kav. 12, Jakarta Selatan',
            location: { type: 'Point', coordinates: [106.8227, -6.2023] },
            radius_meters: 5000
        });

        const locB = new ParkingLocation({
            name: 'Mal Grand Indonesia',
            address: 'Jl. M.H. Thamrin No.1, Jakarta Pusat',
            location: { type: 'Point', coordinates: [106.8200, -6.1950] },
            radius_meters: 5000
        });

        const locC = new ParkingLocation({
            name: 'Kawasan Stasiun MRT Dukuh Atas',
            address: 'Dukuh Atas, Sudirman',
            location: { type: 'Point', coordinates: [106.8211, -6.2012] },
            radius_meters: 5000
        });

        // --- New Makassar Iconic Locations ---
        const locMakassar1 = new ParkingLocation({
            name: 'Pantai Losari (Anjungan)',
            address: 'Jl. Penghibur, Makassar',
            location: { type: 'Point', coordinates: [119.4082, -5.1436] }, // Lng, Lat
            radius_meters: 10000
        });

        const locMakassar2 = new ParkingLocation({
            name: 'Trans Studio Mall Makassar',
            address: 'Jl. Metro Tanjung Bunga, Makassar',
            location: { type: 'Point', coordinates: [119.3920, -5.1583] },
            radius_meters: 10000
        });

        const locMakassar3 = new ParkingLocation({
            name: 'Benteng Rotterdam (Fort Rotterdam)',
            address: 'Jl. Ujung Pandang, Makassar',
            location: { type: 'Point', coordinates: [119.4054, -5.1337] },
            radius_meters: 10000
        });

        const locMakassar4 = new ParkingLocation({
            name: 'Masjid Terapung Amirul Mukminin',
            address: 'Kawasan Pantai Losari, Makassar',
            location: { type: 'Point', coordinates: [119.4072, -5.1458] },
            radius_meters: 10000
        });

        const locMakassar5 = new ParkingLocation({
            name: 'Mall Panakkukang',
            address: 'Jl. Boulevard, Masale, Panakkukang, Makassar',
            location: { type: 'Point', coordinates: [119.4452, -5.1565] },
            radius_meters: 10000
        });

        const locMakassar6 = new ParkingLocation({
            name: 'Nipah Mall',
            address: 'Jl. Urip Sumoharjo, Makassar',
            location: { type: 'Point', coordinates: [119.4475, -5.1396] },
            radius_meters: 10000
        });

        const locMakassar7 = new ParkingLocation({
            name: 'Karebosi Link',
            address: 'Lapangan Karebosi, Makassar',
            location: { type: 'Point', coordinates: [119.4124, -5.1367] },
            radius_meters: 10000
        });

        await Promise.all([
            locA.save(), locB.save(), locC.save(),
            locMakassar1.save(), locMakassar2.save(), locMakassar3.save(),
            locMakassar4.save(), locMakassar5.save(), locMakassar6.save(), locMakassar7.save()
        ]);

        // 3. Create Zones
        console.log("🅿️ Creating parking zones...");
        
        await ParkingZone.create([
            { locationId: locA._id, name: 'Basement 1', floor_level: 'B1', total_capacity: 40, active_reservations: 0, active_occupants: 0, price_per_hour: 5000 },
            { locationId: locA._id, name: 'Basement 2', floor_level: 'B2', total_capacity: 60, active_reservations: 0, active_occupants: 0, price_per_hour: 5000 },
            { locationId: locB._id, name: 'Area VIP Valet', floor_level: 'Lobi Utama', total_capacity: 30, active_reservations: 0, active_occupants: 0, price_per_hour: 15000 },
            { locationId: locB._id, name: 'Gedung Parkir Barat', floor_level: 'Lantai 2-4', total_capacity: 120, active_reservations: 0, active_occupants: 0, price_per_hour: 4000 },
            { locationId: locC._id, name: 'Parkir Terbuka A', floor_level: 'Outdoor', total_capacity: 20, active_reservations: 0, active_occupants: 0, price_per_hour: 3000 },
            { locationId: locC._id, name: 'Parkir Motor', floor_level: 'Outdoor', total_capacity: 30, active_reservations: 0, active_occupants: 0, price_per_hour: 2000 },
            
            // Makassar Zones
            { locationId: locMakassar1._id, name: 'Kawasan Pelataran Pantai', floor_level: 'Outdoor', total_capacity: 200, active_reservations: 0, active_occupants: 0, price_per_hour: 3000 },
            { locationId: locMakassar2._id, name: 'Gedung Parkir Trans (Mobil)', floor_level: 'P1 - P3', total_capacity: 500, active_reservations: 0, active_occupants: 0, price_per_hour: 5000 },
            { locationId: locMakassar2._id, name: 'Parkir Motor Trans', floor_level: 'Basement', total_capacity: 800, active_reservations: 0, active_occupants: 0, price_per_hour: 3000 },
            { locationId: locMakassar3._id, name: 'Parkir Pengunjung Benteng', floor_level: 'Outdoor', total_capacity: 100, active_reservations: 0, active_occupants: 0, price_per_hour: 5000 },
            { locationId: locMakassar4._id, name: 'Kawasan Bahari', floor_level: 'Outdoor', total_capacity: 50, active_reservations: 0, active_occupants: 0, price_per_hour: 3000 },
            { locationId: locMakassar5._id, name: 'Gedung Parkir VIP MP', floor_level: 'Lobi', total_capacity: 150, active_reservations: 0, active_occupants: 0, price_per_hour: 10000 },
            { locationId: locMakassar6._id, name: 'Basement Nipah', floor_level: 'B1 & B2', total_capacity: 300, active_reservations: 0, active_occupants: 0, price_per_hour: 5000 },
            { locationId: locMakassar7._id, name: 'Parkir Bawah Tanah Karebosi', floor_level: 'B1', total_capacity: 400, active_reservations: 0, active_occupants: 0, price_per_hour: 4000 }
        ]);

        // 4. Create 2dsphere Geospatial Index for Fast Queries
        await ParkingLocation.collection.createIndex({ location: "2dsphere" });
        console.log("🌐 Created 2dsphere index for geolocation.");

        console.log("✅ Database seeded successfully!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    }
}

seed();
