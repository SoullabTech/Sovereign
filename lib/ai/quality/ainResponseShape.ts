// @ts-nocheck
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

/**
 * Rewrite prompt for eliminating menu mode and enforcing AIN 4-shape response.
 * Use this as the system prompt when invoking a rewrite reflex.
 */
export const AIN_NO_MENU_REWRITE_PROMPT = `
You are rewriting the assistant reply to eliminate "menu mode" and to match AIN's 4-shape response.

Hard constraints:
- Do NOT use lists of any kind (no bullets, no numbering, no multi-item sequences).
- Do NOT present multiple options, branches, or choices (no "Option A/B", no "either/or", no "if you want X do Y; if you want Z do W").
- Do NOT use "Here are", "Try these", "A few ideas", "You can:", "Strategies:", "Options:", "Choose", "Pick".
- Do NOT use colons followed by multiple items, and do NOT use semicolon item runs.
- Do NOT use headings that look like a menu (no "1)", "2)", "First/Second/Third", no "In case A / in case B").

Output format:
- Exactly 4 short paragraphs.
- Each paragraph is 1–3 sentences.
- The 4 paragraphs must map to:
  1) Reflection (mirrors the user's situation without advice)
  2) Insight (one clear interpretation / frame)
  3) Next step (ONE concrete next step, not a set of choices)
  4) Question (ONE gentle question)

Keep the tone warm, human, and grounded. Preserve key specifics from the original reply, but compress and unify. Choose a single best next step.
`.trim();

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
  signals?: MenuModeSignals; // Detailed menu detection signals
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
  A.forEach((w) => { if (B.has(w)) inter++; });
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

function countInlineDashOptions(text: string): number {
  // Counts inline " - thing" / " – thing" / " — thing" patterns
  // Avoids double-counting lines that already begin as bullets.
  let n = 0;

  for (const line of text.split('\n')) {
    // If the line is already a real bullet/numbered item, the line-based counter handles it.
    if (/^\s*[-*•]\s+\S/.test(line)) continue;
    if (/^\s*\d{1,2}[\).]\s+\S/.test(line)) continue;

    const hyphen = line.match(/\s-\s+\S+/g);
    const enDash = line.match(/\s–\s+\S+/g);
    const emDash = line.match(/\s—\s+\S+/g);

    if (hyphen) n += hyphen.length;
    if (enDash) n += enDash.length;
    if (emDash) n += emDash.length;
  }

  return n;
}

function countIfLadderOptions(text: string): number {
  // Counts sentence-start "If ..." patterns that look like option ladders:
  // "If X..., If Y..., If Z..."
  //
  // We count only when "if" starts a new sentence/segment, to avoid
  // normal mid-sentence conditionals.

  const re = /(?:^|[.!?]\s+|\n\s+|^\s*)(?:if)\s+\S+/gim;
  const matches = text.match(re) ?? [];

  // Reduce false positives by ignoring very short fragments like "if so"
  const filtered = matches.filter(m => m.replace(/\s+/g, ' ').trim().length >= 8);

  return filtered.length;
}

function countListItems(text: string): number {
  // Counts literal list-ish tokens only (bullets, numbered, inline dashes)
  // Does NOT count If-ladders - those are handled separately
  const lines = text.split('\n');
  let n = 0;

  for (const line of lines) {
    if (/^\s*[-*]\s+\S/.test(line)) n++;
    if (/^\s*\d+[\).]\s+\S/.test(line)) n++;
    if (/^\s*•\s+\S/.test(line)) n++;
  }

  n += countInlineBullets(text);
  n += countInlineNumbered(text);
  n += countInlineDashOptions(text);

  return n;
}

export type MenuModeSignals = {
  listItems: number;
  ifCount: number;
  hasMenuPhrases: boolean;
  listMenu: boolean;
  ifLadderMenu: boolean;
  phraseWithItems: boolean;
  numberedStrategies: boolean;
  // Prose menu detection (catches "sneaky" menus hidden in smooth prose)
  colonRunMenu: boolean;       // "You can: X, Y, Z" (comma/semicolon runs after colon)
  semicolonRunMenu: boolean;   // "X; Y; Z" item runs in sentences
  eitherOrMenu: boolean;       // "either ... or ..." branching
  optionABMenu: boolean;       // "Option A/B", "Option 1/2"
};

function looksMenuMode(text: string): { menuMode: boolean; signals: MenuModeSignals } {
  const listItems = countListItems(text);
  const ifCount = countIfLadderOptions(text);

  // Phrase-based triggers
  const hasMenuPhrases = /\b(here are|try these|some ways|a few ways|several ways|strategies|options|steps|things you can|consider these|frameworks to consider)\b/i.test(text);

  // Explicit menu triggers
  const ifLadderMenu = ifCount >= 3;
  const listMenu = listItems >= 3;

  // Also trigger if menu phrases + some list items
  const phraseWithItems = hasMenuPhrases && listItems >= 2;

  // "5 strategies" pattern
  const numberedStrategies = /\d+\s*(strategies|options|ways|things|steps)\b/i.test(text);

  // ═══════════════════════════════════════════════════════════════════════════
  // PROSE MENU DETECTION (catches "sneaky" menus hidden in smooth prose)
  // ═══════════════════════════════════════════════════════════════════════════

  // Colon followed by comma-separated or semicolon-separated items
  // e.g., "You can try: slow breathing, journaling, and a quick walk"
  const colonRunMenu =
    /:\s*[^.\n]{0,160}(?:,\s+\S+){2,}/.test(text) ||
    /:\s*[^.\n]{0,160}(?:;\s*\S+){2,}/.test(text);

  // Semicolon item runs (2+ semicolon-separated items in prose)
  // e.g., "Try grounding; write one sentence; then check in"
  const semicolonRunMenu = (text.match(/;\s*\S+/g) ?? []).length >= 2;

  // Either/or branching in same sentence
  // e.g., "You could either talk to the part directly or distract yourself"
  const eitherOrMenu = /\beither\b[^.\n]{0,120}\bor\b/i.test(text);

  // Option A/B, Option 1/2 language
  // e.g., "Option A is to push through. Option B is to pause."
  const optionABMenu =
    /\boption\s*[A-D]\b/i.test(text) ||
    /\boption\s*\d+\b/i.test(text) ||
    /\bA\/B\b/.test(text);

  const menuMode =
    listMenu ||
    ifLadderMenu ||
    phraseWithItems ||
    numberedStrategies ||
    colonRunMenu ||
    semicolonRunMenu ||
    eitherOrMenu ||
    optionABMenu;

  return {
    menuMode,
    signals: {
      listItems,
      ifCount,
      hasMenuPhrases,
      listMenu,
      ifLadderMenu,
      phraseWithItems,
      numberedStrategies,
      colonRunMenu,
      semicolonRunMenu,
      eitherOrMenu,
      optionABMenu,
    }
  };
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
  const { menuMode, signals } = looksMenuMode(out);
  if (menuMode) {
    const triggers: string[] = [];
    if (signals.listMenu) triggers.push(`${signals.listItems} list items`);
    if (signals.ifLadderMenu) triggers.push(`${signals.ifCount} If-ladder options`);
    if (signals.phraseWithItems) triggers.push('menu phrases + items');
    else if (signals.hasMenuPhrases) triggers.push('menu phrases');
    if (signals.numberedStrategies) triggers.push('numbered strategies pattern');
    // Prose menu triggers
    if (signals.colonRunMenu) triggers.push('colon + item run');
    if (signals.semicolonRunMenu) triggers.push('semicolon item run');
    if (signals.eitherOrMenu) triggers.push('either/or branching');
    if (signals.optionABMenu) triggers.push('Option A/B language');
    notes.push(`Menu mode detected: ${triggers.join(', ')}.`);
  }

  let score = [mirror, bridge, permission, nextStep].filter(Boolean).length;
  if (menuMode) score = Math.max(0, score - 1);

  return {
    pass: score >= 3 && mirror && nextStep && !menuMode,
    flags: { mirror, bridge, permission, nextStep, menuMode },
    signals,
    score,
    notes
  };
}
