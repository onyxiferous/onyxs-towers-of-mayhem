import {
    inlineCode,
    EmbedBuilder,
    ChannelType,
    type Client as DiscordClient,
    type TextChannel,
} from 'discord.js';

import { logFailure, logAsync, logPromise } from '@modules/logger.js';
import { embedMaintenanceMode, embedOnline, embedCouldn_tFindChannel, embedNginx } from '@templates/embeds.js';
import { readJsonFile, updateJsonField } from '@modules/json.js';
import { generateRundown } from '@modules/server-usage.js';
import { execSync } from 'child_process';
import { getNginxListening } from '@server/api.js';

const messageStatePath = '@config/ready-message.json'

type ReadyMessageJSON = Record<string, string>;
type ReadyMessageJSONType = 'readyMessageChannelId' | 'fallbackChannelId'

function getServerMetadata(): string {
    return execSync('lsb_release -sr').toString().trim() || 'unknown'
}

export async function fetchChannel(
    type: ReadyMessageJSONType,
    client: DiscordClient,
    json: ReadyMessageJSON
): Promise<TextChannel | null> {
    const channel = await client.channels.fetch(json[type]);

    if (!channel || channel.type !== ChannelType.GuildText) {
        return null;
    }

    return channel;
}

export async function sendFallbackMessage(fallbackChannel: TextChannel) {
    const baseEmbed = EmbedBuilder.from(embedCouldn_tFindChannel)
    const targetChannel = '(unknown)'
    const embedDescription = (baseEmbed.data.description || '')
        .replace('|TARGET_CHANNEL|', targetChannel)
        .replace('|COMMAND_SOURCE|', 'ready-message.ts')

    baseEmbed.setDescription(embedDescription);
    await fallbackChannel.send({ embeds: [baseEmbed] })
}

export async function sendMaintenanceModeMessage(channel: TextChannel) {
    const baseEmbed = EmbedBuilder.from(embedMaintenanceMode)
    const ubuntuVersion = getServerMetadata();
    const performanceRundown = await generateRundown();

    baseEmbed.spliceFields(0, 1, {
        name: 'server information',
        value: `provider: ${inlineCode('oracle_cloud@ubuntu v' + ubuntuVersion)}\n${performanceRundown}`
    });

    await updateJsonField(messageStatePath, 'nginxMessageId', '0');

    channel.send({ embeds: [baseEmbed] })
}

export async function sendBotStatusMessage(
    channel: TextChannel,
    json: ReadyMessageJSON
) {
    const readyMessageId = json.readyMessageId;

    const nginxListening = getNginxListening();
    const nginxMessageId = nginxListening
        ? json.nginxMessageId
        : null;

    const unixTime = Math.floor(Date.now() / 1000);

    /*
     * =========================
     * READY MESSAGE
     * =========================
     */

    const readyEmbed = EmbedBuilder.from(embedOnline);

    if (readyEmbed.data.fields) {
        readyEmbed.data.fields = readyEmbed.data.fields.map(field => ({
            ...field,
            value: (field.value || '')
                .replace(
                    /\|NOW_TIMESTAMP\|<t:\d+:R>/g,
                    `<t:${unixTime}:R>`
                )
                .replace(
                    /\|NOW_TIMESTAMP\|/g,
                    `<t:${unixTime}:R>`
                )
        }));
    }

    let readyMessage = null;

    if (readyMessageId) {
        try {
            readyMessage = await channel.messages.fetch(readyMessageId);
        } catch {
            logPromise(
                'Ready message ID does not exist. Automatically creating a new message...'
            );
        }
    }

    if (readyMessage) {
        await readyMessage.edit({
            embeds: [readyEmbed]
        });

        logAsync(
            `Editing existing ready message in channel ID ${readyMessage.id}!`
        );
    } else {
        const newMessage = await channel.send({
            embeds: [readyEmbed]
        });

        await updateJsonField(
            messageStatePath,
            'readyMessageId',
            newMessage.id
        );

        logAsync(
            `Posting new ready message in channel ID ${newMessage.id}!`
        );
    }


    /*
     * =========================
     * NGINX MESSAGE
     * =========================
     */

    const nginxEmbed = EmbedBuilder.from(embedNginx);

    nginxEmbed
        .setTitle(
            nginxListening
                ? 'nginx online'
                : 'nginx offline'
        )
        .setColor(
            nginxListening
                ? 'Green'
                : 'Red'
        )
        .setDescription(
            nginxListening
                ? 'web requests are working! messages sent from roblox or api requests will be received.'
                : embedNginx.data.description || ''
        );

    /*
     * Update timestamp in nginx embed AFTER
     * creating it from embedNginx.
     */

    if (nginxEmbed.data.fields) {
        nginxEmbed.data.fields = nginxEmbed.data.fields.map(field => ({
            ...field,
            value: (field.value || '')
                .replace(
                    /\|NOW_TIMESTAMP\|<t:\d+:R>/g,
                    `<t:${unixTime}:R>`
                )
                .replace(
                    /\|NOW_TIMESTAMP\|/g,
                    `<t:${unixTime}:R>`
                )
        }));
    }

    let nginxMessage = null;

    if (nginxMessageId) {
        try {
            nginxMessage = await channel.messages.fetch(nginxMessageId);
        } catch {
            logPromise(
                'Nginx message ID does not exist. Automatically creating a new message...'
            );
        }
    }

    if (nginxMessage) {
        await nginxMessage.edit({
            embeds: [nginxEmbed]
        });

        logAsync(
            `Editing existing nginx message in channel ID ${nginxMessage.id}!`
        );
    } else {
        const newMessage = await channel.send({
            embeds: [nginxEmbed]
        });

        await updateJsonField(
            messageStatePath,
            'nginxMessageId',
            newMessage.id
        );

        logAsync(
            `Posting new nginx message in channel ID ${newMessage.id}!`
        );
    }
}

export async function postReadyMessage(maintenanceMode: boolean, client: DiscordClient) {
    const messageState = await readJsonFile(messageStatePath).catch(logFailure);

    const channel = await fetchChannel('readyMessageChannelId', client, messageState);
    const fallbackChannel = await fetchChannel('fallbackChannelId', client, messageState);

    if (!channel) {
        return fallbackChannel && sendFallbackMessage(fallbackChannel);
    }

    switch (maintenanceMode) {
        case true:
            sendMaintenanceModeMessage(channel)
            break;

        default:
            sendBotStatusMessage(channel, messageState)
            break;
    }
}