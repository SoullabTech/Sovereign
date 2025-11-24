import { UnifiedResponse } from "../types/UnifiedResponse";

export interface QueryRequest {
  userId: string;
  text: string;
  element?: 'air'|'fire'|'water'|'earth'|'aether';
}

export interface IOrchestrator {
  process(q: QueryRequest): Promise<UnifiedResponse>;
}