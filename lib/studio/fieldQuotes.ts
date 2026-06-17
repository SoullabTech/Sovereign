// Field quotes — offered for the home's "Quote of the day" cell.
//
// An OFFER, never an authority: the member chooses (for-your-weather / surprise /
// next). MAIA does not author meaning on the person's behalf — it sets a small stone
// on the path and the person decides whether to pick it up. Lines are either original
// (attribution null) or clearly public-domain (pre-1929), to stay copyright-clean.
//
// `moods` tags a quote to inner-weather words so "for your weather" can offer
// something attuned. 'any' fits every weather.

export type Mood = 'Grounded' | 'Restless' | 'Stretched' | 'Curious' | 'Tender' | 'Open' | 'any';

export interface FieldQuote {
  text: string;
  by: string | null;       // null = original line
  moods: Mood[];
}

export const FIELD_QUOTES: FieldQuote[] = [
  // — original, MAIA-voiced —
  { text: 'You do not have to know the whole path to take the next true step.', by: null, moods: ['Restless', 'Stretched'] },
  { text: 'Attention is the most honest form of care. Spend it where it matters.', by: null, moods: ['any'] },
  { text: 'Begin where you are, not where you think you should be.', by: null, moods: ['Grounded', 'Restless'] },
  { text: 'What you tend grows. Choose what to tend on purpose.', by: null, moods: ['Tender', 'Grounded'] },
  { text: 'Not everything urgent is important. Let the field tell you which is which.', by: null, moods: ['Stretched', 'Restless'] },
  { text: 'Stay curious a moment longer than is comfortable.', by: null, moods: ['Curious', 'Open'] },
  { text: 'Rest is not the absence of work. It is part of the work.', by: null, moods: ['Tender', 'Stretched'] },
  { text: 'You are allowed to change your mind. That is what a mind is for.', by: null, moods: ['Open', 'Curious'] },
  { text: 'Name the thing. Half of its weight is that it was never named.', by: null, moods: ['Stretched', 'Tender'] },
  { text: 'The small kept promise is worth more than the large imagined one.', by: null, moods: ['Grounded'] },
  { text: 'Let today be enough. Tomorrow will ask for itself.', by: null, moods: ['Restless', 'Tender'] },
  { text: 'Wonder is a skill. It survives being practiced.', by: null, moods: ['Curious', 'Open'] },
  { text: 'You can hold something lightly and still hold it fully.', by: null, moods: ['Open', 'Tender'] },
  { text: 'The field does not need you to be finished. It needs you to be here.', by: null, moods: ['Grounded', 'Open'] },

  // — public-domain (pre-1929) —
  { text: 'Confine yourself to the present.', by: 'Marcus Aurelius', moods: ['Restless', 'Grounded'] },
  { text: 'Very little is needed to make a happy life.', by: 'Marcus Aurelius', moods: ['Grounded', 'Tender'] },
  { text: 'The journey of a thousand miles begins beneath one’s feet.', by: 'Lao Tzu', moods: ['Stretched', 'Open'] },
  { text: 'Nature does not hurry, yet everything is accomplished.', by: 'Lao Tzu', moods: ['Restless', 'Grounded'] },
  { text: 'No one steps in the same river twice.', by: 'Heraclitus', moods: ['Open', 'Curious'] },
  { text: 'What lies behind us and before us are tiny matters compared to what lies within us.', by: 'Emerson', moods: ['Stretched', 'Open'] },
  { text: 'Go confidently in the direction of your dreams.', by: 'Thoreau', moods: ['Open', 'Curious'] },
  { text: 'It is not the man who has too little, but the man who craves more, that is poor.', by: 'Seneca', moods: ['Grounded', 'Tender'] },
  { text: 'We suffer more often in imagination than in reality.', by: 'Seneca', moods: ['Restless', 'Tender'] },
  { text: 'Begin — to begin is half the work.', by: 'Ausonius', moods: ['Restless', 'Stretched'] },
];

/** A stable index for a given day string, so the day's quote holds until reshuffled. */
export function dailyIndex(daySeed: string, len: number): number {
  let h = 0;
  for (let i = 0; i < daySeed.length; i++) h = (h * 31 + daySeed.charCodeAt(i)) >>> 0;
  return len > 0 ? h % len : 0;
}
