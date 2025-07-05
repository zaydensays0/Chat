// src/ai/flows/improve-character-persona.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving a character's persona.
 *
 * It takes an initial character description as input and uses GenAI to suggest improvements,
 * providing the user with a better starting point for their character.
 *
 * @param input - The input to the improveCharacterPersona function.
 * @returns A promise that resolves to the improved character persona.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';


const ImproveCharacterPersonaInputSchema = z.object({
  initialDescription: z.string().describe('The initial description of the character.'),
});
export type ImproveCharacterPersonaInput = z.infer<typeof ImproveCharacterPersonaInputSchema>;

const ImproveCharacterPersonaOutputSchema = z.object({
  improvedDescription: z.string().describe('The improved description of the character.'),
});
export type ImproveCharacterPersonaOutput = z.infer<typeof ImproveCharacterPersonaOutputSchema>;

export async function improveCharacterPersona(input: ImproveCharacterPersonaInput): Promise<ImproveCharacterPersonaOutput> {
  return improveCharacterPersonaFlow(input);
}

const improveCharacterPersonaPrompt = ai.definePrompt({
  name: 'improveCharacterPersonaPrompt',
  input: {schema: ImproveCharacterPersonaInputSchema},
  output: {schema: ImproveCharacterPersonaOutputSchema},
  prompt: `You are an AI persona improvement assistant. Take the provided character description and improve it to make it more compelling, interesting, and well-rounded. Consider adding details about their personality, backstory, motivations, and relationships with others.  Return only the improved description.

Initial Description: {{{initialDescription}}}`,  
});

const improveCharacterPersonaFlow = ai.defineFlow(
  {
    name: 'improveCharacterPersonaFlow',
    inputSchema: ImproveCharacterPersonaInputSchema,
    outputSchema: ImproveCharacterPersonaOutputSchema,
  },
  async input => {
    const {output} = await improveCharacterPersonaPrompt(input);
    return output!;
  }
);
