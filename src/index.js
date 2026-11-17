const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const authMiddleware = require('./middleware/auth');

// Load environment variables
const env = process.env.NODE_ENV || 'development';
dotenv.config({ path: `.env.${env}` });

// Initialize express app
const app = express();

// Simple in-memory rate limiter (requests per window per IP)
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute per IP

const rateLimiter = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Clean old entries
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const valid = timestamps.filter(t => t > windowStart);
    if (valid.length === 0) {
      rateLimitMap.delete(key);
    } else {
      rateLimitMap.set(key, valid);
    }
  }

  const timestamps = rateLimitMap.get(ip) || [];
  const recent = timestamps.filter(t => t > windowStart);

  if (recent.length >= RATE_LIMIT_MAX_REQUESTS) {
    return res.status(429).json({ error: 'Too many requests, please try again later' });
  }

  recent.push(now);
  rateLimitMap.set(ip, recent);
  next();
};

// Middleware
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
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
