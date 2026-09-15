/**
 * ASK-WORK-ANCHOR-01 · B2 — the Work context, witnessed.
 *
 * ⭐ AT THE SEAM, DELIBERATELY. The Work anchor is still refused at the parse
 * boundary (B3 has not happened), so there is no HTTP path to drive. ⛔ That is
 * not a reason to assert this in prose: `buildWorkContext` is exercised against
 * a real PostgreSQL with real owned and foreign rows, which is where every
 * claim below actually lives.
 *
 * ⛔ DISPOSABLE DATABASES ONLY.
 */
import { randomUUID } from 'node:crypto';
import { Client } from 'pg';

const DSN = process.env.DATABASE_URL!;
let pass = 0, fail = 0;
const ok = (s: string) => { pass++; console.log(`  PASS  ${s}`); };
const bad = (s: string, d: string) => { fail++; console.log(`  FAIL  ${s}\n     -> ${d}`); };
const eq = (s: string, got: unknown, want: unknown) =>
  got === want ? ok(s) : bad(s, `want [${JSON.stringify(want)}] got [${JSON.stringify(got)}]`);

let pg: Client;
const q = async (s: string, p: unknown[] = []) => (await pg.query(s, p as unknown[])).rows as any[];
const one = async (s: string, p: unknown[] = []) => (await q(s, p))[0];

const CH10 = 'The spiral is not a circle, fixated on its own return.';
const CH9 = 'Before the water, there was a sound that had not yet become a word.';

async function main() {
  pg = new Client({ connectionString: DSN }); await pg.connect();
  const db = (await one('SELECT current_database() d')).d as string;
  if (!db.includes('witness')) { console.log(`REFUSED · '${db}' is not a witness database.`); process.exit(2); }

  const mk = async (title: string, purpose: string | null) => {
    const M = randomUUID(), LW = randomUUID(), WK = randomUUID(), DR = randomUUID();
    const S10 = randomUUID(), S9 = randomUUID(), D10 = randomUUID(), D9 = randomUUID();
    await q(`INSERT INTO members (id,passkey,username,password_hash,name)
             VALUES ($1,$2,$3,'x','W')`, [M, `WC-${M.slice(0, 8)}`, `wc-${M.slice(0, 8)}`]);
    await q(`INSERT INTO living_works (id,member_id,title,purpose,form,stage)
             VALUES ($1,$2,$3,$4,'Book','writing')`, [LW, M, title, purpose]);
    await q(`INSERT INTO living_work_expressions (living_work_id,expression_type,expression_id,declared_by)
             VALUES ($1,'manuscript',$2,$3)`, [LW, WK, M]);
    await q(`INSERT INTO member_manuscripts (id,member_id,title) VALUES ($1,$2,$3)`, [WK, M, title]);
    await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
             VALUES ($1,$2,0,'Chapter Ten',$3)`, [S10, WK, CH10]);
    await q(`INSERT INTO manuscript_sections (id,manuscript_id,position,heading,body)
             VALUES ($1,$2,1,'Chapter Nine',$3)`, [S9, WK, CH9]);
    await q('BEGIN');
    await q(`INSERT INTO manuscript_working_drafts
               (id,manuscript_id,member_id,content,base_source_hash,revision_count,version,section_addressable_at)
             VALUES ($1,$2,$3,'','wc',1,41,NULL)`, [DR, WK, M]);
    await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
             VALUES ($1,$2,0,$3,$4)`, [D10, DR, `Chapter Ten\n\n${CH10}`, S10]);
    await q(`INSERT INTO manuscript_draft_sections (id,draft_id,position,text,source_section_id)
             VALUES ($1,$2,1,$3,$4)`, [D9, DR, `Chapter Nine\n\n${CH9}`, S9]);
    await q(`UPDATE manuscript_working_drafts
                SET content = (SELECT COALESCE(string_agg(text,'' ORDER BY position),'')
                                 FROM manuscript_draft_sections WHERE draft_id = $1),
                    section_addressable_at = now() WHERE id = $1`, [DR]);
    await q('COMMIT');
    return { M, WK, DR, D10, D9 };
  };

  const mine = await mk('Elemental Alchemy', 'To say what I actually found.');
  const theirs = await mk('Someone Else’s Book', null);

  const { buildWorkContext, loadProjectedSectionBody } =
    await import('@/lib/manuscript/ask/workContext');
  const STILL = { structure: 'unchanged' as const, prose: 'unmeasured' as const };

  console.log('\n══════════════════════════════════════════════════════════════════');
  console.log(' ASK-WORK-ANCHOR-01 · B2 · THE WORK CONTEXT');
  console.log('══════════════════════════════════════════════════════════════════');

  /* ══ A · WORK FACTS ARE SERVER-DERIVED ═════════════════════════════════ */
  console.log('\n── A · WORK FACTS ────────────────────────────────────────────────');
  const a = await buildWorkContext({
    manuscriptId: mine.WK, memberId: mine.M, sectionId: null, continuity: STILL });
  if (!a.ok) { bad('A0 the Work resolves', a.reason); }
  else {
    ok('A0 the Work resolves from the manuscript the member declared it over');
    eq('A1 ⭐ the title came from the row, not the caller', a.facts.work.title, 'Elemental Alchemy');
    eq('A2 ⭐ and the purpose in her own words',
      a.facts.work.purpose, 'To say what I actually found.');
    eq('A3 her own word for the form', a.facts.work.form, 'Book');
    eq('A4 where SHE says she is', a.facts.work.stage, 'writing');
    eq('A5 the manuscript identity is the server’s', a.facts.manuscript.id, mine.WK);
    eq('A6 with the draft it actually has', a.facts.manuscript.draftId, mine.DR);
    eq('A7 at the version it actually is', a.facts.manuscript.version, 41);
    eq('A8 ⭐ section heads are present', a.facts.sections.length, 2);
    eq('A9 ⛔ and heads carry NO body',
      Object.keys(a.facts.sections[0]!).sort().join(','), 'heading,id,position');
    eq('A10 ⛔ with no locus, no section text is present at all', a.facts.locus, null);
  }

  /* ══ B · THE CURRENT LOCUS, AND ONLY IT ════════════════════════════════ */
  console.log('\n── B · CURRENT LOCUS ─────────────────────────────────────────────');
  const b = await buildWorkContext({
    manuscriptId: mine.WK, memberId: mine.M, sectionId: mine.D10, continuity: STILL });
  if (!b.ok) bad('B0 resolves with a locus', b.reason);
  else {
    ok('B0 resolves with a locus');
    eq('B1 ⭐ the locus is the section she is at', b.facts.locus?.sectionId, mine.D10);
    eq('B2 ⭐ its label is her own heading', b.facts.locus?.label, 'Chapter Ten');
    eq('B3 ⭐⭐ the body is PROJECTED — the heading prefix is gone',
      b.facts.locus?.body, CH10);
    eq('B4 ⛔⛔ and NO other section’s text is anywhere in the context',
      JSON.stringify(b.facts).includes(CH9), false);
    eq('B5 ⛔ this is not a manuscript payload — one body, and one only',
      (JSON.stringify(b.facts).match(/The spiral is not a circle/g) ?? []).length, 1);
  }

  /* ══ C · THE LOCUS MOVES; THE RELATIONSHIP DOES NOT ════════════════════ */
  console.log('\n── C · CHAPTER TEN → CHAPTER NINE ────────────────────────────────');
  const c = await buildWorkContext({
    manuscriptId: mine.WK, memberId: mine.M, sectionId: mine.D9, continuity: STILL });
  if (!c.ok || !b.ok) bad('C0 both resolve', 'one did not');
  else {
    eq('C1 ⭐⭐ the Work identity is unchanged', c.facts.work.id, b.facts.work.id);
    eq('C2 ⭐ and so is the manuscript', c.facts.manuscript.id, b.facts.manuscript.id);
    eq('C3 the locus moved', c.facts.locus?.sectionId, mine.D9);
    eq('C4 ⭐ to her other chapter, projected', c.facts.locus?.body, CH9);
    eq('C5 ⛔ and Chapter Ten’s text is now absent',
      JSON.stringify(c.facts).includes(CH10), false);
    /* ⭐ Everything that is NOT the locus is identical across the move. */
    const strip = (x: typeof b.facts) => JSON.stringify({ ...x, locus: null });
    eq('C6 ⭐⭐ nothing but the locus differs', strip(c.facts), strip(b.facts));
  }

  /* ══ D · OWNERSHIP ═════════════════════════════════════════════════════ */
  console.log('\n── D · OWNERSHIP ─────────────────────────────────────────────────');
  const d1 = await buildWorkContext({
    manuscriptId: theirs.WK, memberId: mine.M, sectionId: null, continuity: STILL });
  eq('D1 ⛔ another member’s Work does not resolve', d1.ok, false);
  eq('D2 and it exposes no facts to reason from',
    d1.ok === false ? d1.reason : 'LEAKED', 'work_unresolved');
  const d3 = await buildWorkContext({
    manuscriptId: mine.WK, memberId: mine.M, sectionId: theirs.D10, continuity: STILL });
  eq('D3 ⭐ a foreign SECTION id on an owned Work yields no locus',
    d3.ok && d3.facts.locus, null);
  eq('D4 ⛔ and certainly not their text',
    d3.ok ? JSON.stringify(d3.facts).includes('Someone') : true, false);
  const d5 = await loadProjectedSectionBody(mine.WK, theirs.M, mine.D10);
  eq('D5 ⛔ the narrow read is member-scoped in its own SQL', d5, null);

  /* ══ E · PROSE IS UNMEASURED, AND SAYS SO ══════════════════════════════ */
  console.log('\n── E · CONTINUITY ────────────────────────────────────────────────');
  if (b.ok) {
    eq('E1 structure reports what was measured', b.facts.continuity.structure, 'unchanged');
    eq('E2 ⭐⭐ and prose reports that nothing measured it', b.facts.continuity.prose, 'unmeasured');
    eq('E3 ⛔ the prose field is PRESENT, never absent — an absent field reads as '
      + '"nothing to report"', 'prose' in b.facts.continuity, true);
  }
  const { askMaiaPromptForWitness } = await import('@/lib/manuscript/ask/askReader')
    .then((m) => ({ askMaiaPromptForWitness: (m as never as Record<string, unknown>).askMaiaPromptForWitness }))
    .catch(() => ({ askMaiaPromptForWitness: undefined }));
  eq('E4 ⛔ no prompt-inspection backdoor was added for this witness',
    askMaiaPromptForWitness, undefined);

  console.log(`\n  ${pass} passed · ${fail} failed`);
  await pg.end();
  process.exit(fail === 0 ? 0 : 1);
}

void main().catch(async (e) => {
  console.log(`  ⛔ WITNESS ABORTED — ${e instanceof Error ? e.stack : String(e)}`);
  await pg?.end().catch(() => {}); process.exit(2);
});
