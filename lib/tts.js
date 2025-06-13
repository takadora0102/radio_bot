// lib/tts.js
const { spawn } = require('child_process');
const {
  createAudioPlayer,
  createAudioResource,
  StreamType,
  AudioPlayerStatus
} = require('@discordjs/voice');
const config = require('./config');

async function playText(connection, text, speed = 1.0, volume = 100, tone = 0.0, quality = 0.55) {
  const voiceDict = config.OJ_DIC_PATH;
  const htsVoice  = config.OJ_HTS_VOICE_PATH;

  if (!voiceDict || !htsVoice) {
    throw new Error('Open JTalkの辞書または音声ファイルのパスが設定されていません。');
  }
  
  const tmpWav = '/tmp/voice.wav';

  await new Promise((resolve, reject) => {
    const args = [
      '-x', voiceDict,
      '-m', htsVoice,
      '-r', String(speed),
      '-fm', String(tone),    // 声の高さ（トーン）
      '-a', String(quality), // 声の品質（オールパス値）
      '-ow', tmpWav
    ];
    const proc = spawn('open_jtalk', args);
    proc.stdin.write(text);
    proc.stdin.end();
    proc.once('exit', code => code === 0 ? resolve() : reject(new Error('open_jtalk failed')));
  });

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