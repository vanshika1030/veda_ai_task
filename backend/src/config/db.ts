import mongoose from 'mongoose';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

let redisClient: Redis | null = null;
let redisAvailable = false;

// MongoDB Connection
export const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/vedaai';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    console.log('Server will continue without MongoDB — using in-memory fallback');
  }
};

// Redis Connection
export const connectRedis = async (): Promise<void> => {
  try {
    const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
    redisClient = new Redis(redisURL, {
      maxRetriesPerRequest: null,
      retryStrategy: (times: number) => {
        if (times > 3) {
          console.log('Redis connection failed after 3 retries — continuing without Redis');
          return null;
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
      tls: redisURL.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined
    });

    redisClient.on('error', (err) => {
      console.warn('Redis connection error (handled):', err.message);
    });

    await redisClient.connect();
    redisAvailable = true;
    console.log('Redis connected successfully');
  } catch (error) {
    console.warn('Redis not available — continuing without caching/queue');
    redisAvailable = false;
    redisClient = null;
  }
};

export const getRedisClient = (): Redis | null => redisClient;
export const isRedisAvailable = (): boolean => redisAvailable;

// Graceful shutdown
export const closeConnections = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    if (redisClient) {
      await redisClient.quit();
    }
    console.log('All connections closed');
  } catch (error) {
    console.error('Error closing connections:', error);
  }
};
