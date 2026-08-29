import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
// import { logFailure } from '@modules/logger.js';

// async function getWebsiteData() {
//     try {
//         const response = await fetch('https://onyxs-towers.space/api/data.json', {
//             headers: { 'Cache-Control': 'no-cache' } // Prevents receiving stale // cached data
//         });
// 
//         if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//         }
// 
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         logFailure(`Failed to fetch website static data because: ${error}`);
//         return null;
//     }
// }

module.exports = {
    data: new SlashCommandBuilder()
        .setName('webbersite')
        .setDescription('check the webbersite.'),

    async execute(interaction: ChatInputCommandInteraction) {
        // const data = await getWebsiteData()
        await interaction.reply({ content: `https://onyxs-towers.space` });
    },
};