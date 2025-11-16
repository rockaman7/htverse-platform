const express = require('express');
const {
    getHackathons,
    getHackathon,
    createHackathon,
    updateHackathon,
    deleteHackathon,
    registerForHackathon,
    unregisterFromHackathon
} = require('../controllers/hackathonController');

const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', getHackathons); // Get all hackathons
router.get('/:id', getHackathon); // Get single hackathon by ID

// Private routes - require authentication
router.post('/', protect, authorize('admin'), createHackathon);
router.put('/:id', protect, authorize('admin', 'judge'), updateHackathon);
router.delete('/:id', protect, authorize('admin'), deleteHackathon);

// Registration routes
router.post('/:id/register', protect, registerForHackathon); 
router.delete('/:id/register', protect, unregisterFromHackathon);

module.exports = router;
