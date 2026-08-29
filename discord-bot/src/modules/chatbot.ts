import ollama, { ChatResponse } from 'ollama';
import { logFailure } from './logger.js';

export type ChatMessage = {
    role: 'user' | 'assistant';
    content: string;
};

export async function respondTo(
    query: string,
    history: ChatMessage[] = []
): Promise<ChatResponse> {
    try {
        const response = await ollama.chat({
            model: 'polecat',
            messages: [
                ...history,
                { role: 'user', content: query }
            ]
        });

        return response;
    } catch (error) {
        logFailure(`Ollama connection failure: ${error}`);
        throw new Error('Could not fetch response from local AI engine.', { cause: error });
    }
}