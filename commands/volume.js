// commands/volume.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../lib/config');
const { set } = require('../lib/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('volume')
    .setDescription('読み上げ音量を設定します（0～100）')
    .addIntegerOption(opt =>
      opt.setName('value')
         .setDescription('音量（％）')
         .setRequired(true)
    ),
  async execute(interaction) {
    const val = interaction.options.getInteger('value');
    if (val < 0 || val > 100) {
      return interaction.reply({ content: '0～100 の範囲で指定してください。', ephemeral: true });
    }
    config.VOICE_VOLUME = val;
    // 永続化
    await set('voice_volume', val);
    await interaction.reply({ content: `読み上げ音量を ${val}% に設定しました。`, ephemeral: true });
  }
};
