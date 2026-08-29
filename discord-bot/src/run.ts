import { Client, GatewayIntentBits, Collection } from 'discord.js';

import flags from '@config/flags.json' with { type: 'json' };
import tokens from '@private/tokens.json' with { type: 'json' };

const { maintenanceMode } = flags
const { token } = tokens;

import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadCommandsFromDir } from '@scripts/reload-commands.js';
import { logSuccess, logSection } from '@modules/logger.js';
import { startListeningIp } from '@server/api.js';

const __dirname = import.meta.dirname

startListeningIp('127.0.0.1')

logSection('JavaScript started!')

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
    ],
});

client.commands = new Collection();
const mainCommandsPath = join(__dirname, 'commands');

await loadCommandsFromDir(client, mainCommandsPath);

const eventsPath = join(__dirname, 'events');


const eventFiles = readdirSync(eventsPath).filter(
    (file) => file.endsWith('.ts') || file.endsWith('.js')
);

for (const file of eventFiles) {
    const filePath = join(eventsPath, file);
    const event = await import(filePath);

    if (event.once) {
        client.once(
            event.name,
            (...args) => event.execute(...args, maintenanceMode)
        );
    } else {
        client.on(
            event.name,
            (...args) => event.execute(...args, maintenanceMode)
        );
    }

    logSuccess(`Loaded event ${event.name}`);
}

client.login(token);