/**
 * Response shaper - ensures every reply is crisp, grounded, and user-led
 * Adapts to worldview while maintaining Oracle clarity and concrete steps
 */

import { Intent, extractEmotions } from './intent';
import { PersonaPrefs, getVocabularyPolicy, getFormalityAdjustments } from './prefs';

interface ShapeOptions {
  intent: Intent;
  prefs: PersonaPrefs;
  maxWords?: number;
  emotions?: string[];
}

/**
 * Shape raw LLM response into Maya's Oracle-style delivery with shadow work integration
 */
export function shapeMayaResponse(raw: string, options: ShapeOptions): string {
  // Guard against undefined prefs
  if (!options.prefs) {
    return raw; // Return raw response if prefs not available
  }
  
  const { intent, prefs, maxWords = prefs.max_words || 130 } = options;
  const emotions = options.emotions || extractEmotions(raw);
  
  let shaped = raw.trim();
  
  // 1. Length control - respect user's preference
  shaped = enforceLength(shaped, maxWords);
  
  // 2. Vocabulary policy - adapt to worldview
  shaped = applyVocabularyPolicy(shaped, prefs);
  
  // 3. Apply shadow work reality testing - challenge patterns when needed
  shaped = applyShadowWorkGuidance(shaped, intent, emotions, prefs);
  
  // 4. Tone adjustment - match worldview and formality
  shaped = adjustTone(shaped, prefs, emotions);
  
  // 5. Ensure concrete step - always actionable
  shaped = ensureConcreteStep(shaped, intent, prefs);
  
  // 6. Add reflective question - invite agency and self-awareness
  shaped = addReflectiveQuestion(shaped, intent, prefs);
  
  // 7. Final Oracle polish - natural flow with authentic challenge
  shaped = applyOraclePolish(shaped, prefs);
  
  return shaped;
}

/**
 * Enforce response length while preserving meaning
 */
function enforceLength(text: string, maxWords: number): string {
  const words = text.trim().split(/\s+/);
  
  if (words.length <= maxWords) return text;
  
  // Try to cut at sentence boundaries first
  const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s);
  let result = '';
  let wordCount = 0;
  
  for (const sentence of sentences) {
    const sentenceWords = sentence.split(/\s+/).length;
    if (wordCount + sentenceWords <= maxWords) {
      result += (result ? '. ' : '') + sentence;
      wordCount += sentenceWords;
    } else {
      break;
    }
  }
  
  // If we couldn't fit even one sentence, hard cut
  if (!result) {
    result = words.slice(0, maxWords).join(' ') + '…';
  } else if (!result.match(/[.!?]$/)) {
    result += '.';
  }
  
  return result;
}

/**
 * Apply shadow work guidance - reality testing and authentic challenge
 * Helps users see patterns, deflections, and unconscious behaviors with compassion
 */
function applyShadowWorkGuidance(
  text: string, 
  intent: Intent, 
  emotions: string[], 
  prefs: PersonaPrefs
): string {
  let result = text;
  
  // Detect deflection patterns in user language (this would come from query analysis)
  // For now, we add shadow work elements when appropriate
  
  // If user is avoiding or deflecting, add gentle challenge
  if (intent === 'guidance' && emotions.includes('anxiety')) {
    const deflectionPatterns = /(but|however|although|except|maybe|probably|i guess)/i;
    if (deflectionPatterns.test(result)) {
      const challenges = [
        "I notice some hesitation in your words. What are you not quite ready to face?",
        "There's a 'but' in there that feels important. What's the deeper concern?",
        "I hear you qualifying your truth. What would happen if you said it directly?",
        "That sounds like you're protecting yourself from something. What is it?"
      ];
      const challenge = challenges[Math.floor(Math.random() * challenges.length)];
      result = result.replace(/\.$/, '. ') + challenge;
    }
  }
  
  // Challenge victim patterns - with compassion
  const victimLanguage = /(always happens to me|nothing ever works|i can't help it|it's not my fault)/i;
  if (victimLanguage.test(result)) {
    const empoweringReframes = [
      "I hear pain in those words. And I also see someone with more power than they're claiming.",
      "That sounds like a story that protects you from something scarier - your own capability.",
      "What's one small way you do have influence in this situation?",
      "I wonder what becomes possible when you own even 1% of this pattern?"
    ];
    const reframe = empoweringReframes[Math.floor(Math.random() * empoweringReframes.length)];
    result += ` ${reframe}`;
  }
  
  // Challenge perfectionism and control patterns
  const controlLanguage = /(perfect|should|must|supposed to|right way|wrong way|always|never)/gi;
  const controlCount = (result.match(controlLanguage) || []).length;
  if (controlCount > 2) {
    const controlChallenges = [
      "I'm hearing a lot of 'shoulds' - whose voice is that really?",
      "What would happen if you let this be messy and imperfect?",
      "Sounds like you're trying to control the uncontrollable. What are you afraid will happen if you don't?",
      "Where did you learn that everything has to be just right?"
    ];
    const challenge = controlChallenges[Math.floor(Math.random() * controlChallenges.length)];
    result += ` ${challenge}`;
  }
  
  // Challenge spiritual bypassing (for metaphysical worldview)
  if (prefs.worldview === 'metaphysical') {
    const bypassLanguage = /(everything happens for a reason|trust the universe|just vibrate higher|positive vibes only)/i;
    if (bypassLanguage.test(result)) {
      const realityChecks = [
        "That sounds beautiful and... what's the messy human truth underneath?",
        "I hear the spiritual wisdom, and I'm curious about the feelings you might be skipping over.",
        "What's the less enlightened part of you that needs attention right now?",
        "Even spiritual truths can become ways to avoid being human. What are you not wanting to feel?"
      ];
      const check = realityChecks[Math.floor(Math.random() * realityChecks.length)];
      result += ` ${check}`;
    }
  }
  
  // Challenge intellectual defenses (for grounded worldview)
  if (prefs.worldview === 'grounded') {
    const intellectualizing = /(analyze|rational|logical|objectively|research shows|studies indicate)/gi;
    const intellectualCount = (result.match(intellectualizing) || []).length;
    if (intellectualCount > 2 && emotions.length > 0) {
      const feelingChecks = [
        "I appreciate your analytical mind. What does your gut say about this?",
        "All that thinking makes sense, and what are you feeling right now?",
        "Your head has good ideas. What's your heart's perspective?",
        "Sometimes the smartest thing is to feel first, think second. What comes up?"
      ];
      const check = feelingChecks[Math.floor(Math.random() * feelingChecks.length)];
      result += ` ${check}`;
    }
  }
  
  return result;
}

/**
 * Apply vocabulary policy based on worldview
 */
function applyVocabularyPolicy(text: string, prefs: PersonaPrefs): string {
  const policy = getVocabularyPolicy(prefs.worldview);
  let result = text;
  
  // Handle banned terms (only in non-metaphysical worldviews)
  if (!policy.allowMetaphysical) {
    // Soften extreme terms rather than completely banning them
    result = result.replace(/\b(ascension|5d)\b/gi, 'growth');
    result = result.replace(/\blight\s?codes?\b/gi, 'insights');
    result = result.replace(/\bportal\s?downloads?\b/gi, 'understanding');
  }
  
  // Gentle vocabulary adjustments by worldview
  if (prefs.worldview === 'grounded') {
    result = result.replace(/\b(energy|vibration)\b/gi, 'mood');
    result = result.replace(/\bmanifest\b/gi, 'create');
    result = result.replace(/\bspirit\b/gi, 'inner self');
  } else if (prefs.worldview === 'metaphysical') {
    result = result.replace(/\bpsych\w+/gi, 'soul');
    result = result.replace(/\bmood\b/gi, 'energy');
    result = result.replace(/\bpattern\b/gi, 'sacred pattern');
  }
  
  return result;
}

/**
 * Adjust tone based on worldview and formality preferences
 */
function adjustTone(text: string, prefs: PersonaPrefs, emotions: string[]): string {
  let result = text;
  
  // Safety check for prefs
  if (!prefs) {
    return result;
  }
  
  const adjustments = getFormalityAdjustments(prefs.formality);
  
  // Add appropriate metaphorical language if missing and suitable
  if (prefs.worldview === 'metaphysical') {
    const hasMetaphor = /\b(like|as if|as though|imagine|picture)\b/i.test(result);
    if (!hasMetaphor && result.length < (prefs.max_words || 130) * 0.8) {
      const metaphors = [
        'Like tending a garden that grows in its own time.',
        'Think of this as water finding its natural course.',
        'Imagine you\'re a tree, roots deep, branches reaching.',
        'Picture yourself as both the artist and the canvas.',
        'Like a seed that knows exactly how to become itself.'
      ];
      const metaphor = metaphors[Math.floor(Math.random() * metaphors.length)];
      result += ` ${metaphor}`;
    }
  }
  
  // Adjust for emotional state
  if (emotions.includes('anxiety') || emotions.includes('overwhelm')) {
    result = result.replace(/\b(should|must|need to)\b/gi, 'might');
    result = result.replace(/\bquickly?\b/gi, 'gently');
  }
  
  return result;
}

/**
 * Ensure every response has at least one concrete, actionable step
 */
function ensureConcreteStep(text: string, intent: Intent, prefs: PersonaPrefs): string {
  // Check if concrete action already exists
  const concretePatterns = [
    /\b(write|note|name|schedule|walk|breathe|place your feet|text a friend|set a timer|call|email)\b/i,
    /\b(try|practice|do|take|make|create|start|begin|stop|pause)\b/i,
    /\b(today|tonight|now|this morning|this evening|right now|in the next hour)\b/i
  ];
  
  const hasConcrete = concretePatterns.some(pattern => pattern.test(text));
  
  if (!hasConcrete && ['guidance', 'reassurance', 'planning'].includes(intent)) {
    const concreteSteps = [
      'Set a 5-minute timer and write one line you can act on today.',
      'Take three conscious breaths and name one small next step.',
      'Write down the first thing that comes to mind when you ask "what feels doable right now?"',
      'Text someone who cares about you and tell them one thing you\'re grateful for.',
      'Go outside for 2 minutes and notice what you see.',
      'Put your feet flat on the floor and feel the solid ground beneath you.',
      'Write your concern on paper, then write one tiny action you could take.',
      'Set a gentle reminder for later today to check in with yourself.'
    ];
    
    const step = concreteSteps[Math.floor(Math.random() * concreteSteps.length)];
    const connector = text.endsWith('.') ? ' ' : '. ';
    return text + connector + `Tiny step: ${step}`;
  }
  
  return text;
}

/**
 * Add reflective question to invite user agency (when appropriate)
 */
function addReflectiveQuestion(text: string, intent: Intent, prefs: PersonaPrefs): string {
  // Only add questions for guidance and reassurance
  if (!['guidance', 'reassurance'].includes(intent)) {
    return text;
  }
  
  const questions = {
    grounded: [
      'What\'s the smallest next step that actually feels doable right now?',
      'Which part of this resonates most with your current situation?',
      'What would you tell a good friend in this same situation?',
      'What evidence do you need to feel confident moving forward?'
    ],
    balanced: [
      'What feels like the next honest step for you right now?', 
      'What would it feel like to trust yourself here?',
      'What does your inner wisdom say about this?',
      'What wants to emerge from this experience?'
    ],
    metaphysical: [
      'What is your soul calling you toward right now?',
      'What would your highest self choose in this moment?',
      'What is this experience trying to teach you?',
      'What sacred gift is hidden within this challenge?'
    ]
  };
  
  const questionSet = questions[prefs.worldview];
  const question = questionSet[Math.floor(Math.random() * questionSet.length)];
  
  return text + '\n\n' + question;
}

/**
 * Final Oracle polish - ensure natural flow and warmth
 */
function applyOraclePolish(text: string, prefs: PersonaPrefs): string {
  let result = text;
  
  // Soften overly directive language
  result = result.replace(/\bYou must\b/gi, 'You might');
  result = result.replace(/\bYou should\b/gi, 'You could');
  result = result.replace(/\bYou need to\b/gi, 'You might want to');
  
  // Add warmth markers
  if (prefs.formality === 'warm') {
    // Soften clinical language
    result = result.replace(/\bimplementation\b/gi, 'taking action');
    result = result.replace(/\butilize\b/gi, 'use');
    result = result.replace(/\bfacilitate\b/gi, 'help');
    
    // Add gentle connectors
    result = result.replace(/\bHowever,/gi, 'And yet,');
    result = result.replace(/\bTherefore,/gi, 'So,');
  }
  
  // Ensure natural breathing rhythm
  result = result.replace(/([.!?])\s+([A-Z])/g, '$1 $2');
  
  return result.trim();
}

/**
 * Quick evaluation of response quality
 */
export function evaluateResponse(text: string, options: ShapeOptions) {
  const issues: string[] = [];
  const prefs = options.prefs;
  
  // Length check
  const wordCount = text.split(/\s+/).length;
  if (wordCount > (prefs.max_words || 130) + 10) {
    issues.push('too_long');
  }
  
  // Inappropriate vocabulary check (only for non-metaphysical)
  if (prefs.worldview !== 'metaphysical') {
    const extremeTerms = /(ascension|5d|light\s?codes?|portal\s?downloads?)/i;
    if (extremeTerms.test(text)) {
      issues.push('extreme_woo_vocab');
    }
  }
  
  // Concrete action check
  const hasConcrete = /(write|note|breathe|walk|set|call|text|try|practice|today|now)/i.test(text);
  if (['guidance', 'reassurance', 'planning'].includes(options.intent) && !hasConcrete) {
    issues.push('missing_concrete_action');
  }
  
  // Metaphor overuse check
  const metaphorCount = (text.match(/\b(like|as if|as though)\b/gi) || []).length;
  if (metaphorCount > 2) {
    issues.push('too_many_metaphors');
  }
  
  // Directive language check (Oracle should invite, not command)
  const directiveCount = (text.match(/\b(must|should|need to|have to)\b/gi) || []).length;
  if (directiveCount > 1) {
    issues.push('too_directive');
  }
  
  return {
    ok: issues.length === 0,
    issues,
    wordCount,
    score: Math.max(0, 1 - (issues.length * 0.2))
  };
}