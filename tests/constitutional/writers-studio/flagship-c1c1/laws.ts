/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1C1 — LAWS over the Discuss-only contextual MAIA.
 *
 * A subject is: the live composition (`View`), the pure layer (`Layer`), the
 * pure panel (`Panel`), the act (`commission` · `createGuard` · `settle` ·
 * `resultAttaches` · `resolveAttachment` · `scope`), and the host source files
 * the static laws read. The reference is the real code; each defeat candidate
 * replaces exactly one member.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ContextReady, FlagshipWriteViewProps, HeldPassageAt } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import type { DiscussLayerProps, DiscussState } from '../../../../app/writers-studio/rebuild/DiscussLayer';
import type { ContextualMaiaPanelProps } from '../../../../app/writers-studio/flagship/ContextualMaiaPanel';
import type {
  commissionDiscuss as CommissionFn, createInFlightGuard as GuardFn, settleWritingSession as SettleFn,
  resultAttaches as AttachesFn, resolveAttachment as ResolveFn, DiscussPorts, DISCUSS_SCOPE as ScopeT,
} from '../../../../app/writers-studio/rebuild/discussAct';
import type { RebuildSection } from '../../../../lib/writersStudio/rebuild/model';
import type { CurrentPostureRead } from '../../../../lib/sanctuary/currentClientPosture';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }
export interface Subject {
  readonly name: string;
  readonly View: (p: FlagshipWriteViewProps) => React.ReactElement;
  readonly Layer: (p: DiscussLayerProps) => React.ReactElement | null;
  readonly Panel: (p: ContextualMaiaPanelProps) => React.ReactElement;
  readonly commission: typeof CommissionFn;
  readonly createGuard: typeof GuardFn;
  readonly settle: typeof SettleFn;
  readonly resultAttaches: typeof AttachesFn;
  readonly resolveAttachment: typeof ResolveFn;
  readonly scope: typeof ScopeT;
  /** repo-relative host sources the static laws scan (page.tsx is the flag boundary) */
  readonly hostFiles: readonly string[];
}

const ROOT = process.cwd();
/** ⭐ Every static scan strips comments first — prose documenting a prohibition must never read as the prohibited thing. */
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const law = (id: string, body: () => LawResult): LawResult => {
  try { return body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; }
};
const alaw = async (id: string, body: () => Promise<LawResult>): Promise<LawResult> => {
  try { return await body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; }
};
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });

/* ── fixtures ────────────────────────────────────────────────────────────── */
export const ROOT_SECTION: RebuildSection = {
  draftSectionId: 'd-root', sourceSectionId: 's-root', position: 1, heading: 'Chapter 1', headingDepth: 1, headingSignal: 'chapter',
  body: 'The water held the last of the light.', editable: true,
};
export const BODY2 = 'Nothing moved on the far bank. She waited for the sound to come back.';
export const SECTION: RebuildSection = {
  draftSectionId: 'd-2', sourceSectionId: 's-2', position: 2, heading: 'The river at dusk', headingDepth: 2, headingSignal: 'markdown',
  body: BODY2, editable: true,
};
export const CONTEXT: ContextReady = {
  state: 'section_aware', manuscriptId: 'ms-1', title: 'The River Between', version: 7, updatedAt: '2026-09-23T00:00:00.000Z',
  sections: [ROOT_SECTION, SECTION],
};
export const HELD: HeldPassageAt = { sectionId: 'd-2', start: 21, end: 29, text: 'far bank' };
const ASK = 'Why does this sentence feel flat?';
const REPLY = 'The sentence names an absence, and absences read flat unless something is listening for them.';
const noop = () => {};
const ANSWERED: DiscussState = { kind: 'answered', held: HELD, ask: ASK, threadId: 'th-1', locusText: 'far bank', reply: REPLY };
const COMPOSING: DiscussState = { kind: 'composing', held: HELD };
const PENDING: DiscussState = { kind: 'pending', held: HELD, ask: ASK, gen: 1 };
const REFUSED: DiscussState = { kind: 'refused', held: HELD, ask: ASK, copy: 'MAIA couldn’t finish that response. Your Work was not changed.' };
const baseProps = (over: Partial<FlagshipWriteViewProps> = {}): FlagshipWriteViewProps => ({
  context: CONTEXT, workTitle: 'The River Between', workForm: null, focusId: 'd-2', held: HELD, onFocus: noop, onHold: noop, ...over,
});
const layerProps = (discuss: DiscussState | null, over: Partial<DiscussLayerProps> = {}): DiscussLayerProps => ({
  discuss, focusSectionId: 'd-2', liveBodyOf: () => BODY2, onSubmit: noop, onRelease: noop, ...over,
});

/* ── a fake session + ports the act laws drive ───────────────────────────── */
export interface Trace { readonly calls: string[]; readonly postures: CurrentPostureRead[]; readonly scopes: unknown[]; readonly revisions: number[]; readonly texts: string[] }
export function fakePorts(opts: {
  posture?: CurrentPostureRead; unsavedUntilFlush?: boolean; conflict?: boolean;
  slow?: () => Promise<void>; replyTurns?: readonly { speaker: 'author' | 'maia'; body: string }[];
} = {}): { ports: DiscussPorts; trace: Trace } {
  const trace: Trace = { calls: [], postures: [], scopes: [], revisions: [], texts: [] };
  let unsaved = opts.unsavedUntilFlush ?? false;
  let revision = 4;
  const posture: CurrentPostureRead = opts.posture ?? { resolved: true, sanctuary: false };
  const session = {
    sections: [{ id: 'd-root', position: 1, heading: 'Chapter 1', body: '', editable: true }, { id: 'd-2', position: 2, heading: 'The river at dusk', body: BODY2, editable: true }],
    statusOf: () => (opts.conflict ? 'conflict' : 'saved') as 'conflict' | 'saved',
    flushPending: () => { trace.calls.push('flushPending'); if (unsaved) { unsaved = false; revision = 5; } },
    hasUnsavedWork: () => { trace.calls.push(`hasUnsavedWork:${unsaved}`); return unsaved; },
    currentRevisionId: () => { trace.calls.push(`currentRevisionId:${revision}`); return revision; },
  };
  const thread = (turns: readonly { speaker: 'author' | 'maia'; body: string }[]) => ({
    threadId: 'th-1', chainId: 'ch-1', locusText: 'far bank', targetSectionId: 'd-2', sectionLabel: 'The river at dusk', legacyLocus: false,
    turns: turns.map((t, i) => ({ turnIndex: i, speaker: t.speaker, body: t.body, at: 'now' })), versions: [], headVersionId: null,
  });
  const ports: DiscussPorts = {
    readPosture: () => { trace.calls.push('readPosture'); return posture; },
    session: session as unknown as DiscussPorts['session'],
    openPassage: async (sectionId, range, revisionNumber, p) => {
      trace.calls.push(`openPassage:${sectionId}:${range.start}:${range.end}:${revisionNumber}`); trace.postures.push(p); trace.revisions.push(revisionNumber);
      if (opts.slow) await opts.slow();
      return { ok: true, thread: thread([]) };
    },
    sendTurn: async (threadId, sectionId, text, p, scope) => {
      trace.calls.push(`sendTurn:${threadId}:${sectionId}`); trace.postures.push(p); trace.scopes.push(scope); trace.texts.push(text);
      if (opts.slow) await opts.slow();
      return { ok: true, thread: thread(opts.replyTurns ?? [{ speaker: 'author', body: text }, { speaker: 'maia', body: REPLY }]), producedVersionId: null, voice: null };
    },
    settle: undefined,
  };
  return { ports, trace };
}
const FAST = { timeoutMs: 200, now: (() => { let t = 0; return () => (t += 10); })(), sleep: async () => {} };

export async function runC1C1Laws(s: Subject): Promise<LawResult[]> {
  const out: LawResult[] = [];
  const hostSrc = Object.fromEntries(s.hostFiles.map((f) => [f, strip(readFileSync(join(ROOT, f), 'utf8'))])) as Record<string, string>;
  const allHost = Object.values(hostSrc).join('\n');
  const nonPage = Object.entries(hostSrc).filter(([f]) => !f.endsWith('/page.tsx')).map(([, v]) => v).join('\n');
  const render = (el: React.ReactElement | null) => (el ? renderToStaticMarkup(el) : '');
  const view = (p: Partial<FlagshipWriteViewProps> = {}) => render(React.createElement(s.View, baseProps(p)));
  const layer = (d: DiscussState | null, over: Partial<DiscussLayerProps> = {}) => render(React.createElement(s.Layer, layerProps(d, over)));
  const enabled = (over: Partial<FlagshipWriteViewProps> = {}) => view({ editorialEnabled: true, ...over });

  out.push(await alaw('C1C1-L1-passage-bound-thread-not-focus', async () => {
    const { ports, trace } = fakePorts();
    const r = await s.commission(s.createGuard(), HELD, ASK, ports);
    const opens = trace.calls.filter((c) => c.startsWith('openPassage:'));
    const sends = trace.calls.filter((c) => c.startsWith('sendTurn:'));
    const staticOk = !/\/focus\b|performFocusCrossing|maiaResponse/.test(allHost);
    const exact = opens[0] === 'openPassage:d-2:21:29:4' && sends[0] === 'sendTurn:th-1:d-2' && trace.texts[0] === ASK;
    return must('C1C1-L1-passage-bound-thread-not-focus', r.ok && opens.length === 1 && sends.length === 1 && exact && staticOk,
      `ok=${r.ok} opens=${opens.length} sends=${sends.length} exact=${exact} noFocusSeam=${staticOk}`);
  }));

  out.push(law('C1C1-L2-no-observation-fabrication', () => {
    const html = layer(ANSWERED) + enabled({ discuss: ANSWERED });
    const forbidden = /What I notice|Observation|Reasoning|Teaching|fs-notice|data-coverage|data-non-conclusions|fs-carried|fs-limit/;
    const said = html.includes(`<p class="fs-say">${REPLY}</p>`);
    return must('C1C1-L2-no-observation-fabrication', said && !forbidden.test(html), `verbatimReply=${said} fabricated=${forbidden.test(html)}`);
  }));

  out.push(law('C1C1-L3-single-held-passage-owner', () => {
    const owners = (allHost.match(/useState<HeldPassageAt/g) ?? []).length;
    const second = /PassageRef|useState<\{\s*sectionId[^}]*start[^}]*end/.test(allHost);
    return must('C1C1-L3-single-held-passage-owner', owners === 1 && !second, `useState<HeldPassageAt>=${owners} secondOwner=${second}`);
  }));

  out.push(law('C1C1-L4-flag-is-server-presentation-state', () => {
    const off = (view({ editorialEnabled: false }).match(/data-event="ASK_MAIA"/g) ?? []).length;
    const omitted = (view().match(/data-event="ASK_MAIA"/g) ?? []).length;
    const on = (enabled().match(/data-event="ASK_MAIA"/g) ?? []).length;
    const offPanel = /fs-maia/.test(view({ editorialEnabled: false, discuss: ANSWERED }));
    const page = hostSrc['app/writers-studio/rebuild/page.tsx'] ?? '';
    const pageReads = (page.match(/process\.env\.WRITERS_STUDIO_EDITORIAL_ENABLED === '1'/g) ?? []).length;
    const clientReads = /process\.env|NEXT_PUBLIC|status === 404|\.status === 404|api\/writers-studio\/editorial/.test(nonPage);
    return must('C1C1-L4-flag-is-server-presentation-state', off === 0 && omitted === 0 && on === 1 && !offPanel && pageReads === 1 && !clientReads,
      `askOff=${off} askOmitted=${omitted} askOn=${on} panelWhileOff=${offPanel} pageReads=${pageReads} clientInference=${clientReads}`);
  }));

  out.push(await alaw('C1C1-L5-gesture-posture-carried-to-both-calls', async () => {
    const live = fakePorts();
    await s.commission(s.createGuard(), HELD, ASK, live.ports);
    const reads = live.trace.calls.filter((c) => c === 'readPosture').length;
    const same = live.trace.postures.length === 2 && live.trace.postures[0] === live.trace.postures[1];
    const un = fakePorts({ posture: { resolved: false, reason: 'no_live_settings' } });
    const unR = await s.commission(s.createGuard(), HELD, ASK, un.ports);
    const sanc = fakePorts({ posture: { resolved: true, sanctuary: true } });
    const sancR = await s.commission(s.createGuard(), HELD, ASK, sanc.ports);
    const noPost = (t: Trace) => !t.calls.some((c) => c.startsWith('openPassage') || c.startsWith('sendTurn'));
    const staticOk = /readCurrentSanctuaryPosture/.test(nonPage) && !/defaultMemoryMode|maia_account_settings/.test(allHost);
    return must('C1C1-L5-gesture-posture-carried-to-both-calls',
      reads === 1 && same && !unR.ok && noPost(un.trace) && !sancR.ok && noPost(sanc.trace) && staticOk,
      `reads=${reads} sameObject=${same} unresolvedRefused=${!unR.ok} sanctuaryRefused=${!sancR.ok} noPostOnRefusal=${noPost(un.trace) && noPost(sanc.trace)} gestureReader=${staticOk}`);
  }));

  out.push(await alaw('C1C1-L6-discuss-cannot-propose', async () => {
    const { ports, trace } = fakePorts();
    await s.commission(s.createGuard(), HELD, ASK, ports);
    const sent = JSON.stringify(trace.scopes[0]);
    const withheld = sent === JSON.stringify({ latitude: 1, mayRemoveParagraphs: false, mayProposeImmediately: false });
    const staticOk = !/editorial\/version|editorial\/adoption|editorial\/undo|adoptBoundEditorialVersion|mayProposeImmediately:\s*true/.test(allHost);
    const html = layer(ANSWERED) + enabled({ discuss: ANSWERED });
    const noApply = !/data-event="APPLY"|data-event="UNDO"|fs-alts|Use this revision/.test(html);
    return must('C1C1-L6-discuss-cannot-propose', withheld && staticOk && noApply, `scope=${sent} noProposalRoutes=${staticOk} noApplySurface=${noApply}`);
  }));

  out.push(law('C1C1-L7-discuss-only-tab', () => {
    const check = (html: string) => {
      const tabs = html.match(/role="tab"[^>]*>([^<]*)</g) ?? [];
      return tabs.length === 1 && /Discuss/.test(tabs[0] ?? '') && /aria-selected="true"/.test(tabs[0] ?? '') && !/disabled/.test(html);
    };
    const a = check(layer(ANSWERED)); const c = check(layer(COMPOSING)); const v = check(enabled({ discuss: ANSWERED }));
    return must('C1C1-L7-discuss-only-tab', a && c && v, `answered=${a} composing=${c} view=${v}`);
  }));

  out.push(law('C1C1-L8-late-result-bound-to-gesture', () => {
    const same = s.resultAttaches({ gen: 3, held: HELD }, { gen: 3, focusSectionId: 'd-2' });
    const released = s.resultAttaches({ gen: 3, held: HELD }, { gen: 4, focusSectionId: 'd-2' });
    const moved = s.resultAttaches({ gen: 3, held: HELD }, { gen: 3, focusSectionId: 'd-root' });
    const noFocus = s.resultAttaches({ gen: 3, held: HELD }, { gen: 3, focusSectionId: null });
    const layerMoved = layer(ANSWERED, { focusSectionId: 'd-root' }) === '';
    const viewMoved = !/fs-maia/.test(enabled({ discuss: ANSWERED, focusId: 'd-root', held: null }));
    return must('C1C1-L8-late-result-bound-to-gesture', same && !released && !moved && !noFocus && layerMoved && viewMoved,
      `same=${same} afterRelease=${released} afterMove=${moved} noFocus=${noFocus} layerHiddenOnOtherSection=${layerMoved} viewHidden=${viewMoved}`);
  }));

  out.push(law('C1C1-L9-changed-passage-not-reanchored', () => {
    const once = s.resolveAttachment(BODY2, 'far bank');
    const gone = s.resolveAttachment('Nothing moved on the near bank.', 'far bank');
    const twice = s.resolveAttachment('far bank and far bank', 'far bank');
    const attached = once.kind === 'attached' && once.start === 21 && once.end === 29;
    const html = layer(ANSWERED, { liveBodyOf: () => 'Nothing moved on the near bank.' });
    const staleShown = /data-stale-context="true"/.test(html) && /before your latest edit\. Your writing has not been changed\./.test(html) && /data-discuss="answered-stale"/.test(html);
    const viewHtml = enabled({ discuss: ANSWERED, context: { ...CONTEXT, sections: [ROOT_SECTION, { ...SECTION, body: 'Nothing moved on the near bank.' }] } });
    const noHighlight = !/data-held-passage-address="21:29"/.test(viewHtml) && /data-stale-context="true"/.test(viewHtml);
    const attachedHtml = layer(ANSWERED);
    const attachedOk = /data-discuss="answered"/.test(attachedHtml) && !/data-stale-context/.test(attachedHtml);
    return must('C1C1-L9-changed-passage-not-reanchored', attached && gone.kind === 'stale' && twice.kind === 'stale' && staleShown && noHighlight && attachedOk,
      `unique=${attached} absent=${gone.kind} duplicate=${twice.kind} staleCopy=${staleShown} noHighlightOnStale=${noHighlight} attachedClean=${attachedOk}`);
  }));

  out.push(law('C1C1-L10-release-not-cancellation', () => {
    const html = layer(PENDING) + layer(ANSWERED) + layer(COMPOSING) + layer(REFUSED);
    const release = (html.match(/data-event="RELEASE"[^>]*aria-label="Close MAIA"/g) ?? []).length === 4;
    const noCancel = !/cancel/i.test(html) && !/cancel/i.test(allHost.replace(/preventDefault/g, ''));
    return must('C1C1-L10-release-not-cancellation', release && noCancel, `releaseControls=${release} cancelVocabulary=${!noCancel}`);
  }));

  out.push(await alaw('C1C1-L11-duplicate-submit-synchronous', async () => {
    const g = s.createGuard();
    const first = g.acquire(); const second = g.acquire();
    g.release();
    let open: () => void = () => {};
    const gate = new Promise<void>((r) => { open = r; });
    const { ports, trace } = fakePorts({ slow: () => gate });
    const guard = s.createGuard();
    const p1 = s.commission(guard, HELD, ASK, ports);
    const p2 = s.commission(guard, HELD, ASK, ports);
    open();
    const [r1, r2] = await Promise.all([p1, p2]);
    const sends = trace.calls.filter((c) => c.startsWith('sendTurn')).length;
    const opens = trace.calls.filter((c) => c.startsWith('openPassage')).length;
    return must('C1C1-L11-duplicate-submit-synchronous', first && !second && r1.ok && !r2.ok && r2.stage === 'in_flight' && sends === 1 && opens === 1,
      `firstAcquire=${first} secondAcquireSameTick=${second} concurrentSends=${sends} concurrentOpens=${opens} secondStage=${r2.ok ? 'ok' : r2.stage}`);
  }));

  out.push(await alaw('C1C1-L12-settle-before-open', async () => {
    const dirty = fakePorts({ unsavedUntilFlush: true });
    const r = await s.commission(s.createGuard(), HELD, ASK, dirty.ports);
    const c = dirty.trace.calls;
    const flushAt = c.indexOf('flushPending'); const revAt = c.findIndex((x) => x.startsWith('currentRevisionId')); const openAt = c.findIndex((x) => x.startsWith('openPassage'));
    const ordered = flushAt >= 0 && revAt > flushAt && openAt > revAt && dirty.trace.revisions[0] === 5;
    const conflict = fakePorts({ conflict: true });
    const cr = await s.commission(s.createGuard(), HELD, ASK, conflict.ports);
    const refused = !cr.ok && cr.stage === 'settle' && !conflict.trace.calls.some((x) => x.startsWith('openPassage'));
    return must('C1C1-L12-settle-before-open', r.ok && ordered && refused,
      `flush<revision<open=${ordered} postSettleRevision=${dirty.trace.revisions[0]} conflictRefusedBeforeOpen=${refused}`);
  }));

  out.push(await alaw('C1C1-L13-one-turn-only', async () => {
    const html = layer(ANSWERED) + layer(PENDING) + layer(REFUSED);
    const noComposer = !/fs-minput|<textarea|SUBMIT_ASK|<form/.test(html);
    const composing = /SUBMIT_ASK/.test(layer(COMPOSING));
    const { ports, trace } = fakePorts();
    await s.commission(s.createGuard(), HELD, ASK, ports);
    const sends = trace.calls.filter((x) => x.startsWith('sendTurn')).length;
    return must('C1C1-L13-one-turn-only', noComposer && composing && sends === 1, `composerAfterTurn=${!noComposer} composerBeforeTurn=${composing} sends=${sends}`);
  }));

  out.push(law('C1C1-L14-authority-untouched', () => {
    const PIN = '8edca6c97';
    const files = [
      'app/writers-studio/rebuild/RebuildAuthoredBody.tsx', 'app/writers-studio/rebuild/RebuildWritingBoundary.tsx',
      'app/writers-studio/rebuild/RebuildStudioClient.tsx', 'lib/writersStudio/useSectionWriting.ts', 'lib/writersStudio/sectionSaveClient.ts',
      'lib/writersStudio/rebuild/editorialCollaboration.ts', 'lib/sanctuary/currentClientPosture.ts', 'lib/sanctuary/turnPosture.ts',
      'lib/writersStudio/studio/machine.ts', 'app/writers-studio/flagship/WriteFrame.tsx', 'app/writers-studio/flagship/StudioChrome.tsx',
      'app/api/writers-studio/editorial/turn/route.ts', 'app/api/writers-studio/editorial/thread/route.ts', 'app/api/writers-studio/rebuild/editorial/thread/route.ts',
      'app/api/writers-studio/editorial/version/route.ts', 'app/api/writers-studio/editorial/adoption/route.ts', 'app/api/writers-studio/editorial/undo/route.ts',
    ];
    const moved = files.filter((f) => execSync(`git rev-parse ${PIN}:${f}`, { cwd: ROOT, encoding: 'utf8' }).trim() !== execSync(`git hash-object ${f}`, { cwd: ROOT, encoding: 'utf8' }).trim());
    return must('C1C1-L14-authority-untouched', moved.length === 0, moved.length ? `moved: ${moved.join(', ')}` : `${files.length} files blob-identical to flagship head ${PIN}`);
  }));

  out.push(law('C1C1-L15-host-mounts-discuss-layer', () => {
    const host = hostSrc['app/writers-studio/rebuild/FlagshipWriteHost.tsx'] ?? '';
    const page = hostSrc['app/writers-studio/rebuild/page.tsx'] ?? '';
    const imports = /from '\.\/DiscussLayer'/.test(host) && /from '\.\/discussAct'/.test(host);
    const passes = /editorialEnabled=\{/.test(page);
    const html = enabled({ discuss: ANSWERED });
    const mounted = /data-discuss="answered"/.test(html) && html.includes(`<p class="fs-say">${REPLY}</p>`) && html.includes(`<div class="fs-ask">${ASK}</div>`);
    const composing = /SUBMIT_ASK/.test(enabled({ discuss: COMPOSING }));
    const askHiddenWhileOpen = !/ASK_MAIA/.test(enabled({ discuss: COMPOSING }));
    return must('C1C1-L15-host-mounts-discuss-layer', imports && passes && mounted && composing && askHiddenWhileOpen,
      `hostImports=${imports} pagePassesFlag=${passes} answeredRendered=${mounted} composerRendered=${composing} askHiddenWhilePanelOpen=${askHiddenWhileOpen}`);
  }));

  out.push(law('C1C1-L16-panel-and-layer-pure', () => {
    const panel = hostSrc['app/writers-studio/flagship/ContextualMaiaPanel.tsx'] ?? '';
    const lay = hostSrc['app/writers-studio/rebuild/DiscussLayer.tsx'] ?? '';
    const impure = /useState|useEffect|useRef|fetch\(|apiFetch|localStorage|editorialCollaboration|process\.env|randomUUID/;
    return must('C1C1-L16-panel-and-layer-pure', !impure.test(panel) && !impure.test(lay), `panelPure=${!impure.test(panel)} layerPure=${!impure.test(lay)}`);
  }));

  return out;
}
