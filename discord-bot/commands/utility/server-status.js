const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { embedServerStatus } = require('../../formatting/embeds');
const { generateRundown } = require('../../scripts/server-usage');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server-status')
        .setDescription('check up on the bot\'s server status.'),

    async execute(interaction) {
        const embed = EmbedBuilder.from(embedServerStatus);
        const description = await generateRundown();
        embed.setDescription(description || 'something went wrong!');

        await interaction.reply({ embeds: [embed] });
    },
};