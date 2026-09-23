/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / R1-1A — LAWS over the golden-preserving read-only Review seam.
 *
 * A subject is: the accepted controlled `Room`, the extracted pure `Presentation` (absent until the
 * extraction lands — every read-only law is then RED, which is the known-bad), the two capability
 * sets, and the seam source files the static laws scan. ⛔ Nothing here touches an FS1-frozen artifact;
 * L9 proves it by running the frozen verifier.
 */
import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ReviewView, LensId, ReviewRoom as RoomFn } from '../../../../app/writers-studio/flagship/DevelopReview';
import { REVIEW } from '../../../../scripts/witness/flagship/fixtures';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }
/** Structural, so the suite types before AND after the extraction exists. */
export interface Capabilities {
  readonly askMaia: boolean; readonly discuss: boolean; readonly explore: boolean; readonly commission: boolean;
  readonly acknowledgeStale: boolean; readonly ownObservation: boolean; readonly navigate: boolean;
}
export interface PresentationProps { view: ReviewView; lens?: LensId | 'all'; facet?: 'guided' | 'learning' | 'direct'; capabilities: Capabilities }
export interface Subject {
  readonly name: string;
  readonly Room: typeof RoomFn;
  readonly Presentation?: (p: PresentationProps) => React.ReactElement;
  readonly readOnly?: Capabilities;
  readonly controlled?: Capabilities;
  /** repo-relative presentation sources the purity laws scan */
  readonly seamFiles: readonly string[];
}

const ROOT = process.cwd();
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const law = (id: string, body: () => LawResult): LawResult => {
  try { return body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; }
};
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });
const render = (el: React.ReactElement | null) => (el ? renderToStaticMarkup(el) : '');

/** The four accepted controlled states, built against the subject's Room. */
export const REVIEW_STATES = (Room: typeof RoomFn): Record<string, React.ReactElement> => ({
  '7-review': React.createElement(Room, { view: REVIEW }),
  '7b-review-acknowledged': React.createElement(Room, { view: { ...REVIEW, changed: REVIEW.changed ? { ...REVIEW.changed, acknowledged: true } : undefined } }),
  '8-review-not-read': React.createElement(Room, { view: REVIEW, lens: 'arc' }),
  '9-review-nothing-noticed': React.createElement(Room, { view: REVIEW, lens: 'coherence' }),
});

const FORBIDDEN = {
  askMaia: /Ask MAIA/,
  discuss: /data-action="discuss"|>Discuss</,
  explore: /data-action="explore"|>Explore</,
  commission: /data-commission=|Read for this|Read again|Read this chapter again|Read the remaining/,
  own: /fs-own|Add your own observation|Keep with this passage|Add a theme|data-dismiss=/,
  dead: /\bdisabled\b|aria-disabled|data-dead|fs-btn--ghost|>Unavailable/,
};

export function runR11ALaws(s: Subject): LawResult[] {
  const out: LawResult[] = [];
  const P = s.Presentation; const ro = s.readOnly;
  /** Read-only renders across the states that carry every control class: all · not-read (offer) · stale (reread) · with map. */
  const readOnly = (): string => {
    if (!P || !ro) return '';
    return [
      render(React.createElement(P, { view: REVIEW, lens: 'all', capabilities: ro })),
      render(React.createElement(P, { view: REVIEW, lens: 'arc', capabilities: ro })),
      render(React.createElement(P, { view: { ...REVIEW, changed: REVIEW.changed ? { ...REVIEW.changed, acknowledged: true } : undefined }, lens: 'all', capabilities: ro })),
    ].join('\n');
  };
  const unextracted = (id: string) => must(id, false, 'UNEXTRACTED — no pure Presentation / read-only capability set exists');
  const sources = s.seamFiles.map((f) => (existsSync(join(ROOT, f)) ? strip(readFileSync(join(ROOT, f), 'utf8')) : `/* MISSING ${f} */`)).join('\n');

  const absent = (id: string, re: RegExp, what: string) => law(id, () => {
    if (!P || !ro) return unextracted(id);
    const html = readOnly();
    return must(id, html.length > 0 && !re.test(html), `${what} present=${re.test(html)} rendered=${html.length > 0}`);
  });
  out.push(absent('R1-1A-L1-read-only-omits-ask-maia', FORBIDDEN.askMaia, 'Ask MAIA'));
  out.push(absent('R1-1A-L2-read-only-omits-discuss', FORBIDDEN.discuss, 'Discuss'));
  out.push(absent('R1-1A-L3-read-only-omits-explore', FORBIDDEN.explore, 'Explore'));
  out.push(absent('R1-1A-L4-read-only-omits-commission-controls', FORBIDDEN.commission, 'commission control'));
  out.push(absent('R1-1A-L5-read-only-omits-member-write-controls', FORBIDDEN.own, 'OwnObservation / member-write control'));

  out.push(law('R1-1A-L6-seam-fetches-nothing', () => {
    const re = /\bfetch\(|apiFetch|useEffect|useState|useRef|localStorage|XMLHttpRequest|process\.env|import\(/;
    return must('R1-1A-L6-seam-fetches-nothing', !re.test(sources), `impureToken=${re.test(sources)} files=${s.seamFiles.length}`);
  }));
  out.push(law('R1-1A-L7-seam-invokes-no-cognition', () => {
    const re = /runStructured|@\/lib\/ai\/|lib\/ai\/|editorialRuntime|developmentalReading\/read|commissionReading|readChapter|Anthropic|ollama/i;
    return must('R1-1A-L7-seam-invokes-no-cognition', !re.test(sources), `cognitionToken=${re.test(sources)}`);
  }));

  out.push(law('R1-1A-L8-controlled-review-room-byte-identical', () => {
    const states = REVIEW_STATES(s.Room);
    const diffs = Object.entries(states).filter(([id, el]) => {
      const golden = readFileSync(join(ROOT, 'tests/constitutional/writers-studio/flagship-r1-1a/golden', `${id}.html`), 'utf8');
      return render(el) !== golden;
    }).map(([id]) => id);
    return must('R1-1A-L8-controlled-review-room-byte-identical', diffs.length === 0, diffs.length ? `changed: ${diffs.join(', ')}` : '4/4 accepted states byte-identical to the base golden');
  }));

  out.push(law('R1-1A-L9-no-fs1-frozen-artifact-mutated', () => {
    const manifest = JSON.parse(readFileSync(join(ROOT, 'tests/constitutional/writers-studio/FLAGSHIP_FREEZE.json'), 'utf8')) as { frozen: Record<string, unknown> };
    const claimed = s.seamFiles.filter((f) => f in manifest.frozen);
    const r = spawnSync('npx', ['tsx', 'scripts/verify-flagship-freeze.ts'], { cwd: ROOT, encoding: 'utf8' });
    return must('R1-1A-L9-no-fs1-frozen-artifact-mutated', r.status === 0 && claimed.length === 0,
      `verifier exit=${r.status} seamInsideFreeze=${claimed.join(', ') || 'none'}`);
  }));

  out.push(law('R1-1A-L10-read-only-omits-not-disables', () => {
    if (!P || !ro) return unextracted('R1-1A-L10-read-only-omits-not-disables');
    const html = readOnly();
    return must('R1-1A-L10-read-only-omits-not-disables', !FORBIDDEN.dead.test(html), `deadControl=${FORBIDDEN.dead.test(html)}`);
  }));

  out.push(law('R1-1A-L11-read-only-keeps-the-reading-whole', () => {
    if (!P || !ro) return unextracted('R1-1A-L11-read-only-keeps-the-reading-whole');
    const count = (h: string, re: RegExp) => (h.match(re) ?? []).length;
    const c = render(React.createElement(s.Room, { view: REVIEW }));
    const r = render(React.createElement(P, { view: REVIEW, lens: 'all', capabilities: ro }));
    const findings = count(c, /data-finding="/g) === count(r, /data-finding="/g) && count(r, /data-finding="/g) > 0;
    const tabs = count(c, /role="tab"/g) === count(r, /role="tab"/g);
    const stale = /data-stale-reading="true"/.test(r) && /data-coverage="true"/.test(r) && /data-manuscript-context="true"/.test(r) && /Nothing here is ranked/.test(r);
    return must('R1-1A-L11-read-only-keeps-the-reading-whole', findings && tabs && stale, `sameFindings=${findings} sameTabs=${tabs} disclosuresPresent=${stale}`);
  }));

  out.push(law('R1-1A-L12-withheld-population-keeps-identity-and-reason', () => {
    if (!P || !ro) return unextracted('R1-1A-L12-withheld-population-keeps-identity-and-reason');
    const view = { ...REVIEW, withheld: [
      { observationId: 'dobs_w1', readingId: 'rd_9', observationKey: 'o3', reason: 'frozen_citation_text_unavailable' },
      { observationId: 'dobs_w2', readingId: 'rd_9', observationKey: 'o5', reason: 'observation_address_unavailable' },
      { observationId: 'dobs_w3', readingId: 'rd_9', observationKey: 'o7', reason: 'lens_not_presentable' },
    ] } as ReviewView;
    const h = render(React.createElement(P, { view, lens: 'all', capabilities: ro }));
    const ids = ['dobs_w1', 'dobs_w2', 'dobs_w3'].every((id) => new RegExp(`data-withheld="${id}"`).test(h));
    const addr = /rd_9/.test(h) && /o3/.test(h) && /o5/.test(h) && /o7/.test(h);
    const reasons = /data-withheld-reason="frozen_citation_text_unavailable"/.test(h) && /data-withheld-reason="observation_address_unavailable"/.test(h) && /data-withheld-reason="lens_not_presentable"/.test(h);
    const exists = /3 observation/.test(h) && !/disappear|removed|deleted|lost/i.test(h);
    const goldenClean = !/data-withheld/.test(render(React.createElement(s.Room, { view: REVIEW })));
    return must('R1-1A-L12-withheld-population-keeps-identity-and-reason', ids && addr && reasons && exists && goldenClean,
      `identities=${ids} addresses=${addr} reasons=${reasons} countedAsExisting=${exists} controlledUnaffected=${goldenClean}`);
  }));

  return out;
}
