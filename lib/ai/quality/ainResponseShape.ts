/**
 * AIN Response Shape Evaluator
 *
 * Assesses whether a MAIA response follows the AIN Integrative Alchemy shape:
 * mirror → bridge → permission → next step
 *
 * Used for:
 * - Unit tests with golden examples
 * - Dev-time runtime warnings
 */

export type AINShapeFlags = {
  mirror: boolean;
  bridge: boolean;
  permission: boolean;
  nextStep: boolean;
  menuMode: boolean;
};

export type AINShapeResult = {
  pass: boolean;
  flags: AINShapeFlags;
  score: number; // 0..4
  notes: string[];
};

const STOPWORDS = new Set([
  'the','a','an','and','or','but','if','then','so','to','of','in','on','for','with','at','by',
  'is','are','was','were','be','been','being','it','this','that','these','those','i','you',
  'me','my','your','we','they','them','he','she','his','her','as','from','into','about','not',
  'can','could','would','should','will','just','really','very','like'
]);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s'-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .filter(w => w.length >= 3)
    .filter(w => !STOPWORDS.has(w));
}

function overlapScore(a: string, b: string): number {
  const A = new Set(tokenize(a));
  const B = new Set(tokenize(b));
  if (A.size === 0 || B.size === 0) return 0;
  let inter = 0;
  for (const w of A) if (B.has(w)) inter++;
  return inter / Math.max(1, Math.min(A.size, 10)); // cap denominator a bit
}

function countInlineBullets(text: string): number {
  const m = text.match(/(?:^|\s)•\s+\S+/g);
  return m ? m.length : 0;
}

function countInlineNumbered(text: string): number {
  const m = text.match(/(?:^|\s)\d{1,2}[\).]\s+\S+/g);
  return m ? m.length : 0;
}

function countListItems(text: string): number {
  const lines = text.split('\n');
  let n = 0;

  for (const line of lines) {
    if (/^\s*[-*]\s+\S/.test(line)) n++;
    if (/^\s*\d+[\).]\s+\S/.test(line)) n++;
    if (/^\s*•\s+\S/.test(line)) n++;
  }

  n += countInlineBullets(text);
  n += countInlineNumbered(text);

  return n;
}

function looksMenuMode(text: string): boolean {
  const t = text.toLowerCase();
  const listCount = countListItems(text);
  if (listCount >= 3) return true;
  if (/(here are|try these|some ways|strategies|options|steps|things you can|consider these)\b/.test(t) && listCount >= 2) return true;
  if (/\d+\s*(strategies|options|ways|things|steps)\b/.test(t)) return true;
  return false;
}

export function assessAINResponseShape(input: string, output: string): AINShapeResult {
  const notes: string[] = [];
  const out = (output || '').trim();
  const firstChunk = out.slice(0, 350);

  // 1) MIRROR: empathic + in-frame reflection OR meaningful lexical overlap early
  const mirrorPhrases =
    /(i hear you|it sounds like|makes sense|i can see how|in your language|from your perspective|what you're describing)/i;
  const mirror = mirrorPhrases.test(firstChunk) || overlapScore(input, firstChunk) >= 0.20;
  if (!mirror) notes.push('Missing mirror: no empathic reflection and low early overlap with user language.');

  // 2) BRIDGE: "another lens" gently, or explicit cross-framework signposts
  const bridgePhrases =
    /(another lens|another angle|complementary|in\s+(ifs|jungian|somatic|cbt|buddhist|mystical)\s+terms|through a\s+\w+\s+lens|bridge|connective tissue|also consider)/i;
  const bridge = bridgePhrases.test(out);
  if (!bridge) notes.push('Missing bridge: no sign of a gentle cross-lens weave.');

  // 3) PERMISSION: micro-permission for Spiralogic / elemental mapping
  const permissionPhrases =
    /(want me to map|want me to translate|if you'd like, i can map|would you like me to map|map this into an elemental lens|fire\/water\/earth\/air\/aether|spiralogic)/i;
  const permission = permissionPhrases.test(out);
  if (!permission) notes.push('Missing permission: no micro-permission for Spiralogic/elemental translation.');

  // 4) NEXT STEP: a concrete practice / experiment / prompt
  const nextStepPhrases =
    /(next step|try this|one small experiment|here's a practice|practice:|do this now|for the next 24 hours|journal prompt|a question to sit with|step 1)/i;
  const hasActionList = /\n\s*[-*]\s+/.test(out.slice(Math.max(0, out.length - 500))); // bullets near end
  const nextStep = nextStepPhrases.test(out) || hasActionList;
  if (!nextStep) notes.push('Missing next step: no clear action, practice, or prompt.');

  // 5) MENU MODE: penalize list-heavy, options-heavy responses
  const menuMode = looksMenuMode(out);
  if (menuMode) notes.push('Menu mode detected: response contains multi-option/list strategy pattern.');

  let score = [mirror, bridge, permission, nextStep].filter(Boolean).length;
  if (menuMode) score = Math.max(0, score - 1);

  return {
    pass: score >= 3 && mirror && nextStep && !menuMode,
    flags: { mirror, bridge, permission, nextStep, menuMode },
    score,
    notes
  };
}
