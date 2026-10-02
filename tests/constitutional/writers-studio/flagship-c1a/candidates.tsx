/**
 * C1A — reference subject + eight defeat candidates. Each candidate replaces
 * exactly ONE member of the reference subject with the smallest competent
 * embodiment of its named error. ⛔ Disposable. ⛔ Never a seed.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as React from 'react';
import { WriteFrame, type WriteFrameProps } from '../../../../app/writers-studio/flagship/WriteFrame';
import { WriteRoom } from '../../../../app/writers-studio/flagship/WriteRoom';
import { StudioShell, StudioRail, AtmosphereBand, MobileNav } from '../../../../app/writers-studio/flagship/StudioChrome';
import * as adapter from '../../../../lib/writersStudio/studio/adapters/writeView';
import RebuildAuthoredBody from '../../../../app/writers-studio/rebuild/RebuildAuthoredBody';
import type { ChapterSpan, RebuildSection } from '../../../../lib/writersStudio/rebuild/model';
import { SECTION, type FrameLike, type Subject } from './laws';

const noop = () => {};
const CSS = readFileSync(join(process.cwd(), 'app/writers-studio/flagship/flagship.css'), 'utf8');

/** The reference host: the frame around the PROVEN authorship substrate. */
function liveHost(Frame: FrameLike): React.ReactElement {
  return (
    <Frame place={{ work: 'The River Between', chapter: 'Chapter One' }} heading={{ chapterTitle: 'Chapter One' }}>
      <RebuildAuthoredBody section={SECTION} body={SECTION.body} held={null}
        onEdit={noop} onEditingBegan={noop} onFocusPlace={noop} onCaptureBeforeBlur={noop} onSelectPassage={noop} />
    </Frame>
  );
}

export const REFERENCE: Subject = {
  name: 'REFERENCE',
  Frame: WriteFrame, frameFile: 'app/writers-studio/flagship/WriteFrame.tsx',
  host: liveHost, Shell: StudioShell, css: CSS, adapter, Room: WriteRoom,
};

/* D1 · static body replacement — the host hands the frame fixture paragraphs */
const D1: Subject = { ...REFERENCE, name: 'C1A-D1-static-body-replacement',
  host: (Frame) => (
    <Frame place={{ work: 'The River Between' }}>
      <p className="fs-p" data-paragraph="p1">{SECTION.body}</p>
    </Frame>
  ) };

/* D2 · second save owner — a frame that persists on its own */
const D2: Subject = { ...REFERENCE, name: 'C1A-D2-second-save-owner',
  frameFile: 'tests/constitutional/writers-studio/flagship-c1a/candidates/D2_SaveOwnerFrame.tsx' };

/* D3 · dead control — a frame that renders the witness toolbar verbatim */
const D3: Subject = { ...REFERENCE, name: 'C1A-D3-dead-control',
  frameFile: 'tests/constitutional/writers-studio/flagship-c1a/candidates/D3_DeadControlFrame.tsx',
  Frame: (p: WriteFrameProps) => (
    <WriteFrame {...p} actions={<><button type="button" className="fs-tool">Aa</button><button type="button" className="fs-tool">Comment</button></>} />
  ) };

/* D4 · legacy nav bridge — the shell links Develop/Review to the legacy rooms */
const LEGACY: Record<string, string> = { develop: '/writers-studio/develop', review: '/writers-studio/review' };
const D4Shell: typeof StudioShell = ({ current, project, member, focus = false, destinations = ['write', 'develop', 'review'], children }) => (
  <div className="fs-root" data-focus={focus ? 'true' : 'false'} data-studio-mode={current}>
    <StudioRail current={current} project={project} member={member} destinations={destinations} />
    <div className="fs-content"><AtmosphereBand />{children}</div>
    <nav aria-label="Legacy bridge">
      {destinations.filter((d) => d in LEGACY).map((d) => <a key={d} href={LEGACY[d]}>{d}</a>)}
    </nav>
    <MobileNav current={current} destinations={destinations} />
  </div>
);
const D4: Subject = { ...REFERENCE, name: 'C1A-D4-legacy-nav-bridge', Shell: D4Shell };

/* D5 · token duplication — a second live token declaration for the Write host */
const D5: Subject = { ...REFERENCE, name: 'C1A-D5-token-duplication',
  css: CSS + '\n.ws-live-write{--ground-work:#F7F4ED;--text-primary:#26231E;--action:#2F5D86}\n' };

/* D6 · fabricated view fact — the adapter fills absent fields with plausible values */
const D6adapter: typeof adapter = {
  ...adapter,
  toWritePlace: (i: { workTitle: string; section: RebuildSection | null; span: ChapterSpan | null }) => ({
    work: i.workTitle,
    chapter: i.span?.root.heading ?? 'Chapter 1',
    place: i.section?.heading ?? `§ ${(i.section?.position ?? 0) + 1}`,
  }),
  toWriteHeading: (span: ChapterSpan | null) => ({
    chapterTitle: span?.root.heading ?? 'Untitled chapter',
    epigraph: { text: 'Every river remembers its source.', attribution: 'MAIA' },
  }),
};
const D6: Subject = { ...REFERENCE, name: 'C1A-D6-fabricated-view-fact', adapter: D6adapter };

/* D7 · second state owner — a frame that keeps the held passage itself */
const D7: Subject = { ...REFERENCE, name: 'C1A-D7-second-state-owner',
  frameFile: 'tests/constitutional/writers-studio/flagship-c1a/candidates/D7_StateOwnerFrame.tsx' };

/* D8 · visual regression — an extraction that quietly drops the footer tool */
const D8Room: typeof WriteRoom = (props) => {
  const html = WriteRoom(props);
  return React.cloneElement(html, { foot: { ...(html.props as WriteFrameProps).foot, actions: null } });
};
const D8: Subject = { ...REFERENCE, name: 'C1A-D8-visual-regression', Room: D8Room };

export const DEFEAT_CANDIDATES: readonly Subject[] = [D1, D2, D3, D4, D5, D6, D7, D8];

export const NAMED_KILL: Readonly<Record<string, string>> = {
  'C1A-D1-static-body-replacement': 'C1A-L1-host-body-is-live-authorship',
  'C1A-D2-second-save-owner': 'C1A-L2-frame-persists-nothing',
  'C1A-D3-dead-control': 'C1A-L3-no-forced-dead-control',
  'C1A-D4-legacy-nav-bridge': 'C1A-L4-no-legacy-nav-bridge',
  'C1A-D5-token-duplication': 'C1A-L5-tokens-declared-once-on-token-root',
  'C1A-D6-fabricated-view-fact': 'C1A-L6-adapter-conserves-truth',
  'C1A-D7-second-state-owner': 'C1A-L7-frame-owns-no-state',
  'C1A-D8-visual-regression': 'C1A-L8-controlled-witness-unchanged',
};
export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {};
