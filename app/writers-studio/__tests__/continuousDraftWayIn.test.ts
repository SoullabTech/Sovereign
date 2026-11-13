import fs from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ContinuousDraftWayIn, { continuousDraftWayInHrefs, writeForwardFor } from '@/app/writers-studio/ContinuousDraftWayIn';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

/*
 * A member opened an unconverted draft and got a black screen: the section-aware
 * rooms refused it with one unstyled sentence and no control. These pin that the
 * refusal now carries a way in, in every room that refuses, and that the way in
 * names the exact manuscript — a link is not a binding unless the id survives it.
 */
describe('continuous draft way-in', () => {
  it('names the exact manuscript on the Canvas link', () => {
    const id = 'd3befdef-cb48-4b5a-b920-c548442857a7';
    expect(continuousDraftWayInHrefs(id).canvas).toBe(`/writers-studio/canvas?m=${id}`);
    expect(continuousDraftWayInHrefs(id).home).toBe('/writers-studio');
  });

  it('offers no Canvas link rather than a wrong one when no manuscript is known', () => {
    expect(continuousDraftWayInHrefs(null).canvas).toBeNull();
  });

  it('renders a real link to this manuscript and a way home, in the member\'s words', () => {
    const html = renderToStaticMarkup(createElement(ContinuousDraftWayIn, { manuscriptId: 'abc-123', room: 'Write' }));
    expect(html).toContain('href="/writers-studio/canvas?m=abc-123"');
    expect(html).toContain('href="/writers-studio"');
    expect(html).toContain('Write cannot open it');
    expect(html).toContain('safe and unchanged');
  });

  const rooms: Array<[string, string]> = [
    ['Write', 'app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx'],
    ['Develop', 'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx'],
    ['Review', 'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx'],
  ];
  it.each(rooms)('%s hands the refused manuscript to the way-in instead of a bare sentence', (room, file) => {
    const src = read(file);
    expect(src).toContain("from '@/app/writers-studio/ContinuousDraftWayIn'");
    expect(src).toMatch(/setWayInId\(manuscriptId\);/);
    expect(src).toContain(`<ContinuousDraftWayIn manuscriptId={wayInId} room="${room}" />`);
    // reset on every load, so a later successful open never shows a stale refusal
    expect(src).toContain('setWayInId(null);');
  });

  /*
   * A tester pressed Open on Home, landed on Write's refusal, and read it as an
   * empty Work (2026-11-13). Write now forwards a continuous draft to the Canvas.
   */
  describe('Write forwards a continuous draft to the Canvas', () => {
    const id = '7c1e0a52-9d3b-4f6e-a8b1-2e5d4c3f9a10';

    it('forwards a continuous draft to its own Canvas', () => {
      expect(writeForwardFor('continuous', id)).toBe(`/writers-studio/canvas?m=${id}`);
    });

    it.each(['section_aware', 'no_draft', 'continuous_unprovable', ''])(
      'does not forward state %p — the way-in page stands',
      (state) => {
        expect(writeForwardFor(state, id)).toBeNull();
      },
    );

    it('does not forward when the manuscript is unknown', () => {
      expect(writeForwardFor('continuous', null)).toBeNull();
    });

    it('Write follows the forward with replace(), after naming the way-in', () => {
      const src = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
      const refusal = src.indexOf("if (body.state !== 'section_aware') {");
      const wayIn = src.indexOf('setWayInId(manuscriptId);', refusal);
      const forward = src.indexOf('writeForwardFor(body.state, manuscriptId)', refusal);
      const replace = src.indexOf('window.location.replace(forward)', refusal);
      expect(refusal).toBeGreaterThan(-1);
      expect(wayIn).toBeGreaterThan(refusal);
      expect(forward).toBeGreaterThan(wayIn);
      expect(replace).toBeGreaterThan(forward);
    });

    it.each([
      'app/dev/writers-studio-pc3-live/P4R1DevelopController.tsx',
      'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx',
    ])('%s is unchanged: it still shows the way-in, never forwards', (file) => {
      expect(read(file)).not.toContain('writeForwardFor');
    });
  });

  it('adds no conversion and no write: it is links only', () => {
    const src = read('app/writers-studio/ContinuousDraftWayIn.tsx');
    expect(src).not.toMatch(/fetch\(|apiFetch|method:\s*'POST'|onClick/);
  });
});
