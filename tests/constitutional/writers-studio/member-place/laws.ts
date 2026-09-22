/**
 * MA-F1 … MA-F14 — MEMBER-PLACE LAWS over the v1 contract.
 *
 * ⭐ Each law builds its own fixture from a FRESH substrate, so no law depends
 * on another's state and a candidate's crash cannot carry away a kill already
 * recorded (the flagship matrix's isolation lesson).
 *
 * ⛔ SANCTUARY: no law here. Excluded by founder provision pending ruling.
 */

import type { AdmitInput, LiveWork, MemberPlaceAddress, MemberPlaceSubstrate, Posture } from './contract';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string; }
const law = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });

const ADDR: MemberPlaceAddress = {
  draftSectionId: 'ds-6', revisionNumber: 7, range: { start: 120, end: 168 },
  sectionDigest: 'sha256:6-at-v7', markedText: 'She had stopped fighting the current',
};
const WORK = 'work-river'; const MEMBER = 'm-kelly';
const LIVE_SAME: LiveWork = { workId: WORK, revisionNumber: 7,
  sections: [{ id: 'ds-5', digest: 'sha256:5-at-v7' }, { id: 'ds-6', digest: 'sha256:6-at-v7' }, { id: 'ds-7', digest: 'sha256:7-at-v7' }] };
const STANDARD: Posture = { sanctuary: false, resolvedAtIso: '2026-09-22T10:00:00Z' };
const SANCTUARY: Posture = { sanctuary: true, resolvedAtIso: '2026-09-22T10:00:00Z' };
const TEXT = 'Why does she stop here?';
const input = (over: Partial<AdmitInput> = {}): AdmitInput => ({
  memberId: MEMBER, workId: WORK, address: ADDR, kind: 'question', text: TEXT, at: '2026-09-22T10:00:00Z',
  posture: STANDARD, memberConfirmed: true, channel: 'client', ...over });
const admitOne = (s: MemberPlaceSubstrate, over: Partial<AdmitInput> = {}) => {
  const r = s.admit(input(over)); if (!r.ok) throw new Error(`admit refused: ${r.refusal.category}`); return r.observation;
};

export function runMemberPlaceLaws(make: () => MemberPlaceSubstrate): readonly LawResult[] {
  const out: LawResult[] = [];
  const run = (id: string, f: () => LawResult) => {
    try { out.push(f()); } catch (e) { out.push(law(id, false, `threw: ${(e as Error).message}`)); }
  };

  /* ── MA-F1 · insertion ABOVE the mark, same section ──────────────────────
     ⭐ The section's digest changes; the offsets now name other characters.
     ⛔ v1 may NOT re-anchor by shifting the range. Expected: CHANGED, and the
     creation address returned byte-identical. */
  run('MA-F1-insertion-above-is-CHANGED-not-reanchored', () => {
    const s = make(); const o = admitOne(s);
    const live: LiveWork = { ...LIVE_SAME, revisionNumber: 8,
      sections: LIVE_SAME.sections.map((x) => x.id === 'ds-6' ? { ...x, digest: 'sha256:6-at-v8-shifted' } : x) };
    const r = s.resolve(o, live);
    const ok = r.state === 'CHANGED' && r.currentDraftSectionId === 'ds-6'
      && r.creation.range.start === 120 && r.creation.range.end === 168;
    return law('MA-F1-insertion-above-is-CHANGED-not-reanchored', ok,
      ok ? 'CHANGED; range still 120–168 as marked' : `${r.state} · range ${r.creation.range.start}–${r.creation.range.end}`);
  });

  /* ── MA-F2 · edit INSIDE the marked text ─────────────────────────────── */
  run('MA-F2-edit-inside-is-CHANGED', () => {
    const s = make(); const o = admitOne(s);
    const live: LiveWork = { ...LIVE_SAME, revisionNumber: 8,
      sections: LIVE_SAME.sections.map((x) => x.id === 'ds-6' ? { ...x, digest: 'sha256:6-at-v8-reworded' } : x) };
    const r = s.resolve(o, live);
    return law('MA-F2-edit-inside-is-CHANGED', r.state === 'CHANGED', `${r.state}`);
  });

  /* ── MA-F3 · section REORDER — stable id, unchanged text → EXACT ───────── */
  run('MA-F3-reorder-keeps-EXACT', () => {
    const s = make(); const o = admitOne(s);
    const live: LiveWork = { ...LIVE_SAME, revisionNumber: 8,
      sections: [LIVE_SAME.sections[2]!, LIVE_SAME.sections[0]!, LIVE_SAME.sections[1]!] };
    const r = s.resolve(o, live);
    return law('MA-F3-reorder-keeps-EXACT', r.state === 'EXACT' && r.currentDraftSectionId === 'ds-6', `${r.state}`);
  });

  /* ── MA-F4 · section RENAME — a label is not an address ───────────────────
     Draft sections carry no heading; a structure-unit title is a different
     object. The live Work presented here is byte-identical: rename touches
     nothing the address depends on. */
  run('MA-F4-rename-keeps-EXACT', () => {
    const s = make(); const o = admitOne(s);
    const r = s.resolve(o, { ...LIVE_SAME, revisionNumber: 8 });
    return law('MA-F4-rename-keeps-EXACT', r.state === 'EXACT', `${r.state}`);
  });

  /* ── MA-F5 · section DELETED → MISSING_HISTORICAL_ONLY, observation KEPT ── */
  run('MA-F5-deletion-is-MISSING-and-observation-survives', () => {
    const s = make(); const o = admitOne(s);
    const live: LiveWork = { ...LIVE_SAME, revisionNumber: 8, sections: LIVE_SAME.sections.filter((x) => x.id !== 'ds-6') };
    const r = s.resolve(o, live);
    const kept = s.retrieve(MEMBER, WORK).some((x) => x.id === o.id);
    const ok = r.state === 'MISSING_HISTORICAL_ONLY' && r.currentDraftSectionId === null && kept
      && r.creation.markedText === ADDR.markedText;
    return law('MA-F5-deletion-is-MISSING-and-observation-survives', ok,
      ok ? 'MISSING_HISTORICAL_ONLY; observation and marked text retained' : `${r.state} · kept ${kept}`);
  });

  /* ── MA-F6 · reload / new session — same id, same creation address ─────── */
  run('MA-F6-reload-returns-same-identity-and-creation-address', () => {
    const s = make(); const o = admitOne(s);
    const snap = s.snapshot(); const t = make(); t.restore(snap);
    const back = t.retrieve(MEMBER, WORK).find((x) => x.id === o.id);
    const ok = !!back && JSON.stringify(back.address) === JSON.stringify(o.address) && back.provenance === 'member';
    return law('MA-F6-reload-returns-same-identity-and-creation-address', ok, ok ? `${o.id} survived the boundary intact` : 'lost or altered across reload');
  });

  /* ── MA-F7 · retrieval is (member, Work)-scoped ──────────────────────── */
  run('MA-F7-retrieval-is-owner-and-work-scoped', () => {
    const s = make(); const o = admitOne(s);
    const mine = s.retrieve(MEMBER, WORK).some((x) => x.id === o.id);
    const otherMember = s.retrieve('m-someone-else', WORK).some((x) => x.id === o.id);
    const otherWork = s.retrieve(MEMBER, 'work-other').some((x) => x.id === o.id);
    const ok = mine && !otherMember && !otherWork;
    return law('MA-F7-retrieval-is-owner-and-work-scoped', ok, `mine ${mine} · other member ${otherMember} · other work ${otherWork}`);
  });

  /* ── MA-F8 · Work isolation — colliding section/range never attaches ────── */
  run('MA-F8-colliding-address-never-crosses-works', () => {
    const s = make(); const o = admitOne(s);
    const otherLive: LiveWork = { ...LIVE_SAME, workId: 'work-other' }; /* same ids, same digests */
    const r = s.resolve(o, otherLive);
    const leaked = s.retrieve(MEMBER, 'work-other').length > 0;
    const ok = r.state === 'MISSING_HISTORICAL_ONLY' && !leaked;
    return law('MA-F8-colliding-address-never-crosses-works', ok, ok ? 'another Work with identical coordinates resolves nothing' : `${r.state} · leaked ${leaked}`);
  });

  /* ── MA-F9 · duplicate text elsewhere after deletion — NEVER chosen ───────
     ⭐ The marked sentence now appears in two other sections. ⛔ v1 does not
     look. Expected: MISSING_HISTORICAL_ONLY, currentDraftSectionId null. */
  run('MA-F9-duplicate-text-is-never-selected', () => {
    const s = make(); const o = admitOne(s);
    const live: LiveWork = { ...LIVE_SAME, revisionNumber: 9,
      sections: [{ id: 'ds-5', digest: 'sha256:5-with-the-sentence' }, { id: 'ds-7', digest: 'sha256:7-with-the-sentence' }] };
    const r = s.resolve(o, live);
    const ok = r.state === 'MISSING_HISTORICAL_ONLY' && r.currentDraftSectionId === null;
    return law('MA-F9-duplicate-text-is-never-selected', ok, ok ? 'nothing chosen' : `${r.state} → ${r.currentDraftSectionId}`);
  });

  /* ── MA-F10 · the creation address is immutable across resolution ─────── */
  run('MA-F10-creation-address-never-mutates', () => {
    const s = make(); const o = admitOne(s);
    const before = JSON.stringify(o.address);
    s.resolve(o, { ...LIVE_SAME, revisionNumber: 8, sections: LIVE_SAME.sections.map((x) => x.id === 'ds-6' ? { ...x, digest: 'x' } : x) });
    const stored = s.retrieve(MEMBER, WORK).find((x) => x.id === o.id);
    const ok = JSON.stringify(o.address) === before && !!stored && JSON.stringify(stored.address) === before;
    return law('MA-F10-creation-address-never-mutates', ok, ok ? 'unchanged after a CHANGED resolution' : 'the address moved');
  });

  /* ── MA-F11 · provenance and identity survive every facet ─────────────── */
  run('MA-F11-projection-keeps-member-provenance-and-one-id', () => {
    const s = make(); const o = admitOne(s);
    const ps = (['guided', 'learning', 'direct'] as const).map((f) => s.project(o, f));
    const ok = ps.every((p) => p.provenance === 'member' && p.observationId === o.id);
    return law('MA-F11-projection-keeps-member-provenance-and-one-id', ok,
      ok ? 'three facets, one id, all member-owned' : ps.map((p) => `${p.facet}:${p.provenance}/${p.observationId}`).join(' · '));
  });

  /* ── MA-F12 · v1 says only three things ──────────────────────────────── */
  run('MA-F12-v1-emits-only-the-three-states', () => {
    const s = make(); const o = admitOne(s);
    const lives: LiveWork[] = [LIVE_SAME,
      { ...LIVE_SAME, sections: LIVE_SAME.sections.map((x) => x.id === 'ds-6' ? { ...x, digest: 'y' } : x) },
      { ...LIVE_SAME, sections: [] }];
    const states = lives.map((l) => s.resolve(o, l).state as string);
    const bad = states.filter((st) => !['EXACT', 'CHANGED', 'MISSING_HISTORICAL_ONLY'].includes(st));
    return law('MA-F12-v1-emits-only-the-three-states', bad.length === 0, bad.length === 0 ? states.join(' · ') : `unlawful: ${bad.join(', ')}`);
  });

  /* ── MA-F13 · resume: one row, overwritten; never a cold-start selector ── */
  run('MA-F13-resume-is-one-row-and-never-selects-a-work', () => {
    const s = make();
    s.writeResume({ memberId: MEMBER, workId: WORK, mode: 'write', draftSectionId: 'ds-6', at: 't1' });
    s.writeResume({ memberId: MEMBER, workId: WORK, mode: 'review', draftSectionId: 'ds-7', at: 't2' });
    const rows = s.resumeRowCount(MEMBER, WORK); const cur = s.readResume(MEMBER, WORK); const cold = s.coldStartWork(MEMBER);
    const ok = rows === 1 && cur?.mode === 'review' && cold === null;
    return law('MA-F13-resume-is-one-row-and-never-selects-a-work', ok, `rows ${rows} · current ${cur?.mode ?? 'none'} · cold-start ${cold ?? 'null'}`);
  });

  /* ── MA-F14 · member place is computed from the LIVE WORK, not borrowed ──
     ⭐ MA-D2's shape: a resolver that reports EXACT because something else
     called the evidence "current" while the section digest differs. The law
     is that a differing digest can never yield EXACT — whatever else the
     candidate was told. */
  run('MA-F14-digest-mismatch-is-never-EXACT', () => {
    const s = make(); const o = admitOne(s);
    const live: LiveWork = { ...LIVE_SAME, sections: LIVE_SAME.sections.map((x) => x.id === 'ds-6' ? { ...x, digest: 'sha256:different' } : x) };
    const r = s.resolve(o, live);
    return law('MA-F14-digest-mismatch-is-never-EXACT', r.state !== 'EXACT', `${r.state}`);
  });

  /* ── MA-F15 · identity is minted, ⛔ never derived from the words ────────
     ⭐ The same question asked at two places is two observations. A text-
     derived id would silently merge them — and a member editing one note
     would find the other changed. Mirrors OBSERVATION-IDENTITY-01 §II. */
  run('MA-F15-identical-words-are-two-observations', () => {
    const s = make(); const a = admitOne(s); const b = admitOne(s);
    const both = s.retrieve(MEMBER, WORK).filter((x) => x.id === a.id || x.id === b.id).length;
    const ok = a.id !== b.id && both === 2;
    return law('MA-F15-identical-words-are-two-observations', ok, ok ? `${a.id} ≠ ${b.id}, both retrievable` : `ids ${a.id}/${b.id} · retrievable ${both}`);
  });

  /* ── MA-S1 · explicit save still refuses in Sanctuary ───────────────────────
     ⭐ The member chose *Keep with this passage*. ⛔ Confirmation does not
     override Sanctuary: zero durable object, nothing reports saved. */
  run('MA-S1-explicit-save-refused-in-sanctuary', () => {
    const s = make(); const r = s.admit(input({ posture: SANCTUARY, memberConfirmed: true, channel: 'client' }));
    const stored = s.retrieve(MEMBER, WORK).length;
    const ok = !r.ok && r.refusal.category === 'sanctuary' && stored === 0;
    return law('MA-S1-explicit-save-refused-in-sanctuary', ok, ok ? 'refused; zero rows' : `ok=${r.ok} · rows ${stored}`);
  });

  /* ── MA-S2 · hiding the UI is insufficient — the STORE refuses ──────── */
  run('MA-S2-direct-store-invocation-refuses-in-sanctuary', () => {
    /* ⚠️ confirmation ON. With it off, MA-F16 refuses first and a client-only
       guard hides behind the confirmation law — DS2 survived exactly that way. */
    const s = make(); const r = s.admit(input({ posture: SANCTUARY, channel: 'direct', memberConfirmed: true }));
    const stored = s.retrieve(MEMBER, WORK).length;
    const ok = !r.ok && stored === 0;
    return law('MA-S2-direct-store-invocation-refuses-in-sanctuary', ok, ok ? 'the boundary itself refused' : `ok=${r.ok} · rows ${stored}`);
  });

  /* ── MA-S3 · missing posture fails CLOSED ──────────────────────────── */
  run('MA-S3-unresolved-posture-fails-closed', () => {
    const s = make(); const r = s.admit(input({ posture: undefined }));
    const stored = s.retrieve(MEMBER, WORK).length;
    const ok = !r.ok && r.refusal.category === 'posture_unresolved' && stored === 0;
    return law('MA-S3-unresolved-posture-fails-closed', ok, ok ? 'refused as posture_unresolved' : `ok=${r.ok} · rows ${stored}`);
  });

  /* ── MA-S4 · standard posture + explicit confirmation is LAWFUL ───────── */
  run('MA-S4-standard-explicit-persistence-permitted', () => {
    const s = make(); const r = s.admit(input({ posture: STANDARD, memberConfirmed: true }));
    const ok = r.ok && s.retrieve(MEMBER, WORK).length === 1;
    return law('MA-S4-standard-explicit-persistence-permitted', ok, ok ? 'persisted' : 'refused under standard posture');
  });

  /* ── MA-S5 · refusal evidence carries NO content ───────────────────────
     ⭐ *A refusal is not an occasion to disclose.* Serialize the evidence and
     search it for the observation text, the marked passage and the full id. */
  run('MA-S5-refusal-evidence-is-content-free', () => {
    /* one axis: the evidence shape. Confirmation off, so a confirmation-override
       candidate is not what this law is measuring. */
    const s = make(); const r = s.admit(input({ posture: SANCTUARY, memberConfirmed: false }));
    if (r.ok) return law('MA-S5-refusal-evidence-is-content-free', false, 'did not refuse');
    const blob = JSON.stringify(r.refusal);
    const leaks = [TEXT, ADDR.markedText, MEMBER].filter((x) => blob.includes(x));
    return law('MA-S5-refusal-evidence-is-content-free', leaks.length === 0, leaks.length === 0 ? `evidence: ${blob}` : `leaked: ${leaks.join(' · ')}`);
  });

  /* ── MA-F16 · standard posture WITHOUT member confirmation → REFUSE ─────────
     ⭐ B-IR1. The missing half of the conjunction: an observation the member
     did not choose to keep must not become durable merely because Sanctuary
     was not in force. */
  run('MA-F16-unconfirmed-is-refused-under-standard-posture', () => {
    const s = make(); const r = s.admit(input({ posture: STANDARD, memberConfirmed: false }));
    const stored = s.retrieve(MEMBER, WORK).length;
    const ok = !r.ok && r.refusal.category === 'not_confirmed' && stored === 0;
    return law('MA-F16-unconfirmed-is-refused-under-standard-posture', ok, ok ? 'refused as not_confirmed; zero rows' : `ok=${r.ok} · rows ${stored}`);
  });

  return out;
}
