const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('webbersite')
        .setDescription('check the webbersite.'),

    async execute(interaction) {
        await interaction.reply({ content: 'https://onyxs-towers.space' });
    },
};