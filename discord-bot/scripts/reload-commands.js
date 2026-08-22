const fs = require('node:fs');
const path = require('node:path');
const { logSuccess, logWarning } = require('./logger');

let commands = []; 
const mainCommandsPath = path.join(__dirname, '../', 'commands');

function reloadCommands() {
    console.log('[INFO]: Reloading commands...');
    commands = [];
    
    if (!fs.existsSync(mainCommandsPath)) return commands;
    const items = fs.readdirSync(mainCommandsPath);

    function loadCommandFile(filePath, fileName) {
        delete require.cache[require.resolve(filePath)]; 
        const command = require(filePath);
        if ('data' in command && 'execute' in command) {
            commands.push(command.data.toJSON());
            logSuccess(`Command "${fileName}" successfully reloaded!`);
        } else {
            logWarning(`Command at ${filePath} is missing a required "data" or "execute" field.`);
        }
    }

    for (const item of items) {
        const itemPath = path.join(mainCommandsPath, item);
        const stat = fs.statSync(itemPath);
        if (stat.isFile() && item.endsWith('.js')) {
            const fileName = item.replace(/\.[^/.]+$/, "");
            loadCommandFile(itemPath, fileName);
        } else if (stat.isDirectory()) {
            const subFiles = fs.readdirSync(itemPath).filter((file) => file.endsWith('.js'));
            for (const file of subFiles) {
                const filePath = path.join(itemPath, file);
                const fileName = file.replace(/\.[^/.]+$/, "");
                loadCommandFile(filePath, fileName);
            }
        }
    }
    return commands;
}

function loadCommandsFromDir(client, dirPath) {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile() && item.endsWith('.js')) {
            const command = require(itemPath);
            if ('data' in command && 'execute' in command) {
                client.commands.set(command.data.name, command);
                logSuccess(`Loaded command ${command.data.name}`);
            }
        } else if (stat.isDirectory()) {
            loadCommandsFromDir(client, itemPath); 
        }
    }
}

module.exports = { 
    reloadCommands, 
    loadCommandsFromDir, 
    getCommands: () => commands 
};