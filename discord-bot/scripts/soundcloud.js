const { 
    joinVoiceChannel, 
    createAudioPlayer, 
    createAudioResource, 
    AudioPlayerStatus 
} = require('@discordjs/voice');
const play = require('play-dl');
const { logFailure } = require('./logger');
const { soundcloudClientId } = require('../config.json')
const path = require('path');

async function setupPlayDL() {
    await play.setToken({
        soundcloud: {
            client_id: soundcloudClientId
        }
    });
}
setupPlayDL();

async function searchSoundCloud(query) {
    try {
        const searchResults = await play.search(query, { 
            source: { soundcloud: 'tracks' }, 
            limit: 5 
        });
        
        return searchResults.map(track => ({
            title: track.name || track.title || "Unknown SoundCloud Track",
            publisher: track.publisher || 'Unknown',
            url: track.url,
            duration: track.durationInSec,
            thumbnail: track.thumbnail
        }));
    } catch (error) {
        logFailure(`SoundCloud Search Error: ${error}`);
        return [];
    }
}

async function playInVoice(trackUrl, voiceChannel, mp3FilePath = './assets/audio/vc-join.mp3') {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    try {
        const fullMp3Path = path.resolve(mp3FilePath);
        console.log(fullMp3Path);
        const mp3Resource = createAudioResource(fullMp3Path);
        
        player.play(mp3Resource);
        console.log(`[VC EVENT] Playing local intro file: ${mp3FilePath}`);

        await new Promise((resolve, reject) => {
            const onIdle = () => {
                player.off(AudioPlayerStatus.Idle, onIdle);
                player.off('error', onError);
                resolve();
            };
            const onError = (error) => {
                player.off(AudioPlayerStatus.Idle, onIdle);
                player.off('error', onError);
                reject(error);
            };
            player.on(AudioPlayerStatus.Idle, onIdle);
            player.on('error', onError);
        });

        console.log(`[VC EVENT] Intro finished. Transitioning to SoundCloud stream.`);
        const stream = await play.stream(trackUrl);
        const scResource = createAudioResource(stream.stream, { inputType: stream.type });
        
        player.play(scResource);

        player.on(AudioPlayerStatus.Idle, () => {
            connection.destroy();
        });

        player.on('error', (error) => {
            console.error(`Audio Player Error during SoundCloud playback: ${error.message}`);
            connection.destroy();
        });

    } catch (error) {
        console.error('Playback sequence failed:', error);
        connection.destroy();
    }
}

module.exports = { searchSoundCloud, playInVoice };