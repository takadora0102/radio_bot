// commands/speed.js
const { SlashCommandBuilder } = require('@discordjs/builders');
const config = require('../lib/config');
const { set } = require('../lib/storage');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('speed')
    .setDescription('読み上げ速度を設定します（0.5～2.0）')
    .addNumberOption(opt =>
      opt.setName('value')
         .setDescription('読み上げ速度の倍率')
         .setRequired(true)
    ),
  async execute(interaction) {
    const val = interaction.options.getNumber('value');
    if (val < 0.5 || val > 2.0) {
      return interaction.reply({ content: '0.5～2.0 の範囲で指定してください。', ephemeral: true });
    }
    config.VOICE_SPEED = val;
    // 永続化
    await set('voice_speed', val);
    await interaction.reply({ content: `読み上げ速度を ${val} 倍に設定しました。`, ephemeral: true });
  }
};
