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

  describe('stripDelivery (persistence guard)', () => {
    it('removes both markers so nothing delivery-related is persisted', () => {
      const failed = markFailed(base(), 'c', 'network');
      const stripped = stripDelivery(failed);
      const c = stripped.find((m) => m.id === 'c')!;
      expect('deliveryStatus' in c).toBe(false);
      expect('failureReason' in c).toBe(false);
      expect(c.text).toBe('are you there?'); // payload itself is untouched
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
