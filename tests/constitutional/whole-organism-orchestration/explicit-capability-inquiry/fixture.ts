export type PilotCapabilityId =
  | 'journal.create'
  | 'journal.dream'
  | 'astrology.reading';

export interface PilotPresentation {
  readonly capabilityId: PilotCapabilityId;
  readonly name: string;
  readonly purpose: string;
}

export const PILOT_PRESENTATIONS: readonly PilotPresentation[] = [
  {
    capabilityId: 'journal.create',
    name: 'New Journal Entry',
    purpose: 'Begin a new Journal entry for something you want to write down.',
  },
  {
    capabilityId: 'journal.dream',
    name: 'Record a Dream',
    purpose: 'Preserve a dream you choose to record in your Journal.',
  },
  {
    capabilityId: 'astrology.reading',
    name: 'Astrology Reading',
    purpose: 'Explore your birth chart as a symbolic map for reflection, not as a verdict about who you are.',
  },
] as const;

export const KNOWN_NON_PILOT_APPROVED_NAMES = [
  'Save to Journal',
  'Current Transits',
  'Personal Transits',
  'Wisdom Inquiry',
  'Wisdom Sources',
  'Relationship Reflection',
  'Choose a Studio',
  "Writer's Studio",
  'Create Session',
] as const;
export const ACCEPTED_QUERIES = [
  {
    input: 'What is New Journal Entry?',
    capabilityId: 'journal.create',
    envelope: 'WHAT_IS',
  },
  {
    input: 'what is   new JOURNAL entry.',
    capabilityId: 'journal.create',
    envelope: 'WHAT_IS',
  },
  {
    input: 'What does New Journal Entry mean?',
    capabilityId: 'journal.create',
    envelope: 'WHAT_DOES_MEAN',
  },
  {
    input: 'What is Record a Dream?',
    capabilityId: 'journal.dream',
    envelope: 'WHAT_IS',
  },
  {
    input: 'What does Record a Dream mean?',
    capabilityId: 'journal.dream',
    envelope: 'WHAT_DOES_MEAN',
  },
  {
    input: 'What is Astrology Reading?',
    capabilityId: 'astrology.reading',
    envelope: 'WHAT_IS',
  },
  {
    input: ' WHAT DOES ASTROLOGY READING MEAN? ',
    capabilityId: 'astrology.reading',
    envelope: 'WHAT_DOES_MEAN',
  },
] as const;
export const REFUSAL_QUERIES = [
  { input: 'What is Save to Journal?', reason: 'NON_PILOT_CAPABILITY' },
  { input: 'What is Wisdom Inquiry?', reason: 'NON_PILOT_CAPABILITY' },
  { input: "What is Writer’s Studio?", reason: 'NON_PILOT_CAPABILITY' },

  { input: 'I had a dream.', reason: 'NOT_DEFINITIONAL' },
  { input: 'I want to write something down.', reason: 'NOT_DEFINITIONAL' },
  { input: "I've been thinking about my birth chart.", reason: 'NOT_DEFINITIONAL' },

  { input: 'Record my dream.', reason: 'ACTION_SHAPED' },
  { input: 'Start a journal entry.', reason: 'ACTION_SHAPED' },
  { input: 'Give me an astrology reading.', reason: 'ACTION_SHAPED' },
  { input: 'Open New Journal Entry.', reason: 'ACTION_SHAPED' },

  { input: 'Can I use Astrology Reading?', reason: 'AVAILABILITY_SHAPED' },
  { input: 'Do I have Astrology Reading?', reason: 'AVAILABILITY_SHAPED' },
  { input: 'Is Record a Dream available to me?', reason: 'AVAILABILITY_SHAPED' },

  { input: 'Where is New Journal Entry?', reason: 'NAVIGATION_SHAPED' },
  { input: 'How do I get to Astrology Reading?', reason: 'NAVIGATION_SHAPED' },

  { input: 'What is journal entry?', reason: 'NO_EXACT_NAME_MATCH' },
  { input: 'What is dream recording?', reason: 'NO_EXACT_NAME_MATCH' },

  { input: "What's the journal thing?", reason: 'AMBIGUOUS' },
  { input: 'Tell me about transits.', reason: 'AMBIGUOUS' },
  { input: 'What can astrology do?', reason: 'AMBIGUOUS' },
] as const;
