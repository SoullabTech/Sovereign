/**
 * Wisdom Guide → prompt addendum
 * ──────────────────────────────────────────────────────────────────────────
 * When a member chooses a guide in "Choose Your Guide" (the Wisdom Council
 * picker — components/wisdom/WisdomCouncilPicker.tsx), the selection is held
 * client-side as `maia.activeTradition` and sent with each turn as a compact
 * `wisdomGuide` payload. This module renders that payload into a prompt block
 * that lets the chosen tradition INFORM MAIA's voice — a lens the member
 * invited, never doctrine and never authority.
 *
 * Why a client payload (not a server import of ELDER_COUNCIL_TRADITIONS):
 * the canonical 39-tradition dataset lives in lib/consciousness/
 * ElderCouncilService.ts, which is an @ts-nocheck prototype that transitively
 * pulls in a heavy morphic-field dependency chain. The picker already resolves
 * the full tradition object in the browser, so the client sends the few fields
 * the prompt needs and the server formats + sanitizes them here. This keeps the
 * prompt path lean and the helper pure/testable. It mirrors the existing
 * precedent in the same request body (maiaMode.systemPromptModifier is likewise
 * client-supplied prompt text).
 *
 * Sovereignty (MAIA = Multi-Archetypal Intelligence Architecture): the guide is
 * an archetypal STANDING SOURCE, not a style layer. It informs what MAIA attends
 * to and how she interprets — never her identity, never doctrine. It has standing,
 * never sovereignty: no source may possess the field or override the member's own
 * meaning. The Interface Humility guardrail is appended after all addenda
 * (see lib/sovereign/maiaVoice.ts and docs/canon/MAIA_MULTI_ARCHETYPAL_INTELLIGENCE.md).
 *
 * Wired into the canonical text brain (FAST / CORE / DEEP) via the addendum
 * channel:
 *   route (meta.wisdomGuide) → buildWisdomGuideAddendum → meta.wisdomGuideAddendum
 *   → maiaService FAST template + MaiaContext.wisdomGuideAddendum (ADDENDA_SPECS).
 */

/** Compact, client-supplied description of the chosen wisdom guide. */
export interface WisdomGuideSelection {
  id?: string;
  name?: string;
  element?: string;
  description?: string;
  archetype?: string;
  mantra?: string;
  principles?: string[];
}

/**
 * Strip control characters, collapse whitespace, and cap length.
 * Control chars are filtered by codepoint (no control-char regex literal) so a
 * malformed payload can't inject newlines or terminal escapes into the prompt.
 */
function clean(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  let out = '';
  for (const ch of value) {
    const code = ch.codePointAt(0) ?? 0;
    out += code < 0x20 || code === 0x7f ? ' ' : ch;
  }
  return out.replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Format an ISO timestamp as YYYY-MM-DD for the lifecycle note; undefined if unparseable. */
function formatSince(iso?: string): string | undefined {
  if (!iso || typeof iso !== 'string') return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

// Field caps — the payload originates from a fixed client constant, but we bound
// it anyway so a malformed/oversized body can never bloat or distort the prompt.
const MAX_NAME = 80;
const MAX_DESCRIPTION = 320;
const MAX_ARCHETYPE = 60;
const MAX_MANTRA = 100;
const MAX_PRINCIPLE = 120;
const MAX_PRINCIPLES = 6;

/**
 * Build the prompt addendum for a member-chosen wisdom guide, rendered as an
 * archetypal standing source (a lineage lens with standing, not authority).
 *
 * Returns `undefined` when no guide is chosen or the payload has no usable name,
 * so the addendum channel simply omits it — no empty block, no synthesis over a
 * gap. The leading marker line ("🧭 ARCHETYPAL STANDING SOURCE — <name>") doubles
 * as the log preview (ADDENDA_SPECS logs `value.split('\n')[0]`).
 */
export function buildWisdomGuideAddendum(
  guide?: WisdomGuideSelection | null,
  opts?: { selectedAt?: string },
): string | undefined {
  if (!guide || typeof guide !== 'object') return undefined;

  const name = clean(guide.name, MAX_NAME);
  if (!name) return undefined;

  const heldSince = formatSince(opts?.selectedAt);

  const description = clean(guide.description, MAX_DESCRIPTION);
  const archetype = clean(guide.archetype, MAX_ARCHETYPE);
  const mantra = clean(guide.mantra, MAX_MANTRA);

  const principles = Array.isArray(guide.principles)
    ? guide.principles
        .map((p) => clean(p, MAX_PRINCIPLE))
        .filter(Boolean)
        .slice(0, MAX_PRINCIPLES)
    : [];

  const lines: (string | null)[] = [
    `🧭 ARCHETYPAL STANDING SOURCE — ${name}`,
    ``,
    `The member has invited ${name} to hold standing in this conversation. Within your multi-archetypal architecture, treat it as one archetypal intelligence that now has standing — a lineage source informing what you attend to and how you interpret. You coordinate among such sources in service of the member's becoming; you do not become this one, and it is not your identity.`,
    heldSince ? `They have kept this source standing since ${heldSince}.` : null,
    ``,
    description ? `Core teaching: ${description}` : null,
    archetype ? `Archetypal pattern: ${archetype}` : null,
    mantra ? `Guiding phrase: "${mantra}"` : null,
    principles.length
      ? `What it attends to:\n${principles.map((p) => `  • ${p}`).join('\n')}`
      : null,
    ``,
    `How to hold this:`,
    `  • Let it shape what you notice and how you frame — it is not a costume for your voice and not a script.`,
    `  • You remain MAIA, coordinating archetypal intelligences. This source has standing, never sovereignty: it does not possess the field or override other sources.`,
    `  • Do not force its concepts where they do not fit. If it has nothing to offer this moment, let it recede.`,
    `  • The member remains the final authority on meaning. Offer the lens; never impose it.`,
  ];

  return lines.filter((l) => l !== null).join('\n');
}
