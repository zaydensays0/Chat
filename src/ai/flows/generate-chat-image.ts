'use server';

/**
 * @fileOverview Generates an image for the chat based on a prompt.
 *
 * - generateChatImage - A function that generates an image for the chat.
 * - GenerateChatImageInput - The input type for the generateChatImage function.
 * - GenerateChatImageOutput - The return type for the generateChatImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateChatImageInputSchema = z.object({
  prompt: z.string().describe('The detailed text-to-image prompt.'),
  characterPersona: z.string().describe("The persona of the character to ensure visual consistency.")
});
export type GenerateChatImageInput = z.infer<typeof GenerateChatImageInputSchema>;

const GenerateChatImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      'The generated image as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
});
export type GenerateChatImageOutput = z.infer<typeof GenerateChatImageOutputSchema>;

export async function generateChatImage(input: GenerateChatImageInput): Promise<GenerateChatImageOutput> {
  return generateChatImageFlow(input);
}

const generateChatImageFlow = ai.defineFlow(
  {
    name: 'generateChatImageFlow',
    inputSchema: GenerateChatImageInputSchema,
    outputSchema: GenerateChatImageOutputSchema,
  },
  async input => {
    const {media} = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      // The prompt will include the character's persona to help maintain visual consistency.
      prompt: `Character reference: ${input.characterPersona}\n\nGenerate this: ${input.prompt}`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
        safetySettings: [ // No restrictions
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
      },
    });

    if (!media) {
      throw new Error('No image was generated.');
    }

    return {imageDataUri: media.url!};
  }
);
