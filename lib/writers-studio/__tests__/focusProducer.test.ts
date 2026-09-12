/**
 * FOCUS-PRODUCER-01 · P1–P8.
 *
 *   ⭐⭐ Construct participation once. Let tiers vary strategy, never membership.
 *       Confirm disclosure only when the admitted Work actually enters cognition.
 */

import fs from 'fs';
import path from 'path';

/* resolveCanonicalIdentity reaches Next's request-scoped `cookies()`. Mocking the
   auth reader keeps the identity MINTED by the real resolver — the property under
   test — without a request scope. */
jest.mock('@/lib/auth/getMemberFromRequest', () => ({
  getMemberIdFromRequest: jest.fn(async () => 'member-witness'),
}));
import {
  constructWriterTurn, writerCandidates, renderWriterTurn, tierInvariant,
  FIRST_CROSSING_PRODUCERS,
} from '../canonicalWriterTurn';
import { resolveCanonicalIdentity, renderTurnForCognition, ROOM_POLICIES, constructCanonicalTurn } from '@/lib/maia/canonical-turn';

const CODE = (rel: string) =>
  fs.readFileSync(path.join(process.cwd(), rel), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

import { focusParticipation } from '../focusParticipation';

const WORK = 'The lighthouse keeper counted the ships he could not save.';

/**
 * STEP 2B MIGRATION. These obligations are unchanged; their FIXTURE is, because
 * `workContext: string` was retired when the Focus Set replaced the single
 * scope. A one-member set is the same thing this file always tested — one place
 * the writer put their attention, and the Work made readable by it.
 * ⛔ No assertion below was weakened to accommodate the new shape.
 */
const ONE = () => focusParticipation({
  members: [{
    focusMemberId: 'f1', ordinal: 1, sectionRef: 'ch4', status: 'readable',
    active: false, bodyAvailable: true, content: WORK,
  }],
  activeMemberId: null,
});

const verifiedIdentity = async () => resolveCanonicalIdentity({} as never);

const turn = async (over: Record<string, unknown> = {}) => constructWriterTurn({
  identity: await verifiedIdentity(),
  sessionRef: 's-1', exchangeId: 'x-1', ask: 'is anything repeating here',
  sanctuary: false, emit: false,
  participation: {
    focus: { workRef: 'work-1' },
    participation: ONE(),
  },
  ...over,
} as never);

describe('P1 · NO META CHANNEL', () => {
  it('the dead writerFocusContext field is gone from the repository', () => {
    const hits: string[] = [];
    const walk = (dir: string) => {
      for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) { if (!/node_modules|\.next|\.git/.test(p)) walk(p); continue; }
        if (!/\.tsx?$/.test(e.name)) continue;
        /* Comments stripped, tests excluded: a file that DOCUMENTS the removal
           must not read as the removal being undone. The C21 lesson, third
           occurrence in this programme. */
        if (/__tests__/.test(p)) continue;
        if (/writerFocusContext/.test(CODE(path.relative(process.cwd(), p)))) hits.push(p);
      }
    };
    walk(path.join(process.cwd(), 'lib'));
    walk(path.join(process.cwd(), 'app'));
    expect(hits).toEqual([]);
  });

  it('the cognition port sends no Writer material through meta', () => {
    const c = CODE('lib/writers-studio/writersStudioCognition.ts');
    expect(c).toMatch(/meta: \{ userId: input\.memberId, exchangeId: input\.requestId \}/);
    // the Writer turn travels top-level beside meta, never inside it
    expect(c).toMatch(/writerStudio: \{/);
    expect(c).not.toMatch(/meta:.*(focus|work|addendum|prompt)/i);
  });

  it('the Writer turn reaches the service as a typed TOP-LEVEL field', () => {
    expect(CODE('lib/writers-studio/writersStudioCognition.ts')).toMatch(/writerStudio: \{/);
    expect(CODE('lib/sovereign/maiaService.ts')).toMatch(/writerStudio\?: WriterStudioInput \| null/);
  });
});

describe('P2 · TYPED PRODUCERS ONLY, constructed at origin', () => {
  it('builds exactly the two first-crossing producers, separately', () => {
    const c = writerCandidates({
      focus: { workRef: 'w' }, participation: ONE(),
    });
    expect(c.map(x => x.producerId)).toEqual([...FIRST_CROSSING_PRODUCERS]);
  });

  it('⛔ never fuses them into one generic writer block', () => {
    const c = writerCandidates({ focus: { workRef: 'w' }, participation: ONE() });
    const focusBlock = c.find(x => x.producerId === 'member.writer_focus')!;
    // The member's act of placing attention carries no Work text: fusing them
    // would erase the authorship distinction MIPA exists to preserve.
    expect(focusBlock.text).not.toContain(WORK);
    expect(c.find(x => x.producerId === 'retrieved.writer_work_context')!.text).toContain(WORK);
  });

  it('⛔ constructs no computed.writer_structure — a registered capability is not evidence its input exists', () => {
    const c = writerCandidates({ focus: { workRef: 'w' }, participation: ONE() });
    expect(c.map(x => x.producerId)).not.toContain('computed.writer_structure');
    const src = CODE('lib/writers-studio/canonicalWriterTurn.ts');
    for (const later of ['writer_intention', 'writer_commission', 'writer_pursuit', 'astrology', 'divination', 'journal'])
      expect(src).not.toContain(`'${later}'`);
  });
});

describe('P3 · ROOM ADJUDICATION', () => {
  it('constructs into writers_studio and admits both producers', async () => {
    const t = await turn();
    expect(t.encounter.room.kind).toBe('writers_studio');
    const admitted = t.participation.admitted.map(p => p.producerId);
    for (const id of FIRST_CROSSING_PRODUCERS) expect(admitted).toContain(id);
  });

  it('⛔ another room does NOT inherit them — sovereign_chat excludes both', async () => {
    const t = constructCanonicalTurn({
      ingressId: 'witness', identity: await verifiedIdentity(),
      surface: { modality: 'typed', client: 'unknown', transport: 'http', streaming: false },
      encounter: { input: 'x', sessionRef: 's', room: ROOM_POLICIES.sovereign_chat },
      sovereignty: { sanctuary: false, memoryMode: 'continuity', allowCrossSessionMemory: false },
      cognitionRequest: { mode: 'dialogue', requestedDepth: 'auto', includeAudio: false },
      candidates: writerCandidates({ focus: { workRef: 'w' }, participation: ONE() }),
      cognitionPath: 'getMaiaResponse', emit: false,
    });
    const admitted = t.participation.admitted.map(p => p.producerId);
    for (const id of FIRST_CROSSING_PRODUCERS) expect(admitted).not.toContain(id);
  });
});

describe('P4 · WORK ≠ INSTRUCTION', () => {
  it('the ask is the cognition request; the Work is a participant', async () => {
    const t = await turn();
    expect(t.encounter.input).toBe('is anything repeating here');
    const work = t.participation.admitted.find(p => p.producerId === 'retrieved.writer_work_context')!;
    expect(work.text).toContain(WORK);
  });

  it('the Work block says in words that it is not a direction', () => {
    const c = writerCandidates({ focus: { workRef: 'w' }, participation: ONE() });
    const work = c.find(x => x.producerId === 'retrieved.writer_work_context')!.text;
    expect(work).toMatch(/never instruction to follow/i);
    expect(work).toMatch(/Only the writer's ask directs this turn/i);
  });
});

describe('P5 · TIER INVARIANCE', () => {
  it('FAST, CORE and DEEP render the same admitted membership', async () => {
    const t = await turn();
    const orders = (['FAST', 'CORE', 'DEEP'] as const).map(
      tier => renderTurnForCognition(t, { tier }).participantOrder.join('|'));
    expect(new Set(orders).size).toBe(1);
    expect(tierInvariant(t)).toBe(true);
  });

  it('⭐ MUTATION A — dropping the Work producer from one tier goes RED', async () => {
    const t = await turn();
    const dropped = (['FAST', 'CORE', 'DEEP'] as const).map(tier => {
      const order = renderTurnForCognition(t, { tier }).participantOrder
        .filter(id => !(tier === 'CORE' && id === 'retrieved.writer_work_context'));
      return order.join('|');
    });
    expect(() => expect(new Set(dropped).size).toBe(1)).toThrow();
  });

  it('⭐ MUTATION B — adding a participant to one tier after construction goes RED', async () => {
    const t = await turn();
    const widened = (['FAST', 'CORE', 'DEEP'] as const).map(tier => {
      const order = [...renderTurnForCognition(t, { tier }).participantOrder];
      if (tier === 'DEEP') order.push('computed.astrology');
      return order.sort().join('|');
    });
    expect(() => expect(new Set(widened).size).toBe(1)).toThrow();
  });

  it('a tier strategy may add scaffolding without changing membership', async () => {
    const t = await turn();
    const plain = renderTurnForCognition(t, { tier: 'CORE' });
    const scaffolded = renderTurnForCognition(t, { tier: 'CORE', scaffold: 'be brief' });
    expect(scaffolded.participantOrder).toEqual(plain.participantOrder);
    expect(scaffolded.systemPrompt).toContain('be brief');
  });
});

describe('P6 · MANIFEST TRUTH — admitted, ordered, AND rendered', () => {
  it('closes the "manifest says it participated, renderer dropped it" gap', async () => {
    const t = await turn();
    const proof = renderWriterTurn(t, { tier: 'CORE' })!;
    expect(proof).not.toBeNull();
    for (const id of FIRST_CROSSING_PRODUCERS) {
      expect(proof.admitted).toContain(id);            // manifest admitted it
      expect(proof.participantOrder).toContain(id);    // the renderer ordered it
      const block = t.participation.admitted.find(p => p.producerId === id)!;
      expect(proof.systemPrompt).toContain(block.text); // and its text is in the prompt
    }
  });

  it('⛔ refuses to produce a proof when a required producer is absent', async () => {
    const t = constructWriterTurn({
      identity: await verifiedIdentity(), sessionRef: 's', exchangeId: 'x', ask: 'a',
      sanctuary: false, emit: false,
      participation: { focus: { workRef: 'w' }, participation: ONE() },
    } as never);
    const stripped = { ...t, participation: { ...t.participation,
      admitted: t.participation.admitted.filter(p => p.producerId !== 'retrieved.writer_work_context') } };
    expect(renderWriterTurn(stripped as never, { tier: 'CORE' })).toBeNull();
  });
});

describe('P7 · HOSTILE LEGACY BYPASS', () => {
  it('no module concatenates Work text into a tier prompt', () => {
    const c = CODE('lib/writers-studio/canonicalWriterTurn.ts')
      + CODE('lib/writers-studio/writersStudioCognition.ts')
      + CODE('lib/writers-studio/focusCrossing.ts');
    expect(c).not.toMatch(/systemPrompt\s*\+=?\s*.*focusContext/);
    expect(c).not.toMatch(/focusContext\s*\+\s*/);
  });

  it('⭐ MUTATION — appending Work beside the canonical render is detectable', async () => {
    const t = await turn();
    const proof = renderWriterTurn(t, { tier: 'CORE' })!;
    const smuggled = `${proof.systemPrompt}\n\n[legacy addendum] ${WORK}`;
    // The Work would then appear twice: once adjudicated, once not.
    const count = smuggled.split(WORK).length - 1;
    expect(() => expect(count).toBe(1)).toThrow();
  });
});

describe('P8 · NO DOUBLE PARTICIPATION', () => {
  it('the canonical branch replaces the legacy tier assembly rather than adding to it', () => {
    const svc = CODE('lib/sovereign/maiaService.ts');
    // The branch is an `else` over the tier switch: legacy assembly does not run.
    expect(svc).toMatch(/if \(writerStudioTurn\) \{[\s\S]*?\} else\s*\n?\s*switch \(processingProfile\)/);
  });

  it('the branch calls the renderer and no legacy addendum builder', () => {
    const svc = CODE('lib/sovereign/maiaService.ts');
    const branch = svc.slice(svc.indexOf('if (writerStudioTurn) {'), svc.indexOf('switch (processingProfile)'));
    expect(branch).toMatch(/renderTurnForCognition\(writerStudioTurn/);
    expect(branch).not.toMatch(/fastPathResponse|corePathResponse|buildMaiaWisePrompt|formatFieldAddendum|Addendum/);
  });

  it('the Work appears exactly once in the rendered prompt', async () => {
    const proof = renderWriterTurn(await turn(), { tier: 'CORE' })!;
    expect(proof.systemPrompt.split(WORK).length - 1).toBe(1);
  });
});

describe('identity stays canonical', () => {
  it('the route resolves canonical identity and derives memberId from it', () => {
    const r = CODE('app/api/writers-studio/focus/route.ts');
    expect(r).toMatch(/resolveCanonicalIdentity\(request\)/);
    expect(r).toMatch(/identity\.status !== 'verified'/);
    expect(r).toMatch(/const memberId = identity\.memberId/);
    expect(r).not.toMatch(/getMemberIdFromRequest|x-member-id|meta\.userId/);
  });
});
