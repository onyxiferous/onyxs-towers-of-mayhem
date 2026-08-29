import { Events, Interaction } from 'discord.js';
import { MaintenanceModeFlag } from '@reserved-types/flags.js';
import { onInteraction } from '@helpers/command-types/chat.js';

export const name = Events.InteractionCreate;
export async function execute(interaction: Interaction, maintenanceMode: MaintenanceModeFlag) {
	if (interaction.isChatInputCommand()) {
        return onInteraction(interaction, maintenanceMode);
    }
}