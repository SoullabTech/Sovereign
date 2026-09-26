import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

import {
  ACCEPTED_QUERIES,
  PILOT_PRESENTATIONS,
  REFUSAL_QUERIES,
} from './fixture';
import {
  composePilotDescription,
  composeResolvedInquiry,
  renderPilotDescription,
  resolveExplicitCapabilityInquiry,
} from './resolver';
import {
  exactRenderedDescription,
  renderedDescriptionIsTerminal,
  runDescriptionPayloadLaws,
  runPilotFixtureLaws,
} from './contract';
import {
  FALSIFIER_INPUTS,
  SYNTHETIC_CONTEXTUAL_RESOLVER_SOURCE,
  SYNTHETIC_RUNTIME_IMPORT,
  mutatePayloadCopy,
  mutatePayloadWithAvailability,
  mutatePayloadWithRoute,
  mutateRenderedWithOffer,
  mutantFallbackOnAbstain,
  widenedPilotFixture,
} from './candidates';

const line = (text: string) => process.stdout.write(text + '\n');
let exit = 0;

const PLATFORM_KNOWLEDGE_PATH = path.resolve(
  process.cwd(),
  'lib/sovereign/platformKnowledge.ts',
);

const EXPECTED_PLATFORM_KNOWLEDGE_SHA256 =
  '050a8ef1bc79be1c2c9f32644b7e35151d59db1bf090e9fb4fe205e93b5add29';

function sha256File(file: string): string {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function failedLawIds(results: readonly { lawId: string; ok: boolean }[]): string[] {
  return results.filter((result) => !result.ok).map((result) => result.lawId);
}
function importSources(source: string): string[] {
  const refs: string[] = [];
  const re = /^\s*import(?:[\s\S]*?)\sfrom\s+['"]([^'"]+)['"];?/gm;
  let match: RegExpExecArray | null;
  while ((match = re.exec(source))) refs.push(match[1]);
  return refs;
}

const FORBIDDEN_RUNTIME_IMPORT_FRAGMENTS = [
  'lib/sovereign/',
  'lib/maia/',
  'lib/voice/',
  'lib/house/',
  'app/house',
  'config/accessMatrix',
  'next/navigation',
] as const;

function forbiddenRuntimeImports(source: string): string[] {
  return importSources(source).filter((ref) =>
    FORBIDDEN_RUNTIME_IMPORT_FRAGMENTS.some((needle) => ref.includes(needle)),
  );
}

const FORBIDDEN_CONTEXT_SIGNALS = [
  'conversationHistory',
  'memberId',
  'userId',
  'sessionId',
  'currentRoom',
  'memory',
  'embedding',
  'semanticSimilarity',
  'confidence',
  'relevance',
] as const;

function forbiddenContextSignals(source: string): string[] {
  return FORBIDDEN_CONTEXT_SIGNALS.filter((signal) =>
    new RegExp('\\b' + signal + '\\b').test(source),
  );
}

function assertNamedKill(
  label: string,
  failed: readonly string[],
  named: string,
  collateral: readonly string[] = [],
): void {
  if (!failed.includes(named)) {
    line('  ⛔ SURVIVED   ' + label + ' → ' + named);
    line('              failed: ' + (failed.join(', ') || 'none'));
    exit = 1;
    return;
  }

  const actualCollateral = failed.filter((id) => id !== named);
  const stale = collateral.filter((id) => !actualCollateral.includes(id));
  const unclassified = actualCollateral.filter((id) => !collateral.includes(id));

  line('  DEAD        ' + label + ' → ' + named);
  if (actualCollateral.length) {
    line('              collateral: ' + actualCollateral.join(', '));
  }
  if (stale.length) {
    line('              ⛔ stale classification: ' + stale.join(', '));
    exit = 1;
  }
  if (unclassified.length) {
    line('              ⛔ UNCLASSIFIED: ' + unclassified.join(', '));
    exit = 1;
  }
}
line('');
line('── SOULLAB WHOLE-ORGANISM / O8R1 · EXPLICIT CAPABILITY INQUIRY ─────');
line('');

line('── fixed pilot fixture ───────────────────────────────────────────────');
const fixtureFailures = failedLawIds(runPilotFixtureLaws(PILOT_PRESENTATIONS));
if (fixtureFailures.length) {
  line('  ⛔ pilot fixture fails: ' + fixtureFailures.join(', '));
  exit = 1;
} else {
  line('  ✅ pilot fixture 4/4 laws');
  line('  ✅ allowlist journal.create · journal.dream · astrology.reading');
}

line('');
line('── accepted query matrix ─────────────────────────────────────────────');
let acceptedPass = 0;
for (const candidate of ACCEPTED_QUERIES) {
  const resolution = resolveExplicitCapabilityInquiry(candidate.input);
  try {
    assert.equal(resolution.kind, 'DESCRIBE');
    if (resolution.kind !== 'DESCRIBE') throw new Error('NOT_DESCRIBE');

    assert.equal(resolution.capabilityId, candidate.capabilityId);
    assert.equal(resolution.envelope, candidate.envelope);

    const payload = composeResolvedInquiry(resolution);
    assert.ok(payload);

    const payloadFailures = failedLawIds(runDescriptionPayloadLaws(payload));
    assert.deepEqual(payloadFailures, []);

    const rendered = renderPilotDescription(payload);
    assert.equal(rendered, exactRenderedDescription(payload));
    assert.equal(renderedDescriptionIsTerminal(rendered, payload), true);

    acceptedPass += 1;
    line('  ✅ ' + candidate.input + ' → ' + resolution.capabilityId);
  } catch (error) {
    line('  ⛔ accepted query failed: ' + candidate.input);
    exit = 1;
  }
}
line('');
line('── refusal query matrix ──────────────────────────────────────────────');
let refusalPass = 0;
for (const candidate of REFUSAL_QUERIES) {
  const resolution = resolveExplicitCapabilityInquiry(candidate.input);
  try {
    assert.equal(resolution.kind, 'ABSTAIN');
    if (resolution.kind !== 'ABSTAIN') throw new Error('NOT_ABSTAIN');

    assert.equal(resolution.reason, candidate.reason);
    assert.equal(composeResolvedInquiry(resolution), null);

    refusalPass += 1;
    line('  ✅ ABSTAIN ' + candidate.reason + ' ← ' + candidate.input);
  } catch {
    line('  ⛔ refusal query failed: ' + candidate.input);
    line('      got ' + JSON.stringify(resolution));
    exit = 1;
  }
}

line('');
line('── F-O8-01..07 · required refusal falsifiers ─────────────────────────');
let falsifiersDead = 0;
for (const candidate of FALSIFIER_INPUTS) {
  const resolution = resolveExplicitCapabilityInquiry(candidate.input);
  const dead =
    resolution.kind === 'ABSTAIN'
    && resolution.reason === candidate.reason
    && composeResolvedInquiry(resolution) === null;

  if (dead) {
    falsifiersDead += 1;
    line('  DEAD        ' + candidate.id + ' → ' + candidate.reason);
  } else {
    line('  ⛔ SURVIVED   ' + candidate.id + ' → ' + candidate.reason);
    exit = 1;
  }
}
line('');
line('── F-O8-08 · contextual inference ────────────────────────────────────');
const resolverSource = fs.readFileSync(
  path.join(path.dirname(new URL(import.meta.url).pathname), 'resolver.ts'),
  'utf8',
);
const liveContextSignals = forbiddenContextSignals(resolverSource);
if (resolveExplicitCapabilityInquiry.length !== 1 || liveContextSignals.length) {
  line('  ⛔ live resolver carries contextual inference surface');
  line('      signals: ' + liveContextSignals.join(', '));
  exit = 1;
} else {
  const syntheticSignals = forbiddenContextSignals(
    SYNTHETIC_CONTEXTUAL_RESOLVER_SOURCE,
  );
  if (!syntheticSignals.includes('conversationHistory')) {
    line('  ⛔ contextual-inference guard failed to detect mutant');
    exit = 1;
  } else {
    falsifiersDead += 1;
    line('  DEAD        F-O8-08 → CONTEXTUAL_INFERENCE_FORBIDDEN');
  }
}

line('');
line('── F-O8-09..12 · utterance/payload mutations ─────────────────────────');
const basePayload = composePilotDescription('journal.create');
const baseRendered = renderPilotDescription(basePayload);

const offered = mutateRenderedWithOffer(baseRendered);
if (!renderedDescriptionIsTerminal(offered, basePayload)) {
  falsifiersDead += 1;
  line('  DEAD        F-O8-09 → DESCRIPTION_NOT_OFFER');
} else {
  line('  ⛔ SURVIVED   F-O8-09 → DESCRIPTION_NOT_OFFER');
  exit = 1;
}

const routeFailures = failedLawIds(
  runDescriptionPayloadLaws(mutatePayloadWithRoute(basePayload)),
);
assertNamedKill(
  'F-O8-10',
  routeFailures,
  'DESCRIPTION_NOT_ROUTING',
  ['DESCRIPTION_PAYLOAD_SHAPE'],
);
if (routeFailures.includes('DESCRIPTION_NOT_ROUTING')) falsifiersDead += 1;

const availabilityFailures = failedLawIds(
  runDescriptionPayloadLaws(mutatePayloadWithAvailability(basePayload)),
);
assertNamedKill(
  'F-O8-11',
  availabilityFailures,
  'DESCRIPTION_NOT_AVAILABILITY',
  ['DESCRIPTION_PAYLOAD_SHAPE'],
);
if (availabilityFailures.includes('DESCRIPTION_NOT_AVAILABILITY')) {
  falsifiersDead += 1;
}

const copyFailures = failedLawIds(
  runDescriptionPayloadLaws(mutatePayloadCopy(basePayload)),
);
assertNamedKill('F-O8-12', copyFailures, 'EXACT_COPY_REQUIRED');
if (copyFailures.includes('EXACT_COPY_REQUIRED')) falsifiersDead += 1;
line('');
line('── F-O8-13 · abstention non-substitution ─────────────────────────────');
const abstainResolution = resolveExplicitCapabilityInquiry('I had a dream.');
const realAbstainPayload = composeResolvedInquiry(abstainResolution);
const mutantAbstainPayload = mutantFallbackOnAbstain(abstainResolution);
if (realAbstainPayload === null && mutantAbstainPayload !== null) {
  falsifiersDead += 1;
  line('  DEAD        F-O8-13 → ABSTAIN_NON_SUBSTITUTION');
} else {
  line('  ⛔ SURVIVED   F-O8-13 → ABSTAIN_NON_SUBSTITUTION');
  exit = 1;
}

line('');
line('── F-O8-14 · pilot allowlist widening ────────────────────────────────');
const widenedFailures = failedLawIds(
  runPilotFixtureLaws(widenedPilotFixture() as any),
);
assertNamedKill(
  'F-O8-14',
  widenedFailures,
  'PILOT_ALLOWLIST_FIXED',
  ['EXACT_COPY_CUSTODY'],
);
if (widenedFailures.includes('PILOT_ALLOWLIST_FIXED')) falsifiersDead += 1;

line('');
line('── F-O8-15 · runtime coupling ────────────────────────────────────────');
const THIS_DIR = path.dirname(new URL(import.meta.url).pathname);
for (const file of ['fixture.ts', 'resolver.ts', 'contract.ts', 'candidates.ts', 'matrix.ts']) {
  const source = fs.readFileSync(path.join(THIS_DIR, file), 'utf8');
  const hits = forbiddenRuntimeImports(source);
  if (hits.length) {
    line('  ⛔ ' + file + ' forbidden runtime imports: ' + hits.join(', '));
    exit = 1;
  } else {
    line('  ✅ ' + file + ' has no forbidden runtime imports');
  }
}

const syntheticRuntimeHits = forbiddenRuntimeImports(SYNTHETIC_RUNTIME_IMPORT);
if (
  syntheticRuntimeHits.length === 1
  && syntheticRuntimeHits[0].includes('lib/sovereign/platformKnowledge')
) {
  falsifiersDead += 1;
  line('  DEAD        F-O8-15 → RUNTIME_CONSUMER_FORBIDDEN');
} else {
  line('  ⛔ runtime-coupling guard failed to detect mutant');
  exit = 1;
}
line('');
line('── platformKnowledge witness custody ─────────────────────────────────');
const platformHash = sha256File(PLATFORM_KNOWLEDGE_PATH);
if (platformHash === EXPECTED_PLATFORM_KNOWLEDGE_SHA256) {
  line('  ✅ platformKnowledge witness MATCH');
} else {
  line('  ⛔ PLATFORM_KNOWLEDGE_WITNESS_DRIFT');
  line('      expected ' + EXPECTED_PLATFORM_KNOWLEDGE_SHA256);
  line('      live     ' + platformHash);
  exit = 1;
}

line('');
line('── function arity / no-context guard ────────────────────────────────');
for (const [name, arity] of [
  ['resolveExplicitCapabilityInquiry', resolveExplicitCapabilityInquiry.length],
  ['composePilotDescription', composePilotDescription.length],
  ['composeResolvedInquiry', composeResolvedInquiry.length],
  ['renderPilotDescription', renderPilotDescription.length],
] as const) {
  if (arity !== 1) {
    line('  ⛔ ' + name + ' arity=' + arity);
    exit = 1;
  } else {
    line('  ✅ ' + name + ' accepts exactly one semantic input');
  }
}

line('');
line('── verdict ───────────────────────────────────────────────────────────');
line('  pilot fixture laws   ' + (fixtureFailures.length ? 'FAIL' : '4/4 PASS'));
line('  accepted queries     ' + acceptedPass + '/' + ACCEPTED_QUERIES.length + ' PASS');
line('  refusal queries      ' + refusalPass + '/' + REFUSAL_QUERIES.length + ' PASS');
line('  falsifiers dead      ' + falsifiersDead + '/15');
line('  platform map witness ' + (platformHash === EXPECTED_PLATFORM_KNOWLEDGE_SHA256 ? 'MATCH' : 'DRIFT'));
line('  matrix               ' + (exit === 0 && falsifiersDead === 15 ? 'LETHAL + DISCRIMINATING' : '⛔ NOT LETHAL'));
line('');
line('  ⛔ TEST/GOVERNANCE ONLY · NO MAIA/HOUSE WIRING · NO RUNTIME DESCRIPTION');

process.exit(exit === 0 && falsifiersDead === 15 ? 0 : 1);
