import type { RefusalCheck } from './harness';

/**
 * Refusal 22 — No durable object may be written without knowing what governed
 * its creation (S5 provenance constitution, sentence 2).
 *
 * Charter: SANCTUARY_REPAIR_SEQUENCE_AND_ENFORCEMENT_DESIGN_2026-07-17.md Part 4
 * Constitution: S5_PROVENANCE_CONSTITUTION_2026-07-18.md
 *
 * The enforcement is layered so no layer trusts a caller:
 *   - lib/provenance/provenance.ts: nominal Provenance class, private
 *     constructor, minted only from a genuine TurnPosture (fail closed;
 *     sanctuary posture yields no durable object at all).
 *   - TurnsStore mints provenance server-side at the store and writes
 *     posture_at_creation + provenance on every turn row.
 *   - DB mint gates (migration 20260718000001): s5_require_minted_provenance
 *     refuses ANY conversation_turns INSERT lacking posture 'normal' + all six
 *     constitutional provenance keys; s5_require_atom_attestation does the
 *     same for member_memory_atoms — even raw SQL cannot write an unattested
 *     row.
 *   - Historical objects are 'unknown-historical' EXPLICITLY (truthful), and
 *     that state can never be minted anew; unknown-historical atoms can never
 *     become newly collective-eligible (s5_refuse_unknown_collective).
 *
 * Behavioral demonstration: tests/constitutional/sanctuary-s5-behavioral-proof.ts
 * (PROOF A mint gate, PROOF D atom attestation).
 */

const MIGRATION = 'database/migrations/20260718000001_s5_provenance_substrate.sql';

export const check: RefusalCheck = {
  id: 'R22',
  refusal: 'No durable object may be written without knowing what governed its creation',
  grade: 'A-minus',
  enforcedBy: `${MIGRATION} (DB mint gates) + lib/provenance/provenance.ts + lib/memory/stores/TurnsStore.ts`,
  evidence: 'S5 substrate 2026-07-18; behavioral proof PROOF A/D; constitution sentences recorded verbatim in migration header',
  violationAttempted: 'find a turn/atom write path that skips the mint: raw INSERT sites outside the store, missing DB trigger, forgeable provenance, unknown-historical minted anew',
  passingAuthorizes: 'that turns and atoms are structurally unattestable-proof: the DB refuses provenance-less writes regardless of caller; posture is per-turn and server-resolved',
  passingDoesNotAuthorize: 'that every lane is fully wired — episodic/theme/corpus lanes carry posture columns but their mint gates arm lane-by-lane as writers are wired (NULL = post-S5 unwired writer, truthfully distinct from unknown-historical)',
  hostileForkMustChange: 'remove a DB mint-gate trigger, add a raw INSERT bypassing the store, or re-add a silent-normal default — all visible diffs',

  run(io) {
    const migration = io.read(MIGRATION);

    if (migration.includes('s5_require_minted_provenance')
      && migration.includes("NEW.provenance ? 'persistencePolicy'")) {
      io.pass('DB mint gate on conversation_turns requires posture normal + all six provenance keys');
    } else {
      io.fail('conversation_turns mint gate missing or incomplete');
    }

    if (migration.includes('s5_require_atom_attestation')
      && migration.includes('s5_refuse_unknown_collective')) {
      io.pass('Atom attestation gate + unknown-never-collective gate armed on member_memory_atoms');
    } else {
      io.fail('member_memory_atoms gates missing');
    }

    if (migration.includes("DEFAULT 'unknown-historical'")
      && /ALTER\s+COLUMN\s+posture_at_creation\s+DROP\s+DEFAULT/.test(migration)) {
      io.pass('Historical corpus marked unknown-historical explicitly; default dropped so the state can never be minted silently');
    } else {
      io.fail('Historical backfill or default-drop missing — unknown-historical could be minted silently');
    }

    const store = io.read('lib/memory/stores/TurnsStore.ts');
    if (store.includes('Provenance.mint') && store.includes('posture_at_creation, provenance')) {
      io.pass('TurnsStore mints provenance server-side and writes it on every turn row');
    } else {
      io.fail('TurnsStore does not mint/write provenance');
    }

    // No raw conversation_turns INSERT outside the store (runtime code).
    const rawInserts = io
      .grep('INSERT INTO conversation_turns', ['lib', 'app'])
      .filter((l) => !l.includes('lib/memory/stores/TurnsStore.ts'));
    if (rawInserts.length === 0) {
      io.pass('No runtime conversation_turns INSERT outside TurnsStore (the pre-S5 raw lane in app/api/conversation/turns is closed)');
    } else {
      io.fail('Raw conversation_turns INSERT outside the store', rawInserts.join(' | '));
    }

    const prov = io.read('lib/provenance/provenance.ts');
    if (prov.includes('private constructor') && prov.includes('instanceof TurnPosture')
      && prov.includes('posture.sanctuary')) {
      io.pass('Provenance is nominal (private ctor), minted only from a genuine TurnPosture, and refuses sanctuary mints');
    } else {
      io.fail('Provenance class forgeable or does not fail closed');
    }
  },
};
