/**
 * PC3-S2 — Home / Arrival structural and truth law (founder-review harness).
 *
 * Structural only. Whether Home feels like the Studio is PC4 founder judgment;
 * nothing here stands in for it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FullRedesignReviewClient } from '@/app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient';
import { PRIMARY_MODES, type ReviewStateId } from '@/app/writers-studio/full-redesign/types';
import {
  FIXTURE_STATES, HOME_COPY, HOME_REFERENCES, HOME_STATES, REMOVE_OR_DELETE, UNCLAIMED_WRITING, isReviewState,
} from '@/app/writers-studio/full-redesign/fixtures';

const ROOT = path.resolve(__dirname, '../../..');
const HOME_FILES = [
  'app/writers-studio/full-redesign/HomeRoom.tsx',
  'app/writers-studio/full-redesign/Shell.tsx',
  'app/writers-studio/full-redesign/fixtures.ts',
  'app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient.tsx',
  'app/dev/writers-studio-full-redesign-review/page.tsx',
];
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const code = (rel: string) => read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');
const render = (state: ReviewStateId) => renderToStaticMarkup(createElement(FullRedesignReviewClient, { initialState: state }));
const frame = (html: string) => html.slice(html.indexOf('data-capture-frame'), html.indexOf('data-founder-review-marker'));
const text = (html: string) => frame(html).replace(/<[^>]+>/g, ' ').replace(/&#x27;|&apos;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ');
const regions = (html: string) => [...html.matchAll(/data-region="([a-z]+)"/g)].map((m) => m[1]);
const nav = (html: string) => {
  const n = html.match(/<nav[^>]*aria-label="Studio"[^>]*>([\s\S]*?)<\/nav>/);
  return n ? [...n[1].matchAll(/<button([^>]*)>([^<]*)<\/button>/g)].map((m) => ({ label: m[2], current: /aria-current="page"/.test(m[1]) })) : [];
};
/** Split rendered markup into the <article> blocks carrying a data-kind. */
const blocks = (html: string, kind: 'work' | 'writing') =>
  [...frame(html).matchAll(new RegExp(`<article[^>]*data-kind="${kind}"[\\s\\S]*?</article>`, 'g'))].map((m) => m[0]);

describe('PC3-S2 · Home / Arrival', () => {
  test('all four Home fixture states exist and render as declared', () => {
    expect([...HOME_STATES]).toEqual(['home-begin', 'home-return', 'home-unclaimed-writing', 'home-many-works']);
    for (const s of HOME_STATES) {
      expect(isReviewState(s)).toBe(true);
      const html = render(s);
      expect(html).toContain(`data-fixture-state="${s}"`);
      expect(html).toContain(`data-home-state="${s}"`);
    }
  });

  test('Home is the active primary destination in every Home state', () => {
    for (const s of HOME_STATES) {
      const items = nav(render(s));
      expect(items.map((i) => i.label)).toEqual(['Home', 'Write', 'Develop', 'Review']);
      expect(items.filter((i) => i.current).map((i) => i.label)).toEqual(['Home']);
    }
  });

  test('no global Search, Library, Explore or Publish destination', () => {
    expect(PRIMARY_MODES.map((m) => m.label)).toEqual(['Home', 'Write', 'Develop', 'Review']);
    for (const s of HOME_STATES) expect(nav(render(s)).map((i) => i.label).join(' ')).not.toMatch(/Search|Library|Explore|Publish/);
  });

  test('H1 begin: exactly one primary act, and it is “Begin a new work”', () => {
    const html = render('home-begin');
    const primaries = [...frame(html).matchAll(/<button[^>]*data-primary-act=""[^>]*>([\s\S]*?)<\/button>/g)];
    expect(primaries).toHaveLength(1);
    expect(primaries[0][1].replace(/<[^>]+>/g, '').trim()).toBe(HOME_COPY.begin);
    expect(text(html)).toContain(HOME_COPY.importWriting);
    expect(text(html)).toContain(HOME_COPY.bringSources);
    // No Work exists at H1, so no Work picker and no fake example Works.
    expect(html).not.toContain('aria-label="Current Work"');
    expect(blocks(html, 'work')).toHaveLength(0);
  });

  test('every Home state carries exactly one primary act', () => {
    for (const s of HOME_STATES) expect({ s, n: (frame(render(s)).match(/data-primary-act=""/g) ?? []).length }).toEqual({ s, n: 1 });
  });

  test('H2 return: a declared Work, its place, and Return to this work', () => {
    const t = text(render('home-return'));
    expect(t).toContain('Welcome back to The River Between.');
    expect(t).toMatch(/You[’']re in Chapter 6 — The Current Changes\./);
    expect(t).toContain(HOME_COPY.returnAction);
    expect(blocks(render('home-return'), 'writing')).toHaveLength(0);
  });

  test('H3 never promotes unclaimed writing to a Work', () => {
    const html = render('home-unclaimed-writing');
    const writing = blocks(html, 'writing');
    expect(writing.length).toBe(UNCLAIMED_WRITING.length);
    for (const b of writing) {
      expect(b).toContain(`>${HOME_COPY.writingLabel}<`);
      expect(b).not.toContain(`>${HOME_COPY.workLabel}<`);
      expect(b).toContain(HOME_COPY.makeWork);
      expect(b).toContain(HOME_COPY.openWriting);
    }
    // No unclaimed title appears inside any Work block.
    for (const w of blocks(html, 'work')) for (const m of UNCLAIMED_WRITING) expect(w).not.toContain(m.title);
    // Works exist here, so Add to a work is offered.
    expect(text(html)).toContain(HOME_COPY.addToWork);
  });

  test('H4 search is title-scoped and says so', () => {
    const html = render('home-many-works');
    expect(html).toMatch(/<input[^>]*data-search-scope="title"/);
    expect(html).toContain(`placeholder="${HOME_COPY.findByTitle}"`);
    expect(text(html)).toContain('Searches titles only');
    expect(text(html)).not.toMatch(/search (everything|your work|all)|full[- ]text/i);
  });

  test('no false resume: place is named only where durable place evidence exists', () => {
    for (const s of HOME_STATES) {
      const t = text(render(s));
      expect({ s, hit: t.match(/continue where you left off|pick up where|you were working on|you last worked/i)?.[0] ?? null }).toEqual({ s, hit: null });
    }
    expect(text(render('home-begin'))).not.toMatch(/You[’']re in /);
    expect(text(render('home-unclaimed-writing'))).not.toMatch(/You[’']re in |Return to this work/);
  });

  test('no urgency or elapsed-time pressure', () => {
    for (const s of HOME_STATES) {
      const t = text(render(s));
      expect({ s, hit: t.match(/\b\d+\s+(minutes?|hours?|days?|weeks?|months?)\s+ago\b|it[’']s been|haven[’']t written|get back on track|streak|don[’']t lose/i)?.[0] ?? null }).toEqual({ s, hit: null });
    }
  });

  test('no resident MAIA at Home: one room, bar + Work only', () => {
    for (const s of HOME_STATES) expect(regions(render(s))).toEqual(['topbar', 'work']);
  });

  test('remove and delete keep the live Studio’s two distinct acts, verbatim', () => {
    const live = read('lib/writersStudio/deleteWork.ts');
    for (const v of [REMOVE_OR_DELETE.remove.action, REMOVE_OR_DELETE.remove.hint, REMOVE_OR_DELETE.delete.action, REMOVE_OR_DELETE.delete.hint]) {
      expect(live).toContain(`'${v}'`);
    }
    expect(REMOVE_OR_DELETE.remove.action).not.toBe(REMOVE_OR_DELETE.delete.action);
  });

  test('the Home harness contains no network or API call and imports nothing live', () => {
    const resolve = (from: string, spec: string) =>
      spec.startsWith('@/') ? spec.slice(2) : spec.startsWith('.') ? path.posix.normalize(path.posix.join(path.posix.dirname(from), spec)) : spec;
    const allowed = (p: string) => p.startsWith('app/writers-studio/full-redesign/') || p.startsWith('app/dev/writers-studio-full-redesign-review/');
    const forbidden = (p: string) =>
      (p.startsWith('app/writers-studio/') && !allowed(p)) || /^(lib|components)\//.test(p) || /^app\/api\b/.test(p);
    for (const f of HOME_FILES) {
      const src = code(f);
      expect({ f, hit: src.match(/\bfetch\s*\(|apiFetch|XMLHttpRequest|new\s+WebSocket|EventSource|['"`]\/api\//)?.[0] ?? null }).toEqual({ f, hit: null });
      const specs = [...src.matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => resolve(f, m[1]));
      expect({ f, hits: specs.filter(forbidden) }).toEqual({ f, hits: [] });
    }
  });

  test('the live Home and production routes are untouched', () => {
    expect(read('app/writers-studio/rebuild/page.tsx')).toMatch(/<RebuildStudioClient\b/);
    expect(read('app/writers-studio/page.tsx')).not.toMatch(/full-redesign|HomeRoom/);
    expect(read('app/writers-studio/HomeView.tsx')).not.toMatch(/full-redesign|HomeRoom/);
  });

  test('accepted S1 states remain reachable and keep MAIA in relation', () => {
    for (const s of FIXTURE_STATES) {
      expect(isReviewState(s)).toBe(true);
      const html = render(s);
      expect(regions(html)).toEqual(['topbar', 'manuscript', 'work', 'maia']);
      expect(html).toContain(`data-fixture-state="${s}"`);
    }
    const options = [...render('home-return').matchAll(/<option value="([^"]+)"/g)].map((m) => m[1]);
    for (const s of [...FIXTURE_STATES, ...HOME_STATES]) expect(options).toContain(s);
  });

  test('Home is bound to its governing and supporting references', () => {
    expect(HOME_REFERENCES.family.sha256).toBe('e5a72601548ee0f19e490a0f3c6f99d66694b2333217d6c341e64e9a37c44b25');
    expect(HOME_REFERENCES.supporting.sha256).toBe('27da50dff5773b89bd4ea0e875b1940f648b2671f35b4c90b64c5dfbed8542b7');
  });
});
