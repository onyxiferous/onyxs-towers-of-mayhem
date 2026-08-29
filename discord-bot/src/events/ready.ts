import { Events, ActivityType, Client } from 'discord.js';
import { logSuccess, logSection } from '@modules/logger.js';
import { isCurrentlyInMaintenance } from '@modules/maintenance.js';
import { postReadyMessage } from '@modules/ready-message.js';
import type { MaintenanceModeFlag } from '@reserved-types/flags.js';

let currentMaintenanceState: MaintenanceModeFlag = false;

export const name = Events.ClientReady;
export const once = true;

export async function execute(
    client: Client,
    initialMaintenanceMode: MaintenanceModeFlag
) {
    logSection('Client ready!');
    logSuccess(`Logged in as ${client.user!.tag}!`);

    await handleScheduleCheck(client, initialMaintenanceMode);

    setInterval(
        () => handleScheduleCheck(client, initialMaintenanceMode),
        30_000
    );
}

async function handleScheduleCheck(
    client: Client,
    manualOverride = false
) {
    const scheduledCheck = isCurrentlyInMaintenance();
    const isScheduled = manualOverride || scheduledCheck;

    if (isScheduled === currentMaintenanceState) {
        return;
    }

    currentMaintenanceState = isScheduled;

    applyStatus(isScheduled, client);
    await postReadyMessage(currentMaintenanceState, client);
}

async function applyStatus(
    maintenanceMode: MaintenanceModeFlag,
    client: Client
) {
    client.user!.setPresence({
        activities: [{
            name: 'Custom Status',
            state: maintenanceMode
                ? 'currently under maintenance'
                : 'hmm',
            type: ActivityType.Custom
        }],
        status: maintenanceMode ? 'dnd' : 'idle',
    });
}