/**
 * Receiver-vocabulary contract.
 *
 * The client emits voice diagnostics from `lib/voice/voiceDiagnostics.ts`.
 * The server admits them via a hand-written allowlist in
 * `app/api/telemetry/client/route.ts`. Two vocabularies, no linkage.
 *
 * On 2026-08-26 that gap was load-bearing: 17 events across four witness
 * families shipped to production emitting correctly, and every one of them
 * was discarded at the allowlist check. The client `fetch` resolved. The
 * server returned 204 — the same status as an accepted event. Nothing
 * reported a rejection anywhere, so a device session would have produced an
 * empty log and been read as "capture is silent" rather than "the receiver
 * does not know these words."
 *
 * This test makes that specific failure impossible: an event that can be
 * emitted must be admissible, or be named here as deliberately local-only.
 *
 * Source-parsing rather than importing, deliberately — `route.ts` is a
 * Next.js App Router handler whose permitted exports are constrained, so
 * exporting the allowlist for the test to read is not free.
 */

import fs from 'fs';
import path from 'path';

const REPO = path.resolve(__dirname, '../../..');
const EMITTER = path.join(REPO, 'lib/voice/voiceDiagnostics.ts');
const RECEIVER = path.join(REPO, 'app/api/telemetry/client/route.ts');

/**
 * Events the client may emit but the server deliberately does not admit.
 * Adding a name here is a decision to keep an event browser-console-only;
 * it must carry a reason. Empty is the correct steady state.
 */
const INTENTIONALLY_LOCAL_ONLY: ReadonlyMap<string, string> = new Map();

function stripComments(src: string): string {
  return src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
}

function quotedNames(block: string): string[] {
  return Array.from(new Set((block.match(/'[a-z0-9_]+'/g) ?? []).map((q) => q.slice(1, -1))));
}

// Comments are stripped BEFORE the block is located, not after: the union's
// own prose contains `;`, which truncated the slice at the first comment and
// silently yielded 8 of 40 events. The non-triviality assertion below caught it.
function emittedEvents(): string[] {
  const src = stripComments(fs.readFileSync(EMITTER, 'utf-8'));
  const start = src.indexOf('export type VoiceDiagEvent =');
  expect(start).toBeGreaterThan(-1);
  const end = src.indexOf(';', start);
  expect(end).toBeGreaterThan(start);
  return quotedNames(src.slice(start, end));
}

function admittedEvents(): string[] {
  const src = stripComments(fs.readFileSync(RECEIVER, 'utf-8'));
  const start = src.indexOf('const ALLOWED_EVENTS = new Set([');
  expect(start).toBeGreaterThan(-1);
  const end = src.indexOf('] as const);', start);
  expect(end).toBeGreaterThan(start);
  return quotedNames(src.slice(start, end));
}

describe('voice telemetry receiver vocabulary', () => {
  it('parses both vocabularies non-trivially', () => {
    // Guards the test itself: a regex that silently matched nothing would
    // make the contract below vacuously true.
    expect(emittedEvents().length).toBeGreaterThan(30);
    expect(admittedEvents()).toContain('redirect_loop_detected');
  });

  it('admits every event the client can emit', () => {
    const admitted = new Set(admittedEvents());
    const dropped = emittedEvents()
      .filter((e) => !admitted.has(e))
      .filter((e) => !INTENTIONALLY_LOCAL_ONLY.has(e));

    expect({
      count: dropped.length,
      silentlyDropped: dropped,
    }).toEqual({ count: 0, silentlyDropped: [] });
  });

  it('keeps the local-only exemption list honest', () => {
    // An exemption for an event that is no longer emitted is stale scaffolding.
    const emitted = new Set(emittedEvents());
    for (const [event, reason] of INTENTIONALLY_LOCAL_ONLY) {
      expect(emitted.has(event)).toBe(true);
      expect(reason.length).toBeGreaterThan(10);
    }
  });
});
