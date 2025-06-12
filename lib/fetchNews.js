// lib/fetchNews.js
const RSSParser = require('rss-parser');
const Mercury = require('mercury-parser');
const { isUrlProcessed, addProcessedUrl } = require('./storage');
const config = require('./config');

const rssParser = new RSSParser();

// テクノロジー系と主要な一般ニュースをバランス良く配合
const RSS_FEEDS = [
  // 一般
  'https://www.nhk.or.jp/rss/news/cat0.xml',      // NHK ニュース速報
  'https://www.asahi.com/rss/asahi/newsheadlines.rdf', // 朝日新聞 主要ニュース
  'https://www.yomiuri.co.jp/rss/main/',          // 読売新聞 主要ニュース
  'https://mainichi.jp/rss/etc/mainichi-flash.rss',  // 毎日新聞 ニュース速報
  
  // テクノロジー
  'https://b.hatena.ne.jp/hotentry/it.rss',      // はてなブックマーク IT
  'https://jp.techcrunch.com/feed/',              // TechCrunch Japan
  'http://feeds.bbci.co.uk/japanese/rss.xml',     // BBC News Japan
  'https://wired.jp/feed/'                        // WIRED.jp
];

/**
 * 記事のURLから本文を抽出し、重複チェックを行う内部関数
 * @param {{link: string, title: string}} articleStub - URLとタイトルを持つオブジェクト
 * @param {string} sourceIdentifier - ニュースソースを識別するための文字列
 * @returns {Promise<{title: string, text: string}|null>}
 */
async function processAndExtractArticle(articleStub, sourceIdentifier) {
  const url = articleStub.link;

  if (!url) return null;

  try {
    // 1. 重複チェック
    if (await isUrlProcessed(sourceIdentifier, url)) {
      console.log(`[fetchNews] Skipping duplicate: ${url}`);
      return null;
    }

    // 2. 記事本文を抽出
    const parsedArticle = await Mercury.parse(url, { contentType: 'text' });
    
    // 抽出に失敗したか、本文が短すぎる場合はスキップ
    if (!parsedArticle.content || parsedArticle.content.length < 100) {
      console.log(`[fetchNews] Content extraction failed or too short: ${url}`);
      return null;
    }
    
    // 3. 処理済みとして記録
    await addProcessedUrl(sourceIdentifier, url);

    // 整形されたテキストを返す
    // Mercury-parserはHTMLを返すので、簡単なタグ除去を行う
    const textContent = parsedArticle.content.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    
    return {
      title: parsedArticle.title || articleStub.title,
      text: textContent
    };

  } catch (err) {
    console.error(`[fetchNews] Error processing article ${url}:`, err.message);
    return null;
  }
}

// メインのニュース取得関数
module.exports = async function fetchNews() {
  const allProcessedArticles = [];
  
  // RSSフィードから順番に取得を試みる
  for (const feedUrl of RSS_FEEDS) {
    try {
      const feed = await rssParser.parseURL(feedUrl);
      
      for (const item of feed.items) {
        // キューの上限に達したら終了
        if (allProcessedArticles.length >= config.QUEUE_MAX) {
          return allProcessedArticles;
        }

        const processed = await processAndExtractArticle(item, feedUrl);
        if (processed) {
          allProcessedArticles.push(processed);
        }
      }
    } catch (err) {
      console.error(`[fetchNews] Failed to fetch RSS feed from ${feedUrl}:`, err.message);
    }
  }

  // APIの利用は現在コメントアウト（必要なら復活させる）
  // 理由：無料枠の制限が厳しく、RSS主体の方が安定するため
  /*
    const newsApiItems = await fetchFromNewsAPI('technology');
    // ... newsApiItemsに対しても processAndExtractArticle を適用 ...
  */

  return allProcessedArticles;
};