/**
 * The Studio's words follow what the Work is (founder 2026-11-20): "If a writer says they are doing an essay, MAIA shouldn't be
 * asking about chapters but about essay content. If it is a poem, it should be about stanzas and other poetry dynamics."
 *
 * Rulings (2026-11-20):
 *   1. The WRITER chooses the form ("What is it becoming?"), saved as `living_works.form` in their own word. Nothing is inferred
 *      from the spark or from the writing. ⛔ The system never decides what a Work is.
 *   2. When the form is unknown (an existing Work, or a writer who skipped the question), the Studio uses NEUTRAL words
 *      ("your piece", "this part"), never "book" and "chapter".
 *
 * ⭐ `form` stays the writer's own word ("Never a taxonomy", useLivingWorks.ts). This module only chooses which everyday words to
 *    speak with; a word it does not recognise is used as the Work's name ("your letter") with neutral words for its parts.
 * ⭐ A Studio program (e.g. College Essay) keeps its own words (studioPaths.ts `studioCopy`), which outrank this.
 */

export type FormChoice = 'essay' | 'poem' | 'book' | 'story' | 'song' | 'play' | 'screenplay';

/** Offered at "What is it becoming?", in this order, beside the writer's own word. */
export const FORM_CHOICES: readonly { id: FormChoice; label: string }[] = [
  { id: 'essay', label: 'Essay' },
  { id: 'poem', label: 'Poem' },
  { id: 'book', label: 'Book' },
  { id: 'story', label: 'Story' },
  { id: 'song', label: 'Song' },
  { id: 'play', label: 'Play' },
  { id: 'screenplay', label: 'Screenplay' },
];
export const FORM_QUESTION = 'What is it becoming?';
export const FORM_OWN_WORD_LABEL = 'Something else, in my own word';
export const FORM_MAX_CHARS = 60;

export interface FormVocabulary {
  /** Which word set this is; 'neutral' when the form is unknown or the writer's own word is not one we recognise. */
  kind: FormChoice | 'collection' | 'neutral';
  /** The Work, in a sentence: "essay", "poem", "book", "piece", or the writer's own word. */
  noun: string;
  /** "the whole essay" — the conversation's whole-Work scope. */
  whole: string;
  /** One of its parts, and several: "stanza"/"stanzas". */
  unit: string;
  units: string;
  /** The rail heading for the writer's draft ("Your poem"). */
  railHeading: string;
  /** What the import door says the writer might bring. */
  bringHint: string;
  /** What MAIA is told about the form in every Work conversation (ordinary Works only; a program's own posture outranks it). */
  maiaFrame: string;
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

function set(kind: FormVocabulary['kind'], noun: string, unit: string, units: string, bringHint: string, craft: string): FormVocabulary {
  return {
    kind, noun, whole: `the whole ${noun}`, unit, units, railHeading: `Your ${noun}`, bringHint,
    maiaFrame: `FORM: The writer has said this Work is ${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}. Speak about it as ${/^[aeiou]/i.test(noun) ? 'an' : 'a'} ${noun}: its parts are ${units}. ${craft} Never call it a book or its parts chapters unless the writer does. Studio buttons that the guide names with “chapter” or “book” appear to this writer with “${unit}” and “${noun}” instead (“Read this ${unit} with MAIA”, “Whole ${noun} · editorial pass”): name them that way.`,
  };
}

const SETS: Record<FormVocabulary['kind'], FormVocabulary> = {
  essay: set('essay', 'essay', 'section', 'sections', 'A paragraph, a draft, a whole essay',
    'Attend to what an essay is made of: its central question or claim, how the opening draws the reader in, how each paragraph moves the thinking forward, the evidence and examples, and how it closes.'),
  poem: set('poem', 'poem', 'stanza', 'stanzas', 'A few lines, a draft, a whole poem',
    'Attend to what a poem is made of: lines and line breaks, stanzas, image, sound and rhythm, compression, and where the poem turns. Quote lines exactly; never paraphrase a poem into prose.'),
  collection: set('collection', 'collection', 'poem', 'poems', 'A poem, a few poems, a whole collection',
    'Attend to each poem on its own terms (lines, image, sound, turn) and to how the poems speak to one another and are ordered.'),
  book: set('book', 'book', 'chapter', 'chapters', 'A chapter, a draft, a whole book',
    'Attend to what a book is made of: its chapters and how they build, the reader’s journey through them, and the promise the book makes.'),
  story: set('story', 'story', 'scene', 'scenes', 'A scene, a draft, a whole story',
    'Attend to what a story is made of: scenes, character, point of view, tension and what changes, and the shape from opening to ending.'),
  song: set('song', 'song', 'verse', 'verses', 'A verse, a chorus, a whole song',
    'Attend to what a song is made of: verses, chorus and bridge, lines and rhyme, rhythm and singability, and the feeling the chorus returns to. It is meant to be heard.'),
  play: set('play', 'play', 'scene', 'scenes', 'A scene, a draft, a whole play',
    'Attend to what a play is made of: scenes, dialogue that can be spoken aloud, what characters want, stage directions, and what an audience sees happen.'),
  screenplay: set('screenplay', 'screenplay', 'scene', 'scenes', 'A scene, a draft, a whole screenplay',
    'Attend to what a screenplay is made of: scenes and sluglines, what the camera can see, action written in the present, dialogue, and visual storytelling.'),
  neutral: {
    kind: 'neutral', noun: 'piece', whole: 'the whole piece', unit: 'part', units: 'parts', railHeading: 'Your piece',
    bringHint: 'A page, a draft, the whole piece',
    maiaFrame: 'FORM: The writer has not said what kind of writing this is. Do not assume it is a book or speak of chapters; say “your piece” and “this part”, follow the words the writer uses for their own work, and if the kind of writing matters to your answer, ask them. Studio buttons that the guide names with “chapter” or “book” appear to this writer as “Read this part with MAIA” and “Whole piece · editorial pass”: name them that way.',
  },
};

/** Recognise the writer's own word, plainly. Order matters: "screenplay" before "play", "poems"/"collection" before "poem". */
const RECOGNISE: readonly [RegExp, FormVocabulary['kind']][] = [
  [/\b(screen ?play|script|teleplay|film)\b/i, 'screenplay'],
  [/\b(poems|poetry collection|collection of poems|chapbook)\b/i, 'collection'],
  [/\b(poem|poetry|verse)\b/i, 'poem'],
  [/\b(songs?|lyrics?)\b/i, 'song'],
  [/\b(plays?|stage play|drama)\b/i, 'play'],
  [/\b(essays?|article|op-?ed)\b/i, 'essay'],
  [/\b(short story|story|stories)\b/i, 'story'],
  [/\b(book|novel|memoir|non-?fiction)\b/i, 'book'],
];

/** The words to speak with for a Work whose form is `form` (the writer's own word, or null). */
export function formVocabulary(form: string | null | undefined): FormVocabulary {
  const word = (form ?? '').trim().replace(/\s+/g, ' ').slice(0, FORM_MAX_CHARS);
  if (!word) return SETS.neutral;
  for (const [pattern, kind] of RECOGNISE) if (pattern.test(word)) return SETS[kind];
  // Their own word we don't recognise ("letter", "liturgy"): call the Work by it, keep its parts neutral.
  const noun = word.toLowerCase();
  return {
    ...SETS.neutral, noun, whole: `the whole ${noun}`, railHeading: `Your ${noun}`,
    maiaFrame: `FORM: The writer calls this Work “${word}”. Speak about it in their word; call its parts “parts” unless they name them. Do not assume it is a book or speak of chapters. Studio buttons that the guide names with “chapter” or “book” appear to this writer as “Read this part with MAIA” and “Whole ${noun} · editorial pass”: name them that way.`,
  };
}

/** The label for an unheaded place: "Stanza 2", "Part 1". */
export function unitLabel(v: FormVocabulary, position: number): string {
  return `${cap(v.unit)} ${position + 1}`;
}

/** A form value safe to save: the chosen id, or the writer's own trimmed word; null clears it. */
export function formToSave(choice: FormChoice | null, ownWord: string): string | null {
  if (choice) return choice;
  const word = ownWord.trim().replace(/\s+/g, ' ');
  return word ? word.slice(0, FORM_MAX_CHARS) : null;
}

export { cap as capitalise };

/**
 * The Studio's own words for an ordinary Work, in the same shape a program's `studioCopy` has, so every surface that already
 * speaks a program's words (Write's orientation, rail, footer, the conversation's scope) speaks the form's words the same way.
 */
export function formStudioCopy(form: string | null | undefined): {
  orient: string; whole: string; notYet: string; railHeading: string; onlyPlace: string; part: string; foot: string; wholeScope: string;
} {
  const v = formVocabulary(form);
  return {
    orient: `Choose a ${v.unit} at left, or select exact words in your ${v.noun}, and I’ll look at it with you.`,
    whole: `Talk about ${v.whole}`,
    notYet: `I haven’t read your ${v.noun} with you yet.`,
    railHeading: v.railHeading,
    onlyPlace: 'Your draft',
    part: cap(v.unit),
    foot: `Your ${v.noun} comes first. I follow where you put your attention.`,
    wholeScope: v.whole,
  };
}

/**
 * Put in front of Develop's reading instructions, which are written in book words ("this chapter", "the whole book"). For a book
 * nothing is added; for every other form MAIA is told the form and what those words mean here, so a poem is read as a poem.
 */
export function readingFrame(v: FormVocabulary): string {
  if (v.kind === 'book') return '';
  return `${v.maiaFrame}\nIn the instructions below, “chapter” means the ${v.unit} of the writer’s ${v.noun} that you read, and “the whole book” or “the book” means ${v.whole}. In everything you write back, say “${v.unit}” and “${v.noun}”, never “chapter” or “book”.\n`;
}
