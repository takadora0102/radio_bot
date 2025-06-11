// lib/storage.js
const Redis = require('ioredis');
// Use a sensible default if REDIS_URL is not provided. When the
// environment variable is empty ioredis attempts to connect to `/`,
// which results in an EACCES error.
const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
const redis = new Redis(redisUrl);

async function get(key, fallback) {
  const v = await redis.get(key);
  return v !== null ? JSON.parse(v) : fallback;
}

async function set(key, value) {
  await redis.set(key, JSON.stringify(value));
}

module.exports = { get, set };
