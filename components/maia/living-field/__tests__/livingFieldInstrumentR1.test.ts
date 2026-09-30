import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(
  path.join(process.cwd(), 'components/maia/living-field/LivingFieldInstrument.tsx'),
  'utf8',
);

describe('VISUAL-FIELD-RUNTIME-01R1 — bounded WORLD instrument', () => {
  it('offers the five elemental regions and one-level inward traversal', () => {
    for (const label of ['Fire', 'Water', 'Earth', 'Air', 'Aether']) {
      expect(source).toContain(`label: '${label}'`);
    }
    expect(source).toContain("children: ['fire', 'water', 'earth', 'air', 'aether']");
    expect(source).toContain("children: ['ignition', 'vision', 'possibility', 'creation']");
    expect(source).toContain('← Wider');
  });

  it('keeps the traversal inside session-local React state', () => {
    expect(source).toContain("const [open, setOpen] = useState(false)");
    expect(source).toContain("const [origin, setOrigin] = useState('')");
    expect(source).toContain("const [focusKey, setFocusKey] = useState('root')");
    expect(source).toContain('setFocusKey(node.key)');
    expect(source).toContain('setFocusKey(parent.key)');
  });

  it('does not persist, call a network route, or seed MAIA', () => {
    expect(source).not.toContain('apiFetch(');
    expect(source).not.toMatch(/\bfetch\s*\(/);
    expect(source).not.toContain('localStorage');
    expect(source).not.toContain('sessionStorage');
    expect(source).not.toContain('seedMaiaPrompt');
    expect(source).not.toContain('openMaiaWith');
  });

  it('mounts additively without replacing the existing Living Field', () => {
    const dashboard = fs.readFileSync(
      path.join(process.cwd(), 'components/maia/living-field/PersonalLivingFieldDashboard.tsx'),
      'utf8',
    );
    expect(dashboard).toContain('<LivingFieldInstrument />');
    expect(dashboard).toContain('<LivingConstellationPanel focus="living" />');
    expect(dashboard).toContain('<LifeFacetFlowPanel />');
    expect(dashboard).toContain('Living Field Dimensions');
  });
});
