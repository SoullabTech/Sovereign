import { readFileSync } from 'fs';
import { join } from 'path';
import { ATMOSPHERE_LIST } from '@/app/writers-studio/atmosphere/atmospheres';
import { appearanceVars } from '@/app/writers-studio/full-redesign/tokens';

const names = ATMOSPHERE_LIST.map((item) => item.name);
const p4page = readFileSync(join(process.cwd(), 'app/dev/writers-studio-p4r1/page.tsx'), 'utf8');
const p4css = readFileSync(join(process.cwd(), 'app/dev/writers-studio-p4r1/p4r1-live.css'), 'utf8');

describe('P4R1 appearance continuity', () => {
  it('restores the accepted member-chosen theme family', () => {
    expect(names).toEqual([
      'Day',
      'Evening',
      'Atelier',
      'Night Study',
      'Forest',
      'Cloud',
      'Midnight',
    ]);
  });


  it('keeps the theme chooser on the Studio atmosphere membrane, not shell-local colour variables', () => {
    const start = p4css.indexOf('/* P4R1 appearance continuity: member-chosen Studio themes restored.');
    const block = p4css.slice(start);
    expect(start).toBeGreaterThanOrEqual(0);
    expect(block).toContain('background:var(--ws-ground-raised');
    expect(block).toContain('color:var(--ws-ink-primary');
    expect(block).toContain('border:1px solid var(--ws-rule');
    expect(block).not.toContain('background:var(--fr-panel)');
    expect(block).not.toContain('color:var(--fr-ink2)');
  });

  it('defaults P4R1 to Day only when no member choice has been remembered', () => {
    expect(p4page).toContain('<StudioAtmosphere defaultAtmosphere="day">');
  });

  it('pins Day to the accepted P4 light shell', () => {
    const vars = appearanceVars('day');
    expect(vars['--fr-ground']).toBe('#F3F3F3');
    expect(vars['--fr-panel']).toBe('#FEFEFE');
    expect(vars['--fr-title']).toBe('#08143B');
    expect(vars['--fr-action']).toBe('#1F6FC4');
  });

  it('pins Evening to the accepted blue P4 lower-light shell', () => {
    const vars = appearanceVars('evening');
    expect(vars['--fr-ground']).toBe('#0F1422');
    expect(vars['--fr-panel']).toBe('#171E30');
    expect(vars['--fr-title']).toBe('#EEF1F8');
    expect(vars['--fr-action']).toBe('#7FB0EA');
  });
});
