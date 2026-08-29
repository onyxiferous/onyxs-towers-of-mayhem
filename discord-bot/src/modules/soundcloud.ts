import { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus } from '@discordjs/voice';
import { setToken, search, stream as _stream } from 'play-dl';
import { logFailure } from '@modules/logger.js';
import tokens from '@private/tokens.json' with { type: 'json' };
const { soundcloudClientId } = tokens

import { resolve as _resolve } from 'path';
import { VoiceChannel } from 'discord.js';

async function setupPlayDL() {
    await setToken({
        soundcloud: {
            client_id: soundcloudClientId
        }
    });
}
setupPlayDL();

export async function searchSoundCloud(query: string) {
    try {
        const searchResults = await search(query, {
            source: { soundcloud: 'tracks' },
            limit: 5
        });

        return searchResults.map(track => ({
            title: track.name || "Unknown SoundCloud Track",
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

export async function playInVoice(trackUrl: string, voiceChannel: VoiceChannel, mp3FilePath = './assets/audio/vc-join.mp3') {
    const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
    });

    const player = createAudioPlayer();
    connection.subscribe(player);

    try {
        const fullMp3Path = _resolve(mp3FilePath);
        console.log(fullMp3Path);
        const mp3Resource = createAudioResource(fullMp3Path);

        player.play(mp3Resource);
        console.log(`[VC EVENT] Playing local intro file: ${mp3FilePath}`);

        await new Promise<void>((resolve, reject) => {
            const onIdle = () => {
                player.off(AudioPlayerStatus.Idle, onIdle);
                player.off('error', onError);
                resolve();
            };
            const onError = (error: Error) => {
                player.off(AudioPlayerStatus.Idle, onIdle);
                player.off('error', onError);
                reject(error);
            };
            player.on(AudioPlayerStatus.Idle, onIdle);
            player.on('error', onError);
        });

        console.log(`[VC EVENT] Intro finished. Transitioning to SoundCloud stream.`);
        const stream = await _stream(trackUrl);
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