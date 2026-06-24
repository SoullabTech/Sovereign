/**
 * Archetype grammar — the content-free SOCKET (the seam between Standing and Constitution)
 * ──────────────────────────────────────────────────────────────────────────────────────
 * This file is deliberately EMPTY OF DOCTRINE. It prepares the place an authored
 * archetype will land; it does not author one. The distinction (Kelly, 2026-06-06):
 *
 *   | Layer     | What it is                                   | Built here? |
 *   |-----------|----------------------------------------------|-------------|
 *   | Transport | injection / persistence / rendering          | yes         |
 *   | Schema    | the grammar SHAPE (function/gift/…)          | yes (this)  |
 *   | Doctrine  | what Prophet's `function` actually IS         | NO (Kelly)  |
 *
 * The renderer knows how to render. It does not know what any archetype is. The
 * mistake to avoid is encoding doctrine into software before the doctrine exists —
 * so every field below is a placeholder shape, never a value.
 *
 * WHY `function` IS THE PRIMARY PRIMITIVE (ablation 2026-06-06, the load-bearing finding).
 * The real payload of a standing source is a **mode of attention**, not principles /
 * beliefs / teachings / content. The Vedic arm did not fail for lack of content — it
 * failed for lack of a `function`: the current payload ships `principles: [Rta, Agni,
 * …]` (content), so on a secular problem there was nothing to attend *with*, and MAIA
 * correctly refused to impose the religious vocabulary. Adding more principles deepens
 * the same failure; authoring a `function` changes the *category* of what is injected.
 * Hence `isInjectable()` gates on `function` alone — a socket with content but no
 * function injects nothing. The grammar's `function` field is the translation layer
 * (lineage-role → domain-general mode of attention; e.g. Priest → "consecrates
 * attention"). See docs/canon/ARCHETYPAL_GRAMMAR.md ·
 * docs/specs/GUIDE_ABLATION_PROTOCOL.md · docs/papers/GUIDE_AS_OPERATING_LENS_2026-06.md.
 *
 * NOT WIRED. The live prompt path (buildWisdomGuideAddendum over the
 * ELDER_COUNCIL_TRADITIONS payload) is unchanged and remains the only thing in
 * production-bound code. Wiring this socket into that path is Phase 2 and happens
 * only once at least one lineage's `function` fields are authored — not before.
 */

/**
 * The grammar shape — one archetype. Only `name` is always present; every doctrine
 * field is optional and EMPTY until authored. Field names track
 * docs/canon/ARCHETYPAL_GRAMMAR.md (Kelly's `restrained_by` is canonically `heldBy`).
 */
export interface Archetype {
  /** The archetype's name, e.g. "Prophet". The only field the socket supplies. */
  name: string;

  /**
   * PRIMARY PRIMITIVE — the mode of attention: "what this intelligence does / how it
   * attends." This, not content, is what a standing source actually injects. Empty
   * until authored (doctrine — Kelly).
   */
  function?: string;

  /** What it offers in right relationship. */
  gift?: string;

  /**
   * How it harms when it possesses the field (sovereignty clause 3). Required of an
   * authored archetype; absent in the socket.
   */
  distortion?: string;

  /**
   * Optional & polymorphic — the force / practice / primitive that holds the
   * distortion in check (grammar: "held by"; Kelly's note: `restrained_by`). May
   * cross elements (e.g. Steward / Earth holds Priest / Fire).
   */
  heldBy?: string;

  /** The embodied integration it invites. */
  practice?: string;
}

/**
 * Is this archetype authored enough to inject? The gate is `function` — the mode of
 * attention — NOT the presence of content. This operationalizes the 2026-06-06
 * finding: without a `function` there is nothing to attend with, so the socket must
 * inject nothing (exactly what kept the Vedic payload from being smuggled into a
 * secular problem). An unauthored placeholder is, by construction, not injectable.
 */
export function isInjectable(a: Archetype): boolean {
  return typeof a.function === 'string' && a.function.trim().length > 0;
}

/**
 * Render an archetype as a standing-source block. The renderer renders the SHAPE,
 * `function` first (the primary primitive); empty fields are omitted entirely — no
 * empty labels, no synthesis over a gap. It has no knowledge of any archetype's
 * content. An unauthored placeholder renders to just its header line.
 */
export function renderArchetypeStandingSource(a: Archetype): string {
  const lines: string[] = [`🧭 ARCHETYPAL STANDING SOURCE — ${a.name}`];
  if (a.function && a.function.trim()) lines.push(`Function: ${a.function.trim()}`);
  if (a.gift && a.gift.trim()) lines.push(`Gift: ${a.gift.trim()}`);
  if (a.distortion && a.distortion.trim()) lines.push(`Distortion Watch: ${a.distortion.trim()}`);
  if (a.heldBy && a.heldBy.trim()) lines.push(`Held by: ${a.heldBy.trim()}`);
  if (a.practice && a.practice.trim()) lines.push(`Practice: ${a.practice.trim()}`);
  return lines.join('\n');
}

/**
 * The one placeholder that makes the seam tangible: the first archetype awaiting
 * authoring. Every doctrine field is empty — Prophet's `function` is Kelly's to
 * author (the double-duty Fire primitive; docs/canon/grammar/RIG_VEDA_FIRE.md). By
 * construction `isInjectable(PROPHET) === false`: an unauthored socket injects
 * nothing. When Prophet's `function` arrives, it lands here — and only then.
 */
export const PROPHET: Archetype = { name: 'Prophet' };
