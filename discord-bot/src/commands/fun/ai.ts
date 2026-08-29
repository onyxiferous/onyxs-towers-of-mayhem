import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { ChatMessage, respondTo } from '@modules/chatbot.js'
import { ChatResponse } from 'ollama';

const MAX_CHAT_HISTORY = 20;
let history: ChatMessage[] = [];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ai')
        .setDescription('use ai!')
        .addSubcommand((subcommand) => 
            subcommand.setName('ask')
                .setDescription('ask me anything. responses may not always be accurate.')
                .addStringOption((string) => 
                    string.setName('query')
                        .setDescription('what do you want to ask?')
                        .setRequired(true)
                )
        ),

    async execute(interaction: ChatInputCommandInteraction) {
        if (!interaction.channel) {
            return;
        }

        await interaction.deferReply();
        const query = interaction.options.getString('query', true);

        if (history.length > MAX_CHAT_HISTORY) {
            history = history.slice(0, MAX_CHAT_HISTORY); 
        }

        try {
        const apiResponse: ChatResponse = await respondTo(query, history);
        const stringResponse = apiResponse.message.content;

        history.push(
            { role: 'user', content: query },
            { role: 'assistant', content: apiResponse.message.content }
        );

            if (stringResponse.length > 500) {
                const chunks = stringResponse.match(/[\s\S]{1,550}/g) || [];
                await interaction.editReply({ content: chunks[0] });
                for (let i = 1; i < chunks.length; i++) {
                    await interaction.editReply(chunks[i]);
                }
            } else {
                await interaction.editReply({ content: `${stringResponse}\n-# i am a ferret. ferrets can't remember much.` });
            }
        } catch (error) {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: `something went wrong while generating a response. ${error}` });
            } else {
                await interaction.reply({ content: `something went wrong while generating a response. ${error}`, ephemeral: true });
            }
        }
    },
};