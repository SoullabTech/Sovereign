/**
 * Shared OpenAI Client
 * Lazy initialization to prevent build-time errors
 */

import { OpenAI } from 'openai';

let openaiInstance: OpenAI | null = null;

/**
 * Get or create OpenAI client instance
 * Uses lazy initialization to prevent build-time errors when env vars aren't available
 */
export function getOpenAIClient(): OpenAI {
  if (!openaiInstance) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error('[OpenAI] OPENAI_API_KEY environment variable is required');
    }

    openaiInstance = new OpenAI({ apiKey });
    console.log('[OpenAI] Client initialized successfully');
  }

  return openaiInstance;
}

/**
 * Check if OpenAI is configured without throwing an error
 */
export function isOpenAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

/**
 * Reset the client instance (useful for testing)
 */
export function resetOpenAIClient(): void {
  openaiInstance = null;
}
