/**
 * indexAtomAffinities
 *
 * Fire-and-forget: indexes a single atom into living_field_affinities.
 * Never throws. Never blocks the caller.
 *
 * Constitutional constraints enforced here:
 * - protected / archived status → skip
 * - sacred_protected register (primary or array) → skip
 */

import { query } from '@/lib/db/postgres'
import { mapAtomToFields } from './affinityMapper'

interface AtomRow {
  id: string
  member_id: string
  primary_register: string | null
  registers: string[]
  elemental_lenses: string[]
  source_type: string
  is_breakthrough: boolean
  status: string
  return_preference: string | null
}

export async function indexAtomAffinities(
  atomId: string,
  memberId: string
): Promise<void> {
  try {
    // 1. Load atom
    const result = await query<AtomRow>(
      `SELECT id, member_id, primary_register, registers, elemental_lenses,
              source_type, is_breakthrough, status, return_preference
       FROM member_memory_atoms
       WHERE id = $1 AND member_id = $2`,
      [atomId, memberId]
    )
    const atom = result.rows[0]
    if (!atom) return

    // 2. Constitutional guards
    if (atom.status === 'protected' || atom.status === 'archived') return
    if (atom.primary_register === 'sacred_protected') return
    if ((atom.registers ?? []).includes('sacred_protected')) return

    // 3. Compute affinities
    const affinities = mapAtomToFields({
      primary_register: atom.primary_register,
      registers: atom.registers ?? [],
      elemental_lenses: atom.elemental_lenses ?? [],
      source_type: atom.source_type,
      is_breakthrough: atom.is_breakthrough ?? false,
    })

    if (affinities.length === 0) return

    // 4. Upsert each affinity
    for (const aff of affinities) {
      await query(
        `INSERT INTO living_field_affinities
           (member_id, atom_id, field_key, affinity_score, evidence_reason)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (atom_id, field_key)
         DO UPDATE SET
           affinity_score = EXCLUDED.affinity_score,
           evidence_reason = EXCLUDED.evidence_reason`,
        [memberId, atomId, aff.field_key, aff.affinity_score, aff.evidence_reason]
      )
    }
  } catch (err) {
    // Fire-and-forget: log silently, never propagate
    console.error('[living-field/indexAtom] error indexing atom', atomId, err)
  }
}
