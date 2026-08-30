/**
 * MAIA-TURN-RETRY-PROVENANCE-01 — a resend is re-delivery, not a new authorship
 * event.
 *
 * ⛔ THE REGRESSION THIS CLOSES, introduced by 1dd08d52f. `handleResend` sends
 * `target.text` — the member's exact prior representation — under the ORIGINAL
 * exchangeId. That commit left it unclassified, so it declared nothing and the
 * server resolved `unknown-generation`. Normally harmless: the reused
 * exchangeId means the durable writers no-op on conflict and the original row's
 * provenance stands. But when the first attempt never reached persistence, the
 * retry becomes the FIRST successful write — and recorded genuinely
 * member-authored text as generation-unknown.
 *
 * ⛔ WHY NOT SIMPLY HARDCODE THE TYPED CLASS AT THE RETRY SITE. Retry targets
 * any member turn in `messages`, including a failed VOICE turn. Declaring
 * `direct-composition` there would trade an under-claim for a fresh falsehood:
 * a spoken turn recorded as typed. The original turn's authority has to travel
 * with the turn.
 *
 * ⛔ CLASSIFYING FROM "this is a retry" WOULD BE A CATEGORY ERROR. Retry is
 * transport state. Generation is authorship state. They are different axes, and
 * the whole provenance programme exists because one such conflation
 * (`role` → generation) went unnoticed for years.
 */

import { describe, it, expect } from '@jest/globals';
import { readFileSync } from 'fs';
import { join } from 'path';
import { TurnGeneration } from '../turnGeneration';

/**
 * The replay the client performs: whatever action class the original turn
 * recorded is handed back to the server, which resolves it exactly as it did
 * the first time.
 */
const replay = (recorded: string | undefined) =>
  TurnGeneration.resolve(recorded ? { memberActionClass: recorded } : {}).generatedBy;

describe('retry replays the original turn’s generation authority', () => {
  it('a retried typed turn keeps direct-member generation', () => {
    expect(replay('direct-composition')).toBe('member-utterance');
  });

  it('a retried VOICE turn keeps transcription generation — not typed', () => {
    // The case that rules out hardcoding the typed class at the retry site.
    expect(replay('speech-transcription')).toBe('speech-transcription');
  });

  it('a retry does not become unknown merely because it is a retry', () => {
    expect(replay('direct-composition')).not.toBe('unknown-generation');
    expect(replay('speech-transcription')).not.toBe('unknown-generation');
  });

  it('a turn authored before this field existed replays as absent, and absence is unknown', () => {
    // Truthful: nothing recorded what the member did, so nothing is claimed.
    // NOT a fallback to member-utterance, which is the defect this programme
    // spent several units removing.
    expect(replay(undefined)).toBe('unknown-generation');
  });
});

/**
 * Source guards. The wiring lives inside a component too large to render here,
 * and these three lines are the whole correction — so they are pinned as text,
 * the same technique sovereignCaptureLifecycle uses for its capture-ownership
 * invariants.
 */
describe('retry wiring — source guards', () => {
  const src = readFileSync(
    join(process.cwd(), 'components/OracleConversation.tsx'),
    'utf8'
  );

  it('the member turn records the action class it was authored under', () => {
    // FAILS IF: the turn stops remembering what the member did, leaving a
    // later resend with nothing to replay.
    //
    // ⛔ Pinned to the METADATA site specifically. A bare
    // `memberActionClass: actionClass` also appears in the request payload, so
    // the loose form passed even with this recording deleted — the guard was
    // decorative until its own negative control caught it.
    expect(src).toContain(
      'metadata: { exchangeId: turnExchangeId, ...(actionClass ? { memberActionClass: actionClass } : {}) }'
    );
  });

  it('the resend replays the original turn’s class rather than declaring one', () => {
    // FAILS IF: the retry hardcodes a class (mislabelling retried voice turns)
    // or passes nothing (restoring the under-claim).
    expect(src).toContain(
      'handleTextMessage(payload, undefined, messageId, target?.metadata?.memberActionClass)'
    );
  });

  it('the resend still reuses the original exchangeId and appends no second turn', () => {
    // FAILS IF: idempotency is disturbed — a retry that mints a NEW exchangeId
    // would duplicate the member's turn rather than dedupe against it.
    expect(src).toContain('const targetMessageId = retryOf ?? `msg-${Date.now()}`');
    expect(src).toContain(
      "(retryOf ? messages.find(m => m.id === retryOf)?.metadata?.exchangeId : undefined) ||"
    );
    expect(src).toContain('setMessages(prev => markRetrying(prev, retryOf));');
  });

  it('once-per-turn side effects still do not re-run on a resend', () => {
    // FAILS IF: a retry re-fires the durable/memory side effects the original
    // turn already performed.
    expect(src).toContain('if (!retryOf) {');
  });
});
