const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { searchSoundCloud, playInVoice } = require('../../scripts/soundcloud');
const { logAsync } = require('../../scripts/logger');
const { getVoiceConnection } = require('@discordjs/voice');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('play anything on soundcloud!')

        .addSubcommand((subcommand) => subcommand.setName('halt').setDescription('stops music if you have it playing.'),)

        	.addSubcommand((subcommand) =>
		subcommand
			.setName('search')
			.setDescription('the thing to search.')
            .addStringOption((option) =>
             option.setName('query')
             .setDescription('the thing to search.')
              .setRequired(true))

              .addSubcommand(subcommand => 
                subcommand.setName('queue').setDescription('shows you the queue.')
              )
	),

    async execute(interaction) {
        interaction.reply('this command is disabled.')
        

//         const subcommand = interaction.options.getSubcommand();

//         const voiceChannel = interaction.member?.voice?.channel;
//         const botVoiceChannel = interaction.guild?.members?.me?.voice?.channel;
       

//             if (subcommand !== 'search') {
//         if (voiceChannel && botVoiceChannel == voiceChannel) {
//             const connection = getVoiceConnection(interaction.guild.id);

//             if (connection) {
//                 connection.disconnect();
//                 await interaction.reply(':(');
//             }
//         }
//                 return
//             }

//         const playInVc = interaction.options.getBoolean('play')
//         const query = interaction.options.getString('query')
//         const data = await searchSoundCloud(query);

//         if (!data || data.length === 0) {
//            return interaction.reply({ 
//                 content: 'no results found!', 
//              ephemeral: true 
//     });
// }

//     const connection = getVoiceConnection(interaction.guild.id);
//     const topTrack = data[0]; 
//     const songTitle = topTrack.title;
//     const songUrl = topTrack.url;
//     const composer = await topTrack.publisher.writer_composer

//     const songEmbed = new EmbedBuilder()
//         .setColor('#FF5500')
//         .setTitle(`found ${songTitle}`)
//         .setURL(songUrl)
//         .setDescription(`by: ${topTrack.publisher.artist || 'unknown'}
// ${composer ? `writer: ${topTrack.publisher.writer_composer}` : ''}`)
//         .setThumbnail(topTrack.thumbnail)
//         .addFields(
//             { name: 'duration', value: `${topTrack.duration} seconds`, inline: true }
//         )
//     .setTimestamp();

//     await interaction.reply({ embeds: [songEmbed] });

//     if (connection) {
//         connection.destroy();
//     }

//     if (playInVc) {
//         if (!voiceChannel) {
//             return await interaction.editReply('tried to play this, but you are not in a vc! try running with play OFF.')
//         }

//         try {
//             logAsync(`playing music in voice! ${songTitle} - ${topTrack.publisher.artist}`)
//             await playInVoice(songUrl, voiceChannel)
//             return await interaction.editReply('now playing in vc publicly')
//         } catch (error) {
//             return await interaction.editReply('something went wrong while trying to play this song!')
//         }
//     }
    },
};