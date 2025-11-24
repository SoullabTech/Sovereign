export interface Turn { role: 'user'|'assistant'; text: string; ts: number; }
export interface Session { userId: string; turns: Turn[]; }

export interface IMemory {
  getSession(userId: string): Promise<Session | null>;
  append(userId: string, turn: Turn): Promise<void>;
}