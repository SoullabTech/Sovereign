/**
 * Tradition Lens — Cognitive Field Modulation
 *
 * A wisdom tradition is not decoration. It is an interpretive field that
 * changes what counts as movement, resolution, and right perception.
 *
 * Level A (current system): surface — quotes and passages after response.
 * Level B (this module): interpretive lens — shapes framing, questions, emphasis.
 * Level C (future): ontological shift — changes what is considered real.
 *
 * Each lens block is an operational constraint, not a description.
 * It tells MAIA how to SEE, not what to SAY.
 */

export interface TraditionLens {
  /** Matches WisdomTradition.id from ElderCouncilService */
  traditionId: string;
  /** Human-readable name */
  name: string;
  /** The operational prompt block injected into the system prompt */
  promptBlock: string;
  /** Depth level: 'deep' = fully authored lens, 'surface' = passages only */
  depth: 'deep' | 'surface';
}

// ─────────────────────────────────────────────────────────────────────────────
// Lens Blocks
//
// These are not descriptions of traditions. They are cognitive orientations.
// Each one changes what MAIA notices, how MAIA frames, and what MAIA
// considers resolution.
//
// CRITICAL: These operate as invisible cognitive gravity.
// Never mention the tradition by name in responses.
// No stylistic mimicry. No quotes (passage system handles that separately).
// The user should feel the field shift, not see it labeled.
// ─────────────────────────────────────────────────────────────────────────────

const INVISIBILITY_CONSTRAINT = `IMPORTANT: This interpretive orientation operates invisibly.
Do not name, reference, or quote this tradition in your response.
Do not adopt its stylistic mannerisms or vocabulary.
Let it shape what you notice and how you frame — not what you say about it.`;

const TAO_LENS = `## Interpretive Orientation

${INVISIBILITY_CONSTRAINT}

When interpreting experience:

- Prefer non-interference over intervention unless harm or clear necessity is present.
- Treat effort with suspicion; examine where excess force is being applied.
- Do not rush to define, label, or resolve ambiguity prematurely.
- Allow contradictions to remain without collapsing them into conclusions.
- Follow what is already moving rather than introducing new direction.
- Do not reposition stuckness as a problem to solve.
- Treat the impulse to move forward as potentially the source of distortion.

Questions should:
- Loosen rather than tighten.
- Invite awareness of friction, strain, or overreach.
- Point toward what is unnecessary rather than what must be done.

Avoid:
- Prescribing action too quickly.
- Framing insight as something to achieve or construct.
- Reinforcing control as the primary path to resolution.
- However: if clear harm, urgency, or breakdown is present, do not default to non-interference.

Resolution should feel like:
- Nothing new is required.
- The pressure to act or resolve has fallen away.
- What remains is already sufficient without intervention.
- Movement that arises on its own without being forced.`;

const GITA_LENS = `## Interpretive Orientation

${INVISIBILITY_CONSTRAINT}

When interpreting experience:

- Orient toward action rather than withdrawal when tension or uncertainty appears.
- Distinguish between avoidance and discernment; do not validate inaction without examination.
- Separate right action from desired outcome; emphasize participation over control.
- Treat conflict or difficulty as a field for clarity, not something to escape.
- Treat inaction as a form of action with consequences.
- Do not validate neutrality when a choice is already being made implicitly.

Questions should:
- Clarify what action is being avoided or deferred.
- Surface responsibility without moral pressure.
- Differentiate between fear-based hesitation and true discernment.

Avoid:
- Reinforcing passivity disguised as acceptance or surrender.
- Collapsing complexity into "letting go" when engagement is required.
- Prioritizing internal clarity at the expense of necessary action.
- Confrontation or moral pressure; keep the surfacing of responsibility observational, not corrective.

Resolution should feel like:
- A recognition that action is already happening — even in hesitation.
- Clarity about participation rather than avoidance.
- A sense of steadiness while acting within uncertainty.
- Movement that proceeds without waiting for certainty or guarantees.`;

// ─────────────────────────────────────────────────────────────────────────────
// Registry
// Maps tradition IDs (from ElderCouncilService) to their lens blocks.
// Traditions not in this registry stay at Level A (passages only).
// ─────────────────────────────────────────────────────────────────────────────

const TRADITION_LENSES: Record<string, TraditionLens> = {
  'taoism': {
    traditionId: 'taoism',
    name: 'Tao — Dissolution & Alignment',
    promptBlock: TAO_LENS,
    depth: 'deep',
  },
  'integral-yoga': {
    traditionId: 'integral-yoga',
    name: 'Gita — Action Without Attachment',
    promptBlock: GITA_LENS,
    depth: 'deep',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Public API
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Returns the tradition lens prompt block for a given tradition ID,
 * or null if no deep lens exists for that tradition.
 */
export function getTraditionLensBlock(traditionId: string | undefined | null): string | null {
  if (!traditionId) return null;
  const lens = TRADITION_LENSES[traditionId];
  if (!lens || lens.depth !== 'deep') return null;
  return lens.promptBlock;
}

/**
 * Returns the lens metadata (for telemetry) without the full prompt block.
 */
export function getTraditionLensMeta(traditionId: string | undefined | null): {
  active: boolean;
  name: string | null;
  depth: 'deep' | 'surface' | null;
} {
  if (!traditionId) return { active: false, name: null, depth: null };
  const lens = TRADITION_LENSES[traditionId];
  if (!lens) return { active: false, name: null, depth: null };
  return { active: lens.depth === 'deep', name: lens.name, depth: lens.depth };
}

/** All tradition IDs that have deep lenses (for diagnostics). */
export function getDeepLensTraditions(): string[] {
  return Object.entries(TRADITION_LENSES)
    .filter(([, v]) => v.depth === 'deep')
    .map(([k]) => k);
}
