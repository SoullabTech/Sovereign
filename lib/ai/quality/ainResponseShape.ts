// @ts-nocheck - AI quality prototype, not type-checked
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

export type AINShapeContext = {
  counselMode?: boolean; // true when mode === 'counsel' — enables structural bridge detection
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
  // Counts dash constructions that function as list-option bullets.
  //
  // MAIA uses em-dashes heavily as a rhetorical device mid-sentence
  // ("clarity that comes — not from thinking about doing") which must NOT
  // be counted as list items. Only count dashes that appear at a true
  // clause boundary:
  //   1. Line starts with optional whitespace then a dash  (line-level bullet)
  //   2. Dash appears immediately after sentence-ending punctuation (.!?)
  //      e.g. "...write the first honest sentence that comes.  — If it's fear of..."
  //
  // Hyphens ( - with surrounding spaces) keep prior behaviour because
  // space-hyphen-space mid-sentence is rare in natural prose.
  let n = 0;

  for (const line of text.split('\n')) {
    // If the line is already a real bullet/numbered item, the line-based counter handles it.
    if (/^\s*[-*•]\s+\S/.test(line)) continue;
    if (/^\s*\d{1,2}[\).]\s+\S/.test(line)) continue;

    // Hyphen: space-hyphen-space mid-line (rare in natural prose — keep as-is)
    const hyphen = line.match(/\s-\s+\S+/g);
    if (hyphen) n += hyphen.length;

    // En-dash / em-dash: only count at line start OR after sentence-end punctuation
    if (/^\s*[–—]\s+\S/.test(line)) n++;
    const afterSentence = line.match(/[.!?]\s+[–—]\s+\S/g);
    if (afterSentence) n += afterSentence.length;
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

export function assessAINResponseShape(input: string, output: string, context?: AINShapeContext): AINShapeResult {
  const notes: string[] = [];
  const out = (output || '').trim();
  const firstChunk = out.slice(0, 350);

  // 1) MIRROR: empathic + in-frame reflection OR meaningful lexical overlap early
  const mirrorPhrases =
    /(i hear you|it sounds like|makes sense|i can see how|in your language|from your perspective|what you're describing)/i;
  const mirror = mirrorPhrases.test(firstChunk) || overlapScore(input, firstChunk) >= 0.20;
  if (!mirror) notes.push('Missing mirror: no empathic reflection and low early overlap with user language.');

  // 2) BRIDGE: the connective move from mirror to meaning
  // Catches cross-framework signposts, reframing language, and natural interpretive connectives
  const bridgePhrases =
    /(this\sconnects\s(to|with)|a\spattern\s(i'?m|i\sam)\s(noticing|hearing|seeing)|what\sthis\s(points\s?to|suggests)\sis|this\sreminds\sme\sof|in\s(other|different)\swords|another\s(lens|angle|frame|way\sto\ssee\sit)|zoom(ing)?\sout|through\s(a|the)\s\w+\s(lens|frame)|in\s+(ifs|jungian|somatic|cbt|buddhist|mystical|psychodynamic)\s+terms|from\sa\s(jungian|somatic|cbt|ifs|developmental|elemental)\s+perspective|also\sconsider|one\sway\sto\sunderstand\s(this|it)\sis|connective\stissue|bridge|ties?\sinto|links?\sto|here'?s\swhat\s(i'?m|i\sam)\s(noticing|hearing|seeing)|what\s(i'?m|i\sam)\s(noticing|hearing)\sis|isn'?t\s\w+[^.]{0,30}it'?s|not\sjust\s\w+[^.]{0,20}you'?re|that'?s\sa\sreal\s(distinction|shift|difference)|there'?s\ssomething\s\w+\sabout\sthat|naming\sa\sshift|sounds\slike\s(what|you)|so\swhat\s(i'?m|you'?re)\s(hearing|saying|naming))/i;
  // Natural connective language the prompt now explicitly guides MAIA toward:
  const bridgeNatural =
    /(what\s(i'?m|i\sam)\snoticing\sis|the\sthing\s(i\snotice|i'?m\snoticing|that\sstrikes\sme)\sis|i'?m\snoticing\s(that|a\s|the\s|how\s)|i\snotice\s(that|a\s|the\s|how\s)|worth\snoticing|what\syou'?re\s(naming|pointing\sto|describing)\sis|what\syou\s(just\s)?(named|pointed\sto|described)\sis|you'?re\snaming\s(something|a\s|the\s)|that'?s\sthe\s(real\s)?(tension|pattern|dynamic|thread|distinction|paradox)|this\s(points\sto|suggests|looks\slike|feels\slike\sa)|there'?s\ssomething\s(here\sabout|underneath|deeper)|what'?s\sunderneath\s(this|that|here)|one\sway\sto\s(read|hold|see|understand)\sthis|another\sway\sto\s(read|hold|see|understand|view)|in\sother\swords|what\sthis\s(reflects|reveals|shows)\sis|the\s(pattern|dynamic|tendency|thread)\shere\sis|what\s(sits|lives|hides)\sunderneath|this\s(kind\sof|pattern\sof)\s|underneath\s(this|that|the)\s|(ifs|jungian|somatic|cbt|elemental|spiralogic)\s+(lens|frame|perspective|terms)|the\s(real\s)?(issue|problem|tension|pattern|challenge)\s(is\b|you'?re\s(describing|naming))|not\s(just|only)\b[^.\n]{0,100}(but\b|it'?s)|it'?s\snot\b[^.\n]{0,100}it'?s|(that'?s|this\sis)\snot\b[^.\n]{0,80}but\b|(that'?s|this\sis)\sactually\b)/i;
  // Structural bridge: counsel mode + established mirror + substantive response length
  // In Counsel, a mirrored deepening question/reflection is itself a bridge
  const structuralBridge = !!(context?.counselMode && mirror && out.length > 180);
  const bridge = bridgePhrases.test(out) || bridgeNatural.test(out) || structuralBridge;
  if (!bridge) notes.push('Missing bridge: no sign of a gentle cross-lens weave.');

  // 3) PERMISSION: micro-permission / consent-seeking language
  // Broadened to catch natural therapeutic consent patterns
  const permissionPhrases =
    /(would you like|are you open to|do you want|should we|may i|is it okay if|let me know if|if you're (comfortable|ready|willing)|want me to|if you'd like|does that feel|sound good|feel free to|whenever you're ready|only if you want|no pressure|take your time|at your own pace|when you're ready|if that resonates|map this into|fire\/water\/earth\/air\/aether|spiralogic)/i;
  // Exploratory invitation detection — therapeutic open-question forms that function as
  // implicit permission: they hand agency back to the member rather than prescribing direction.
  // e.g. "What would help most right now?" "How does that land?" "What feels most true?"
  const permissionExploratory =
    /\b(what would (help|feel|be)\s(most|right|useful|true)[^?]{0,40}\?|how does that land|what feels (most|right|true|alive|real)|what'?s (stirring|alive|present|here|true)\b|what (stands|sits) out|where are you in (that|this)|what matters most (right now|to you|here)|what do you (notice|feel|sense|need) (right now|here|in this)?|what'?s (calling|pulling|asking)|what would (you need|help you)|how are you (with|sitting with) (that|this))\b/i;
  const permission = permissionPhrases.test(out) || permissionExploratory.test(out);
  if (!permission) notes.push('Missing permission: no consent-seeking or permission language detected.');

  // 4) NEXT STEP: a concrete practice / experiment / prompt
  // Primary phrases (explicit signal words — highest confidence):
  const nextStepPhrases =
    /(next step|try this|one small (experiment|thing)|here's a practice|practice:|do this now|for the next 24 hours|journal prompt|a question to sit with|step 1|one thing to try|start (collecting|noticing|tracking))/i;
  // Secondary phrases (natural invitation language MAIA uses):
  const nextStepNatural =
    /(notice what happens|sit with (this|that|it)|take one (slow |deep |breath|moment)|pause (for a moment|and notice)|i invite you to|you might (try|notice|sit|explore|spend|take)|spend (a moment|5 minutes|a few minutes)|write (one|a) sentence|ask yourself|place (a hand|your hand)|breathe (and|in|out|gently)|for the next (few|60|30|90) (seconds?|minutes?)|what would it look like to|what if you (tried|noticed|tracked)|keep a (note|record|log))/i;
  const hasActionList = /\n\s*[-*]\s+/.test(out.slice(Math.max(0, out.length - 500))); // bullets near end
  const nextStep = nextStepPhrases.test(out) || nextStepNatural.test(out) || hasActionList;
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
