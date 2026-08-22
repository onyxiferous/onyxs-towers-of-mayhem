const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('../config.json');
const { reloadCommands, getCommands } = require('./reload-commands.js'); // Updated import
const { logAsync, logSuccess, logFailure } = require('./logger.js');

const rest = new REST().setToken(token);

(async () => {
    reloadCommands(); 
    
    const currentCommands = getCommands(); 

    try {
        logAsync(`Starting refreshing ${currentCommands.length} application commands.`);
        
        const data = await rest.put(
            Routes.applicationGuildCommands(clientId, guildId), 
            { body: currentCommands }
        );
        
        logSuccess(`Refreshed ${data.length} application commands.`);
    } catch (error) {
        logFailure(`Could not reload application commands because: ${error}`);
    }
})();