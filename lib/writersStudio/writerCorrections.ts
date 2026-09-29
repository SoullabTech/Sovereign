export const WRITER_CORRECTION_KINDS = [
  'fact',
  'intent',
  'interpretation_rejection',
  'intentional_ambiguity',
  'developmental_revision',
  'preference',
] as const;

export type WriterCorrectionKind = typeof WRITER_CORRECTION_KINDS[number];

export const WRITER_CORRECTION_LABEL: Record<WriterCorrectionKind, string> = {
  fact: 'A factual correction',
  intent: 'That is not what I mean',
  interpretation_rejection: 'I reject that interpretation',
  intentional_ambiguity: 'The ambiguity is intentional',
  developmental_revision: 'I see this differently now',
  preference: 'A preference for how we work',
};

export interface WriterCorrection {
  id: string;
  workId: string;
  threadId: string;
  maiaTurnIndex: number;
  kind: WriterCorrectionKind;
  priorClaim: string;
  correction: string;
  createdAt: string;
}

export function isWriterCorrectionKind(value: unknown): value is WriterCorrectionKind {
  return typeof value === 'string'
    && (WRITER_CORRECTION_KINDS as readonly string[]).includes(value);
}

export function writerCorrectionContext(corrections: readonly WriterCorrection[]): string {
  if (corrections.length === 0) return '';
  const lines = [
    'WRITER CORRECTIONS — current working understanding, authored by the writer.',
    'These corrections supersede MAIA’s prior interpretation for this Work without rewriting the historical turn.',
    'Treat them as authoritative about the writer’s intention or declared meaning, not as automatic manuscript facts or editing permission.',
  ];
  for (const c of corrections) {
    lines.push(
      '',
      `[${WRITER_CORRECTION_LABEL[c.kind]}]`,
      `MAIA previously said: ${c.priorClaim}`,
      `Writer correction / current working understanding: ${c.correction}`,
    );
  }
  lines.push('', 'If a later question conflicts with one of these corrections, ask rather than silently restoring the older interpretation.');
  return lines.join('\n');
}
