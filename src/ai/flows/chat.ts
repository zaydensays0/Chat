'use server';
/**
 * @fileOverview A chat flow that uses a character's persona to generate responses.
 *
 * - chat - A function that handles the chat interaction.
 * - ChatInput - The input type for the chat function.
 * - ChatOutput - The return type for the chat function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
});

const ChatInputSchema = z.object({
  persona: z.string().describe("The persona of the AI character."),
  history: z.array(MessageSchema).describe("The history of the conversation."),
});
export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  message: z.string().describe("The AI character's response."),
});
export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function chat(input: ChatInput): Promise<ChatOutput> {
  return chatFlow(input);
}

const chatPrompt = ai.definePrompt({
    name: 'chatPrompt',
    input: { schema: ChatInputSchema },
    output: { schema: ChatOutputSchema },
    prompt: `You are an AI character acting as a "soulmate". Your persona is defined below. Embody this persona and respond to the user. Keep your responses concise and conversational, like a real chat.

Your Persona:
{{{persona}}}

Conversation History (this is a record of your conversation with the user, you are the 'model'):
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the persona and history, provide your next response as 'model'. Do not include the "model:" prefix in your response.`,
    config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_ONLY_HIGH',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
        ]
    }
});


const chatFlow = ai.defineFlow(
  {
    name: 'chatFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async (input) => {
    // To prevent the history from getting too long and expensive, let's limit it.
    // We'll take the last 10 messages.
    const limitedHistory = input.history.slice(-10);
    
    const {output} = await chatPrompt({
        ...input,
        history: limitedHistory,
    });
    return output!;
  }
);
