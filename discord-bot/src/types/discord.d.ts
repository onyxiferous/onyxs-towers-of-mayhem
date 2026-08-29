import type { Collection } from 'discord.js';
import type { SlashCommand } from './command.ts';

declare module 'discord.js' {
    interface Client {
        commands: Collection<string, SlashCommand>;
    }
}

export {};