// lib/queueManager.js
const fetchNews = require('./fetchNews');
const config = require('./config');
const { notifyOwner } = require('./logger');

let queue = [];
let producing = false;
let consuming = false;

// 記事を取得しキューに補充する Producer
async function producerLoop(interval = 60_000) {
  producing = true;
  while (producing) {
    try {
      if (queue.length < config.QUEUE_MAX) {
        const items = await fetchNews();
        queue.push(...items);
      }
    } catch (err) {
      notifyOwner(`fetchNews error: ${err.message}`);
    }
    await new Promise(r => setTimeout(r, interval));
  }
}

// キューから記事を取り出し読み上げる Consumer
async function consumerLoop(connection, textChannel) {
  consuming = true;
  while (consuming) {
    let article;
    if (queue.length === 0) {
      article = { title: '記事取得中です…', text: '少々お待ちください。' };
    } else {
      article = queue.shift();
    }

    // テキストチャンネルに埋め込みで投稿
    await textChannel.send({ embeds: [{
      title: article.title,
      description: article.text.slice(0, 1000) + '…',
      timestamp: new Date()
    }]});

    // TTS 再生
    try {
      const { playText } = require('./tts');
      await playText(connection, article.text, config.VOICE_SPEED, config.VOICE_VOLUME);
    } catch (err) {
      notifyOwner(`TTS error: ${err.message}`);
    }
  }
}

// Consumer の起動
function startConsumer(connection, textChannel) {
  if (!producing) producerLoop();
  consumerLoop(connection, textChannel);
}

// Consumer の停止
function stopConsumer() {
  producing = false;
  consuming = false;
}

module.exports = { startConsumer, stopConsumer };
