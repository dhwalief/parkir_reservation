import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db';
import mongoose from 'mongoose';
import { startCleanupJob } from './config/cleanup';
import ParkingLocation from './models/ParkingLocation';
import Reservation from './models/Reservation';

// Routes
import locationRoutes from './routes/location';
import zoneRoutes from './routes/zone';
import reservationRoutes from './routes/reservation';
import gateRoutes from './routes/gate';
import authRoutes from './routes/auth';
import adminRoutes from './routes/admin';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Configure EJS
app.set('view engine', 'ejs');
app.set('views', path.resolve('views'));

// Serve static frontend files
app.use(express.static(path.resolve('public')));

app.use('/api/locations', locationRoutes);
app.use('/api/locations', zoneRoutes); // mounted to support /:locationId/zones
app.use('/api/reservations', reservationRoutes);
app.use('/api/gate', gateRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Frontend EJS Routes
app.get('/', (req, res) => res.render('pages/home'));
app.get('/building/:id', async (req, res) => {
    try {
        const location = await ParkingLocation.findById(req.params.id);
        if (!location) return res.status(404).send('Not Found');
        res.render('pages/zones', { location });
    } catch (e) { res.status(500).send('Error'); }
});
app.get('/ticket/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('locationId').populate('zoneId');
        if (!reservation) return res.status(404).send('Not Found');
        res.render('pages/ticket', { reservation });
    } catch (e) { res.status(500).send('Error'); }
});
app.get('/history', (req, res) => res.render('pages/history'));
app.get('/gate', (req, res) => res.render('pages/gate-scanner'));
app.get('/admin/login', (req, res) => res.render('pages/admin-login'));
app.get('/admin/dashboard', (req, res) => res.render('pages/admin-dashboard'));

const DB_URL = process.env.DB_URL;
const DB_PORT = process.env.DB_PORT || 3000;

if (!DB_URL) {
  throw new Error('DB_URL is not defined in .env file');
}

let server: any;

connectDB(DB_URL).then(() => {
    startCleanupJob();
    server = app.listen(DB_PORT, () => {
        console.log("Server is running on port", DB_PORT);
    });
});

// Graceful Shutdown & Exit Handling
const gracefulShutdown = async (signal: string) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    if (server) {
        server.close(async () => {
            console.log('HTTP server closed.');
            try {
                await mongoose.connection.close();
                console.log('Mongoose database connection closed.');
                process.exit(0);
            } catch (err) {
                console.error('Error closing Mongoose connection:', err);
                process.exit(1);
            }
        });
    } else {
        process.exit(0);
    }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
