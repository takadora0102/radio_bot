// lib/config.js
module.exports = {
  QUEUE_MAX:             Number(process.env.QUEUE_MAX || 5),
  NEWSAPI_KEY:           process.env.NEWSAPI_KEY,
  GNEWS_KEY:             process.env.GNEWS_KEY,
  NEWSAPI_DAILY_LIMIT:   Number(process.env.NEWSAPI_DAILY_LIMIT || 100),
  GNEWS_DAILY_LIMIT:     Number(process.env.GNEWS_DAILY_LIMIT || 100),
  NEWSAPI_THRESHOLD:     Number(process.env.NEWSAPI_THRESHOLD || 10),
  OWNER_ID:              process.env.OWNER_ID,
  VOICE_SPEED:           Number(process.env.VOICE_SPEED || 1.0),
  VOICE_VOLUME:          Number(process.env.VOICE_VOLUME || 100),
  
  // Open JTalk のパスを追加
  OJ_DIC_PATH:           process.env.OJ_DIC_PATH || '/var/lib/mecab/dic/open-jtalk/naist-jdic',
  OJ_HTS_VOICE_PATH:     process.env.OJ_HTS_VOICE_PATH || '/usr/share/hts-voice/mei/mei_normal.htsvoice'
};