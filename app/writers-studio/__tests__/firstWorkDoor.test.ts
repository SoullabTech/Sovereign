/**
 * WS-FIRST-WORK-DOOR-01 — an empty Studio must have a real writing door.
 *
 * A first-time writer has no Work and no manuscript. The empty-state primary
 * action must therefore perform the already-wired `onBegin` act directly.
 * Merely toggling UI state is not enough: that was Andrea Fagan's witnessed
 * failure, where the state changed but the form lived outside the empty branch.
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const SRC = readFileSync(join(__dirname, '..', 'HomeView.tsx'), 'utf8');
const CODE = SRC.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');

const emptyBranch = CODE.slice(
  CODE.indexOf("kind === 'begin' ? ("),
  CODE.indexOf("{searchable ? (", CODE.indexOf("kind === 'begin' ? (")),
);

describe('WS-FIRST-WORK-DOOR-01 — empty Studio begins writing in one act', () => {
  it('the empty-state primary action creates the blank Work/manuscript path directly', () => {
    expect(emptyBranch).toContain("() => onBegin('')");
    expect(emptyBranch).not.toContain('onClick={() => setBeginning(true)}');
  });

  it('keeps Import writing as the alternate arrival path', () => {
    expect(emptyBranch).toContain('href={IMPORT_HREF}');
    expect(emptyBranch).toContain('Import writing');
  });

  it('prevents duplicate begin acts while the first one is in flight', () => {
    expect(emptyBranch).toContain('disabled={busy}');
  });
});
