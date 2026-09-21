import {
  STRICT_COMPOSITION, type CompositionDecisions,
} from "../../../scripts/migration-compatibility-gate-core";

export type Candidate = {
  id: string; name: string; kills: string;
  collateral?: { id: string; reason: string }[];
  decisions: CompositionDecisions;
};
const with_ = (o: Partial<CompositionDecisions>): CompositionDecisions =>
  ({ ...STRICT_COMPOSITION, ...o });

export const CANDIDATES: Candidate[] = [
  { id: "GC-DC1", name: "stale is not refused, so stale is fine", kills: "GC-F1",
    collateral: [{ id: "GC-F3",
      reason: "reviewApplicable is one predicate serving both records; a candidate that accepts staleness cannot accept it on only one side without ceasing to model the error." }],
    decisions: with_({ reviewApplicable: r => r.applicability !== "refused" }) },

  { id: "GC-DC2", name: "compatibility review is a nice-to-have", kills: "GC-F2",
    decisions: with_({ requireCompatibilityReview: false }) },

  { id: "GC-DC3", name: "compatibility custody is advisory, migration custody is binding", kills: "GC-F3",
    decisions: with_({ reviewApplicable: r => r.role === "compatibility" || r.applicability === "applies" }) },

  { id: "GC-DC4", name: "an approved migration review settles it", kills: "GC-F4",
    decisions: with_({ compatibilityApplies: () => true }) },

  { id: "GC-DC5", name: "the migration record's target binding is informational", kills: "GC-F5",
    decisions: with_({ targetMatches: (b, t, role) => role === "migration" || b === t }) },

  { id: "GC-DC6", name: "the compatibility record's target binding is informational", kills: "GC-F6",
    decisions: with_({ targetMatches: (b, t, role) => role === "compatibility" || b === t }) },

  { id: "GC-DC7", name: "distinct review bytes are enough; one trace may carry both acts", kills: "GC-F7",
    decisions: with_({ distinctAdmissions: (m, c) => m.reviewSha256 !== c.reviewSha256 }) },

  { id: "GC-DC8", name: "distinct traces are enough; one review may be admitted twice", kills: "GC-F8",
    decisions: with_({ distinctAdmissions: (m, c) => m.traceId !== c.traceId }) },

  { id: "GC-DC9", name: "independence means two different humans", kills: "GC-F9",
    decisions: with_({ distinctAdmissions: (m, c) =>
      m.reviewSha256 !== c.reviewSha256 && m.traceId !== c.traceId && m.reviewer !== c.reviewer }) },

  { id: "GC-DC10", name: "source is source, whichever tree it came from", kills: "GC-F10",
    decisions: with_({ evidenceTreeAdmissible: () => true }) },

  { id: "GC-DC11", name: "a Read is a Read, whoever's trace carried it", kills: "GC-F11",
    decisions: with_({ witnessSourceAdmissible: () => true }) },

  { id: "GC-DC12", name: "an empty pending set is trivially safe", kills: "GC-F12",
    decisions: with_({ requireNonEmptyPending: false }) },
];
