const { EmbedBuilder } = require('discord.js');
const emoji = require('./emoji');

const embedMaintenanceInteraction = new EmbedBuilder()
    .setColor('Grey')
    .setTitle('maintenance_mode')
    .setDescription('servers are still in maintenance. please check back later. please refer to this nifty calendar to see what times the server is offline!')
    .setFooter({ text: 'bot created by onyx' })
    .setImage('attachment://maintenance-schedule.png');

const embedOnline = new EmbedBuilder()
    .setColor('Green')
    .setTitle(`${emoji.BOT_connecting} online`)
    .setDescription('i\'m online and ready to handle commands!')
    .setImage('https://media1.tenor.com/m/ckcRbRDEmN8AAAAC/smooth-brain-kitty.gif')
    .setFooter({ text: 'bot created by onyx' })
    .addFields(
		{ name: 'server information', value: 'failed to load!' },
        { name: 'last updated', value: '|NOW_TIMESTAMP|' }
	);

const embedMaintenanceMode = new EmbedBuilder()
    .setColor('Grey')
    .setTitle('maintenance_mode')
    .setDescription('servers are in maintenance. most features will not work!')
    .setFooter({ text: 'bot created by onyx' });

const embedServerStatus = new EmbedBuilder()
    .setColor('Grey')
    .setTitle('server status and performance')
    .setDescription('failed to load!')

const embedCouldn_tFindChannel = new EmbedBuilder()
    .setColor('Red')
    .setTitle('shiver me timbers!')
    .setDescription('i tried to post something in |TARGET_CHANNEL|, but something went wrong - instead, i sent this warning in the main channel because something seems to be up. source: |COMMAND_SOURCE|');

module.exports = {
    embedMaintenanceInteraction,
    embedMaintenanceMode,
    embedOnline,
    embedServerStatus,
    embedCouldn_tFindChannel,
};