/**
 * CONVERSATION-STAGE · step 2 (founder rulings Q1–Q6, 2026-11-05) — Design 1B's
 * "take me there" buttons work wherever MAIA is told she may offer them.
 *
 * The Work conversation tells MAIA she may offer a Studio control, but its
 * button renders only when the room passes `onStudioPlace`. Only Write did, so
 * in Develop and Review the button MAIA offered was silently dropped.
 */
import fs from 'node:fs';
import path from 'node:path';
import { studioPlaceHref, STUDIO_PLACE_HASH } from '@/lib/writersStudio/studioActions';

const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const read = (p: string) => strip(fs.readFileSync(path.join(process.cwd(), p), 'utf8'));

/** Every <WorkConversation …/> element in a file, as source. */
function conversations(source: string): string[] {
  const out: string[] = [];
  let at = source.indexOf('<WorkConversation');
  while (at !== -1) {
    const end = source.indexOf('/>', at);
    out.push(source.slice(at, end));
    at = source.indexOf('<WorkConversation', end);
  }
  return out;
}

describe('take me there: every room that shows MAIA a Studio control can follow it', () => {
  for (const room of [
    'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx',
    'app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx',
    'app/dev/writers-studio-pc3-live/P4R1Pc3WriteEditView.tsx',
  ]) {
    it(`${path.basename(room)} passes onStudioPlace to every Work conversation`, () => {
      const found = conversations(read(room));
      expect(found.length).toBeGreaterThan(0);
      for (const el of found) expect(el).toMatch(/onStudioPlace=\{/);
    });
  }

  it('leaving for Develop clears the room state and lands on the control, never pressing it', () => {
    const href = studioPlaceHref('/writers-studio', 'mode=review&reviewRun=r1&reviewFinding=f2&work=w1', 'editorial-pass');
    expect(href).toBe('/writers-studio?mode=develop&work=w1#editorial-pass');
    expect(studioPlaceHref('/writers-studio', 'mode=write&developField=arc', 'develop-overview'))
      .toBe('/writers-studio?mode=develop#read-this-chapter');
    expect(STUDIO_PLACE_HASH['develop-overview']).toBe('read-this-chapter');
  });

  it('Write and Review share the one navigation, so they cannot drift', () => {
    expect(read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx')).toContain('studioPlaceHref(');
    expect(read('app/dev/writers-studio-pc3-live/P4R1ReviewController.tsx')).toContain('studioPlaceHref(');
  });

  it('inside Develop, the click returns to Overview and reveals the control without reloading', () => {
    const develop = read('app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx');
    expect(develop).toMatch(/onField\('overview'\)[\s\S]{0,200}revealStudioPlace\(/);
  });
});
