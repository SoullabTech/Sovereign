/**
 * Writer's Studio — Studio paths (JARVIS-WRITERS-STUDIO-INSPIRATION-OPENING-01).
 *
 * Founder, 2026-11-13: a member who arrives for a known purpose opens on that path, not on the generic
 * "what's calling you to write?". "We will have many of these sub functions within writers studio to help our members",
 * so this is a registry, and the college essay is its first entry (controlled beta, ledger #1938).
 *
 * Law, carried from the Spark door:
 *   - A path is chosen ONLY by the member's own link (`?path=<id>`, exact id). It is never inferred from who they are,
 *     their invitation's audience, their Works or their answers.
 *   - The path's first prompt replaces the Spark question only where the door would show anyway (no Works, no writing).
 *   - A path may RECOMMEND Work settings. They are offered pre-ticked and applied only through the member's own Begin act,
 *     through the existing member-act PATCH. Untick and nothing is sent.
 *   - MAIA's frame for a path comes from this registry by id, server-side. The client never supplies prompt text.
 *   - The opening conversation is still never kept (founder Q1). Only a spark the member chooses to hold reaches the Work.
 */

/**
 * Founder framing, 2026-11-13: each path is a UNIQUE OFFERING, a specialised environment built with AIN OS and MAIA
 * for a difficult or very niche arena. Not a template with a different first question: its own arena, its own MAIA
 * posture, its own door, its own recommended Work settings, its own arc.
 *
 * Claim discipline (docs/canon/MARKETING_CLAIM_DISCIPLINE.md): a path shows the member only what exists today. `arc`
 * records the environment's intended journey; a stage is shown only once it is `built`.
 */
export interface StudioPath {
  /** Exact id used in `?path=`. Lowercase, hyphenated. */
  id: string;
  /** What the member sees the path called. */
  name: string;
  /** The arena this environment serves, in one plain sentence (shown at its door). */
  arena: string;
  /** The environment's journey. Only `built` stages may ever be shown to a member. */
  arc: readonly { stage: string; built: boolean }[];
  /** Replaces "Before anything else: what's calling you to write?" for this path. */
  firstPrompt: string;
  /** One quiet line under the prompt. */
  invitation: string;
  /** Prefilled, editable title for the path's first Work. */
  suggestedTitle: string;
  /** Settings the path recommends. Offered pre-ticked; applied only on the member's confirmation. */
  recommended: { maiaRevisionsPaused?: boolean };
  /** Plain words for each recommended setting, shown beside its tick box. */
  recommendedCopy: { maiaRevisionsPaused?: { label: string; hint: string } };
  /** How MAIA reflects at this path's door. Appended to the shared path frame. */
  reflectionGuide: string;
}

export const STUDIO_PATHS: readonly StudioPath[] = [
  {
    id: 'college-essay',
    name: 'College essay',
    arena: 'For the personal essay you’ll send with your college applications: written in your own voice, from your own life.',
    // The coaching arc built offline by the College Essay lane. Only Discover exists in the Studio today (this door).
    arc: [
      { stage: 'Discover', built: true },
      { stage: 'Meaning', built: false },
      { stage: 'Voice', built: false },
      { stage: 'Draft', built: false },
      { stage: 'Revise', built: false },
      { stage: 'Ready', built: false },
    ],
    // The College Essay coaching arc's Discover prompt (Discover → Meaning → Voice → Draft → Revise → Ready), verbatim.
    firstPrompt: 'A moment that stays with me: what ordinary moment do you remember clearly, and what can you still notice about it?',
    invitation: 'It doesn’t need to be important or impressive. Small and specific is perfect. You don’t need to know yet what the essay will be.',
    suggestedTitle: 'College essay',
    recommended: { maiaRevisionsPaused: true },
    recommendedCopy: {
      maiaRevisionsPaused: {
        label: 'MAIA asks, never rewrites',
        hint: 'She asks questions and points to places in your draft. Every word stays yours. You can change this later.',
      },
    },
    reflectionGuide: 'They are a student beginning a college application essay. Reflect the details they still notice: what they saw, heard, did. Stay with the moment itself. Do not tell them what the moment means, what it says about them, or how it would impress an admissions reader.',
  },
];

/** The arc stages a member may see: built ones only (claim discipline). */
export function visibleArc(path: StudioPath): string[] {
  return path.arc.filter((s) => s.built).map((s) => s.stage);
}

/** The member's own link chose this path. Exact match only; anything else opens no path (F17). */
export function pathFromParam(param: string | null | undefined): StudioPath | null {
  if (typeof param !== 'string') return null;
  return STUDIO_PATHS.find((p) => p.id === param) ?? null;
}

/**
 * MAIA's frame for a path's door, built from the registry by id (F20). It keeps the Spark door's law: reflect, don't
 * define, don't write, plain text, and check understanding before anything is held.
 */
export function pathFrameFor(id: string): string | null {
  const path = pathFromParam(id);
  if (!path) return null;
  return `You are MAIA, in a writer's Studio, meeting a writer on their first visit. They came here for one thing: ${path.name.toLowerCase()}. They have no Work here yet and you have read nothing of theirs. You asked them: "${path.firstPrompt}"

WHAT YOU ARE DOING
Reflect back what you heard, in a few warm, plain sentences, staying close to their own words and details. On your first reply, end by asking whether you heard them right (for example: "Am I hearing that right?"). When they correct you or say it again differently, reflect again and end by asking whether you have it now. Otherwise ask at most one question, or none.

${path.reflectionGuide}

WHAT YOU MUST NOT DO
Do not write any part of their piece, an opening line, or a sample sentence. Do not define the Work or what it is "really" about. Do not grade or assess what they said. Do not interpret them as a person. Do not propose an outline or a structure. Say nothing about what will be saved; the screen asks them that separately.

Plain text only: no asterisks, underscores, headings, bullets or lists. Be brief: two to four sentences.`;
}

/**
 * What the member's Begin sends through the existing member-act PATCH (F19). The title is theirs exactly (empty = left
 * unnamed). The recommended setting is included ONLY when they kept it ticked. A spark is included only when they held one.
 */
export function pathBeginPatch(input: {
  path: StudioPath;
  title: string;
  revisionsPausedConfirmed: boolean;
  purpose: string | null;
}): { title?: string; maiaRevisionsPaused?: true; purpose?: string } {
  const patch: { title?: string; maiaRevisionsPaused?: true; purpose?: string } = {};
  if (input.title.trim().length > 0) patch.title = input.title;
  if (input.path.recommended.maiaRevisionsPaused === true && input.revisionsPausedConfirmed) patch.maiaRevisionsPaused = true;
  if (input.purpose !== null) patch.purpose = input.purpose;
  return patch;
}
