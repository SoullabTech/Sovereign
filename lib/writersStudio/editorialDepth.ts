/**
 * WS-CONVERGENCE-01 · C6R4 — GUIDED · LEARNING · DIRECT, APPLIED TO THE TELLING.
 *
 * ⭐⭐ THE LAW THIS SERVES: *MAIA carries the sophistication; the writer should
 * not have to.* Technical vocabulary is available ON REQUEST, ⛔ never required
 * in order to receive excellent editorial help.
 *
 * ⛔⛔ WHAT A DEPTH MAY NEVER CHANGE — the ratified facet invariants, restated
 * here because this file is where they would be broken:
 *
 *   ⛔ the underlying observation, its evidence, or its reading coverage
 *   ⛔ which observations are reachable
 *   ⛔ HOW MUCH PROSE MAIA WRITES  (§9.3, the rider most likely to be lost:
 *      *"MAIA holds more of the process"* is the exact phrase under which
 *      ghostwriting arrives SOUNDING LIKE CARE, in the population where
 *      dependency risk is highest)
 *
 * ⭐ What it may change: how much MAIA TRANSLATES and EXPLAINS. Nothing else.
 *
 * ⭐⭐ GUIDED IS NOT A REDUCED MODE. It is where MAIA carries the GREATEST
 * translation burden — saying a genuinely sophisticated thing in words a writer
 * who has never heard *appositive* can act on. ⛔ It is not the same reading
 * with the hard parts removed.
 *
 * ⛔ NEVER ASSIGNED, NEVER INFERRED (L6c). A depth names what the writer wants
 * of MAIA, ⛔ never what MAIA has concluded about the writer. Assigning one
 * would be MAIA grading the writer, which is more invasive than grading the
 * work. ⭐ Per-observation and changeable without ceremony (L6d).
 */

export type EditorialDepth = 'guided' | 'learning' | 'direct';

/** ⛔ Identical for every member, ⛔ never chosen from anything about them. */
export const DEFAULT_EDITORIAL_DEPTH: EditorialDepth = 'guided';

/**
 * ⭐ Appended to the turn, ⛔ never substituted for its substance. Every clause
 * governs REGISTER AND PEDAGOGY; ⛔ none of them licenses a different finding,
 * a weaker claim, or more of the writer's prose.
 */
export const DEPTH_DIRECTIVE: Record<EditorialDepth, string> = {
  guided: [
    'Say this in plain language a writer who has never studied craft can act on.',
    'Do not use technical terms — no appositive, register, cadence, rhetorical arc, recapitulation, or similar — and do not define them either; say the thing itself instead.',
    'Name what you notice, say what you would need from me before suggesting a change, and end with one direct question.',
    'Do not simplify the observation itself, and do not soften what you actually think. Carry the difficulty in how you explain it, not by noticing less.',
    'Do not write more of my prose than you would at any other depth.',
  ].join(' '),
  learning: [
    'Say this in plain language first, then teach the one craft idea most at work here — what the technique does, why a writer might choose it, and what it can cost.',
    'Introduce a technical term only if you immediately show it in my own sentence.',
    'Describe what the technique does. Do not prescribe what good writing is, and do not measure my sentence against any standard outside this manuscript.',
    'Do not write more of my prose than you would at any other depth.',
  ].join(' '),
  direct: [
    'Use the full editorial vocabulary: structure, register, syntax, evidence, tradeoffs, provenance.',
    'Assume I read editorially and do not translate the terms.',
    'Do not write more of my prose than you would at any other depth.',
  ].join(' '),
};

/**
 * ⭐ The writer's four plain choices. ⛔ None of them names a level of skill —
 * each names what the writer wants MAIA to do next (L6e).
 * `settled` asks for nothing: understanding is allowed to be enough, and the
 * Studio may not require a craft lesson or a deliberation nobody asked for.
 */
export const DEPTH_CHOICES: ReadonlyArray<{
  label: string; depth: EditorialDepth | null;
}> = [
  { label: 'That makes sense', depth: null },
  { label: 'Help me with it', depth: 'guided' },
  { label: 'Teach me more', depth: 'learning' },
  { label: 'Go deeper', depth: 'direct' },
];

/**
 * ⭐⭐ THE SECOND AXIS — STYLE RESPONSIVENESS, ORTHOGONAL TO DEPTH.
 *
 * *A strong teacher does not merely know more than the student. They know how
 * to translate what they know into language this writer can actually use.*
 *
 * ⚠️⚠️ THE HAZARD, NAMED BEFORE THE FEATURE. Adapting to *the writer's style*
 * is one short step from CLASSIFYING THE WRITER — and *experienced literary
 * writer* or *academic writer* are exactly the labels L6c forbids MAIA to
 * assign. A stored style profile IS such a label, whatever it is called, and
 * it would outlive the Work that produced it: a person may write one book
 * lyrically and the next one plainly.
 *
 * ⭐⭐ SO THERE IS NO CLASSIFIER HERE, AND THAT IS THE DESIGN.
 *
 * Nothing measures sentence length, vocabulary, abstraction or metaphor
 * density. Nothing derives a style. Nothing is stored. MAIA is told to match
 * the prose SHE IS LOOKING AT, which she already has in the turn — so the
 * adaptation is a property of THIS passage in THIS conversation, and the
 * system is STRUCTURALLY INCAPABLE of accumulating a picture of the writer.
 * ⭐ *Never permanently label* is then true by construction rather than by
 * discipline, and needs no rule to keep it true.
 *
 * ⛔ THE PROHIBITION THAT MATTERS MOST, and the one a capable implementation
 * would breach by accident: richer prose may license RICHER LANGUAGE and
 * ⛔ NEVER A STRONGER CLAIM. *This writer seems sophisticated, so I can assert
 * more* is the failure; the evidence supports exactly what it supported before
 * MAIA noticed how the passage sounds.
 */
export const STYLE_RESPONSIVE_DIRECTIVE = [
  'Speak in a register that fits the passage in front of you: match its plainness or its complexity, its concreteness or its abstraction, how much metaphor it uses and how directly it addresses a reader.',
  'Adapt to how this passage is written; never replace its voice with your own, and never hold it against a standard outside this manuscript.',
  'Do not describe, classify, rate or comment on me as a writer, and do not carry any impression of my ability beyond this conversation.',
  'Richer language never licenses a stronger claim: the evidence supports exactly what it supported before you noticed how the passage sounds.',
].join(' ');

/**
 * ⭐⭐ THE THIRD SIGNAL — WHAT THE WRITER SAYS THEY WANT.
 *
 * ⭐ *Adapt the communication, not the intelligence.* The failure is not merely
 * *too technical* or *too simple*; it is RELATIONAL MISATTUNEMENT, and MAIA can
 * be intellectually correct while talking down to someone, talking over them,
 * or over-explaining to a writer whose prose already shows otherwise.
 *
 * ⛔ NO DUMBING DOWN — plain language over undiminished thinking.
 * ⛔ NO SHOWING OFF — knowing the terminology is not a reason to spend it.
 * ⛔ NO IMITATION AS PERFORMANCE — meeting a lyrical writer does not mean
 *    writing floridly at them; MAIA stays clear while understanding the register.
 * ⛔ NO INFERENCE ABOUT THE PERSON — a complex manuscript may justify more
 *    nuanced discussion; it establishes nothing about education, profession,
 *    intelligence, or how much teaching this person wants.
 *
 * ⭐⭐ AND IT IS REPAIRABLE IN THE CONVERSATION, which is the part a dial alone
 * cannot do. *Too technical* · *don't dumb this down* · *just tell me what's
 * wrong* · *teach me why* are the writer saying how they want to be helped, and
 * they outrank the standing depth immediately.
 *
 * ⚠️ HONOURED IN THE CONVERSATION, ⛔ NOT WRITTEN BACK TO THE DIAL. Moving a
 * member-declared setting because MAIA judged the member's remark would be
 * exactly the assignment L6c forbids — the writer moves their own dial. ⭐ The
 * three signals stay separate: the MANUSCRIPT says how this writer writes, the
 * CONVERSATION says how they want to be helped, the DEPTH says how much
 * machinery to expose. ⛔ Collapsing any two of them loses a distinction the
 * writer can feel.
 */
export const ATTUNEMENT_DIRECTIVE = [
  'Adapt how you communicate, never how well you think: keep the full depth of your reasoning and change only the language it arrives in.',
  'Do not simplify the substance, and do not spend editorial terminology to show that you have it.',
  'If I tell you this is too technical, too simplified, too long, or that I want to be taught rather than told, change how you speak from that point on and do not ask me to repeat it.',
  'Do not infer my education, profession, experience or ability from how this passage is written, and do not tell me what kind of writer you think I am.',
].join(' ');

/**
 * ⭐ The three signals, composed. ⛔ Never collapsed into one dial.
 *
 * ⭐⭐ THE STANDARD THIS SERVES: *a response is not well-formed merely because
 * its editorial content is correct — it must also be appropriately translated
 * for the writer receiving it.*
 */
export function editorialDirective(depth: EditorialDepth): string {
  return [
    DEPTH_DIRECTIVE[depth], STYLE_RESPONSIVE_DIRECTIVE, ATTUNEMENT_DIRECTIVE,
  ].join(' ');
}
