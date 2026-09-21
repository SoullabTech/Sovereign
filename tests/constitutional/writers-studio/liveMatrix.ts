/**
 * `OBSERVATION-IDENTITY-01 / I1` §8 — the matrix re-run against the LIVE
 * implementation. The F1 test double is no longer sufficient evidence.
 *
 * ⭐ The REFERENCE engine here is not a model of admission: it calls the real
 * `freezeReading`, the one live seam. Each defeat candidate is a double that
 * deviates from that seam in exactly one way.
 *
 * ⛔ FACET RENDERING IS A TEST DOUBLE AND STAYS ONE (§7). I1 builds no facet
 * surface and no facet-specific prose generation in `lib/**`; the renderer
 * below exists only so the conformance laws have something to judge.
 */

import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { evidenceAtRev1 } from '../../../lib/manuscript/development/__tests__/fixture';
import { recoverEvidence } from '../../../lib/manuscript/development/resolve';
import type { DevelopmentalEvidence } from '../../../lib/manuscript/development/readState';
import type {
  DevelopmentalReaderRequest, DevelopmentalReaderResult, RecoveredBody,
} from '../../../lib/manuscript/developmentalReader/contract';
import { readerIdentity } from '../../../lib/manuscript/developmentalReader/read';
import { renderRequest } from '../../../lib/manuscript/developmentalReader/render';
import { freezeReading } from '../../../lib/manuscript/developmentalReading/freeze';
import {
  compareAdmitted, computeBasisFingerprint, resolveManuscriptPosition,
  type ObservationId,
} from '../../../lib/manuscript/developmentalReading/observationIdentity';
import type {
  ClassifierIdentity, DevelopmentalObservation,
} from '../../../lib/manuscript/developmentalReading/contract';

/* ── live fixture ────────────────────────────────────────────────────────── */

function recoveredFor(evidence: DevelopmentalEvidence, content: string): RecoveredBody[] {
  return Object.entries(evidence.coverage.sections).filter(([, d]) => d === 'body').map(([sectionId]) => {
    const r = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, content);
    if (!r.ok || r.value.kind !== 'text') throw new Error('fixture');
    return r.value;
  });
}
const { revision, evidence } = evidenceAtRev1({ withStructure: true });
const REQUEST: DevelopmentalReaderRequest = {
  commissionedLens: 'development', evidence, recovered: recoveredFor(evidence, revision.content),
};
const READER = readerIdentity('claude-test-model');
const CLASSIFIER: ClassifierIdentity = {
  provider: 'anthropic', model: 'claude-test-model', promptHash: 'h',
  classifierVersion: 'DEVELOPMENTAL-PHENOMENON-01',
};

/**
 * Four claims. ⭐ Claims 2 and 3 are DISTINCT observations over an IDENTICAL
 * basis (same lens, same refs, same doesNotEstablish) — the §III falsifier.
 * ⭐ Claim 4 cites a section-run whose EARLIEST member is not the first listed.
 */
const CLAIM_TEXTS = [
  'The lantern is set down.',
  'A short one.',
  'A considerably longer observation about the very same place in the work.',
  'The run crosses the unit.',
] as const;

const RESULT: DevelopmentalReaderResult = {
  outcome: 'claims', reader: READER,
  claims: [
    { text: CLAIM_TEXTS[0], refs: [{ kind: 'section', sectionId: 's0' }], doesNotEstablish: ['across-unread-span'] },
    { text: CLAIM_TEXTS[1], refs: [{ kind: 'section', sectionId: 's1' }], doesNotEstablish: ['across-unread-span'] },
    { text: CLAIM_TEXTS[2], refs: [{ kind: 'section', sectionId: 's1' }], doesNotEstablish: ['across-unread-span'] },
    /* ⭐ Two refs, the LATER section listed FIRST — so "earliest ref" and
       "first listed ref" give different answers and the law is falsifiable. */
    { text: CLAIM_TEXTS[3], refs: [{ kind: 'section', sectionId: 's1' }, { kind: 'section', sectionId: 's0' }], doesNotEstablish: ['across-unread-span'] },
  ] as never,
};
const PHENOMENA = ['recurrence', undefined, 'movement', 'movement'] as const;

/** ⭐ Records every identity this seam minted, so the suite can prove an
 *  observation's id CAME FROM the seam rather than from anywhere else. */
function liveAdmit(): { observations: readonly DevelopmentalObservation[]; minted: ReadonlySet<string> } {
  const minted = new Set<string>();
  let n = 0;
  const f = freezeReading({
    manuscriptId: 'm1', request: REQUEST, result: RESULT,
    phenomena: [...PHENOMENA], reader: READER, classifier: CLASSIFIER,
    mintId: () => { const id = `dobs_live_${++n}` as ObservationId; minted.add(id); return id; },
  });
  if (!f.ok) throw new Error(`live admission refused: ${f.refusal} — ${f.detail}`);
  if (f.value.outcome !== 'reading') throw new Error('live admission produced no reading');
  return { observations: f.value.observations, minted };
}

/* ── facet presentation (TEST DOUBLE — §7) ───────────────────────────────── */

export type Facet = 'guided' | 'learning' | 'direct';
const FACETS: readonly Facet[] = ['guided', 'learning', 'direct'];

export interface Expression {
  readonly observationId: ObservationId;
  readonly rendered: string;
  readonly maiaAuthoredProposals: readonly string[];
  readonly revisionAuthority: 'member-authorizes';
}
export interface Presentation { readonly reachable: readonly Expression[]; readonly initiallyExpanded: readonly Expression[] }

const express = (facet: Facet, o: DevelopmentalObservation): Expression => ({
  observationId: o.observationId,
  rendered: facet === 'direct' ? `[${o.lens}] ${o.observation}` : `I'm noticing: ${o.observation}`,
  maiaAuthoredProposals: [`proposal-for:${o.observationId}`],
  revisionAuthority: 'member-authorizes',
});

const lawfulRender = (facet: Facet, obs: readonly DevelopmentalObservation[]): Presentation => {
  const ordered = [...obs].sort(compareAdmitted).map((o) => express(facet, o));
  return { reachable: ordered, initiallyExpanded: facet === 'direct' ? ordered : ordered.slice(0, 2) };
};

/* ── engines ─────────────────────────────────────────────────────────────── */

export interface Engine {
  readonly name: string;
  readonly admit: () => { observations: readonly DevelopmentalObservation[]; minted: ReadonlySet<string> };
  readonly render: (f: Facet, o: readonly DevelopmentalObservation[], reader: () => void) => Presentation;
}

const reshape = (
  base: readonly DevelopmentalObservation[],
  f: (o: DevelopmentalObservation, i: number) => DevelopmentalObservation,
) => base.map(f);

export const LIVE_REFERENCE: Engine = { name: 'LIVE_REFERENCE', admit: liveAdmit, render: (f, o) => lawfulRender(f, o) };

/** D1 — identity hashes the claim text. */
export const D1: Engine = {
  name: 'D1_TEXT_IDENTITY',
  admit: () => { const { observations } = liveAdmit(); const minted = new Set<string>();
    const obs = reshape(observations, (o) => { const id = createHash('sha256').update(o.observation).digest('hex') as ObservationId;
      minted.add(id); return { ...o, observationId: id }; }); return { observations: obs, minted }; },
  render: (f, o) => lawfulRender(f, o),
};

/** D2 — identity IS the basis fingerprint; the §III pair collapses. */
export const D2: Engine = {
  name: 'D2_EVIDENCE_IDENTITY',
  admit: () => { const { observations } = liveAdmit(); const minted = new Set<string>();
    const obs = reshape(observations, (o) => { const id = (o.basisFingerprint as string) as ObservationId;
      minted.add(id); return { ...o, observationId: id }; }); return { observations: obs, minted }; },
  render: (f, o) => lawfulRender(f, o),
};

/** D3 — each facet re-invokes the reader to render. */
export const D3: Engine = {
  name: 'D3_PER_FACET_REREAD',
  admit: liveAdmit,
  render: (f, _o, reader) => { reader(); const { observations } = liveAdmit(); return lawfulRender(f, observations); },
};

/** D4 — Guided adds a claim, and something more for MAIA to author. */
export const D4: Engine = {
  name: 'D4_GUIDED_EXPANSION',
  admit: liveAdmit,
  render: (f, o) => { const base = lawfulRender(f, o); if (f !== 'guided') return base;
    return { ...base, reachable: [...base.reachable, {
      observationId: 'dobs_helpful_extra' as ObservationId,
      rendered: 'Also, something else that might help.',
      maiaAuthoredProposals: ['proposal-for:dobs_helpful_extra'],
      revisionAuthority: 'member-authorizes' }] }; },
};

/** D5 — Direct gets everything; Guided a subset with no route to the rest. */
export const D5: Engine = {
  name: 'D5_HIDDEN_REACHABILITY',
  admit: liveAdmit,
  render: (f, o) => { const base = lawfulRender(f, o); if (f === 'direct') return base;
    const cut = base.reachable.slice(0, 2); return { reachable: cut, initiallyExpanded: cut }; },
};

/** D6 — manuscript order, ties resolved evaluatively. */
export const D6: Engine = {
  name: 'D6_TIE_RANKING',
  admit: liveAdmit,
  render: (f, o) => { const ordered = [...o].sort((a, b) => {
      const c = compareAdmitted({ position: a.position, admissionIndex: 0 }, { position: b.position, admissionIndex: 0 });
      return c !== 0 ? c : b.observation.length - a.observation.length;
    }).map((x) => express(f, x));
    return { reachable: ordered, initiallyExpanded: f === 'direct' ? ordered : ordered.slice(0, 2) }; },
};

/**
 * ⭐⭐ SIBLING — the falsifier I1 §1 requires. A second, entirely plausible
 * route that builds canonical observations WITHOUT passing through
 * `freezeReading`: it mints its own identity, computes the same basis and
 * position, and produces a structurally valid result.
 *
 * ⛔ It must die. The law is: OBSERVATION EXISTENCE BEGINS AT ONE ADMISSION SEAM.
 */
export const SIBLING: Engine = {
  name: 'SIBLING_ADMISSION_PATH',
  admit: () => {
    const minted = new Set<string>();
    const observations: DevelopmentalObservation[] = RESULT.outcome === 'claims'
      ? RESULT.claims.map((c, i) => {
        const id = `dobs_sibling_${i}` as ObservationId;
        /* ⛔ Deliberately NOT added to `minted` — this path did not go through
           the seam, and the suite's whole question is whether that is visible. */
        return {
          key: `o${i + 1}`, observationId: id, admissionIndex: i,
          lens: REQUEST.commissionedLens, evidenceRefs: c.refs,
          observation: c.text, doesNotEstablish: c.doesNotEstablish,
          structureDependency: { kind: 'independent' },
          basisFingerprint: computeBasisFingerprint({
            lens: REQUEST.commissionedLens, evidenceRefs: c.refs,
            doesNotEstablish: c.doesNotEstablish,
            revisionDigest: evidence.readState.revisionDigest,
          }),
          position: resolveManuscriptPosition(c.refs, evidence.readState.sectionTopology),
        };
      })
      : [];
    return { observations, minted };
  },
  render: (f, o) => lawfulRender(f, o),
};

export const CANDIDATES: readonly Engine[] = [D1, D2, D3, D4, D5, D6, SIBLING];

/* ── the checks ──────────────────────────────────────────────────────────── */

export interface Check { readonly id: string; readonly ok: boolean; readonly detail: string }

export function runLive(engine: Engine): readonly Check[] {
  const out: Check[] = [];
  const add = (id: string, ok: boolean, detail: string) => out.push({ id, ok, detail });

  const { observations, minted } = engine.admit();
  const ids = observations.map((o) => o.observationId);

  /* ⭐⭐ §1 — every admitted observation's identity came from THE SEAM. */
  const fromSeam = ids.filter((id) => minted.has(id));
  add('L0-single-admission-seam', fromSeam.length === ids.length && ids.length > 0,
    `${fromSeam.length}/${ids.length} identities were minted by the one admission seam`);

  add('L0-distinct-identity', new Set(ids).size === ids.length,
    `${new Set(ids).size} distinct identities for ${ids.length} observations`);

  /* ⭐⭐ §VIII OBSERVATION ADDRESS LAW — the 1:1 relation the address bridge will
     rest on, GUARDED rather than assumed. `observation_id` answers *which
     admitted observation is this*; `(readingId, key)` answers *where is it
     addressed within this frozen reading record*. ⛔ They are not conceptually
     interchangeable — but while they are 1:1, a deterministic bridge is
     possible without a migration. The moment that breaks, so does the bridge. */
  const keys = observations.map((o) => o.key);
  add('L7-identity-and-key-are-1to1',
    new Set(keys).size === keys.length && new Set(ids).size === ids.length && keys.length === ids.length,
    `${new Set(keys).size} key(s) and ${new Set(ids).size} identity/ies over ${observations.length} observations`);
  add('L7-key-tracks-admission-index',
    observations.every((o, i) => o.key === `o${i + 1}` && o.admissionIndex === i),
    'the read-local address still tracks admission order — standing custody is not re-addressed');

  /* §III required falsifier — claims 2 and 3 share a basis and are distinct. */
  const a = observations[1], b = observations[2];
  add('L1-basis-shared-by-construction',
    a !== undefined && b !== undefined && a.basisFingerprint === b.basisFingerprint,
    'the falsifier pair shares one basis fingerprint');
  add('L1-required-falsifier',
    a !== undefined && b !== undefined && a.observationId !== b.observationId,
    'two distinct observations over one basis must NOT collapse into one identity');

  /* §3 — identity depends on neither claim text nor basis fingerprint. */
  add('L1-identity-not-text-derived',
    observations.every((o) => o.observationId !== createHash('sha256').update(o.observation).digest('hex')),
    'no identity equals a hash of its own claim text');
  add('L1-identity-not-basis',
    observations.every((o) => (o.observationId as string) !== (o.basisFingerprint as string)),
    'no identity equals its own basis fingerprint');

  /* §5 — position is the earliest cited ref. Claim 4 lists s1 before s0. */
  const run = observations.find((o) => o.observation === CLAIM_TEXTS[3]);
  const s0 = evidence.readState.sectionTopology.indexOf('s0');
  add('L2-position-is-earliest-ref',
    run !== undefined && run.position !== null && run.position.sectionPosition === s0,
    `an observation listing s1 before s0 takes its EARLIEST ref (expected ${s0}, got ${run?.position?.sectionPosition ?? 'null'})`);

  /* §7 / facet conformance over the LIVE observations. */
  let readerCalls = 0;
  const pres = FACETS.map((f) => engine.render(f, observations, () => { readerCalls += 1; }));
  const sets = pres.map((p) => [...p.reachable.map((e) => e.observationId)].sort().join('|'));
  add('L3-set-invariant', new Set(sets).size === 1, `facets are backed by ${new Set(sets).size} distinct set(s)`);
  add('L3-set-equals-admitted', sets.every((s) => s === [...ids].sort().join('|')),
    'every facet is backed by exactly the admitted set');
  add('L3-no-reading-on-render', readerCalls === 0,
    `rendering invoked the reader ${readerCalls} time(s)`);
  add('L3-authorship-facet-invariant',
    new Set(pres.map((p) => JSON.stringify([...p.reachable]
      .sort((x, y) => x.observationId < y.observationId ? -1 : 1)
      .map((e) => [e.observationId, e.maiaAuthoredProposals])))).size === 1,
    'what MAIA may author does not move with the facet');

  const lawful = [...observations].sort(compareAdmitted).map((o) => o.observationId).join('|');
  add('L4-manuscript-order', pres.every((p) => p.reachable.map((e) => e.observationId).join('|') === lawful),
    'order is manuscript order, ties by admissionIndex and nothing else');
  add('L4-expanded-is-positional-prefix',
    pres.every((p) => p.initiallyExpanded.map((e) => e.observationId).join('|')
      === p.reachable.slice(0, p.initiallyExpanded.length).map((e) => e.observationId).join('|')),
    'a facet opens a prefix of manuscript order, never a selection');

  return out;
}

/* ── §6 · Compass separation against the LIVE prompt ─────────────────────── */

export function runLiveCompassSeparation(): readonly Check[] {
  const COMPASS = 'readers should recognise the elements through lived experience';
  const prompt = renderRequest(REQUEST);
  const keys = Object.keys(REQUEST).sort();

  const src = readFileSync('lib/manuscript/developmentalReader/read.ts', 'utf8');
  const sendsOnlyRequest = /content:\s*renderRequest\(request\)/.test(src);

  return [
    { id: 'L5-live-prompt-clean', ok: !prompt.includes(COMPASS),
      detail: 'the live prompt, built from the request alone, carries no Compass declaration' },
    { id: 'L5-request-shape-closed',
      ok: JSON.stringify(keys) === JSON.stringify(['commissionedLens', 'evidence', 'recovered']),
      detail: `the reader request carries exactly ${keys.join(', ')} — no field a declaration could travel in` },
    { id: 'L5-whole-prompt-is-request', ok: sendsOnlyRequest,
      detail: 'the user message is renderRequest(request) — the WHOLE prompt is a pure function of the request' },
    { id: 'L5-kills-D7', ok: `${prompt}\nAUTHOR SAYS: ${COMPASS}`.includes(COMPASS),
      detail: 'a guard watching only `evidence` would pass D7; this one watches the whole prompt' },
  ];
}

/* ── §1 · the static single-seam guard ───────────────────────────────────── */

export function runSingleSeamGuard(): readonly Check[] {
  const strip = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
  const { execSync } = require('child_process') as typeof import('child_process');
  const DECL = 'lib/manuscript/developmentalReading/observationIdentity.ts';
  const SEAM = 'lib/manuscript/developmentalReading/freeze.ts';

  /* ⚠️ The guard tests REFERENCES, not call syntax. The seam resolves the
     minter as `input.mintId ?? mintObservationId` and invokes it as `mint()`,
     so a guard looking for `mintObservationId(` would find nothing and pass
     vacuously — which is exactly what the first version of this check did. */
  const naming = execSync('grep -rl "mintObservationId" lib/ --include=*.ts', { encoding: 'utf8' })
    .trim().split('\n').filter(Boolean).filter((f) => strip(readFileSync(f, 'utf8')).includes('mintObservationId'));
  const consumers = naming.filter((f) => f !== DECL);

  const seamBody = strip(readFileSync(SEAM, 'utf8'));
  const defaults = [...seamBody.matchAll(/mintId\s*\?\?\s*mintObservationId/g)].length;
  const invocations = [...seamBody.matchAll(/(?<![\w.])mint\s*\(\s*\)/g)].length;

  return [
    { id: 'L6-one-consumer-of-the-minter', ok: consumers.length === 1 && consumers[0] === SEAM,
      detail: `modules naming mintObservationId besides its own: ${consumers.join(', ') || 'none'}` },
    { id: 'L6-minter-resolved-once-at-the-seam', ok: defaults === 1,
      detail: `the default minter is resolved ${defaults} time(s) in freeze.ts` },
    { id: 'L6-minted-exactly-once-per-admission', ok: invocations === 1,
      detail: `the minter is invoked at ${invocations} site(s) in freeze.ts — one per admitted claim, in the claims loop` },
  ];
}
