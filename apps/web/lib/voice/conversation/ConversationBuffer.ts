// FRONTEND
// lib/voice/conversation/ConversationBuffer.ts
export type Turn = {
  role: "user" | "maia";
  text: string;
  t0: number; // ms epoch
};

export class ConversationBuffer {
  private windowMs = 30_000;
  private turns: Turn[] = [];

  add(turn: Turn) {
    this.turns.push(turn);
    this.gc();
  }

  recentText(maxChars = 800): string {
    this.gc();
    const s = this.turns.map(t => `${t.role === "user" ? "User" : "Maia"}: ${t.text}`).join("\n");
    return s.length > maxChars ? s.slice(-maxChars) : s;
  }

  private gc() {
    const now = Date.now();
    this.turns = this.turns.filter(t => now - t.t0 <= this.windowMs);
  }
}
