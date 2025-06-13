// commands/voice.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../lib/config');
const { set } = require('../lib/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('voice')
    .setDescription('読み上げの声質（高さ、品質）を設定します。')
    .addNumberOption(opt =>
      opt.setName('tone')
         .setDescription('声の高さ（-10.0 ~ 10.0）。プラスで高く、マイナスで低くなります。')
         .setRequired(false)
    )
    .addNumberOption(opt =>
      opt.setName('quality')
         .setDescription('声の品質（0.0 ~ 1.0）。0.55前後がゆっくりボイス風です。')
         .setRequired(false)
    ),
  async execute(interaction) {
    const tone = interaction.options.getNumber('tone');
    const quality = interaction.options.getNumber('quality');

    let replyMessage = '設定を変更しました。\n';

    if (tone !== null) {
      if (tone < -10.0 || tone > 10.0) {
        return interaction.reply({ content: '声の高さ（tone）は -10.0 ～ 10.0 の範囲で指定してください。', ephemeral: true });
      }
      config.VOICE_TONE = tone;
      await set('voice_tone', tone);
      replyMessage += `> 声の高さ: \`${tone}\`\n`;
    }

    if (quality !== null) {
      if (quality < 0.0 || quality > 1.0) {
        return interaction.reply({ content: '声の品質（quality）は 0.0 ～ 1.0 の範囲で指定してください。', ephemeral: true });
      }
      config.VOICE_QUALITY = quality;
      await set('voice_quality', quality);
      replyMessage += `> 声の品質: \`${quality}\`\n`;
    }

    await interaction.reply({ content: replyMessage, ephemeral: true });
  }
};