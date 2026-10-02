/** R1-1A — reference subject + ten founder-named defeat candidates. ⛔ Disposable. ⛔ Never a seed. */
import * as React from 'react';
import * as DR from '../../../../app/writers-studio/flagship/DevelopReview';
import type { Subject, PresentationProps, Capabilities } from './laws';

const SEAM = ['app/writers-studio/flagship/DevelopReview.tsx', 'app/writers-studio/flagship/ReviewPanels.tsx', 'app/writers-studio/flagship/DevelopViews.tsx'];
/** Resolved structurally so the suite types before AND after the extraction lands (known-bad RED first). */
const mod = DR as unknown as {
  ReviewPresentation?: (p: PresentationProps) => React.ReactElement;
  READ_ONLY_REVIEW_CAPABILITIES?: Capabilities;
  CONTROLLED_REVIEW_CAPABILITIES?: Capabilities;
};
export const REFERENCE: Subject = {
  name: 'REFERENCE', Room: DR.ReviewRoom, Presentation: mod.ReviewPresentation,
  readOnly: mod.READ_ONLY_REVIEW_CAPABILITIES, controlled: mod.CONTROLLED_REVIEW_CAPABILITIES, seamFiles: SEAM,
};
const P = mod.ReviewPresentation;
const after = (extra: React.ReactElement) => (p: PresentationProps) => <>{P ? <P {...p} /> : null}{extra}</>;

const D1: Subject = { ...REFERENCE, name: 'R1-1A-D1-read-only-renders-ask-maia',
  Presentation: after(<button type="button" className="fs-tool fs-tool--key">Ask MAIA</button>) };
const D2: Subject = { ...REFERENCE, name: 'R1-1A-D2-read-only-renders-discuss',
  Presentation: after(<button type="button" className="fs-btn" data-action="discuss">Discuss</button>) };
const D3: Subject = { ...REFERENCE, name: 'R1-1A-D3-read-only-renders-explore',
  Presentation: after(<button type="button" className="fs-btn" data-action="explore">Explore</button>) };
const D4: Subject = { ...REFERENCE, name: 'R1-1A-D4-read-only-renders-commission-controls',
  Presentation: after(<button type="button" className="fs-goto" data-commission="arc">Read for this →</button>) };
const D5: Subject = { ...REFERENCE, name: 'R1-1A-D5-read-only-renders-member-write-controls',
  Presentation: after(<section className="fs-own"><h3>Add your own observation</h3><button type="button" className="fs-btn fs-btn--key">Keep with this passage</button></section>) };
const D6: Subject = { ...REFERENCE, name: 'R1-1A-D6-seam-fetches-itself',
  seamFiles: [...SEAM, 'tests/constitutional/writers-studio/flagship-r1-1a/candidates/D6_FetchingSeam.tsx'] };
const D7: Subject = { ...REFERENCE, name: 'R1-1A-D7-seam-invokes-cognition',
  seamFiles: [...SEAM, 'tests/constitutional/writers-studio/flagship-r1-1a/candidates/D7_CognitionSeam.tsx'] };
/* D8 · the controlled room re-rendered in the read-only posture — the accepted output changes */
const D8: Subject = { ...REFERENCE, name: 'R1-1A-D8-controlled-room-output-changes',
  Room: ((p: { view: DR.ReviewView; lens?: DR.LensId | 'all' }) => (P && mod.READ_ONLY_REVIEW_CAPABILITIES
    ? <P view={p.view} lens={p.lens} capabilities={mod.READ_ONLY_REVIEW_CAPABILITIES} />
    : <div data-room="rewritten" />)) as typeof DR.ReviewRoom };
/* D9 · the extraction claims a home inside an FS1-frozen artifact (a golden: pure, so only L9 speaks) */
const D9: Subject = { ...REFERENCE, name: 'R1-1A-D9-extraction-inside-frozen-artifact',
  seamFiles: [...SEAM, 'tests/constitutional/writers-studio/flagship-c1a/golden/1-write-rest.html'] };
/* D10 · a dead control in place of an omission */
const D10: Subject = { ...REFERENCE, name: 'R1-1A-D10-fake-disabled-control',
  Presentation: after(<button type="button" className="fs-btn" disabled aria-disabled="true">Unavailable here</button>) };

/* D11 · the withheld population leaks its machine addresses into writer-visible copy */
const D11: Subject = { ...REFERENCE, name: 'R1-1A-D11-withheld-leaks-machine-identity',
  Presentation: (p: PresentationProps) => (
    <>
      {P ? <P {...p} /> : null}
      {p.view.withheld?.map((w) => (
        <div key={w.observationId} className="fs-find" data-withheld-population="true" data-withheld={w.observationId}
          data-reading-id={w.readingId} data-observation-key={w.observationKey} data-withheld-reason={w.reason}>
          <div className="fs-ev"><span className="fs-chip">reading {w.readingId}</span><span className="fs-chip">{w.observationKey}</span><span className="fs-chip">{w.observationId}</span></div>
        </div>
      ))}
    </>
  ) };

export const DEFEAT_CANDIDATES: readonly Subject[] = [D1, D2, D3, D4, D5, D6, D7, D8, D9, D10, D11];
export const NAMED_KILL: Record<string, string> = {
  'R1-1A-D1-read-only-renders-ask-maia': 'R1-1A-L1-read-only-omits-ask-maia',
  'R1-1A-D2-read-only-renders-discuss': 'R1-1A-L2-read-only-omits-discuss',
  'R1-1A-D3-read-only-renders-explore': 'R1-1A-L3-read-only-omits-explore',
  'R1-1A-D4-read-only-renders-commission-controls': 'R1-1A-L4-read-only-omits-commission-controls',
  'R1-1A-D5-read-only-renders-member-write-controls': 'R1-1A-L5-read-only-omits-member-write-controls',
  'R1-1A-D6-seam-fetches-itself': 'R1-1A-L6-seam-fetches-nothing',
  'R1-1A-D7-seam-invokes-cognition': 'R1-1A-L7-seam-invokes-no-cognition',
  'R1-1A-D8-controlled-room-output-changes': 'R1-1A-L8-controlled-review-room-byte-identical',
  'R1-1A-D9-extraction-inside-frozen-artifact': 'R1-1A-L9-no-fs1-frozen-artifact-mutated',
  'R1-1A-D10-fake-disabled-control': 'R1-1A-L10-read-only-omits-not-disables',
  'R1-1A-D11-withheld-leaks-machine-identity': 'R1-1A-L12-withheld-population-keeps-identity-and-reason',
};
export const CLASSIFIED: Record<string, readonly string[]> = {};
