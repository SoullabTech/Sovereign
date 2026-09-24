/**
 * PC3-S3 — Write Resting + Full Canvas structural and truth law (founder-review harness).
 *
 * Structural only. Same-editor identity, selection/cursor/focus continuity and
 * the two return mechanisms are BEHAVIOUR, proven in a real browser by
 * scripts/writers-studio/pc3-s3-write-fidelity.mjs. Whether Write feels like
 * "more room, not another editor" is founder judgment; nothing here stands in for it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FullRedesignReviewClient } from '@/app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient';
import type { ReviewStateId } from '@/app/writers-studio/full-redesign/types';
import { WRITE_COPY, WRITE_FIXTURE, WRITE_REFERENCE, WRITE_STATES, isReviewState } from '@/app/writers-studio/full-redesign/fixtures';
import { APPEARANCE_TOKENS } from '@/app/writers-studio/full-redesign/tokens';

const ROOT = path.resolve(__dirname, '../../..');
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const code = (rel: string) => read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
const render = (state: ReviewStateId) => renderToStaticMarkup(createElement(FullRedesignReviewClient, { initialState: state }));
const frame = (html: string) => html.slice(html.indexOf('data-capture-frame'), html.indexOf('data-founder-review-marker'));
const decode = (s: string) => s.replace(/&#x27;|&apos;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&');
const text = (html: string) => decode(frame(html).replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ');
const regions = (html: string) => [...frame(html).matchAll(/data-region="([a-z]+)"/g)].map((m) => m[1]);
const nav = (html: string) => {
  const n = html.match(/<nav[^>]*aria-label="Studio"[^>]*>([\s\S]*?)<\/nav>/);
  return n ? [...n[1].matchAll(/<button([^>]*)>([^<]*)<\/button>/g)].map((m) => ({ label: m[2], current: /aria-current="page"/.test(m[1]) })) : [];
};
const QUOTE = WRITE_FIXTURE.paragraphs[WRITE_FIXTURE.heldParagraph];
const REST = render('write-resting');
const FULL = render('write-full-canvas');

describe('PC3-S3 · Write Resting + Full Canvas', () => {
  test('both Write states exist and render as declared', () => {
    expect([...WRITE_STATES]).toEqual(['write-resting', 'write-full-canvas']);
    for (const s of WRITE_STATES) {
      expect(isReviewState(s)).toBe(true);
      expect(render(s)).toContain(`data-fixture-state="${s}"`);
    }
    expect(REST).toContain('data-canvas="resting"');
    expect(FULL).toContain('data-canvas="full"');
  });

  test('S3-A/C at rest: the accepted S1 product bar, Write current, no resident MAIA', () => {
    expect(regions(REST)).toEqual(['topbar', 'manuscript', 'work']);
    const items = nav(REST);
    expect(items.map((i) => i.label)).toEqual(['Home', 'Write', 'Develop', 'Review']);
    expect(items.filter((i) => i.current).map((i) => i.label)).toEqual(['Write']);
    expect(frame(REST)).not.toMatch(/data-region="maia"|aria-label="MAIA"/);
  });

  test('S3-B/D Full Canvas: the global bar and manuscript context recede; only the Work remains', () => {
    expect(regions(FULL)).toEqual(['work']);
    expect(nav(FULL)).toEqual([]);
    expect(frame(FULL)).not.toMatch(/data-region="maia"|aria-label="MAIA"/);
  });

  test('ONE editor in each state, plain-text only (no formatting model can arrive by keystroke)', () => {
    for (const html of [REST, FULL]) {
      expect((frame(html).match(/data-write-editor=""/g) ?? []).length).toBe(1);
      expect(frame(html)).toMatch(/contentEditable="plaintext-only"|contenteditable="plaintext-only"/);
      expect(frame(html)).toMatch(/role="textbox"[^>]*aria-multiline="true"|aria-multiline="true"[^>]*role="textbox"/);
    }
  });

  test('at rest: Saved · Draft v12 · Full Canvas · Previous / Next', () => {
    const t = text(REST);
    expect(t).toContain(WRITE_FIXTURE.saveState);
    expect(t).toContain(WRITE_FIXTURE.version);
    expect((frame(REST).match(/data-full-canvas=""/g) ?? []).length).toBe(1);
    expect(frame(REST)).toContain('data-move="previous"');
    expect(frame(REST)).toContain('data-move="next"');
    expect(frame(REST)).not.toContain('data-return=""');
  });

  test('in Full Canvas: Saved · Draft v12 · exactly one Return · no Previous/Next · no entry control', () => {
    const t = text(FULL);
    expect(t).toContain(WRITE_FIXTURE.saveState);
    expect(t).toContain(WRITE_FIXTURE.version);
    expect((frame(FULL).match(/data-return=""/g) ?? []).length).toBe(1);
    expect(t).toContain(WRITE_COPY.ret);
    expect(frame(FULL)).not.toMatch(/data-move=|data-full-canvas=""/);
  });

  test('place and passage are the same in both states: The River Between › Chapter 6, the held quotation', () => {
    for (const html of [REST, FULL]) {
      const t = text(html);
      expect(t).toContain(`${WRITE_FIXTURE.work}`);
      expect(t).toContain(WRITE_FIXTURE.place);
      expect(t).toContain(WRITE_FIXTURE.title);
      const held = decode(frame(html).match(/<p data-held="">([\s\S]*?)<\/p>/)?.[1] ?? '');
      expect(held).toBe(QUOTE);
    }
    expect(QUOTE).toBe('“Maybe this is what growing feels like,” she whispered. “Not arriving, but learning to stay with the in-between.”');
  });

  test('manuscript context: Chapters 6–12 by law, Chapter 6 current — never findings, sources, versions or MAIA', () => {
    const rail = frame(REST).match(/data-region="manuscript"[\s\S]*?<\/aside>/)?.[0] ?? '';
    expect([...rail.matchAll(/data-chapter="([^"]+)"/g)].map((m) => m[1])).toEqual(['ch-6', 'ch-7', 'ch-8', 'ch-9', 'ch-10', 'ch-11', 'ch-12']);
    expect([...rail.matchAll(/data-chapter="([^"]+)"[^>]*aria-current="true"|aria-current="true"[^>]*data-chapter="([^"]+)"/g)].map((m) => m[1] ?? m[2])).toEqual(['ch-6']);
    expect(decode(rail.replace(/<[^>]+>/g, ' '))).not.toMatch(/finding|source|version|MAIA|search/i);
  });

  test('no formatting toolbar or formatting affordance anywhere in Write', () => {
    for (const html of [REST, FULL]) {
      expect(text(html)).not.toMatch(/\b(Bold|Italic|Underline|Paragraph|Heading|Quote|Bullet|Numbered|Format)\b/);
      expect(frame(html)).not.toMatch(/data-format|role="toolbar"/);
    }
  });

  test('truthful state copy: no elapsed-time fiction', () => {
    for (const html of [REST, FULL]) {
      expect(text(html)).not.toMatch(/\b\d+\s+(seconds?|minutes?|hours?|days?)\s+ago\b|last saved|just now/i);
    }
  });

  test('typography resolves through the declared roles: zero component-local font-family', () => {
    const room = code('app/writers-studio/full-redesign/WriteRoom.tsx');
    expect(room).not.toMatch(/fontFamily|font-family|fontStyle|style=\{\{/);
    const css = read('app/dev/writers-studio-full-redesign-review/full-redesign-review.css');
    const s3 = css.slice(css.indexOf('PC3-S3 · Write Resting + Full Canvas'));
    const families = [...s3.matchAll(/font-family:\s*([^;]+);/g)].map((m) => m[1].trim());
    expect(families.length).toBeGreaterThan(0);
    for (const f of families) expect(f).toMatch(/^var\(--fr-(serif|sans)-stack\)$/);
  });

  test('Light and Night carry the same roles, including the S3 saved role', () => {
    expect(Object.keys(APPEARANCE_TOKENS.night).sort()).toEqual(Object.keys(APPEARANCE_TOKENS.light).sort());
    expect(APPEARANCE_TOKENS.light.saved).toBeTruthy();
    expect(APPEARANCE_TOKENS.night.saved).toBeTruthy();
  });

  test('the room fetches nothing, calls no MAIA and imports nothing live', () => {
    const src = code('app/writers-studio/full-redesign/WriteRoom.tsx');
    expect(src).not.toMatch(/\bfetch\s*\(|apiFetch|XMLHttpRequest|new\s+WebSocket|EventSource|['"`]\/api\//);
    const specs = [...src.matchAll(/from\s+['"]([^'"]+)['"]/g)].map((m) => m[1]);
    expect(specs.filter((s) => !/^(react|\.\/fixtures)$/.test(s))).toEqual([]);
  });

  test('live Writer’s Studio routes are untouched by the redesign fixture', () => {
    expect(read('app/writers-studio/rebuild/page.tsx')).toMatch(/<RebuildStudioClient\b/);
    expect(read('app/writers-studio/rebuild/page.tsx')).not.toMatch(/full-redesign|WriteRoom/);
    expect(read('app/writers-studio/page.tsx')).not.toMatch(/full-redesign|WriteRoom/);
  });

  test('S3 is bound to the custodied founder authority', () => {
    expect(WRITE_REFERENCE.corpusCommit).toBe('fa151298997380fd5e4c76beef22b0afb6dc5662');
    expect(WRITE_REFERENCE.sha256).toBe('982b363b158a47d229c3efcb634be0ee09e722a7810df33a500a51de8058b5d9');
    expect(WRITE_REFERENCE.bytes).toBe(1855655);
    expect(WRITE_REFERENCE.path).toBe('docs/design/writers-studio/founder-reference-corpus/s3-visual-authority/a_clean_multi_panel_ui_ux_design_composite_with_fi.png');
  });
});
