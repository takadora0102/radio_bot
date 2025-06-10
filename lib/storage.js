// lib/storage.js
const Redis = require('ioredis');
const redis = new Redis(process.env.REDIS_URL);

async function get(key, fallback) {
  const v = await redis.get(key);
  return v !== null ? JSON.parse(v) : fallback;
}

async function set(key, value) {
  await redis.set(key, JSON.stringify(value));
}

module.exports = { get, set };
