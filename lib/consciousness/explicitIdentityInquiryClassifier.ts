/**
 * F2-IQ runtime classifier — pure, local, current-turn only.
 *
 * Governing question:
 * Does the accepted current-turn member utterance explicitly ask about the
 * cognition that served or is serving the member?
 *
 * This module:
 * - reads only the supplied current-turn utterance;
 * - returns bounded machine-readable classification metadata;
 * - performs no network/model calls;
 * - reads no history, memory, servingTruth, environment, or provider state;
 * - performs no logging or persistence;
 * - does not invoke D2 or D1.
 */

export const EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION = 'f2-iq-runtime-1' as const;

export type ServingInquiryTarget =
  | 'serving_provider'
  | 'serving_model'
  | 'execution_domain'
  | 'serving_substitution'
  | 'serving_capability_state';

export type ExplicitInquiryBasis =
  | 'direct_question'
  | 'confirmation_question'
  | 'information_request'
  | 'substitution_question'
  | 'substitution_rationale_question';

export type NotExplicitBasis =
  | 'selection_or_instruction'
  | 'preference'
  | 'statement'
  | 'general_model_discussion'
  | 'out_of_scope_identity_domain'
  | 'other_non_inquiry';

export type AmbiguousInquiryBasis =
  | 'target_unresolved'
  | 'reference_unresolved'
  | 'product_or_provider_ambiguous'
  | 'insufficient_current_turn_semantics';

export type ExplicitIdentityInquiryClassification =
  | {
      classification: 'explicit';
      target: ServingInquiryTarget;
      basis: ExplicitInquiryBasis;
      classifierVersion: typeof EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION;
    }
  | {
      classification: 'not_explicit';
      basis: NotExplicitBasis;
      classifierVersion: typeof EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION;
    }
  | {
      classification: 'ambiguous';
      basis: AmbiguousInquiryBasis;
      classifierVersion: typeof EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION;
    };

const PROVIDER_WORD =
  /\b(provider|anthropic|claude|openai|ollama|qwen|nemotron|inkling|moonshot|kimi)\b/i;
const MODEL_WORD =
  /\b(model|gpt(?:[-\s]?\d+(?:\.\d+)?)?|sonnet|opus|deepseek|llama|qwen\d*|nemotron)\b/i;
const CURRENT_SERVING_ANCHOR =
  /\b(right now|currently|for this|for that|for this answer|for that answer|this response|that response|answering me|serving me|handling (?:this|that)|handled (?:this|that)|using|running)\b/i;
const EXECUTION_DOMAIN =
  /\b(local(?:ly)?|on[-\s]?device|offline|cloud|external(?:ly)?|remote(?:ly)?)\b/i;
const SUBSTITUTION =
  /\b(switch(?:ed|ing)?|fallback|fell back|fall back|changed? (?:models?|providers?)|different (?:model|provider)|other (?:model|provider))\b/i;
const CAPABILITY_STATE =
  /\b(reduced|degraded|limited|full(?:\s+mode)?|fallback mode|normal mode)\b/i;

const QUESTION_OPEN =
  /^\s*(who|what|which|why|how|are|is|was|were|did|do|does|can|could|would|will|have|has|had|am|aren't|isn't|wasn't|weren't|didn't|don't|doesn't|can't|couldn't|wouldn't|won't|haven't|hasn't|hadn't)\b/i;
const CONFIRMATION_END = /\b(correct|right)\s*\??\s*$/i;
const TAG_QUESTION_END =
  /\b(are|is|was|were|do|does|did|can|could|would|will|have|has|had|aren't|isn't|wasn't|weren't|don't|doesn't|didn't|can't|couldn't|wouldn't|won't|haven't|hasn't|hadn't)\s+(?:you|it|this|that|we|they)\s*\??\s*$/i;
const INFORMATION_REQUEST =
  /^\s*(tell me|show me|identify|say|name)\b/i;

const SELECTION_OR_INSTRUCTION =
  /^\s*(?:please\s+)?(?:use|switch to|run(?: this)? (?:on|with)|answer (?:with|using)|route (?:this|me) (?:to|through))\b/i;
const POLITE_SELECTION_QUESTION =
  /^\s*(?:can|could|would|will)\s+you\s+(?:please\s+)?(?:use|switch to|run|answer with|answer using|route)\b/i;
const PREFERENCE =
  /\b(i\s+(?:would\s+)?prefer|i\s+(?:do\s+not|don't)\s+like|i\s+like|my preference is|prefer(?:ring)?)\b/i;

const PERSONA_DOMAIN =
  /\b(maia|your name|who are you|what are you)\b/i;
const VOICE_DOMAIN =
  /\b(voice|tts|text[-\s]?to[-\s]?speech|kokoro|elevenlabs|speech provider)\b/i;
const VIDEO_DOMAIN =
  /\b(zoom|google meet|meet call|video provider|video call|session room video)\b/i;
const MEMORY_DOMAIN =
  /\b(remember|memory|memories|recall|what do you know about me)\b/i;

const GENERAL_DISCUSSION =
  /\b(compare|comparison|best|better|worse|tell me about|what is|explain|difference between|pros and cons|recommend)\b/i;

const AMBIGUOUS_REFERENCE = [
  /^\s*are you still the same one\??\s*$/i,
  /^\s*did something change\??\s*$/i,
  /^\s*who is answering me\??\s*$/i,
  /^\s*who's answering me\??\s*$/i,
  /^\s*was that the other one\??\s*$/i,
  /^\s*is this the full one\??\s*$/i,
  /^\s*are you still using that one\??\s*$/i,
  /^\s*is this the other one\??\s*$/i,
];

const PRODUCT_PROVIDER_AMBIGUITY = [
  /^\s*are you chatgpt\??\s*$/i,
  /^\s*is this chatgpt\??\s*$/i,
];

function resultExplicit(
  target: ServingInquiryTarget,
  basis: ExplicitInquiryBasis
): ExplicitIdentityInquiryClassification {
  return {
    classification: 'explicit',
    target,
    basis,
    classifierVersion: EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION,
  };
}

function resultNotExplicit(
  basis: NotExplicitBasis
): ExplicitIdentityInquiryClassification {
  return {
    classification: 'not_explicit',
    basis,
    classifierVersion: EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION,
  };
}

function resultAmbiguous(
  basis: AmbiguousInquiryBasis
): ExplicitIdentityInquiryClassification {
  return {
    classification: 'ambiguous',
    basis,
    classifierVersion: EXPLICIT_IDENTITY_INQUIRY_CLASSIFIER_VERSION,
  };
}

function hasInformationSeekingAct(text: string): boolean {
  return (
    text.includes('?') ||
    QUESTION_OPEN.test(text) ||
    CONFIRMATION_END.test(text) ||
    TAG_QUESTION_END.test(text) ||
    INFORMATION_REQUEST.test(text)
  );
}

function basisForQuestion(text: string, substitution: boolean): ExplicitInquiryBasis {
  if (INFORMATION_REQUEST.test(text)) return 'information_request';

  if (substitution && /^\s*why\b/i.test(text)) {
    return 'substitution_rationale_question';
  }

  if (substitution) return 'substitution_question';

  if (
    CONFIRMATION_END.test(text) ||
    TAG_QUESTION_END.test(text) ||
    /\b(?:aren't|isn't|wasn't|weren't|didn't|don't|doesn't|can't|couldn't|wouldn't|won't|haven't|hasn't|hadn't)\b/i.test(text)
  ) {
    return 'confirmation_question';
  }

  return 'direct_question';
}

function explicitTarget(text: string): ServingInquiryTarget | null {
  const substitution = SUBSTITUTION.test(text);
  if (substitution) return 'serving_substitution';

  if (
    CAPABILITY_STATE.test(text) &&
    /\b(mode|model|version|one|you|this)\b/i.test(text)
  ) {
    return 'serving_capability_state';
  }

  if (
    EXECUTION_DOMAIN.test(text) &&
    /\b(run|running|using|served|serving|answer|answering|handled|handling|hosted|processing|process)\b/i.test(text)
  ) {
    return 'execution_domain';
  }

  if (
    MODEL_WORD.test(text) &&
    (
      CURRENT_SERVING_ANCHOR.test(text) ||
      /\b(which|what)\s+model\b/i.test(text) ||
      /\b(?:are|is)\s+(?:you|this)\s+(?:using\s+)?(?:gpt|claude|sonnet|opus|deepseek|llama|qwen|nemotron)\b/i.test(text)
    )
  ) {
    return 'serving_model';
  }

  if (
    PROVIDER_WORD.test(text) &&
    (
      CURRENT_SERVING_ANCHOR.test(text) ||
      /\b(which|what)\s+provider\b/i.test(text) ||
      /\b(?:are|is)\s+(?:you|this)\s+using\s+(?:anthropic|claude|openai|ollama|qwen|nemotron|inkling|moonshot|kimi)\b/i.test(text)
    )
  ) {
    return 'serving_provider';
  }

  return null;
}

/**
 * Classify only the supplied accepted current-turn utterance.
 *
 * The function intentionally has no context/history/provider parameters, making
 * cross-turn and serving-telemetry inference impossible at the type boundary.
 */
export function classifyExplicitIdentityInquiry(
  acceptedCurrentTurnUtterance: string
): ExplicitIdentityInquiryClassification {
  const text = acceptedCurrentTurnUtterance.trim().replace(/\s+/g, ' ');

  if (!text) {
    return resultAmbiguous('insufficient_current_turn_semantics');
  }

  if (PRODUCT_PROVIDER_AMBIGUITY.some((pattern) => pattern.test(text))) {
    return resultAmbiguous('product_or_provider_ambiguous');
  }

  if (AMBIGUOUS_REFERENCE.some((pattern) => pattern.test(text))) {
    return resultAmbiguous('reference_unresolved');
  }

  if (
    POLITE_SELECTION_QUESTION.test(text) ||
    (SELECTION_OR_INSTRUCTION.test(text) && !INFORMATION_REQUEST.test(text))
  ) {
    return resultNotExplicit('selection_or_instruction');
  }

  if (PREFERENCE.test(text)) {
    return resultNotExplicit('preference');
  }

  const seeking = hasInformationSeekingAct(text);

  if (seeking && (VOICE_DOMAIN.test(text) || VIDEO_DOMAIN.test(text) || MEMORY_DOMAIN.test(text))) {
    return resultNotExplicit('out_of_scope_identity_domain');
  }

  if (
    seeking &&
    PERSONA_DOMAIN.test(text) &&
    !PROVIDER_WORD.test(text) &&
    !MODEL_WORD.test(text)
  ) {
    return resultNotExplicit('out_of_scope_identity_domain');
  }

  if (
    (PROVIDER_WORD.test(text) || MODEL_WORD.test(text)) &&
    GENERAL_DISCUSSION.test(text) &&
    !CURRENT_SERVING_ANCHOR.test(text)
  ) {
    return resultNotExplicit('general_model_discussion');
  }

  const target = explicitTarget(text);

  if (seeking && target) {
    return resultExplicit(
      target,
      basisForQuestion(text, target === 'serving_substitution')
    );
  }

  if (
    seeking &&
    /\b(who|what|which|same|other|different|changed?|full)\b/i.test(text) &&
    !target
  ) {
    return resultAmbiguous('target_unresolved');
  }

  if (
    !seeking &&
    (
      PROVIDER_WORD.test(text) ||
      MODEL_WORD.test(text) ||
      SUBSTITUTION.test(text) ||
      EXECUTION_DOMAIN.test(text)
    )
  ) {
    return resultNotExplicit('statement');
  }

  return resultNotExplicit('other_non_inquiry');
}
