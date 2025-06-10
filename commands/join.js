// commands/join.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('ステージチャンネルに接続し、読み上げを開始します。'),

  async execute(interaction) {
    if (!interaction.guild) {
      return interaction.reply({ content: 'サーバー内で実行してください。', ephemeral: true });
    }

    const memberVoice = interaction.member.voice.channel;
    if (!memberVoice || memberVoice.type !== ChannelType.GuildStageVoice) {
      return interaction.reply({
        content: 'ステージチャンネルに参加した状態で実行してください。',
        ephemeral: true
      });
    }

    // ステージチャンネルへ接続
    const connection = joinVoiceChannel({
      channelId: memberVoice.id,
      guildId: interaction.guild.id,
      adapterCreator: interaction.guild.voiceAdapterCreator,
      selfDeaf: false,
      selfMute: false,
    });

    try {
      // 接続完了待機
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

      // リッスン開始（Consumer）
      const { startConsumer } = require('../lib/queueManager');
      const textChannel = interaction.channel; // 埋め込みを送信するテキストチャンネル
      startConsumer(connection, textChannel);

      await interaction.reply({ content: 'ステージチャンネルに接続し、読み上げを開始しました。', ephemeral: true });
    } catch (error) {
      connection.destroy();
      console.error(error);
      await interaction.reply({ content: 'ステージチャンネルへの接続に失敗しました。', ephemeral: true });

      // オーナーへのDM通知
      const { notifyOwner } = require('../lib/logger');
      notifyOwner(`Join コマンドエラー: ${error.message}`);
    }
  },
};
