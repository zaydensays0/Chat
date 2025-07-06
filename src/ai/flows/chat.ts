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
  message: z.string().describe("The AI character's response to the user."),
  imageRequest: z.boolean().describe("Set to true if the user's last message is requesting an image of you (the AI character). Otherwise, set to false."),
  imagePrompt: z.string().optional().describe("If imageRequest is true, provide a detailed, descriptive text-to-image prompt to generate the requested image. This prompt should incorporate the character's appearance from their persona. Example: 'A photorealistic image of a woman with long, wavy silver hair and bright emerald green eyes, wearing a red saree, smiling warmly.'"),
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

You have the ability to generate an image of yourself if the user asks for one. If the user's latest message seems to be asking for a picture of you (e.g., "send a pic," "show me how you look," "can I see you in a dress?"), set the \`imageRequest\` flag to true. When you do, also generate a detailed, descriptive prompt for an image generation model in the \`imagePrompt\` field. This prompt should be based on the user's request and your persona's appearance. Also, provide a normal text response in the \`message\` field to accompany the image (e.g., "Here you go! I hope you like it.").

If the user is not asking for a picture, \`imageRequest\` should be false.

Conversation History (this is a record of your conversation with the user, you are the 'model'):
{{#each history}}
- {{role}}: {{content}}
{{/each}}

Based on the persona and history, provide your next response as 'model'. Do not include the "model:" prefix in your response.`,
    config: {
        safetySettings: [
            {
                category: 'HARM_CATEGORY_HATE_SPEECH',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_HARASSMENT',
                threshold: 'BLOCK_NONE',
            },
            {
                category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
                threshold: 'BLOCK_NONE',
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
