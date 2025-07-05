'use server';

import { generateAvatar } from '@/ai/flows/generate-avatar';
import { chat, type ChatInput } from '@/ai/flows/chat';

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

export async function chatAction(input: ChatInput) {
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
