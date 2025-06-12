// commands/leave.js
const { SlashCommandBuilder } = require('@discordjs/builders');
// この行を削除 RRR
// const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('ステージチャンネルから切断し、読み上げを停止します。'),

  async execute(interaction) {
    // ↓↓↓ この行を関数の内部に追加
    const { getVoiceConnection } = require('@discordjs/voice');

    if (!interaction.guild) {
      return interaction.reply({ content: 'サーバー内で実行してください。', ephemeral: true });
    }

    const connection = getVoiceConnection(interaction.guild.id);
    if (!connection) {
      return interaction.reply({ content: '現在接続中のステージチャンネルがありません。', ephemeral: true });
    }

    // 再生停止 & 切断
    connection.destroy();

    // Consumer 停止
    const { stopConsumer } = require('../lib/queueManager');
    stopConsumer();

    await interaction.reply({ content: 'ステージチャンネルから切断し、読み上げを停止しました。', ephemeral: true });
  },
};