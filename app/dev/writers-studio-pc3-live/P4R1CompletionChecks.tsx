'use client';

function ReviewCheck({
  eyebrow,
  title,
  description,
  boundary,
  action,
  onDiscuss,
}: {
  eyebrow: string;
  title: string;
  description: string;
  boundary: string;
  action: string;
  onDiscuss: (draft: string) => void;
}) {
  return (
    <section className="fr-card p4r1-review-check" data-review-check={eyebrow.toLowerCase().replaceAll(' ', '-')}>
      <span className="p4r1-eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      <p>{description}</p>
      <p className="p4r1-review-reread-boundary">{boundary}</p>
      <button type="button" onClick={() => onDiscuss(action)}>
        Check this Work with MAIA
      </button>
    </section>
  );
}

export function P4R1CompletenessView({
  onDiscuss,
}: {
  onDiscuss: (draft: string) => void;
}) {
  return (
    <ReviewCheck
      eyebrow="Completeness"
      title="What may be missing?"
      description="Look for promises, repeated structures, counterpart sections, lists, appendices, and back matter that do not quite close."
      boundary="This is an evidence check, not a demand for symmetry. A missing counterpart is a possibility until the Work itself establishes the pattern."
      action={[
        'Review this current Work for completeness and structural symmetry.',
        'Use only manuscript and Work context you actually have.',
        'Look for explicit promises that are not fulfilled, repeated structural sets with a possible missing counterpart, headings or lists that imply a member is absent, and front/back matter that does not agree with the body.',
        'For every possible omission, show the exact evidence and location. Distinguish strong structural evidence from a weak aesthetic preference.',
        'Do not invent author intention, do not add missing prose, and do not edit anything.',
        'Start with the highest-value possible omission, if any. If nothing is evidenced, say so plainly.',
      ].join('\n')}
      onDiscuss={onDiscuss}
    />
  );
}

export function P4R1SourceAuditView({
  onDiscuss,
}: {
  onDiscuss: (draft: string) => void;
}) {
  return (
    <ReviewCheck
      eyebrow="Sources & quotations"
      title="What still needs verification?"
      description="Review retained quotations, paraphrases, source-derived claims, translations, adaptations, and attribution language without confusing a bibliography lead with verification."
      boundary="A source lead is not proof. Uncertainty stays visible, and permissions/rights remain separate from provenance."
      action={[
        'Review this current Work for quotation and source provenance.',
        'Use only manuscript, source, and lineage context you actually have.',
        'Identify retained quotations, paraphrases, adaptations, translated wording, uncertain attributions, and source-derived claims that still need verification.',
        'For each item, give the exact manuscript locus and classify only what the evidence supports: verified enough to retain, translation/edition dependent, adaptation/paraphrase, unresolved attribution, or needs source review.',
        'Do not invent sources, editions, page numbers, permissions, or certainty. A bibliography entry is a lead, not proof.',
        'Do not edit the manuscript. Bring me the highest-risk unresolved item first.',
      ].join('\n')}
      onDiscuss={onDiscuss}
    />
  );
}
