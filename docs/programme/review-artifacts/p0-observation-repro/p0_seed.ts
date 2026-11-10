/**
 * P0 FIXTURE — two FICTIONAL readings, each with several observations, frozen through the
 * product's own evidence capture, freeze and store. The ONLY thing skipped is the two model calls
 * (reader, classifier): the observation text is hand-authored fiction. Provenance says so.
 */
import { query } from '@/lib/db/postgres';
import { captureEvidence } from '@/lib/manuscript/development/capture';
import { freezeReading } from '@/lib/manuscript/developmentalReading/freeze';
import { freezeAndStore } from '@/lib/manuscript/developmentalReading/store';

const MS = process.env.P0_MS!;
const FIXTURE = 'FICTIONAL-HAND-AUTHORED-FIXTURE';
const reader = { provider: 'anthropic' as const, model: FIXTURE, promptHash: '0'.repeat(64), readerVersion: FIXTURE };
const classifier = { provider: 'anthropic' as const, model: FIXTURE, promptHash: '0'.repeat(64), classifierVersion: FIXTURE };

async function main() {
  const m = await query<{ member_id: string }>(`SELECT member_id FROM member_manuscripts WHERE id=$1`, [MS]);
  const memberId = m.rows[0].member_id;
  const secs = await query<{ id: string; heading: string | null }>(
    `SELECT s.id, ms.heading FROM manuscript_draft_sections s
       JOIN manuscript_working_drafts d ON d.id=s.draft_id
       LEFT JOIN manuscript_sections ms ON ms.id=s.source_section_id
      WHERE d.manuscript_id=$1 ORDER BY s.position`, [MS]);
  const ids = secs.rows.map((r) => r.id);
  console.log(JSON.stringify({ sections: secs.rows.map((r) => r.heading), n: ids.length }));

  const cap = await captureEvidence(MS, memberId, { bodyScope: ids, withStructure: false });
  if (!cap.ok) { console.log(JSON.stringify({ captureRefused: cap })); process.exit(2); }

  const make = async (claims: { text: string; sec: number; dne: string[]; ph: string }[]) => {
    const f = freezeReading({
      manuscriptId: MS,
      request: { commissionedLens: 'development', evidence: cap.value, recovered: [] } as never,
      result: { outcome: 'claims', reader, claims: claims.map((c) => ({
        text: c.text, refs: [{ kind: 'section', sectionId: ids[c.sec] }], doesNotEstablish: c.dne })) } as never,
      phenomena: claims.map((c) => c.ph) as never,
      reader, classifier,
    });
    if (!f.ok) { console.log(JSON.stringify({ freezeRefused: f })); process.exit(3); }
    const s = await freezeAndStore(memberId, f.value);
    console.log(JSON.stringify({ stored: s }));
    return s;
  };

  await make([
    { text: 'The harbour appears in each of the first two chapters, and the second returns to it with the nets rather than the light.', sec: 0, dne: ['author-intent'], ph: 'recurrence' },
    { text: 'The prose in this chapter moves from a wide view of the quay to one small object, the key in a pocket.', sec: 0, dne: ['reader-effect'], ph: 'movement' },
    { text: 'The letter that arrives in March is mentioned before it is explained.', sec: 2, dne: ['chronology'], ph: 'prospective-reference' },
    { text: 'Leaving is described as the long part, and the next chapter begins after it.', sec: 3, dne: ['outside-coverage'], ph: 'unresolved-thread' },
  ]);
  await new Promise((r) => setTimeout(r, 1200));
  await make([
    { text: 'Salt is the first concrete object the writing returns to more than once.', sec: 1, dne: ['whole-work-pattern'], ph: 'recurrence' },
    { text: 'The register in this chapter is more instructional than the one before it.', sec: 1, dne: ['author-intent'], ph: 'register-shift' },
    { text: 'A claim about the nets is made once and not revisited.', sec: 1, dne: ['editorial-consequence'], ph: 'unresolved-thread' },
  ]);
  process.exit(0);
}
main().catch((e) => { console.log(JSON.stringify({ error: String(e).slice(0, 400) })); process.exit(1); });
