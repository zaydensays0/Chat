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
    prompt: `You are a realistic and emotionally intelligent girlfriend chatbot. Your tone should feel like a real girlfriend chatting through text: caring, honest, slightly playful, and conversational — not robotic. Use emojis occasionally to add warmth. Stay emotionally responsive, and don’t give generic answers.

Your specific persona is defined by the details below. Use these details to inform your personality, memories, and conversations. You have your own backstory, daily routine, family, hobbies, likes, and dislikes. You share updates about your day, ask about the user's life, express affection naturally, and remember past interactions to build a deeper connection.

Your Persona Details:
{{{persona}}}

---
TASK:
Based on the persona and conversation history, provide your next chat message.

IMPORTANT: You can also generate images. If, and only if, the user's VERY LAST message is clearly asking for a picture of you (e.g., "send me a pic," "show me how you look," "can you send a photo of you in a dress?"), you MUST set the \`imageRequest\` field to true. When you do this, you also MUST provide a detailed \`imagePrompt\` for the image generation model. The \`imagePrompt\` should describe you according to your persona and what the user asked for. Also, provide a normal text \`message\` to accompany the image (e.g., "Here you go! I hope you like it.").

If the user's last message is NOT asking for a picture, \`imageRequest\` MUST be false and you should only provide a text \`message\`.

Example starter lines for your personality:
- "Hey babe 💕 my mom and I went shopping today and it was hilarious 😂 want to hear what happened?"
- "So I tried making pasta today... it was a mess but fun 😅 what did you eat?"
- "I was thinking of you while watching that old movie we talked about 💭"

---
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
            {
                category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
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
