/**
 * Renaming a Work (writer walk 2026-11-21). Unit assertions over the key
 * contract, plus STRUCTURAL assertions that the drawer is wired to it. The
 * structural half reads source; it is a regression guard, not a behavioural
 * reproduction — the decisive acceptance is the browser walk recorded on the PR.
 */
import fs from 'fs';
import path from 'path';
import { nameEditKeyAction } from '../workNameEdit';

const drawer = () =>
  fs.readFileSync(
    path.resolve(__dirname, '../../../app/writers-studio/canvas/WorkDrawer.tsx'),
    'utf8',
  );

describe('nameEditKeyAction', () => {
  it('Enter keeps the name and Escape leaves it', () => {
    expect(nameEditKeyAction('Enter', false)).toBe('save');
    expect(nameEditKeyAction('Escape', false)).toBe('cancel');
  });

  it('Enter while composing (IME) is never a save', () => {
    expect(nameEditKeyAction('Enter', true)).toBeNull();
    expect(nameEditKeyAction('Escape', true)).toBeNull();
  });

  it('ordinary typing does nothing but type', () => {
    for (const key of ['a', 'A', ' ', 'Backspace', 'Tab', 'ArrowLeft']) {
      expect(nameEditKeyAction(key, false)).toBeNull();
    }
  });
});

describe('the Work drawer rename box', () => {
  const src = drawer();
  const box = src.slice(src.indexOf('placeholder="Its name, when you know it"') - 900, src.indexOf('leave it'));

  it('selects the old name when it opens, so typing replaces it', () => {
    expect(box).toMatch(/onFocus=\{\(e\) => e\.currentTarget\.select\(\)\}/);
    expect(box).toMatch(/autoFocus/);
  });

  it('routes keys through the shared contract and keep through the same save', () => {
    expect(box).toMatch(/nameEditKeyAction\(e\.key, e\.nativeEvent\.isComposing\)/);
    expect(box.match(/saveName\(work\.id\)/g)?.length).toBe(2);
  });

  it('stacks the buttons under the box instead of beside it', () => {
    expect(box).toMatch(/className="flex flex-col gap-2"/);
    expect(box).not.toMatch(/className="flex items-center gap-2"/);
  });
});
