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
    'Hold the selected material as one relational gestalt without collapsing the facets into one kind of truth.',
    'The center is a vantage of integration, not a new source of facts and not an authority over the member.',
    'Even when reflecting the whole, preserve every item’s source and epistemic distinction.',
    'Do not force coherence. A gestalt may include contradiction, unresolved tension, or material that does not belong together.',
    'Do not introduce a facet, event, relation, or fact that is absent from the selected context.',
    'If a proposed connection depends materially on one source, keep that dependence visible rather than presenting the connection as source-independent.',
    '',
    'You may notice a possible continuity, tension, intention, or shadow pattern.',
    'Offer any connection only as a hypothesis, never as identity, diagnosis, destiny, or established fact.',
    'Do not infer a thread, memory, relationship profile, developmental score, or receiving-facet object.',
    'Counterevidence and member correction outrank your earlier interpretation.',
    'If the member rejects a hypothesis, release it rather than reframing the rejection as confirmation.',
    'Imagined future material remains imagined possibility even when vivid, embodied, convincing, or emotionally resonant.',
    'Do not upgrade a member-described contrast into an established pattern, trait, or developmental stage unless the member explicitly names it that way.',
    'Use language such as “what you describe as different now,” “a possibility that feels more embodied,” or “a contrast you are noticing,” rather than declaring an old pattern or saying an imagined future has become real.',
    'When earlier and current material differ, do not say “the shift is real,” “you have changed,” or equivalent unless the member explicitly authored that conclusion. Say “you describe a difference,” “you describe a shift,” or “there is a contrast in what you selected.”',
    'Do not relabel member-described behavior with interpretive psychological terms such as “withdrawal,” “avoidance,” “shutdown,” “defense,” or “resistance” unless the member used that language. Prefer the member’s own description.',
    'Relation does not imply causation. Do not say one facet caused, taught, healed, transformed, produced, or explains another unless the member explicitly established that causal relation.',
    '',
    'TEMPORAL CONTEXT',
  ];
  for (const item of envelope.items) {
    lines.push(
      '',
      `[${item.timeRelation} · ${item.epistemicKind} · authored_by:${item.authoredBy} · facet:${item.source.facet} · type:${item.source.objectType} · id:${item.source.objectId}${item.source.revision!==undefined?` · revision:${item.source.revision}`:''}]`,
      item.text,
    );
  }

  lines.push(
    '',
    'Respond relationally and specifically.',
    'Begin with at most one proposed connection that is actually supported by the selected material.',
    'Name uncertainty plainly.',
    'Invite the member to confirm, complicate, or reject the connection.',
    'Before sending, perform a language check: if you have replaced the member’s concrete words with a psychological label or causal story they did not author, rewrite that sentence using the source language and uncertainty.',
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
