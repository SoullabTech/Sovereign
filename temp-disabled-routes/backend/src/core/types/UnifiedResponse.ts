export interface UnifiedResponse {
  id: string;
  text: string;
  voiceUrl?: string | null;
  tokens?: { prompt: number; completion: number };
  meta?: {
    element?: 'air'|'fire'|'water'|'earth'|'aether';
    evolutionary_awareness_active?: boolean;
    latencyMs?: number;
  };
}