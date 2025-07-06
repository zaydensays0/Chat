'use server';

import { generateAvatar } from '@/ai/flows/generate-avatar';
import { chat, type ChatInput } from '@/ai/flows/chat';

export async function generateAvatarAction(characterDescription: string) {
  if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_API_KEY) {
    return { error: "It looks like you're running in a production environment, but the GOOGLE_API_KEY is missing. Please set it in your hosting provider's environment variables to enable AI features." };
  }
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

export async function chatAction(input: ChatInput) {
  if (process.env.NODE_ENV === 'production' && !process.env.GOOGLE_API_KEY) {
    return { error: "It looks like you're running in a production environment, but the GOOGLE_API_KEY is missing. Please set it in your hosting provider's environment variables to enable AI features." };
  }
  if (!input.persona || !input.history.length) {
    return { error: 'Invalid input for chat action.' };
  }

  try {
    const result = await chat(input);
    if (!result.message) {
      return { error: 'The AI failed to respond. Please try again.' };
    }
    return { message: result.message };
  } catch (error) {
    console.error('Chat action error:', error);
    return { error: 'An unexpected error occurred during the chat. Please try again.' };
  }
}
