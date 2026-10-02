export const WRITER_UNDERSTANDING_FIELDS = [
  'becoming',
  'preserve',
  'readerRelationship',
  'centralIdeas',
  'voiceCadence',
  'intentionalAmbiguity',
  'challengeMeOn',
  'nonNegotiables',
  'unresolvedIntentions',
] as const;

export type WriterUnderstandingField = typeof WRITER_UNDERSTANDING_FIELDS[number];

export interface WriterUnderstanding {
  workId: string;
  workPurpose: string | null;
  becoming: string | null;
  preserve: readonly string[];
  readerRelationship: string | null;
  centralIdeas: readonly string[];
  voiceCadence: string | null;
  intentionalAmbiguity: readonly string[];
  challengeMeOn: readonly string[];
  nonNegotiables: readonly string[];
  unresolvedIntentions: readonly string[];
  updatedAt: string | null;
}

export type WriterUnderstandingDraft = Omit<WriterUnderstanding, 'workId' | 'workPurpose' | 'updatedAt'>;

export const EMPTY_WRITER_UNDERSTANDING_DRAFT: WriterUnderstandingDraft = {
  becoming: null,
  preserve: [],
  readerRelationship: null,
  centralIdeas: [],
  voiceCadence: null,
  intentionalAmbiguity: [],
  challengeMeOn: [],
  nonNegotiables: [],
  unresolvedIntentions: [],
};

export function writerUnderstandingContext(value: WriterUnderstanding | null): string {
  if (!value) return '';
  const hasDeclared = Boolean(
    value.workPurpose?.trim()
    || value.becoming?.trim()
    || value.readerRelationship?.trim()
    || value.voiceCadence?.trim()
    || value.preserve.length
    || value.centralIdeas.length
    || value.intentionalAmbiguity.length
    || value.challengeMeOn.length
    || value.nonNegotiables.length
    || value.unresolvedIntentions.length
  );
  if (!hasDeclared) return '';
  const lines: string[] = [
    'AUTHOR-DECLARED WRITING CONTEXT — inspectable and correctable by the writer.',
    'Treat this as declared intention, not manuscript fact and not personality.',
  ];
  const add = (label: string, text: string | null) => { if (text?.trim()) lines.push(`${label}: ${text.trim()}`); };
  const list = (label: string, values: readonly string[]) => {
    const kept = values.map((x) => x.trim()).filter(Boolean);
    if (kept.length) lines.push(`${label}:\n- ${kept.join('\n- ')}`);
  };
  add('Work purpose', value.workPurpose);
  add('What this Work is trying to become', value.becoming);
  list('What I most want preserved', value.preserve);
  add('Intended reader relationship', value.readerRelationship);
  list('Central ideas and distinctions', value.centralIdeas);
  add('Characteristic voice and cadence', value.voiceCadence);
  list('Intentional ambiguity', value.intentionalAmbiguity);
  list('Challenge me on', value.challengeMeOn);
  list('Non-negotiables', value.nonNegotiables);
  list('Unresolved intentions', value.unresolvedIntentions);
  lines.push('Do not convert any of these declarations into automatic editing authority.');
  return lines.join('\n\n');
}
