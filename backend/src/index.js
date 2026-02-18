require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const prisma = require('./utils/prisma');

// Routes
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const serviceRequestRoutes = require('./routes/serviceRequests');
const uploadRoutes = require('./routes/upload');
const technicianRoutes = require('./routes/technicians');
const notificationRoutes = require('./routes/notifications');
const paymentRoutes = require('./routes/payments');
const warrantyRoutes = require('./routes/warranties');
const reviewRoutes = require('./routes/reviews');
const oauthRoutes = require('./routes/oauthRoutes');
const matchRoutes = require('./routes/matchRoutes');
const aiRoutes = require('./routes/ai');
const chatRoutes = require('./routes/chat');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);

    const allowedOrigins = [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://5173-firebase-surisuri-mahasuri-1771240128104.cluster-bqwaigqtxbeautecnatk4o6ynk.cloudworkstations.dev',
      /\.pages\.dev$/, // Allow all Cloudflare Pages domains
      /\.vercel\.app$/, // Allow Vercel domains if needed
    ];

    const isAllowed = allowedOrigins.some(pattern => {
      if (pattern instanceof RegExp) {
        return pattern.test(origin);
      }
      return pattern === origin;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, false);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/oauth', oauthRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/service-requests', serviceRequestRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/technicians', technicianRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/warranties', warrantyRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/chat', chatRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: '홈케어X API Server',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      oauth: '/api/oauth',
      services: '/api/services',
      serviceRequests: '/api/service-requests',
      upload: '/api/upload',
      technicians: '/api/technicians',
      notifications: '/api/notifications',
      payments: '/api/payments',
      warranties: '/api/warranties',
      reviews: '/api/reviews',
      matches: '/api/matches',
      health: '/health',
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔═══════════════════════════════════════╗
║       홈케어X API Server              ║
║                                       ║
║  Server running on port ${PORT}        ║
║  Environment: ${process.env.NODE_ENV || 'development'}          ║
║                                       ║
║  Endpoints:                           ║
║  - http://localhost:${PORT}/          ║
║  - http://localhost:${PORT}/health    ║
║  - http://localhost:${PORT}/api       ║
╚═══════════════════════════════════════╝
  `);
});

module.exports = app;
