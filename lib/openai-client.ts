/**
 * Shared OpenAI Client
 *
 * Lazy initialization to prevent build-time errors when OPENAI_API_KEY is not set.
 * Use this instead of `new OpenAI()` directly in API routes.
 */

import OpenAI from 'openai';

let openaiInstance: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    openaiInstance = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || '',
    });
  }
  return openaiInstance;
}
