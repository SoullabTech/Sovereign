/**
 * BUILD-07E — how a frozen observation is named to the model, in the author's terms.
 *
 * WHY THIS EXISTS. Section identities in this system are UUIDs. The Reader-04
 * production gate established that no raw UUID appears in MAIA's prose, and 07E
 * adds new MAIA prose inside the same DEVELOP mode — so a dialogue packet that
 * handed her `section 5bfdd360-…` would recreate exactly the surface that repair
 * removed, one lane over.
 *
 * IT IS A CAPABILITY REMOVAL, NOT AN INSTRUCTION. "Do not mention identifiers"
 * in a standing prompt is a request; a model that never receives one cannot
 * repeat it. Every function here takes an id and CANNOT return it: there is no
 * branch, including the not-found branch, that falls through to the raw value.
 *
 * IT COSTS Q2 NOTHING. Every label is derived from the reading's own FROZEN
 * state — `sectionTopology` for order, `structureContext` for authored titles —
 * which is what the Work was when she read it. Nothing here reads the current
 * manuscript, so naming a section "Section 3" is a statement about the reading,
 * not a fresh look at the Work.
 *
 * THE ONE ADMITTED EXCEPTION is an authored title that happens to look like an
 * identifier. That is the author's own content about their own Work, and the
 * ruling is explicit that a meaningful identifier may reach her. We do not
 * launder the author's words to satisfy a shape test.
 */

import type { DevelopmentalReadState } from '../development/readState';

export interface AuthorFacingLabels {
  /** "Section 3", or an honest phrase — never the id. */
  section(id: string): string;
  /** "Sections 2, 3 and 4" in the reading's own order — never ids. */
  sections(ids: readonly string[]): string;
  /** The frozen authored title, or an honest positional phrase — never the id. */
  unit(id: string): string;
}

/** Oxford-free, because these are read aloud in a sentence MAIA is composing. */
function joinNaturally(parts: readonly string[]): string {
  if (parts.length === 0) return 'no sections';
  if (parts.length === 1) return parts[0];
  return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

export function labelsFor(readState: DevelopmentalReadState): AuthorFacingLabels {
  /* Position in the topology AS READ. Built once: an observation with many
     references would otherwise scan the topology per reference. */
  const ordinal = new Map<string, number>();
  readState.sectionTopology.forEach((id, i) => ordinal.set(id, i + 1));

  const units = new Map(
    (readState.structureContext?.units ?? []).map((u) => [u.id, u]));

  const section = (id: string): string => {
    const n = ordinal.get(id);
    /* NOT FOUND IS SAID, NOT FILLED IN. A reference outside the frozen topology
       is a fact about the reading, and the honest phrase is more use to her than
       an identifier she cannot place anyway. */
    return n === undefined ? 'a section outside what you read' : `Section ${n}`;
  };

  return {
    section,
    sections: (ids) => joinNaturally(ids.map(section)),
    unit: (id: string): string => {
      const u = units.get(id);
      if (!u) return 'a part of your structure that was not frozen with this reading';
      /* The author's own title, where they gave one. */
      if (u.title !== null && u.title.trim() !== '') return `"${u.title}"`;
      const kind = u.kind ?? 'part';
      return `an untitled ${kind} (number ${u.position + 1} at its level)`;
    },
  };
}
