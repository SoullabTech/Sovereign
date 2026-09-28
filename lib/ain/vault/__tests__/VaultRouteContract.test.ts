import fs from 'node:fs';
import path from 'node:path';

const read = (relative: string) =>
  fs.readFileSync(path.resolve(process.cwd(), relative), 'utf8');

const vaultRoute = read('app/api/sovereign/ain-vault/route.ts');
const maiaRoute = read('app/api/sovereign/app/maia/list/route.ts');
const registry = read('lib/ain/vault/VaultRegistry.ts');
const context = read('lib/ain/vault/ExplicitVaultContext.ts');
const producerRegistry = read('lib/maia/canonical-turn/producerRegistry.ts');
const shadow = read('lib/maia/canonical-turn/shadow.ts');
const maiaService = read('lib/sovereign/maiaService.ts');
const contextualHelp = read('components/onboarding/ContextualHelp.tsx');
const toolRegistry = read('config/toolRegistry.ts');
const toolRegistryCore = read('config/toolRegistry.core.ts');

describe('AIN Obsidian vault read-only boundary', () => {
  it('sovereign vault API is founder-authenticated and exposes only read actions', () => {
    expect(vaultRoute).toContain("requireFounder");
    expect(vaultRoute).toContain("Allowed actions: list, search, read, links, context-preview.");
    expect(vaultRoute).not.toContain('export async function PUT');
    expect(vaultRoute).not.toContain('export async function PATCH');
    expect(vaultRoute).not.toContain('export async function DELETE');
    expect(vaultRoute).not.toContain('userId is required');
  });
  it('registry admits named scopes and denies write authority', () => {
    for (const alias of ['AIN_ACTIVE', 'AIN_FOUNDATIONAL', 'MAIA_CONSCIOUSNESS']) {
      expect(registry).toContain(alias);
    }
    expect(registry).toContain('writeEligible: false');
    expect(registry).toContain("'.obsidian'");
    expect(registry).toContain("'_MAIA_SYSTEM/05-Soullab-Dev-Team/Clients'");
  });

  it('explicit source context preserves source identity and uncertainty', () => {
    expect(context).toContain('FOUNDER-SELECTED CURRENT-TURN CONTEXT');
    expect(context).toContain('not member memory');
    expect(context).toContain('not proof that a historical note is current or true');
    expect(context).toContain('If sources conflict, name the conflict');
    expect(context).toContain('content sha256:');
  });
  it('MAIA route destructures vaultSources out of arbitrary meta', () => {
    expect(maiaRoute).toContain('vaultSources: bodyVaultSources');
    expect(maiaRoute).toContain('Destructured out of meta');
    expect(maiaRoute).toContain('parseExplicitVaultSourceRefs(bodyVaultSources)');
  });

  it('requires founder authority before F1 and refuses Sanctuary vault context', () => {
    const authAt = maiaRoute.indexOf('const founderAuth = await requireFounder()');
    const f1At = maiaRoute.indexOf('TURN ACCEPTANCE BOUNDARY');
    expect(authAt).toBeGreaterThan(-1);
    expect(f1At).toBeGreaterThan(authAt);
    expect(maiaRoute).toContain('VAULT_CONTEXT_SANCTUARY_REFUSED');
    expect(maiaRoute).toContain('founderAuth.memberId !== userId');
  });
  it('registers vault evidence as a distinct canonical retrieved source class', () => {
    expect(producerRegistry).toContain("'retrieved.ain_vault'");
    expect(producerRegistry).toContain("authority: 'situate'");
    expect(producerRegistry).toContain("consentBasis: 'explicit current-turn vault selection'");
    expect(shadow).toContain("vaultContextAddendum: 'retrieved.ain_vault'");
  });

  it('re-resolves selected sources server-side and preserves a distinct vault source class', () => {
    expect(maiaRoute).toContain('ainVaultReadService.resolveContextSources(refs)');
    expect(maiaRoute).toContain('formatExplicitVaultContextAddendum(resolvedSources)');
    expect(maiaRoute).toContain('const vaultContextAddendum = explicitVaultContextAddendum || undefined');
    expect(maiaRoute).toContain('vaultContextAddendum, // 🗃️ Explicit founder-selected AIN vault sources');
    expect(maiaRoute).toContain('vaultSources: explicitVaultProvenance.length > 0');
    expect(maiaRoute).not.toContain('meta.vaultSources');
    expect(maiaRoute).not.toContain('governedKnowledgeAddendum = [');
  });

  it('carries the distinct vault channel through FAST, CORE and DEEP without automatic search', () => {
    expect(maiaService).toContain('const vaultContextBlock = vaultContextAddendum?.trim()');
    expect(maiaService).toContain('vaultContextAddendum: (meta as any)?.vaultContextAddendum');
    expect(maiaService).toContain('vaultContextConsumedInLocalStage');
    expect(maiaService).toContain("available.vaultCurrent && 'ainVaultCurrent'");
    expect(maiaService).not.toContain('ainVaultReadService.search');
  });

  it('removes stale member-facing claims of automatic Obsidian export', () => {
    expect(contextualHelp).not.toContain('All your journal entries automatically export to Obsidian');
    expect(contextualHelp).not.toContain("id: 'obsidian-export'");
    expect(toolRegistry).not.toContain('Export to your notes app or Obsidian vault');
    expect(toolRegistryCore).not.toContain('Export to your notes app or Obsidian vault');
  });
});
