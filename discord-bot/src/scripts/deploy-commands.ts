import { REST, Routes } from 'discord.js';
import tokens from '@private/tokens.json' with { type: 'json' };

import {
    reloadCommands,
    getCommands
} from '@scripts/reload-commands.js';

import {
    logAsync,
    logSuccess,
    logFailure
} from '@modules/logger.js';

const { clientId, guildId, token } = tokens;

const rest = new REST().setToken(token);

try {
    await reloadCommands();

    const currentCommands = getCommands();

    logAsync(
        `Starting refreshing ${currentCommands.length} application commands.`
    );

    const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        {
            body: currentCommands
        }
    ) as unknown[];

    logSuccess(
        `Refreshed ${data.length} application commands.`
    );
} catch (error) {
    logFailure(
        `Could not reload application commands because: ${error}`
    );
}