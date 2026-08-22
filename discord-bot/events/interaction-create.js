const { Events, MessageFlags, AttachmentBuilder } = require('discord.js');
const { logFailure } = require('../scripts/logger');
const { embedMaintenanceInteraction } = require('../formatting/embeds');

const schedule = new AttachmentBuilder(
    './assets/images/maintenance-schedule.png',
    { name: 'maintenance-schedule.png' }
);
    
module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction, maintenanceMode) {
        if (maintenanceMode) {
            	await interaction.reply({
        			embeds: [embedMaintenanceInteraction],
        			flags: MessageFlags.Ephemeral,
                    files: [schedule],
        		});
            return
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
    },
};