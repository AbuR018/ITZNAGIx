import {
    ActionRowBuilder,
    StringSelectMenuBuilder,
    StringSelectMenuOptionBuilder,
    ChannelType,
    PermissionFlagsBits,
    EmbedBuilder,
    ButtonBuilder,
    ButtonStyle
} from 'discord.js';

import { getColor } from '../../../config/bot.js';
import { getGuildConfig } from '../../../services/config/guildConfig.js';

const TICKET_TYPES = {
    prize: 'Claim Prize',
    buy_sell: 'Buy / Sell',
    payment: 'Payment Issue',
    account: 'Account Support',
    general: 'General Support',
    other: 'Other'
};

export async function handleCreateTicket(interaction, client) {
    const menu = new StringSelectMenuBuilder()
        .setCustomId('ticket_reason')
        .setPlaceholder('Select your ticket reason')
        .addOptions(
            Object.entries(TICKET_TYPES).map(([value, label]) =>
                new StringSelectMenuOptionBuilder()
                    .setLabel(label)
                    .setValue(value)
            )
        );

    await interaction.reply({
        content: '🎫 **What do you need help with?**',
        components: [
            new ActionRowBuilder().addComponents(menu)
        ],
        ephemeral: true
    });
}

export async function handleTicketReason(interaction, client) {
    const guild = interaction.guild;
    const guildId = guild.id;
    const user = interaction.user;
    const reason = interaction.values[0];

    if (!TICKET_TYPES[reason]) {
        return interaction.reply({
            content: 'Invalid ticket reason.',
            ephemeral: true
        });
    }

    await interaction.deferReply({ ephemeral: true });

    const config = await getGuildConfig(client, guildId);

    const existing = guild.channels.cache.find(channel =>
        channel.type === ChannelType.GuildText &&
        channel.topic?.includes(`ticket-owner:${user.id}`)
    );

    if (existing) {
        return interaction.editReply({
            content: `You already have an open ticket: ${existing}`
        });
    }

    let category = config.ticketCategoryId
        ? guild.channels.cache.get(config.ticketCategoryId)
        : null;

    if (!category) {
        category = guild.channels.cache.find(channel =>
            channel.type === ChannelType.GuildCategory &&
            channel.name === 'Tickets'
        );

        if (!category) {
            category = await guild.channels.create({
                name: 'Tickets',
                type: ChannelType.GuildCategory
            });
        }
    }

    const staffRole = config.ticketStaffRoleId;

    const permissionOverwrites = [
        {
            id: guild.roles.everyone.id,
            deny: [PermissionFlagsBits.ViewChannel]
        },
        {
            id: user.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AttachFiles
            ]
        },
        {
            id: client.user.id,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.ManageChannels
            ]
        }
    ];

    if (staffRole) {
        permissionOverwrites.push({
            id: staffRole,
            allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory
            ]
        });
    }

    const channel = await guild.channels.create({
        name: `${reason}-${user.username}`
            .toLowerCase()
            .replace(/[^a-z0-9-]/g, '-')
            .slice(0, 90),
        type: ChannelType.GuildText,
        parent: category.id,
        topic: `ticket-owner:${user.id} | reason:${reason}`,
        permissionOverwrites
    });

    const embed = new EmbedBuilder()
        .setColor(getColor('info'))
        .setTitle('🎫 Support Ticket')
        .setDescription(
            `Welcome ${user}!\n\n` +
            `Your ticket has been created successfully.\n\n` +
            `**Ticket Reason:** ${TICKET_TYPES[reason]}\n` +
            `**Ticket Owner:** ${user}\n` +
            `**Status:** Open\n\n` +
            'Please explain your issue and provide any necessary screenshots.'
        )
        .setTimestamp()
        .setFooter({ text: 'Titan Bot Support' });

    const buttons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('ticket_claim')
            .setLabel('Claim')
            .setEmoji('🙋')
            .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
            .setCustomId('ticket_close')
            .setLabel('Close')
            .setEmoji('🔒')
            .setStyle(ButtonStyle.Danger)
    );

    await channel.send({
        content: staffRole ? `<@&${staffRole}> ${user}` : `${user}`,
        embeds: [embed],
        components: [buttons],
        allowedMentions: {
            users: [user.id],
            roles: staffRole ? [staffRole] : []
        }
    });

    await interaction.editReply({
        content: `✅ Your **${TICKET_TYPES[reason]}** ticket has been created: ${channel}`
    });
}
