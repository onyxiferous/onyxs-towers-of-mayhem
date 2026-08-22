const { Client, GatewayIntentBits, Collection } = require('discord.js'); // 1. Added Collection here
const config = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const { loadCommandsFromDir } = require('./scripts/reload-commands');
const { logSuccess, logSection } = require('./scripts/logger');

logSection('JavaScript started!')

const client = new Client({ 
    intents: [ 
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent 
    ] 
});

client.commands = new Collection();
const mainCommandsPath = path.join(__dirname, 'commands');

loadCommandsFromDir(client, mainCommandsPath);

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter((file) => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, config.maintenanceMode));
    } else {
        client.on(event.name, (...args) => event.execute(...args, config.maintenanceMode));
    }
    logSuccess(`Loaded event ${event.name}`);
}

client.login(config.token);