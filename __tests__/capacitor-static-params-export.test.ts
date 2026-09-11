/**
 * STATIC-EXPORT CLASSIFIER — capability is an export, not a substring.
 *
 * Defect (2026-09-10): scripts/capacitor-patch-routes.sh decided whether a
 * dynamic-segment page could survive `output: 'export'` with
 * `grep -q generateStaticParams`. app/reflections/[id]/page.tsx is a client
 * component whose doc comment says it *cannot* supply generateStaticParams;
 * the word in that sentence satisfied the grep, the page was classified as
 * compatible, and Next.js failed the entire iOS export on it. Both
 * `npm run ios:build` and `npm run ios:bundle` died there.
 *
 * The scanner now asks the TypeScript parser whether the module's export
 * surface contains that binding (scripts/capacitor/staticParamsExport.ts).
 * These cases pin the boundary:
 *   - prose never counts (comments, strings)
 *   - every real export shape counts
 *   - a non-exported function does not count
 *   - the actual reflections page is classified as NOT exporting it
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { exportsGenerateStaticParams } from '../scripts/capacitor/staticParamsExport';

const CLIENT_PAGE_WITH_PROSE = `'use client';

/**
 * NATIVE: this is a client component on a dynamic segment, so
 * scripts/capacitor-patch-routes.sh strips it from the iOS bundle by design
 * (a client component cannot supply generateStaticParams).
 */
import { useParams } from 'next/navigation';
export default function Page() { const p = useParams(); return null; }
`;

describe('exportsGenerateStaticParams — prose does not count', () => {
  it('a block comment containing the word is not an export', () => {
    expect(exportsGenerateStaticParams(CLIENT_PAGE_WITH_PROSE)).toBe(false);
  });

  it('a line comment containing the word is not an export', () => {
    const src = `// TODO: add generateStaticParams later\nexport default function P() { return null; }\n`;
    expect(exportsGenerateStaticParams(src)).toBe(false);
  });

  it('a string literal containing the word is not an export', () => {
    const src = `const note = 'generateStaticParams is missing';\nexport default function P() { return note; }\n`;
    expect(exportsGenerateStaticParams(src)).toBe(false);
  });

  it('a non-exported function of that name is not an export', () => {
    const src = `function generateStaticParams() { return []; }\nexport default function P() { return null; }\n`;
    expect(exportsGenerateStaticParams(src)).toBe(false);
  });

  it('an empty module reports false', () => {
    expect(exportsGenerateStaticParams('')).toBe(false);
  });
});

/**
 * Review finding on PR #1284 (2026-09-11): the first classifier accepted two
 * export-SHAPED forms that produce no runtime binding named
 * generateStaticParams. Both would have recreated the substring defect —
 * "source looks export-ish → route called compatible → Next finds nothing".
 */
describe('exportsGenerateStaticParams — export-shaped but not a named runtime export', () => {
  it('export default function generateStaticParams exports `default`, not the name', () => {
    const src = `export default function generateStaticParams() { return []; }\n`;
    expect(exportsGenerateStaticParams(src)).toBe(false);
  });

  it('export type { generateStaticParams } is erased at runtime', () => {
    const src = `export type { generateStaticParams } from './params';\nexport default function P() { return null; }\n`;
    expect(exportsGenerateStaticParams(src)).toBe(false);
  });

  it('export { type generateStaticParams } is erased at runtime', () => {
    const src = `export { type generateStaticParams } from './params';\nexport default function P() { return null; }\n`;
    expect(exportsGenerateStaticParams(src)).toBe(false);
  });
});

describe('exportsGenerateStaticParams — real exports count', () => {
  const shapes: Array<[string, string]> = [
    ['export function', `export function generateStaticParams() { return []; }`],
    ['export async function', `export async function generateStaticParams() { return []; }`],
    ['export const arrow', `export const generateStaticParams = () => [];`],
    ['export let', `export let generateStaticParams = async () => [];`],
    ['export const destructured', `export const { generateStaticParams } = params;`],
    ['export named local', `function generateStaticParams() { return []; }\nexport { generateStaticParams };`],
    ['export renamed local', `function params() { return []; }\nexport { params as generateStaticParams };`],
    ['export named from module', `export { generateStaticParams } from './params';`],
    ['export renamed from module', `export { build as generateStaticParams } from './params';`],
  ];

  it.each(shapes)('%s', (_label, decl) => {
    const src = `${decl}\nexport default function P() { return null; }\n`;
    expect(exportsGenerateStaticParams(src)).toBe(true);
  });

  it('the injected patch line is recognised (so a patched page is never double-patched)', () => {
    const src = `// Added by capacitor-patch-routes.sh for static export\nexport function generateStaticParams() { return []; }\n\nexport default function P() { return null; }\n`;
    expect(exportsGenerateStaticParams(src)).toBe(true);
  });

  it('an export of a different name does not count', () => {
    const src = `export const generateStaticParamsList = [];\nexport { x as generateStaticParamsLegacy } from './y';\n`;
    expect(exportsGenerateStaticParams(src)).toBe(false);
  });
});

describe('exportsGenerateStaticParams — the page that broke the export', () => {
  it('app/reflections/[id]/page.tsx does NOT export generateStaticParams', () => {
    const file = join(__dirname, '..', 'app', 'reflections', '[id]', 'page.tsx');
    const source = readFileSync(file, 'utf8');
    // Precondition that makes this test meaningful: the word IS present in prose.
    expect(source).toMatch(/generateStaticParams/);
    expect(exportsGenerateStaticParams(source, file)).toBe(false);
  });
});
