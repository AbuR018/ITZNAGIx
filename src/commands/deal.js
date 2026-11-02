
import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';

export default {
  data: new SlashCommandBuilder()
    .setName('deal')
    .setDescription("View today's deals at Debt's Shop"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setColor('#336699')
      .setTitle("🛍️ Debt's Shop — Deals")
      .setDescription(
        "Welcome to Debt's Shop!\n\n" +
        "Check out our current deals and offers.\n\n" +
        "💰 **Special deals**\n" +
        "Contact the shop staff for today's offers!"
      )
      .setFooter({ text: "Debt's Shop" })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};

