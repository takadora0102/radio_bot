// lib/storage.js
const Redis = require('ioredis');
// Use a sensible default if REDIS_URL is missing or empty. ioredis interprets
// an empty string as the Unix socket path `/`, which causes an EACCES error.
const envUrl = process.env.REDIS_URL;
const redisUrl = envUrl && envUrl.trim() !== ''
  ? envUrl
  : 'redis://localhost:6379';
const redis = new Redis(redisUrl);

async function get(key, fallback) {
  const v = await redis.get(key);
  return v !== null ? JSON.parse(v) : fallback;
}

async function set(key, value) {
  await redis.set(key, JSON.stringify(value));
}

module.exports = { get, set };
