/**
 * humanNotified is a claim that a PERSON was told. It may only be true when a
 * delivery callback affirmatively confirms delivery. Falsifiers for the prior
 * behaviour, which set it true unconditionally after a console.log.
 */
import { SafetyCircuitBreakers } from '../SafetyCircuitBreakers';

const trigger = { triggerType: 'coherence_drop', severity: 'critical', description: 't' } as any;
const fresh = () => ({ humanNotified: false, interventionType: 'human_notification' } as any);
const notify = (cb: SafetyCircuitBreakers, i: any) => (cb as any).notifyHumans(trigger, i);

describe('SafetyCircuitBreakers.notifyHumans — no fabricated notification', () => {
  let err: jest.SpyInstance;
  beforeEach(() => { err = jest.spyOn(console, 'error').mockImplementation(() => {}); });
  afterEach(() => err.mockRestore());
  const flagged = () => err.mock.calls.some(c => String(c[0]).includes('[SAFETY_NOTIFY_NO_RECIPIENT]'));

  it('no delivery channel → humanNotified stays false, and the gap is logged with a stable code', () => {
    const i = fresh(); notify(new SafetyCircuitBreakers(), i);
    expect(i.humanNotified).toBe(false); expect(flagged()).toBe(true);
  });
  it('a callback that only logs (returns void) is NOT a notified human', () => {
    const i = fresh(); notify(new SafetyCircuitBreakers(undefined as any, { onHumanNotification: () => { /* console only */ } }), i);
    expect(i.humanNotified).toBe(false); expect(flagged()).toBe(true);
  });
  it('a callback that confirms delivery (returns true) → humanNotified true, no gap logged', () => {
    const i = fresh(); notify(new SafetyCircuitBreakers(undefined as any, { onHumanNotification: () => true }), i);
    expect(i.humanNotified).toBe(true); expect(flagged()).toBe(false);
  });
  it('an async delivery callback stays false while pending, then becomes true only after confirmation', async () => {
    let confirm!: (value: boolean) => void;
    const pending = new Promise<boolean>((resolve) => { confirm = resolve; });
    const i = fresh();

    notify(new SafetyCircuitBreakers(undefined as any, {
      onHumanNotification: () => pending,
    }), i);

    expect(i.humanNotified).toBe(false);
    confirm(true);
    await pending;
    await Promise.resolve();

    expect(i.humanNotified).toBe(true);
    expect(flagged()).toBe(false);
  });

  it('a throwing callback → humanNotified false, failure logged, no exception escapes', () => {
    const i = fresh();
    expect(() => notify(new SafetyCircuitBreakers(undefined as any, { onHumanNotification: () => { throw new Error('x'); } }), i)).not.toThrow();
    expect(i.humanNotified).toBe(false);
    expect(err.mock.calls.some(c => String(c[0]).includes('[SAFETY_NOTIFY_FAILED]'))).toBe(true);
  });
});
