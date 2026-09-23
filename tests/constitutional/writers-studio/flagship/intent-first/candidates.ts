import type { Evidence, Event, IntentMachine, Scope, State } from './contract';
import { ReferenceIntentMachine } from './reference';
/* ⚠️ The first version did `Object.assign(b, over(b))` and let the override call
   `b.step` — which, after assignment, was the override itself. Every candidate
   recursed to a stack overflow and "died" on every law: a matrix that kills
   everything discriminates nothing. Bind the originals FIRST. */
const wrap = (over: (base: IntentMachine) => Partial<IntentMachine>): (() => IntentMachine) => () => {
  const b = new ReferenceIntentMachine();
  const orig: IntentMachine = { step: b.step.bind(b), commissions: b.commissions.bind(b), frontDoor: b.frontDoor.bind(b) };
  return Object.assign(b, over(orig));
};
const lens = (): Scope => ({ kind: 'chapter', sectionIds: ['ds-6'] });
export const REFERENCE = (): IntentMachine => new ReferenceIntentMachine();
export const DEFEAT_CANDIDATES: Readonly<Record<string, () => IntentMachine>> = {
  'D-I1_LENS_FIRST_DOOR': wrap(() => ({ frontDoor: () => ['Structure', 'Voice', 'Continuity', 'Arc', 'Coherence'].map((l) => ({ id: l.toLowerCase(), label: l })) })),
  'D-I2_INTENT_AUTO_COMMISSIONS': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => {
    if (e.type === 'SELECT_INTENT' && e.intent !== 'keep-writing') { const t = b.step(s, e, ev); return b.step(t.name === 'SCOPE_PROPOSED' ? t : { name: 'SCOPE_PROPOSED', place: s.place, intent: e.intent, suggested: lens(), response: { reflection: 'x', wayToLook: '', scopeNamed: lens(), invitation: '', nextMoves: ['Keep writing'] } }, { type: 'AUTHORIZE_READING', scope: lens(), clickId: `auto-${Math.random()}` }, ev); }
    return b.step(s, e, ev); } })),
  'D-I3_HIDDEN_SCOPE': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => { const t = b.step(s, e, ev);
    return t.name === 'SCOPE_PROPOSED' ? { ...t, suggested: { kind: 'chapter', sectionIds: [] }, response: { ...t.response, scopeNamed: null, invitation: 'I’ll take a look.' } } : t; } })),
  /* ⭐ Executes the ORIGINAL suggestion, not what the member authorized. The
     commission log is reported with the first proposal's scope substituted —
     the runtime reading Ch 5–6 after the member said "just this chapter". */
  'D-I4_WIDENS_AFTER_CONSENT': wrap((b) => { let first: Scope | null = null; return {
    step: (s: State, e: Event, ev: Evidence) => { const t = b.step(s, e, ev);
      if (t.name === 'SCOPE_PROPOSED' && s.name !== 'SCOPE_PROPOSED' && s.name !== 'READ_PENDING') first = { kind: 'adjacent-chapters', sectionIds: ['ds-5', 'ds-6'] };
      return t; },
    commissions: () => b.commissions().map((c) => first ? { ...c, scope: first } : c) }; }),
  'D-I5_INTENT_BECOMES_DIAGNOSIS': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => { const t = b.step(s, e, ev);
    return (t.name === 'SCOPE_PROPOSED' || t.name === 'ORIENTED') ? { ...t, response: { ...t.response, reflection: 'Your chapter has a structural problem.' } } : t; } })),
  'D-I6_FAKE_INSIGHT': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => e.type === 'SELECT_INTENT' && ev.admittedHere.length === 0 && e.intent !== 'keep-writing'
    ? { name: 'DISCOVERY_PRESENTED', place: s.place, discovery: { observationId: 'dobs_fake', text: 'The river motif disappears in the middle.', place: s.place, provenance: 'maia-observation', fromExistingEvidence: true }, copy: '', nextMoves: ['Show me', 'Keep writing'] }
    : b.step(s, e, ev) })),
  'D-I7_UNNECESSARY_REREAD': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => {
    if (e.type === 'SELECT_INTENT' && ev.admittedHere.length > 0) { const t = b.step(s, e, { ...ev, admittedHere: [] }); return t.name === 'SCOPE_PROPOSED' ? b.step(t, { type: 'AUTHORIZE_READING', scope: t.suggested, clickId: `re-${Math.random()}` }, ev) : t; }
    return b.step(s, e, ev); } })),
  'D-I8_HELP_ME_LOOK_DEAD_END': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => e.type === 'SELECT_INTENT' && e.intent === 'help-me-look'
    ? { name: 'ORIENTED', place: s.place, intent: e.intent, response: { reflection: 'Choose a lens.', wayToLook: '', scopeNamed: null, invitation: 'Choose Structure, Voice, or Continuity.', nextMoves: ['Structure', 'Voice', 'Continuity'] } }
    : b.step(s, e, ev) })),
  'D-I9_FACET_CHANGES_SCOPE': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => { const t = b.step(s, e, ev);
    return e.type === 'SELECT_INTENT' && e.facet === 'direct' && t.name === 'SCOPE_PROPOSED' ? { ...t, suggested: { kind: 'range', sectionIds: ['ds-1', 'ds-2', 'ds-3', 'ds-4', 'ds-5', 'ds-6'] } } : t; } })),
  'D-I10_KEEP_WRITING_COMMISSIONS': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => {
    if (e.type === 'KEEP_WRITING' || (e.type === 'SELECT_INTENT' && e.intent === 'keep-writing')) { (b.commissions() as unknown as unknown[]).push({ requestId: 'bg', scope: lens(), authorizedBy: 'AUTHORIZE_READING' }); }
    return b.step(s, e, ev); } })),
  'D-I11_CAPABILITY_FALSE_SCOPE': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => { const t = b.step(s, e, ev);
    return t.name === 'SCOPE_PROPOSED' ? { ...t, response: { ...t.response, nextMoves: [...t.response.nextMoves, 'Read my whole manuscript'] } } : t; } })),
  'D-I12_NO_SAFE_RETURN': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => { const t = b.step(s, e, ev); return t.name === 'DECLINED' ? { ...t, nextMoves: [] } : t; } })),
  'D-I13_BROAD_SURVIVES_NARROWING': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => e.type === 'NARROW_SCOPE' && s.name === 'READ_PENDING' ? s : b.step(s, e, ev) })),
  'D-I14_NAVIGATION_COMMISSIONS': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => {
    if (e.type === 'OPEN_LENS' && s.name === 'SCOPE_PROPOSED') return b.step(s, { type: 'AUTHORIZE_READING', scope: s.suggested, clickId: `nav-${Math.random()}` }, ev);
    return b.step(s, e, ev); } })),
  'D-I15_DUPLICATE_PERMISSION': wrap((b) => ({ step: (s: State, e: Event, ev: Evidence) => e.type === 'AUTHORIZE_READING' ? b.step(s.name === 'READ_PENDING' ? { name: 'SCOPE_PROPOSED', place: s.place, intent: 'losing-the-thread', suggested: e.scope, response: { reflection: '', wayToLook: '', scopeNamed: e.scope, invitation: '', nextMoves: [] } } : s, { ...e, clickId: `dup-${Math.random()}` }, ev) : b.step(s, e, ev) })),
};
export const NAMED_KILL: Readonly<Record<string, string>> = {
  'D-I1_LENS_FIRST_DOOR': 'I1-front-door-is-human-language', 'D-I2_INTENT_AUTO_COMMISSIONS': 'I2-intent-is-not-commission',
  'D-I3_HIDDEN_SCOPE': 'I4-proposed-scope-is-named-and-possible', 'D-I4_WIDENS_AFTER_CONSENT': 'I6-narrowing-wins',
  'D-I5_INTENT_BECOMES_DIAGNOSIS': 'I3-reflect-before-route-and-never-diagnose', 'D-I6_FAKE_INSIGHT': 'I9-honest-insufficiency',
  'D-I7_UNNECESSARY_REREAD': 'I7-existing-evidence-first', 'D-I8_HELP_ME_LOOK_DEAD_END': 'I8-help-me-look-gives-a-move-not-a-menu',
  'D-I9_FACET_CHANGES_SCOPE': 'I10-facet-does-not-change-scope', 'D-I10_KEEP_WRITING_COMMISSIONS': 'I11-keep-writing-commissions-nothing-and-keeps-place',
  'D-I11_CAPABILITY_FALSE_SCOPE': 'I4-proposed-scope-is-named-and-possible', 'D-I12_NO_SAFE_RETURN': 'I12-every-response-offers-a-next-move',
  'D-I13_BROAD_SURVIVES_NARROWING': 'R13-broad-request-superseded-by-narrowing', 'D-I14_NAVIGATION_COMMISSIONS': 'R14-navigation-never-commissions',
  'D-I15_DUPLICATE_PERMISSION': 'R15-double-click-is-one-reading',
};
export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  /* ⚠️ Every entry below was CORRECTED by the first run. My predictions were
     written before the machines ran; the matrix reported which were stale and
     which real collateral I had missed. What stands is what the runs showed,
     each with the mechanism that makes it irreducible. */
  /* ⭐ A machine that reads on SELECT is in READ_PENDING immediately, so every
     law that inspects an ORIENTED / SCOPE_PROPOSED response finds no response;
     it also reads before authorization, rereads when evidence exists, and has
     already commissioned by the time navigation or Keep writing arrive. */
  'D-I2_INTENT_AUTO_COMMISSIONS': ['I3-reflect-before-route-and-never-diagnose', 'I4-proposed-scope-is-named-and-possible', 'I5-reading-begins-only-after-authorization', 'I7-existing-evidence-first', 'I8-help-me-look-gives-a-move-not-a-menu', 'I9-honest-insufficiency', 'I10-facet-does-not-change-scope', 'I11-keep-writing-commissions-nothing-and-keeps-place', 'I12-every-response-offers-a-next-move', 'R14-navigation-never-commissions'],
  'D-I3_HIDDEN_SCOPE': [],
  /* ⭐ A machine that invents a discovery when evidence is absent never reaches
     SCOPE_PROPOSED on the no-evidence fixture, so every proposal-shaped law
     fails with it — and R15's double-click has no proposal to authorize. */
  'D-I6_FAKE_INSIGHT': ['I3-reflect-before-route-and-never-diagnose', 'I4-proposed-scope-is-named-and-possible', 'I5-reading-begins-only-after-authorization', 'I6-narrowing-wins', 'I8-help-me-look-gives-a-move-not-a-menu', 'I10-facet-does-not-change-scope', 'R15-double-click-is-one-reading'],
  /* ⭐ help-me-look WITH evidence is the existing-evidence path; a rereader
     cannot take it. */
  'D-I7_UNNECESSARY_REREAD': ['I8-help-me-look-gives-a-move-not-a-menu'],
  /* ⭐ The dead end answers help-me-look with a lens menu regardless of
     evidence, so the honest-insufficiency reply for that intent is gone too. */
  'D-I8_HELP_ME_LOOK_DEAD_END': ['I9-honest-insufficiency'],
  'D-I9_FACET_CHANGES_SCOPE': [], 'D-I15_DUPLICATE_PERMISSION': [],
};
