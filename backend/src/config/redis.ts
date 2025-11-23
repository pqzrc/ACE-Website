import { createClient } from 'redis';

import { config } from './env';

const redisUrl = config.redisUrl!;

export const redisClient = createClient({
  url: redisUrl,
});

redisClient.on('error', (err) => {
  console.error('❌ Redis Client Error:', err);
});

redisClient.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('❌ Unable to connect to Redis:', error);
    throw error;
  }
};

// Helper functions for common operations
export const setWithExpiry = async (key: string, value: string, expiryInSeconds: number): Promise<void> => {
  await redisClient.setEx(key, expiryInSeconds, value);
};

export const get = async (key: string): Promise<string | null> => {
  return await redisClient.get(key);
};

export const del = async (key: string): Promise<void> => {
  await redisClient.del(key);
};

