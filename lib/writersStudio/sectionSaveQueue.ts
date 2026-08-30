/**
 * WS2-04B — the draft-level save queue.
 *
 * This is the one place in the writing surface where a bug is DATA LOSS rather
 * than a visual defect, so it is a pure state machine with the network
 * injected, and it is tested against the races rather than the calm path.
 *
 * THE RACE IT EXISTS FOR. Section saves are version-checked at the draft
 * level, so two in flight at once cannot both be built on the same version:
 *
 *     version 12
 *     edit A → save A(base 12) in flight
 *     switch to B, edit B → save B(base 12) in flight
 *     A commits → version 13
 *     B arrives → stale_base
 *
 * B's text is not wrong. It was merely built on a number that moved while it
 * waited. So saves are SERIALIZED at the draft level: one in flight, the rest
 * queued with their own section id and body snapshot.
 *
 * ONE DEPARTURE FROM THE SPEC AS WRITTEN, and it is the point of the whole
 * mechanism. `baseVersion` cannot be captured when a save is ENQUEUED — that
 * reproduces the race it is meant to prevent, since B would still be holding
 * 12 when A advances the draft to 13. It is captured at DISPATCH, from the
 * version the previous save returned. sectionId, body snapshot and sequence
 * are captured at enqueue and never change; baseVersion is the one field that
 * must be read late, because serialization is precisely what makes a late read
 * correct.
 *
 * WHAT IT NEVER DOES. It never discards a body. A refused save keeps its text
 * dirty and pending; nothing is retried automatically past a conflict, because
 * re-sending with a newer version is how one device silently overwrites
 * another. And a section with unsaved or in-flight work is never repopulated
 * from a server snapshot — the local text stays authoritative until its own
 * save resolves.
 */

export interface SaveOutcome {
  ok: boolean;
  /** The draft version after a successful save. */
  version?: number;
  /** e.g. 'stale_base'. Present when ok is false. */
  refusal?: string;
}

/** The network call. Injected so the queue is testable without a server. */
export type SaveFn = (
  sectionId: string,
  body: string,
  baseVersion: number,
) => Promise<SaveOutcome>;

export type SectionStatus = 'clean' | 'dirty' | 'saving' | 'conflict';

export interface QueueState {
  version: number;
  /** Sections with text not yet known to be on the server. */
  pending: string[];
  inFlight: string | null;
  conflicted: string[];
}

interface PendingEntry {
  sectionId: string;
  body: string;
  sequence: number;
}

export class SectionSaveQueue {
  private version: number;
  private readonly save: SaveFn;
  /** Insertion-ordered: a Map preserves the order sections were first dirtied. */
  private pending = new Map<string, PendingEntry>();
  private inFlight: PendingEntry | null = null;
  private conflicted = new Set<string>();
  private seq = 0;
  private running = false;
  private listeners: (() => void)[] = [];

  constructor(initialVersion: number, save: SaveFn) {
    this.version = initialVersion;
    this.save = save;
  }

  onChange(fn: () => void): () => void {
    this.listeners.push(fn);
    return () => { this.listeners = this.listeners.filter((l) => l !== fn); };
  }
  private emit() { for (const l of this.listeners) l(); }

  /**
   * Record an edit. Coalesces per section: typing into A twice before A is
   * dispatched leaves ONE pending save carrying the later text, which is what
   * the member means. Order between different sections is preserved.
   */
  enqueue(sectionId: string, body: string): void {
    const existing = this.pending.get(sectionId);
    this.pending.set(sectionId, {
      sectionId,
      body,
      /* Keep the original sequence so a section that has been waiting does not
         lose its place by being typed into again. */
      sequence: existing ? existing.sequence : this.seq++,
    });
    /* Editing a conflicted section is the member resolving it by hand. */
    this.conflicted.delete(sectionId);
    this.emit();
    void this.pump();
  }

  /** The text the UI must show for a section, or null to use the server copy. */
  localBody(sectionId: string): string | null {
    if (this.inFlight?.sectionId === sectionId) return this.inFlight.body;
    return this.pending.get(sectionId)?.body ?? null;
  }

  statusOf(sectionId: string): SectionStatus {
    if (this.inFlight?.sectionId === sectionId) return 'saving';
    if (this.conflicted.has(sectionId)) return 'conflict';
    if (this.pending.has(sectionId)) return 'dirty';
    return 'clean';
  }

  /** True while any text is unsaved — what a leave-the-page guard asks. */
  hasUnsavedWork(): boolean {
    return this.pending.size > 0 || this.inFlight !== null || this.conflicted.size > 0;
  }

  state(): QueueState {
    return {
      version: this.version,
      pending: [...this.pending.values()].sort((a, b) => a.sequence - b.sequence).map((e) => e.sectionId),
      inFlight: this.inFlight?.sectionId ?? null,
      conflicted: [...this.conflicted],
    };
  }

  /** Resolves when the queue has nothing left in flight or waiting. */
  async settled(): Promise<void> {
    while (this.running) await this.currentRun;
  }
  private currentRun: Promise<void> = Promise.resolve();

  private async pump(): Promise<void> {
    if (this.running) return;
    this.running = true;
    this.currentRun = this.drain();
    await this.currentRun;
  }

  private async drain(): Promise<void> {
    try {
      for (;;) {
        const next = [...this.pending.values()].sort((a, b) => a.sequence - b.sequence)[0];
        if (!next) return;
        this.pending.delete(next.sectionId);
        this.inFlight = next;
        this.emit();

        let outcome: SaveOutcome;
        try {
          /* baseVersion read HERE, not at enqueue — see the header. */
          outcome = await this.save(next.sectionId, next.body, this.version);
        } catch {
          outcome = { ok: false, refusal: 'network' };
        }

        this.inFlight = null;
        if (outcome.ok && typeof outcome.version === 'number') {
          this.version = outcome.version;
        } else {
          /* Refused. The body goes back to pending so it is never lost — but
             a version conflict is NOT retried: re-sending against a newer
             version is how one device silently overwrites another. Only the
             member editing it again (or an explicit resolution) moves it. */
          if (!this.pending.has(next.sectionId)) {
            this.pending.set(next.sectionId, next);
          }
          this.conflicted.add(next.sectionId);
          this.emit();
          return;
        }
        this.emit();
      }
    } finally {
      this.running = false;
    }
  }
}
