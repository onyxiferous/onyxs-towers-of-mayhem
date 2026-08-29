import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction } from 'discord.js';
import { embedServerStatus } from '@templates/embeds.js';
import { generateRundown } from '@modules/server-usage.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-status')
        .setDescription('check up on the bot\'s server status.'),

    async execute(interaction: ChatInputCommandInteraction) {
        const embed = EmbedBuilder.from(embedServerStatus);
        const description = await generateRundown();
        embed.setDescription(description || 'something went wrong!');

        await interaction.reply({ embeds: [embed] });
    },
};