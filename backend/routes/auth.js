const express = require('express');

// Import controllers
const { register, login, getMe, forgotPassword } = require('../controllers/authController');

// Import middleware
const { protect } = require('../middleware/auth');

// Initialize router
const router = express.Router();

// Public routes
router.post('/register', register); // User registration
router.post('/login', login); // User login
router.post('/forgot-password', forgotPassword);

// Private routes
router.get('/me', protect, getMe); // Get current logged in user

// Export the router
module.exports = router; 