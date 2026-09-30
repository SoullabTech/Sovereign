export type WriterStudioGateId =
  | 'G0' | 'G1' | 'G2' | 'G3' | 'G4' | 'G5'
  | 'G6' | 'G7' | 'G8' | 'G9' | 'G10';

export type StewardshipStatus = 'grey' | 'green' | 'amber' | 'red';

export const WRITER_STUDIO_RELEASE_GATES: ReadonlyArray<{
  id: WriterStudioGateId;
  title: string;
  question: string;
  stopOnFail: boolean;
}> = [
  { id: 'G0', title: 'Identity', question: 'Are admission, test and deploy bound to the same exact candidate?', stopOnFail: true },
  { id: 'G1', title: 'Integrity', question: 'Do build, typecheck and required tests pass?', stopOnFail: true },
  { id: 'G2', title: 'Data', question: 'Are schema requirements known, applied and reversible?', stopOnFail: true },
  { id: 'G3', title: 'Authorship', question: 'Can writer text change only through explicit writer authority?', stopOnFail: true },
  { id: 'G4', title: 'Continuity', question: 'Do Work, place and context survive supported transitions?', stopOnFail: true },
  { id: 'G5', title: 'Evidence', question: 'Are MAIA claims grounded at the right epistemic level?', stopOnFail: true },
  { id: 'G6', title: 'Recovery', question: 'Can failures recover without loss or false success?', stopOnFail: true },
  { id: 'G7', title: 'Experience', question: 'Can a writer complete the promised journey without developer help?', stopOnFail: true },
  { id: 'G8', title: 'Observability', question: 'Will structural failures be visible without reading writer content?', stopOnFail: true },
  { id: 'G9', title: 'Production', question: 'Is the exact tested artifact the artifact actually running?', stopOnFail: true },
  { id: 'G10', title: 'Return', question: 'Is rollback defined and sufficiently witnessed?', stopOnFail: true },
] as const;

export const WRITER_STUDIO_METRICS = [
  { id: 'meaningful_continuation_rate', label: 'Meaningful Continuation', format: 'percent', hardRed: false },
  { id: 'lost_writing_incidents', label: 'Lost Writing', format: 'count', hardRed: true },
  { id: 'silent_mutation_incidents', label: 'Silent Mutation', format: 'count', hardRed: true },
  { id: 'return_fidelity', label: 'Return Fidelity', format: 'percent', hardRed: false },
  { id: 'selection_action_reliability', label: 'Passage Action Reliability', format: 'percent', hardRed: false },
  { id: 'undo_reliability', label: 'Undo Reliability', format: 'percent', hardRed: false },
  { id: 'evidence_traceability', label: 'Evidence Traceability', format: 'percent', hardRed: false },
  { id: 'dead_end_count', label: 'Dead Ends', format: 'count', hardRed: false },
] as const;

export const FOUNDER_WITNESS_STEPS = [
  'Open the exact production URL and confirm runtime SHA.',
  'Enter the intended Work from Writer’s Studio Home.',
  'Write new prose and witness save state without developer tools.',
  'Select one passage and open the contextual passage action.',
  'Discuss the passage with MAIA without changing manuscript text.',
  'Request a revision; compare proposal against the original.',
  'Read the proposal in context, then Apply explicitly.',
  'Undo and verify the original passage returns exactly.',
  'Move Write → Develop → evidence → Write and verify identity/place continuity.',
  'Leave the Studio, return through the ordinary member door, and verify meaningful return.',
  'Trigger one bounded recoverable failure or stale-address case and verify honest recovery.',
  'Record PASS / FRICTION / FAIL plus the first falsifier encountered.',
] as const;
