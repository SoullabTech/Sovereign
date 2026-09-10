/**
 * F1f / F1g - THE HANDOFF MEASURES DISPATCH.
 *
 * Together these two prove the hook is neither "entered the function" nor
 * "an answer came back". One test asserts the signal fires when the request
 * leaves and the result then fails; the other asserts it does NOT fire when the
 * call dies before dispatch. Either alone could be satisfied by a wrong
 * implementation.
 *
 *   The receipt is evidence of disclosure, not of successful inference.
 */

import { anthropicStructuredProvider } from '../anthropicStructuredAdapter';
import type { StructuredRequest } from '../types';

const REQ: StructuredRequest = {
  model: 'claude-opus-5',
  system: 'system',
  messages: [{ role: 'user', content: 'the authored characters' }],
  maxTokens: 100,
};

/** A client that dispatches and then fails, as a provider outage does. */
const dispatchesThenRejects = () => ({
  messages: {
    create: async () => { throw new Error('upstream 529'); },
    stream: () => { throw new Error('upstream 529'); },
  },
});

/** A client that dispatches and answers. */
const dispatchesAndAnswers = () => ({
  messages: {
    create: async () => ({ content: [{ type: 'text', text: 'ok' }], model: 'claude-opus-5', usage: {} }),
    stream: () => ({ finalMessage: async () => ({ content: [{ type: 'text', text: 'ok' }], model: 'claude-opus-5', usage: {} }) }),
  },
});

describe('F1f - dispatch occurred, result then failed: still crossed', () => {
  it('fires onHandoff even though the provider call rejects', async () => {
    let handed = false;
    const provider = anthropicStructuredProvider({ client: dispatchesThenRejects() as never });

    await expect(
      provider.execute(REQ, { onHandoff: () => { handed = true; } }),
    ).rejects.toThrow(/529/);

    // THE WORK CROSSED. A failure after dispatch does not un-send it, so a
    // receipt confirmed on this signal is truthful even though the turn failed.
    expect(handed).toBe(true);
  });

  it('fires exactly once on the ordinary path', async () => {
    let count = 0;
    const provider = anthropicStructuredProvider({ client: dispatchesAndAnswers() as never });
    await provider.execute(REQ, { onHandoff: () => { count += 1; } });
    expect(count).toBe(1);
  });
});

describe('F1g - pre-handoff failure is not a crossing', () => {
  it('does NOT fire when params cannot be built - nothing left the process', async () => {
    let handed = false;
    // A request the adapter cannot render: the failure happens after entry and
    // before dispatch, which is exactly the window this falsifier exists for.
    const provider = anthropicStructuredProvider({ client: dispatchesAndAnswers() as never });
    // Defined rather than spread: a spread would invoke the getter while BUILDING
    // the fixture, and the test would fail for its own reason instead of the
    // adapter's. An instrument that fails before reaching the subject has tested
    // nothing.
    const broken: StructuredRequest = Object.defineProperty({ ...REQ }, 'messages', {
      get(): never { throw new Error('params unbuildable'); },
    }) as StructuredRequest;

    await expect(
      provider.execute(broken as never, { onHandoff: () => { handed = true; } }),
    ).rejects.toThrow();

    // NO SIGNAL. A receipt observing this stays `attempted`, which is true:
    // authorization existed, the crossing did not.
    expect(handed).toBe(false);
  });

  it('does NOT fire when the client itself cannot be constructed', async () => {
    let handed = false;
    const provider = anthropicStructuredProvider({
      get client(): never { throw new Error('ANTHROPIC_API_KEY missing'); },
    } as never);

    await expect(
      provider.execute(REQ, { onHandoff: () => { handed = true; } }),
    ).rejects.toThrow(/API_KEY/);

    expect(handed).toBe(false);
  });
});
