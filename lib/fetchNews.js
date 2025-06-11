// lib/fetchNews.js
const RSSParser = require('rss-parser');
const fetch = require('node-fetch');
const cron = require('node-cron');
const config = require('./config');

let newsApiRemaining = config.NEWSAPI_DAILY_LIMIT;
let gnewsRemaining   = config.GNEWS_DAILY_LIMIT;
const rssParser = new RSSParser();

const RSS_FEEDS = [
  'https://b.hatena.ne.jp/hotentry/it.rss',
  'https://jp.techcrunch.com/feed/',
  'http://feeds.bbci.co.uk/japanese/rss.xml',
  'https://wired.jp/feed/'
];

async function fetchFromRSS() {
  let items = [];
  for (const url of RSS_FEEDS) {
    try {
      const feed = await rssParser.parseURL(url);
      items.push(...feed.items.map(i => ({
        title: i.title,
        text: i.contentSnippet || i.content || ''
      })));
    } catch (err) {
      // 個別フィードのエラーをコンソールに出力
      console.error(`[fetchNews] Failed to fetch RSS feed from ${url}:`, err);
    }
  }
  return items;
}

async function fetchFromNewsAPI(category) {
  if (newsApiRemaining <= 0) return [];
  try {
    const res = await fetch(
      `https://newsapi.org/v2/top-headlines?language=ja&category=${category}&pageSize=5&apiKey=${config.NEWSAPI_KEY}`
    );
    const json = await res.json();
    newsApiRemaining--;
    return (json.articles || []).map(a => ({
      title: a.title,
      text: a.description || a.content || ''
    }));
  } catch (err) {
    return [];
  }
}

async function fetchFromGNews() {
  if (gnewsRemaining <= 0) return [];
  try {
    const res = await fetch(
      `https://gnews.io/api/v4/top-headlines?lang=ja&max=5&exclude=sports&token=${config.GNEWS_KEY}`
    );
    const json = await res.json();
    gnewsRemaining--;
    return (json.articles || []).map(a => ({
      title: a.title,
      text: a.description || a.content || ''
    }));
  } catch (err) {
    return [];
  }
}

// 日次リセット（Asia/Tokyo の 0:00 にリセット）
cron.schedule('0 0 * * *', () => {
  newsApiRemaining = config.NEWSAPI_DAILY_LIMIT;
  gnewsRemaining   = config.GNEWS_DAILY_LIMIT;
}, { timezone: 'Asia/Tokyo' });

// メインフェッチ関数
module.exports = async function fetchNews() {
  let items = await fetchFromRSS();
  if (items.length >= config.QUEUE_MAX) {
    return items.slice(0, config.QUEUE_MAX);
  }

  const categories = ['business','technology','politics','science','health','entertainment'];
  for (const c of categories) {
    const more = await fetchFromNewsAPI(c);
    items.push(...more);
    if (items.length >= config.QUEUE_MAX) break;
  }
  if (items.length >= config.QUEUE_MAX) {
    return items.slice(0, config.QUEUE_MAX);
  }

  const gitems = await fetchFromGNews();
  items.push(...gitems);
  return items.slice(0, config.QUEUE_MAX);
};