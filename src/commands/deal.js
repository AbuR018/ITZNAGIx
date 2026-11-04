

import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deal')
    .setDescription("Record a completed deal at Debt's Shop")
    .addUserOption(option =>
      option.setName('customer')
        .setDescription('The customer')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('product')
        .setDescription('Product purchased')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('payment')
        .setDescription('Payment method')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('price')
        .setDescription('Deal price')
        .setRequired(true)),

  async execute(interaction) {
    const customer = interaction.options.getUser('customer');
    const product = interaction.options.getString('product');
    const payment = interaction.options.getString('payment');
    const price = interaction.options.getString('price');

    const receipt = 'RD-' +
      Math.floor(100000 + Math.random() * 900000);

    const embed = new EmbedBuilder()
      .setColor('#36C878')
      .setTitle('🤝 Deal Completed')
      .addFields(
        {
          name: 'Customer',
          value: `${customer}`,
          inline: false
        },
        {
          name: 'Items',
          value: product,
          inline: false
        },
        {
          name: 'Price',
          value: price,
          inline: true
        },
        {
          name: 'Payment',
          value: payment,
          inline: true
        },
        {
          name: 'Completed by',
          value: `${interaction.user}`,
          inline: false
        },
        {
          name: 'Receipt',
          value: receipt,
          inline: false
        }
      )
      .setFooter({
        text: "Debt's Shop • Deal Completed"
      })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed]
    });
  }
};


