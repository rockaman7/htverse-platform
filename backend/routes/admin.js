// In your backend routes/admin.js
const express = require('express');
const router = express.Router();

// Middleware to check admin role
const adminOnly = (req, res, next) => { // Assuming req.user is set by previous auth middleware
    if (req.user && req.user.role === 'admin') { // Check if user is admin
        next(); // Proceed to the next middleware or route handler
    } else { // If not admin, return 403 Forbidden
        res.status(403).json({ message: 'Admin access required' }); 
    }
};

// Admin dashboard stats
router.get('/dashboard', adminOnly, async (req, res) => { // this route is protected and only accessible by admins
    // Return dashboard statistics
    res.json({ 
        success: true,
        data: {
            totalUsers: 0,
            activeHackathons: 0,
            totalSubmissions: 0,
            pendingReviews: 0
        }
    });
});

// Create hackathon
router.post('/hackathons', adminOnly, async (req, res) => {
    // Create hackathon logic
});


// Get all hackathons for admin
router.get('/hackathons', adminOnly, async (req, res) => {
    // Return all hackathons with admin details
});

module.exports = router;
