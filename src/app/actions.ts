'use server';

import { generateAvatar } from '@/ai/flows/generate-avatar';

export async function generateAvatarAction(characterDescription: string) {
  if (!characterDescription.trim()) {
    return { error: 'Please provide an appearance description to generate an avatar.' };
  }
  
  try {
    const result = await generateAvatar({ characterDescription });
    if (!result.avatarDataUri) {
      return { error: 'The AI failed to generate an avatar. Please try a different description.' };
    }
    return { avatarDataUri: result.avatarDataUri };
  } catch (error) {
    console.error('Avatar generation error:', error);
    return { error: 'An unexpected error occurred while generating the avatar. Please try again later.' };
  }
}
