import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import type { AuthorizedPersonalKeepRef } from '../personalKeepsReadAuthority';
import {
  preparePersonalKeepsReadCognition,
  performPersonalKeepsReadCognition,
  renderPersonalKeepsReadBlock,
  invokePersonalKeepsResponse,
} from '../personalKeepsReadCognition';

const MEMBER = 'member-1';
const posture = TurnPosture.resolve({ sanctuary: false });
const authorized: AuthorizedPersonalKeepRef[] = [
  { keepRef: 'keep-1', disclosureId: 'd-1', receiptId: 'r-1' },
  { keepRef: 'keep-2', disclosureId: 'd-2', receiptId: 'r-2' },
];

const spontaneous = {
  id: 'keep-1', title: 'A spontaneous keep', body: 'x'.repeat(220),
  source_type: 'spontaneous', status: 'active', kept_at: new Date('2026-09-17T12:00:00Z'),
  is_breakthrough: false,
};
const sourced = {
  id: 'keep-2', title: 'An idea keep', body: 'must not cross from sourced atom',
  source_type: 'idea', status: 'still_alive', kept_at: new Date('2026-09-16T12:00:00Z'),
  is_breakthrough: false,
};

describe('projection is resolved only after per-object authority', () => {
  it('builds a bounded truthful projection in authorized order', async () => {
    const resolveKeep = jest.fn(async ({ keepId }: any) => keepId === 'keep-1' ? spontaneous : sourced);
    const out = await preparePersonalKeepsReadCognition({ memberId: MEMBER, posture, authorized }, { resolveKeep });
    expect(out.kind).toBe('ready');
    if (out.kind !== 'ready') return;
    expect(resolveKeep.mock.calls.map(c => c[0])).toEqual([
      { memberId: MEMBER, keepId: 'keep-1' },
      { memberId: MEMBER, keepId: 'keep-2' },
    ]);
    expect(out.projection).toEqual([
      expect.objectContaining({ id: 'keep-1', title: 'A spontaneous keep', sourceType: 'spontaneous', status: 'active' }),
      expect.objectContaining({ id: 'keep-2', title: 'An idea keep', sourceType: 'idea', status: 'still_alive' }),
    ]);
    expect(out.projection[0].bodySnippet).toHaveLength(140);
    expect(out.projection[1].bodySnippet).toBeUndefined();
  });

  it('fails closed if any authorized Keep no longer resolves under the canonical guards', async () => {
    const resolveKeep = jest.fn(async ({ keepId }: any) => keepId === 'keep-1' ? spontaneous : null);
    const out = await preparePersonalKeepsReadCognition({ memberId: MEMBER, posture, authorized }, { resolveKeep });
    expect(out).toEqual({ kind: 'projection_refused', failedKeepRef: 'keep-2' });
  });

  it('refuses Sanctuary defensively even though J5-3 already does', async () => {
    const resolveKeep = jest.fn();
    const out = await preparePersonalKeepsReadCognition({
      memberId: MEMBER, posture: TurnPosture.resolve({ sanctuary: true }), authorized,
    }, { resolveKeep });
    expect(out.kind).toBe('sanctuary_refused');
    expect(resolveKeep).not.toHaveBeenCalled();
  });
});

describe('deterministic cognition block', () => {
  it('contains member-facing projection but no receipt/disclosure/internal ids', async () => {
    const out = await preparePersonalKeepsReadCognition({ memberId: MEMBER, posture, authorized }, {
      resolveKeep: async ({ keepId }: any) => keepId === 'keep-1' ? spontaneous : sourced,
    });
    if (out.kind !== 'ready') throw new Error('expected ready');
    const block = renderPersonalKeepsReadBlock(out.projection);
    expect(block).toContain('A spontaneous keep');
    expect(block).toContain('An idea keep');
    expect(block).not.toMatch(/d-1|d-2|r-1|r-2|keep-1|keep-2/);
    expect(block).not.toContain('must not cross from sourced atom');
    expect(block).toContain('Use only this Personal Keeps projection');
  });
});

describe('true handoff and receipt confirmation', () => {
  it('invokes generation before confirmation and always awaits generation', async () => {
    const events: string[] = [];
    const out = await invokePersonalKeepsResponse(
      () => { events.push('invoke-model'); return Promise.resolve().then(() => { events.push('model-settled'); return 'answer'; }); },
      async () => { events.push('confirm'); return true; },
    );
    expect(out).toBe('answer');
    expect(events).toEqual(['invoke-model', 'confirm', 'model-settled']);
  });

  it('confirms exactly the receipts whose complete projection was handed off', async () => {
    const confirmReceipt = jest.fn(async () => true);
    const cognition = jest.fn(async (input: any) => {
      expect(input.projection).toHaveLength(2);
      expect(await input.onHandoff()).toBe(true);
      return { text: 'ok' };
    });
    const out = await performPersonalKeepsReadCognition(
      { memberId: MEMBER, posture, authorized },
      {
        resolveKeep: async ({ keepId }: any) => keepId === 'keep-1' ? spontaneous : sourced,
        confirmReceipt,
        cognition,
      },
    );
    expect(out).toEqual({ kind: 'crossed', response: { text: 'ok' } });
    expect(confirmReceipt.mock.calls.map(c => c[0])).toEqual(['d-1', 'd-2']);
  });

  it('leaves receipts attempted when cognition returns before a true handoff', async () => {
    const confirmReceipt = jest.fn(async () => true);
    const out = await performPersonalKeepsReadCognition(
      { memberId: MEMBER, posture, authorized },
      {
        resolveKeep: async ({ keepId }: any) => keepId === 'keep-1' ? spontaneous : sourced,
        confirmReceipt,
        cognition: async () => ({ text: 'pre-handoff refusal' }),
      },
    );
    expect(out).toEqual({ kind: 'no_handoff' });
    expect(confirmReceipt).not.toHaveBeenCalled();
  });

  it('reports unresolved accountability if any post-handoff confirmation fails', async () => {
    const confirmReceipt = jest.fn(async (id: string) => id !== 'd-2');
    const out = await performPersonalKeepsReadCognition(
      { memberId: MEMBER, posture, authorized },
      {
        resolveKeep: async ({ keepId }: any) => keepId === 'keep-1' ? spontaneous : sourced,
        confirmReceipt,
        cognition: async (input: any) => { await input.onHandoff(); return { text: 'generated' }; },
      },
    );
    expect(out).toEqual({ kind: 'confirmation_failed', failedDisclosureIds: ['d-2'] });
  });
});
