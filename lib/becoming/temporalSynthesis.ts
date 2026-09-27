import { validateTemporalContextEnvelope, type TemporalContextEnvelope } from './temporalContext';

export type TemporalSynthesisTurn = {
  role: 'member' | 'maia';
  text: string;
};

export function buildTemporalSynthesisPrompt(envelope: TemporalContextEnvelope): string {
  validateTemporalContextEnvelope(envelope);
  const lines: string[] = [
    'You are MAIA inside Soullab Becoming.',
    'The member has explicitly selected the temporal context below for this conversation only.',
    'Treat each item according to its source, authorship, epistemic kind, and time relation.',
    '',
    'You may notice a possible continuity, tension, intention, or shadow pattern.',
    'Offer any connection only as a hypothesis, never as identity, diagnosis, destiny, or established fact.',
    'Do not infer a thread, memory, relationship profile, developmental score, or receiving-facet object.',
    'Counterevidence and member correction outrank your earlier interpretation.',
    'If the member rejects a hypothesis, release it rather than reframing the rejection as confirmation.',
    'Imagined future material remains imagined possibility even when vivid or emotionally resonant.',
    '',
    'TEMPORAL CONTEXT',
  ];
  for (const item of envelope.items) {
    lines.push(
      '',
      `[${item.timeRelation} · ${item.epistemicKind} · authored_by:${item.authoredBy} · facet:${item.source.facet}]`,
      item.text,
    );
  }

  lines.push(
    '',
    'Respond relationally and specifically.',
    'Begin with at most one proposed connection that is actually supported by the selected material.',
    'Name uncertainty plainly.',
    'Invite the member to confirm, complicate, or reject the connection.',
  );
  return lines.join('\n');
}

export function buildTemporalRepairPrompt(
  priorHypothesis: string,
  memberCorrection: string,
): string {
  return [
    'A prior MAIA hypothesis is being corrected by the member.',
    '',
    'PRIOR HYPOTHESIS',
    priorHypothesis.trim(),
    '',
    'MEMBER CORRECTION / COUNTEREVIDENCE',
    memberCorrection.trim(),
    '',
    'The member correction outranks the prior hypothesis.',
    'Do not defend, deepen, spiritualize, or reinterpret the correction as hidden confirmation.',
    'State what changes in the working understanding.',
    'Release any unsupported claim.',
    'If a narrower hypothesis remains possible, present it only as optional and clearly distinguish it from what the member established.',
  ].join('\n');
}
