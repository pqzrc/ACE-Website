import { Sequelize } from 'sequelize-typescript';
import { User } from '../models/User';
import { Team } from '../models/Team';
import { Registration } from '../models/Registration';

import { config } from './env';

const databaseUrl = config.databaseUrl!;

export const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  models: [User, Team, Registration],
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
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    throw error;
  }
};

