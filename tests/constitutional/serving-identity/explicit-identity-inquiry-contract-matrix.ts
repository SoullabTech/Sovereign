/**
 * SERVING-IDENTITY / F2-IQ
 * Explicit identity-inquiry classifier contract matrix.
 *
 * CONTRACT/FALSIFICATION ONLY:
 * - no runtime classifier
 * - no route wiring
 * - no D2/D1 invocation
 * - no persistence
 *
 * Run: npm run matrix:serving-disclosure-f2-iq
 */

import { existsSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';

const BASE = '4c097b4c81402c62e42613e83ae28180fef46f08';

type Classification = 'explicit' | 'not_explicit' | 'ambiguous';

type InquiryTarget =
  | 'serving_provider'
  | 'serving_model'
  | 'execution_domain'
  | 'serving_substitution'
  | 'serving_capability_state'
  | 'persona_identity'
  | 'voice_provider'
  | 'video_provider'
  | 'memory_source'
  | 'general_model_topic'
  | 'other_non_serving'
  | 'unresolved'
  | 'product_or_provider_ambiguous';

type SpeechAct =
  | 'direct_question'
  | 'confirmation_question'
  | 'information_request'
  | 'substitution_rationale_question'
  | 'negative_question'
  | 'selection_instruction'
  | 'preference'
  | 'statement';

type ReferenceState = 'resolved' | 'unresolved';

interface Fixture {
  id: string;
  utterance: string;
  target: InquiryTarget;
  act: SpeechAct;
  reference: ReferenceState;
  hasQuestionMark: boolean;
  hasProviderOrModelLexeme: boolean;
  historyCouldResolve?: boolean;
  servingDiverged?: boolean;
}

type Evaluator = (fixture: Fixture) => Classification;

const IN_SCOPE = new Set<InquiryTarget>([
  'serving_provider',
  'serving_model',
  'execution_domain',
  'serving_substitution',
  'serving_capability_state',
]);

const INFORMATION_SEEKING = new Set<SpeechAct>([
  'direct_question',
  'confirmation_question',
  'information_request',
  'substitution_rationale_question',
  'negative_question',
]);

const conforming: Evaluator = (f) => {
  if (
    f.target === 'unresolved' ||
    f.target === 'product_or_provider_ambiguous' ||
    f.reference === 'unresolved'
  ) {
    return 'ambiguous';
  }

  if (IN_SCOPE.has(f.target) && INFORMATION_SEEKING.has(f.act)) {
    return 'explicit';
  }

  return 'not_explicit';
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function expect(
  evaluate: Evaluator,
  fixture: Fixture,
  expected: Classification
): void {
  const actual = evaluate(fixture);
  assert(
    actual === expected,
    fixture.id + ': expected ' + expected + ', got ' + actual
  );
}

const FIX = {
  providerQuestion: {
    id: 'provider-question',
    utterance: 'Which provider is serving me right now?',
    target: 'serving_provider',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: true,
  },
  modelQuestion: {
    id: 'model-question',
    utterance: 'Which model is answering me right now?',
    target: 'serving_model',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: true,
  },
  localQuestion: {
    id: 'local-question',
    utterance: 'Are you running locally right now?',
    target: 'execution_domain',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  substitutionQuestion: {
    id: 'substitution-question',
    utterance: 'Did you switch models for that answer?',
    target: 'serving_substitution',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: true,
  },
  capabilityStateQuestion: {
    id: 'capability-state-question',
    utterance: 'Are you in a reduced mode right now?',
    target: 'serving_capability_state',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  confirmationQuestion: {
    id: 'confirmation-question',
    utterance: "You're using Claude right now, correct?",
    target: 'serving_provider',
    act: 'confirmation_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: true,
  },
  informationRequest: {
    id: 'information-request',
    utterance: 'Tell me which provider handled that.',
    target: 'serving_provider',
    act: 'information_request',
    reference: 'resolved',
    hasQuestionMark: false,
    hasProviderOrModelLexeme: true,
  },
  rationaleQuestion: {
    id: 'rationale-question',
    utterance: 'Why did you switch to local for that response?',
    target: 'serving_substitution',
    act: 'substitution_rationale_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  negativeQuestion: {
    id: 'negative-question',
    utterance: "Didn't you switch to local?",
    target: 'serving_substitution',
    act: 'negative_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  keywordStatement: {
    id: 'keyword-statement',
    utterance: 'Claude has a large context window.',
    target: 'general_model_topic',
    act: 'statement',
    reference: 'resolved',
    hasQuestionMark: false,
    hasProviderOrModelLexeme: true,
  },
  performanceQuestion: {
    id: 'performance-question',
    utterance: 'Why is this response slow?',
    target: 'other_non_serving',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  generalModelQuestion: {
    id: 'general-model-question',
    utterance: 'Which model is best for coding?',
    target: 'general_model_topic',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: true,
  },
  personaQuestion: {
    id: 'persona-question',
    utterance: 'Are you MAIA?',
    target: 'persona_identity',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  voiceQuestion: {
    id: 'voice-question',
    utterance: 'Which voice provider are you using?',
    target: 'voice_provider',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: true,
  },
  videoQuestion: {
    id: 'video-question',
    utterance: 'Is Zoom handling the call?',
    target: 'video_provider',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  memoryQuestion: {
    id: 'memory-question',
    utterance: 'What do you remember from yesterday?',
    target: 'memory_source',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  selectionInstruction: {
    id: 'selection-instruction',
    utterance: 'Use Claude for this.',
    target: 'serving_provider',
    act: 'selection_instruction',
    reference: 'resolved',
    hasQuestionMark: false,
    hasProviderOrModelLexeme: true,
  },
  preference: {
    id: 'preference',
    utterance: 'I prefer local models.',
    target: 'serving_model',
    act: 'preference',
    reference: 'resolved',
    hasQuestionMark: false,
    hasProviderOrModelLexeme: true,
  },
  providerClaim: {
    id: 'provider-claim',
    utterance: 'You switched models.',
    target: 'serving_substitution',
    act: 'statement',
    reference: 'resolved',
    hasQuestionMark: false,
    hasProviderOrModelLexeme: true,
  },
  unresolvedOther: {
    id: 'unresolved-other',
    utterance: 'Was that the other one?',
    target: 'unresolved',
    act: 'confirmation_question',
    reference: 'unresolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  ambiguousProduct: {
    id: 'ambiguous-product',
    utterance: 'Are you ChatGPT?',
    target: 'product_or_provider_ambiguous',
    act: 'direct_question',
    reference: 'resolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
  },
  historyRescue: {
    id: 'history-rescue',
    utterance: 'Are you still using that one?',
    target: 'serving_model',
    act: 'confirmation_question',
    reference: 'unresolved',
    hasQuestionMark: true,
    hasProviderOrModelLexeme: false,
    historyCouldResolve: true,
  },
  divergenceWithoutInquiry: {
    id: 'divergence-without-inquiry',
    utterance: 'This answer feels different.',
    target: 'other_non_serving',
    act: 'statement',
    reference: 'resolved',
    hasQuestionMark: false,
    hasProviderOrModelLexeme: false,
    servingDiverged: true,
  },
} satisfies Record<string, Fixture>;

type Falsifier = {
  id: string;
  law: string;
  run: (evaluate: Evaluator) => void;
};

const FALSIFIERS: readonly Falsifier[] = [
  {
    id: 'F2IQ-F1',
    law: 'provider/model keyword mention alone cannot create an inquiry',
    run: (e) => expect(e, FIX.keywordStatement, 'not_explicit'),
  },
  {
    id: 'F2IQ-F2',
    law: 'absence of provider/model vocabulary cannot erase an execution-domain inquiry',
    run: (e) => expect(e, FIX.localQuestion, 'explicit'),
  },
  {
    id: 'F2IQ-F3',
    law: 'question punctuation alone cannot create a serving-identity inquiry',
    run: (e) => expect(e, FIX.performanceQuestion, 'not_explicit'),
  },
  {
    id: 'F2IQ-F4',
    law: 'direct information requests count even without interrogative punctuation',
    run: (e) => expect(e, FIX.informationRequest, 'explicit'),
  },
  {
    id: 'F2IQ-F5',
    law: 'general model questions are not current-serving identity inquiries',
    run: (e) => expect(e, FIX.generalModelQuestion, 'not_explicit'),
  },
  {
    id: 'F2IQ-F6',
    law: 'persona identity is not cognition-serving identity',
    run: (e) => expect(e, FIX.personaQuestion, 'not_explicit'),
  },
  {
    id: 'F2IQ-F7',
    law: 'voice/video provider questions are outside cognition-serving identity',
    run: (e) => {
      expect(e, FIX.voiceQuestion, 'not_explicit');
      expect(e, FIX.videoQuestion, 'not_explicit');
    },
  },
  {
    id: 'F2IQ-F8',
    law: 'provider/model selection instruction is not an inquiry',
    run: (e) => expect(e, FIX.selectionInstruction, 'not_explicit'),
  },
  {
    id: 'F2IQ-F9',
    law: 'provider/model preference is not an inquiry',
    run: (e) => expect(e, FIX.preference, 'not_explicit'),
  },
  {
    id: 'F2IQ-F10',
    law: 'unresolved reference cannot default to not_explicit',
    run: (e) => expect(e, FIX.unresolvedOther, 'ambiguous'),
  },
  {
    id: 'F2IQ-F11',
    law: 'product/provider ambiguity cannot default to explicit',
    run: (e) => expect(e, FIX.ambiguousProduct, 'ambiguous'),
  },
  {
    id: 'F2IQ-F12',
    law: 'conversation history cannot rescue an unresolved current-turn reference',
    run: (e) => expect(e, FIX.historyRescue, 'ambiguous'),
  },
  {
    id: 'F2IQ-F13',
    law: 'confirmation and substitution-rationale forms are explicit inquiries',
    run: (e) => {
      expect(e, FIX.confirmationQuestion, 'explicit');
      expect(e, FIX.rationaleQuestion, 'explicit');
    },
  },
  {
    id: 'F2IQ-F14',
    law: 'negation/polarity does not erase inquiry existence',
    run: (e) => expect(e, FIX.negativeQuestion, 'explicit'),
  },
  {
    id: 'F2IQ-F15',
    law: 'serving divergence cannot manufacture an inquiry',
    run: (e) => expect(e, FIX.divergenceWithoutInquiry, 'not_explicit'),
  },
  {
    id: 'F2IQ-F16',
    law: 'a current-turn serving-identity claim is not an inquiry without an information-seeking act',
    run: (e) => expect(e, FIX.providerClaim, 'not_explicit'),
  },
];

type Candidate = {
  id: string;
  error: string;
  intended: string;
  evaluate: Evaluator;
};

function override(
  predicate: (f: Fixture) => boolean,
  wrong: Classification
): Evaluator {
  return (f) => predicate(f) ? wrong : conforming(f);
}

const CANDIDATES: readonly Candidate[] = [
  {
    id: 'F2IQ-DC1',
    error: 'declarative model-brand mention is treated as inquiry',
    intended: 'F2IQ-F1',
    evaluate: override(
      (f) => f.id === FIX.keywordStatement.id && f.hasProviderOrModelLexeme,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC2',
    error: 'execution-domain inquiry is missed because provider/model keywords are absent',
    intended: 'F2IQ-F2',
    evaluate: override(
      (f) => f.id === FIX.localQuestion.id && !f.hasProviderOrModelLexeme,
      'not_explicit'
    ),
  },
  {
    id: 'F2IQ-DC3',
    error: 'any question mark is treated as serving-identity inquiry',
    intended: 'F2IQ-F3',
    evaluate: override(
      (f) => f.id === FIX.performanceQuestion.id && f.hasQuestionMark,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC4',
    error: 'only interrogative punctuation counts, so information requests are missed',
    intended: 'F2IQ-F4',
    evaluate: override(
      (f) => f.id === FIX.informationRequest.id,
      'not_explicit'
    ),
  },
  {
    id: 'F2IQ-DC5',
    error: 'general model knowledge question is conflated with current serving identity',
    intended: 'F2IQ-F5',
    evaluate: override(
      (f) => f.id === FIX.generalModelQuestion.id,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC6',
    error: 'MAIA persona identity is conflated with serving cognition identity',
    intended: 'F2IQ-F6',
    evaluate: override(
      (f) => f.id === FIX.personaQuestion.id,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC7',
    error: 'voice/video provider identity is conflated with cognition provider identity',
    intended: 'F2IQ-F7',
    evaluate: override(
      (f) => f.id === FIX.voiceQuestion.id || f.id === FIX.videoQuestion.id,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC8',
    error: 'provider selection command is treated as inquiry',
    intended: 'F2IQ-F8',
    evaluate: override(
      (f) => f.id === FIX.selectionInstruction.id,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC9',
    error: 'provider/model preference is treated as inquiry',
    intended: 'F2IQ-F9',
    evaluate: override(
      (f) => f.id === FIX.preference.id,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC10',
    error: 'unresolved reference defaults false',
    intended: 'F2IQ-F10',
    evaluate: override(
      (f) => f.id === FIX.unresolvedOther.id,
      'not_explicit'
    ),
  },
  {
    id: 'F2IQ-DC11',
    error: 'ambiguous product/provider identity defaults true',
    intended: 'F2IQ-F11',
    evaluate: override(
      (f) => f.id === FIX.ambiguousProduct.id,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC12',
    error: 'conversation history resolves a reference that the current-turn contract leaves unresolved',
    intended: 'F2IQ-F12',
    evaluate: override(
      (f) => f.id === FIX.historyRescue.id && f.historyCouldResolve === true,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC13',
    error: 'only what/which direct questions count; confirmation/rationale forms are missed',
    intended: 'F2IQ-F13',
    evaluate: override(
      (f) => f.id === FIX.confirmationQuestion.id || f.id === FIX.rationaleQuestion.id,
      'not_explicit'
    ),
  },
  {
    id: 'F2IQ-DC14',
    error: 'negative polarity is mistaken for absence of inquiry',
    intended: 'F2IQ-F14',
    evaluate: override(
      (f) => f.id === FIX.negativeQuestion.id,
      'not_explicit'
    ),
  },
  {
    id: 'F2IQ-DC15',
    error: 'serving divergence manufactures inquiry=true',
    intended: 'F2IQ-F15',
    evaluate: override(
      (f) => f.id === FIX.divergenceWithoutInquiry.id && f.servingDiverged === true,
      'explicit'
    ),
  },
  {
    id: 'F2IQ-DC16',
    error: 'serving-identity statement/claim is treated as inquiry',
    intended: 'F2IQ-F16',
    evaluate: override(
      (f) => f.id === FIX.providerClaim.id,
      'explicit'
    ),
  },
];

function killedBy(candidate: Candidate): string[] {
  const killed: string[] = [];
  for (const f of FALSIFIERS) {
    try {
      f.run(candidate.evaluate);
    } catch {
      killed.push(f.id);
    }
  }
  return killed;
}

let lethal = true;
let discriminating = true;
const lines: string[] = ['CONFORMING'];

const conformingDeaths: string[] = [];
for (const f of FALSIFIERS) {
  try {
    f.run(conforming);
  } catch {
    conformingDeaths.push(f.id);
  }
}

if (conformingDeaths.length) {
  lethal = false;
  lines.push('  FAIL conforming died on: ' + conformingDeaths.join(', '));
} else {
  lines.push('  PASS all ' + FALSIFIERS.length + ' classifier falsifiers');
}

for (const c of CANDIDATES) {
  const died = killedBy(c);
  const survived = !died.includes(c.intended);
  const collateral = died.filter((id) => id !== c.intended);

  lines.push('');
  lines.push(c.id + ' — ' + c.error);
  lines.push('  intended kill : ' + c.intended);
  lines.push('  actually died : ' + (died.join(', ') || '(none)'));

  if (survived) {
    lethal = false;
    lines.push('  FAIL survived intended falsifier');
  }

  if (collateral.length) {
    discriminating = false;
    lines.push('  UNDECLARED collateral: ' + collateral.join(', '));
  }
}

type FactValue =
  | { status: 'known'; value: boolean }
  | { status: 'unknown' };

function toFact(c: Classification): FactValue {
  if (c === 'explicit') return { status: 'known', value: true };
  if (c === 'not_explicit') return { status: 'known', value: false };
  return { status: 'unknown' };
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
    id: 'F2IQ-G1',
    law: 'positive in-scope serving identity forms classify explicit',
    run: () => {
      for (const f of [
        FIX.providerQuestion,
        FIX.modelQuestion,
        FIX.localQuestion,
        FIX.substitutionQuestion,
        FIX.capabilityStateQuestion,
        FIX.confirmationQuestion,
        FIX.informationRequest,
        FIX.rationaleQuestion,
        FIX.negativeQuestion,
      ]) {
        expect(conforming, f, 'explicit');
      }
    },
  },
  {
    id: 'F2IQ-G2',
    law: 'clear selections/preferences/statements/general discussion classify not_explicit',
    run: () => {
      for (const f of [
        FIX.selectionInstruction,
        FIX.preference,
        FIX.providerClaim,
        FIX.keywordStatement,
        FIX.generalModelQuestion,
        FIX.performanceQuestion,
      ]) {
        expect(conforming, f, 'not_explicit');
      }
    },
  },
  {
    id: 'F2IQ-G3',
    law: 'clear persona/voice/video/memory questions remain outside cognition-serving identity',
    run: () => {
      for (const f of [
        FIX.personaQuestion,
        FIX.voiceQuestion,
        FIX.videoQuestion,
        FIX.memoryQuestion,
      ]) {
        expect(conforming, f, 'not_explicit');
      }
    },
  },
  {
    id: 'F2IQ-G4',
    law: 'unresolved target/reference preserves ambiguity and does not use history rescue',
    run: () => {
      for (const f of [
        FIX.unresolvedOther,
        FIX.ambiguousProduct,
        FIX.historyRescue,
      ]) {
        expect(conforming, f, 'ambiguous');
      }
    },
  },
  {
    id: 'F2IQ-G5',
    law: 'F1 mapping is exact: explicit->known(true), not_explicit->known(false), ambiguous->unknown',
    run: () => {
      const a = toFact('explicit');
      const b = toFact('not_explicit');
      const c = toFact('ambiguous');
      assert(a.status === 'known' && a.value === true, 'explicit mapping changed');
      assert(b.status === 'known' && b.value === false, 'not_explicit mapping changed');
      assert(c.status === 'unknown', 'ambiguous mapping changed');
    },
  },
  {
    id: 'F2IQ-G6',
    law: 'canonical F1 evidence contract remains byte-identical to F2-IQ opening canonical',
    run: () => {
      const p = 'docs/architecture/SERVING_IDENTITY_F1_FACT_PRODUCTION_CONTRACT_2026-09-21.md';
      assert(source(p) === parentSource(p), 'F1 evidence law changed under F2-IQ');
    },
  },
  {
    id: 'F2IQ-G7',
    law: 'D1/D2/R2 runtime law files remain byte-identical to F2-IQ opening canonical',
    run: () => {
      for (const p of [
        'lib/consciousness/disclosureFactAdmission.ts',
        'lib/consciousness/memberDisclosureDecision.ts',
        'lib/ai/liveServingTruth.ts',
        'lib/ai/modelService.ts',
        'lib/ai/sovereignRouter.ts',
        'lib/sovereign/maiaService.ts',
        'app/api/sovereign/app/maia/list/route.ts',
      ]) {
        assert(source(p) === parentSource(p), p + ' changed under F2-IQ');
      }
    },
  },
  {
    id: 'F2IQ-G8',
    law: 'F2-IQ creates no runtime classifier module',
    run: () => {
      for (const p of [
        'lib/consciousness/explicitIdentityInquiryClassifier.ts',
        'lib/consciousness/identityInquiryClassifier.ts',
        'lib/consciousness/disclosureIdentityInquiry.ts',
      ]) {
        assert(!existsSync(p), 'runtime F2-IQ classifier exists: ' + p);
      }
    },
  },
  {
    id: 'F2IQ-G9',
    law: 'F2-IQ diff is contract/matrix/package registration only',
    run: () => {
      const r = spawnSync('git', ['diff', '--name-only', BASE + '..HEAD'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      assert(r.status === 0, 'git diff failed');
      const files = r.stdout.trim().split('\n').filter(Boolean).sort();
      const allowed = [
        'docs/architecture/SERVING_IDENTITY_F2_IQ_INQUIRY_CLASSIFIER_CONTRACT_2026-09-21.md',
        'package.json',
        'tests/constitutional/serving-identity/explicit-identity-inquiry-contract-matrix.ts',
      ].sort();
      assert(
        JSON.stringify(files) === JSON.stringify(allowed),
        'F2-IQ diff escaped bounded scope: ' + files.join(', ')
      );
    },
  },
  {
    id: 'F2IQ-G10',
    law: 'D2 constitutional matrix remains green',
    run: () => {
      const r = spawnSync('npm', ['run', 'matrix:serving-disclosure-d2'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      assert(r.status === 0, 'D2 matrix exit=' + String(r.status));
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(r.stdout),
        'D2 constitutional axes changed'
      );
    },
  },
  {
    id: 'F2IQ-G11',
    law: 'D1 constitutional matrix remains green',
    run: () => {
      const r = spawnSync('npm', ['run', 'matrix:serving-disclosure-d1'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      assert(r.status === 0, 'D1 matrix exit=' + String(r.status));
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(r.stdout),
        'D1 constitutional axes changed'
      );
    },
  },
  {
    id: 'F2IQ-G12',
    law: 'R2 serving-truth matrix remains green',
    run: () => {
      const r = spawnSync('npm', ['run', 'matrix:serving-identity-r2'], {
        encoding: 'utf8',
        cwd: process.cwd(),
      });
      assert(r.status === 0, 'R2 matrix exit=' + String(r.status));
      assert(
        /lethal=true\s+discriminating=true\s+guards=true/.test(r.stdout),
        'R2 constitutional axes changed'
      );
    },
  },
];

lines.push('');
lines.push('POSITIVE / STRUCTURAL GUARDS');

let guards = true;
for (const g of GUARDS) {
  try {
    g.run();
    lines.push('  PASS ' + g.id + ' — ' + g.law);
  } catch (err: any) {
    guards = false;
    lines.push('  FAIL ' + g.id + ' — ' + g.law);
    lines.push('       ' + (err?.message ?? String(err)));
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
    '  (' + FALSIFIERS.length + ' classifier falsifiers · ' +
    CANDIDATES.length + ' defeat candidates · ' +
    GUARDS.length + ' guards)'
);

process.exit(pass ? 0 : 1);
