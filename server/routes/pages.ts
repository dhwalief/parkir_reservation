import express from 'express';
import ParkingLocation from '../models/ParkingLocation';
import Reservation from '../models/Reservation';

const router = express.Router();

// Frontend EJS Routes
router.get('/', (req, res) => res.render('pages/home'));

router.get('/building/:id', async (req, res) => {
    try {
        const location = await ParkingLocation.findById(req.params.id);
        if (!location) return res.status(404).send('Not Found');
        res.render('pages/zones', { location });
    } catch (e) { res.status(500).send('Error'); }
});

router.get('/ticket/:id', async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id).populate('locationId').populate('zoneId');
        if (!reservation) return res.status(404).send('Not Found');
        res.render('pages/ticket', { reservation });
    } catch (e) { res.status(500).send('Error'); }
});

router.get('/history', (req, res) => res.render('pages/history'));
router.get('/gate', (req, res) => res.render('pages/gate-scanner'));
router.get('/admin/login', (req, res) => res.render('pages/admin-login'));
router.get('/admin/dashboard', (req, res) => res.render('pages/admin-dashboard'));

export default router;
