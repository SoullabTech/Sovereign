/**
 * PC3-S1 — canonical Light Shell structural law (founder-review route).
 *
 * Structural only. Visual fidelity against the founder originals is proven by
 * scripts/writers-studio/pc3-s1-fidelity.mjs; founder acceptance is PC4 and no
 * test here stands in for it.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { FullRedesignReviewClient } from '@/app/dev/writers-studio-full-redesign-review/FullRedesignReviewClient';
import { DEFAULT_APPEARANCE, PRIMARY_MODES, REGION_ORDER, type Appearance, type FixtureStateId } from '@/app/writers-studio/full-redesign/types';
import { FIXTURE_STATES, REFERENCES } from '@/app/writers-studio/full-redesign/fixtures';
import { APPEARANCE_TOKENS, STATE_GEOMETRY } from '@/app/writers-studio/full-redesign/tokens';

const ROOT = path.resolve(__dirname, '../../..');
const ROUTE_DIR = 'app/dev/writers-studio-full-redesign-review';
const SHELL_DIR = 'app/writers-studio/full-redesign';
const HARNESS_FILES = [
  `${ROUTE_DIR}/page.tsx`,
  `${ROUTE_DIR}/FullRedesignReviewClient.tsx`,
  `${SHELL_DIR}/Shell.tsx`,
  `${SHELL_DIR}/tokens.ts`,
  `${SHELL_DIR}/types.ts`,
  `${SHELL_DIR}/fixtures.ts`,
];
const read = (rel: string) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
/** Source with comments removed, so a file documenting what it must not do is not read as doing it. */
const code = (rel: string) => read(rel).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/.*$/gm, '$1');

const render = (state: FixtureStateId, appearance: Appearance = DEFAULT_APPEARANCE) =>
  renderToStaticMarkup(createElement(FullRedesignReviewClient, { initialState: state, initialAppearance: appearance }));

const regionSequence = (html: string) => [...html.matchAll(/data-region="([a-z]+)"/g)].map((m) => m[1]);
const navLabels = (html: string) => {
  const nav = html.match(/<nav[^>]*aria-label="Studio"[^>]*>([\s\S]*?)<\/nav>/);
  return nav ? [...nav[1].matchAll(/<button[^>]*>([^<]*)<\/button>/g)].map((m) => m[1]) : [];
};

describe('PC3-S1 · canonical Light Shell', () => {
  test('Light is the default appearance', () => {
    expect(DEFAULT_APPEARANCE).toBe('light');
    expect(render('develop-themes')).toContain('data-appearance="light"');
  });

  test('primary nav is exactly Home · Write · Develop · Review in every state', () => {
    expect(PRIMARY_MODES.map((m) => m.label)).toEqual(['Home', 'Write', 'Develop', 'Review']);
    for (const s of FIXTURE_STATES) expect(navLabels(render(s))).toEqual(['Home', 'Write', 'Develop', 'Review']);
  });

  test('no Explore, Publish, Library or global Search destination is rendered', () => {
    for (const s of FIXTURE_STATES) {
      const labels = navLabels(render(s)).join(' ');
      expect(labels).not.toMatch(/Explore|Publish|Library|Search/);
    }
  });

  test('the harness contains no network or API call of any kind', () => {
    for (const f of HARNESS_FILES) {
      const src = code(f);
      expect({ f, hit: src.match(/\bfetch\s*\(|apiFetch|XMLHttpRequest|new\s+WebSocket|EventSource|['"`]\/api\//)?.[0] ?? null }).toEqual({ f, hit: null });
    }
  });

  test('the harness imports nothing from the live Studio, its runtime or its data layer', () => {
    // Resolve every specifier to a repository path first: a relative import of a
    // live module must be caught exactly like an aliased one.
    const resolveSpec = (from: string, spec: string) =>
      spec.startsWith('@/') ? spec.slice(2) : spec.startsWith('.') ? path.posix.normalize(path.posix.join(path.posix.dirname(from), spec)) : spec;
    const allowedStudio = (p: string) => p.startsWith('app/writers-studio/full-redesign/') || p.startsWith(`${ROUTE_DIR}/`);
    const forbidden = (p: string) =>
      (p.startsWith('app/writers-studio/') && !allowedStudio(p)) || /^(lib\/(writersStudio|manuscript|db|http|sovereign)|app\/api)\b/.test(p) || /^components\//.test(p);
    for (const f of HARNESS_FILES) {
      const specs = [...code(f).matchAll(/(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g)].map((m) => resolveSpec(f, m[1]));
      expect({ f, hits: specs.filter(forbidden) }).toEqual({ f, hits: [] });
    }
  });

  test('the production Writer’s Studio route is untouched and still mounts the full workspace', () => {
    const rebuild = read('app/writers-studio/rebuild/page.tsx');
    expect(rebuild).toMatch(/<RebuildStudioClient\b/);
    expect(rebuild).not.toMatch(/full-redesign/);
  });

  test('the review route lives outside the Writer’s Studio layout (no inherited atmosphere persistence)', () => {
    expect(fs.existsSync(path.join(ROOT, `${ROUTE_DIR}/page.tsx`))).toBe(true);
    expect(fs.existsSync(path.join(ROOT, 'app/writers-studio/full-redesign-review'))).toBe(false);
    expect(fs.existsSync(path.join(ROOT, 'app/dev/layout.tsx'))).toBe(false);
  });

  test('MAIA is present in relation to the Work in every Develop and Review state', () => {
    for (const s of FIXTURE_STATES) {
      const html = render(s);
      expect(regionSequence(html)).toEqual([...REGION_ORDER]);
      expect(html).toMatch(/data-region="maia"[^>]*aria-label="MAIA"/);
      expect(html).toMatch(/<h2>MAIA<\/h2>/);
    }
  });

  test('appearance changes colour roles only — never region order or geometry', () => {
    expect(Object.keys(APPEARANCE_TOKENS.night).sort()).toEqual(Object.keys(APPEARANCE_TOKENS.light).sort());
    for (const s of FIXTURE_STATES) {
      const light = render(s, 'light');
      const night = render(s, 'night');
      expect(regionSequence(night)).toEqual(regionSequence(light));
      const geom = (h: string) => (h.match(/--fr-(pad-l|pad-r|ms-w|maia-w|gap-l|gap-r|top|bottom):[^;"]+/g) ?? []).join(';');
      expect(geom(night)).toBe(geom(light));
      expect(night).toContain('data-appearance="night"');
    }
  });

  test('the founder-review marker sits outside the captured product frame', () => {
    const html = render('develop-themes');
    const start = html.indexOf('data-capture-frame');
    const marker = html.indexOf('data-founder-review-marker');
    expect(start).toBeGreaterThan(-1);
    expect(marker).toBeGreaterThan(start);
    // Walk <div> depth from the frame's opening tag: it must close before the marker.
    let depth = 0;
    let closedAt = -1;
    const re = /<(\/?)div\b[^>]*>/g;
    re.lastIndex = html.lastIndexOf('<div', start);
    for (let m = re.exec(html); m; m = re.exec(html)) {
      depth += m[1] ? -1 : 1;
      if (depth === 0) {
        closedAt = m.index;
        break;
      }
    }
    expect(closedAt).toBeGreaterThan(start);
    expect(closedAt).toBeLessThan(marker);
    expect(html).toContain('Founder review · fixture data');
  });

  test('each fixture state is declared and bound to its exact founder original', () => {
    for (const s of FIXTURE_STATES) {
      expect(render(s)).toContain(`data-fixture-state="${s}"`);
      expect(REFERENCES[s].sha256).toMatch(/^[0-9a-f]{64}$/);
      expect(REFERENCES[s].corpusCommit).toBe('c0f4bca2952a6b6afa2d74e204117b6abdf1915a');
      expect(STATE_GEOMETRY[s]).toBeDefined();
    }
    expect(REFERENCES['develop-themes'].sha256).toBe('c3f708824e35d998570241847c4896b94438ad71f8c6cddd3082cb86b417cf08');
    expect(REFERENCES['develop-manuscript'].sha256).toBe('9986821d23396f4a48058926a556697685530b56f215d841476d70d86a29543e');
    expect(REFERENCES['review-chapter'].sha256).toBe('b46562a7268cd499316c49c84bbbeeb13550d5de2aa14e00296eaab2bd8ecc82');
  });

  test('text encoding is intact — curly punctuation survives, no mojibake', () => {
    for (const s of FIXTURE_STATES) {
      const html = render(s);
      expect(html).not.toMatch(/â€|Ã.|�/);
      expect(html).toMatch(/[’“”—]/);
    }
  });

  test('Review fixture withholds the semantics PC1 VS-16 forbids even though #23 shows them', () => {
    const html = render('review-chapter');
    expect(html).not.toMatch(/Readiness|Balanced|Most relevant/);
    expect(html).toContain('In manuscript order');
  });
});
