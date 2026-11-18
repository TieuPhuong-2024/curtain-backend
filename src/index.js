const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load environment variables before requiring auth middleware
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

const authMiddleware = require('./middleware/auth');

// Initialize express app
const app = express();

// Simple in-memory rate limiter (requests per window per IP)
const RATE_LIMIT_WINDOW_MS = Number(process.env.RATE_LIMIT_WINDOW_MS) || 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 300;

const rateLimitMap = new Map();

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  const timestamps = (rateLimitMap.get(ip) || []).filter((time) => time > windowStart);

  res.setHeader('RateLimit-Limit', RATE_LIMIT_MAX_REQUESTS);
  res.setHeader(
    'RateLimit-Remaining',
    Math.max(RATE_LIMIT_MAX_REQUESTS - timestamps.length - 1, 0)
  );

  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(
      Math.ceil((timestamps[0] + RATE_LIMIT_WINDOW_MS - now) / 1000),
      1
    );
    res.setHeader('RateLimit-Reset', retryAfterSeconds);
    res.setHeader('Retry-After', retryAfterSeconds);
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }

  timestamps.push(now);
  rateLimitMap.set(ip, timestamps);
  next();
};

// Sweep idle IPs so the map does not grow forever
const rateLimitSweep = setInterval(() => {
  const windowStart = Date.now() - RATE_LIMIT_WINDOW_MS;
  for (const [ip, timestamps] of rateLimitMap.entries()) {
    if (!timestamps.some((time) => time > windowStart)) rateLimitMap.delete(ip);
  }
}, RATE_LIMIT_WINDOW_MS);
rateLimitSweep.unref();

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
  exposedHeaders: ['Retry-After', 'RateLimit-Limit', 'RateLimit-Remaining', 'RateLimit-Reset'],
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(rateLimiter);

// Import routes
const curtainRoutes = require('./routes/curtain.routes');
const bannerRoutes = require('./routes/banner.routes');
const categoryRoutes = require('./routes/category.routes');
const uploadRoutes = require('./routes/upload.routes');
const imageRoutes = require('./routes/image.routes');
const fileRoutes = require('./routes/file.routes');
const projectRoutes = require('./routes/project.routes');
const favoriteRoutes = require('./routes/favorite.routes');
const contactRoutes = require('./routes/contact.routes');
const postRoutes = require('./routes/post.routes');
const colorRoutes = require('./routes/color.routes');
const settingRoutes = require('./routes/setting.routes');

// Public read-only routes (no auth required)
app.use('/api/banners', bannerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/colors', colorRoutes);

// Protected routes (auth required for mutating operations)
// Route files handle granular auth per HTTP method internally
app.use('/api/curtains', curtainRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/settings', settingRoutes);

// Basic route
app.get('/', (req, res) => {
  res.send('Welcome to Curtain API');
});

// Connect to MongoDB
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/curtainapp';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
  });
