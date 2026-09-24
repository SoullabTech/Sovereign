import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const read = (rel: string) => readFileSync(join(process.cwd(), rel), 'utf8');

describe('qualified Keep identities after J6', () => {
  it('exact member words remain explicitly named Keep this moment', () => {
    const oracle = read('components/OracleConversation.tsx');
    expect(oracle).toContain('Keep this moment');
    expect(oracle).toContain('sourceTurnId: message.id');
    expect(oracle).toContain('href="/maia/moments"');
  });

  it('the Field doorway is named My Keeps, not generic Open Keep', () => {
    const oracle = read('components/OracleConversation.tsx');
    expect(oracle).toContain('aria-label="My Keeps"');
    expect(oracle).not.toContain('aria-label="Open Keep"');
  });

  it('Reflection creation is named Reflect / Capture a reflection', () => {
    const page = read('app/maia/page.tsx');
    const drawer = read('components/ui/SacredLabDrawer.tsx');
    const tooltip = read('components/help/FeatureTooltip.tsx');

    expect(page).toContain('>Reflect</span>');
    expect(page).toContain('Capture a reflection from this conversation');
    expect(drawer).toContain("label: 'Capture a reflection'");
    expect(tooltip).toContain("label: 'Reflect'");
  });

  it('arrival does not offer a pre-conversation Keep that secretly opens Reflection', () => {
    const arrival = read('components/maia/MaiaArrivalField.tsx');
    const oracle = read('components/OracleConversation.tsx');
    expect(arrival).not.toContain('onKeep');
    expect(oracle).not.toMatch(/onKeep=\{\(\) => window\.dispatchEvent\([\s\S]*capture-spirit/);
  });

  it('Moments explains KEEP != REOPEN and exposes the separate return gesture', () => {
    const moments = read('app/maia/moments/page.tsx');
    expect(moments).toContain('does not give MAIA permission to');
    expect(moments).toContain('Allow return');
    expect(moments).toContain('Reseal');
    expect(moments).toContain('Sealed');
    expect(moments).toContain('May return');
  });

  it('Reflection save copy no longer calls the act generic Keep', () => {
    const oracle = read('components/OracleConversation.tsx');
    expect(oracle).toContain("toast.success('Reflection saved')");
    expect(oracle).toContain('Save this reflection first');
    expect(oracle).not.toContain("toast.success('Kept')");
  });
});
