/** C1B — reference subject + nine defeat candidates. ⛔ Disposable. ⛔ Never a seed. */
import * as React from 'react';
import { FlagshipWriteView, authoredBodyProps, truthfulStatus, type FlagshipWriteViewProps } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import { WriteFrame } from '../../../../app/writers-studio/flagship/WriteFrame';
import { StudioShell } from '../../../../app/writers-studio/flagship/StudioChrome';
import type { Subject } from './laws';

const HOST = ['app/writers-studio/rebuild/FlagshipWriteHost.tsx', 'app/writers-studio/rebuild/page.tsx'];
export const REFERENCE: Subject = { name: 'REFERENCE', View: FlagshipWriteView, authoredBodyProps, truthfulStatus, hostFiles: HOST };

/* D1 · static flagship manuscript — the route renders paragraphs, not the substrate */
const D1: Subject = { ...REFERENCE, name: 'C1B-D1-static-flagship-manuscript',
  View: (p: FlagshipWriteViewProps) => (
    <StudioShell current="write" destinations={['write']} affordance="orientation">
      <WriteFrame place={{ work: p.workTitle ?? undefined }} status={truthfulStatus([], p.context.version)}>
        {p.context.sections.map((s) => <p key={s.draftSectionId} className="fs-p" data-paragraph={s.draftSectionId}>{s.body}</p>)}
      </WriteFrame>
    </StudioShell>
  ) };

/* D2 · second writing session — a host file that builds its own session */
const D2: Subject = { ...REFERENCE, name: 'C1B-D2-second-writing-session',
  hostFiles: [...HOST, 'tests/constitutional/writers-studio/flagship-c1b/candidates/D2_SecondSessionHost.tsx'] };

/* D3 · false saved state — the fixture phrase wearing a live status */
const D3: Subject = { ...REFERENCE, name: 'C1B-D3-false-saved-state',
  truthfulStatus: (statuses, version) => (statuses.includes('conflict') ? 'Needs attention' : `Saved 2m ago · v${version}`) };

/* D4 · fabricated presentation fact — fill what the host does not have */
const D4: Subject = { ...REFERENCE, name: 'C1B-D4-fabricated-presentation-fact',
  View: (p: FlagshipWriteViewProps) => <FlagshipWriteView {...p} workTitle={p.workTitle ?? 'Untitled manuscript'} workForm={p.workForm ?? 'Novel'} /> };

/* D5 · dead production control — the reference toolbar drawn live */
const D5: Subject = { ...REFERENCE, name: 'C1B-D5-dead-production-control',
  View: (p: FlagshipWriteViewProps) => (
    <>
      <div className="fs-bar"><button type="button" className="fs-tool">Aa</button><button type="button" className="fs-tool fs-tool--key">Ask MAIA</button></div>
      <FlagshipWriteView {...p} />
    </>
  ) };

/* D6 · legacy mode bridge — Develop/Review linked to the legacy rooms */
const D6: Subject = { ...REFERENCE, name: 'C1B-D6-legacy-mode-bridge',
  View: (p: FlagshipWriteViewProps) => (
    <>
      <nav aria-label="Studio navigation"><a href="/writers-studio/develop">Develop</a><a href="/writers-studio/review">Review</a></nav>
      <FlagshipWriteView {...p} />
    </>
  ) };

/* D7 · save regression — the surface edits a local copy, never the session */
const D7: Subject = { ...REFERENCE, name: 'C1B-D7-save-regression',
  authoredBodyProps: (writing, section, held, hooks) => {
    let local = writing.bodyOf(section.draftSectionId);
    return { ...authoredBodyProps(writing, section, held, hooks), onEdit: (body) => { local = body; }, onCaptureBeforeBlur: (body) => { local = body; void local; } };
  } };

/* D8 · passage-selection regression — the address is rounded to words */
const D8: Subject = { ...REFERENCE, name: 'C1B-D8-passage-selection-regression',
  authoredBodyProps: (writing, section, held, hooks) => ({
    ...authoredBodyProps(writing, section, held, hooks),
    onSelectPassage: (start, end, text) => hooks.onHold(section.draftSectionId, Math.max(0, start - 1), end + 1, text),
  }) };

/* D9 · visual fallback — the legacy three-region workbench as the primary Write */
const D9: Subject = { ...REFERENCE, name: 'C1B-D9-visual-fallback',
  View: (p: FlagshipWriteViewProps) => (
    <main className="fs-tokens">
      <header className="wsr-header"><nav className="wsr-modebar" /></header>
      <div className="wsr-grid">
        <aside className="wsr-outline" />
        <div className="wsr-manuscript"><FlagshipWriteView {...p} /></div>
        <aside className="wsr-maia" />
      </div>
    </main>
  ) };

export const DEFEAT_CANDIDATES: readonly Subject[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9];
export const NAMED_KILL: Readonly<Record<string, string>> = {
  'C1B-D1-static-flagship-manuscript': 'C1B-L1-live-authorship-in-flagship-geometry',
  'C1B-D2-second-writing-session': 'C1B-L2-single-writing-session',
  'C1B-D3-false-saved-state': 'C1B-L3-truthful-status',
  'C1B-D4-fabricated-presentation-fact': 'C1B-L4-no-fabricated-presentation-fact',
  'C1B-D5-dead-production-control': 'C1B-L5-no-dead-production-control',
  'C1B-D6-legacy-mode-bridge': 'C1B-L6-no-legacy-mode-bridge',
  'C1B-D7-save-regression': 'C1B-L7-save-wiring-to-existing-session',
  'C1B-D8-passage-selection-regression': 'C1B-L8-passage-address-exact',
  'C1B-D9-visual-fallback': 'C1B-L9-not-the-legacy-workbench',
};
export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  // A static surface has no passage to hold, so no held address can ever render.
  // R1-1C SUCCESSION (2026-09-23): D1 was authored under the predecessor C1B-L6 regime and renders the predecessor
  // Write-only shell verbatim; under the successor law its navigation set is the predecessor's — IRREDUCIBLE without
  // rewriting the historical candidate, which is not done. Its named kill (L1) is unchanged.
  'C1B-D1-static-flagship-manuscript': ['C1B-L6-no-legacy-mode-bridge', 'C1B-L8-passage-address-exact'],
  // A bridge to the legacy rooms IS an anchor on the live page; L5 counts it.
  'C1B-D6-legacy-mode-bridge': ['C1B-L5-no-dead-production-control'],
};
