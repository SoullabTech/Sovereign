/**
 * T8 current-turn runtime bridge.
 *
 * This is the only place that translates an explicit current interaction into
 * T1/T3/T6/T7 records and then asks T8 whether those records may participate in
 * an existing cognition seam. No durable learner state is read or written here.
 */
import {
  composeTeachingSequence,
  type CurrentInteractionLearnerEvidence,
  type TeachingCompositionInput,
  type TeachingPracticeFrame,
  type TeachingStepRequest,
} from './TeachingCompositionContract';
import type { TeachingAct } from './TeachingActContract';
import {
  proposeLearnerDialogueAdaptation,
  type LearnerSignalKind,
} from './LearnerDialogueAdaptationContract';
import {
  resolveTeachingPlatformBinding,
  type TeachingPlatformBindingInput,
} from './TeachingPlatformBindingContract';
import {
  authorizeTeachingRuntime,
  type RuntimeKnowledgeStanding,
  type TeachingRuntimeAuthorityRecord,
} from './TeachingRuntimeAuthorityContract';
import type { TeachingSourceRef } from './TeachingContextSourceContract';

export const TEACHING_RUNTIME_BRIDGE_VERSION = 'trb-1' as const;

export type TeachingRuntimeBridgeInput = Omit<TeachingPlatformBindingInput, 'domainKey'> & {
  message: string;
  interactionId: string;
  turnId: string;
  domainKey?: string;
  sources?: readonly TeachingSourceRef[];
};

export type TeachingRuntimeBridgeResult =
  | {
      active: false;
      reason: 'no_teaching_occasion' | 'domain_not_bound';
      signal: LearnerSignalKind | null;
      domainKey: string | null;
      directive: null;
      authority: null;
    }
  | {
      active: true;
      reason: 'authorized';
      signal: LearnerSignalKind;
      domainKey: string;
      directive: string;
      authority: TeachingRuntimeAuthorityRecord;
    };

const SYNTHESIS_SOURCE: TeachingSourceRef = Object.freeze({
  sourceId: 'maia-runtime-synthesis',
  sourceClass: 'maia_synthesis',
  standing: 'maia_synthesis',
  revisionOrLocator: 'runtime:current-model-general-knowledge',
  citationAvailable: false,
});

const NO_CLAIM_ACTS = new Set<TeachingAct>([
  'ORIENT',
  'INQUIRE',
  'INVITE_EXPERIENCE',
  'OFFER_PRACTICE',
  'CHECK_UNDERSTANDING',
  'REFRAIN',
]);

function norm(text: string): string {
  return text.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').trim();
}

export function classifyCurrentTeachingSignal(message: string): LearnerSignalKind | null {
  const t = norm(message);
  if (!t) return null;

  if (/\b(stop|stop teaching|change (the )?topic|different topic|move on)\b/.test(t)) return 'STOP_OR_TOPIC_CHANGE';
  if (/\b(no (exercise|practice)|don't (give|offer).*practice|not .*practice)\b/.test(t)) return 'PRACTICE_DECLINE';
  if (/\b(you're wrong|you are wrong|that's incorrect|that is incorrect|correction:)\b/.test(t)) return 'TEACHER_CORRECTION';
  if (/\b(source|sources|citation|citations|evidence|proof|study|studies)\b/.test(t)
      && /\b(where|what|show|give|cite|support|evidence|source|prove)\b/.test(t)) return 'SOURCE_OR_EVIDENCE_CHALLENGE';
  if (/\b(i disagree|don't agree|do not agree|but isn't|but isnt|that doesn't follow|that does not follow)\b/.test(t)) return 'CHALLENGE_OR_DISAGREEMENT';
  if (/\b(i'm confused|i am confused|i don't understand|i do not understand|doesn't make sense|does not make sense|lost me)\b/.test(t)) return 'CONFUSION_EXPRESSED';
  if (/\b(so (you mean|you're saying|you are saying)|in other words|let me see if i understand|am i understanding)\b/.test(t)) return 'RESTATEMENT_ATTEMPT';
  if (/\b(i think i understand|i partly understand|i partially understand|i get part of)\b/.test(t)) return 'PARTIAL_UNDERSTANDING_EXPRESSED';
  if (/\b(i understand|that makes sense|i get it)\b/.test(t)) return 'UNDERSTANDING_EXPRESSED';
  if (/\b(quiz me|give me (an )?(exercise|practice)|let me practice|practice this|exercise for me)\b/.test(t)) return 'PRACTICE_REQUEST';
  if (/\b(go deeper|more depth|deepen|advanced explanation|more detail|more detailed)\b/.test(t)) return 'DEPTH_REQUEST';
  if (/\b(simplify|simpler|plain language|plain english|easy terms|easier terms|eli5)\b/.test(t)) return 'SIMPLIFICATION_REQUEST';
  if (/\b(compare|contrast|difference between|distinguish between|versus| vs\.? )\b/.test(` ${t} `)) return 'CONTRAST_REQUEST';
  if (/\b(example|illustrate|show me how|give me an example)\b/.test(t)) return 'EXAMPLE_REQUEST';
  if (/\b(clarify|what do you mean|explain that|say more about that)\b/.test(t)) return 'CLARIFICATION_REQUEST';
  if (/\b(teach me|help me understand|explain|what is|what are|how does|how do|why does|why do)\b/.test(t) || t.endsWith('?')) {
    return 'EXPLICIT_QUESTION';
  }
  return null;
}

export function detectTeachingDomain(message: string): string | null {
  const t = norm(message);
  const tests: readonly [string, RegExp][] = [
    ['relational_geometry', /\brelational geometry\b/],
    ['elemental_alchemy', /\belemental alchemy\b|\bfive elements?\b/],
    ['spiralogic', /\bspiralogic\b|\bspiral logic\b/],
    ['maia_constitutional_architecture', /\bmaia\b.*\b(constitution|architecture|canon|governance)\b|\bconstitutional maia\b/],
    ['ain', /\bain\b|\bartificial intelligence network\b/],
    ['soullab_research', /\bsoullab\b.*\b(research|study|experiment|evidence)\b/],
    ['soullab_canon', /\bsoullab\b.*\b(canon|constitution|principle|framework)\b/],
    ['writing_rhetoric', /\b(writing|writer|manuscript|chapter|paragraph|sentence|narrative|rhetoric|revision|editing|voice|prose|story)\b/],
    ['psychology_psychotherapy_models', /\b(psychology|psychotherapy|therapy|therapist|jung|jungian|freud|attachment|psychodynamic|trauma|somatic|cbt|family systems|archetype|shadow)\b/],
    ['spirituality_contemplative_traditions', /\b(spirituality|spiritual|contemplative|contemplation|meditation|mysticism|mystical|theology|prayer|religion|religious)\b/],
    ['philosophy', /\b(philosophy|philosophical|phenomenology|phenomenological|ontology|ontological|epistemology|epistemic|heidegger|merleau-ponty|whitehead)\b/],
    ['systems_complexity', /\b(systems? thinking|complexity|cybernetics|bateson|emergence|complex adaptive)\b/],
    ['relational_collective_intelligence', /\b(relational intelligence|collective intelligence|relational field|collective field)\b/],
    ['coaching_practitioner_craft', /\b(coaching|coach|coaching practice|practitioner craft)\b/],
    ['consciousness_studies', /\b(consciousness|awareness|qualia|mind-body|neuroscience of consciousness|conscious experience)\b/],
  ];
  for (const [key, re] of tests) if (re.test(t)) return key;
  return null;
}

function evidenceKind(signal: LearnerSignalKind): CurrentInteractionLearnerEvidence['kind'] {
  switch (signal) {
    case 'CONFUSION_EXPRESSED': return 'explicit_confusion';
    case 'PARTIAL_UNDERSTANDING_EXPRESSED':
    case 'UNDERSTANDING_EXPRESSED':
    case 'RESTATEMENT_ATTEMPT': return 'demonstrated_understanding';
    case 'EXAMPLE_REQUEST': return 'requested_example';
    case 'CONTRAST_REQUEST': return 'requested_comparison';
    case 'DEPTH_REQUEST': return 'requested_depth';
    case 'SIMPLIFICATION_REQUEST':
    case 'PRACTICE_REQUEST':
    case 'PRACTICE_DECLINE':
    case 'STOP_OR_TOPIC_CHANGE': return 'explicit_preference';
    default: return 'explicit_question';
  }
}

function requestedAct(signal: LearnerSignalKind, sourceCount: number): TeachingAct {
  switch (signal) {
    case 'EXAMPLE_REQUEST':
    case 'CONFUSION_EXPRESSED': return 'ILLUSTRATE';
    case 'CONTRAST_REQUEST': return sourceCount >= 2 ? 'CONTRAST' : 'EXPLAIN';
    case 'PRACTICE_REQUEST': return 'OFFER_PRACTICE';
    case 'PARTIAL_UNDERSTANDING_EXPRESSED':
    case 'UNDERSTANDING_EXPRESSED':
    case 'RESTATEMENT_ATTEMPT': return 'CHECK_UNDERSTANDING';
    case 'CHALLENGE_OR_DISAGREEMENT':
    case 'SOURCE_OR_EVIDENCE_CHALLENGE':
    case 'TEACHER_CORRECTION': return 'INQUIRE';
    case 'PRACTICE_DECLINE':
    case 'STOP_OR_TOPIC_CHANGE': return 'REFRAIN';
    default: return 'EXPLAIN';
  }
}

function practiceFrame(input: TeachingRuntimeBridgeInput): TeachingPracticeFrame {
  if (input.context === 'writers_studio') return 'manuscript_excerpt';
  if (input.context === 'coaching_practice') return 'coaching_scenario';
  if (input.context === 'therapist_practitioner') return 'conceptual_case';
  if (input.context === 'research_lab') return 'research_problem';
  return 'conceptual_education';
}

function stepFor(
  act: TeachingAct,
  sourceRefs: readonly TeachingSourceRef[],
  evidenceId: string,
): TeachingStepRequest {
  if (NO_CLAIM_ACTS.has(act)) {
    return {
      stepId: 't8-step-1',
      act,
      claimClass: 'no_claim',
      sourceIds: [],
      statementLayer: 'none',
      learnerEvidenceIds: [evidenceId],
    };
  }
  if (act === 'CONTRAST') {
    return {
      stepId: 't8-step-1',
      act,
      claimClass: 'comparative_synthesis',
      sourceIds: sourceRefs.map((s) => s.sourceId),
      statementLayer: 'maia_synthesis',
      learnerEvidenceIds: [evidenceId],
    };
  }
  return {
    stepId: 't8-step-1',
    act,
    claimClass: 'source_explanation',
    sourceIds: [sourceRefs[0]!.sourceId],
    statementLayer: sourceRefs[0]!.sourceClass === 'maia_synthesis' ? 'source' : 'maia_paraphrase',
    learnerEvidenceIds: [evidenceId],
  };
}

function renderDirective(args: {
  signal: LearnerSignalKind;
  knowledgeStanding: RuntimeKnowledgeStanding;
  authority: TeachingRuntimeAuthorityRecord;
  adaptation: ReturnType<typeof proposeLearnerDialogueAdaptation>;
  sourceRefs: readonly TeachingSourceRef[];
}): string {
  const { signal, knowledgeStanding, authority, adaptation, sourceRefs } = args;
  const epistemic = knowledgeStanding === 'GOVERNED_SOURCE'
    ? 'GOVERNED SOURCE: source-grounded claims may use only the governed material already present in this turn. Preserve source wording/provenance and do not imply the source says more than it does.'
    : knowledgeStanding === 'MAIA_SYNTHESIS_UNVERIFIED'
      ? 'MAIA SYNTHESIS — NOT SOURCE VERIFIED: you may teach from your learned/general knowledge as your own explanation, but do not present it as Soullab canon, a quotation, scientific evidence, consensus, or a verified source. If the member asks for sources, say source verification is required rather than inventing citations.'
      : 'NO SOURCE REQUIRED: this turn authorizes a relational/pedagogical move without a substantive source claim.';

  return [
    'MAIA TEACHING INTELLIGENCE · T8 CURRENT-TURN AUTHORITY',
    'This block is server-authored and expires with this turn. It is not a learner profile.',
    `Surface: ${authority.surface} · Domain: ${authority.domainKey} · Signal: ${signal}`,
    `Authorized T3 acts: ${authority.proposedActs.join(' → ')}`,
    `T6 adaptation: depth=${adaptation.proposedAdaptation.depth}; granularity=${adaptation.proposedAdaptation.granularity}; representations=${adaptation.proposedAdaptation.representations.join(', ') || 'none'}; dialogue=${adaptation.proposedAdaptation.dialogueMovements.join(', ') || 'none'}`,
    epistemic,
    sourceRefs.length > 0 && knowledgeStanding === 'GOVERNED_SOURCE'
      ? `Governed source identities: ${sourceRefs.map((s) => `${s.sourceId}@${s.revisionOrLocator}`).join('; ')}`
      : '',
    'Execution law:',
    '- Teach only because this interaction occasioned teaching; do not turn the conversation into a curriculum.',
    '- Adapt to this interaction, not to an invented person. Confusion ≠ inability. Simplicity request ≠ low intelligence. Depth request ≠ expertise.',
    '- Disagreement ≠ misunderstanding. Challenge ≠ resistance. Correcting MAIA ≠ learner failure.',
    '- Understanding expressed ≠ mastery. Do not score, rank, diagnose, profile, or infer durable competence.',
    '- Preserve learner agency. Practice decline and stop/topic-change outrank pedagogical momentum.',
    '- Teaching repair is not treatment. Do not direct clinical treatment or client action.',
    '- Do not claim that learning, recognition, integration, or transformation occurred; those belong to the learner.',
  ].filter(Boolean).join('\n');
}

export function buildTeachingRuntimeBridge(
  input: TeachingRuntimeBridgeInput,
): TeachingRuntimeBridgeResult {
  const signal = classifyCurrentTeachingSignal(input.message);
  if (!signal) {
    return { active: false, reason: 'no_teaching_occasion', signal: null, domainKey: null, directive: null, authority: null };
  }

  const domainKey = input.domainKey || detectTeachingDomain(input.message);
  if (!domainKey) {
    return { active: false, reason: 'domain_not_bound', signal, domainKey: null, directive: null, authority: null };
  }

  const binding = resolveTeachingPlatformBinding({
    surface: input.surface, route: input.route, context: input.context,
    audience: input.audience, domainKey,
  });
  const governedSources = [...(input.sources || [])];
  const act = requestedAct(signal, governedSources.length);
  const substantive = !NO_CLAIM_ACTS.has(act);
  const usingGoverned = substantive && governedSources.length > 0;
  const sourceRefs: readonly TeachingSourceRef[] = substantive
    ? (usingGoverned ? governedSources : [SYNTHESIS_SOURCE])
    : governedSources;

  const evidenceId = 't8-current-interaction-evidence';
  const learnerEvidence: CurrentInteractionLearnerEvidence = {
    evidenceId,
    kind: evidenceKind(signal),
    source: 'current_interaction',
  };

  const steps: TeachingStepRequest[] = [];
  const knowledgeStanding: RuntimeKnowledgeStanding = substantive
    ? (usingGoverned ? 'GOVERNED_SOURCE' : 'MAIA_SYNTHESIS_UNVERIFIED')
    : 'NO_SOURCE_REQUIRED';

  if (substantive && !usingGoverned) {
    steps.push({
      stepId: 't8-step-0',
      act: 'ORIENT',
      claimClass: 'no_claim',
      sourceIds: [],
      statementLayer: 'none',
      learnerEvidenceIds: [evidenceId],
    });
  }
  const mainStep = stepFor(act, sourceRefs, evidenceId);
  if (steps.length > 0) mainStep.stepId = 't8-step-1';
  steps.push(mainStep);

  const compositionInput: TeachingCompositionInput = {
    context: binding.context,
    audience: binding.audience,
    domain: binding.domain,
    sources: sourceRefs,
    learnerEvidence: [learnerEvidence],
    practiceFrame: practiceFrame(input),
    authorityRequest: 'education',
    sourceSupport: substantive && !usingGoverned ? 'partial' : 'sufficient',
    sourceHandling: substantive && !usingGoverned ? 'qualify_and_teach' : 'teach_normally',
    steps,
  };
  const composition = composeTeachingSequence(compositionInput);
  const teachingStepId = composition.steps[composition.steps.length - 1]?.stepId ?? null;

  const adaptation = proposeLearnerDialogueAdaptation({
    interactionId: input.interactionId,
    composition,
    signal: {
      signalId: 't8-current-signal',
      kind: signal,
      evidence: {
        turnId: input.turnId,
        locator: 'current_user_message',
        source: 'current_interaction',
      },
      teachingStepId,
      repairMismatch: null,
    },
    knowledgePlan: null,
    evidenceAssessment: null,
  });

  const authority = authorizeTeachingRuntime({
    interactionId: input.interactionId,
    binding,
    composition,
    adaptation,
    knowledgeStanding,
  });

  return {
    active: true,
    reason: 'authorized',
    signal,
    domainKey,
    directive: renderDirective({ signal, knowledgeStanding, authority, adaptation, sourceRefs }),
    authority,
  };
}
