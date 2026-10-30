import postcss from 'postcss';
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
    // Inspect actual chooser declarations across the whole sheet, including
    // media queries; unrelated appended components do not belong to this contract.
    const inspect=(source:string)=>{
      const rules:any[]=[];
      postcss.parse(source).walkRules(rule=>{if(rule.selectors.some(s=>/\.p4r1-theme-(?:menu|trigger|swatch|popover|title|option)(?![\w-])/.test(s)))rules.push(rule);});
      expect(rules.length).toBeGreaterThan(8);
      const declarations=rules.flatMap(rule=>rule.nodes.filter((n:any)=>n.type==='decl'));
      expect(declarations.some((d:any)=>d.prop==='background'&&d.value.includes('--ws-ground-raised'))).toBe(true);
      expect(declarations.some((d:any)=>d.prop==='color'&&d.value.includes('--ws-ink-primary'))).toBe(true);
      expect(declarations.some((d:any)=>d.prop==='border'&&d.value.includes('--ws-rule'))).toBe(true);
      for(const d of declarations){if(/^(?:background|color|border)(?:-|$)/.test(d.prop))expect(d.value).not.toMatch(/--fr-/);}
    };
    inspect(p4css);
    expect(()=>inspect(p4css+'\n.p4r1-theme-popover{background:var(--fr-panel)}')).toThrow();
    expect(()=>inspect('/* chooser removed */')).toThrow();
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
