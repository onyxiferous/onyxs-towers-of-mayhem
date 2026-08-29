import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { logSuccess, logWarning } from '@modules/logger.js';
import type { ChatInputCommandInteraction, Client, RESTPostAPIApplicationCommandsJSONBody, SlashCommandBuilder } from 'discord.js';

type SlashCommand = {
    data: SlashCommandBuilder;
    execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
};

let commands: RESTPostAPIApplicationCommandsJSONBody[] = [];
const mainCommandsPath = path.resolve('src/commands');

export async function reloadCommands(): Promise<RESTPostAPIApplicationCommandsJSONBody[]> {
    console.log('[INFO]: Reloading commands...');
    commands = [];
    if (!fs.existsSync(mainCommandsPath)) return commands;

    const items = fs.readdirSync(mainCommandsPath);

    async function loadCommandFile(filePath: string, fileName: string): Promise<void> {
        try {
            const fileUrl = pathToFileURL(filePath);
            fileUrl.searchParams.set('update', Date.now().toString());

            const module = await import(fileUrl.href);
            const command = module.default;

            if (command && 'data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
                logSuccess(`Command "${fileName}" successfully reloaded!`);
            } else {
                logWarning(`Command at ${filePath} is missing a required "data" or "execute" field.`);
            }
        } catch (error) {
            console.error(`Failed to load command file ${fileName}:`, error);
        }
    }

    for (const item of items) {
        const itemPath = path.join(mainCommandsPath, item);
        const stat = fs.statSync(itemPath);
        if (stat.isFile() && item.endsWith('.ts')) {
            const fileName = item.replace(/\.[^/.]+$/, "");
            await loadCommandFile(itemPath, fileName);
        } else if (stat.isDirectory()) {
            const subFiles = fs.readdirSync(itemPath).filter((file) => file.endsWith('.ts'));
            for (const file of subFiles) {
                const filePath = path.join(itemPath, file);
                const fileName = file.replace(/\.[^/.]+$/, "");
                await loadCommandFile(filePath, fileName);
            }
        }
    }
    return commands;
}

export async function loadCommandsFromDir(client: Client & { commands?: Map<string, SlashCommand> }, dirPath: string): Promise<void> {
    if (!fs.existsSync(dirPath)) return;
    const items = fs.readdirSync(dirPath);

    for (const item of items) {
        const itemPath = path.join(dirPath, item);
        const stat = fs.statSync(itemPath);

        if (stat.isFile() && item.endsWith('.ts')) {
            try {
                const fileUrl = pathToFileURL(itemPath).href;
                const module = await import(fileUrl);
                const command = module.default;

                if (command && 'data' in command && 'execute' in command) {
                    client.commands?.set(command.data.name, command);
                    logSuccess(`Loaded command ${command.data.name}`);
                }
            } catch (error) {
                console.error(`Error initial loading ${itemPath}:`, error);
            }
        } else if (stat.isDirectory()) {
            await loadCommandsFromDir(client, itemPath);
        }
    }
}

export const getCommands = (): RESTPostAPIApplicationCommandsJSONBody[] => commands;