/**
 * Provenance — server-minted, immutable record of what governed an object's
 * creation (Sanctuary S5).
 *
 * Constitution: docs/architecture/S5_PROVENANCE_CONSTITUTION_2026-07-18.md
 *
 * Every durable object must eventually answer:
 *   Who created me? What generated me? What posture governed me?
 *   May I persist? May I become collective? May I be restored?
 *   May I be forgotten?
 *
 * Three properties are constitutional, not stylistic:
 * - Immutability: provenance is written once, at creation, by the server.
 *   Correction means a new object with `derivation` lineage, never an edit.
 * - Server authority: a client can EXPRESS intent; only the server RESOLVES
 *   posture and mints provenance. Minting requires a real TurnPosture instance
 *   (nominal class, private constructor) — the S1 forgery barrier generalized.
 * - Fail-closed: a write path that cannot mint complete provenance may not
 *   produce a durable object. The DB-side mint gate
 *   (s5_require_minted_provenance, migration 20260718000001) enforces the same
 *   rule below this module, so no layer trusts a caller.
 */

import { TurnPosture } from '../sanctuary/turnPosture';

export type CreatedBy =
  | 'member'
  | 'maia'
  | 'practitioner'
  | 'system'
  | 'import'
  | 'migration';

export type GeneratedBy =
  | 'member-gesture'
  | 'member-utterance'
  | 'inference'
  | 'synthesis'
  | 'derivation'
  | 'practitioner-observation'  // honest extension: practitioner-authored, not machine inference
  | 'unattributed-historical';  // historical only; never minted anew

export type PostureAtCreation = 'normal' | 'sanctuary' | 'unknown-historical';

export type ProvenanceSource =
  | { type: 'turn'; turnId: string; sessionId: string | null }
  | { type: 'member_gesture'; gestureId: string }
  | { type: 'member_import'; provenanceId: string }
  | { type: 'derivation'; parentIds: string[] }
  | { type: 'migration'; migrationId: string }
  | { type: 'unattributed'; reason: string }; // historical only; never minted anew

export interface PersistencePolicy {
  durable: boolean;
  /** Collective eligibility is a Stage-2 member act only; default false. */
  collectiveEligible: boolean;
  /** false ⇒ tombstoned on deletion (may never be restored). */
  restorable: boolean;
}

export interface ProvenanceFields {
  createdBy: CreatedBy;
  generatedBy: Exclude<GeneratedBy, 'unattributed-historical'>;
  sourceContainer: string; // 'personal' | 'practice-field:<id>' | 'co-lab:<id>' | …
  source: Exclude<ProvenanceSource, { type: 'unattributed' }>;
  persistencePolicy?: Partial<PersistencePolicy>;
}

/**
 * Nominal, frozen, server-minted provenance. The private constructor means a
 * caller cannot forge one from a plain object; a JS caller bypassing types
 * fails the `instanceof` check in `provenanceJson()` (fail closed).
 */
export class Provenance {
  readonly createdBy: CreatedBy;
  readonly generatedBy: GeneratedBy;
  readonly postureAtCreation: PostureAtCreation;
  readonly sourceContainer: string;
  readonly source: ProvenanceSource;
  readonly persistencePolicy: PersistencePolicy;
  readonly mintedAtIso: string;

  private constructor(posture: TurnPosture, fields: ProvenanceFields) {
    this.createdBy = fields.createdBy;
    this.generatedBy = fields.generatedBy;
    this.postureAtCreation = posture.sanctuary ? 'sanctuary' : 'normal';
    this.sourceContainer = fields.sourceContainer;
    this.source = fields.source;
    this.persistencePolicy = Object.freeze({
      durable: fields.persistencePolicy?.durable ?? true,
      collectiveEligible: fields.persistencePolicy?.collectiveEligible ?? false,
      restorable: fields.persistencePolicy?.restorable ?? true,
    });
    this.mintedAtIso = new Date().toISOString();
    Object.freeze(this);
  }

  /**
   * Mint provenance for a durable write. Returns null — REFUSING the mint —
   * when the posture is missing/forged (fail closed) or is sanctuary: a
   * sanctuary turn may not produce a durable object at all, so there is
   * nothing truthful to mint. Refusal logs are metadata-only.
   */
  static mint(
    posture: TurnPosture,
    fields: ProvenanceFields,
    store?: string
  ): Provenance | null {
    if (!(posture instanceof TurnPosture)) {
      console.error('[PROVENANCE] mint failed — posture missing or unresolved (fail closed)', {
        store: store ?? null,
      });
      return null;
    }
    if (posture.sanctuary) {
      console.log('[PROVENANCE] mint refused — sanctuary posture yields no durable object', {
        store: store ?? null,
      });
      return null;
    }
    return new Provenance(posture, fields);
  }

  /** JSON shape for the `provenance` jsonb column (constitutional key set). */
  toJson(): Record<string, unknown> {
    return {
      createdBy: this.createdBy,
      generatedBy: this.generatedBy,
      postureAtCreation: this.postureAtCreation,
      sourceContainer: this.sourceContainer,
      source: this.source,
      persistencePolicy: this.persistencePolicy,
      mintedAt: this.mintedAtIso,
    };
  }
}

/**
 * Store-boundary guard: returns the serialized provenance only for a genuine
 * minted instance; anything else refuses (fail closed, metadata-only log).
 */
export function provenanceJson(
  provenance: Provenance,
  store: string
): Record<string, unknown> | null {
  if (!(provenance instanceof Provenance)) {
    console.error('[PROVENANCE] write refused — provenance missing or forged (fail closed)', {
      store,
    });
    return null;
  }
  return provenance.toJson();
}
