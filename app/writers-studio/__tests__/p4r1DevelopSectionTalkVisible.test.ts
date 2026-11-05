/**
 * Founder walk 2026-11-05: selecting a section in Develop showed "Section
 * selected" with no way to talk to MAIA. The panel's "Talk with MAIA" and
 * lens buttons were rendered but hidden by a blanket `display:none` meant
 * for the retired multi-button ribbon, because both share `.p4r1-locus-actions`.
 */
import fs from 'node:fs';
import path from 'node:path';

const css = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-p4r1/p4r1-live.css'), 'utf8');
const view = fs.readFileSync(path.join(process.cwd(), 'app/dev/writers-studio-pc3-live/P4R1DevelopView.tsx'), 'utf8');

function rules(source: string): Array<{ selector: string; body: string }> {
  const stripped = source.replace(/\/\*[\s\S]*?\*\//g, '');
  const out: Array<{ selector: string; body: string }> = [];
  const re = /([^{}]+)\{([^{}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(stripped))) out.push({ selector: m[1].trim(), body: m[2] });
  return out;
}

/** Does a single selector match an element carrying `classes`? Class-only check. */
function selectorHitsActions(selector: string, classes: string[]): boolean {
  const last = selector.trim().split(/\s+|>/).filter(Boolean).pop() || '';
  if (!last.startsWith('.p4r1-locus-actions') || /::?before|::?after|\s|button/.test(last.replace(/:not\([^)]*\)/g, ''))) {
    if (!/^\.p4r1-locus-actions(\.|:not|$)/.test(last)) return false;
  }
  const required = [...last.replace(/:not\([^)]*\)/g, '').matchAll(/\.([\w-]+)/g)].map(x => x[1]);
  const excluded = [...last.matchAll(/:not\(\.([\w-]+)\)/g)].map(x => x[1]);
  if (/::?(before|after)/.test(last)) return false;
  return required.every(c => classes.includes(c)) && !excluded.some(c => classes.includes(c));
}

function hiddenFor(classes: string[]): boolean {
  return rules(css).some(({ selector, body }) =>
    /display\s*:\s*none/.test(body) &&
    selector.split(',').some(s => selectorHitsActions(s, classes)));
}

describe('Develop section panel: talking to MAIA stays reachable', () => {
  it('renders Talk with MAIA inside the relational actions', () => {
    const at = view.indexOf('p4r1-locus-actions p4r1-locus-actions--relational');
    expect(at).toBeGreaterThan(-1);
    expect(view.slice(at, at + 900)).toMatch(/Talk with MAIA/);
  });

  it('does not hide the relational section actions', () => {
    expect(hiddenFor(['p4r1-locus-actions', 'p4r1-locus-actions--relational'])).toBe(false);
  });

  it('still hides the retired multi-button ribbon (the check can fail)', () => {
    expect(hiddenFor(['p4r1-locus-actions'])).toBe(true);
  });
});
