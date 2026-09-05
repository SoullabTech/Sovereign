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

export type SectionStatus =
  | 'clean'
  /** Local text not yet sent. Takes precedence over `saving`: when a section
      has both an in-flight snapshot and a newer edit waiting, the newer text is
      what the member sees, and calling that `saving` would claim the visible
      words are on their way when they are not. */
  | 'dirty'
  | 'saving'
  /** The draft moved elsewhere. LATCHED — see `conflicted` below. */
  | 'conflict'
  /** The save's outcome is unknown: unreachable, timed out. Different truth
      from `conflict`, and never to be reported as "changed elsewhere" because
      Wi-Fi dropped. */
  | 'error';

export interface QueueState {
  version: number;
  /** Sections with text not yet known to be on the server. */
  pending: string[];
  inFlight: string | null;
  conflicted: string[];
  errored: string[];
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
  /** Version conflicts. Latched: further typing updates the preserved body but
      does not clear this or dispatch again. Reconciling two versions is a
      member act, and another keystroke is not one. */
  private conflicted = new Set<string>();
  /** Failed-but-unknown saves. Not latched: a retry is safe because the server
      still version-checks it — if the lost save did commit, the retry comes
      back a conflict, which is the truth. */
  private errored = new Set<string>();
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
    /* Typing does NOT resolve a conflict. The body is preserved and updated,
       but the section stays latched until the member has seen the other
       version and chosen — see takeLocalVersion / discardLocalVersion. */
    this.errored.delete(sectionId);
    this.emit();
    if (!this.conflicted.has(sectionId)) void this.pump();
  }

  /** The text the UI must show for a section, or null to use the server copy. */
  localBody(sectionId: string): string | null {
    /* PENDING WINS. A section can hold both an in-flight snapshot and a newer
       edit made while that save was open. Returning the in-flight body would
       hand the UI the older text — from the very method that exists to stop
       stale text reaching the screen. */
    const pending = this.pending.get(sectionId);
    if (pending) return pending.body;
    if (this.inFlight?.sectionId === sectionId) return this.inFlight.body;
    return null;
  }

  statusOf(sectionId: string): SectionStatus {
    if (this.conflicted.has(sectionId)) return 'conflict';
    /* dirty before saving, matching localBody: the status describes the text
       the member can see, not the one on the wire. */
    if (this.pending.has(sectionId)) return this.errored.has(sectionId) ? 'error' : 'dirty';
    if (this.inFlight?.sectionId === sectionId) return 'saving';
    return 'clean';
  }

  /** True while any text is unsaved — what a leave-the-page guard asks. */
  hasUnsavedWork(): boolean {
    return this.pending.size > 0 || this.inFlight !== null || this.conflicted.size > 0;
  }

  /**
   * The member has seen the other version and chose to keep theirs.
   *
   * Requires the version the server is actually at, which the caller can only
   * have by reloading — so this cannot be reached without the comparison
   * having been possible. Overwriting the other device's change is then a
   * decision someone made, not something a keystroke caused.
   */
  takeLocalVersion(sectionId: string, serverVersion: number): void {
    if (!this.conflicted.delete(sectionId)) return;
    this.version = serverVersion;
    this.emit();
    void this.pump();
  }

  /** The member has seen the other version and chose to drop their own text. */
  discardLocalVersion(sectionId: string, serverVersion: number): void {
    this.conflicted.delete(sectionId);
    this.pending.delete(sectionId);
    this.version = serverVersion;
    this.emit();
  }

  state(): QueueState {
    return {
      version: this.version,
      pending: [...this.pending.values()].sort((a, b) => a.sequence - b.sequence).map((e) => e.sectionId),
      inFlight: this.inFlight?.sectionId ?? null,
      conflicted: [...this.conflicted],
      errored: [...this.errored],
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
          outcome = { ok: false, refusal: 'error' };
        }

        this.inFlight = null;
        if (outcome.ok && typeof outcome.version === 'number') {
          this.version = outcome.version;
        } else {
          /* Refused. The body goes back to pending so it is never lost — and
             a newer edit made while this was open is NOT overwritten by the
             older snapshot coming back. */
          if (!this.pending.has(next.sectionId)) {
            this.pending.set(next.sectionId, next);
          }
          /* Two different truths. A version conflict LATCHES: re-sending
             against a newer version is how one device silently overwrites
             another, so only an explicit member decision moves it. An unknown
             outcome does not latch: retrying is safe because the server still
             version-checks, and if the lost save did commit the retry returns
             a conflict, which is then the honest answer. */
          if (outcome.refusal === 'stale_base') this.conflicted.add(next.sectionId);
          else this.errored.add(next.sectionId);
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
