const { Events, ActivityType, inlineCode } = require('discord.js');
const { logSuccess, logSection, logFailure, logAsync, logWarning, logPromise } = require('../scripts/logger');
const { isCurrentlyInMaintenance } = require('../scripts/maintenance.js');
const { embedMaintenanceMode, embedOnline } = require('../formatting/embeds.js');
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
    const readyMessageState = await readJsonFile(readyMessageStatePath).catch(logFailure);
    const channel = await client.channels.fetch(readyMessageState.readyMessageChannelId).catch(() => null);
    const fallbackChannel = await client.channels.fetch(readyMessageState.fallbackChannelId).catch(logFailure('I couldn\'t send the message in the fallback channel - you\'re on your own!'));

    if (!channel && fallbackChannel) {
        await channel.messages.fetch()
        return logFailure('Invalid target channel! Please set the correct channel ID within /shared-data/ready-message.json.');
    }

    if (!maintenanceMode) {
        const ubuntuVersion = execSync('lsb_release -sr').toString().trim() || 'unknown';
        const rundown = await generateRundown();
        embedOnline.setFields([
            {
                name: 'server information',
                value: `provider: ${inlineCode('oracle_cloud@ubuntu v' + ubuntuVersion)}\n${rundown}`
            }
        ]);
    }

    const targetEmbed = maintenanceMode ? embedMaintenanceMode : embedOnline;

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