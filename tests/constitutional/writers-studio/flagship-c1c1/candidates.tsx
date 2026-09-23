/** C1C1 — reference subject + thirteen founder-named defeat candidates. ⛔ Disposable. ⛔ Never a seed. */
import * as React from 'react';
import { FlagshipWriteView, type FlagshipWriteViewProps } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import { DiscussLayer, type DiscussLayerProps } from '../../../../app/writers-studio/rebuild/DiscussLayer';
import { ContextualMaiaPanel } from '../../../../app/writers-studio/flagship/ContextualMaiaPanel';
import {
  commissionDiscuss, createInFlightGuard, settleWritingSession, resultAttaches, resolveAttachment, runDiscussAct,
  DISCUSS_SCOPE, DISCUSS_COPY, lastMaiaTurn, type DiscussPorts, type DiscussHeld, type InFlightGuard,
} from '../../../../app/writers-studio/rebuild/discussAct';
import * as act from '../../../../app/writers-studio/rebuild/discussAct';
import { locateUniquePassage } from '../../../../lib/writersStudio/rebuild/editorialCollaboration';
import type { Subject } from './laws';

/** R1-3 · resolved structurally so the suite typechecks before AND after the repair lands. */
const discussAfterHold = (act as unknown as { discussAfterHold?: Subject['discussAfterHold'] }).discussAfterHold;

const HOST = [
  'app/writers-studio/rebuild/FlagshipWriteHost.tsx',
  'app/writers-studio/rebuild/page.tsx',
  'app/writers-studio/rebuild/discussAct.ts',
  'app/writers-studio/rebuild/DiscussLayer.tsx',
  'app/writers-studio/flagship/ContextualMaiaPanel.tsx',
];
export const REFERENCE: Subject = {
  name: 'REFERENCE', View: FlagshipWriteView, Layer: DiscussLayer, Panel: ContextualMaiaPanel,
  commission: commissionDiscuss, createGuard: createInFlightGuard, settle: settleWritingSession,
  resultAttaches, discussAfterHold, resolveAttachment, scope: DISCUSS_SCOPE, hostFiles: HOST,
};
const ONE: readonly string[] = ['Discuss'];
const acted = (t: string) => ({ threadId: 'th-1', locusText: 'far bank', reply: t });
/** The reference's own changed-passage handling, so a narrowed candidate embodies ONLY its named error. */
const staleOf = (p: DiscussLayerProps, d: Extract<NonNullable<DiscussLayerProps['discuss']>, { kind: 'answered' }>) => {
  const at = locateUniquePassage(p.liveBodyOf(d.held.sectionId), d.locusText);
  return {
    state: at ? 'answered' : 'answered-stale',
    trail: at ? undefined : <p className="fs-say" data-notice="true" data-stale-context="true">{DISCUSS_COPY.stale}</p>,
  };
};

/* D1 · Discuss through /focus — the crossing answers, no passage thread is opened */
const D1: Subject = { ...REFERENCE, name: 'C1C1-D1-focus-discuss',
  commission: async (guard, held, ask, ports) => {
    if (!guard.acquire()) return { ok: false, stage: 'in_flight', copy: DISCUSS_COPY.busy };
    try {
      const posture = ports.readPosture();
      if (!posture.resolved || posture.sanctuary) return { ok: false, stage: 'posture', copy: DISCUSS_COPY.postureUnresolved };
      /* the focus seam: a disclosure crossing keyed to nothing — no thread, no locus, no version */
      const focusReply = `Focus reading of "${held.text}": ${ask}`;
      return { ok: true, ...acted(focusReply) };
    } finally { guard.release(); }
  } };

/* D2 · fabricated Observation — the reply rendered as "What I notice" */
const D2: Subject = { ...REFERENCE, name: 'C1C1-D2-fabricated-observation',
  Layer: (p: DiscussLayerProps) => {
    if (!p.discuss || p.discuss.kind !== 'answered' || p.discuss.held.sectionId !== p.focusSectionId) return React.createElement(DiscussLayer, p);
    const d = p.discuss; const st = staleOf(p, d);
    return (
      <ContextualMaiaPanel state={st.state} heldEcho={d.held.text} memberAsk={d.ask} tabs={ONE} activeTab="Discuss" onRelease={p.onRelease}
        supplemental={{ trail: <><p className="fs-notice"><strong>What I notice</strong></p><ul><li>{d.reply}</li></ul>{st.trail}</> }} />
    );
  } };

/* D3 · a second held-passage owner */
const D3: Subject = { ...REFERENCE, name: 'C1C1-D3-second-held-passage-owner',
  hostFiles: [...HOST, 'tests/constitutional/writers-studio/flagship-c1c1/candidates/D3_SecondPassageOwner.tsx'] };

/* D4 · client-inferred flag — Ask MAIA whenever a passage is held, plus a 404 probe host */
const D4: Subject = { ...REFERENCE, name: 'C1C1-D4-client-inferred-flag',
  View: (p: FlagshipWriteViewProps) => <FlagshipWriteView {...p} editorialEnabled={p.held !== null} />,
  hostFiles: [...HOST, 'tests/constitutional/writers-studio/flagship-c1c1/candidates/D4_FlagProbeHost.tsx'] };

/* D5 · stale / omitted posture — a constant ordinary posture, never read at the gesture */
const D5: Subject = { ...REFERENCE, name: 'C1C1-D5-stale-posture',
  commission: (guard, held, ask, ports) => commissionDiscuss(guard, held, ask, { ...ports, readPosture: () => ({ resolved: true, sanctuary: false }) }) };

/* D6 · Discuss produces a proposal — the scope releases the sequence gate */
const D6: Subject = { ...REFERENCE, name: 'C1C1-D6-discuss-proposes',
  commission: (guard, held, ask, ports) => commissionDiscuss(guard, held, ask, {
    ...ports,
    sendTurn: (threadId, sectionId, text, posture) => ports.sendTurn(threadId, sectionId, text, posture,
      { latitude: 3, mayRemoveParagraphs: true, mayProposeImmediately: true } as unknown as typeof DISCUSS_SCOPE),
  }) };

/* D7 · extra tabs — the five reference tabs drawn live, four of them dead */
const D7: Subject = { ...REFERENCE, name: 'C1C1-D7-extra-tabs',
  Layer: (p: DiscussLayerProps) => {
    if (!p.discuss || p.discuss.held.sectionId !== p.focusSectionId) return null;
    const d = p.discuss; const st = d.kind === 'answered' ? staleOf(p, d) : { state: d.kind, trail: undefined };
    return (
      <ContextualMaiaPanel state={st.state} heldEcho={d.held.text} memberAsk={'ask' in d ? d.ask : undefined}
        tabs={['Discuss', 'Revise', 'Teach', 'Reason', 'What MAIA read']} activeTab="Discuss" onRelease={p.onRelease}
        message={d.kind === 'answered' ? { text: d.reply, speaker: 'maia' } : undefined}
        supplemental={st.trail ? { trail: st.trail } : undefined}
        composer={d.kind === 'composing' ? <form><textarea name="ask" /><button type="submit" data-event="SUBMIT_ASK">Ask</button></form> : undefined} />
    );
  } };

/* D8 · late result migrates — it attaches wherever a section is visible */
const D8: Subject = { ...REFERENCE, name: 'C1C1-D8-late-result-migrates',
  resultAttaches: (_pending, current) => current.focusSectionId !== null };

/* D9 · changed passage silently re-anchored — first occurrence wins, fuzzy on absence */
const D9: Subject = { ...REFERENCE, name: 'C1C1-D9-silent-reanchor',
  resolveAttachment: (liveBody, locusText) => {
    const at = liveBody.indexOf(locusText);
    if (at >= 0) { const start = [...liveBody.slice(0, at)].length; return { kind: 'attached', start, end: start + [...locusText].length }; }
    const head = locusText.split(' ')[0] ?? '';
    const near = liveBody.indexOf(head);
    if (near >= 0) { const start = [...liveBody.slice(0, near)].length; return { kind: 'attached', start, end: start + [...locusText].length }; }
    return { kind: 'attached', start: 0, end: [...locusText].length };
  } };

/* D10 · release claims cancellation */
const D10: Subject = { ...REFERENCE, name: 'C1C1-D10-release-claims-cancellation',
  Layer: (p: DiscussLayerProps) => {
    if (!p.discuss || p.discuss.held.sectionId !== p.focusSectionId) return null;
    const d = p.discuss; const st = d.kind === 'answered' ? staleOf(p, d) : { state: d.kind, trail: undefined };
    return (
      <aside className="fs-maia" data-discuss={st.state}>
        <button type="button" className="fs-mx" data-event="RELEASE" aria-label="Cancel request" onClick={p.onRelease}>✕</button>
        <div className="fs-tabs" role="tablist"><button type="button" role="tab" className="fs-tab" aria-selected="true" data-tab="Discuss">Discuss</button></div>
        {'ask' in d ? <div className="fs-ask">{d.ask}</div> : null}
        {d.kind === 'answered' ? <p className="fs-say">{d.reply}</p> : null}
        {st.trail}
        {d.kind === 'composing' ? <div className="fs-minput"><form><textarea name="ask" /><button type="submit" data-event="SUBMIT_ASK">Ask</button></form></div> : null}
      </aside>
    );
  } };

/* D11 · duplicate submit — a guard that arms itself asynchronously (the React-state shape) */
const D11: Subject = { ...REFERENCE, name: 'C1C1-D11-async-submit-guard',
  createGuard: (): InFlightGuard => {
    let busy = false;
    return {
      acquire: () => { if (busy) return false; void Promise.resolve().then(() => { busy = true; }); return true; },
      release: () => { busy = false; },
      held: () => busy,
    };
  } };

/* D12 · dirty-passage open — the revision is read and the passage opened before settlement */
const D12: Subject = { ...REFERENCE, name: 'C1C1-D12-open-before-settlement',
  commission: async (guard, held: DiscussHeld, ask, ports: DiscussPorts) => {
    if (!guard.acquire()) return { ok: false, stage: 'in_flight', copy: DISCUSS_COPY.busy };
    try {
      const posture = ports.readPosture();
      if (!posture.resolved) return { ok: false, stage: 'posture', copy: DISCUSS_COPY.postureUnresolved };
      if (posture.sanctuary) return { ok: false, stage: 'sanctuary', copy: DISCUSS_COPY.sanctuary };
      const revisionNumber = ports.session.currentRevisionId();
      const opened = await ports.openPassage(held.sectionId, { start: held.start, end: held.end }, revisionNumber, posture);
      if (!opened.ok) return { ok: false, stage: 'open', copy: DISCUSS_COPY.failed };
      const sent = await ports.sendTurn(opened.thread.threadId, held.sectionId, ask, posture, DISCUSS_SCOPE);
      if (!sent.ok) return { ok: false, stage: 'turn', copy: DISCUSS_COPY.failed };
      const reply = lastMaiaTurn(sent.thread.turns);
      return reply === null ? { ok: false, stage: 'reply', copy: DISCUSS_COPY.failed } : { ok: true, threadId: sent.thread.threadId, locusText: sent.thread.locusText, reply };
    } finally { guard.release(); }
  } };

/* D13 · second-turn composer — the answered panel still invites another turn */
const D13: Subject = { ...REFERENCE, name: 'C1C1-D13-second-turn-composer',
  Layer: (p: DiscussLayerProps) => {
    if (!p.discuss || p.discuss.kind !== 'answered' || p.discuss.held.sectionId !== p.focusSectionId) return React.createElement(DiscussLayer, p);
    const d = p.discuss; const st = staleOf(p, d);
    return (
      <ContextualMaiaPanel state={st.state} heldEcho={d.held.text} memberAsk={d.ask} tabs={ONE} activeTab="Discuss" onRelease={p.onRelease}
        message={{ text: d.reply, speaker: 'maia' }} supplemental={st.trail ? { trail: st.trail } : undefined}
        composer={<form><textarea name="ask" /><button type="submit" data-event="SUBMIT_ASK">Ask</button></form>} />
    );
  } };

/* D14 · trims the member's ask — normalizes the bytes before the act */
const D14: Subject = { ...REFERENCE, name: 'C1C1-D14-trims-member-ask',
  commission: (guard, held, ask, ports) => commissionDiscuss(guard, held, ask.trim().replace(/\s+/g, ' '), ports) };

/* D15 · accepts an unexpected proposal — launders the version material and reports success */
const D15: Subject = { ...REFERENCE, name: 'C1C1-D15-accepts-unexpected-proposal',
  commission: (guard, held, ask, ports) => commissionDiscuss(guard, held, ask, {
    ...ports,
    sendTurn: async (...args) => {
      const r = await ports.sendTurn(...args);
      return r.ok ? { ...r, producedVersionId: null, thread: { ...r.thread, versions: [] } } : r;
    },
  }) };

/* D16 · section-only result identity — a result attaches to whatever passage is now held in the section */
const D16: Subject = { ...REFERENCE, name: 'C1C1-D16-section-only-result-identity',
  resultAttaches: (pending, current) => pending.gen === current.gen && current.focusSectionId === pending.held.sectionId,
  discussAfterHold: (discuss, next) => (discuss && discuss.held.sectionId === next.sectionId ? discuss : null) };

void runDiscussAct;
export const DEFEAT_CANDIDATES: readonly Subject[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16];
export const NAMED_KILL: Record<string, string> = {
  'C1C1-D1-focus-discuss': 'C1C1-L1-passage-bound-thread-not-focus',
  'C1C1-D2-fabricated-observation': 'C1C1-L2-no-observation-fabrication',
  'C1C1-D3-second-held-passage-owner': 'C1C1-L3-single-held-passage-owner',
  'C1C1-D4-client-inferred-flag': 'C1C1-L4-flag-is-server-presentation-state',
  'C1C1-D5-stale-posture': 'C1C1-L5-gesture-posture-carried-to-both-calls',
  'C1C1-D6-discuss-proposes': 'C1C1-L6-discuss-cannot-propose',
  'C1C1-D7-extra-tabs': 'C1C1-L7-discuss-only-tab',
  'C1C1-D8-late-result-migrates': 'C1C1-L8-late-result-bound-to-gesture',
  'C1C1-D9-silent-reanchor': 'C1C1-L9-changed-passage-not-reanchored',
  'C1C1-D10-release-claims-cancellation': 'C1C1-L10-release-not-cancellation',
  'C1C1-D11-async-submit-guard': 'C1C1-L11-duplicate-submit-synchronous',
  'C1C1-D12-open-before-settlement': 'C1C1-L12-settle-before-open',
  'C1C1-D13-second-turn-composer': 'C1C1-L13-one-turn-only',
  'C1C1-D14-trims-member-ask': 'C1C1-L17-member-bytes-preserved',
  'C1C1-D15-accepts-unexpected-proposal': 'C1C1-L18-unexpected-proposal-fails-closed',
  'C1C1-D16-section-only-result-identity': 'C1C1-L19-same-section-passage-change-detaches',
};
/** Irreducible collateral, each with the reason removing it would make the candidate stop embodying its error. */
export const CLASSIFIED: Record<string, readonly string[]> = {
  /* IRREDUCIBLE. A Discuss routed through /focus opens no passage thread and sends no
     turn, so every law that measures the thread call — posture carried to it (L5), the
     withholding scope on it (L6), exactly one concurrent send (L11), settlement before
     the open (L12), exactly one turn (L13) — necessarily fails. Making D1 call
     `openPassage`/`sendTurn` would make it stop being the /focus candidate. */
  'C1C1-D1-focus-discuss': [
    'C1C1-L5-gesture-posture-carried-to-both-calls', 'C1C1-L6-discuss-cannot-propose',
    'C1C1-L11-duplicate-submit-synchronous', 'C1C1-L12-settle-before-open', 'C1C1-L13-one-turn-only',
    /* R1: the same reason — no send means no bytes reach sendTurn (L17) and no send result to
       check for proposal material (L18). */
    'C1C1-L17-member-bytes-preserved', 'C1C1-L18-unexpected-proposal-fails-closed',
  ],
  /* IRREDUCIBLE. A result identity that ignores the commissioning gesture ignores the passage
     that commissioned it; making D8 honour the exact passage would make it stop migrating. */
  'C1C1-D8-late-result-migrates': ['C1C1-L19-same-section-passage-change-detaches'],
  /* ⚠️ INHERITED, ⛔ NOT IRREDUCIBLE — RAISED FOR FOUNDER RULING (R1). D12 was written as the
     pre-R1 reference minus settlement, so it also carries that reference's two R1 defects
     (no emptiness predicate → L17; no proposal backstop → L18). Narrowing it to embody only
     its named error is a one-line edit, withheld because R1 forbade rewriting the accepted
     thirteen. The matrix therefore reports this collateral as classified BY INHERITANCE. */
  'C1C1-D12-open-before-settlement': ['C1C1-L17-member-bytes-preserved', 'C1C1-L18-unexpected-proposal-fails-closed'],
};
