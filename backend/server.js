const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const rateLimit = require('express-rate-limit');
const winston = require('winston');
require('dotenv').config();

const legalRoutes = require('./routes/legal');

const app = express();
// Configure trust proxy from environment to match your hosting provider.
// Avoid setting the Express 'trust proxy' value to boolean `true` because
// express-rate-limit treats that as permissive and will throw a validation error.
// Recommended values:
// - a number: '1' (one proxy), '2' (two proxies)
// - specific addresses: 'loopback, 127.0.0.1'
// - 'false' to disable
const trustProxyEnv = process.env.TRUST_PROXY;
let trustProxyValue = false;
if (typeof trustProxyEnv !== 'undefined' && trustProxyEnv !== null && trustProxyEnv !== '') {
  if (trustProxyEnv === 'true') {
    // Interpret literal 'true' as a single trusted proxy (1) to avoid permissive boolean
    // This mirrors common hosting setups (one proxy/load balancer).
    trustProxyValue = 1;
    console.warn('TRUST_PROXY="true" detected — interpreting as 1 (one proxy). For stricter control set TRUST_PROXY to a number or specific addresses.');
  } else if (trustProxyEnv === 'false') {
    trustProxyValue = false;
  } else if (!Number.isNaN(Number(trustProxyEnv))) {
    trustProxyValue = Number(trustProxyEnv);
  } else {
    // Allow strings such as 'loopback' or comma-separated addresses
    trustProxyValue = trustProxyEnv;
  }
} else {
  trustProxyValue = false;
}

app.set('trust proxy', trustProxyValue);
const PORT = process.env.PORT || 5000;

// Logger setup
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.'
});
app.use(limiter);

// CORS configuration
if (process.env.NODE_ENV === 'production') {
  // Allow configuring allowed origins via ALLOWED_ORIGINS env (comma-separated).
  // Example: ALLOWED_ORIGINS=https://your-frontend.vercel.app,https://admin.example.com
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(',').map((s) => s.trim()).filter(Boolean)
    : ['https://law-guidance-app-frontend.vercel.app']; // default production origin

  app.use(
    cors({
      origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) return callback(null, true);
        callback(new Error('Not allowed by CORS'));
      },
      methods: ['GET', 'POST', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    })
  );
} else {
  // In development allow requests from any origin to simplify local testing (including LAN IPs)
  app.use(cors({ origin: true, methods: ['GET', 'POST', 'OPTIONS'], allowedHeaders: ['Content-Type', 'Authorization'] }));
}

// Middleware
app.use(helmet());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api', legalRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Law Guidance API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  app.close(() => {
    logger.info('HTTP server closed');
  });
});

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});

module.exports = app;