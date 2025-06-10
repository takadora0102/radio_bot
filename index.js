// index.js
require('dotenv').config();
const path = require('path');
const fs = require('fs');
const { Client, IntentsBitField, Collection } = require('discord.js');
const logger = require('./lib/logger');

const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildVoiceStates
  ]
});

// ロガーに Client を登録
logger.init(client);

// コマンド読み込み
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath)
  .filter(file => file.endsWith('.js'))
  .forEach(file => {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.data.name, cmd);
  });

// スラッシュコマンド実行時の処理
client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;
  const command = client.commands.get(interaction.commandName);
  if (!command) return;

  try {
    await command.execute(interaction, client);
  } catch (err) {
    console.error(err);
    logger.notifyOwner(`Command ${interaction.commandName} error: ${err.message}`);
    await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
  }
});

// BOT起動完了時
client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login(process.env.BOT_TOKEN);
