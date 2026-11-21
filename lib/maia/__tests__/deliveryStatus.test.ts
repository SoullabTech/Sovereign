/**
 * Recovery seam (Pattern A) delivery-state helpers.
 * Pure logic behind "the member sent it; delivery may have failed" — extracted
 * from OracleConversation (which is @ts-nocheck and untestable in isolation) so
 * the transitions are typed and covered.
 */
import {
  markFailed,
  markRetrying,
  clearDelivery,
  isRetryInFlight,
  stripDelivery,
  persistableDelivery,
  excludeUndelivered,
  mergeUndeliveredIntoServerHistory,
  type HasDelivery,
} from '../deliveryStatus';

type Msg = HasDelivery & { role: string; text: string };

const base = (): Msg[] => [
  { id: 'a', role: 'user', text: 'hello' },
  { id: 'b', role: 'oracle', text: 'hi there' },
  { id: 'c', role: 'user', text: 'are you there?' },
];

describe('deliveryStatus helpers', () => {
  describe('markFailed', () => {
    it('marks the target turn failed with a reason, leaving others untouched', () => {
      const out = markFailed(base(), 'c', 'network');
      expect(out.find((m) => m.id === 'c')).toMatchObject({
        deliveryStatus: 'failed',
        failureReason: 'network',
      });
      expect(out.find((m) => m.id === 'a')?.deliveryStatus).toBeUndefined();
    });

    it('is a no-op for an unknown id', () => {
      const out = markFailed(base(), 'zzz', 'server');
      expect(out.every((m) => m.deliveryStatus === undefined)).toBe(true);
    });

    it('preserves referential identity of untouched messages', () => {
      const input = base();
      const out = markFailed(input, 'c', 'auth');
      expect(out[0]).toBe(input[0]); // 'a' unchanged reference
      expect(out[2]).not.toBe(input[2]); // 'c' replaced
    });
  });

  describe('markRetrying', () => {
    it('sets retrying and clears any prior failureReason', () => {
      const failed = markFailed(base(), 'c', 'network');
      const out = markRetrying(failed, 'c');
      expect(out.find((m) => m.id === 'c')?.deliveryStatus).toBe('retrying');
      expect(out.find((m) => m.id === 'c')?.failureReason).toBeUndefined();
    });
  });

  describe('clearDelivery', () => {
    it('clears the in-flight retry marker once the server accepts (failed → retrying → cleared)', () => {
      let msgs = markFailed(base(), 'c', 'network');
      msgs = markRetrying(msgs, 'c'); // the resend begins
      const out = clearDelivery(msgs, 'c'); // server accepts
      expect(out.find((m) => m.id === 'c')?.deliveryStatus).toBeUndefined();
      expect(out.find((m) => m.id === 'c')?.failureReason).toBeUndefined();
    });

    it('OWNERSHIP: never clears a settled "failed" marker — only an in-flight "retrying" one', () => {
      // A stale/foreign clear (an older attempt resolving late) must not erase a
      // failure marker owned by a newer attempt.
      const failed = markFailed(base(), 'c', 'network');
      const out = clearDelivery(failed, 'c');
      expect(out.find((m) => m.id === 'c')?.deliveryStatus).toBe('failed');
      expect(out[2]).toBe(failed[2]); // untouched reference
    });

    it('is a no-op (same reference) when the turn had no marker — safe on every success', () => {
      const input = base();
      const out = clearDelivery(input, 'c');
      expect(out[2]).toBe(input[2]);
    });
  });

  describe('isRetryInFlight (concurrent-retry guard)', () => {
    it('is true only while retrying, never when merely failed', () => {
      expect(isRetryInFlight(base(), 'c')).toBe(false);
      expect(isRetryInFlight(markFailed(base(), 'c', 'network'), 'c')).toBe(false);
      expect(isRetryInFlight(markRetrying(base(), 'c'), 'c')).toBe(true);
    });
  });

  // Founder ruling 2026-11-19 (replaces 2026-07-24 live-only rule): the failed label
  // survives reopening on this device. "Sending…" is never stored.
  describe('persistableDelivery (device persistence)', () => {
    it('keeps a failed marker and its reason', () => {
      const out = persistableDelivery(markFailed(base(), 'c', 'network'));
      expect(out.find((m) => m.id === 'c')).toMatchObject({
        deliveryStatus: 'failed',
        failureReason: 'network',
        text: 'are you there?',
      });
    });

    it('never stores "Sending…": an unconfirmed retry is stored as failed', () => {
      // The app may close mid-resend. Showing that turn as delivered would be untrue;
      // resend is safe because it reuses the turn's exchange id.
      const out = persistableDelivery(markRetrying(base(), 'c'));
      const c = out.find((m) => m.id === 'c')!;
      expect(c.deliveryStatus).toBe('failed');
      expect(c.failureReason).toBe('error');
    });

    it('leaves delivered turns without any marker fields', () => {
      const out = persistableDelivery(base());
      expect('deliveryStatus' in out[0]).toBe(false);
      expect('failureReason' in out[0]).toBe(false);
    });
  });

  describe('stripDelivery', () => {
    it('removes both markers', () => {
      const stripped = stripDelivery(markFailed(base(), 'c', 'network'));
      const c = stripped.find((m) => m.id === 'c')!;
      expect('deliveryStatus' in c).toBe(false);
      expect('failureReason' in c).toBe(false);
      expect(c.text).toBe('are you there?');
    });
  });

  describe('excludeUndelivered (MAIA context)', () => {
    it('drops failed turns so MAIA is never told she heard them', () => {
      const current = markFailed(base(), 'c', 'network');
      const out = excludeUndelivered([], current);
      expect(out.current.map((m) => m.id)).toEqual(['a', 'b']);
    });

    it('uses the current status over a stale restored copy', () => {
      // Restored history says failed; the member just resent it, so it is in flight.
      const historical = markFailed(base(), 'c', 'network');
      const current = markRetrying(base(), 'c');
      const out = excludeUndelivered(historical, current);
      expect(out.historical.map((m) => m.id)).toEqual(['a', 'b', 'c']);
    });

    it('drops a restored failed turn the member has not resent', () => {
      const historical = markFailed(base(), 'c', 'auth');
      const out = excludeUndelivered(historical, []);
      expect(out.historical.map((m) => m.id)).toEqual(['a', 'b']);
    });
  });

  describe('mergeUndeliveredIntoServerHistory', () => {
    type T = Msg & { timestamp: string | Date };
    const server: T[] = [
      { id: 'pg1', role: 'user', text: 'hello', timestamp: '2026-11-19T10:00:00Z' },
      { id: 'pg2', role: 'oracle', text: 'hi there', timestamp: '2026-11-19T10:00:05Z' },
      { id: 'pg3', role: 'user', text: 'later', timestamp: '2026-11-19T10:10:00Z' },
    ];

    it('keeps a local failed turn in time order when server history replaces local', () => {
      const local: T[] = [
        { id: 'm1', role: 'user', text: 'lost words', timestamp: '2026-11-19T10:05:00Z', deliveryStatus: 'failed', failureReason: 'network' },
      ];
      const out = mergeUndeliveredIntoServerHistory(server, local);
      expect(out.map((m) => m.id)).toEqual(['pg1', 'pg2', 'm1', 'pg3']);
      expect(out[2].deliveryStatus).toBe('failed');
    });

    it('ignores delivered local turns', () => {
      const local: T[] = [{ id: 'm1', role: 'user', text: 'x', timestamp: '2026-11-19T10:05:00Z' }];
      expect(mergeUndeliveredIntoServerHistory(server, local)).toEqual(server);
    });

    it('does not show a turn twice when the server did receive it', () => {
      const local: T[] = [
        { id: 'm1', role: 'user', text: ' later ', timestamp: '2026-11-19T10:09:59Z', deliveryStatus: 'failed', failureReason: 'server' },
      ];
      expect(mergeUndeliveredIntoServerHistory(server, local)).toEqual(server);
    });

    it('keeps a network failure even if an older turn had the same words', () => {
      const local: T[] = [
        { id: 'm1', role: 'user', text: 'hello', timestamp: '2026-11-19T10:20:00Z', deliveryStatus: 'failed', failureReason: 'network' },
      ];
      expect(mergeUndeliveredIntoServerHistory(server, local).map((m) => m.id)).toEqual(['pg1', 'pg2', 'pg3', 'm1']);
    });
  });

  describe('full recovery lifecycle: send → fail → guarded resend → server accepts', () => {
    it('walks the path and lands delivered', () => {
      let msgs: Msg[] = base();
      msgs = markFailed(msgs, 'c', 'network');
      expect(msgs.find((m) => m.id === 'c')?.deliveryStatus).toBe('failed');

      expect(isRetryInFlight(msgs, 'c')).toBe(false); // resend permitted
      msgs = markRetrying(msgs, 'c');
      expect(isRetryInFlight(msgs, 'c')).toBe(true); // second tap would be refused

      msgs = clearDelivery(msgs, 'c'); // server accepted
      expect(msgs.find((m) => m.id === 'c')?.deliveryStatus).toBeUndefined();
    });
  });
});
