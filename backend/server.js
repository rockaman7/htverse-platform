const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
const allowedOrigins = [
  'https://htverse-platform.vercel.app', // your frontend URL
  // you can add more allowed origins here
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// also add this if you expect OPTIONS preflight requests
app.options('*', cors());


// Import routes
const authRoutes = require('./routes/auth');
const hackathonRoutes = require('./routes/hackathons');

// Basic route for testing
app.get('/', (req, res) => {
    res.json({
        message: 'Hackathon Platform API is running!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            hackathons: '/api/hackathons'
        }
    });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Server is healthy',
        uptime: process.uptime()
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hackathons', hackathonRoutes);

// MongoDB Connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hackathon-platform');
        console.log('✅ MongoDB connected successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Connect to database
connectDB().then(async () => {
  // Seed demo accounts on startup (only if they don't exist)
  if (process.env.SEED_DEMO_ACCOUNTS !== 'false') {
    const seedDemoAccounts = require('./utils/seedDemoAccounts');
    await seedDemoAccounts();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    res.status(500).json({
        message: 'Something went wrong!',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
    });
});

// Handle 404 routes
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.originalUrl
    });
});

// Start server
const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//     console.log(`🚀 Server running on port ${PORT}`);
//     console.log(`🌍 Access your API at: http://localhost:${PORT}`);
// });
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
