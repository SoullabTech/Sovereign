// Authorship Migration — read-only, ledger-derived (Step 5).
//
// Reports the Keep → Revise → Create trajectory per member across their sessions,
// from member_field_note_events (the append-only authorship ledger). This is the
// inversion made measurable: over time, does authority transfer toward the person
// (rising create-share — they author more of their own) rather than the member
// leaning on MAIA's proposals (keep-heavy)?
//
// STRICT scope (Step 5): READ-ONLY. No persistence, no consent model, no
// practitioner visibility, no scoring of the person. The trajectory is a
// description of authorship behavior, builder/steward-facing — NEVER a runtime
// signal and never shown to the member (a runtime target here would invert the
// incentive the architecture exists to protect).
//
// Run:  node scripts/repro/authorship_migration.mjs
import pg from 'pg';

const db = new pg.Client({ connectionString: 'postgresql://soullab@localhost:5432/maia_consciousness' });

const createShare = (s) => {
  const total = s.kept + s.revised + s.created;
  return total ? s.created / total : 0;
};
const trend = (first, last) => {
  const d = last - first;
  if (Math.abs(d) < 0.08) return 'flat';
  return d > 0 ? 'rising' : 'falling';
};

async function main() {
  await db.connect();
  // Authored acts (kept / revised / created — split children are 'created') tied to
  // a persisted thread, so each carries its session via the thread. Discards and the
  // split *gesture* (thread_id NULL) are not authored threads and are excluded here.
  const { rows } = await db.query(`
    SELECT e.member_id::text AS member, t.source_session_ref AS session,
           e.event_type AS kind, e.created_at AS at
      FROM member_field_note_events e
      JOIN member_field_note_threads t ON t.id = e.thread_id
     WHERE e.event_type IN ('kept','revised','created')
     ORDER BY e.member_id, e.created_at
  `);
  await db.end();

  console.log('=== Authorship Migration — Keep → Revise → Create (ledger-derived, read-only) ===\n');
  if (!rows.length) {
    console.log('No authorship events yet — the instrument is ready; data accrues as the cohort uses the room.');
    return;
  }

  // member -> session -> { kept, revised, created, firstAt }
  const members = new Map();
  for (const r of rows) {
    const sess = r.session || '(no-session)';
    if (!members.has(r.member)) members.set(r.member, new Map());
    const sm = members.get(r.member);
    if (!sm.has(sess)) sm.set(sess, { kept: 0, revised: 0, created: 0, firstAt: r.at });
    const s = sm.get(sess);
    if (r.kind === 'kept') s.kept++;
    else if (r.kind === 'revised') s.revised++;
    else if (r.kind === 'created') s.created++;
    if (new Date(r.at) < new Date(s.firstAt)) s.firstAt = r.at;
  }

  let multi = 0;
  let rising = 0;
  for (const [member, sm] of members) {
    const sessions = [...sm.values()]
      .map((s) => ({ ...s, share: createShare(s) }))
      .sort((a, b) => new Date(a.firstAt) - new Date(b.firstAt));
    const authored = sessions.reduce((n, s) => n + s.kept + s.revised + s.created, 0);
    console.log(`member ${member.slice(0, 8)} — ${sessions.length} session(s), ${authored} authored act(s)`);
    for (const s of sessions) {
      const day = new Date(s.firstAt).toISOString().slice(0, 10);
      console.log(`  ${day}: keep ${s.kept} · revise ${s.revised} · create ${s.created}  → create-share ${s.share.toFixed(2)}`);
    }
    if (sessions.length >= 2) {
      multi++;
      const t = trend(sessions[0].share, sessions[sessions.length - 1].share);
      if (t === 'rising') rising++;
      console.log(`  trajectory: create-share ${sessions[0].share.toFixed(2)} → ${sessions[sessions.length - 1].share.toFixed(2)} (${t})`);
    } else {
      console.log('  trajectory: needs a return session to read (single session so far)');
    }
    console.log('');
  }
  console.log(
    `cohort: ${members.size} member(s) with authorship; ${multi} with >=2 sessions; ` +
    `${rising} showing rising create-share (authoring more of their own over time).`,
  );
  console.log('Note: descriptive of authorship behavior over time, not a score of the person. Read-only; never a runtime signal.');
}
main().catch((e) => { console.error(e); process.exit(1); });
