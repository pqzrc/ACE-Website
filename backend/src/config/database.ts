import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { Registration } from '../models/Registration';
import { TimeSlot } from '../models/TimeSlot';

import { config } from './env';

const databaseUrl = config.databaseUrl!;

// Custom logger qui masque les tokens sensibles
const sanitizedLogger = (sql: string) => {
  const sensitiveFields = [
    'verificationToken',
    'resetPasswordToken',
    'password',
  ];

  let sanitized = sql;

  // Masquer les valeurs des tokens dans les logs
  sensitiveFields.forEach(field => {
    // Pattern pour masquer les valeurs après les noms de colonnes sensibles
    const regex = new RegExp(`"${field}"[^,}]+`, 'gi');
    sanitized = sanitized.replace(regex, `"${field}" = '***'`);
  });

  console.log(sanitized);
};

// Déterminer si on doit logger les requêtes SQL
const shouldLogSQL = () => {
  // Si DB_LOGGING est explicitement à 'false', ne pas logger
  if (process.env.DB_LOGGING === 'false') {
    return false;
  }
  // En production, ne jamais logger
  if (process.env.NODE_ENV === 'production') {
    return false;
  }
  // En dev, logger uniquement si DB_LOGGING n'est pas défini ou est à 'true'
  return process.env.DB_LOGGING === 'true' || process.env.DB_LOGGING === undefined;
};

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: shouldLogSQL() ? sanitizedLogger : false,
  models: [User, Team, Registration, TimeSlot],
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const connectDatabase = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully');

    // Sync models (alter mode is safe - it updates schema without data loss)
    // In production, this ensures tables exist and schema is up-to-date
    await sequelize.sync({ alter: true });
    console.log('✅ Database models synchronized');

    // Ensure createdByAdmin column exists and has correct default values
    await sequelize.query(`
      ALTER TABLE teams 
      ADD COLUMN IF NOT EXISTS "createdByAdmin" BOOLEAN DEFAULT false;
      
      UPDATE teams 
      SET "createdByAdmin" = true 
      WHERE "captainId" IS NULL AND "createdByAdmin" = false;
    `);
    console.log('✅ Database schema updates applied');
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

