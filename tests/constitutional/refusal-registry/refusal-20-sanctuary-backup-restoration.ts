import type { RefusalCheck } from './harness';

/**
 * Refusal 20 — Sanctuary content may never survive through backup restoration.
 *
 * Ruled by Kelly 2026-07-17 (incident SANC-20260614-01 closure). The failure
 * it forbids:
 *
 *   delete from live DB → restore a backup → Sanctuary content returns
 *
 * which would re-violate the same promise the deletion honored.
 *
 * STATUS: PROPOSED — not yet structurally enforceable. Enforcement requires
 * S5-phase machinery: deletion manifests / tombstones, restore filtering, or
 * protected backup classes (see SANCTUARY_REPAIR_SEQUENCE_AND_ENFORCEMENT_
 * DESIGN_2026-07-17.md). Until that exists, this check documents the standing
 * refusal, verifies the interim operational posture (a deletion manifest
 * exists for the known incident), and WARNS — it cannot yet prove restores
 * are filtered.
 */

export const check: RefusalCheck = {
  id: 'R20',
  refusal: 'Sanctuary content may never survive through backup restoration',
  grade: 'Proposed',
  enforcedBy: 'NOT YET ENFORCED — S5 deliverable (deletion manifests + restore filtering)',
  evidence: 'Ruled 2026-07-17; incident deletion manifest: docs/incidents/INCIDENT_2026-06-14_SANCTUARY_PERSISTENCE.md',
  violationAttempted: 'verify a deletion manifest exists for the known incident; restore-filtering machinery cannot yet be tested',
  passingAuthorizes: 'nothing beyond: the refusal is recorded and the known incident has a manifest a future restore-filter can consume',
  passingDoesNotAuthorize: 'that any restore path actually filters Sanctuary content today — it does not; a raw pg_restore of a contaminated dump would reintroduce deleted content',
  hostileForkMustChange: 'delete this check or the incident manifest — visible diff (real enforcement lands in S5)',

  run(io) {
    const manifest = io.exists('docs/incidents/INCIDENT_2026-06-14_SANCTUARY_PERSISTENCE.md');
    if (manifest) {
      io.pass('Deletion manifest exists for SANC-20260614-01 (restore-filter input)');
    } else {
      io.note('Incident manifest lives on the working branch, not yet on this ref');
    }
    io.warn(
      'Restore filtering NOT yet implemented — refusal is PROPOSED, not enforced',
      'S5: deletion manifests/tombstones + restore filtering + protected backup classes'
    );
  },
};
