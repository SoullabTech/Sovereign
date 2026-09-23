/** R1-1C — reference subject + fifteen founder-named defeat candidates. ⛔ Disposable. ⛔ Never a seed. */
import * as React from 'react';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { FlagshipWriteView } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import { locationForSection } from '../../../../lib/writersStudio/placeInWork';
import { READ_ONLY_REVIEW_CAPABILITIES } from '../../../../app/writers-studio/flagship/DevelopReview';
import type { Subject, Summary, HostProps, StudioMode, NavRequest } from './laws';

const ROOT = process.cwd();
const HOST_FILES = [
  'app/writers-studio/rebuild/FlagshipWriteHost.tsx', 'app/writers-studio/rebuild/reviewNavigation.ts', 'app/writers-studio/rebuild/ReviewChooser.tsx',
  'app/writers-studio/flagship/StudioChrome.tsx', 'app/writers-studio/rebuild/page.tsx',
];
/* Resolved structurally so the suite types before AND after the succession exists (known-bad RED first). */
type NavModule = Partial<Pick<Subject, 'studioMode' | 'enterReview' | 'chooseReading' | 'shouldLoadChoices' | 'navActionsFor' | 'attachChoices' | 'locationForWrite' | 'locationForReading'>> & { loadReadingChoices?: Subject['loadChoices'] };
type ChooserModule = { ReviewChooser?: Subject['Chooser'] };
let nav: NavModule = {}; let chooserMod: ChooserModule = {};
try { nav = require('../../../../app/writers-studio/rebuild/reviewNavigation') as NavModule; } catch { nav = {}; }
try { chooserMod = require('../../../../app/writers-studio/rebuild/ReviewChooser') as ChooserModule; } catch { chooserMod = {}; }

export const REFERENCE: Subject = {
  name: 'REFERENCE',
  studioMode: nav.studioMode, enterReview: nav.enterReview, chooseReading: nav.chooseReading, loadChoices: nav.loadReadingChoices,
  shouldLoadChoices: nav.shouldLoadChoices, navActionsFor: nav.navActionsFor, attachChoices: nav.attachChoices,
  locationForWrite: nav.locationForWrite, locationForReading: nav.locationForReading,
  placeAddress: locationForSection,
  Chooser: chooserMod.ReviewChooser,
  HostView: FlagshipWriteView as unknown as Subject['HostView'],
  capabilities: READ_ONLY_REVIEW_CAPABILITIES as unknown as Readonly<Record<string, boolean>>,
  hostFiles: HOST_FILES,
};
const N = nav; const C = chooserMod.ReviewChooser; const H = FlagshipWriteView as unknown as (p: HostProps) => React.ReactElement;
const newest = (l: readonly Summary[]) => [...l].sort((a, b) => b.frozenAt.localeCompare(a.frozenAt))[0];

/* D1 · auto-newest on Review: the writer chooses Review with no reading; the newest reading opens itself */
const D1: Subject = { ...REFERENCE, name: 'R1-1C-D1-auto-newest-on-review',
  enterReview: (reading, ledger) => { if (reading) return { kind: 'review', readingId: reading }; const n = ledger ? newest(ledger) : undefined; return n ? { kind: 'review', readingId: n.id } : { kind: 'choose' }; } };
/* D2 · auto-first on Review: the first ledger result becomes the selection */
const D2: Subject = { ...REFERENCE, name: 'R1-1C-D2-auto-first-on-review',
  enterReview: (reading, ledger) => { if (reading) return { kind: 'review', readingId: reading }; const f = ledger?.[0]; return f ? { kind: 'review', readingId: f.id } : { kind: 'choose' }; } };
/* D3 · Review commissions: nothing to choose, so Review navigation commissions a reading — and the chooser offers it */
const D3: Subject = { ...REFERENCE, name: 'R1-1C-D3-review-commissions',
  loadChoices: async (m, ports) => { const r = N.loadReadingChoices ? await N.loadReadingChoices(m, ports) : { kind: 'unavailable' as const }; if (r.kind === 'choices' && r.readings.length === 0) await (ports as typeof ports & { commission(): Promise<void> }).commission(); return r; },
  Chooser: (p) => (p.state.kind === 'choices' && p.state.readings.length === 0
    ? <div className="fs-pane" data-review="choose"><button type="button" data-commission="work">Read this Work</button></div>
    : C ? <C {...p} /> : null) };
/* D4 · chooser aggregates: every listed reading is fetched and their findings rendered together */
const D4: Subject = { ...REFERENCE, name: 'R1-1C-D4-chooser-aggregates',
  loadChoices: async (m, ports) => { const r = N.loadReadingChoices ? await N.loadReadingChoices(m, ports) : { kind: 'unavailable' as const }; if (r.kind === 'choices') await Promise.all(r.readings.map((x) => ports.getReading(m, x.id))); return r; },
  Chooser: (p) => (p.state.kind === 'choices'
    ? <div className="fs-pane" data-review="ready">{p.state.readings.map((r) => <div key={r.id} data-finding={`dobs_${r.id}`}>Observation of {r.id}.</div>)}</div>
    : C ? <C {...p} /> : null) };
/* D5 · eager ledger GET: ordinary Write pre-fetches the readings because Review navigation now exists */
const D5: Subject = { ...REFERENCE, name: 'R1-1C-D5-eager-reading-get',
  shouldLoadChoices: (req: NavRequest) => !req.reading };
/* D6 · navigation bypasses R1-0: a choice mounts a presentation built from the chooser's own data */
const D6: Subject = { ...REFERENCE, name: 'R1-1C-D6-nav-bypasses-r1-0',
  chooseReading: (id, loc) => ({ kind: 'navigate', href: N.locationForReading ? N.locationForReading(loc.pathname, loc.search, id) : `?reading=${id}`, view: { work: 'The River Between', findings: [] } }) as never };
/* D7 · navigation fallback: the selected reading is unavailable, so the host opens another one from the chooser */
const D7: Subject = { ...REFERENCE, name: 'R1-1C-D7-nav-fallback',
  HostView: (p) => (p.review && p.review.kind === 'unavailable' && p.chooser && p.chooser.kind === 'choices' && p.chooser.readings[0]
    ? <H {...p} review={{ kind: 'loading', readingId: p.chooser.readings[0].id, gen: p.review.gen }} />
    : <H {...p} />) };
/* D8 · legacy Review bridge: a compatibility link to the legacy Review room */
const D8: Subject = { ...REFERENCE, name: 'R1-1C-D8-legacy-review-bridge',
  HostView: (p) => <><nav aria-label="Studio navigation"><a className="fs-nav" data-nav="review" href="/writers-studio/review">Review</a></nav><H {...p} /></> };
/* D9 · duplicate state authority: a second mode store that outranks the URL */
const D9: Subject = { ...REFERENCE, name: 'R1-1C-D9-duplicate-state-authority',
  studioMode: (req: NavRequest): StudioMode => (req.chooserOpen ? 'review-choose' : req.reading ? 'review' : 'write') };
/* D10 · Write return mutates: returning to Write records standing on the way out */
const D10: Subject = { ...REFERENCE, name: 'R1-1C-D10-write-return-mutates',
  navActionsFor: (mode, loc, act) => { const a = N.navActionsFor ? N.navActionsFor(mode, loc, act) : {}; const w = a.write; if (!w || w.kind !== 'link') return a; return { ...a, write: { ...w, onSelect: (e) => { (act as typeof act & { write(): void }).write(); w.onSelect?.(e); } } }; } };
/* D11 · capability widening: the navigation act turns the facet dial on for read-only Review */
const D11: Subject = { ...REFERENCE, name: 'R1-1C-D11-capability-widening',
  capabilities: { ...(READ_ONLY_REVIEW_CAPABILITIES as unknown as Record<string, boolean>), facet: true },
  HostView: (p) => (p.review && p.review.kind === 'ready'
    ? <><button type="button" className="fs-facet" data-facet="guided">Guided</button><H {...p} /></>
    : <H {...p} />) };
/* D12 · silent C1B rewrite: the predecessor law is rewritten with no successor named and no predecessor witnessed */
const c1bPath = join(ROOT, 'tests/constitutional/writers-studio/flagship-c1b/laws.ts');
const c1bNow = existsSync(c1bPath) ? readFileSync(c1bPath, 'utf8') : '';
const D12: Subject = { ...REFERENCE, name: 'R1-1C-D12-silent-c1b-rewrite',
  c1bLawsSource: c1bNow.replace(/R1-1C-L1-successor-navigation/g, 'navigation').replace(/git show 4dade9a68[^']*'/g, "'").replace(/4dade9a68/g, '') };
/* D13 · refresh loses selection: a place rewrite composes the address from scratch and drops `reading` */
const D13: Subject = { ...REFERENCE, name: 'R1-1C-D13-refresh-loses-selection',
  placeAddress: (pathname, search, sectionId) => { const q = new URLSearchParams(search); const m = q.get('m'); return `${pathname}?${m ? `m=${encodeURIComponent(m)}&` : ''}s=${encodeURIComponent(sectionId)}`; } };
/* D14 · direct link forced through the chooser: an explicit reading still enters the selection state */
const D14: Subject = { ...REFERENCE, name: 'R1-1C-D14-direct-link-chooser-regression',
  enterReview: () => ({ kind: 'choose' }),
  studioMode: (req: NavRequest): StudioMode => (req.chooserOpen ? 'review-choose' : req.reading ? 'review' : 'write') };
/* D15 · re-freeze omits R1 laws: a successor manifest that quietly leaves the governing R1-1B laws unfrozen */
const manifestPath = join(ROOT, 'tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json');
const manifestNow = existsSync(manifestPath) ? (JSON.parse(readFileSync(manifestPath, 'utf8')) as { frozen?: Record<string, unknown> }) : {};
const weaker = { ...manifestNow, frozen: { ...(manifestNow.frozen ?? {}) } };
delete weaker.frozen['tests/constitutional/writers-studio/flagship-r1-1b/laws.ts'];
const D15: Subject = { ...REFERENCE, name: 'R1-1C-D15-refreeze-omits-r1-laws', manifest: weaker };

export const DEFEAT_CANDIDATES: readonly Subject[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11, D12, D13, D14, D15];
export const NAMED_KILL: Record<string, string> = {
  'R1-1C-D1-auto-newest-on-review': 'R1-1C-L2-review-entry-selects-nothing',
  'R1-1C-D2-auto-first-on-review': 'R1-1C-L2-review-entry-selects-nothing',
  'R1-1C-D3-review-commissions': 'R1-1C-L3-review-entry-never-commissions',
  'R1-1C-D4-chooser-aggregates': 'R1-1C-L4-chooser-does-not-aggregate',
  'R1-1C-D5-eager-reading-get': 'R1-1C-L5-ordinary-write-zero-retrieval',
  'R1-1C-D6-nav-bypasses-r1-0': 'R1-1C-L6-choice-is-a-location-never-a-mount',
  'R1-1C-D7-nav-fallback': 'R1-1C-L7-unavailable-never-substitutes',
  'R1-1C-D8-legacy-review-bridge': 'R1-1C-L8-no-legacy-review-bridge',
  'R1-1C-D9-duplicate-state-authority': 'R1-1C-L9-url-is-the-single-state-authority',
  'R1-1C-D10-write-return-mutates': 'R1-1C-L10-write-return-non-mutating',
  'R1-1C-D11-capability-widening': 'R1-1C-L11-read-only-capabilities-unchanged',
  'R1-1C-D12-silent-c1b-rewrite': 'R1-1C-L12-c1b-succession-explicit',
  'R1-1C-D13-refresh-loses-selection': 'R1-1C-L13-place-navigation-keeps-reading',
  'R1-1C-D14-direct-link-chooser-regression': 'R1-1C-L14-direct-link-bypasses-chooser',
  'R1-1C-D15-refreeze-omits-r1-laws': 'R1-1C-L15-refreeze-carries-governing-laws',
};
export const CLASSIFIED: Record<string, readonly string[]> = {
  /* IRREDUCIBLE. Offering a commission control on an empty ledger is a control the ledger does not hold (L17) —
     a Review that commissions cannot avoid drawing the commission. */
  'R1-1C-D3-review-commissions': ['R1-1C-L17-chooser-offers-only-what-the-ledger-holds'],
  /* IRREDUCIBLE. A chooser that renders merged findings offers what the ledger does not hold (L17). */
  'R1-1C-D4-chooser-aggregates': ['R1-1C-L17-chooser-offers-only-what-the-ledger-holds'],
  /* IRREDUCIBLE. A legacy bridge is an extra navigation entry: it breaks the bounded successor set (L1) and moves the goldens (L16). */
  'R1-1C-D8-legacy-review-bridge': ['R1-1C-L1-successor-navigation', 'R1-1C-L16-successor-write-goldens'],
  /* IRREDUCIBLE. A store that outranks the URL forces an explicit reading through the chooser — the direct-link regression (L14). */
  'R1-1C-D9-duplicate-state-authority': ['R1-1C-L14-direct-link-bypasses-chooser'],
  /* IRREDUCIBLE. Forcing an explicit reading through the chooser is the same store outranking the URL (L9), and an entry that never
     carries the explicit identity is an entry that selects nothing even when something was selected — L2 cannot tell the difference. */
  'R1-1C-D14-direct-link-chooser-regression': ['R1-1C-L9-url-is-the-single-state-authority'],
};
