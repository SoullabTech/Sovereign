// lib/types/ai.ts
// AI-related type definitions

export interface AIResponse {
  content: string;
  element?: string;
  energy?: string;
  metadata?: {
    model?: string;
    temperature?: number;
    tokens?: number;
    timestamp?: Date;
  };
}

export interface AIContext {
  userId?: string;
  sessionId?: string;
  history?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  element?: string;
  mood?: string;
}

export interface AIOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  stream?: boolean;
}