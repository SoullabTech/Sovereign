/** R2-0 — fifteen founder-named defeat candidates. Each is a WRONG contract module: it re-exports the reference and
 *  replaces exactly the declaration that embodies its error. ⛔ Disposable. ⛔ Never a seed. */
export interface CandidateSpec { readonly name: string; readonly file: string }
export const DEFEAT_CANDIDATES: readonly CandidateSpec[] = [
  { name: 'R2-0-D1-posture-omitted', file: 'd01-posture-optional.ts' },
  { name: 'R2-0-D2-as-read-current-substitution', file: 'd02-as-read-accepts-current.ts' },
  { name: 'R2-0-D3-as-read-sneaks-current', file: 'd03-as-read-optional-now.ts' },
  { name: 'R2-0-D4-then-now-missing-then', file: 'd04-then-optional.ts' },
  { name: 'R2-0-D5-then-now-missing-now', file: 'd05-now-optional.ts' },
  { name: 'R2-0-D6-then-now-collapsed', file: 'd06-collapsed-text.ts' },
  { name: 'R2-0-D7-current-text-as-review', file: 'd07-current-text-admitted.ts' },
  { name: 'R2-0-D8-observation-id-thread-key', file: 'd08-observation-id-key.ts' },
  { name: 'R2-0-D9-thread-repoints', file: 'd09-repointable-thread.ts' },
  { name: 'R2-0-D10-finding-as-member-work', file: 'd10-finding-member-work.ts' },
  { name: 'R2-0-D11-member-text-as-system-provenance', file: 'd11-member-text-provenance.ts' },
  { name: 'R2-0-D12-mixed-input-hidden', file: 'd12-hidden-input.ts' },
  { name: 'R2-0-D13-c1c1-conflation', file: 'd13-c1c1-conflated.ts' },
  { name: 'R2-0-D14-discussion-mutates-reading', file: 'd14-conversation-mutates.ts' },
  { name: 'R2-0-D15-silent-reread', file: 'd15-location-escalates.ts' },
];
export const NAMED_KILL: Readonly<Record<string, string>> = {
  'R2-0-D1-posture-omitted': 'R2-0-L1-posture-required',
  'R2-0-D2-as-read-current-substitution': 'R2-0-L2-as-read-forbids-current-substitution',
  'R2-0-D3-as-read-sneaks-current': 'R2-0-L3-as-read-forbids-now',
  'R2-0-D4-then-now-missing-then': 'R2-0-L4-then-now-requires-then',
  'R2-0-D5-then-now-missing-now': 'R2-0-L5-then-now-requires-now',
  'R2-0-D6-then-now-collapsed': 'R2-0-L6-then-and-now-are-distinct-roles',
  'R2-0-D7-current-text-as-review': 'R2-0-L7-current-text-only-is-not-review-discuss',
  'R2-0-D8-observation-id-thread-key': 'R2-0-L8-thread-key-is-reading-local',
  'R2-0-D9-thread-repoints': 'R2-0-L9-thread-never-repoints',
  'R2-0-D10-finding-as-member-work': 'R2-0-L10-finding-is-durable-reading-output',
  'R2-0-D11-member-text-as-system-provenance': 'R2-0-L11-member-text-is-member-work-text',
  'R2-0-D12-mixed-input-hidden': 'R2-0-L12-crossing-declares-every-class',
  'R2-0-D13-c1c1-conflation': 'R2-0-L13-seams-not-conflated',
  'R2-0-D14-discussion-mutates-reading': 'R2-0-L14-conversation-has-no-durable-effect',
  'R2-0-D15-silent-reread': 'R2-0-L15-location-never-escalates-posture',
};
/** Irreducible collateral: removing it would require the candidate to stop embodying its error. Filled after the first lethal run. */
export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {};
