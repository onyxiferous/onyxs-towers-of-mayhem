import { ChatInputCommandInteraction, AttachmentBuilder, MessageFlags } from "discord.js";
import { MaintenanceModeFlag } from "@reserved-types/flags.js";
import { embedMaintenanceInteraction } from '@templates/embeds.js';
import { logFailure } from "#modules/logger.js";

const schedule = new AttachmentBuilder(
    './assets/images/maintenance-schedule.png',
    { name: 'maintenance-schedule.png' }
);

export async function onInteraction(interaction: ChatInputCommandInteraction, maintenanceMode: MaintenanceModeFlag) {
    if (maintenanceMode) {
		await interaction.reply({
			embeds: [embedMaintenanceInteraction],
			flags: MessageFlags.Ephemeral,
			files: [schedule],
		});
		return;
	}
	if (!interaction.isChatInputCommand()) return;
	const command = interaction.client.commands.get(interaction.commandName);
	if (!command) {
		logFailure(`No command matching ${interaction.commandName} was found.`);
		return;
	}
	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		} else {
			await interaction.reply({
				content: 'There was an error while executing this command!',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}