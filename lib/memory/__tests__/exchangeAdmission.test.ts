/**
 * The gate for 2514: simultaneous identical requests must produce ONE inference.
 *
 * Sequential duplicate calls were never the hard case — 2513 already passed
 * those. The case that matters is request B arriving AFTER A has inserted its
 * user turn but BEFORE A has produced its assistant turn. That is the window
 * 2513 left open, and it is the window an invite wave widens.
 */

import { admitExchange } from '../exchangeAdmission';

/**
 * Stand-in for conversation_turns with the real constraint:
 * UNIQUE (exchange_id, seq) ... ON CONFLICT DO NOTHING RETURNING id.
 *
 * The map write is the atomic election, exactly as the INSERT is in Postgres.
 */
function makeStore() {
  const userTurns = new Map<string, string>();
  const assistantTurns = new Map<string, string>();
  let inferenceCalls = 0;

  return {
    get inferenceCalls() { return inferenceCalls; },
    get userRows() { return userTurns.size; },
    get assistantRows() { return assistantTurns.size; },

    insertUserTurn(exchangeId: string, content: string): 'inserted' | 'duplicate' {
      if (userTurns.has(exchangeId)) return 'duplicate';
      userTurns.set(exchangeId, content);
      return 'inserted';
    },

    findAnswer: async (exchangeId: string) => assistantTurns.get(exchangeId) ?? null,

    /** The expensive thing we are protecting. */
    async runInference(exchangeId: string, prompt: string) {
      inferenceCalls++;
      // Non-zero latency is the point: it holds the window open so a concurrent
      // request lands while no answer exists yet.
      await new Promise(r => setTimeout(r, 25));
      const answer = `answer to: ${prompt}`;
      assistantTurns.set(exchangeId, answer);
      return answer;
    },
  };
}

/** One server request, start to finish. */
async function handleRequest(store: ReturnType<typeof makeStore>, exchangeId: string, message: string) {
  const outcome = store.insertUserTurn(exchangeId, message);
  const decision = await admitExchange(outcome, () => store.findAnswer(exchangeId));

  switch (decision.action) {
    case 'run_inference':
      return { status: 200, body: await store.runInference(exchangeId, message) };
    case 'serve_existing':
      return { status: 200, body: decision.answer };
    case 'in_progress':
      return { status: 202, body: null };
    case 'refused':
      return { status: 403, body: null };
  }
}

describe('simultaneous identical requests — the 2513 race', () => {
  it('runs ONE inference for two concurrent requests sharing an exchange id', async () => {
    const store = makeStore();

    await Promise.all([
      handleRequest(store, 'X', 'what is alive'),
      handleRequest(store, 'X', 'what is alive'),
    ]);

    expect(store.userRows).toBe(1);
    expect(store.inferenceCalls).toBe(1);
    expect(store.assistantRows).toBe(1);
  });

  it('holds under a burst of ten concurrent copies', async () => {
    const store = makeStore();

    await Promise.all(
      Array.from({ length: 10 }, () => handleRequest(store, 'X', 'what is alive'))
    );

    expect(store.userRows).toBe(1);
    expect(store.inferenceCalls).toBe(1);
    expect(store.assistantRows).toBe(1);
  });

  it('THE HARD CASE: B arrives after A inserted but before A answered', async () => {
    const store = makeStore();

    const a = handleRequest(store, 'X', 'what is alive');
    // A has inserted synchronously; its inference is still in flight and no
    // assistant row exists. This is precisely where 2513 started inference #2.
    expect(store.userRows).toBe(1);
    expect(store.assistantRows).toBe(0);

    const b = await handleRequest(store, 'X', 'what is alive');

    expect(b.status).toBe(202);   // declined, not generated
    expect(store.inferenceCalls).toBe(1);

    await a;
    expect(store.inferenceCalls).toBe(1);
    expect(store.assistantRows).toBe(1);
  });

  it('serves the stored answer once it exists, still without inferring', async () => {
    const store = makeStore();
    await handleRequest(store, 'X', 'what is alive');
    expect(store.inferenceCalls).toBe(1);

    const late = await handleRequest(store, 'X', 'what is alive');
    expect(late.status).toBe(200);
    expect(late.body).toBe('answer to: what is alive');
    expect(store.inferenceCalls).toBe(1); // unchanged
  });
});

describe('two genuine human acts remain two exchanges', () => {
  it('same words, different exchange ids → two inferences', async () => {
    const store = makeStore();

    await handleRequest(store, 'X', 'What is alive?'); // utterance A
    await handleRequest(store, 'Y', 'What is alive?'); // utterance B, identical words

    expect(store.userRows).toBe(2);
    expect(store.inferenceCalls).toBe(2);
    expect(store.assistantRows).toBe(2);
  });

  it('concurrent DISTINCT exchanges are never collapsed into one', async () => {
    const store = makeStore();
    await Promise.all([
      handleRequest(store, 'X', 'What is alive?'),
      handleRequest(store, 'Y', 'What is alive?'),
      handleRequest(store, 'Z', 'What is alive?'),
    ]);
    expect(store.inferenceCalls).toBe(3);
  });
});

describe('refusal is distinct from duplication', () => {
  it('a refused write never infers and never reports in_progress', async () => {
    const d = await admitExchange('refused', async () => null);
    expect(d).toEqual({ action: 'refused' });
  });

  it('does not query for an answer on the winning path', async () => {
    let lookups = 0;
    const d = await admitExchange('inserted', async () => { lookups++; return null; });
    expect(d).toEqual({ action: 'run_inference' });
    expect(lookups).toBe(0);
  });
});

describe('negative control — the 2513 behaviour must fail this gate', () => {
  /** 2513: duplicate + no answer yet fell through and generated. */
  async function admit2513(
    outcome: 'inserted' | 'duplicate' | 'refused',
    findAnswer: () => Promise<string | null>
  ) {
    if (outcome === 'refused') return { action: 'refused' as const };
    if (outcome === 'duplicate') {
      const existing = await findAnswer();
      if (existing) return { action: 'serve_existing' as const, answer: existing };
      // "falls through and generates — today's behaviour, never worse"
      return { action: 'run_inference' as const };
    }
    return { action: 'run_inference' as const };
  }

  it('CONTROL: 2513 issues a SECOND inference in the hard case', async () => {
    const store = makeStore();

    const run = async (exchangeId: string, message: string) => {
      const outcome = store.insertUserTurn(exchangeId, message);
      const d = await admit2513(outcome, () => store.findAnswer(exchangeId));
      if (d.action === 'run_inference') await store.runInference(exchangeId, message);
    };

    await Promise.all([run('X', 'what is alive'), run('X', 'what is alive')]);

    expect(store.userRows).toBe(1);        // the row guard held
    expect(store.inferenceCalls).toBe(2);  // ...and the load guard did not
  });
});
