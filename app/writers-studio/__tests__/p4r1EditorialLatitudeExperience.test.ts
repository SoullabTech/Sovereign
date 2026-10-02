import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('Writer Studio editorial latitude experience', () => {
  const room = read('app/dev/writers-studio-pc3-live/IsolatedEditorialRoom.tsx');
  const dance = read('app/dev/writers-studio-pc3-live/EditorialDancePanel.tsx');
  const controller = read('app/dev/writers-studio-pc3-live/P4R1WriteEditController.tsx');
  const scope = read('lib/manuscript/editorialScope/contract.ts');

  it('makes light-to-heavy edit authority visible in writer language', () => {
    expect(room).toContain("1: 'Light'");
    expect(room).toContain("5: 'Heavy'");
    expect(room).toContain('Light stays close to your wording. Heavy allows a larger recast.');
    expect(room).toContain('Your voice remains the reference');
  });

  it('keeps paragraph removal separate from edit strength', () => {
    expect(room).toContain('Allow paragraph-removal proposals');
    expect(room).toContain('Separate permission; never implied by the slider.');
    expect(scope).toContain('mayRemoveParagraphs: false');
  });

  it('keeps explanation depth separate from proposal scope', () => {
    expect(controller).toContain("text + '\\n\\n' + editorialDirective(editorialDepth)");
    expect(controller).toContain('latitude: editLatitude');
    expect(controller).toContain('mayRemoveParagraphs');
    expect(scope).toContain('judgeProposalScope');
  });

  it('makes every proposed edit inspectable and adjustable', () => {
    expect(dance).toContain('What changed');
    expect(dance).toContain('Reader effect');
    expect(dance).toContain('What I protected');
    expect(dance).toContain('Make it lighter');
    expect(dance).toContain('Keep more of mine');
    expect(dance).toContain('Go a little further');
    expect(dance).toContain('Another option');
    expect(dance).toContain('Restore a part');
    expect(dance).toContain('Treat reader effect as a hypothesis');
  });

  it('fails closed when MAIA proposes beyond the chosen latitude', () => {
    expect(controller).toContain('This revision goes beyond your current');
    expect(controller).toContain('Nothing was changed.');
    expect(scope).toContain('proposal beyond the latitude is refused');
  });
});
