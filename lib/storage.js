// lib/storage.js
const Redis = require('ioredis');
const envUrl = process.env.REDIS_URL;
const redisUrl = envUrl && envUrl.trim() !== ''
  ? envUrl
  : 'redis://localhost:6379';
const redis = new Redis(redisUrl);

const PROCESSED_URL_KEY_PREFIX = 'radiobot:processed_urls:';
const URL_EXPIRATION_SECONDS = 60 * 60 * 24; // 24時間

/**
 * 汎用的なキーと値のペアを取得します。
 * @param {string} key
 * @param {any} fallback
 * @returns {Promise<any>}
 */
async function get(key, fallback) {
  const v = await redis.get(key);
  return v !== null ? JSON.parse(v) : fallback;
}

/**
 * 汎用的なキーと値のペアを設定します。
 * @param {string} key
 * @param {any} value
 */
async function set(key, value) {
  await redis.set(key, JSON.stringify(value));
}

/**
 * 指定されたソースでURLが処理済みかどうかを確認します。
 * @param {string} source - ソース識別子 (例: RSSフィードのURL)
 * @param {string} url - 確認する記事のURL
 * @returns {Promise<boolean>}
 */
async function isUrlProcessed(source, url) {
  const key = `${PROCESSED_URL_KEY_PREFIX}${source}`;
  const result = await redis.sismember(key, url);
  return result === 1;
}

/**
 * 処理済みのURLをソースごとのセットに追加します。
 * @param {string} source - ソース識別子
 * @param {string} url - 追加する記事のURL
 */
async function addProcessedUrl(source, url) {
  const key = `${PROCESSED_URL_KEY_PREFIX}${source}`;
  await redis.sadd(key, url);
  // キーに有効期限を設定し、データが無限に増えるのを防ぐ
  await redis.expire(key, URL_EXPIRATION_SECONDS);
}


module.exports = { get, set, isUrlProcessed, addProcessedUrl };