import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),

  // Database
  databaseUrl: process.env.DATABASE_URL,

  // Redis
  redisUrl: process.env.REDIS_URL,

  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',

  // CTFd
  ctfdApiUrl: process.env.CTFD_API_URL,
  ctfdApiToken: process.env.CTFD_API_TOKEN,
  ctfdUrl: process.env.CTFD_URL,

  // Email
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
  smtpFrom: process.env.SMTP_FROM,

  // Frontend
  frontendUrl: process.env.FRONTEND_URL,

  // Admin
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
};

// Validate required environment variables
export const validateEnv = (): void => {
  const requiredVars = [
    'DATABASE_URL',
    'REDIS_URL',
    'JWT_SECRET',
    'FRONTEND_URL',
    'ADMIN_EMAIL',
    'ADMIN_PASSWORD'
  ];

  const missingVars = requiredVars.filter(key => !process.env[key]);

  if (missingVars.length > 0) {
    throw new Error(`❌ FATAL: Missing required environment variables: ${missingVars.join(', ')}`);
  }

  if (config.nodeEnv === 'production' && config.jwtSecret === 'change-me') {
    throw new Error('❌ FATAL: You must change JWT_SECRET in production!');
  }
};

