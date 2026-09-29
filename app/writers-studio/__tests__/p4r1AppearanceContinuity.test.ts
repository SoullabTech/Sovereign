import { ATMOSPHERE_LIST } from '@/app/writers-studio/atmosphere/atmospheres';
import { appearanceVars } from '@/app/writers-studio/full-redesign/tokens';

const names = ATMOSPHERE_LIST.map((item) => item.name);

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
