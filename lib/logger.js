// lib/logger.js
const { OWNER_ID } = require('./config');
let _client = null;

/**
 * ボット起動後に一度だけ呼んで Discord.js の Client を登録してください。
 * 例: require('./logger').init(client);
 */
function init(client) {
  _client = client;
}

/**
 * オーナーへ DM 送信
 * @param {string} message
 */
async function notifyOwner(message) {
  if (!_client) {
    console.error('[logger] Client not initialized');
    return;
  }
  try {
    const user = await _client.users.fetch(OWNER_ID);
    await user.send(`[RadioBot] ${message}`);
  } catch (err) {
    console.error('[logger] notifyOwner error:', err);
  }
}

module.exports = { init, notifyOwner };
