import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config, validateEnv } from './config/env';
import { connectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { logger } from './utils/logger';
import { createAdminUser } from './seeders/admin-seed';
import { Team } from './models/Team';

// Import routes
import authRoutes from './routes/auth.routes';
import teamRoutes from './routes/team.routes';
import adminRoutes from './routes/admin.routes';
import publicRoutes from './routes/public.routes';
import ctfdRoutes from './routes/ctfd.routes';
import timeSlotRoutes from './routes/timeslot.routes';


const app = express();

// Middleware
app.set('trust proxy', 1); // Trust first proxy (Nginx)
app.use(helmet());

// CORS Configuration - Allow frontend and CTFd origins
const allowedOrigins = config.nodeEnv === 'development'
  ? ['http://localhost:3000', 'http://localhost', 'http://127.0.0.1:3000']
  : [
    config.frontendUrl,
    'https://ace.vizyondijital.fr',
    'https://ctfd.vizyondijital.fr',
    'https://api.vizyondijital.fr',
  ].filter((origin): origin is string => Boolean(origin)); // Remove undefined values

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Webhook-Signature'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/ctfd', ctfdRoutes);
app.use('/api/timeslots', timeSlotRoutes);


// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);

  // IMPORTANT: Always send CORS headers, even on errors
  // This prevents "CORS header missing" errors when backend returns 500
  const origin = req.headers.origin;
  if (origin && allowedOrigins.some(allowed => origin.startsWith(allowed))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(config.nodeEnv === 'development' && { stack: err.stack }),
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

// Recalculate team isComplete status (team needs exactly 5 members)
const recalculateTeamStatuses = async () => {
  try {
    const teams = await Team.findAll();
    let updated = 0;

    for (const team of teams) {
      const memberCount = await team.getMemberCount();
      const shouldBeComplete = memberCount === 5;
      
      if (team.isComplete !== shouldBeComplete) {
        await team.update({ isComplete: shouldBeComplete });
        updated++;
      }
    }

    if (updated > 0) {
      logger.info(`✅ Recalculated team statuses: ${updated} teams updated`);
    }
  } catch (error) {
    logger.error('Failed to recalculate team statuses:', error);
  }
};

// Start server
const startServer = async () => {
  try {
    // Validate environment variables
    validateEnv();

    // Connect to database
    await connectDatabase();

    // Connect to Redis
    await connectRedis();

    // Create admin user if not exists
    await createAdminUser();

    // Recalculate team statuses on startup
    await recalculateTeamStatuses();

    // Start listening
    app.listen(config.port, () => {
      logger.info(`🚀 Server is running on port ${config.port}`);
      logger.info(`📝 Environment: ${config.nodeEnv}`);
      logger.info(`🌐 Frontend URL: ${config.frontendUrl}`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  logger.info('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

startServer();

