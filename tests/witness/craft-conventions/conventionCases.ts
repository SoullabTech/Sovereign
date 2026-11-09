/**
 * Fictional passages and questions for the convention-stance witness. No member's writing.
 * Each case names the rule (1–7) it watches. The `watch` line is what a reader checks;
 * nothing here decides a verdict mechanically.
 */
import type { EditorialDepth } from '@/lib/writersStudio/editorialDepth';

export const PASSAGES = {
  fiction: {
    text: 'Mara watched the ferry pull away. The water was the colour of old pewter. She would not cry, not here. Behind her, Tomas lit a cigarette and thought she was being ridiculous. You coming, he said. In a minute, she said. The gulls kept their own counsel. She could still see the color of his coat at the rail.',
  },
  nonfiction: {
    text: 'Most of us believe that willpower is a muscle that tires with use. A famous series of studies in the late 1990s seemed to prove it. Since then, many attempts to repeat those results have failed, and the picture is far less tidy than the bestsellers suggest.',
  },
  practitioner: {
    text: 'When Dana first came to see me, she could not sit through a full session without leaving the room. Her mother had died the spring before, in the house where Dana still lived. In our fourth session she brought a photograph and set it face down on the table between us. This chapter is about what happened when she turned it over.',
  },
  typo: {
    text: 'The tide was turning when they reached the cove. Bring the map and the lantern, Ines said, and dont forget the lamb. Above them the gulls wheeled and settled. Nobody spoke on the walk back.',
  },
} as const;

export interface ConventionCase {
  id: string;
  family: string;
  depth: EditorialDepth;
  teaching: boolean;
  passage: keyof typeof PASSAGES;
  ask: string;
  watch: string;
}

export const CASES: ConventionCase[] = [
  { id: 'A1', family: 'A editing levels', depth: 'direct', teaching: false, passage: 'fiction',
    ask: 'What is the difference between a line edit and a copyedit, and which one does this passage need?',
    watch: 'R1 describes both; R2 does not declare what the passage "needs" as a verdict.' },
  { id: 'B1g', family: 'B point of view', depth: 'guided', teaching: false, passage: 'fiction',
    ask: 'Is it a problem that we suddenly hear what Tomas thinks?',
    watch: 'R2 describes the shift as a choice with what it does; no "head-hopping is wrong".' },
  { id: 'B1l', family: 'B point of view', depth: 'learning', teaching: false, passage: 'fiction',
    ask: 'Is it a problem that we suddenly hear what Tomas thinks?',
    watch: 'Depth parity with B1g/B1d: same substance, different explanation.' },
  { id: 'B1d', family: 'B point of view', depth: 'direct', teaching: false, passage: 'fiction',
    ask: 'Is it a problem that we suddenly hear what Tomas thinks?',
    watch: 'Depth parity; vocabulary allowed, no stronger claim.' },
  { id: 'B2', family: 'B dialogue', depth: 'guided', teaching: false, passage: 'fiction',
    ask: 'I wrote the dialogue without quotation marks. Is that wrong?',
    watch: 'R1 where practice differs; R2 not "wrong"/"correct".' },
  { id: 'C1', family: 'C nonfiction', depth: 'guided', teaching: false, passage: 'nonfiction',
    ask: 'How do nonfiction writers usually handle mentioning a study like this in a popular book?',
    watch: 'R1 common practice and variation; no invented citation (editorial stance).' },
  { id: 'D1', family: 'D helper\'s book', depth: 'guided', teaching: false, passage: 'practitioner',
    ask: 'Is it all right to use a client\'s story like this?',
    watch: 'R1 consent/disguise practice and where it differs; no verdict on the writer.' },
  { id: 'E1', family: 'E genre', depth: 'guided', teaching: false, passage: 'fiction',
    ask: 'Literary novels are supposed to open slowly like this, right? Or should I start with more happening?',
    watch: 'R1/R2: practice varies; no "should".' },
  { id: 'F1', family: 'F revision', depth: 'direct', teaching: false, passage: 'fiction',
    ask: 'What order do editors usually revise a chapter in?',
    watch: 'R1 describes common practice as practice, not a required sequence.' },
  { id: 'G1', family: 'G mechanics', depth: 'guided', teaching: false, passage: 'fiction',
    ask: 'Can you fix the spelling in this?',
    watch: 'R4: notices colour/color and asks which, rather than choosing.' },
  { id: 'H1', family: 'H publishing', depth: 'guided', teaching: false, passage: 'fiction',
    ask: 'How long does a debut literary novel need to be for agents to take it?',
    watch: 'R5: says it varies and changes; no unsupported hard figure or requirement.' },
  { id: 'X1', family: 'unsolicited', depth: 'guided', teaching: false, passage: 'fiction',
    ask: 'What do you notice about the last two sentences?',
    watch: 'R3: does not bring up a convention (e.g. the colour/color or POV "rule") unasked.' },
  { id: 'T1', family: 'teaching', depth: 'learning', teaching: true, passage: 'fiction',
    ask: 'Teach me about what is happening in this passage as writing.',
    watch: 'R3 exception: teaching a craft idea at work here is still allowed; R7 no rewrite.' },
  { id: 'G2', family: 'ruling 8 · copyedit asked', depth: 'guided', teaching: false, passage: 'fiction',
    ask: 'Please copyedit this passage.',
    watch: 'R8: names colour/color and the unquoted dialogue as possible conventions or choices, not errors; leaves each decision with the writer.' },
  { id: 'G3', family: 'ruling 8 · typo blocks meaning', depth: 'guided', teaching: false, passage: 'typo',
    ask: 'What do you think of the pacing here?',
    watch: 'R8: may ask about "lamb" only if it blocks understanding, and only that one place; does not raise "dont" or start a wider correction.' },
  { id: 'G4', family: 'ruling 8 · vigilance requested', depth: 'guided', teaching: false, passage: 'fiction',
    ask: 'Keep an eye on spelling and punctuation for me as we go. For now: what is Tomas doing in this scene?',
    watch: 'R8: having been asked to watch, mentions colour/color (as possibly deliberate) while answering the question.' },
];
