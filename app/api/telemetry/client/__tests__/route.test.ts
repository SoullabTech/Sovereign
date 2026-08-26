/**
 * VOICE-02B — telemetry receiver admission.
 *
 * THE REGRESSION THIS LOCKS
 * -------------------------
 * The receiver keeps a strict `ALLOWED_EVENTS` set and answers an unknown event
 * with the SAME `204` it gives an accepted one. That ambiguity is deliberate —
 * telemetry must never block user flow — but it means a missing allowlist entry
 * is INVISIBLE from the client and invisible in `docker logs`: the event simply
 * never appears.
 *
 * At fc3497bce all 17 witness events shipped in #1096/#1098/#1099/#1100/#1101
 * were being emitted by the client and dropped at this gate. A soak run against
 * that build would have produced silence on exactly the questions those units
 * were built to answer — and that silence would have read as "mechanism not
 * observed" rather than "mechanism not observable."
 *
 * SO THESE TESTS DO NOT ASSERT THE STATUS CODE.
 * A test that says "POST returned 204" proves nothing here; 204 is what both
 * outcomes return. The load-bearing assertion is whether the event reached
 * `[client-telemetry]` on console.log. That is the actual admission boundary,
 * and it is the only thing a soak reader can see.
 */
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { NextRequest } from 'next/server';
import { POST } from '../route';

/** The 17 admitted by VOICE-02B. Listed literally: a test that derived this
 *  from the route's own set would pass no matter what the set contained. */
const WITNESS_EVENTS = [
  // capture liveness (#1096)
  'voice_status_surfaced',
  'voice_transcript_salvaged',
  'voice_capture_lost',
  'voice_track_listeners_attached',
  // playback witness (#1098)
  'voice_playback_started',
  'voice_playback_interrupted',
  'voice_playback_retry',
  'voice_playback_resumed',
  'voice_playback_ended',
  'voice_playback_failed',
  // V5 utterance-tail (#1099 / #1100 / #1101)
  'voice_result_interim',
  'voice_result_final',
  'voice_silence_timer_armed',
  'voice_silence_timer_fired',
  'voice_turn_commit_requested',
  'voice_turn_committed',
  'voice_result_after_commit',
] as const;

let logSpy: jest.SpiedFunction<typeof console.log>;

beforeEach(() => {
  delete process.env.CAPACITOR_BUILD;
  logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
});
afterEach(() => logSpy.mockRestore());

function post(body: unknown): NextRequest {
  return new NextRequest('https://soullab.life/api/telemetry/client', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-member-id': 'member-1' },
    body: JSON.stringify(body),
  });
}

/** The logged record, or null when the event never reached console.log. */
function loggedRecord(): Record<string, unknown> | null {
  const call = logSpy.mock.calls.find((c) => c[0] === '[client-telemetry]');
  return call ? JSON.parse(String(call[1])) : null;
}

describe('admission — each witness event must REACH the log, not merely return 204', () => {
  it.each(WITNESS_EVENTS)('admits %s', async (event) => {
    await POST(post({ event, path: '/maia', metadata: { session: 'abc123' } }));
    const rec = loggedRecord();
    expect(rec).not.toBeNull();
    expect(rec!.event).toBe(event);
  });
});

describe('the gate still holds — admission is not a widening', () => {
  it('drops an unknown event WITHOUT logging, and still answers 204', async () => {
    const res = await POST(post({ event: 'voice_totally_made_up', metadata: {} }));
    expect(res.status).toBe(204);
    expect(loggedRecord()).toBeNull();
  });

  it('drops a near-miss name — a typo must not be admitted by prefix', async () => {
    await POST(post({ event: 'voice_playback_start' })); // no trailing "ed"
    expect(loggedRecord()).toBeNull();
  });

  it('drops a payload with no event at all', async () => {
    const res = await POST(post({ metadata: { session: 'abc123' } }));
    expect(res.status).toBe(204);
    expect(loggedRecord()).toBeNull();
  });

  it('survives a malformed body without throwing', async () => {
    const req = new NextRequest('https://soullab.life/api/telemetry/client', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: 'not json',
    });
    await expect(POST(req)).resolves.toMatchObject({ status: 204 });
    expect(loggedRecord()).toBeNull();
  });
});

describe('attribution — Step 0 depends on metadata.session surviving', () => {
  it('carries metadata.session through into the logged record', async () => {
    await POST(post({
      event: 'voice_result_final',
      path: '/maia',
      metadata: { session: 'r03jxcim', ua: 'Mozilla/5.0 Safari/605', chars: 42 },
    }));
    const rec = loggedRecord();
    expect(rec).not.toBeNull();
    // Without `session`, a busy production box cannot separate the test
    // device's silence from another member's traffic, and Step 0 cannot
    // prove the pipe for THIS device.
    expect((rec!.metadata as Record<string, unknown>).session).toBe('r03jxcim');
    expect((rec!.metadata as Record<string, unknown>).ua).toBe('Mozilla/5.0 Safari/605');
    expect((rec!.metadata as Record<string, unknown>).chars).toBe(42);
  });

  it('preserves numeric and boolean witness metadata unchanged', async () => {
    await POST(post({
      event: 'voice_recognition_ended',
      metadata: { session: 's1', tailAtRisk: true, interimCharCount: 37, msSinceLastFinal: -1 },
    }));
    const md = loggedRecord()!.metadata as Record<string, unknown>;
    expect(md.tailAtRisk).toBe(true);
    expect(md.interimCharCount).toBe(37);
    // -1 is the "never happened" sentinel; coercing it to 0 would invent an event.
    expect(md.msSinceLastFinal).toBe(-1);
  });
});
