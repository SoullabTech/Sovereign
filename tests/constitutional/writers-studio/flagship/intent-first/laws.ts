import type { Evidence, IntentId, IntentMachine, Scope, State } from './contract';
export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string; }
const law = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });
const PLACE = { sectionId: 'ds-6', anchor: 'a:6:0' };
const REST: State = { name: 'REST', place: PLACE };
const NONE: Evidence = { admittedHere: [], capabilities: ['passage', 'section', 'chapter', 'adjacent-chapters'] };
const SOME: Evidence = { admittedHere: [{ observationId: 'dobs_1', text: 'The river appears in the opening and returns here.' }], capabilities: NONE.capabilities };
const THIN: Evidence = { admittedHere: [], capabilities: ['passage'] };
const LENS_WORDS = ['structure', 'voice', 'continuity', 'arc', 'coherence', 'development', 'reader perspective'];
const DIAGNOSIS = ['structural problem', 'your chapter has', 'you have a', 'is weak', 'is broken'];
const INTENTS: IntentId[] = ['feels-off', 'see-the-shape', 'losing-the-thread', 'not-my-voice', 'what-is-this-chapter-doing', 'what-keeps-appearing', 'go-deeper', 'repeating-myself', 'help-me-look'];
const sel = (m: IntentMachine, intent: IntentId, ev: Evidence, facet: 'guided' | 'learning' | 'direct' = 'guided') =>
  m.step(m.step(REST, { type: 'OPEN_INTENTS' }, ev), { type: 'SELECT_INTENT', intent, facet }, ev);
const moves = (s: State): readonly string[] => 'nextMoves' in s ? s.nextMoves : s.name === 'ORIENTED' ? s.response.nextMoves : s.name === 'SCOPE_PROPOSED' ? s.response.nextMoves : [];

export function runIntentLaws(make: () => IntentMachine): readonly LawResult[] {
  const out: LawResult[] = [];
  const run = (id: string, f: () => LawResult) => { try { out.push(f()); } catch (e) { out.push(law(id, false, `threw: ${(e as Error).message}`)); } };

  run('I1-front-door-is-human-language', () => {
    const m = make(); const labels = m.frontDoor(NONE).map((o) => o.label.toLowerCase());
    const lensy = labels.filter((l) => LENS_WORDS.some((w) => l === w || l.startsWith(w + ' ')));
    return law('I1-front-door-is-human-language', lensy.length === 0 && labels.length >= 5, lensy.length ? `lens vocabulary at the door: ${lensy.join(', ')}` : `${labels.length} plain-language options`);
  });
  run('I2-intent-is-not-commission', () => {
    const m = make(); const bad: string[] = [];
    for (const i of INTENTS) { const s = sel(m, i, NONE); if (s.name === 'READ_PENDING' || m.commissions().length > 0) bad.push(i); }
    return law('I2-intent-is-not-commission', bad.length === 0, bad.length ? `selecting commissioned: ${bad.join(', ')}` : `${INTENTS.length} intents, 0 readings`);
  });
  run('I3-reflect-before-route-and-never-diagnose', () => {
    const m = make(); const s = sel(m, 'feels-off', NONE);
    const resp = s.name === 'ORIENTED' || s.name === 'SCOPE_PROPOSED' ? s.response : null;
    if (!resp) return law('I3-reflect-before-route-and-never-diagnose', false, `no orientation: ${s.name}`);
    const dx = DIAGNOSIS.filter((d) => (resp.reflection + ' ' + resp.wayToLook).toLowerCase().includes(d));
    return law('I3-reflect-before-route-and-never-diagnose', resp.reflection.trim().length > 0 && dx.length === 0, dx.length ? `diagnosis: ${dx.join(', ')}` : `reflects: "${resp.reflection.slice(0, 50)}"`);
  });
  run('I4-proposed-scope-is-named-and-possible', () => {
    const m = make(); const s = sel(m, 'losing-the-thread', NONE);
    if (s.name !== 'SCOPE_PROPOSED') return law('I4-proposed-scope-is-named-and-possible', false, `expected a proposal, got ${s.name}`);
    const named = s.suggested.sectionIds.length > 0; const possible = NONE.capabilities.includes(s.suggested.kind);
    const cf = moves(s).filter((x) => /whole (manuscript|work)/i.test(x));
    return law('I4-proposed-scope-is-named-and-possible', named && possible && cf.length === 0, `scope ${s.suggested.kind}[${s.suggested.sectionIds.join(',')}] · possible ${possible} · capability-false offers ${cf.length}`);
  });
  run('I5-reading-begins-only-after-authorization', () => {
    const m = make(); const s = sel(m, 'losing-the-thread', NONE);
    const before = m.commissions().length;
    const t = m.step(s, { type: 'AUTHORIZE_READING', scope: (s as { suggested: Scope }).suggested, clickId: 'c1' }, NONE);
    return law('I5-reading-begins-only-after-authorization', before === 0 && t.name === 'READ_PENDING' && m.commissions().length === 1, `before ${before} · after ${m.commissions().length} · ${t.name}`);
  });
  run('I6-narrowing-wins', () => {
    const m = make(); let s = sel(m, 'losing-the-thread', NONE);
    const narrow: Scope = { kind: 'chapter', sectionIds: ['ds-6'] };
    s = m.step(s, { type: 'NARROW_SCOPE', to: narrow }, NONE);
    m.step(s, { type: 'AUTHORIZE_READING', scope: narrow, clickId: 'c1' }, NONE);
    const c = m.commissions()[0];
    const ok = !!c && c.scope.sectionIds.length === 1 && c.scope.sectionIds[0] === 'ds-6';
    return law('I6-narrowing-wins', ok, c ? `executed [${c.scope.sectionIds.join(',')}]` : 'no commission');
  });
  run('I7-existing-evidence-first', () => {
    const m = make(); const s = sel(m, 'losing-the-thread', SOME);
    const ok = s.name === 'DISCOVERY_PRESENTED' && !!s.discovery && s.discovery.fromExistingEvidence && m.commissions().length === 0;
    return law('I7-existing-evidence-first', ok, ok ? 'used what MAIA already read; no reread' : `${s.name} · commissions ${m.commissions().length}`);
  });
  run('I8-help-me-look-gives-a-move-not-a-menu', () => {
    const m = make(); const a = sel(m, 'help-me-look', SOME); const b = sel(make(), 'help-me-look', NONE);
    const menuA = moves(a).filter((x) => LENS_WORDS.includes(x.toLowerCase())); const menuB = moves(b).filter((x) => LENS_WORDS.includes(x.toLowerCase()));
    const ok = a.name === 'DISCOVERY_PRESENTED' && menuA.length === 0 && (b.name === 'SCOPE_PROPOSED' || b.name === 'ORIENTED') && menuB.length === 0;
    return law('I8-help-me-look-gives-a-move-not-a-menu', ok, `with evidence ${a.name} · without ${b.name} · lens menus ${menuA.length + menuB.length}`);
  });
  run('I9-honest-insufficiency', () => {
    const m = make(); const s = sel(m, 'help-me-look', THIN);
    const ok = s.name === 'ORIENTED' && s.response.scopeNamed === null && /don.t have enough/i.test(s.response.invitation) && m.commissions().length === 0;
    return law('I9-honest-insufficiency', ok, ok ? 'says it cannot say yet; reads nothing' : `${s.name}`);
  });
  run('I10-facet-does-not-change-scope', () => {
    const g = sel(make(), 'losing-the-thread', NONE, 'guided'); const d = sel(make(), 'losing-the-thread', NONE, 'direct');
    const gs = g.name === 'SCOPE_PROPOSED' ? g.suggested : null; const ds = d.name === 'SCOPE_PROPOSED' ? d.suggested : null;
    const ok = !!gs && !!ds && gs.kind === ds.kind && gs.sectionIds.join() === ds.sectionIds.join();
    return law('I10-facet-does-not-change-scope', ok, `guided ${gs?.kind}[${gs?.sectionIds.join(',')}] · direct ${ds?.kind}[${ds?.sectionIds.join(',')}]`);
  });
  run('I11-keep-writing-commissions-nothing-and-keeps-place', () => {
    const m = make(); const s = sel(m, 'losing-the-thread', NONE);
    const k = m.step(s, { type: 'KEEP_WRITING' }, NONE); const k2 = sel(make(), 'keep-writing', NONE);
    const ok = k.name === 'KEEP_WRITING' && k.place.sectionId === 'ds-6' && k.place.anchor === 'a:6:0' && m.commissions().length === 0 && k2.name === 'KEEP_WRITING';
    return law('I11-keep-writing-commissions-nothing-and-keeps-place', ok, `${k.name} @ ${k.place.sectionId}/${k.place.anchor} · commissions ${m.commissions().length}`);
  });
  run('I12-every-response-offers-a-next-move', () => {
    const m = make(); const s = sel(m, 'losing-the-thread', NONE);
    const declined = m.step(s, { type: 'DECLINE' }, NONE);
    const auth = m.step(s, { type: 'AUTHORIZE_READING', scope: (s as { suggested: Scope }).suggested, clickId: 'c1' }, NONE);
    const zero = m.step(auth, { type: 'READ_COMPLETE', requestId: (auth as { requestId: string }).requestId, admitted: 0 }, NONE);
    const bad = [s, declined, zero].filter((x) => moves(x).length === 0 || !moves(x).some((y) => /keep writing/i.test(y)));
    return law('I12-every-response-offers-a-next-move', bad.length === 0, bad.length ? `stranded at: ${bad.map((x) => x.name).join(', ')}` : 'proposal, decline and zero-observation all lead somewhere');
  });
  run('R13-broad-request-superseded-by-narrowing', () => {
    const m = make(); let s = sel(m, 'losing-the-thread', NONE);
    const broad: Scope = { kind: 'adjacent-chapters', sectionIds: ['ds-5', 'ds-6'] };
    s = m.step(s, { type: 'AUTHORIZE_READING', scope: broad, clickId: 'c1' }, NONE);
    m.step(s, { type: 'NARROW_SCOPE', to: { kind: 'chapter', sectionIds: ['ds-6'] } }, NONE);
    const broadLeft = m.commissions().filter((c) => c.scope.sectionIds.length === 2).length;
    return law('R13-broad-request-superseded-by-narrowing', broadLeft === 0, broadLeft ? 'the broad read is still queued' : 'broad read withdrawn');
  });
  run('R14-navigation-never-commissions', () => {
    const m = make(); let s = sel(m, 'losing-the-thread', NONE);
    s = m.step(s, { type: 'NAVIGATE', to: 'develop' }, NONE); s = m.step(s, { type: 'OPEN_LENS', lens: 'continuity' }, NONE);
    s = m.step(s, { type: 'OPEN_MAIA' }, NONE); s = m.step(s, { type: 'SWITCH_FACET', facet: 'direct' }, NONE);
    return law('R14-navigation-never-commissions', m.commissions().length === 0 && s.name !== 'READ_PENDING', `commissions ${m.commissions().length} · ${s.name}`);
  });
  run('R15-double-click-is-one-reading', () => {
    const m = make(); const s = sel(m, 'losing-the-thread', NONE); const sc = (s as { suggested: Scope }).suggested;
    const a = m.step(s, { type: 'AUTHORIZE_READING', scope: sc, clickId: 'same' }, NONE); m.step(a, { type: 'AUTHORIZE_READING', scope: sc, clickId: 'same' }, NONE);
    return law('R15-double-click-is-one-reading', m.commissions().length === 1, `${m.commissions().length} reading(s)`);
  });
  return out;
}
