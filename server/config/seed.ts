import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ParkingLocation from '../models/ParkingLocation';
import ParkingZone from '../models/ParkingZone';
import User from '../models/User';

dotenv.config();

const seedDB = async () => {
  try {
    const DB_URL = process.env.DB_URL;
    if (!DB_URL) throw new Error('DB_URL is not defined in .env');

    await mongoose.connect(DB_URL);
    console.log('Database connected for seeding.');

    // Clear existing
    await ParkingLocation.deleteMany({});
    await ParkingZone.deleteMany({});
    await User.deleteMany({});

    // Create Staff User
    await User.create({
      phoneNumber: 'STAFF123',
      role: 'gate_staff',
      licensePlates: []
    });

    // Create Location 1 (Grand Indonesia - approximate)
    const loc1 = await ParkingLocation.create({
      name: 'Grand Indonesia Mall',
      address: 'Jl. M.H. Thamrin No.1, Jakarta',
      description: 'Pusat perbelanjaan premium di Jakarta Pusat.',
      location: { type: 'Point', coordinates: [106.820625, -6.195000] }
    });

    await ParkingZone.insertMany([
      { locationId: loc1._id, name: 'Basement 1', total_capacity: 50, price_per_hour: 5000 },
      { locationId: loc1._id, name: 'Basement 2', total_capacity: 50, price_per_hour: 5000, active_occupants: 48, active_reservations: 2 }, // FULL
      { locationId: loc1._id, name: 'VIP Ground', total_capacity: 10, price_per_hour: 15000, active_occupants: 5 }
    ]);

    // Create Location 2 (Plaza Senayan)
    const loc2 = await ParkingLocation.create({
      name: 'Plaza Senayan',
      address: 'Jl. Asia Afrika No.8, Jakarta',
      description: 'Pusat perbelanjaan eksklusif.',
      location: { type: 'Point', coordinates: [106.799757, -6.225571] }
    });

    await ParkingZone.insertMany([
      { locationId: loc2._id, name: 'Area Terbuka (Timur)', total_capacity: 100, price_per_hour: 4000 },
      { locationId: loc2._id, name: 'Gedung Parkir Lt 1', total_capacity: 30, price_per_hour: 4000 }
    ]);


    // Create Location 3 (Plaza Senayan)
    const loc3 = await ParkingLocation.create({
      name: 'Mall Panakukkan',
      address: 'Jl. Boulevard No.3, Masale, Kec. Panakkukang, Kota Makassar, Sulawesi Selatan',
      description: 'Pusat perbelanjaan eksklusif.',
      location: { type: 'Point', coordinates: [-5.1357589, 4037958] }
    });

    await ParkingZone.insertMany([
      { locationId: loc3._id, name: 'Area Terbuka (Timur)', total_capacity: 100, price_per_hour: 5000 },
      { locationId: loc3._id, name: 'Gedung Parkir Lt 1', total_capacity: 30, price_per_hour: 4000 }
    ]);

    console.log('Seed success.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
};

seedDB();
