/**
 * AIN v2 Soft Gates
 *
 * Gates are hints for MAIA about when consultation might be valuable.
 * They are NOT rules. MAIA always has final say.
 *
 * "Capability, not choreography" — gates inform, they don't decide.
 */

import type {
  Council,
  ConsultationGates,
  ConsultationDecision,
} from './types';

/**
 * Context for gate assessment
 */
export interface GateContext {
  // The question/message being considered
  question: string;

  // Conversation state
  conversationDepth: number;
  trustLevel: number;
  element?: string;

  // Question characteristics
  questionComplexity: number;     // 0-1, estimated complexity
  emotionalIntensity: number;    // 0-1, detected emotional charge
  topicSensitivity: number;      // 0-1, how delicate the topic

  // Domain signals
  domainCount: number;           // How many domains are involved
  hasContradictions: boolean;    // Conflicting requirements detected

  // Member signals
  memberAskedForAnalysis: boolean;
  memberAskedForOptions: boolean;
  memberExpressingUncertainty: boolean;
}

/**
 * Assess soft gates
 *
 * These are suggestions, not requirements.
 * All gates being true doesn't mean MAIA must consult.
 * All gates being false doesn't mean MAIA can't consult.
 */
export function assessGates(context: GateContext): ConsultationGates {
  return {
    // Would a second perspective materially improve this?
    needGate:
      context.questionComplexity > 0.7 ||
      context.hasContradictions ||
      context.domainCount > 2,

    // Is this high-stakes or fragile enough to warrant extra care?
    riskGate:
      context.emotionalIntensity > 0.8 ||
      context.topicSensitivity > 0.7,

    // Is this multi-domain or inherently contradictory?
    complexityGate:
      context.domainCount > 2 ||
      context.hasContradictions,

    // Did the member explicitly ask for analysis/options/depth?
    invitationGate:
      context.memberAskedForAnalysis ||
      context.memberAskedForOptions ||
      context.memberExpressingUncertainty,
  };
}

/**
 * Estimate question complexity from text
 */
export function estimateComplexity(question: string): number {
  let score = 0;

  // Length suggests complexity
  if (question.length > 200) score += 0.2;
  if (question.length > 500) score += 0.2;

  // Question marks suggest multiple questions
  const questionMarks = (question.match(/\?/g) || []).length;
  if (questionMarks > 1) score += 0.1 * Math.min(questionMarks, 3);

  // Conditional language
  if (/if|whether|depends|trade-?off|versus|vs\.?|or should/i.test(question)) {
    score += 0.2;
  }

  // Technical terms
  if (/architecture|implement|design|system|scale|performance/i.test(question)) {
    score += 0.1;
  }

  // Abstract concepts
  if (/meaning|purpose|why|consciousness|emergence|pattern/i.test(question)) {
    score += 0.15;
  }

  // Future/hypothetical
  if (/what if|could|would|might|should|possibility/i.test(question)) {
    score += 0.1;
  }

  return Math.min(score, 1);
}

/**
 * Estimate emotional intensity from text
 */
export function estimateEmotionalIntensity(text: string): number {
  let score = 0;

  // Emotional words
  const emotionalWords = /angry|scared|anxious|worried|overwhelmed|frustrated|sad|grief|loss|trauma|hurt|pain|afraid|terrified|devastated|hopeless|desperate/i;
  if (emotionalWords.test(text)) score += 0.4;

  // Intensity markers
  if (/really|very|so|extremely|incredibly|completely/i.test(text)) score += 0.1;

  // First person + feeling
  if (/i feel|i'm feeling|i am feeling|i've been|i can't/i.test(text)) score += 0.2;

  // Exclamation
  const exclamations = (text.match(/!/g) || []).length;
  score += 0.05 * Math.min(exclamations, 4);

  // Capitalization (shouting)
  const words = text.split(/\s+/);
  const allCapsWords = words.filter(w => w.length > 2 && w === w.toUpperCase());
  if (allCapsWords.length > 2) score += 0.2;

  return Math.min(score, 1);
}

/**
 * Estimate topic sensitivity
 */
export function estimateTopicSensitivity(text: string): number {
  let score = 0;

  // Highly sensitive topics
  const highSensitivity = /suicide|self-harm|abuse|assault|trauma|violence|death|dying|terminal/i;
  if (highSensitivity.test(text)) score += 0.8;

  // Moderately sensitive topics
  const moderateSensitivity = /divorce|separation|affair|addiction|mental health|therapy|medication|diagnosis/i;
  if (moderateSensitivity.test(text)) score += 0.4;

  // Personal vulnerability
  const vulnerability = /secret|shame|embarrassed|never told|afraid to say|don't know who else/i;
  if (vulnerability.test(text)) score += 0.3;

  // Relationship tension
  const relational = /my (partner|spouse|parent|child|mother|father|boss)|our relationship/i;
  if (relational.test(text)) score += 0.2;

  return Math.min(score, 1);
}

/**
 * Detect if member is asking for analysis or options
 */
export function detectAnalysisRequest(text: string): boolean {
  const patterns = [
    /what (do you think|are your thoughts|would you suggest|are the options)/i,
    /can you (analyze|help me think through|break down|compare)/i,
    /pros and cons/i,
    /should I|what should/i,
    /help me (decide|understand|figure out)/i,
    /what are the (risks|benefits|implications|trade-?offs)/i,
    /multiple perspectives/i,
    /devil's advocate/i,
  ];

  return patterns.some(p => p.test(text));
}

/**
 * Count domains involved in a question
 */
export function countDomains(text: string): number {
  const domains = {
    technical:
      /code|software|system|architecture|implement|build|develop|engineer|deploy|deployment|production|ops|devops|infra|infrastructure|hosting|self-host|sovereign|cloud|vercel|render|docker|kubernetes|k8s|ci\/cd|pipeline|release|rollout|rollback|migrate|migration|scal(e|ing)|latency|throughput|uptime|availability|reliability|resilience|failover|outage|incident|monitoring|observability|logging|metrics|tracing/i,
    emotional: /feel|feeling|emotion|heart|soul|mood|anxious|happy|sad/i,
    relational: /relationship|partner|family|friend|colleague|team|communication/i,
    practical: /money|time|schedule|plan|organize|manage|budget|resource/i,
    spiritual: /meaning|purpose|consciousness|spirit|soul|transcend|sacred/i,
    creative: /create|art|write|design|imagine|inspire|vision/i,
    health: /health|body|sleep|exercise|diet|medical|physical|mental/i,
    career: /work|job|career|profession|business|client|project/i,
  };

  return Object.values(domains).filter(pattern => pattern.test(text)).length;
}

/**
 * Build full gate context from a message
 */
export function buildGateContext(
  question: string,
  conversationDepth: number,
  trustLevel: number,
  element?: string
): GateContext {
  return {
    question,
    conversationDepth,
    trustLevel,
    element,
    questionComplexity: estimateComplexity(question),
    emotionalIntensity: estimateEmotionalIntensity(question),
    topicSensitivity: estimateTopicSensitivity(question),
    domainCount: countDomains(question),
    hasContradictions: /but|however|although|on the other hand|versus|vs\.?|trade-?offs?/i.test(question),
    memberAskedForAnalysis: detectAnalysisRequest(question),
    memberAskedForOptions: /options|alternatives|different ways|other approaches/i.test(question),
    memberExpressingUncertainty: /not sure|don't know|confused|uncertain|unclear/i.test(question),
  };
}

/**
 * Suggest which council might be most relevant
 *
 * This is a suggestion, not a decision. MAIA chooses.
 */
export function suggestCouncil(context: GateContext): Council | null {
  const { topicSensitivity, emotionalIntensity, questionComplexity, domainCount } = context;

  // High sensitivity + emotional → might benefit from shadow work
  if (topicSensitivity > 0.6 && emotionalIntensity > 0.5) {
    return 'shadow';
  }

  // Multi-domain complexity → deliberation council
  if (domainCount > 2 || questionComplexity > 0.7) {
    return 'deliberation';
  }

  // Ethical dimension detected
  if (/should|right|wrong|harm|responsibility|fair/i.test(context.question)) {
    return 'ethics';
  }

  // Practical implementation focus
  if (/how to|implement|build|create|make|do/i.test(context.question)) {
    return 'practical';
  }

  // Symbolic/dream content
  if (/dream|symbol|archetype|meaning|vision|image/i.test(context.question)) {
    return 'dream';
  }

  // Default to deliberation for complex questions
  if (questionComplexity > 0.5) {
    return 'deliberation';
  }

  return null;
}

/**
 * Generate a consultation decision recommendation
 *
 * CRITICAL: This is a RECOMMENDATION. MAIA can override.
 * The final decision is always hers.
 */
export function recommendConsultation(context: GateContext): ConsultationDecision {
  const gates = assessGates(context);
  const gateCount = Object.values(gates).filter(Boolean).length;

  // If no gates triggered, probably don't need council
  if (gateCount === 0) {
    return {
      wantsCouncil: false,
      reason: 'Simple question—presence may be sufficient',
    };
  }

  // If only one gate, weak signal
  if (gateCount === 1) {
    const suggestedCouncil = suggestCouncil(context);
    return {
      wantsCouncil: false,
      council: suggestedCouncil || undefined,
      reason: `Mild complexity detected. Council available if desired: ${suggestedCouncil || 'deliberation'}`,
    };
  }

  // Multiple gates → consultation likely valuable
  const suggestedCouncil = suggestCouncil(context) || 'deliberation';
  return {
    wantsCouncil: true,
    council: suggestedCouncil,
    reason: `Multiple complexity signals (${gateCount}/4 gates). ${suggestedCouncil} council recommended.`,
  };
}
