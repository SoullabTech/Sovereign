import { IMemory, Session, Turn } from "../../core/interfaces/IMemory";

export class InMemoryMemory implements IMemory {
  private store = new Map<string, Session>();
  async getSession(userId: string) { return this.store.get(userId) ?? null; }
  async append(userId: string, turn: Turn) {
    const s = this.store.get(userId) ?? { userId, turns: [] };
    s.turns.push(turn);
    if (s.turns.length > 1000) s.turns.shift();
    this.store.set(userId, s);
  }
}