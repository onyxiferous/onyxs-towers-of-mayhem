const { SlashCommandBuilder } = require('discord.js');

async function getWebsiteData() {
    try {
        // Fetch the static json file hosted on GitHub Pages / custom domain
        const response = await fetch('onyxs-towers.space/api/data.json', {
            headers: { 'Cache-Control': 'no-cache' } // Prevents receiving stale cached data
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data; 
    } catch (error) {
        logFailure('Failed to fetch website static data:', error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('webbersite')
        .setDescription('check the webbersite.'),

    async execute(interaction) {
        await interaction.reply({ content: `https://onyxs-towers.space ${getWebsiteData().test}` });
    },
};