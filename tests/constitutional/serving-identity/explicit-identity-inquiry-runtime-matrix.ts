/**
 * F2-IQ runtime classifier executable falsification.
 *
 * Proves the production classifier implements the canonical F2-IQ contract
 * while remaining current-turn-only, pure, non-persistent, non-disclosing,
 * and disconnected from D2/D1.
 *
 * Run: npm run matrix:serving-disclosure-f2-iq-runtime
 */

import { readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import {
  classifyExplicitIdentityInquiry,
  EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION,
  type ExplicitIdentityInquiryClassification,
} from '../../../lib/consciousness/explicitIdentityInquiryClassifier';

const BASE = 'c346031f7241280982f56f0e4eb760728761c412';

type Expected =
  | {
      classification: 'explicit';
      target?: Extract<ExplicitIdentityInquiryClassification, { classification: 'explicit' }>['target'];
      basis?: Extract<ExplicitIdentityInquiryClassification, { classification: 'explicit' }>['basis'];
    }
  | { classification: 'not_explicit' }
  | { classification: 'ambiguous' };

type Fixture = {
  id: string;
  utterance: string;
  expected: Expected;
};

const FIXTURES: readonly Fixture[] = [
  {
    id: 'provider-question',
    utterance: 'Which provider is serving me right now?',
    expected: { classification: 'explicit', target: 'serving_provider' },
  },
  {
    id: 'model-question',
    utterance: 'Which model is answering me right now?',
    expected: { classification: 'explicit', target: 'serving_model' },
  },
  {
    id: 'execution-domain-no-keyword',
    utterance: 'Are you running locally right now?',
    expected: { classification: 'explicit', target: 'execution_domain' },
  },
  {
    id: 'substitution-question',
    utterance: 'Did you switch models for that answer?',
    expected: { classification: 'explicit', target: 'serving_substitution', basis: 'substitution_question' },
  },
  {
    id: 'capability-state-question',
    utterance: 'Are you in a reduced mode right now?',
    expected: { classification: 'explicit', target: 'serving_capability_state' },
  },
  {
    id: 'confirmation-question',
    utterance: "You're using Claude right now, correct?",
    expected: { classification: 'explicit', basis: 'confirmation_question' },
  },
  {
    id: 'information-request-no-question-mark',
    utterance: 'Tell me which provider handled that.',
    expected: { classification: 'explicit', target: 'serving_provider', basis: 'information_request' },
  },
  {
    id: 'substitution-rationale',
    utterance: 'Why did you switch to local for that response?',
    expected: { classification: 'explicit', target: 'serving_substitution', basis: 'substitution_rationale_question' },
  },
  {
    id: 'negative-polarity',
    utterance: "Didn't you switch to local?",
    expected: { classification: 'explicit', target: 'serving_substitution' },
  },
  {
    id: 'keyword-statement',
    utterance: 'Claude has a large context window.',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'current-serving-claim',
    utterance: 'You switched models.',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'general-model-question',
    utterance: 'Which model is best for coding?',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'general-provider-request',
    utterance: 'Tell me about Anthropic.',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'selection-instruction',
    utterance: 'Use Claude for this.',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'polite-selection-question',
    utterance: 'Can you use Claude for this?',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'preference',
    utterance: 'I prefer local models.',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'persona-question',
    utterance: 'Are you MAIA?',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'voice-provider-question',
    utterance: 'Which voice provider are you using?',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'video-provider-question',
    utterance: 'Is Zoom handling the call?',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'memory-question',
    utterance: 'What do you remember from yesterday?',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'performance-question',
    utterance: 'Why is this response slow?',
    expected: { classification: 'not_explicit' },
  },
  {
    id: 'reference-unresolved',
    utterance: 'Was that the other one?',
    expected: { classification: 'ambiguous' },
  },
  {
    id: 'history-rescue-forbidden',
    utterance: 'Are you still using that one?',
    expected: { classification: 'ambiguous' },
  },
  {
    id: 'product-provider-ambiguous',
    utterance: 'Are you ChatGPT?',
    expected: { classification: 'ambiguous' },
  },
  {
    id: 'generic-change-ambiguous',
    utterance: 'Did something change?',
    expected: { classification: 'ambiguous' },
  },
  {
    id: 'generic-answerer-ambiguous',
    utterance: 'Who is answering me?',
    expected: { classification: 'ambiguous' },
  },
  {
    id: 'blank-is-insufficient',
    utterance: '   ',
    expected: { classification: 'ambiguous' },
  },
];

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function assertExpected(
  result: ExplicitIdentityInquiryClassification,
  expected: Expected,
  id: string
): void {
  assert(
    result.classification === expected.classification,
    id + ': expected ' + expected.classification + ', got ' + result.classification
  );

  assert(
    result.classifierVersion === EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION,
    id + ': classifier version mismatch'
  );

  if (expected.classification === 'explicit') {
    assert(result.classification === 'explicit', id + ': explicit narrowing failed');
    if (expected.target) {
      assert(result.target === expected.target, id + ': target expected ' + expected.target + ', got ' + result.target);
    }
    if (expected.basis) {
      assert(result.basis === expected.basis, id + ': basis expected ' + expected.basis + ', got ' + result.basis);
    }
  }
}

type Falsifier = {
  id: string;
  fixtureId: string;
  law: string;
};

const FALSIFIERS: readonly Falsifier[] = [
  { id: 'F2IQR-F1', fixtureId: 'provider-question', law: 'direct serving-provider question is explicit' },
  { id: 'F2IQR-F2', fixtureId: 'execution-domain-no-keyword', law: 'lexical absence does not erase local/external serving inquiry' },
  { id: 'F2IQR-F3', fixtureId: 'information-request-no-question-mark', law: 'information request does not require question punctuation' },
  { id: 'F2IQR-F4', fixtureId: 'confirmation-question', law: 'confirmation form is explicit' },
  { id: 'F2IQR-F5', fixtureId: 'substitution-rationale', law: 'substitution rationale question is explicit without ratifying premise' },
  { id: 'F2IQR-F6', fixtureId: 'negative-polarity', law: 'negative polarity does not erase inquiry existence' },
  { id: 'F2IQR-F7', fixtureId: 'keyword-statement', law: 'model/provider keyword mention alone is not inquiry' },
  { id: 'F2IQR-F8', fixtureId: 'general-model-question', law: 'general model knowledge question is not current-serving inquiry' },
  { id: 'F2IQR-F9', fixtureId: 'selection-instruction', law: 'provider/model selection command is not inquiry' },
  { id: 'F2IQR-F10', fixtureId: 'preference', law: 'provider/model preference is not inquiry' },
  { id: 'F2IQR-F11', fixtureId: 'persona-question', law: 'persona identity remains outside serving-cognition identity' },
  { id: 'F2IQR-F12', fixtureId: 'voice-provider-question', law: 'voice-provider identity remains outside cognition-provider identity' },
  { id: 'F2IQR-F13', fixtureId: 'video-provider-question', law: 'video-provider identity remains outside cognition-provider identity' },
  { id: 'F2IQR-F14', fixtureId: 'reference-unresolved', law: 'unresolved reference preserves ambiguity' },
  { id: 'F2IQR-F15', fixtureId: 'history-rescue-forbidden', law: 'current-turn unresolved reference is not rescued from history' },
  { id: 'F2IQR-F16', fixtureId: 'product-provider-ambiguous', law: 'product/provider ambiguity preserves abstention' },
  { id: 'F2IQR-F17', fixtureId: 'current-serving-claim', law: 'serving-identity claim is not inquiry without information-seeking act' },
  { id: 'F2IQR-F18', fixtureId: 'performance-question', law: 'question punctuation and performance concern do not manufacture identity inquiry' },
  { id: 'F2IQR-F19', fixtureId: 'blank-is-insufficient', law: 'insufficient current-turn semantics remains ambiguous' },
];

const byId = new Map(FIXTURES.map((fixture) => [fixture.id, fixture]));

type Evaluator = (utterance: string, fixtureId: string) => ExplicitIdentityInquiryClassification;

const actual: Evaluator = (utterance) => classifyExplicitIdentityInquiry(utterance);

function forced(
  fixtureId: string,
  classification: ExplicitIdentityInquiryClassification
): Evaluator {
  return (utterance, currentFixtureId) =>
    currentFixtureId === fixtureId
      ? classification
      : classifyExplicitIdentityInquiry(utterance);
}

const EXPLICIT_WRONG: ExplicitIdentityInquiryClassification = {
  classification: 'explicit',
  target: 'serving_provider',
  basis: 'direct_question',
  classifierVersion: EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION,
};

const NOT_EXPLICIT_WRONG: ExplicitIdentityInquiryClassification = {
  classification: 'not_explicit',
  basis: 'other_non_inquiry',
  classifierVersion: EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION,
};

const AMBIGUOUS_WRONG: ExplicitIdentityInquiryClassification = {
  classification: 'ambiguous',
  basis: 'target_unresolved',
  classifierVersion: EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION,
};

const CANDIDATES = FALSIFIERS.map((f, index) => {
  const fixture = byId.get(f.fixtureId)!;
  const wrong =
    fixture.expected.classification === 'explicit'
      ? NOT_EXPLICIT_WRONG
      : fixture.expected.classification === 'not_explicit'
        ? EXPLICIT_WRONG
        : index % 2 === 0
          ? NOT_EXPLICIT_WRONG
          : EXPLICIT_WRONG;

  return {
    id: 'F2IQR-DC' + String(index + 1),
    intended: f.id,
    error: 'forces ' + fixture.id + ' away from its governed classification',
    evaluate: forced(f.fixtureId, wrong),
  };
});

function runFalsifier(f: Falsifier, evaluate: Evaluator): void {
  const fixture = byId.get(f.fixtureId);
  assert(fixture, 'missing fixture ' + f.fixtureId);
  const result = evaluate(fixture.utterance, fixture.id);
  assertExpected(result, fixture.expected, fixture.id);
}

function killedBy(candidate: (typeof CANDIDATES)[number]): string[] {
  const killed: string[] = [];
  for (const f of FALSIFIERS) {
    try {
      runFalsifier(f, candidate.evaluate);
    } catch {
      killed.push(f.id);
    }
  }
  return killed;
}

let lethal = true;
let discriminating = true;
const lines: string[] = ['CONFORMING'];

const actualDeaths: string[] = [];
for (const f of FALSIFIERS) {
  try {
    runFalsifier(f, actual);
  } catch (error: any) {
    actualDeaths.push(f.id + ':' + (error?.message ?? String(error)));
  }
}

if (actualDeaths.length) {
  lethal = false;
  lines.push('  FAIL runtime classifier died on: ' + actualDeaths.join(' | '));
} else {
  lines.push('  PASS all ' + FALSIFIERS.length + ' runtime classifier falsifiers');
}

for (const candidate of CANDIDATES) {
  const died = killedBy(candidate);
  const intendedDead = died.includes(candidate.intended);
  const collateral = died.filter((id) => id !== candidate.intended);

  lines.push('');
  lines.push(candidate.id + ' — ' + candidate.error);
  lines.push('  intended kill : ' + candidate.intended);
  lines.push('  actually died : ' + (died.join(', ') || '(none)'));

  if (!intendedDead) {
    lethal = false;
    lines.push('  FAIL survived intended falsifier');
  }

  if (collateral.length) {
    discriminating = false;
    lines.push('  UNDECLARED collateral: ' + collateral.join(', '));
  }
}

function source(path: string): string {
  return readFileSync(path, 'utf8');
}

function parentSource(path: string): string {
  const r = spawnSync('git', ['show', BASE + ':' + path], {
    encoding: 'utf8',
    cwd: process.cwd(),
  });
  assert(r.status === 0, 'git show failed for ' + path + ': ' + r.stderr);
  return r.stdout;
}

const GUARDS: readonly { id: string; law: string; run: () => void }[] = [
  {
    id: 'F2IQR-G1',
    law: 'classifier output is bounded metadata and never echoes raw utterance',
    run: () => {
      for (const fixture of FIXTURES) {
        const result = classifyExplicitIdentityInquiry(fixture.utterance);
        const encoded = JSON.stringify(result);
        assert(!encoded.includes(fixture.utterance), fixture.id + ': raw utterance leaked into output');
        assert(!('text' in result), fixture.id + ': text field leaked into output');
      }
    },
  },
  {
    id: 'F2IQR-G2',
    law: 'classifier is pure/local and contains no model, network, environment, log, persistence, D2, or D1 authority',
    run: () => {
      const p = source('lib/consciousness/explicitIdentityInquiryClassifier.ts');
      for (const forbidden of [
        'fetch(',
        'generateText',
        'callLocalInference',
        'localInferenceClient',
        'modelService',
        'sovereignRouter',
        '@anthropic-ai',
        'http://',
        'https://',
        'process.env',
        'console.',
        'query(',
        'postgres',
        'admitDisclosureFacts',
        'decideMemberDisclosure',
        '.servingTruth',
        'servingTruth:',
        'conversationHistory',
      ]) {
        assert(!p.includes(forbidden), 'classifier contains forbidden authority: ' + forbidden);
      }
      assert(!/^import\s/m.test(p), 'classifier unexpectedly imports external authority');
    },
  },
  {
    id: 'F2IQR-G3',
    law: 'authoritative route invokes classifier after turn acceptance and before later preamble work',
    run: () => {
      const route = source('app/api/sovereign/app/maia/list/route.ts');
      const acceptance = route.indexOf('TURN ACCEPTANCE BOUNDARY');
      const call = route.indexOf('classifyExplicitIdentityInquiry(message)');
      const later = route.indexOf("withTimeoutLabeled('initializeSessionTable'");
      assert(acceptance >= 0, 'acceptance marker missing');
      assert(call > acceptance, 'classifier call is not after acceptance boundary');
      assert(later > call, 'classifier call is not before later preamble work');
    },
  },
  {
    id: 'F2IQR-G4',
    law: 'route passes current message only and discards classification downstream in this lane',
    run: () => {
      const route = source('app/api/sovereign/app/maia/list/route.ts');
      assert(route.includes('classifyExplicitIdentityInquiry(message)'), 'route does not classify message directly');
      assert(route.includes('void explicitIdentityInquiryClassification;'), 'route does not explicitly discard result');
      const responseIndex = route.indexOf('const responseData: any');
      assert(responseIndex >= 0, 'responseData not found');
      const responseTail = route.slice(responseIndex);
      assert(!responseTail.includes('explicitIdentityInquiryClassification'), 'classification leaked into member response');
    },
  },
  {
    id: 'F2IQR-G5',
    law: 'route does not invoke D2 or D1 under F2-IQ runtime lane',
    run: () => {
      const route = source('app/api/sovereign/app/maia/list/route.ts');
      assert(!route.includes('admitDisclosureFacts('), 'route invokes D2');
      assert(!route.includes('decideMemberDisclosure('), 'route invokes D1');
    },
  },
  {
    id: 'F2IQR-G6',
    law: 'canonical F1 and F2-IQ contracts remain byte-identical to runtime opening canonical',
    run: () => {
      for (const p of [
        'docs/architecture/SERVING_IDENTITY_F1_FACT_PRODUCTION_CONTRACT_2026-09-21.md',
        'docs/architecture/SERVING_IDENTITY_F2_IQ_INQUIRY_CLASSIFIER_CONTRACT_2026-09-21.md',
      ]) {
        assert(source(p) === parentSource(p), p + ' changed under runtime implementation');
      }
    },
  },
  {
    id: 'F2IQR-G7',
    law: 'D2/D1/R2 law modules remain byte-identical to runtime opening canonical',
    run: () => {
      for (const p of [
        'lib/consciousness/disclosureFactAdmission.ts',
        'lib/consciousness/memberDisclosureDecision.ts',
        'lib/ai/liveServingTruth.ts',
        'lib/ai/modelService.ts',
        'lib/ai/sovereignRouter.ts',
        'lib/sovereign/maiaService.ts',
      ]) {
        assert(source(p) === parentSource(p), p + ' changed under F2-IQ runtime lane');
      }
    },
  },
  {
    id: 'F2IQR-G8',
    law: 'runtime implementation diff is exactly classifier + route wiring + matrix + package registration',
    run: () => {
      const r = spawnSync('git', ['diff', '--name-only', BASE + '..HEAD'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      assert(r.status === 0, 'git diff failed');
      const files = r.stdout.trim().split('\n').filter(Boolean).sort();
      const allowed = [
        'app/api/sovereign/app/maia/list/route.ts',
        'lib/consciousness/explicitIdentityInquiryClassifier.ts',
        'package.json',
        'tests/constitutional/serving-identity/explicit-identity-inquiry-runtime-matrix.ts',
      ].sort();
      assert(
        JSON.stringify(files) === JSON.stringify(allowed),
        'runtime diff escaped bounded scope: ' + files.join(', ')
      );
    },
  },
  {
    id: 'F2IQR-G9',
    law: 'D2 constitutional matrix remains green',
    run: () => {
      const r = spawnSync('npm', ['run', 'matrix:serving-disclosure-d2'], { encoding: 'utf8', cwd: process.cwd() });
      assert(r.status === 0, 'D2 matrix exit=' + String(r.status));
      assert(/lethal=true\s+discriminating=true\s+guards=true/.test(r.stdout), 'D2 axes changed');
    },
  },
  {
    id: 'F2IQR-G10',
    law: 'D1 constitutional matrix remains green',
    run: () => {
      const r = spawnSync('npm', ['run', 'matrix:serving-disclosure-d1'], { encoding: 'utf8', cwd: process.cwd() });
      assert(r.status === 0, 'D1 matrix exit=' + String(r.status));
      assert(/lethal=true\s+discriminating=true\s+guards=true/.test(r.stdout), 'D1 axes changed');
    },
  },
  {
    id: 'F2IQR-G11',
    law: 'R2 serving-truth matrix remains green',
    run: () => {
      const r = spawnSync('npm', ['run', 'matrix:serving-identity-r2'], { encoding: 'utf8', cwd: process.cwd() });
      assert(r.status === 0, 'R2 matrix exit=' + String(r.status));
      assert(/lethal=true\s+discriminating=true\s+guards=true/.test(r.stdout), 'R2 axes changed');
    },
  },
];

lines.push('');
lines.push('STRUCTURAL / CROSS-MATRIX GUARDS');

let guards = true;
for (const guard of GUARDS) {
  try {
    guard.run();
    lines.push('  PASS ' + guard.id + ' — ' + guard.law);
  } catch (error: any) {
    guards = false;
    lines.push('  FAIL ' + guard.id + ' — ' + guard.law);
    lines.push('       ' + (error?.message ?? String(error)));
  }
}

console.log(lines.join('\n'));

const pass = lethal && discriminating && guards;
console.log(
  '\n' +
  (pass ? 'PASS' : 'FAIL') +
  ' lethal=' + lethal +
  ' discriminating=' + discriminating +
  ' guards=' + guards +
  '  (' + FALSIFIERS.length + ' runtime falsifiers · ' +
  CANDIDATES.length + ' defeat candidates · ' +
  GUARDS.length + ' guards)'
);

process.exit(pass ? 0 : 1);
