const { Events, ActivityType, EmbedBuilder, inlineCode } = require('discord.js');
const { logSuccess, logSection, logFailure, logAsync, logWarning, logPromise } = require('../scripts/logger');
const { isCurrentlyInMaintenance } = require('../scripts/maintenance.js');
const { embedMaintenanceMode, embedOnline, embedCouldn_tFindChannel } = require('../formatting/embeds.js');
const { generateRundown } = require('../scripts/server-usage.js');
const { execSync } = require('child_process');
const { readJsonFile, updateJsonField } = require('../scripts/json.js');

const readyMessageStatePath = './shared-data/ready-message.json'

let currentMaintenanceState = null;

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client, initialMaintenanceMode) {
        logSection('Client ready!');
        logSuccess(`Logged in as ${client.user.tag}!`);

        await handleScheduleCheck(client, initialMaintenanceMode);

        setInterval(() => handleScheduleCheck(client, initialMaintenanceMode), 30 * 1000);
    },
};

async function handleScheduleCheck(client, manualOverride = false) {
    const scheduledCheck = isCurrentlyInMaintenance();
    const isScheduled = manualOverride || scheduledCheck;
    if (isScheduled === currentMaintenanceState) return;

    currentMaintenanceState = isScheduled;
    applyStatus(isScheduled, client);
    await sendNotification(isScheduled, client);
}

function applyStatus(maintenanceMode, client) {
    if (maintenanceMode) {
        client.user.setPresence({
            activities: [{ 
                name: 'Custom Status',
                state: 'currently under maintenance', 
                type: ActivityType.Custom 
            }],
            status: 'dnd',
        });
    } else {
        client.user.setPresence({
            activities: [{ 
                name: 'Custom Status',
                state: 'hmm', 
                type: ActivityType.Custom 
            }],
            status: 'idle',
        });
    }
}

async function sendNotification(maintenanceMode, client) {
    const unix = Math.floor(Date.now() / 1000);
    const readyMessageState = await readJsonFile(readyMessageStatePath).catch(logFailure);
    const channel = await client.channels.fetch(readyMessageState.readyMessageChannelId).catch(() => null);
    const fallbackChannel = await client.channels.fetch(readyMessageState.fallbackChannelId)
    .catch((error) => {
        logFailure('I couldn\'t send the message in the fallback channel - you\'re on your own!', error);
        return null;
    });

    if (!channel && fallbackChannel) {
        const warningEmbed = EmbedBuilder.from(embedCouldn_tFindChannel);
        const targetChannelText = channel?.id ? `<#${channel.id}>` : "...wait hold up I don't know...";
        const updatedDescription = (warningEmbed.data.description || '')
            .replace('|TARGET_CHANNEL|', targetChannelText)
            .replace('|COMMAND_SOURCE|', 'ready.js');

        warningEmbed.setDescription(updatedDescription);

        await fallbackChannel.send({ embeds: [warningEmbed] })
        logWarning('Sent the fallback message. Do better next time.')
        return logFailure('Invalid target channel! Please set the correct channel ID within /shared-data/ready-message.json.');
    }

    if (!maintenanceMode) {
        const ubuntuVersion = execSync('lsb_release -sr').toString().trim() || 'unknown';
        const rundown = await generateRundown();
        embedOnline.spliceFields(0, 1, {
            name: 'server information',
            value: `provider: ${inlineCode('oracle_cloud@ubuntu v' + ubuntuVersion)}\n${rundown}`,
            inline: true,
    });
    }

    const targetEmbed = EmbedBuilder.from(maintenanceMode ? embedMaintenanceMode : embedOnline);

    if (targetEmbed.data.fields && targetEmbed.data.fields[1]) {
        const currentValue = targetEmbed.data.fields[1].value || '';
        const updatedValue = currentValue.replace(/\|NOW_TIMESTAMP\||<t:\d+:R>/g, `<t:${unix}:R>`);

        // Splice field 1 with updated value
        targetEmbed.spliceFields(1, 1, {
            name: targetEmbed.data.fields[1].name,
            value: updatedValue,
            inline: true
        });
    }

    try {
        const existingMessage = (readyMessageState.readyMessageId && !maintenanceMode)
            ? await channel.messages.fetch(readyMessageState.readyMessageId).catch(() => {
                logPromise('Ready message ID does not exist. Automatically creating a new message...');
                return null;
            })
            : null;

        if (readyMessageState.readyMessageId && existingMessage){
            await channel.messages.edit(readyMessageState.readyMessageId, { embeds: [targetEmbed] });
            logAsync(`Editing existing ready message in channel ID <${readyMessageState.readyMessageId}>!`)
        } else {
            const newMessage = await channel.send({ embeds: [targetEmbed] });
            await updateJsonField(readyMessageStatePath, 'readyMessageId', newMessage.id);
            logAsync(`Posting new ready message in channel ID ${newMessage.id}!`)
        }
    } catch (error) {
        return logWarning('Failed to post ready message. Exiting safely...');
    }
}