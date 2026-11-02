
import {
  SlashCommandBuilder,
  EmbedBuilder,
  PermissionFlagsBits,
} from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deal')
    .setDescription("Post a completed deal for Debt's Shop")

    .addUserOption(option =>
      option.setName('customer')
        .setDescription('The customer')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('product')
        .setDescription('Product sold')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('payment')
        .setDescription('Payment method or amount')
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName('price')
        .setDescription('Deal price')
        .setRequired(true)
    ),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(
      PermissionFlagsBits.ManageMessages
    )) {
      return interaction.reply({
        content: 'You cannot use this command.',
        ephemeral: true,
      });
    }

    const customer = interaction.options.getUser('customer');
    const product = interaction.options.getString('product');
    const payment = interaction.options.getString('payment');
    const price = interaction.options.getString('price');

    const embed = new EmbedBuilder()
      .setColor(0x57F287)
      .setTitle("✅ Debt's Shop | Deal Completed")
      .setThumbnail(customer.displayAvatarURL())
      .addFields(
        { name: 'Customer', value: `${customer}`, inline: false },
        { name: 'Product(s)', value: product.slice(0, 1024), inline: false },
        { name: 'Payment', value: payment.slice(0, 1024), inline: true },
        { name: 'Price', value: price.slice(0, 1024), inline: true },
        { name: 'Completed by', value: `${interaction.user}`, inline: false }
      )
      .setFooter({ text: "DEBT'S SHOP • Trusted & Reliable" })
      .setTimestamp();

    await interaction.reply({
      embeds: [embed],
      allowedMentions: { parse: [] },
    });
  },
};

