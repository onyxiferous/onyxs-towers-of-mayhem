import { SlashCommandBuilder, EmbedBuilder, ChatInputCommandInteraction, ChannelType } from 'discord.js';
import { getVoiceConnection } from '@discordjs/voice';
import { searchSoundCloud, playInVoice } from '@modules/soundcloud.js';
import { logAsync } from '@modules/logger.js';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('music')
        .setDescription('play anything on soundcloud!')

        .addSubcommand((subcommand) => subcommand.setName('queue').setDescription('shows you the queue.'))
        .addSubcommand((subcommand) =>
            subcommand
                .setName('halt')
                .setDescription('stops music if you have it playing.')
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName('search')
                .setDescription('the thing to search.')
                .addStringOption((option) =>
                    option
                        .setName('query')
                        .setDescription('the thing to search.')
                        .setRequired(true))

        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.guild) { return; }

        const member = await interaction.guild.members.fetch(interaction.user.id);
        const memberId: string = interaction.member?.user?.id ?? "0";

        if (memberId !== "1322256241791074325") {
            return interaction.reply({ content: 'this command is disabled for you.', ephemeral: true })
        }

        const subcommand = interaction.options.getSubcommand();
        const voiceChannel = member.voice.channel;
        const botVoiceChannel = interaction.guild?.members?.me?.voice?.channel;

        if (subcommand !== 'search') {
            if (voiceChannel && botVoiceChannel == voiceChannel) {
                const connection = getVoiceConnection(interaction.guild.id);
                if (connection) {
                    connection.disconnect();
                    await interaction.reply(':(');
                }
            }
            await interaction.reply('something went wrong!')
            return
        }
        const playInVc = interaction.options.getBoolean('play') ?? false
        const query = interaction.options.getString('query') ?? ''
        const data = await searchSoundCloud(query);
        if (!data || data.length === 0) {
            return interaction.reply({
                content: 'no results found!',
                ephemeral: true
            });
        }
        const connection = getVoiceConnection(interaction.guild.id);
        const topTrack = data[0];
        const songTitle = topTrack.title;
        const songUrl = topTrack.url;
        const composer = topTrack.publisher
        const songEmbed = new EmbedBuilder()
            .setColor('#FF5500')
            .setTitle(`found ${songTitle}`)
            .setURL(songUrl)
            .setDescription(`by: ${composer || 'unknown'}`)
            .setThumbnail(topTrack.thumbnail)
            .addFields(
                { name: 'duration', value: `${topTrack.duration} seconds`, inline: true }
            )
            .setTimestamp();
        await interaction.reply({ embeds: [songEmbed] });
        if (connection) {
            connection.destroy();
        }
        if (playInVc) {
                    if (!voiceChannel || voiceChannel.type !== ChannelType.GuildVoice) {
    return interaction.editReply(
        'you need to be in a regular voice channel.'
    );
}

    try {
        logAsync(
            `playing music in voice! ${songTitle} - ${topTrack.publisher}`
        );

        await playInVoice(songUrl, voiceChannel);

        return await interaction.editReply('now playing in vc publicly');
    } catch (error) {
        return await interaction.editReply(
            `something went wrong while trying to play this song! ${error}`
        );
    }
        }
    },
};