import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.error('❌ Redis Client Error', err));

const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    console.log('✅ Redis Connected');
  } catch (error) {
    console.error('❌ Redis Connection Failed:', error);
    process.exit(1);
  }
};

export { redisClient, connectRedis };