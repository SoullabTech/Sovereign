/**
 * THE REBUILT ROOM BELONGS TO THE WRITER, NOT TO A CONSTANT.
 *
 * The rebuilt Writer's Studio consumed the Studio's semantic variables from
 * its first line — and then, at the top of its render, overwrote them:
 *
 *     const cloud = atmosphereVariables(ATMOSPHERES.cloud);
 *
 * spread onto the room's own <main>. The provider above it carried the
 * writer's chosen atmosphere all the way down, and the last element in the
 * chain declared Cloud regardless. A member could choose Forest in one room
 * and Home would honour it, the Canvas would honour it, and the room the
 * rebuild exists to become would not.
 *
 * That defect is invisible to every test that asks "does appearance work?",
 * because appearance did work — everywhere the test looked. These obligations
 * ask the narrower question that would have caught it: does THIS room name an
 * atmosphere of its own?
 *
 * There is one appearance system. A room may consume it. A room may not
 * decide it, store it, or keep a private copy.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const ROOM = join(__dirname, '..', 'rebuild', 'RebuildStudioClient.tsx');

/* Comments are stripped before every scan. A file that documents the thing it
   refuses must not fail for saying so — the C21 lesson, applied up front. */
function source(path: string): string {
  return readFileSync(path, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '');
}

describe('the rebuilt room names no atmosphere of its own', () => {
  it('⛔ never constructs atmosphere variables', () => {
    /* The defect itself. Either of these names in this file means the room is
       deciding its own appearance again. */
    const room = source(ROOM);
    expect(room).not.toContain('atmosphereVariables');
    expect(room).not.toContain('ATMOSPHERES');
  });

  it('⛔ never names a specific atmosphere', () => {
    const room = source(ROOM);
    for (const id of ['atelier', 'night-study', 'forest', 'cloud', 'midnight']) {
      expect(room).not.toContain(`'${id}'`);
      expect(room).not.toContain(`"${id}"`);
    }
  });

  it('⛔ never emits the page gradient — a page may not repaint its room', () => {
    expect(source(ROOM)).not.toContain('--ws-bg');
  });
});

describe('the rebuilt room consumes the one appearance system', () => {
  it('takes the page from the shared hook', () => {
    expect(source(ROOM)).toContain('useCanvasSurfaceVariables()');
  });

  it('applies the page to exactly one element, and it is the writing field', () => {
    const room = source(ROOM);
    const applications = room.match(/\.\.\.canvasSurfaceVars/g) ?? [];
    expect(applications).toHaveLength(1);
    expect(room).toContain('data-panel-role="writing-field"');
  });

  it('mounts the SAME control Home and the Canvas mount', () => {
    const room = source(ROOM);
    expect(room).toContain("from '../atmosphere/AppearanceMenu'");
    expect(room).toContain('<AppearanceMenu />');
  });

  it('⛔ holds no appearance state, and no second way to persist it', () => {
    /* A room that could write the preference could disagree with the rooms
       that already do. The provider owns the choice; this room reads it. */
    const room = source(ROOM);
    expect(room).not.toContain('/api/sovereign/studio/atmosphere');
    expect(room).not.toContain('ws_atmosphere');
    expect(room).not.toContain('ws_canvas_surface');
    expect(room).not.toContain('function StudioAtmosphere');
  });
});

describe('Pure Canvas is still nothing but the page', () => {
  it('the control lives inside the header, which Pure Canvas removes', () => {
    /* §10: no Appearance toolbar inside Pure Canvas. Structural, not a
       promise — the header is conditional on !canvasExpanded, and the control
       is inside it, so the writer cannot be handed chrome they asked to lose. */
    const room = source(ROOM);
    const header = room.indexOf('{!canvasExpanded && !development && (<header');
    const mount = room.indexOf('<AppearanceMenu />');
    const headerEnd = room.indexOf('</header>)}');
    expect(header).toBeGreaterThan(-1);
    expect(headerEnd).toBeGreaterThan(header);
    expect(mount).toBeGreaterThan(header);
    expect(mount).toBeLessThan(headerEnd);
  });

  it('the page survives Pure Canvas — the field is the same element in both', () => {
    /* The writing field carries the material and carries its pure-mode class.
       One element, two states: entering Pure Canvas cannot drop the page,
       because there is no second element to drop it from. */
    const room = source(ROOM);
    const field = room.slice(room.indexOf('data-panel-role="writing-field"') - 400);
    expect(field.slice(0, 600)).toContain('wsr-pure-manuscript');
  });
});

describe('appearance did not touch identity', () => {
  it('the room still resolves its manuscript from the address, once', () => {
    /* §29. Appearance is a visual concern; if this count ever moves in an
       appearance commit, something else came with it. */
    const reads = source(ROOM).match(/params\?\.get\('m'\)/g) ?? [];
    expect(reads).toHaveLength(1);
  });
});
