/**
 * Back-fills living_field_affinities for all existing atoms.
 * Run once: npx tsx scripts/backfill-living-field-affinities.ts
 */

import { query } from '../lib/db/postgres'
import { indexAtomAffinities } from '../lib/maia/living-field/indexAtom'

async function main() {
  console.log('Starting back-fill of living_field_affinities...')

  const result = await query<{ id: string; member_id: string }>(
    `SELECT id, member_id
     FROM member_memory_atoms
     WHERE status NOT IN ('protected', 'archived')
       AND primary_register IS DISTINCT FROM 'sacred_protected'
       AND NOT ('sacred_protected' = ANY(registers))
     ORDER BY kept_at ASC`
  )

  const atoms = result.rows
  console.log(`Found ${atoms.length} eligible atoms to process.`)

  let processed = 0
  for (const atom of atoms) {
    await indexAtomAffinities(atom.id, atom.member_id)
    processed++
    if (processed % 50 === 0) {
      console.log(`  Processed ${processed}/${atoms.length}...`)
    }
  }

  // Count total affinities created
  const countResult = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM living_field_affinities`
  )
  const totalAffinities = countResult.rows[0]?.count ?? '0'

  console.log(`\nDone. Processed ${processed} atoms, ${totalAffinities} total affinities in table.`)
  process.exit(0)
}

main().catch(err => {
  console.error('Back-fill failed:', err)
  process.exit(1)
})
