/**
 * R2-1 — nineteen Founder-named defeat candidates.
 *
 * Each file is a deliberately WRONG mutation of the future reference
 * contract. At suite-first RED they cannot load because contract.ts
 * deliberately does not exist yet.
 */
export interface CandidateSpec {
  readonly name: string;
  readonly file: string;
}

export const DEFEAT_CANDIDATES:
readonly CandidateSpec[] = [
  { name: 'R2-1-D1-finding-ungated', file: 'd01-finding-ungated.ts' },
  { name: 'R2-1-D2-false-empty-crossing', file: 'd02-false-empty-crossing.ts' },
  { name: 'R2-1-D3-finding-as-work', file: 'd03-finding-as-work.ts' },
  { name: 'R2-1-D4-ask-act-as-r2-authority', file: 'd04-ask-act-authority.ts' },
  { name: 'R2-1-D5-history-replay', file: 'd05-history-replay.ts' },
  { name: 'R2-1-D6-thread-implies-continuation', file: 'd06-continuation.ts' },
  { name: 'R2-1-D7-nonpersisted-success', file: 'd07-nonpersistent.ts' },
  { name: 'R2-1-D8-posture-omitted', file: 'd08-posture-omitted.ts' },
  { name: 'R2-1-D9-then-vs-now-executes', file: 'd09-then-vs-now.ts' },
  { name: 'R2-1-D10-current-text-only-r2', file: 'd10-current-text-only.ts' },
  { name: 'R2-1-D11-historical-evidence-absent', file: 'd11-no-historical-evidence.ts' },
  { name: 'R2-1-D12-current-prose-in-as-read', file: 'd12-current-prose.ts' },
  { name: 'R2-1-D13-response-provenance-incomplete', file: 'd13-incomplete-provenance.ts' },
  { name: 'R2-1-D14-model-self-provenance', file: 'd14-model-provenance.ts' },
  { name: 'R2-1-D15-standing-constant-hash', file: 'd15-standing-hash.ts' },
  { name: 'R2-1-D16-thread-repoint', file: 'd16-thread-repoint.ts' },
  { name: 'R2-1-D17-conversational-mutation', file: 'd17-conversation-mutates.ts' },
  { name: 'R2-1-D18-sanctuary-persists-first', file: 'd18-sanctuary-persists.ts' },
  { name: 'R2-1-D19-structured-inference-bypass', file: 'd19-inference-bypass.ts' },
];

export const NAMED_KILL:
Readonly<Record<string, string>> = {
  'R2-1-D1-finding-ungated':
    'R2-1-L1-finding-is-authorized-input',

  'R2-1-D2-false-empty-crossing':
    'R2-1-L2-crossing-cannot-be-falsely-empty',

  'R2-1-D3-finding-as-work':
    'R2-1-L3-finding-is-durable-reading-output',

  'R2-1-D4-ask-act-as-r2-authority':
    'R2-1-L4-ask-act-is-not-r2-authority',

  'R2-1-D5-history-replay':
    'R2-1-L5-history-is-none',

  'R2-1-D6-thread-implies-continuation':
    'R2-1-L6-persistence-does-not-authorize-continuation',

  'R2-1-D7-nonpersisted-success':
    'R2-1-L7-success-has-durable-single-act-custody',

  'R2-1-D8-posture-omitted':
    'R2-1-L8-posture-is-explicit-as-read',

  'R2-1-D9-then-vs-now-executes':
    'R2-1-L9-then-vs-now-is-not-executable',

  'R2-1-D10-current-text-only-r2':
    'R2-1-L10-current-text-only-is-not-review-discuss',

  'R2-1-D11-historical-evidence-absent':
    'R2-1-L11-historical-evidence-is-required',

  'R2-1-D12-current-prose-in-as-read':
    'R2-1-L12-as-read-cannot-contain-current-prose',

  'R2-1-D13-response-provenance-incomplete':
    'R2-1-L13-response-provenance-is-complete',

  'R2-1-D14-model-self-provenance':
    'R2-1-L14-provenance-is-server-authored',

  'R2-1-D15-standing-constant-hash':
    'R2-1-L15-fingerprint-covers-assembled-cognition-input',

  'R2-1-D16-thread-repoint':
    'R2-1-L16-thread-never-repoints',

  'R2-1-D17-conversational-mutation':
    'R2-1-L17-conversation-has-no-durable-effect',

  'R2-1-D18-sanctuary-persists-first':
    'R2-1-L18-sanctuary-refuses-before-persistence',

  'R2-1-D19-structured-inference-bypass':
    'R2-1-L19-structured-inference-boundary-only',
};

/**
 * Start empty. After the first lawful-contract kill run,
 * classify only collateral that is structurally irreducible.
 */
export const CLASSIFIED:
Readonly<Record<string, readonly string[]>> = {
  'R2-1-D11-historical-evidence-absent': [
    'R2-1-L13-response-provenance-is-complete',
  ],
};
