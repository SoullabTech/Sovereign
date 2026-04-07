// File: lib/contrast/contrastGate.ts

export type TraditionLens = 'taoism' | 'integral_yoga';
export type ContrastMode = 'alternate_lens' | 'baseline_contrast' | 'none';

export type ContrastGateReason =
  | 'ok'
  | 'not_enough_turns'
  | 'crisis'
  | 'practical_or_analytical'
  | 'recent_contrast'
  | 'session_cap_reached'
  | 'insufficient_divergence'
  | 'missing_alternate_lens'
  | 'response_too_short'
  | 'response_too_directive';

export interface ContrastGateInput {
  turnCount: number;
  turnIndex: number;
  sessionContrastCount: number;
  turnsSinceLastContrast: number | null;

  currentTradition: TraditionLens | null;
  lastContrastTradition: TraditionLens | null;

  userText: string;
  assistantText: string;
}

export interface ContrastGateScores {
  reflectiveScore: number;     // 0..1
  directiveScore: number;      // 0..1
  practicalScore: number;      // 0..1
  emotionalDepthScore: number; // 0..1
  crisisScore: number;         // 0..1
  estimatedDivergence: number; // 0..1
}

export interface ContrastGateResult {
  show: boolean;
  reason: ContrastGateReason;
  score: number;
  threshold: number;

  alternateTradition: TraditionLens | null;
  contrastMode: ContrastMode;

  integrationQuestion: string | null;

  debug?: {
    reflective: number;
    directive: number;
    practical: number;
    emotionalDepth: number;
    crisis: number;
    divergence: number;
    penalties: string[];
  };
}

export const CONTRAST_CONFIG = {
  minTurns: 2,
  minTurnsBetweenContrasts: 5,
  maxContrastsPerSession: 2,
  minAssistantChars: 220,

  crisisThreshold: 0.35,
  practicalThreshold: 0.6,
  directiveThreshold: 0.65,

  minDivergence: 0.28,
  inviteThreshold: 0.58,

  baselineContrastChance: 0.2,
} as const;

const CONTRAST_INTEGRATION_QUESTIONS = [
  'What feels different about that?',
  'What shifts when you see it this way?',
  'Does anything open or loosen there?',
  'How does this version land differently?',
] as const;

const CRISIS_PATTERNS: RegExp[] = [
  /\b(suicid(?:e|al)|kill myself|want to die|end my life|self-harm)\b/i,
  /\b(can't go on|cannot go on|no reason to live)\b/i,
  /\b(hurt someone|kill someone)\b/i,
  /\b(psychosis|hearing voices|seeing things)\b/i,
];

// User explicitly signals they don't want reframing / additional perspectives
const PREFERENCE_REJECTION_PATTERNS = /\b(don't need another perspective|just tell me what to do|stop analyzing|don't want to think about it more|enough reflecting|tired of reflecting|don't overthink|just answer|i've thought about this enough|i'm done reflecting|i don't want to analyze this more|stop making this complicated)\b/i;

export function getContrastIntegrationQuestion(turnIndex: number): string {
  return CONTRAST_INTEGRATION_QUESTIONS[
    Math.abs(turnIndex) % CONTRAST_INTEGRATION_QUESTIONS.length
  ];
}

export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/[^\w\s']/g, '')
    .trim();
}

export function estimateReflectiveScore(text: string): number {
  const t = text.toLowerCase();
  let score = 0.1;

  if (/\b(perhaps|it may be|it seems|there is|you may be noticing|something in this)\b/.test(t)) {
    score += 0.22;
  }

  if (/\b(feels|longing|fear|grief|tender|alive|inner|beneath|deeper)\b/.test(t)) {
    score += 0.24;
  }

  if (/\?/.test(t)) {
    score += 0.08;
  }

  if (text.length > 350) {
    score += 0.12;
  }

  return clamp01(score);
}

export function estimateDirectiveScore(text: string): number {
  const t = text.toLowerCase();
  let score = 0.05;

  if (/\b(you should|do this|the answer is|here's what to do|step 1|step 2|must)\b/.test(t)) {
    score += 0.45;
  }

  if (/\b(checklist|plan|action items|next steps)\b/.test(t)) {
    score += 0.2;
  }

  return clamp01(score);
}

export function estimatePracticalScore(text: string): number {
  const t = text.toLowerCase();
  let score = 0.05;

  if (/\b(schedule|price|book|calendar|availability|deploy|api|route|file|component|sql|migration)\b/.test(t)) {
    score += 0.55;
  }

  if (/\b(fix|implement|build|debug|error|config)\b/.test(t)) {
    score += 0.18;
  }

  return clamp01(score);
}

export function estimateEmotionalDepthScore(text: string): number {
  const t = text.toLowerCase();
  let score = 0.08;

  if (/\b(grief|fear|shame|love|loss|truth|meaning|ache|tender|uncertain|soul)\b/.test(t)) {
    score += 0.36;
  }

  if (/\b(i feel|i'm feeling|part of me|something in me)\b/.test(t)) {
    score += 0.22;
  }

  return clamp01(score);
}

export function estimateCrisisScore(userText: string, assistantText: string): number {
  const text = `${userText}\n${assistantText}`;
  let score = 0;

  for (const pattern of CRISIS_PATTERNS) {
    if (pattern.test(text)) {
      score += 0.45;
    }
  }

  if (/\b(panic|unsafe|can't breathe|out of control)\b/i.test(text)) {
    score += 0.18;
  }

  return clamp01(score);
}

export function estimateCheapDivergence(params: {
  currentTradition: TraditionLens | null;
  userText: string;
  assistantText: string;
}): number {
  const text = `${params.userText} ${params.assistantText}`.toLowerCase();
  let score = 0.12;

  if (/\b(should|must|trying|effort|decide|discipline|control|push|achieve|goal)\b/.test(text)) {
    score += 0.2;
  }

  if (/\b(stuck|lost|grief|afraid|confused|waiting|surrender|let go|release)\b/.test(text)) {
    score += 0.18;
  }

  if (/\b(who am i|truth|meaning|purpose|calling|path|becoming)\b/.test(text)) {
    score += 0.16;
  }

  if (params.currentTradition) {
    score += 0.14;
  }

  if (params.assistantText.length < 300) {
    score -= 0.15;
  }

  return clamp01(score);
}

export function deriveContrastScores(input: ContrastGateInput): ContrastGateScores {
  return {
    reflectiveScore: estimateReflectiveScore(input.assistantText),
    directiveScore: estimateDirectiveScore(input.assistantText),
    practicalScore: estimatePracticalScore(`${input.userText} ${input.assistantText}`),
    emotionalDepthScore: estimateEmotionalDepthScore(`${input.userText} ${input.assistantText}`),
    crisisScore: estimateCrisisScore(input.userText, input.assistantText),
    estimatedDivergence: estimateCheapDivergence({
      currentTradition: input.currentTradition,
      userText: input.userText,
      assistantText: input.assistantText,
    }),
  };
}

export function failFast(
  input: ContrastGateInput,
  scores: ContrastGateScores,
): ContrastGateReason | null {
  if (input.turnCount < CONTRAST_CONFIG.minTurns) {
    return 'not_enough_turns';
  }

  if (scores.crisisScore >= CONTRAST_CONFIG.crisisThreshold) {
    return 'crisis';
  }

  if (scores.practicalScore >= CONTRAST_CONFIG.practicalThreshold) {
    return 'practical_or_analytical';
  }

  if (input.assistantText.trim().length < CONTRAST_CONFIG.minAssistantChars) {
    return 'response_too_short';
  }

  if (scores.directiveScore >= CONTRAST_CONFIG.directiveThreshold) {
    return 'response_too_directive';
  }

  // User explicitly signals they don't want another perspective
  if (PREFERENCE_REJECTION_PATTERNS.test(input.userText)) {
    return 'practical_or_analytical';
  }

  if (
    input.turnsSinceLastContrast !== null &&
    input.turnsSinceLastContrast < CONTRAST_CONFIG.minTurnsBetweenContrasts
  ) {
    return 'recent_contrast';
  }

  if (input.sessionContrastCount >= CONTRAST_CONFIG.maxContrastsPerSession) {
    return 'session_cap_reached';
  }

  return null;
}

export function selectAlternateTradition(
  current: TraditionLens | null,
  lastContrast: TraditionLens | null,
): {
  alternateTradition: TraditionLens | null;
  contrastMode: ContrastMode;
} {
  if (current === 'taoism') {
    return {
      alternateTradition: 'integral_yoga',
      contrastMode: 'alternate_lens',
    };
  }

  if (current === 'integral_yoga') {
    return {
      alternateTradition: 'taoism',
      contrastMode: 'alternate_lens',
    };
  }

  const roll = Math.random();

  if (roll < CONTRAST_CONFIG.baselineContrastChance) {
    return {
      alternateTradition: null,
      contrastMode: 'baseline_contrast',
    };
  }

  if (lastContrast === 'taoism') {
    return {
      alternateTradition: 'integral_yoga',
      contrastMode: 'alternate_lens',
    };
  }

  if (lastContrast === 'integral_yoga') {
    return {
      alternateTradition: 'taoism',
      contrastMode: 'alternate_lens',
    };
  }

  return {
    alternateTradition: Math.random() < 0.5 ? 'taoism' : 'integral_yoga',
    contrastMode: 'alternate_lens',
  };
}

export function computeContrastScore(
  input: ContrastGateInput,
  scores: ContrastGateScores,
): { score: number; penalties: string[] } {
  let score = 0;
  const penalties: string[] = [];

  score += scores.reflectiveScore * 0.3;
  score += scores.emotionalDepthScore * 0.2;
  score += scores.estimatedDivergence * 0.3;

  if (input.turnCount >= 4) {
    score += 0.08;
  }

  if (input.currentTradition) {
    score += 0.06;
  }

  score -= scores.directiveScore * 0.12;
  score -= scores.practicalScore * 0.18;
  score -= scores.crisisScore * 0.3;

  if (input.turnsSinceLastContrast !== null && input.turnsSinceLastContrast < 6) {
    score -= 0.08;
    penalties.push('recentish_contrast');
  }

  if (input.assistantText.length < 320) {
    score -= 0.06;
    penalties.push('shortish_response');
  }

  return {
    score: clamp01(score),
    penalties,
  };
}

export function evaluateContrastGate(input: ContrastGateInput): ContrastGateResult {
  const scores = deriveContrastScores(input);

  const hardFailure = failFast(input, scores);
  if (hardFailure) {
    return {
      show: false,
      reason: hardFailure,
      score: 0,
      threshold: CONTRAST_CONFIG.inviteThreshold,
      alternateTradition: null,
      contrastMode: 'none',
      integrationQuestion: null,
      debug: {
        reflective: scores.reflectiveScore,
        directive: scores.directiveScore,
        practical: scores.practicalScore,
        emotionalDepth: scores.emotionalDepthScore,
        crisis: scores.crisisScore,
        divergence: scores.estimatedDivergence,
        penalties: [],
      },
    };
  }

  if (scores.estimatedDivergence < CONTRAST_CONFIG.minDivergence) {
    return {
      show: false,
      reason: 'insufficient_divergence',
      score: 0,
      threshold: CONTRAST_CONFIG.inviteThreshold,
      alternateTradition: null,
      contrastMode: 'none',
      integrationQuestion: null,
      debug: {
        reflective: scores.reflectiveScore,
        directive: scores.directiveScore,
        practical: scores.practicalScore,
        emotionalDepth: scores.emotionalDepthScore,
        crisis: scores.crisisScore,
        divergence: scores.estimatedDivergence,
        penalties: ['pre_display_divergence_low'],
      },
    };
  }

  const selection = selectAlternateTradition(
    input.currentTradition,
    input.lastContrastTradition,
  );

  if (selection.contrastMode === 'alternate_lens' && !selection.alternateTradition) {
    return {
      show: false,
      reason: 'missing_alternate_lens',
      score: 0,
      threshold: CONTRAST_CONFIG.inviteThreshold,
      alternateTradition: null,
      contrastMode: 'none',
      integrationQuestion: null,
      debug: {
        reflective: scores.reflectiveScore,
        directive: scores.directiveScore,
        practical: scores.practicalScore,
        emotionalDepth: scores.emotionalDepthScore,
        crisis: scores.crisisScore,
        divergence: scores.estimatedDivergence,
        penalties: ['selection_failed'],
      },
    };
  }

  const { score, penalties } = computeContrastScore(input, scores);
  const show = score >= CONTRAST_CONFIG.inviteThreshold;

  return {
    show,
    reason: show ? 'ok' : 'insufficient_divergence',
    score,
    threshold: CONTRAST_CONFIG.inviteThreshold,
    alternateTradition: show ? selection.alternateTradition : null,
    contrastMode: show ? selection.contrastMode : 'none',
    integrationQuestion: show ? getContrastIntegrationQuestion(input.turnIndex) : null,
    debug: {
      reflective: scores.reflectiveScore,
      directive: scores.directiveScore,
      practical: scores.practicalScore,
      emotionalDepth: scores.emotionalDepthScore,
      crisis: scores.crisisScore,
      divergence: scores.estimatedDivergence,
      penalties,
    },
  };
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}
