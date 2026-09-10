/**
 * S3 · P1 · step 6 — ONE PHYSICAL PRESS → ONE `actId`.
 *
 *   ⭐⭐ The minter is injected and COUNTED. That is the whole point: this law
 *       cannot be asserted by reading the code, only by driving an interaction
 *       and asking how many identities it minted.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  initial, step, type MachineEvent, type MachineState, type Effect,
} from '../bodyAuthorizationMachine';
import type { BodyProtocolOutcome, DisclosureSection } from '../bodyAuthorization';

const S: DisclosureSection = { sectionId: 'sec-1', heading: 'The Keeper', label: 'The Keeper' };
const T: DisclosureSection = { sectionId: 'sec-2', heading: null, label: 'Section 7' };

const REQUIRED: BodyProtocolOutcome = {
  kind: 'BODY_AUTHORITY_REQUIRED', sections: [S], pendingAskRef: 'pending-1',
};

/** A counting minter — the instrument the law is measured with. */
const minter = () => {
  const calls: string[] = [];
  return { mint: () => { const id = `act-${calls.length + 1}`; calls.push(id); return id; }, calls };
};

/** Drive a sequence, collecting every effect. */
function drive(events: MachineEvent[], mint: () => string) {
  let state: MachineState = initial;
  const effects: Effect[] = [];
  for (const e of events) {
    const s = step(state, e, mint);
    state = s.state;
    effects.push(s.effect);
  }
  return { state, effects, sends: effects.filter((e) => e.do === 'send') as Extract<Effect, { do: 'send' }>[] };
}

describe('one press, one act', () => {
  it('⭐ a single press mints exactly one id and sends exactly one act', () => {
    const m = minter();
    const { sends } = drive([{ type: 'served', outcome: REQUIRED }, { type: 'press' }], m.mint);
    expect(m.calls).toHaveLength(1);
    expect(sends).toHaveLength(1);
    expect(sends[0].actId).toBe('act-1');
    expect(sends[0].sectionIds).toEqual(['sec-1']);
  });

  it('⭐⭐ a double-click while the act is in flight mints nothing and sends nothing more', () => {
    const m = minter();
    const { sends } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' }, { type: 'press' }, { type: 'press' },
    ], m.mint);
    /* ⛔ One human act arriving three times is still one act. */
    expect(m.calls).toHaveLength(1);
    expect(sends).toHaveLength(1);
  });

  it('⭐⭐ a retry after an unresolved transport reuses the SAME id', () => {
    const m = minter();
    const { sends } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'transport_failed' },
      { type: 'press' },
    ], m.mint);
    expect(m.calls).toHaveLength(1);
    expect(sends).toHaveLength(2);
    /* ⛔ The server never said what happened, so this is still that press. */
    expect(sends[0].actId).toBe(sends[1].actId);
  });

  it('⛔ a transport failure is never settled — nothing may be claimed about the crossing', () => {
    const m = minter();
    const { state } = drive([
      { type: 'served', outcome: REQUIRED }, { type: 'press' }, { type: 'transport_failed' },
    ], m.mint);
    expect(state.phase).toBe('transport_unresolved');
    expect(state.outcome).toEqual(REQUIRED);
  });
});

describe('⭐⭐ the same act remains identified; only completion decides a new one', () => {
  it('ACT_ALREADY_PROCESSED mints nothing and does not clear the act', () => {
    const m = minter();
    const { state } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'served', outcome: { kind: 'ACT_ALREADY_PROCESSED', completion: 'completed' } },
    ], m.mint);
    expect(m.calls).toHaveLength(1);
    /* ⭐ The same press, recognised. It is still identified as that act. */
    expect(state.actId).toBe('act-1');
  });

  it('⛔ a COMPLETED duplicate does not spend the act — an answer already exists', () => {
    const m = minter();
    const { state } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'served', outcome: { kind: 'ACT_ALREADY_PROCESSED', completion: 'completed' } },
    ], m.mint);
    /* Asking the member to authorize again for an answer they already have
       would be the machine inventing work. */
    expect(state.actSpent).toBe(false);
  });

  it('⭐ an INCOMPLETE duplicate spends it — the resume did not finish', () => {
    const m = minter();
    const { state } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'served', outcome: { kind: 'ACT_ALREADY_PROCESSED', completion: 'incomplete' } },
    ], m.mint);
    expect(state.actSpent).toBe(true);
  });
});

describe('a spent act is never resent', () => {
  const spendingOutcomes: BodyProtocolOutcome[] = [
    { kind: 'DISCLOSURE_UNAVAILABLE', actSpent: true, sections: [S] },
    { kind: 'ALREADY_CONSUMED', completion: 'incomplete' },
    { kind: 'ACT_ALREADY_PROCESSED', completion: 'incomplete' },
  ];

  it.each(spendingOutcomes)('⭐⭐ $kind spends the act — the next press mints a NEW id', (outcome) => {
    const m = minter();
    const { sends } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'served', outcome },
      { type: 'press' },
    ], m.mint);
    expect(m.calls).toHaveLength(2);
    expect(sends).toHaveLength(2);
    /* ⛔ Resending the spent id would present one authorization twice. */
    expect(sends[0].actId).not.toBe(sends[1].actId);
  });
});

describe('a fresh ask resets the act', () => {
  it('⭐ a new BODY_AUTHORITY_REQUIRED does not carry the previous id forward', () => {
    const m = minter();
    const { state, sends } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'served', outcome: { kind: 'BODY_AUTHORITY_REQUIRED', sections: [T], pendingAskRef: 'pending-2' } },
      { type: 'press' },
    ], m.mint);
    expect(m.calls).toHaveLength(2);
    expect(sends[1].actId).not.toBe(sends[0].actId);
    expect(sends[1].pendingAskRef).toBe('pending-2');
    expect(state.required).toEqual([T]);
  });

  it('⭐ BODY_SCOPE_INCOMPLETE leaves the question open and the act closed', () => {
    const m = minter();
    const { state, sends } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'served', outcome: { kind: 'BODY_SCOPE_INCOMPLETE', outstanding: [T], pendingAskRef: 'pending-1' } },
      { type: 'select', sectionIds: ['sec-1', 'sec-2'] },
      { type: 'press' },
    ], m.mint);
    expect(state.phase).toBe('authorizing');
    /* Authorizing the rest is a new press, and therefore a new id. */
    expect(m.calls).toHaveLength(2);
    expect(sends[1].sectionIds).toEqual(['sec-1', 'sec-2']);
  });
});

describe('⭐ the server\'s scope wins', () => {
  it('a changed required set replaces the client\'s selection', () => {
    const m = minter();
    const { state } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'select', sectionIds: ['sec-1', 'sec-99'] },
      { type: 'press' },
      { type: 'served', outcome: { kind: 'BODY_SCOPE_INCOMPLETE', outstanding: [T], pendingAskRef: 'pending-1' } },
    ], m.mint);
    /* ⛔ Obsolete client scope is never preserved as though it were authority. */
    expect(state.selectedSectionIds).toEqual(['sec-2']);
    expect(state.required).toEqual([T]);
  });

  it('⛔ BODY_SCOPE_INCOMPLETE consumes nothing and regenerates nothing', () => {
    const m = minter();
    const { state, sends } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'served', outcome: { kind: 'BODY_SCOPE_INCOMPLETE', outstanding: [T], pendingAskRef: 'pending-1' } },
    ], m.mint);
    /* No claim occurred, so the act is neither spent nor silently replaced —
       and receiving the outcome mints nothing. */
    expect(m.calls).toHaveLength(1);
    expect(sends).toHaveLength(1);
    expect(state.actSpent).toBe(false);
  });
});

describe('the acts that reach no server', () => {
  it('⛔ declining sends nothing and mints nothing', () => {
    const m = minter();
    const { state, sends } = drive([
      { type: 'served', outcome: REQUIRED }, { type: 'decline' },
    ], m.mint);
    expect(m.calls).toHaveLength(0);
    expect(sends).toHaveLength(0);
    expect(state.outcome).toEqual({ kind: 'DECLINED' });
    expect(state.pendingAskRef).toBeNull();
  });

  it('⛔ a press with no pending Ask does nothing at all', () => {
    const m = minter();
    const { sends } = drive([{ type: 'press' }], m.mint);
    expect(m.calls).toHaveLength(0);
    expect(sends).toHaveLength(0);
  });

  it('⛔ selecting mid-flight cannot change the act already sent', () => {
    const m = minter();
    const { sends } = drive([
      { type: 'served', outcome: REQUIRED },
      { type: 'press' },
      { type: 'select', sectionIds: ['sec-2'] },
      { type: 'transport_failed' },
      { type: 'press' },
    ], m.mint);
    /* The act named its sections when it was made; the server re-derives them
       regardless of anything held here. */
    expect(sends[1].sectionIds).toEqual(['sec-1']);
  });
});

describe('the machine cannot mint outside a press', () => {
  const SRC = readFileSync(join(__dirname, '..', 'bodyAuthorizationMachine.ts'), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

  it('⛔ it never reaches for an id generator of its own', () => {
    expect(SRC).not.toMatch(/randomUUID|crypto\.|Math\.random|nanoid|Date\.now/);
  });

  it('⛔ it performs no effect itself', () => {
    expect(SRC).not.toMatch(/fetch\(|apiFetch\(/);
  });

  it('⭐ `mint()` is called from exactly one place', () => {
    expect(SRC.match(/mint\(\)/g) ?? []).toHaveLength(1);
  });

  it('⛔ it holds no React state — a rerender cannot mint', () => {
    expect(SRC).not.toMatch(/useState|useRef|useEffect|useMemo/);
  });
});
