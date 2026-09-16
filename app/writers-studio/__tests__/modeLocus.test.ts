/**
 * D1 — THE PLACE CROSSES THE MODE BOUNDARY.
 *
 * A writer standing in section S of Work M pressed Develop and arrived holding
 * M and nothing else. The Work survived the switch; the place did not. Develop
 * opened the book at its beginning, and the mode boundary erased where the
 * writer was standing — which is what made Write and Develop feel like two
 * products rather than two stances toward one manuscript.
 *
 * The repair invents no grammar. `canvasForManuscript` remains the single
 * definition of how a Work identity travels; `locationForSection` remains the
 * single definition of how a place within it travels; `modeLocation` is their
 * composition and nothing more.
 *
 * These obligations guard the transport. They do not claim Develop yet RENDERS
 * the place it now carries — it has no manuscript pane, and that is D3. What is
 * proved here is that the identity survives the round trip.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { CANVAS_HREF, DEVELOP_HREF, modeLocation } from '../studioMap';
import { canvasForManuscript, CANVAS_MANUSCRIPT_PARAM } from '../canvasIdentity';
import { SECTION_PARAM, readSectionParam, resolveInitialSection } from '@/lib/writersStudio/placeInWork';

const M = '5f1c0a2e-8c4d-4f2a-9b77-2ad0e3b41c90';
const S = '9c7b1d40-2e55-4a18-8f36-77c1a0be2d13';

const paramsOf = (href: string) =>
  new URLSearchParams(href.slice(href.indexOf('?')));

function source(rel: string): string {
  return readFileSync(join(__dirname, '..', rel), 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('D1-01 · D1-02 — the place survives both legs', () => {
  it('Write → Develop carries the Work AND the place', () => {
    const p = paramsOf(modeLocation(DEVELOP_HREF, M, S));
    expect(p.get(CANVAS_MANUSCRIPT_PARAM)).toBe(M);
    expect(p.get(SECTION_PARAM)).toBe(S);
  });

  it('Develop → Write carries the Work AND the place', () => {
    const p = paramsOf(modeLocation(CANVAS_HREF, M, S));
    expect(p.get(CANVAS_MANUSCRIPT_PARAM)).toBe(M);
    expect(p.get(SECTION_PARAM)).toBe(S);
  });

  it('the round trip is lossless', () => {
    const there = modeLocation(DEVELOP_HREF, M, S);
    const back = modeLocation(CANVAS_HREF, M, readSectionParam(there));
    expect(paramsOf(back).get(SECTION_PARAM)).toBe(S);
    expect(paramsOf(back).get(CANVAS_MANUSCRIPT_PARAM)).toBe(M);
    expect(back.startsWith(CANVAS_HREF)).toBe(true);
  });
});

describe('D1-03 — the Work never changes while switching mode', () => {
  it('the manuscript that goes in is the manuscript that comes out', () => {
    for (const base of [CANVAS_HREF, DEVELOP_HREF]) {
      for (const section of [S, null]) {
        expect(paramsOf(modeLocation(base, M, section)).get(CANVAS_MANUSCRIPT_PARAM)).toBe(M);
      }
    }
  });
});

describe('D1-04 — identity, never an ordinal', () => {
  it('the section value is the id verbatim', () => {
    expect(paramsOf(modeLocation(DEVELOP_HREF, M, S)).get(SECTION_PARAM)).toBe(S);
  });

  it('⛔ a numeric-looking id is carried as an id, not reinterpreted', () => {
    /* placeInWork's own reason: `s=22` would be an ordinal, and ordinals move
       — a section inserted above would silently reopen a different piece of
       the book. So a section whose id happens to look like a number must not
       be treated as a position. */
    expect(paramsOf(modeLocation(DEVELOP_HREF, M, '22')).get(SECTION_PARAM)).toBe('22');
  });

  it('⛔ the composition performs no position arithmetic', () => {
    const map = source('studioMap.ts');
    const fn = map.slice(map.indexOf('export function modeLocation'));
    const body = fn.slice(0, fn.indexOf('\n}'));
    for (const forbidden of ['indexOf(section', 'position', 'findIndex', 'parseInt', 'Number(']) {
      expect(body).not.toContain(forbidden);
    }
  });
});

describe('D1-05 — a stale place falls back honestly, never silently', () => {
  it('an unknown section resolves to the first AND asks for a rewrite', () => {
    const r = resolveInitialSection('not-in-this-draft', ['a', 'b', 'c']);
    expect(r.sectionId).toBe('a');
    expect(r.rewriteLocation).toBe(true);
  });

  it('⛔ it never resolves to a DIFFERENT requested section', () => {
    const r = resolveInitialSection('b', ['a', 'b', 'c']);
    expect(r.sectionId).toBe('b');
    expect(r.rewriteLocation).toBe(false);
  });

  it('no place asked for is not a rewrite', () => {
    expect(resolveInitialSection(null, ['a', 'b'])).toEqual({ sectionId: 'a', rewriteLocation: false });
  });
});

describe('D1-06 — one grammar, one reader, one composer', () => {
  it('the bar reads `s` through the shared reader', () => {
    const bar = source('studio/StudioModeBar.tsx');
    expect(bar).toContain('readSectionParam');
    expect(bar).toContain('modeLocation(');
  });

  it('⛔ the bar composes no address of its own', () => {
    const bar = source('studio/StudioModeBar.tsx');
    expect(bar).not.toContain('URLSearchParams');
    expect(bar).not.toMatch(/['"`]\?m=/);
    expect(bar).not.toMatch(/['"`]&s=/);
  });

  it('⛔ Develop invents no second location helper', () => {
    for (const f of ['develop/page.tsx', 'develop/DevelopRoom.tsx']) {
      const src = source(f);
      expect(src).not.toContain('locationForSection');
      expect(src).not.toMatch(/['"`]&s=/);
    }
  });
});

describe('D1-07 · D1-08 — a Work with no place is unharmed', () => {
  it('a null place yields exactly the link that existed before', () => {
    expect(modeLocation(DEVELOP_HREF, M, null)).toBe(canvasForManuscript(DEVELOP_HREF, M));
    expect(modeLocation(CANVAS_HREF, M, null)).toBe(canvasForManuscript(CANVAS_HREF, M));
  });

  it('⛔ no empty parameter is written', () => {
    expect(modeLocation(DEVELOP_HREF, M, null)).not.toContain(`${SECTION_PARAM}=`);
  });

  it('Develop still opens on the Work alone', () => {
    /* D1-08. The room's one requirement is a Work. Gating entry on a place
       would make a manuscript the writer has not navigated yet unenterable. */
    const page = source('develop/page.tsx');
    expect(page).toContain("params?.get('m')");
    expect(page).not.toMatch(/if \(!sectionId\)/);
  });
});

describe('D1-09 — composition corrupts nothing it was handed', () => {
  it('parameters already on the base survive', () => {
    const href = modeLocation(`${DEVELOP_HREF}?r=reading-7`, M, S);
    const p = paramsOf(href);
    expect(p.get('r')).toBe('reading-7');
    expect(p.get(CANVAS_MANUSCRIPT_PARAM)).toBe(M);
    expect(p.get(SECTION_PARAM)).toBe(S);
  });

  it('the path is untouched and stays relative', () => {
    const href = modeLocation(DEVELOP_HREF, M, S);
    expect(href.slice(0, href.indexOf('?'))).toBe(DEVELOP_HREF);
    expect(href.startsWith('/')).toBe(true);
    expect(href).not.toMatch(/^https?:/);
  });

  it('a place is replaced, never appended twice', () => {
    const once = modeLocation(`${DEVELOP_HREF}?${SECTION_PARAM}=old`, M, S);
    expect(once.match(new RegExp(`${SECTION_PARAM}=`, 'g'))).toHaveLength(1);
    expect(paramsOf(once).get(SECTION_PARAM)).toBe(S);
  });
});

describe('the Write room reaches Develop at all', () => {
  it('⛔ the canonical Write room no longer draws its own mode labels', () => {
    /* Five <span>s from a local array looked exactly like the Studio's mode
       bar and went nowhere, so Develop was unreachable from the room the
       writer actually writes in. */
    const room = source('rebuild/RebuildStudioClient.tsx');
    expect(room).not.toContain("['Write', 'Develop', 'Explore', 'Review', 'Publish']");
    expect(room).toContain('<StudioModeBar');
    expect(room).toContain('current="write"');
  });
});
