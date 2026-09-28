export type AinVaultAlias =
  | 'AIN_ACTIVE'
  | 'AIN_FOUNDATIONAL'
  | 'MAIA_CONSCIOUSNESS';

export type AinVaultAuthorityKind =
  | 'founder_personal_development_archive'
  | 'founder_architectural_corpus'
  | 'curated_source_synthesis';

export interface AinVaultScopeDefinition {
  readonly alias: AinVaultAlias;
  readonly displayName: string;
  readonly description: string;
  readonly rootPath: string;
  readonly authorityKind: AinVaultAuthorityKind;
  readonly readEligible: true;
  readonly writeEligible: false;
  readonly allowedExtensions: readonly string[];
  readonly deniedPrefixes: readonly string[];
}
export interface AinVaultScopePublic {
  alias: AinVaultAlias;
  displayName: string;
  description: string;
  authorityKind: AinVaultAuthorityKind;
  readEligible: true;
  writeEligible: false;
  available: boolean;
}

export interface AinVaultSourceRef {
  vaultAlias: AinVaultAlias;
  relativePath: string;
  heading?: string;
}

export interface AinVaultProvenance {
  vaultAlias: AinVaultAlias;
  relativePath: string;
  heading: string | null;
  lineStart: number | null;
  lineEnd: number | null;
  fileSha256: string;
  contentSha256: string;
  modifiedAt: string;
  fileBytes: number;
  authorityKind: AinVaultAuthorityKind;
}
export interface AinVaultReadResult {
  content: string;
  provenance: AinVaultProvenance;
}

export interface AinVaultSearchMatch {
  line: number;
  snippet: string;
}

export interface AinVaultSearchResult {
  vaultAlias: AinVaultAlias;
  relativePath: string;
  title: string;
  score: number;
  modifiedAt: string;
  matches: AinVaultSearchMatch[];
}

export interface AinVaultDirectoryEntry {
  name: string;
  relativePath: string;
  kind: 'directory' | 'file';
  extension: string | null;
  modifiedAt: string;
}
export interface AinVaultLink {
  target: string;
  heading: string | null;
  aliasText: string | null;
}

export interface AinVaultBacklink {
  relativePath: string;
  line: number;
  snippet: string;
}

export interface AinVaultLinksResult {
  source: AinVaultProvenance;
  outbound: AinVaultLink[];
  backlinks: AinVaultBacklink[];
}

export interface AinVaultResolvedContextSource extends AinVaultReadResult {
  ref: AinVaultSourceRef;
}
