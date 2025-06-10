// index.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Client, IntentsBitField, Collection } = require('discord.js');

// クライアントの準備（ステージチャンネル接続のため GuildVoiceStates を有効化）
const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates
  ]
});

// コマンド読み込み用コレクション
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(f => f.endsWith('.js'));

for (const file of commandFiles) {
  const cmd = require(path.join(commandsPath, file));
  client.commands.set(cmd.data.name, cmd);
}

// BOT起動時
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

// スラッシュコマンド受信時
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    // 各コマンドの execute 関数を呼び出し
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    // オーナーDM通知ロジックは logger モジュールにまとめてもよいです
    await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
  }
});

// 環境変数から BOT トークンを読み込んでログイン
client.login(process.env.BOT_TOKEN);
