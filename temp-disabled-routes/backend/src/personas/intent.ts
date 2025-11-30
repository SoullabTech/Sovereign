/**
 * Lightweight intent classifier - fast heuristic routing for Maya's tone & tags
 * No external deps - can be swapped for LLM later without changing call sites
 */

export type Intent = 'guidance' | 'explanation' | 'reassurance' | 'smalltalk' | 'planning' | 'exploration';

/**
 * Classify user intent from text using fast heuristics
 */
export function classifyIntent(text: string): Intent {
  const t = text.toLowerCase().trim();
  
  // Questions seeking explanations  
  if (/[?]$/.test(t) && /(how|what|why|can|should|could|do|does|is|will|would)\b/.test(t)) {
    return 'explanation';
  }
  
  // Explicit guidance requests
  if (/(help me|what do i do|guide|walk me|step|practice|exercise|breath|breathe|ground|meditation|ritual)/.test(t)) {
    return 'guidance';
  }
  
  // Emotional distress - needs reassurance
  if (/(i'm anxious|i am anxious|scared|overwhelmed|stressed|sad|stuck|lost|lonely|afraid|worried|panic|depression|anxious|crisis|emergency)/.test(t)) {
    return 'reassurance';
  }
  
  // Planning and goal-setting
  if (/(plan|roadmap|next week|milestone|timeline|priorit|todo|task|goal|schedule|organize|structure)/.test(t)) {
    return 'planning';
  }
  
  // Casual conversation
  if (/(^hi\b|^hello\b|^hey\b|what's up|how are you|good morning|good afternoon|thanks|thank you)/.test(t)) {
    return 'smalltalk';
  }
  
  // Deep exploration - metaphysical, philosophical, archetypal
  if (/(meaning|purpose|soul|consciousness|archetype|shadow|dream|synchronicity|divine|sacred|mystery|death|afterlife|spirit|energy|vibration)/.test(t)) {
    return 'exploration';
  }
  
  // Default to explanation for unclear intent
  return 'explanation';
}

/**
 * Get confidence score for intent classification (0-1)
 */
export function getIntentConfidence(text: string, intent: Intent): number {
  const t = text.toLowerCase();
  
  const patterns = {
    guidance: /(help me|guide|practice|exercise|breath|meditation|ritual)/g,
    explanation: /([?]$|how|what|why|can|should)/g,
    reassurance: /(anxious|scared|overwhelmed|stressed|sad|stuck|lost|lonely|afraid|worried)/g,
    planning: /(plan|roadmap|milestone|timeline|goal|schedule|organize)/g,
    smalltalk: /(^hi\b|^hello\b|^hey\b|what's up|how are you|thanks)/g,
    exploration: /(meaning|purpose|soul|consciousness|archetype|shadow|synchronicity|sacred)/g
  };
  
  const matches = (t.match(patterns[intent]) || []).length;
  const maxMatches = Math.max(1, ...Object.values(patterns).map(p => (t.match(p) || []).length));
  
  return Math.min(1, matches / maxMatches);
}

/**
 * Detect if text contains urgent/crisis language requiring immediate escalation
 */
export function detectCrisis(text: string): boolean {
  const t = text.toLowerCase();
  return /(suicide|kill myself|end it all|want to die|self harm|hurt myself|emergency|crisis|911)/.test(t);
}

/**
 * Extract emotional indicators from text
 */
export function extractEmotions(text: string): string[] {
  const t = text.toLowerCase();
  const emotions: string[] = [];
  
  if (/(anxious|anxiety|worried|panic)/.test(t)) emotions.push('anxiety');
  if (/(sad|depressed|down|blue)/.test(t)) emotions.push('sadness');  
  if (/(angry|mad|frustrated|irritated)/.test(t)) emotions.push('anger');
  if (/(excited|happy|joyful|great)/.test(t)) emotions.push('joy');
  if (/(confused|lost|stuck|unclear)/.test(t)) emotions.push('confusion');
  if (/(lonely|isolated|alone)/.test(t)) emotions.push('loneliness');
  if (/(overwhelmed|too much|can't handle)/.test(t)) emotions.push('overwhelm');
  
  return emotions;
}