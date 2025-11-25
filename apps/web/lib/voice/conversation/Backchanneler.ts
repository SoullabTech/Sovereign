// FRONTEND
// lib/voice/conversation/Backchanneler.ts
type SpeakFn = (text: string, opts?: { style?: "calm" | "bright" | "concerned" }) => void;

export class Backchanneler {
  private lastAck = 0;
  private perTurnAcks = 0;
  private readonly minBetweenAcksMs = 3500;
  private readonly maxPerTurn = 2;
  private speak: SpeakFn;

  private fillers = {
    neutral: ["mm-hm.", "yeah.", "I'm here.", "okay."],
    warm: ["got you.", "I hear you.", "with you.", "go on."],
    concerned: ["I'm listening.", "I've got you.", "take your time."],
  };

  constructor(speak: SpeakFn) {
    this.speak = speak;
  }

  resetTurn() { this.perTurnAcks = 0; }

  maybeAck(signal: { interimLen: number; userPausedMs: number; mood: "neutral"|"warm"|"concerned" }) {
    const now = Date.now();
    if (now - this.lastAck < this.minBetweenAcksMs) return;
    if (this.perTurnAcks >= this.maxPerTurn) return;
    if (signal.interimLen < 40 && signal.userPausedMs < 600) return;

    const set = this.fillers[signal.mood] ?? this.fillers.neutral;
    const say = set[Math.floor(Math.random() * set.length)];
    this.speak(say, { style: signal.mood === "concerned" ? "concerned" : "calm" });
    this.lastAck = now;
    this.perTurnAcks++;
  }
}
