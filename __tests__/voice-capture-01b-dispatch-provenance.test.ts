/**
 * VOICE-CAPTURE-01B-OBS — the dispatch-provenance instrumentation contract.
 *
 * WHAT THIS PROTECTS
 * ------------------
 * The lane exists because `processAccumulatedTranscript()` looked like the
 * send boundary and is not. A census of 64c2b7c07 found EIGHT live
 * `onTranscript(...)` call sites in `ContinuousConversation.tsx`, of which
 * exactly one sits behind the two dedup guards. Seven can dispatch a turn the
 * guards never evaluate.
 *
 * The instrument only answers "which boundary produced this turn?" if EVERY
 * boundary is witnessed. One unwitnessed site does not degrade the evidence —
 * it inverts it: a duplicate produced there shows up in the log as a single
 * dispatch, which reads as "dedup worked" and would close the lane wrongly.
 *
 * So the load-bearing assertion here is the second one: every `onTranscript(`
 * invocation must be immediately preceded by a `witnessDispatch(` call. A new
 * send path added later cannot become invisible by omission — the failure mode
 * that produced this lane in the first place.
 *
 * SOURCE-READ, NOT BEHAVIOURAL — same rationale as
 * `voice-capture-01a-latch-release.test.ts`: the component cannot mount
 * without a live SpeechRecognition instance, a MediaStream and a running
 * conversation, so simulating it to observe a log line would test the
 * simulation. The pure counter is unit-tested separately below.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  recordDispatch,
  resetDispatchProvenance,
} from '../lib/voice/dispatchProvenance';

const ROOT = join(__dirname, '..');
const COMPONENT = join(ROOT, 'components/voice/ContinuousConversation.tsx');
const EMITTER = join(ROOT, 'lib/voice/voiceDiagnostics.ts');
const RECEIVER = join(ROOT, 'app/api/telemetry/client/route.ts');

const source = readFileSync(COMPONENT, 'utf8');

/** Line-split once; several assertions walk it. */
const lines = source.split('\n');

describe('VOICE-CAPTURE-01B-OBS — dedup guards are server-visible', () => {
  it('emits voice_dedup_blocked from BOTH dedup guards', () => {
    const emissions = source.match(/logVoiceEvent\('voice_dedup_blocked'/g) ?? [];
    // Two guards: Check 1 (exact, 2s window) and Check 2 (fuzzy, 1s window).
    expect(emissions).toHaveLength(2);

    // And each names which one it is, so the log distinguishes an exact hit
    // from a 0.91 near-miss rather than collapsing both into "blocked".
    expect(source).toContain("dedupKind: 'exact'");
    expect(source).toContain("dedupKind: 'fuzzy'");
  });

  it('carries similarity on the fuzzy guard only', () => {
    const fuzzyAt = source.indexOf("dedupKind: 'fuzzy'");
    const exactAt = source.indexOf("dedupKind: 'exact'");
    expect(fuzzyAt).toBeGreaterThan(-1);
    expect(exactAt).toBeGreaterThan(-1);

    // The fuzzy emission block runs to its closing `});`.
    const fuzzyBlock = source.slice(fuzzyAt, source.indexOf('});', fuzzyAt));
    expect(fuzzyBlock).toContain('similarity:');

    const exactBlock = source.slice(exactAt, source.indexOf('});', exactAt));
    expect(exactBlock).not.toContain('similarity:');
  });
});

describe('VOICE-CAPTURE-01B-OBS — every send boundary is witnessed', () => {
  /**
   * Live `onTranscript(...)` INVOCATIONS — not the prop declaration, the
   * destructure, the ref assignment, or a dependency-array mention.
   * `onTranscriptSalvage` is a different callback and is excluded by the
   * word boundary.
   */
  function invocationLineNumbers(): number[] {
    const hits: number[] = [];
    lines.forEach((line, i) => {
      // `onTranscript(` preceded by nothing word-ish, i.e. not
      // `onTranscriptSalvage(`; and not the optional-call `onTranscript?.(`
      // form, which does not appear today but would still be an invocation.
      // Comments mention the callback by name (this file's own header does).
      // Scanning them would fail the contract on prose.
      const trimmed = line.trim();
      if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return;
      if (!/(^|[^A-Za-z0-9_])onTranscript\??\(/.test(line)) return;
      // Skip the `if (onTranscript && ...)` truthiness guard — it is a
      // reference, not a call. It always contains ` && `.
      if (/if\s*\(\s*onTranscript\s*&&/.test(line)) return;
      hits.push(i);
    });
    return hits;
  }

  it('finds the send boundaries non-trivially', () => {
    // Guards the test itself: a regex that matched nothing would make the
    // contract below vacuously true. The 64c2b7c07 census found 8.
    expect(invocationLineNumbers().length).toBeGreaterThanOrEqual(8);
  });

  it('precedes EVERY onTranscript invocation with a witnessDispatch call', () => {
    const unwitnessed: string[] = [];

    for (const lineNo of invocationLineNumbers()) {
      // The witness must be immediately before. Allow a small lookback so a
      // formatter wrapping the witness call across lines does not fail this,
      // but not so much that an unrelated earlier witness could satisfy it.
      const window = lines.slice(Math.max(0, lineNo - 6), lineNo).join('\n');
      if (!window.includes('witnessDispatch(')) {
        unwitnessed.push(`line ${lineNo + 1}: ${lines[lineNo].trim()}`);
      }
    }

    // Failure names the offending call site rather than an opaque count, so
    // whoever adds the ninth send path is told exactly where to put its
    // witness.
    expect(unwitnessed).toEqual([]);
  });

  it('witnesses each boundary with a distinct source label', () => {
    const labels = (source.match(/witnessDispatch\(\s*'([a-z_]+)'/g) ?? [])
      .map((m) => m.replace(/.*'([a-z_]+)'.*/, '$1'));

    // A copy-pasted witness that kept the previous site's label would make two
    // different boundaries indistinguishable in the log — the exact confusion
    // this instrument exists to remove.
    expect(new Set(labels).size).toBe(labels.length);
    expect(labels).toContain('process_accumulated');
  });
});

describe('VOICE-CAPTURE-01B-OBS — no transcript content is emitted', () => {
  /**
   * The privacy floor. Both events carry counts, booleans, ids and
   * millisecond deltas. A field whose VALUE is a transcript variable would
   * put member speech into `docker logs`.
   */
  it('emits no transcript-bearing field from either event', () => {
    const forbiddenValue = /(transcript|finalTranscript|text|body)\s*,?\s*$/;

    for (const event of ['voice_dedup_blocked', 'voice_transcript_dispatched']) {
      let cursor = 0;
      for (;;) {
        const at = source.indexOf(`logVoiceEvent('${event}'`, cursor);
        if (at === -1) break;
        const block = source.slice(at, source.indexOf('});', at));

        // Any `key: value` pair whose value is a raw transcript variable.
        const offenders = block
          .split('\n')
          .filter((l) => /:\s*(transcript|finalTranscript|text|body)\s*,?\s*$/.test(l));
        expect(offenders).toEqual([]);

        // `.length` / `charCount` are the permitted shape.
        expect(forbiddenValue.test(block.split('\n')[0])).toBe(false);
        cursor = at + 1;
      }
    }
  });

  it('returns only counts and booleans from the provenance recorder', () => {
    resetDispatchProvenance();
    const p = recordDispatch('hello there', 1_000);
    // Exhaustive: if a future field carries text, this fails rather than
    // silently widening what reaches the log.
    expect(Object.keys(p).sort()).toEqual([
      'charCount',
      'dispatchId',
      'msSincePrevious',
      'sameAsPrevious',
    ]);
    for (const v of Object.values(p)) {
      expect(['number', 'boolean']).toContain(typeof v);
    }
  });
});

describe('VOICE-CAPTURE-01B-OBS — receiver admits both events', () => {
  it('declares them in the emitter union AND the server allowlist', () => {
    const emitter = readFileSync(EMITTER, 'utf8');
    const receiver = readFileSync(RECEIVER, 'utf8');
    for (const event of ['voice_dedup_blocked', 'voice_transcript_dispatched']) {
      // An event the client can emit but the server drops produces an empty
      // log and a 204 — indistinguishable from "the guard never fired."
      expect(emitter).toContain(`'${event}'`);
      expect(receiver).toContain(`'${event}'`);
    }
  });
});

describe('dispatchProvenance — the comparison itself', () => {
  beforeEach(() => resetDispatchProvenance());

  it('numbers dispatches monotonically from 1', () => {
    expect(recordDispatch('a', 0).dispatchId).toBe(1);
    expect(recordDispatch('b', 0).dispatchId).toBe(2);
    expect(recordDispatch('c', 0).dispatchId).toBe(3);
  });

  it('reports the first dispatch as sameAsPrevious=false, msSincePrevious=-1', () => {
    const first = recordDispatch('hello', 5_000);
    expect(first.sameAsPrevious).toBe(false);
    expect(first.msSincePrevious).toBe(-1);
  });

  it('detects a repeat regardless of case and spacing', () => {
    recordDispatch('Hello  there', 1_000);
    const second = recordDispatch('hello there', 1_400);
    expect(second.sameAsPrevious).toBe(true);
    expect(second.msSincePrevious).toBe(400);
  });

  it('reports a repeat OUTSIDE the dedup window — CASE 2', () => {
    // The whole point: the 2s guard would not have blocked this, so without
    // the boolean the log could not say the two turns were the same words.
    recordDispatch('what did you mean', 1_000);
    const second = recordDispatch('what did you mean', 9_000);
    expect(second.sameAsPrevious).toBe(true);
    expect(second.msSincePrevious).toBe(8_000);
  });

  it('does not call two different utterances the same', () => {
    recordDispatch('first thing', 1_000);
    expect(recordDispatch('second thing', 1_100).sameAsPrevious).toBe(false);
  });

  it('never reports an empty transcript as a repeat of an empty one', () => {
    recordDispatch('', 1_000);
    // Two empties are not evidence of duplication; treating them as a repeat
    // would manufacture CASE 2 rows out of no speech at all.
    expect(recordDispatch('', 1_100).sameAsPrevious).toBe(false);
  });

  it('clears comparison state across mic engagements', () => {
    recordDispatch('same words', 1_000);
    resetDispatchProvenance();
    const afterReset = recordDispatch('same words', 2_000);
    expect(afterReset.dispatchId).toBe(1);
    expect(afterReset.sameAsPrevious).toBe(false);
    expect(afterReset.msSincePrevious).toBe(-1);
  });
});
