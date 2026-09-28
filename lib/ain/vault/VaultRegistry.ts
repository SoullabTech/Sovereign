import 'server-only';

import path from 'node:path';
import type {
  AinVaultAlias,
  AinVaultScopeDefinition,
} from './types';

const READ_EXTENSIONS = Object.freeze(['.md', '.txt', '.canvas']);

const activeRoot =
  process.env.AIN_VAULT_ACTIVE_PATH
  || '/Users/soullab/Library/Mobile Documents/iCloud~md~obsidian/Documents/AIN';

const foundationalRoot =
  process.env.AIN_VAULT_FOUNDATIONAL_PATH
  || '/Users/soullab/Documents/AIN/AIN Consciousness Intelligence System';

const maiaConsciousnessRoot =
  process.env.MAIA_CONSCIOUSNESS_VAULT_PATH
  || '/Users/soullab/Obsidian Vaults/MAIA-Consciousness';
export const AIN_VAULT_SCOPES: Readonly<Record<AinVaultAlias, AinVaultScopeDefinition>> =
  Object.freeze({
    AIN_ACTIVE: Object.freeze({
      alias: 'AIN_ACTIVE',
      displayName: 'AIN Active',
      description: 'Broad active AIN/Obsidian environment on the founder Mac.',
      rootPath: activeRoot,
      authorityKind: 'founder_personal_development_archive',
      readEligible: true,
      writeEligible: false,
      allowedExtensions: READ_EXTENSIONS,
      deniedPrefixes: Object.freeze([
        '.obsidian',
        '.trash',
        '_ARCHIVE_CLEANUP',
        '_EA-Working-Vault-2024-11_to_2025-02',
        '_MAIA_SYSTEM/05-Soullab-Dev-Team/Clients',
        '_MAIA_SYSTEM/05-Soullab-Dev-Team/therapy Sessions',
      ]),
    }),
    AIN_FOUNDATIONAL: Object.freeze({
      alias: 'AIN_FOUNDATIONAL',
      displayName: 'AIN Foundational',
      description: 'Focused AIN Consciousness Intelligence System architecture corpus.',
      rootPath: foundationalRoot,
      authorityKind: 'founder_architectural_corpus',
      readEligible: true,
      writeEligible: false,
      allowedExtensions: READ_EXTENSIONS,
      deniedPrefixes: Object.freeze(['.obsidian', '.trash']),
    }),
    MAIA_CONSCIOUSNESS: Object.freeze({
      alias: 'MAIA_CONSCIOUSNESS',
      displayName: 'MAIA Consciousness',
      description: 'Curated source, synthesis, application and field-note vault.',
      rootPath: maiaConsciousnessRoot,
      authorityKind: 'curated_source_synthesis',
      readEligible: true,
      writeEligible: false,
      allowedExtensions: READ_EXTENSIONS,
      deniedPrefixes: Object.freeze(['.obsidian', '.trash']),
    }),
  });
export function isAinVaultAlias(value: unknown): value is AinVaultAlias {
  return typeof value === 'string'
    && Object.prototype.hasOwnProperty.call(AIN_VAULT_SCOPES, value);
}

export function getAinVaultScope(alias: AinVaultAlias): AinVaultScopeDefinition {
  return AIN_VAULT_SCOPES[alias];
}

export function normalizedRelativeVaultPath(input: string): string {
  if (typeof input !== 'string') throw new Error('Vault path must be a string');
  const normalized = input.replaceAll('\\', '/').replace(/^\.\//, '').trim();
  // Empty is the canonical root locator for list operations. Source reads still
  // require a non-empty relativePath at their API/parser boundary.
  if (!normalized) return '';
  if (normalized.startsWith('/') || normalized.includes('\0')) {
    throw new Error('Vault path must be relative to its admitted root');
  }
  const clean = path.posix.normalize(normalized);
  if (clean === '..' || clean.startsWith('../')) {
    throw new Error('Vault path escapes the admitted root');
  }
  return clean === '.' ? '' : clean;
}
export function isDeniedVaultPath(
  scope: AinVaultScopeDefinition,
  relativePath: string,
): boolean {
  const clean = relativePath.replaceAll('\\', '/').replace(/^\.\//, '');
  return scope.deniedPrefixes.some((prefix) =>
    clean === prefix || clean.startsWith(prefix + '/'),
  );
}

export function isAllowedVaultExtension(
  scope: AinVaultScopeDefinition,
  relativePath: string,
): boolean {
  const ext = path.extname(relativePath).toLowerCase();
  return scope.allowedExtensions.includes(ext);
}
