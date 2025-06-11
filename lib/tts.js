// lib/tts.js
const { spawn } = require('child_process');
const {
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus
} = require('@discordjs/voice');
const config = require('./config'); // configを読み込む

async function playText(connection, text, speed = 1.0, volume = 100) {
  // Open JTalk のパラメータ（環境変数から読み込み）
  const voiceDict = config.OJ_DIC_PATH;
  const htsVoice  = config.OJ_HTS_VOICE_PATH;

  // パスが設定されていない場合はエラーを投げる
  if (!voiceDict || !htsVoice) {
    throw new Error('Open JTalkの辞書または音声ファイルのパスが設定されていません。');
  }
  
  // 一時 WAV ファイルのパス
  const tmpWav = '/tmp/voice.wav';

  // 1) Open JTalk でテキスト→WAV
  await new Promise((resolve, reject) => {
    const args = [
      '-x', voiceDict,
      '-m', htsVoice,
      '-r', String(speed),   // 話速（1.0 が標準）
      '-ow', tmpWav
    ];
    const proc = spawn('open_jtalk', args);
    proc.stdin.write(text);
    proc.stdin.end();
    proc.once('exit', code => code === 0 ? resolve() : reject(new Error('open_jtalk failed')));
  });

  // 2) Discord に再生
  const resource = createAudioResource(tmpWav, {
    inputType: StreamType.Arbitrary,
    inlineVolume: true
  });
  resource.volume.setVolume(volume / 100);

  const player = createAudioPlayer();
  connection.subscribe(player);
  player.play(resource);

  return new Promise((resolve, reject) => {
    player.on(AudioPlayerStatus.Idle, () => {
      player.stop();
      resolve();
    });
    player.on('error', err => {
      player.stop();
      reject(err);
    });
  });
}

module.exports = { playText };
