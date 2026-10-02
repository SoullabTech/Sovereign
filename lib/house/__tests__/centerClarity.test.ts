import fs from 'node:fs';
import path from 'node:path';
import { placeById, DEFAULT_CENTER_IDS } from '../catalog';

const root = process.cwd();
const page = fs.readFileSync(path.join(root, 'app/house/page.tsx'), 'utf8');
const css = fs.readFileSync(path.join(root, 'app/house/house.module.css'), 'utf8');

describe('Home center clarity', () => {
  it('uses the persisted studio slot for member-facing Vision Studio', () => {
    const studio = placeById('studio');
    expect(studio?.label).toBe('Vision Studio');
    expect(studio?.href).toBe('/maia/vision-studio?from=house');
    expect(studio).not.toHaveProperty('studioRequired', true);
    expect(DEFAULT_CENTER_IDS).toContain('studio');
  });

  it('explains the primary spaces before entry', () => {
    expect(page).toContain('YOUR SPACES');
    expect(page).toContain('Choose where you want to work.');
    expect(page).toContain('Each space holds a different kind of attention.');
  });

  it('makes primary spaces visibly behave like doors', () => {
    expect(css).toContain("content: 'Enter  →'");
    expect(css).toContain('cursor: pointer');
    expect(css).toContain('.world:hover, .world:focus-visible');
  });
});