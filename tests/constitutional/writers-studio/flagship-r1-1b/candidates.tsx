/** R1-1B — reference subject + fifteen founder-named defeat candidates. ⛔ Disposable. ⛔ Never a seed. */
import * as React from 'react';
import { FlagshipWriteView } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import { locationForSection } from '../../../../lib/writersStudio/placeInWork';
import { mapRealReview, type ReviewHostFacts } from '../../../../lib/writersStudio/studio/realReview';
import { ReviewPresentation, READ_ONLY_REVIEW_CAPABILITIES, type ReviewView } from '../../../../app/writers-studio/flagship/DevelopReview';
import { REVIEW } from '../../../../scripts/witness/flagship/fixtures';
import type { Subject, ReviewPorts, LoadResult, LiveState } from './laws';

const HOST_FILES = ['app/writers-studio/rebuild/FlagshipWriteHost.tsx', 'app/writers-studio/rebuild/liveReview.ts', 'app/writers-studio/rebuild/LiveReviewView.tsx', 'app/writers-studio/rebuild/page.tsx'];
/* Resolved structurally so the suite types before AND after the mount exists (known-bad RED first). */
type LiveModule = Partial<Pick<Subject, 'selectedReadingId' | 'load' | 'attach' | 'bindContext'>>;
type ViewModule = { LiveReviewView?: Subject['LiveView'] };
let live: LiveModule = {}; let viewMod: ViewModule = {};
try { live = require('../../../../app/writers-studio/rebuild/liveReview') as LiveModule; } catch { live = {}; }
try { viewMod = require('../../../../app/writers-studio/rebuild/LiveReviewView') as ViewModule; } catch { viewMod = {}; }

export const REFERENCE: Subject = {
  name: 'REFERENCE',
  selectedReadingId: live.selectedReadingId, load: live.load, attach: live.attach, bindContext: live.bindContext,
  placeAddress: locationForSection,
  LiveView: viewMod.LiveReviewView,
  HostView: FlagshipWriteView as Subject['HostView'],
  hostFiles: HOST_FILES,
};
const L = live; const V = viewMod.LiveReviewView;
const listOf = async (ports: ReviewPorts, m: string) => { const r = await ports.listReadings(m); return (r.json as { readings?: { id: string; frozenAt: string }[] }).readings ?? []; };
const mapOne = async (id: string, host: ReviewHostFacts, ports: ReviewPorts, bind = true): Promise<LoadResult> => {
  const summaries = await listOf(ports, host.manuscriptId);
  const one = await ports.getReading(host.manuscriptId, id);
  const m = mapRealReview({ summaries: summaries as never, selectedReadingId: id, payload: one.json, host });
  if (m.kind !== 'ready') return { kind: 'unavailable' };
  if (bind && L.bindContext && !L.bindContext(m.view).ok) return { kind: 'unavailable' };
  return { kind: 'ready', view: m.view, sourceReadingId: m.sourceReadingId };
};

/* D1 · auto-newest: nothing selected → the newest stored reading is loaded */
const D1: Subject = { ...REFERENCE, name: 'R1-1B-D1-auto-newest',
  load: async (id, host, ports) => { if (id) return L.load ? L.load(id, host, ports) : { kind: 'unavailable' }; const s = await listOf(ports, host.manuscriptId); const newest = [...s].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt))[0]; return newest ? mapOne(newest.id, host, ports) : { kind: 'idle' }; } };
/* D2 · fallback-to-first: the explicit reading is not listed → readings[0] */
const D2: Subject = { ...REFERENCE, name: 'R1-1B-D2-fallback-to-first',
  load: async (id, host, ports) => { if (!id) return { kind: 'idle' }; const s = await listOf(ports, host.manuscriptId); const target = s.some((x) => x.id === id) ? id : s[0]?.id; return target ? mapOne(target, host, ports) : { kind: 'unavailable' }; } };
/* D3 · aggregates: every listed reading is loaded and their findings merged */
const D3: Subject = { ...REFERENCE, name: 'R1-1B-D3-aggregates',
  load: async (id, host, ports) => { if (!id) return { kind: 'idle' }; const s = await listOf(ports, host.manuscriptId); if (!s.some((x) => x.id === id)) return { kind: 'unavailable' }; const parts = await Promise.all(s.map((x) => mapOne(x.id, host, ports))); const ready = parts.filter((p): p is Extract<LoadResult, { kind: 'ready' }> => p.kind === 'ready'); if (!ready[0]) return { kind: 'unavailable' }; return { kind: 'ready', sourceReadingId: id, view: { ...ready[0].view, findings: ready.flatMap((p) => p.view.findings) } }; } };
/* D4 · commissions on open when the reading is unavailable */
const D4: Subject = { ...REFERENCE, name: 'R1-1B-D4-commissions-on-open',
  load: async (id, host, ports) => { const r = L.load ? await L.load(id, host, ports) : { kind: 'unavailable' as const }; if (r.kind === 'unavailable') await (ports as ReviewPorts & { commission(): Promise<void> }).commission(); return r; } };
/* D5 · cognition on open */
const D5: Subject = { ...REFERENCE, name: 'R1-1B-D5-cognition-on-open',
  load: async (id, host, ports) => { if (!id) return { kind: 'idle' }; await (ports as ReviewPorts & { cognition(): Promise<void> }).cognition(); return L.load ? L.load(id, host, ports) : { kind: 'unavailable' }; } };
/* D6 · member write on open */
const D6: Subject = { ...REFERENCE, name: 'R1-1B-D6-member-write-on-open',
  load: async (id, host, ports) => { if (!id) return { kind: 'idle' }; const r = L.load ? await L.load(id, host, ports) : { kind: 'unavailable' as const }; await (ports as ReviewPorts & { write(): Promise<void> }).write(); return r; } };
/* D7 · non-ready mounts anyway: the mapper's refusal is overridden with whatever the payload holds */
const D7: Subject = { ...REFERENCE, name: 'R1-1B-D7-nonready-mounts-review',
  load: async (id, host, ports) => { if (!id) return { kind: 'idle' }; const s = await listOf(ports, host.manuscriptId); if (!s.some((x) => x.id === id)) return { kind: 'unavailable' }; const r = await mapOne(id, host, ports); if (r.kind === 'ready') return r; return { kind: 'ready', sourceReadingId: id, view: { ...REVIEW, work: host.work, kind: host.kind, scope: host.scope, context: host.context, findings: [], lenses: [], map: undefined, changed: undefined, citations: undefined } }; } };
/* D8 · wrong-Work reading mounts: the host identity is cast to the reading's */
const D8: Subject = { ...REFERENCE, name: 'R1-1B-D8-wrong-work-reading',
  load: async (id, host, ports) => { if (!id) return { kind: 'idle' }; const summaries = await listOf(ports, host.manuscriptId); if (!summaries.some((x) => x.id === id)) return { kind: 'unavailable' }; const one = await ports.getReading(host.manuscriptId, id); const rm = (one.json as { reading?: { manuscriptId?: string } })?.reading?.manuscriptId; const cast = rm ? { ...host, manuscriptId: rm } : host; const m = mapRealReview({ summaries: summaries as never, selectedReadingId: id, payload: one.json, host: cast }); if (m.kind !== 'ready') return { kind: 'unavailable' }; if (L.bindContext && !L.bindContext(m.view).ok) return { kind: 'unavailable' }; return { kind: 'ready', view: m.view, sourceReadingId: m.sourceReadingId }; } };
/* D9 · unavailable state discloses the reason */
const D9: Subject = { ...REFERENCE, name: 'R1-1B-D9-unowned-reading-disclosed',
  LiveView: (p) => (p.state.kind === 'unavailable'
    ? <div className="fs-pane" data-review="unavailable" data-reason={p.state.detail}><p>{p.state.detail === 'wrong_work' ? 'This reading belongs to another Work.' : 'This reading was not found in your ledger.'}</p></div>
    : V ? <V {...p} /> : null) };
/* D10 · a legacy Review bridge (originally "a visible Review destination"; under R1-1C succession the visible destination is lawful and the legacy href is what still kills) */
const D10: Subject = { ...REFERENCE, name: 'R1-1B-D10-visible-review-nav',
  HostView: (p) => (p.review && p.review.kind !== 'idle'
    ? <><nav aria-label="Studio navigation"><a className="fs-nav" data-nav="review" href="/writers-studio/review">Review</a></nav><FlagshipWriteView {...p} /></>
    : <FlagshipWriteView {...p} />) };
/* D11 · a second composer that drops `reading` */
const D11: Subject = { ...REFERENCE, name: 'R1-1B-D11-reading-param-dropped',
  placeAddress: (pathname, search, sectionId) => { const q = new URLSearchParams(search); const m = q.get('m'); return `${pathname}?${m ? `m=${encodeURIComponent(m)}&` : ''}s=${encodeURIComponent(sectionId)}`; } };
/* D12 · late result attaches to whatever reading is current */
const D12: Subject = { ...REFERENCE, name: 'R1-1B-D12-late-reading-migration',
  attach: (_pending, current) => current.readingId !== null };
/* D13 · fake context: the second paragraph stands in for an absent return address */
const D13: Subject = { ...REFERENCE, name: 'R1-1B-D13-fake-context-fallback',
  bindContext: () => ({ ok: true }),
  load: async (id, host, ports) => { if (!id) return { kind: 'idle' }; const s = await listOf(ports, host.manuscriptId); if (!s.some((x) => x.id === id)) return { kind: 'unavailable' }; return mapOne(id, host, ports, false); } };
/* D14 · fixture fallback: unavailable renders the controlled REVIEW fixture */
const D14: Subject = { ...REFERENCE, name: 'R1-1B-D14-fixture-fallback',
  hostFiles: [...HOST_FILES, 'tests/constitutional/writers-studio/flagship-r1-1b/candidates/D14_FixtureFallbackView.tsx'],
  LiveView: (p) => (p.state.kind === 'unavailable' ? <ReviewPresentation view={REVIEW as ReviewView} lens="all" capabilities={READ_ONLY_REVIEW_CAPABILITIES} /> : V ? <V {...p} /> : null) };
/* D15 · reading GETs without a selection: the ledger is pre-fetched on every open */
const D15: Subject = { ...REFERENCE, name: 'R1-1B-D15-read-gets-without-reading-param',
  load: async (id, host, ports) => { await ports.listReadings(host.manuscriptId); return L.load ? L.load(id, host, ports) : { kind: 'unavailable' }; } };

/* D16 · a facet selector drawn in the read-only posture — a control with no authority behind it */
const D16: Subject = { ...REFERENCE, name: 'R1-1B-D16-facet-control-in-read-only',
  LiveView: (p) => (p.state.kind === 'ready'
    ? <><button type="button" className="fs-facet" data-facet="guided">Guided</button>{V ? <V {...p} /> : null}</>
    : V ? <V {...p} /> : null) };

export const DEFEAT_CANDIDATES: readonly Subject[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15, D16];
export const NAMED_KILL: Record<string, string> = {
  'R1-1B-D1-auto-newest': 'R1-1B-L1-no-auto-newest',
  'R1-1B-D2-fallback-to-first': 'R1-1B-L2-no-fallback-to-first',
  'R1-1B-D3-aggregates': 'R1-1B-L3-no-aggregation',
  'R1-1B-D4-commissions-on-open': 'R1-1B-L4-no-commission-on-open',
  'R1-1B-D5-cognition-on-open': 'R1-1B-L5-no-cognition-on-open',
  'R1-1B-D6-member-write-on-open': 'R1-1B-L6-no-member-write-on-open',
  'R1-1B-D7-nonready-mounts-review': 'R1-1B-L7-nonready-never-mounts',
  'R1-1B-D8-wrong-work-reading': 'R1-1B-L8-wrong-work-never-mounts',
  'R1-1B-D9-unowned-reading-disclosed': 'R1-1B-L9-unavailable-discloses-nothing',
  'R1-1B-D10-visible-review-nav': 'R1-1B-L10-no-legacy-review-navigation',
  'R1-1B-D11-reading-param-dropped': 'R1-1B-L11-reading-param-survives-place-rewrite',
  'R1-1B-D12-late-reading-migration': 'R1-1B-L12-late-result-cannot-migrate',
  'R1-1B-D13-fake-context-fallback': 'R1-1B-L13-no-fake-context',
  'R1-1B-D14-fixture-fallback': 'R1-1B-L14-no-fixture-fallback',
  'R1-1B-D15-read-gets-without-reading-param': 'R1-1B-L15-no-reading-gets-without-selection',
  'R1-1B-D16-facet-control-in-read-only': 'R1-1B-L18-ready-mounts-read-only-presentation',
};
export const CLASSIFIED: Record<string, readonly string[]> = {
  /* IRREDUCIBLE. Choosing the newest reading with nothing selected REQUIRES reading the ledger without a selection. */
  'R1-1B-D1-auto-newest': ['R1-1B-L15-no-reading-gets-without-selection'],
  /* IRREDUCIBLE. wrong_work and an unbound context are two of the non-ready outcomes a non-ready mount necessarily mounts. */
  'R1-1B-D7-nonready-mounts-review': ['R1-1B-L8-wrong-work-never-mounts', 'R1-1B-L13-no-fake-context'],
  /* IRREDUCIBLE. Rendering the fixture Review on an unavailable state IS mounting a presentation on a
     non-ready result (L7), and a whole fixture Review can never be the one calm sentence L9 requires the
     unavailable state to be — its prose trips the disclosure detector by being prose at all. */
  'R1-1B-D14-fixture-fallback': ['R1-1B-L7-nonready-never-mounts', 'R1-1B-L9-unavailable-discloses-nothing'],
};
