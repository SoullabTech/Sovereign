import * as fs from 'fs';
import * as path from 'path';

/* ⭐ Instrument note. The first draft cast a fake identity object, and
   `constructCanonicalTurn` correctly refused it (G4: identity must have been
   minted by `resolveCanonicalIdentity`). Mocking the auth reader keeps the
   identity MINTED by the real resolver, without a request scope — the same
   device focusProducer.test.ts uses, and for the same reason. ⛔ The gate was
   right; the fixture was wrong. */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => 'member-witness'),
}));

/* ⛔ Instrument note. The P13 cases reach `prepare`, so the boundary, the
   receipts and the ACT RECORD all have to succeed first — otherwise the
   crossing refuses before cognition and the test passes vacuously by finding
   nothing. (It did, at first: `seen` was null, which is the fail-closed
   provenance rule working exactly as ruled.) This models a substrate that says
   yes, so the assertions are about the participation and nothing else. */
jest.mock('@/lib/db/postgres', () => {
  const acts = new Map<string, { canonical_turn_id: string | null }>();
  const run = async (sql: string, params: unknown[] = []) => {
    if (/INSERT INTO focus_crossing_acts/.test(sql)) {
      if (acts.has(params[0] as string)) return { rows: [], rowCount: 0 };
      acts.set(params[0] as string, { canonical_turn_id: null });
      return { rows: [{ act_id: params[0] }], rowCount: 1 };
    }
    if (/FROM focus_crossing_acts\b/.test(sql)) {
      const a = acts.get(params[0] as string);
      return { rows: a ? [{ act_id: params[0], member_id: 'm-1', work_id: 'w-1',
        active_member_id: null, canonical_turn_id: a.canonical_turn_id }] : [], rowCount: a ? 1 : 0 };
    }
    if (/runtime_consent_state/.test(sql)) {
      return /INSERT/.test(sql)
        ? { rows: [{ request_id: params[0] }], rowCount: 1 }
        : { rows: [], rowCount: 0 };
    }
    if (/context_disclosure_receipts/.test(sql)) {
      return { rows: [{ id: 'r1' }], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  };
  return { query: jest.fn(run), transaction: jest.fn(async (cb: never) => (cb as never as (t: unknown) => Promise<unknown>)({ query: run })) };
});
import { resolveCanonicalIdentity } from '@/lib/maia/canonical-turn';
import {
  focusParticipation, renderFocusMembership, type FocusParticipationMember,
} from '../focusParticipation';
import { constructWriterTurn, renderWriterTurn, writerCandidates } from '../canonicalWriterTurn';
import { performFocusCrossing, type FocusCrossingRequest } from '../focusCrossing';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';

/**
 * STEP 2B — FOCUS SET → CANONICAL MAIA. F1–F12, predeclared by the founder
 * BEFORE implementation, plus the semantic test that decides whether 2B is done.
 *
 * ⭐⭐ THE LAW THIS SUITE ENFORCES:
 *
 *   Attention membership authority ≠ content disclosure authority.
 *
 * A five-member Focus Set with three lawful bodies must reach MAIA as FIVE
 * memberships and THREE bodies. Showing her three and letting her believe the
 * writer's attention is exhausted by them is lawful disclosure followed by
 * epistemic flattening — the boundary held and the truth was lost anyway.
 *
 * ⭐ THE SENTENCE THAT DECIDES IT:
 *
 *   "I can see three of the five places you are working across."
 *
 * If the architecture cannot support that sentence without bluffing, 2B is not
 * done. `the deciding sentence` below is that test.
 */

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');
const lib = (...p: string[]) => strip(fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8'));
const producerSrc = lib('canonicalWriterTurn.ts');
const crossingSrc = lib('focusCrossing.ts');
const participationSrc = lib('focusParticipation.ts');

const identity = async () => resolveCanonicalIdentity({} as never);

/** Five declared places; three of them lawfully readable. */
const FIVE: FocusParticipationMember[] = [
  { focusMemberId: 'f1', ordinal: 1, sectionRef: 's45', status: 'readable', active: false, bodyAvailable: true, content: 'The fire was already lit.' },
  { focusMemberId: 'f2', ordinal: 2, sectionRef: 's56', status: 'readable', active: true, bodyAvailable: true, content: 'Someone had banked it.' },
  { focusMemberId: 'f3', ordinal: 3, sectionRef: 's57', status: 'unverified', active: false, bodyAvailable: false },
  { focusMemberId: 'f4', ordinal: 4, sectionRef: 's58', status: 'readable', active: false, bodyAvailable: true, content: 'By morning the stones were cold.' },
  { focusMemberId: 'f5', ordinal: 5, sectionRef: 's62', status: 'unavailable', active: false, bodyAvailable: false },
];

const part = () => focusParticipation({ members: FIVE, activeMemberId: 'f2' });

const turnFor = async (p: ReturnType<typeof focusParticipation>) => constructWriterTurn({
  identity: await identity(),
  sessionRef: 'sess-1', exchangeId: 'req-1',
  ask: 'Does the campfire motif develop or repeat?',
  sanctuary: false,
  participation: { focus: { workRef: 'w-1' }, participation: p },
});

/* ══ F1 — five memberships, exactly three bodies ═══════════════════════════ */

describe('F1 — five Focus members with three lawful bodies', () => {
  it('MAIA receives five memberships and exactly three bodies', () => {
    const p = part();
    expect(p.total).toBe(5);
    expect(p.readable).toBe(3);
    expect(p.members.filter((m) => m.content !== undefined)).toHaveLength(3);
    expect(p.members).toHaveLength(5);
  });

  it('the rendered turn names all five and carries only the three texts', async () => {
    const proof = renderWriterTurn(await turnFor(part()), { tier: 'CORE' });
    expect(proof).not.toBeNull();
    const text = writerCandidates({ focus: { workRef: 'w-1' }, participation: part() })
      .map((c) => c.text).join('\n');
    for (const m of FIVE) expect(text).toContain(m.sectionRef);
    expect(text).toContain('The fire was already lit.');
    expect(text).not.toContain('cold again');
  });
});

/* ══ ⭐ the sentence that decides whether 2B is done ════════════════════════ */

describe('the deciding sentence — “I can see three of the five places”', () => {
  it('the membership MAIA is given states both numbers, without bluffing', () => {
    const line = renderFocusMembership(part());
    expect(line).toMatch(/5/);
    expect(line).toMatch(/3/);
    // Both facts, in one place, so she cannot report one without the other.
    expect(line).toMatch(/2 .*(cannot|not).*read|read .*3 of .*5/i);
  });

  it('a fully readable set says so and claims no limitation it does not have', () => {
    const all = FIVE.filter((m) => m.status === 'readable');
    const line = renderFocusMembership(focusParticipation({ members: all, activeMemberId: null }));
    expect(line).toMatch(/3/);
    expect(line).not.toMatch(/cannot be read|needs? confirmation/i);
  });
});

/* ══ F2 — a partial view may never present as complete ═════════════════════ */

describe('F2 — removing an unavailable member’s existence must fail', () => {
  it('dropping unreadable members changes the count MAIA is told', () => {
    const flattened = focusParticipation({
      members: FIVE.filter((m) => m.status === 'readable'),
      activeMemberId: 'f2',
    });
    expect(flattened.total).toBe(3);
    // The assertion F1 makes of the real implementation, made of the flattened one:
    expect(() => expect(flattened.total).toBe(5)).toThrow();
    /* ⛔ Instrument note: a bare /5/ matched the section ref `s56`. The
       obligation is about the CLAIM the sentence makes, not about a digit
       appearing anywhere in it. */
    expect(renderFocusMembership(flattened)).not.toMatch(/across 5 place/);
    expect(renderFocusMembership(part())).toMatch(/across 5 place/);
  });

  it('the contract cannot construct a set whose total excludes its own members', () => {
    const p = part();
    expect(p.total).toBe(p.members.length);
  });
});

/* ══ F3 — an unreadable member’s body must never cross ═════════════════════ */

describe('F3 — content supplied for an unreadable member is a hard refusal', () => {
  for (const status of ['unverified', 'unavailable'] as const) {
    it(`${status} + content throws rather than crossing`, () => {
      expect(() => focusParticipation({
        members: [{ focusMemberId: 'x', ordinal: 1, sectionRef: 's1', status, active: false, bodyAvailable: false, content: 'smuggled' }],
        activeMemberId: null,
      })).toThrow(/body|content|readable/i);
    });
  }

  it('bodyAvailable disagreeing with content is refused in both directions', () => {
    expect(() => focusParticipation({
      members: [{ focusMemberId: 'x', ordinal: 1, sectionRef: 's1', status: 'readable', active: false, bodyAvailable: true }],
      activeMemberId: null,
    })).toThrow();
    expect(() => focusParticipation({
      members: [{ focusMemberId: 'x', ordinal: 1, sectionRef: 's1', status: 'readable', active: false, bodyAvailable: false, content: 'x' }],
      activeMemberId: null,
    })).toThrow();
  });

  it('⛔ nothing derived from an unreadable member travels either', () => {
    const p = part();
    const rendered = writerCandidates({ focus: { workRef: 'w-1' }, participation: p })
      .map((c) => c.text).join('\n');
    // No summary, no digest, no "about". The two unreadable members contribute
    // identity, ordinal and state — and nothing that describes their prose.
    for (const m of p.members) {
      if (m.status === 'readable') continue;
      expect(m).not.toHaveProperty('summary');
      expect(m).not.toHaveProperty('digest');
      expect(m).not.toHaveProperty('about');
      expect(m.content).toBeUndefined();
    }
    expect(rendered).not.toMatch(/summar|about this passage|digest/i);
  });
});

/* ══ F4 — the active target may not be an unreadable member ════════════════ */

describe('F4 — an unreadable active target refuses; no silent substitution', () => {
  it('naming an unreadable member as active is a hard refusal', () => {
    expect(() => focusParticipation({ members: FIVE, activeMemberId: 'f3' })).toThrow(/active/i);
    expect(() => focusParticipation({ members: FIVE, activeMemberId: 'f5' })).toThrow(/active/i);
  });

  it('a member that is not in the set cannot be active', () => {
    expect(() => focusParticipation({ members: FIVE, activeMemberId: 'f9' })).toThrow(/active/i);
  });

  it('⛔ it never falls back to another member', () => {
    try {
      focusParticipation({ members: FIVE, activeMemberId: 'f3' });
      throw new Error('should have refused');
    } catch (e) {
      expect((e as Error).message).not.toMatch(/f1|f2|f4/);
    }
    expect(participationSrc).not.toMatch(/activeMemberId\s*\?\?|find\(.*readable.*\).*active/);
  });
});

/* ══ F5 — attention may exist before an edit target is chosen ══════════════ */

describe('F5 — an omitted active target is lawful', () => {
  it('a set with no active member constructs and crosses', async () => {
    const p = focusParticipation({ members: FIVE, activeMemberId: null });
    expect(p.activeMemberId).toBeNull();
    expect(p.members.every((m) => m.active === false)).toBe(true);
    expect(renderWriterTurn(await turnFor(p), { tier: 'CORE' })).not.toBeNull();
  });

  it('MAIA is told the writer has not chosen one — not that there isn’t one', () => {
    const line = renderFocusMembership(focusParticipation({ members: FIVE, activeMemberId: null }));
    expect(line).toMatch(/not (yet )?chosen|no place chosen/i);
  });

  it('`active` is derived from activeMemberId, never trusted from the member', () => {
    const lying = FIVE.map((m) => ({ ...m, active: true }));
    const p = focusParticipation({ members: lying, activeMemberId: null });
    expect(p.members.filter((m) => m.active)).toHaveLength(0);
  });
});

/* ══ F6 — the active target lives at the ACT layer, not on a receipt ═══════ */

describe('F6 — the active target is not disclosure vocabulary', () => {
  it('no receipt field anywhere names an active member', () => {
    const receipt = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', 'disclosure', 'contextDisclosureReceipt.ts'), 'utf8'));
    expect(receipt).not.toMatch(/active/i);
  });

  it('the crossing puts the active member on the act, and only there', () => {
    const disclosureBlock = crossingSrc.slice(
      crossingSrc.indexOf('establishDisclosureBoundary({'),
      crossingSrc.indexOf('established.push'),
    );
    expect(disclosureBlock.length).toBeGreaterThan(40);
    expect(disclosureBlock).not.toMatch(/active/i);
    expect(crossingSrc).toMatch(/activeMemberId/);
  });
});

/* ══ F7 — member identity must survive into cognition ══════════════════════ */

describe('F7 — two members concatenated into one string fails', () => {
  it('the producer contract has no single workContext string', () => {
    expect(producerSrc).not.toMatch(/workContext\s*:\s*string/);
    expect(producerSrc).toMatch(/participation\s*:\s*FocusParticipation/);
  });

  it('each member is separately identifiable in what MAIA is handed', () => {
    const text = writerCandidates({ focus: { workRef: 'w-1' }, participation: part() })
      .map((c) => c.text).join('\n');
    const readable = FIVE.filter((m) => m.content);
    for (const m of readable) {
      // The body appears, and it appears attributed to its own place.
      const at = text.indexOf(m.content!);
      expect(at).toBeGreaterThan(-1);
      expect(text.slice(Math.max(0, at - 220), at)).toContain(m.sectionRef);
    }
  });

  it('the active target is distinguishable from the contextual members', () => {
    const text = writerCandidates({ focus: { workRef: 'w-1' }, participation: part() })
      .map((c) => c.text).join('\n');
    const active = text.indexOf('s56');
    expect(active).toBeGreaterThan(-1);
    expect(text).toMatch(/working on|active/i);
  });
});

/* ══ F8–F12 — one act, one turn, no widening, nothing undeclared ═══════════ */

function req(over: Partial<FocusCrossingRequest> = {}): FocusCrossingRequest {
  return {
    requestId: 'req-1', actId: 'act-1', identity: {} as never,
    posture: TurnPosture.resolve({}), memberId: 'm-1', sessionId: 'sess-1',
    workRef: 'w-1',
    members: [
      { focusMemberId: 'f1', sectionRef: 's45' },
      { focusMemberId: 'f2', sectionRef: 's56' },
    ],
    activeMemberId: 'f2',
    gesture: 'work_with_this', ask: 'does it develop?',
    ...over,
  } as FocusCrossingRequest;
}

describe('F8 — one Focus gesture generates ONE canonical turn', () => {
  it('the crossing calls prepare and generate at most once', async () => {
    let prepared = 0;
    let generated = 0;
    await performFocusCrossing(req(), {
      presence: async () => new Set<string>(),
      assemble: async () => null,
      prepare: async () => { prepared += 1; return null; },
      generate: () => { generated += 1; return { handoff: Promise.resolve(false), result: Promise.resolve({ ok: false }) }; },
    });
    expect(prepared).toBeLessThanOrEqual(1);
    expect(generated).toBeLessThanOrEqual(1);
  });

  it('there is no per-member cognition loop in the source', () => {
    const afterBoundaries = crossingSrc.slice(crossingSrc.indexOf('established.push'));
    expect(afterBoundaries).not.toMatch(/for \(.*\)\s*\{[^}]*deps\.(prepare|generate)/s);
  });
});

describe('F9 — a retry of the same act must not mint a second act identity', () => {
  it('the act identity is carried in the request, not minted per call', () => {
    expect(crossingSrc).toMatch(/req\.actId|actId:/);
    const mints = crossingSrc.match(/randomUUID\(\)/g) ?? [];
    expect(mints).toHaveLength(0);
  });

  it('the act is distinct from the HTTP request identity', () => {
    const r = req();
    expect(r.actId).not.toBe(r.requestId);
    expect(crossingSrc).toMatch(/actId/);
    expect(crossingSrc).toMatch(/requestId/);
  });
});

describe('F10 — whole_work substitution for a distributed set fails', () => {
  it('the crossing has no whole_work scope at all any more', () => {
    expect(crossingSrc).not.toMatch(/whole_work/);
  });

  it('every member crosses at section scope, one receipt each', () => {
    const block = crossingSrc.slice(
      crossingSrc.indexOf('establishDisclosureBoundary({'),
      crossingSrc.indexOf('established.push'),
    );
    expect(block).toMatch(/scopeKind:\s*'section'/);
    expect(block).toMatch(/sectionRef/);
  });
});

describe('F11 — no receipt crosses before every member is resolved', () => {
  it('confirmation happens only after the one handoff', () => {
    const iEstablish = crossingSrc.indexOf('establishDisclosureBoundary');
    const iAssemble = crossingSrc.indexOf('deps.assemble');
    const iHandoff = crossingSrc.indexOf('await handoff');
    /* ⛔ The IMPORT of confirmDisclosureCrossed is not its call site. Ordering
       is a fact about the body, so the search starts at the function. */
    const body = crossingSrc.slice(crossingSrc.indexOf('export async function performFocusCrossing'));
    const iConfirm = crossingSrc.indexOf('export async function performFocusCrossing')
      + body.indexOf('await confirmDisclosureCrossed');
    expect(iEstablish).toBeGreaterThan(-1);
    // boundaries → bodies → handoff → confirm, in that order and no other.
    expect(iAssemble).toBeGreaterThan(iEstablish);
    expect(iHandoff).toBeGreaterThan(iAssemble);
    expect(iConfirm).toBeGreaterThan(iHandoff);
  });

  it('a member whose boundary refuses stops the whole crossing — nothing confirmed', async () => {
    const confirmed: string[] = [];
    const out = await performFocusCrossing(req(), {
      presence: async () => new Set<string>(),
      assemble: async () => { confirmed.push('assembled'); return 'text'; },
      prepare: async () => null,
      generate: () => ({ handoff: Promise.resolve(true), result: Promise.resolve({ ok: true }) }),
    });
    expect(out.response).toBeNull();
    expect(out.disclosureId).toBeNull();
  });
});

describe('F12 — a member not declared in the Focus Set cannot appear in cognition', () => {
  it('the assembler is called only for declared members', async () => {
    const asked: string[] = [];
    await performFocusCrossing(req(), {
      presence: async () => new Set<string>(),
      assemble: async ({ sectionRef }) => { asked.push(String(sectionRef)); return null; },
      prepare: async () => null,
      generate: () => ({ handoff: Promise.resolve(false), result: Promise.resolve({ ok: false }) }),
    });
    for (const s of asked) expect(['s45', 's56']).toContain(s);
  });

  it('the participation contract refuses a duplicate member identity', () => {
    expect(() => focusParticipation({
      members: [FIVE[0], { ...FIVE[1], focusMemberId: 'f1' }],
      activeMemberId: null,
    })).toThrow(/duplicate|identity/i);
  });

  it('ordinals are the set’s own, contiguous from one', () => {
    const p = part();
    expect(p.members.map((m) => m.ordinal)).toEqual([1, 2, 3, 4, 5]);
  });
});

/* ══ ⭐ P13 — the server establishes WHY a member was withheld ══════════════ */

describe('P13 — the client is not authoritative about why a member is withheld', () => {
  /* ⭐ Each crossing below is a SEPARATE deliberate act and gets its own
     identity — which is also the act record's own law: the same actId arriving
     twice is a retry, and a retry is not a second reading of the substrate. */
  let n = 0;
  const withheldReq = (): FocusCrossingRequest => ({
    requestId: `req-${++n}`, actId: `act-p13-${n}`, identity: {} as never,
    posture: TurnPosture.resolve({}), memberId: 'm-1', sessionId: 'sess-1',
    workRef: 'w-1',
    members: [
      { focusMemberId: 'f1', sectionRef: 's-readable', readable: true },
      { focusMemberId: 'f2', sectionRef: 's-still-there', readable: false },
      { focusMemberId: 'f3', sectionRef: 's-deleted', readable: false },
    ],
    activeMemberId: null, gesture: 'ask_maia', ask: 'q',
  } as FocusCrossingRequest);

  /** Captures the participation the crossing built, at the moment of handoff. */
  async function crossWith(presentIds: string[]) {
    let seen: { members: { sectionRef: string; status: string }[] } | null = null;
    await performFocusCrossing(withheldReq(), {
      presence: async () => new Set(presentIds),
      assemble: async () => 'the readable body',
      prepare: async (input) => {
        seen = {
          members: input.participation.members.map((m) => ({ sectionRef: m.sectionRef, status: m.status })),
        };
        return null;
      },
      generate: () => ({ handoff: Promise.resolve(false), result: Promise.resolve({ ok: false }) }),
    });
    return seen;
  }

  it('a withheld member whose section is STILL THERE reaches MAIA as unverified', async () => {
    const seen = await crossWith(['s-still-there']);
    expect(seen!.members.find((m) => m.sectionRef === 's-still-there')!.status).toBe('unverified');
  });

  it('a withheld member whose section is GONE reaches MAIA as unavailable', async () => {
    const seen = await crossWith(['s-still-there']);
    expect(seen!.members.find((m) => m.sectionRef === 's-deleted')!.status).toBe('unavailable');
  });

  it('⭐ the same request yields the OPPOSITE states when the server sees otherwise', async () => {
    const a = await crossWith(['s-still-there']);
    const b = await crossWith(['s-deleted']);
    const at = (s: typeof a, ref: string) => s!.members.find((m) => m.sectionRef === ref)!.status;
    expect(at(a, 's-still-there')).toBe('unverified');
    expect(at(b, 's-still-there')).toBe('unavailable');
    expect(at(a, 's-deleted')).toBe('unavailable');
    expect(at(b, 's-deleted')).toBe('unverified');
    /* ⭐ The request never changed. Only the server's finding did — which is
       exactly what "the client is not authoritative" has to mean. */
  });

  it('⛔ there is no withheld-reason field on the wire to be believed', () => {
    expect(crossingSrc).not.toMatch(/withheldAs/);
    const route = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'app', 'api', 'writers-studio', 'focus', 'route.ts'), 'utf8'));
    expect(route).not.toMatch(/withheldAs/);
    const client = strip(fs.readFileSync(
      path.join(__dirname, '..', '..', '..', 'app', 'writers-studio', 'field', 'focusAskAct.ts'), 'utf8'));
    expect(client).not.toMatch(/withheldAs/);
  });

  it('⛔ presence is probed ONLY for withheld members — a readable body proves its own', async () => {
    const probed: string[][] = [];
    await performFocusCrossing(withheldReq(), {
      presence: async ({ sectionRefs }) => { probed.push([...sectionRefs]); return new Set(); },
      assemble: async () => 'body',
      prepare: async () => null,
      generate: () => ({ handoff: Promise.resolve(false), result: Promise.resolve({ ok: false }) }),
    });
    expect(probed).toHaveLength(1);
    expect(probed[0].sort()).toEqual(['s-deleted', 's-still-there']);
    expect(probed[0]).not.toContain('s-readable');
  });

  it('⛔ an unknown presence is not an absence — the probe fails to the weaker truth', () => {
    const probe = strip(fs.readFileSync(
      path.join(__dirname, '..', 'focusPresence.ts'), 'utf8'));
    // On error it returns every id it was asked about, so nothing is reported deleted.
    expect(probe).toMatch(/return new Set\(sectionRefs\);/);
  });

  it('⛔ the probe reads existence only — never a column that could carry prose', () => {
    const probe = fs.readFileSync(path.join(__dirname, '..', 'focusPresence.ts'), 'utf8');
    const select = probe.slice(probe.indexOf('SELECT'), probe.indexOf('WHERE'));
    expect(select).toMatch(/SELECT s\.id FROM/);
    expect(select).not.toMatch(/body|heading|text|content|length/i);
  });
});
