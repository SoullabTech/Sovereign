/**
 * FLAGSHIP-RUNTIME-CONVERGENCE-01 / C1B — LAWS over the live Write host.
 *
 * A subject is the composition (`View`), the authorship seam as data
 * (`authoredBodyProps`), the status derivation, and the host source files the
 * static laws read. The reference subject is the real host; each defeat
 * candidate replaces exactly one member.
 */
import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import type { ContextReady, FlagshipWriteViewProps, authoredBodyProps as AuthoredBodyPropsFn, truthfulStatus as TruthfulStatusFn } from '../../../../app/writers-studio/rebuild/FlagshipWriteHost';
import type { RebuildSection } from '../../../../lib/writersStudio/rebuild/model';

export interface LawResult { readonly id: string; readonly ok: boolean; readonly detail: string }
export interface Subject {
  readonly name: string;
  readonly View: (p: FlagshipWriteViewProps) => React.ReactElement;
  readonly authoredBodyProps: typeof AuthoredBodyPropsFn;
  readonly truthfulStatus: typeof TruthfulStatusFn;
  /** repo-relative host sources the static laws scan */
  readonly hostFiles: readonly string[];
}

const ROOT = process.cwd();
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '').replace(/\{\/\*[\s\S]*?\*\/\}/g, '');
const law = (id: string, body: () => LawResult): LawResult => {
  try { return body(); } catch (err) { return { id, ok: false, detail: `threw: ${err instanceof Error ? err.message : String(err)}` }; }
};
const must = (id: string, ok: boolean, detail: string): LawResult => ({ id, ok, detail });

export const ROOT_SECTION: RebuildSection = {
  draftSectionId: 'd-root', sourceSectionId: 's-root', position: 1, heading: 'Chapter 1', headingDepth: 1, headingSignal: 'chapter',
  body: 'The water held the last of the light.', editable: true,
};
export const SECTION: RebuildSection = {
  draftSectionId: 'd-2', sourceSectionId: 's-2', position: 2, heading: 'The river at dusk', headingDepth: 2, headingSignal: 'markdown',
  body: 'Nothing moved on the far bank. She waited for the sound to come back.', editable: true,
};
export const CONTEXT: ContextReady = {
  state: 'section_aware', manuscriptId: 'ms-1', title: 'The River Between', version: 7, updatedAt: '2026-09-22T00:00:00.000Z',
  sections: [ROOT_SECTION, SECTION],
};
const BARE: ContextReady = {
  ...CONTEXT, title: null,
  sections: [{ ...SECTION, draftSectionId: 'd-bare', heading: null, headingDepth: null, headingSignal: null }],
};
const noop = () => {};
const baseProps = (over: Partial<FlagshipWriteViewProps> = {}): FlagshipWriteViewProps => ({
  context: CONTEXT, workTitle: 'The River Between', workForm: null, focusId: 'd-2', held: null, onFocus: noop, onHold: noop, ...over,
});

function fakeWriting() {
  const calls: string[] = [];
  return {
    calls,
    bodyOf: (id: string) => `body-of-${id}`,
    editSection: (id: string, body: string) => { calls.push(`edit:${id}:${body}`); },
    captureForUnmount: (id: string, body: string) => { calls.push(`capture:${id}:${body}`); return true; },
  };
}

export function runC1BLaws(s: Subject): LawResult[] {
  const out: LawResult[] = [];
  const sources = s.hostFiles.map((f) => strip(readFileSync(join(ROOT, f), 'utf8'))).join('\n');
  const render = (p: FlagshipWriteViewProps) => renderToStaticMarkup(React.createElement(s.View, p));

  out.push(law('C1B-L1-live-authorship-in-flagship-geometry', () => {
    const html = render(baseProps());
    const article = html.match(/<article class="fs-ms" data-manuscript="true">([\s\S]*?)<\/article>/)?.[1] ?? '';
    const bodies = (article.match(/data-authored-body="/g) ?? []).length;
    const textbox = (article.match(/role="textbox"/g) ?? []).length;
    const fsp = (html.match(/class="fs-p"/g) ?? []).length;
    return must('C1B-L1-live-authorship-in-flagship-geometry', bodies === 2 && textbox === 2 && fsp === 0, `authoredBodiesInGeometry=${bodies} textboxes=${textbox} fs-p=${fsp}`);
  }));

  out.push(law('C1B-L2-single-writing-session', () => {
    const boundary = (sources.match(/RebuildWritingBoundary/g) ?? []).length;
    const second = sources.match(/useSectionWriting\(|makeSectionSave|SectionSaveQueue|sectionSaveClient|new .*Queue\(/);
    const html = render(baseProps());
    const frames = (html.match(/data-manuscript="true"/g) ?? []).length;
    return must('C1B-L2-single-writing-session', boundary >= 2 && !second && frames === 1, `boundaryRefs=${boundary} secondSession=${second ? second[0] : 'none'} manuscripts=${frames}`);
  }));

  out.push(law('C1B-L3-truthful-status', () => {
    const t = s.truthfulStatus;
    const table = [
      [t(['clean', 'clean'], 7), 'Saved · v7'], [t(['clean', 'dirty'], 7), 'Unsaved'], [t(['saving'], 7), 'Saving…'],
      [t(['error', 'dirty'], 7), 'Save unavailable'], [t(['conflict', 'dirty', 'saving'], 7), 'Needs attention'],
    ] as const;
    const wrong = table.filter(([got, want]) => got !== want).map(([got, want]) => `${got}≠${want}`);
    const html = render(baseProps());
    const fixture = /2m ago/.test(sources) || /2m ago/.test(html);
    const rendered = html.match(/class="fs-saved">([^<]*)</)?.[1] ?? '';
    return must('C1B-L3-truthful-status', wrong.length === 0 && !fixture && rendered === 'Saved · v7', wrong.length ? wrong.join(' ') : `rendered="${rendered}" fixturePhrase=${fixture}`);
  }));

  out.push(law('C1B-L4-no-fabricated-presentation-fact', () => {
    const html = render(baseProps({ context: BARE, workTitle: null, focusId: 'd-bare' }));
    const bad: string[] = [];
    if (/Untitled|Novel|words\b.*·|Soullab|82,400/.test(html.replace(/\d[\d,]* words/, ''))) bad.push('invented label');
    if (/fs-railwork|fs-railfoot|fs-epi/.test(html)) bad.push('identity/epigraph block rendered without a fact');
    if (/<b>[^<]+<\/b>/.test(html.match(/class="fs-crumb">([\s\S]*?)<\/div>/)?.[1] ?? '')) bad.push('crumb names a Work it does not have');
    if (/fs-chlabel|fs-chtitle/.test(html)) bad.push('chapter heading invented');
    return must('C1B-L4-no-fabricated-presentation-fact', bad.length === 0, bad.length ? bad.join('; ') : 'absence rendered as absence');
  }));

  /* R1-1C SUCCESSION (founder-authorized, 2026-09-23 — record docs/programme/FLAGSHIP-RUNTIME-CONVERGENCE-01_R1-1C_REVIEW_NAVIGATION_SUCCESSION_2026-09-23.md).
     PREDECESSOR, verified below at the FS1 base blob (git show 4dade9a68:…): `buttons === 0 && anchors === 0` — true only
     because no lawful navigation action existed in the Write host. SUCCESSOR: the reason survives — a live surface draws no
     control without a lawful action behind it — so every <button>/<a> in ordinary Write must be a navigation entry that
     carries one (`data-affordance="navigate"`), and nothing else. Full successor law: R1-1C-L1-successor-navigation. */
  out.push(law('C1B-L5-no-dead-production-control', () => {
    const html = render(baseProps());
    const buttons = (html.match(/<button/g) ?? []).length;
    const anchors = (html.match(/<a /g) ?? []).length;
    const withLawfulAction = (html.match(/<(button|a)[^>]*data-nav="[a-z]+"[^>]*data-affordance="navigate"/g) ?? []).length;
    const predecessor = execSync('git show 4dade9a68:tests/constitutional/writers-studio/flagship-c1b/laws.ts', { cwd: ROOT, encoding: 'utf8' }).includes('buttons === 0 && anchors === 0');
    return must('C1B-L5-no-dead-production-control', buttons + anchors === withLawfulAction && predecessor, `buttons=${buttons} anchors=${anchors} withLawfulAction=${withLawfulAction} predecessorWitnessedAtFS1=${predecessor}`);
  }));

  /* R1-1C SUCCESSION (founder-authorized, 2026-09-23). PREDECESSOR, verified below at the FS1 base blob (git show 4dade9a68:…):
     exactly two orientation entries, every one data-nav="write" — the pre-Review flagship state. SUCCESSOR: the reason
     survives — flagship navigation is explicit, bounded, non-duplicative and revives no legacy mode architecture — and
     Review is admitted as a flagship destination: exactly two orientation surfaces, each naming Write and Review, no
     Develop, no legacy room. Full successor law: R1-1C-L1-successor-navigation (flagship-r1-1c). ⛔ Not silently rewritten:
     the predecessor assertion is read from the frozen FS1 blob every run. */
  out.push(law('C1B-L6-no-legacy-mode-bridge', () => {
    const html = render(baseProps());
    const legacy = /\/writers-studio\/(develop|review)/.test(html) || /\/writers-studio\/(develop|review)/.test(sources);
    const navs = html.match(/data-nav="([a-z]+)"/g) ?? [];
    const successorSet = navs.length === 4 && navs.filter((n) => n === 'data-nav="write"').length === 2 && navs.filter((n) => n === 'data-nav="review"').length === 2;
    const surfaces = (html.match(/class="fs-rail"/g) ?? []).length === 1 && (html.match(/class="fs-mobilenav"/g) ?? []).length === 1;
    const predecessor = execSync('git show 4dade9a68:tests/constitutional/writers-studio/flagship-c1b/laws.ts', { cwd: ROOT, encoding: 'utf8' }).includes(`navs.every((n) => n === 'data-nav="write"')`);
    return must('C1B-L6-no-legacy-mode-bridge', !legacy && successorSet && surfaces && predecessor, `legacyBridge=${legacy} navs=${navs.join(',')} twoSurfaces=${surfaces} predecessorWitnessedAtFS1=${predecessor}`);
  }));

  out.push(law('C1B-L7-save-wiring-to-existing-session', () => {
    const w = fakeWriting();
    const p = s.authoredBodyProps(w, SECTION, null, { onFocus: noop, onHold: noop });
    p.onEdit('typed'); p.onCaptureBeforeBlur('visible');
    const ok = p.body === 'body-of-d-2' && w.calls[0] === 'edit:d-2:typed' && w.calls[1] === 'capture:d-2:visible';
    return must('C1B-L7-save-wiring-to-existing-session', ok, `body=${p.body} calls=${w.calls.join(' | ')}`);
  }));

  out.push(law('C1B-L8-passage-address-exact', () => {
    const w = fakeWriting(); const holds: string[] = [];
    const p = s.authoredBodyProps(w, SECTION, null, { onFocus: noop, onHold: (id, a, b, t) => holds.push(`${id}:${a}:${b}:${t}`) });
    p.onSelectPassage(21, 29, 'far bank');
    const html = render(baseProps({ held: { sectionId: 'd-2', start: 21, end: 29, text: 'far bank' } }));
    const addr = /data-held-passage-address="21:29"/.test(html);
    return must('C1B-L8-passage-address-exact', holds[0] === 'd-2:21:29:far bank' && addr, `hold=${holds[0] ?? 'none'} addressRendered=${addr}`);
  }));

  out.push(law('C1B-L9-not-the-legacy-workbench', () => {
    const html = render(baseProps());
    const root = (html.match(/class="fs-root"/g) ?? []).length === 1;
    const legacy = /wsr-grid|wsr-outline|wsr-maia|wsr-modebar|wsr-header/.test(html) || /RebuildStudioClient|StudioModeBar/.test(sources);
    return must('C1B-L9-not-the-legacy-workbench', root && !legacy, `fs-root=${root} legacyRegions=${legacy}`);
  }));

  /* IR1 (founder ruling, 2026-09-23): `RebuildStudioClient.tsx` is the LEGACY HOST — presentation
     + client orchestration, not writing authority (C0). E1 lawfully changed it. It is no longer in
     this standing blob set; the historical record that THIS act did not modify it stands unchanged.
     Record: docs/programme/FLAGSHIP-RUNTIME-CONVERGENCE-01_IR1_LEGACY_HOST_PIN_RECONCILIATION_2026-09-23.md */
  out.push(law('C1B-L10-authority-files-untouched', () => {
    const files = ['app/writers-studio/rebuild/RebuildAuthoredBody.tsx', 'app/writers-studio/rebuild/RebuildWritingBoundary.tsx', 'lib/writersStudio/useSectionWriting.ts', 'lib/writersStudio/sectionSaveClient.ts'];
    const moved = files.filter((f) => execSync(`git rev-parse b23ae2d7f:${f}`, { cwd: ROOT, encoding: 'utf8' }).trim() !== execSync(`git hash-object ${f}`, { cwd: ROOT, encoding: 'utf8' }).trim());
    const adapters = execSync('git rev-parse 0cdae09a9:lib/writersStudio/studio/adapters/writeView.ts', { cwd: ROOT, encoding: 'utf8' }).trim() === execSync('git hash-object lib/writersStudio/studio/adapters/writeView.ts', { cwd: ROOT, encoding: 'utf8' }).trim();
    return must('C1B-L10-authority-files-untouched', moved.length === 0 && adapters, moved.length ? `moved: ${moved.join(', ')}` : `4 authority files blob-identical to canonical · adapters identical to C1A`);
  }));

  return out;
}
