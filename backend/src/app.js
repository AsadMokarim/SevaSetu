const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Import Routes
const authRoutes = require('./routes/authRoutes');
const surveyRoutes = require('./routes/surveyRoutes');
const taskRoutes = require('./routes/taskRoutes');
const volunteerRoutes = require('./routes/volunteerRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fcmRoutes = require('./routes/fcmRoutes');



dotenv.config();


const app = express();

// Middleware
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  // In production, you would add your actual domain here, or inject via ENV
  process.env.FRONTEND_URL 
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    console.log("[CORS] Request origin:", origin); // Bonus: Debugging log
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.startsWith('http://192.168.') || // ✅ allow mobile on same WiFi
      origin.startsWith('http://10.')         // ✅ support other private networks
    ) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger
app.use((req, res, next) => {
    // Normalize URL: remove trailing slash if it exists (except for the root /)
    if (req.url.length > 1 && req.url.endsWith('/')) {
        req.url = req.url.slice(0, -1);
    }
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get('/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'SevaSetu Backend is running',
        data: {
            timestamp: new Date().toISOString(),
            env: process.env.NODE_ENV || 'development'
        }
    });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/surveys', surveyRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/volunteers', volunteerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/fcm', fcmRoutes);



// Error Handling Middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        data: null
    });
});

module.exports = app;
