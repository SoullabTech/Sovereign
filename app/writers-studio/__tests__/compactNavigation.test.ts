import * as fs from 'fs';
import * as path from 'path';
import { STUDIO_MAP, STUDIO_MODES } from '../studioMap';

/**
 * WS2 · WRITE ⇄ DEVELOP — the mode bar survives a narrow viewport.
 *
 * Closer 3 of the founder walk of 2026-09-05 failed at `9c27572ce`: the shell
 * dropped the five-mode bar at compact width, and because DEVELOP is a mode
 * rather than a rail destination, a writer on a phone had no door from WRITE
 * to DEVELOP at all. The walk that had just been performed on a desktop could
 * not be performed there.
 *
 * These tests hold the two halves of that finding: the bar must render at every
 * width, and the rail must NOT be treated as a substitute for it — the rail
 * genuinely cannot carry the writer to Develop, and a future edit that removes
 * the bar again on the theory that "the rail covers it" would be wrong for a
 * reason worth writing down.
 */

const read = (...p: string[]) => fs.readFileSync(path.join(__dirname, '..', ...p), 'utf8');
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '');

const shell = strip(read('studio', 'WriterStudioShell.tsx'));
const modeBar = strip(read('studio', 'StudioModeBar.tsx'));

const header = shell.slice(shell.indexOf('<header'), shell.indexOf('</header>'));

describe('the mode bar is rendered at every width', () => {
  it('sits in the studio header', () => {
    expect(header).toContain('<StudioModeBar');
  });

  it('is not conditioned away when the viewport is compact', () => {
    expect(header).not.toMatch(/!compact\s*&&/);
  });

  it('carries the Work into whichever mode is pressed', () => {
    expect(header).toMatch(/<StudioModeBar[\s\S]*?manuscriptId=\{manuscriptId\}/);
  });

  it('wraps onto its own line at compact rather than competing for the header row', () => {
    expect(header).toContain("flexBasis: '100%'");
    expect(header).toContain("flexWrap: compact ? 'wrap' : 'nowrap'");
  });

  it('scrolls rather than truncates when the labels outrun the viewport', () => {
    expect(header).toContain("overflowX: 'auto'");
  });

  it('keeps every label whole and unsqueezed while it scrolls', () => {
    expect(modeBar).toContain("whiteSpace: 'nowrap'");
    expect(modeBar).toContain('flexShrink: 0');
  });
});

describe('why the bar is load-bearing and the rail is not a substitute', () => {
  it('Develop is a live mode with somewhere to go', () => {
    const develop = STUDIO_MODES.find((m) => m.id === 'develop');
    expect(develop).toBeDefined();
    expect(develop!.availability).toBe('available');
    expect(develop!.href).toBeTruthy();
  });

  it('Develop is NOT a rail destination, so removing the bar strands it', () => {
    const railIds = STUDIO_MAP.flatMap((g) => g.destinations.map((d) => d.id));
    expect(railIds).not.toContain('develop');
  });

  it('every mode the bar calls available has somewhere to go', () => {
    for (const m of STUDIO_MODES) {
      if (m.availability === 'available') expect(m.href).toBeTruthy();
      else expect(m.href).toBeUndefined();
    }
  });
});
