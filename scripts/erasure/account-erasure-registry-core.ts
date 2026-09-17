import { createHash } from 'crypto';
import { readFileSync, readdirSync } from 'fs';
import { join, relative } from 'path';

export const IDENTITY_COLUMNS = [
  'user_id',
  'member_id',
  'owner_id',
  'author_id',
  'created_by',
  'subject_member_id',
  'participant_id',
  'actor_id',
  'from_member_id',
  'to_member_id',
  'client_member_id',
  'practitioner_member_id',
] as const;

export type ErasureDisposition =
  | 'erase'
  | 'revoke'
  | 'tombstone'
  | 'retain'
  | 'refuse'
  | 'no_op';

export type DeleteAction = 'CASCADE' | 'RESTRICT' | 'NO ACTION' | 'SET NULL';

export interface RegistryLocus {
  table: string;
  identityColumns: string[];
  source: 'baseline' | 'post_baseline';
  disposition: ErasureDisposition;
  memberLabel: string;
  bindingRule: string;
  authorityReason: string;
  verificationRule: string;
  adapterKey: string;
  requiresS5: boolean;
}

export interface RegistryFkDeclaration {
  declarationKey: string;
  sourceFile: string;
  line: number;
  table: string;
  onDelete: DeleteAction;
  disposition: ErasureDisposition;
  authorityReason: string;
}

export interface RegistryLedgerChildDeclaration {
  declarationKey: string;
  sourceFile: string;
  line: number;
  table: string;
  onDelete: DeleteAction;
  disposition: 'retain';
  authorityReason: string;
}

export interface AccountErasureRegistry {
  version: string;
  seededAgainst: string;
  coverageOnly: true;
  activationProhibited: true;
  identityColumns: string[];
  baselineAnchor: {
    tables: number;
    memberBound: number;
  };
  migrationFkAnchor: {
    linkedTables: number;
    tableActionPairs: number;
    actions: Record<DeleteAction, number>;
  };
  memberBoundLoci: RegistryLocus[];
  memberForeignKeyDeclarations: RegistryFkDeclaration[];
  accountErasureLedgerChildren: RegistryLedgerChildDeclaration[];
}

interface CreateTableStatement {
  table: string;
  body: string;
  start: number;
  end: number;
}

export interface MemberBoundLocusDiscovery {
  table: string;
  identityColumns: string[];
  source: 'baseline' | 'post_baseline';
}

export interface MemberFkDiscovery {
  sourceFile: string;
  line: number;
  table: string;
  onDelete: DeleteAction;
  declarationKey: string;
}

export interface CensusResult {
  baselineTableCount: number;
  baselineMemberBoundCount: number;
  memberBoundLoci: MemberBoundLocusDiscovery[];
  memberForeignKeys: MemberFkDiscovery[];
  accountErasureLedgerChildren: MemberFkDiscovery[];
  fkLinkedTables: number;
  fkTableActionPairs: number;
  fkActionCounts: Record<DeleteAction, number>;
}

const BASELINE_REL = 'database/baseline/0001_baseline_2026-09-01.sql';
const MIGRATION_REL = 'database/migrations';

function scanBalancedBody(sql: string, openIndex: number): { body: string; end: number } | null {
  let depth = 1;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;
  let dollarTag: string | null = null;

  for (let i = openIndex + 1; i < sql.length; i++) {
    const ch = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }

    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        i += dollarTag.length - 1;
        dollarTag = null;
      }
      continue;
    }

    if (!inSingle && !inDouble && ch === '-' && next === '-') {
      inLineComment = true;
      i++;
      continue;
    }
    if (!inSingle && !inDouble && ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }

    if (!inSingle && !inDouble && ch === '$') {
      const tag = sql.slice(i).match(/^\$[A-Za-z0-9_]*\$/)?.[0];
      if (tag) {
        dollarTag = tag;
        i += tag.length - 1;
        continue;
      }
    }

    if (inSingle) {
      if (ch === "'" && next === "'") {
        i++;
        continue;
      }
      if (ch === "'") inSingle = false;
      continue;
    }

    if (inDouble) {
      if (ch === '"' && next === '"') {
        i++;
        continue;
      }
      if (ch === '"') inDouble = false;
      continue;
    }

    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }

    if (ch === '(') depth++;
    if (ch === ')') {
      depth--;
      if (depth === 0) {
        return { body: sql.slice(openIndex + 1, i), end: i + 1 };
      }
    }
  }
  return null;
}

export function extractCreateTableStatements(sql: string): CreateTableStatement[] {
  const out: CreateTableStatement[] = [];
  const start = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:"?public"?)\.)?"?([A-Za-z0-9_]+)"?\s*\(/gi;
  let match: RegExpExecArray | null;
  while ((match = start.exec(sql)) !== null) {
    const openIndex = start.lastIndex - 1;
    const scanned = scanBalancedBody(sql, openIndex);
    if (!scanned) continue;
    out.push({ table: match[1], body: scanned.body, start: match.index, end: scanned.end });
    start.lastIndex = scanned.end;
  }
  return out;
}


function extractCreateTableStatementsQuick(sql: string): CreateTableStatement[] {
  const out: CreateTableStatement[] = [];
  const re = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:"?public"?)\.)?"?([A-Za-z0-9_]+)"?\s*\(([\s\S]*?)\)\s*;/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql)) !== null) {
    out.push({ table: m[1], body: m[2], start: m.index, end: re.lastIndex });
  }
  return out;
}

function splitTopLevelClauses(body: string): string[] {
  const clauses: string[] = [];
  let start = 0;
  let depth = 0;
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    const next = body[i + 1];
    if (inLineComment) {
      if (ch === '\n') inLineComment = false;
      continue;
    }
    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i++;
      }
      continue;
    }
    if (inSingle) {
      if (ch === "'" && next === "'") {
        i++;
      } else if (ch === "'") {
        inSingle = false;
      }
      continue;
    }
    if (inDouble) {
      if (ch === '"' && next === '"') {
        i++;
      } else if (ch === '"') {
        inDouble = false;
      }
      continue;
    }
    if (ch === '-' && next === '-') {
      inLineComment = true;
      i++;
      continue;
    }
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i++;
      continue;
    }
    if (ch === "'") {
      inSingle = true;
      continue;
    }
    if (ch === '"') {
      inDouble = true;
      continue;
    }
    if (ch === '(') depth++;
    else if (ch === ')') depth--;
    else if (ch === ',' && depth === 0) {
      clauses.push(body.slice(start, i));
      start = i + 1;
    }
  }
  clauses.push(body.slice(start));
  return clauses;
}

function tableColumns(body: string): Set<string> {
  const columns = new Set<string>();
  const nonColumns = new Set(['constraint', 'primary', 'foreign', 'unique', 'check', 'exclude']);
  const commentFree = body
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/--.*$/gm, ' ');
  for (const clause of splitTopLevelClauses(commentFree)) {
    const token = clause.trim().match(/^"?([A-Za-z_][A-Za-z0-9_]*)"?\s+/)?.[1];
    if (!token || nonColumns.has(token.toLowerCase())) continue;
    columns.add(token);
  }
  return columns;
}

function migrationFiles(root: string): Array<{ rel: string; text: string }> {
  const dir = join(root, MIGRATION_REL);
  return readdirSync(dir)
    .filter((name) => name.endsWith('.sql'))
    .sort()
    .map((name) => ({ rel: `${MIGRATION_REL}/${name}`, text: readFileSync(join(dir, name), 'utf8') }));
}

function normalizeDeleteAction(value: string | undefined): DeleteAction {
  const action = (value ?? 'NO ACTION').toUpperCase().replace(/\s+/g, ' ').trim();
  if (action === 'CASCADE' || action === 'RESTRICT' || action === 'SET NULL' || action === 'NO ACTION') {
    return action;
  }
  throw new Error(`unsupported ON DELETE action: ${action}`);
}

function lineAt(text: string, index: number): number {
  let line = 1;
  for (let i = 0; i < index; i++) if (text.charCodeAt(i) === 10) line++;
  return line;
}

function nearestMemberFkTable(text: string, beforeIndex: number): string | null {
  const pre = text.slice(0, beforeIndex);
  const contexts: Array<{ end: number; table: string }> = [];
  for (const re of [
    /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:(?:"?public"?)\.)?"?([A-Za-z0-9_]+)"?/gi,
    /ALTER\s+TABLE(?:\s+ONLY)?\s+(?:(?:"?public"?)\.)?"?([A-Za-z0-9_]+)"?/gi,
  ]) {
    let m: RegExpExecArray | null;
    while ((m = re.exec(pre)) !== null) contexts.push({ end: re.lastIndex, table: m[1] });
  }
  if (contexts.length === 0) return null;
  contexts.sort((a, b) => a.end - b.end);
  return contexts[contexts.length - 1].table;
}

function discoverForeignKeysTo(root: string, targetTable: string): MemberFkDiscovery[] {
  const out: MemberFkDiscovery[] = [];
  const escaped = targetTable.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const targetRef = new RegExp(
    `REFERENCES\\s+(?:(?:"?public"?)\\.)?"?${escaped}"?\\s*\\(\\s*"?id"?\\s*\\)`,
    'gi',
  );

  for (const file of migrationFiles(root)) {
    targetRef.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = targetRef.exec(file.text)) !== null) {
      const table = nearestMemberFkTable(file.text, m.index);
      if (!table) throw new Error(`${file.rel}:${lineAt(file.text, m.index)} FK to ${targetTable} has no table context`);

      const tail = file.text.slice(targetRef.lastIndex);
      const comma = tail.indexOf(',');
      const semi = tail.indexOf(';');
      const cuts = [comma, semi].filter((n) => n >= 0);
      const segment = tail.slice(0, cuts.length ? Math.min(...cuts) : tail.length);
      const actionMatch = segment.match(/ON\s+DELETE\s+(CASCADE|RESTRICT|SET\s+NULL|NO\s+ACTION)/i);
      const onDelete = normalizeDeleteAction(actionMatch?.[1]);
      const line = lineAt(file.text, m.index);
      const declarationKey = `${file.rel}:${line}:${table}:${onDelete}`;
      out.push({ sourceFile: file.rel, line, table, onDelete, declarationKey });
    }
  }

  return out.sort((a, b) => a.declarationKey.localeCompare(b.declarationKey));
}

export function discoverMemberForeignKeys(root: string): MemberFkDiscovery[] {
  return discoverForeignKeysTo(root, 'members');
}

export function discoverAccountErasureLedgerChildren(root: string): MemberFkDiscovery[] {
  return discoverForeignKeysTo(root, 'account_erasure_acts');
}

export function discoverCensus(root: string): CensusResult {
  const baselineText = readFileSync(join(root, BASELINE_REL), 'utf8');
  const baselineTables = extractCreateTableStatements(baselineText);
  const baselineMap = new Map<string, Set<string>>();
  for (const table of baselineTables) baselineMap.set(table.table, tableColumns(table.body));

  const identitySet = new Set<string>(IDENTITY_COLUMNS);
  const baselineMember = new Map<string, string[]>();
  for (const [table, columns] of baselineMap) {
    const ids = [...columns].filter((c) => identitySet.has(c)).sort();
    if (ids.length) baselineMember.set(table, ids);
  }

  const current = new Map<string, Set<string>>();
  for (const [table, columns] of baselineMap) current.set(table, new Set(columns));

  for (const file of migrationFiles(root)) {
    // Two independent post-baseline instruments are unioned deliberately. The
    // balanced scanner is structurally stronger; the conservative regex catches
    // CREATE bodies whose comments / procedural fragments defeat one scanner.
    // Coverage governance prefers an explicit false positive over a silent false
    // negative: anything either instrument sees must be classified.
    for (const table of [
      ...extractCreateTableStatements(file.text),
      ...extractCreateTableStatementsQuick(file.text),
    ]) {
      const columns = tableColumns(table.body);
      const existing = current.get(table.table) ?? new Set<string>();
      for (const column of columns) existing.add(column);
      current.set(table.table, existing);
    }

    for (const identity of IDENTITY_COLUMNS) {
      const addColumn = new RegExp(
        `ALTER\\s+TABLE(?:\\s+ONLY)?\\s+(?:(?:"?public"?)\\.)?"?([A-Za-z0-9_]+)"?[\\s\\S]{0,800}?ADD\\s+COLUMN(?:\\s+IF\\s+NOT\\s+EXISTS)?\\s+"?${identity}"?\\b`,
        'gi',
      );
      let m: RegExpExecArray | null;
      while ((m = addColumn.exec(file.text)) !== null) {
        const columns = current.get(m[1]) ?? new Set<string>();
        columns.add(identity);
        current.set(m[1], columns);
      }
    }
  }

  const memberBoundLoci: MemberBoundLocusDiscovery[] = [];
  for (const [table, columns] of current) {
    const ids = [...columns].filter((c) => identitySet.has(c)).sort();
    if (!ids.length) continue;
    memberBoundLoci.push({
      table,
      identityColumns: ids,
      source: baselineMap.has(table) ? 'baseline' : 'post_baseline',
    });
  }
  memberBoundLoci.sort((a, b) => a.table.localeCompare(b.table));

  const memberForeignKeys = discoverMemberForeignKeys(root);
  const accountErasureLedgerChildren = discoverAccountErasureLedgerChildren(root);
  const tableActionPairs = new Set(memberForeignKeys.map((fk) => `${fk.table}|${fk.onDelete}`));
  const fkActionCounts: Record<DeleteAction, number> = {
    CASCADE: 0,
    RESTRICT: 0,
    'NO ACTION': 0,
    'SET NULL': 0,
  };
  for (const pair of tableActionPairs) {
    const action = pair.slice(pair.indexOf('|') + 1) as DeleteAction;
    fkActionCounts[action]++;
  }

  return {
    baselineTableCount: baselineTables.length,
    baselineMemberBoundCount: baselineMember.size,
    memberBoundLoci,
    memberForeignKeys,
    accountErasureLedgerChildren,
    fkLinkedTables: new Set(memberForeignKeys.map((fk) => fk.table)).size,
    fkTableActionPairs: tableActionPairs.size,
    fkActionCounts,
  };
}

export function buildCoverageRegistry(root: string, seededAgainst: string): AccountErasureRegistry {
  const census = discoverCensus(root);
  const memberBoundLoci: RegistryLocus[] = census.memberBoundLoci.map((locus) => {
    if (locus.table === 'account_erasure_acts') {
      return {
        ...locus,
        disposition: 'retain',
        memberLabel: 'account-erasure accountability record',
        bindingRule: `identity columns: ${locus.identityColumns.join(', ')}`,
        authorityReason: 'P5-A constitutional act record must survive the member row it governs.',
        verificationRule: 'durable_row_survives_member_erasure',
        adapterKey: 'ledger_retention',
        requiresS5: false,
      };
    }
    return {
      ...locus,
      disposition: 'refuse',
      memberLabel: 'stored account data',
      bindingRule: `identity columns: ${locus.identityColumns.join(', ')}`,
      authorityReason:
        'P5-A coverage-only seed: this locus is known, but no destructive adapter is authorized yet.',
      verificationRule: 'refusal_means_no_mutation',
      adapterKey: 'none',
      requiresS5: false,
    };
  });

  const memberForeignKeyDeclarations: RegistryFkDeclaration[] = census.memberForeignKeys.map((fk) => ({
    ...fk,
    disposition: 'refuse',
    authorityReason:
      'P5-A coverage-only seed: this implicit member FK effect must be manifested by a governed plan before activation.',
  }));

  const accountErasureLedgerChildren: RegistryLedgerChildDeclaration[] =
    census.accountErasureLedgerChildren.map((fk) => ({
      ...fk,
      disposition: 'retain',
      authorityReason:
        'P5-A constitutional ledger child: plan/execution history survives through the retained erasure act.',
    }));

  return {
    version: 'account-erasure-registry-v1',
    seededAgainst,
    coverageOnly: true,
    activationProhibited: true,
    identityColumns: [...IDENTITY_COLUMNS],
    baselineAnchor: {
      tables: census.baselineTableCount,
      memberBound: census.baselineMemberBoundCount,
    },
    migrationFkAnchor: {
      linkedTables: census.fkLinkedTables,
      tableActionPairs: census.fkTableActionPairs,
      actions: census.fkActionCounts,
    },
    memberBoundLoci,
    memberForeignKeyDeclarations,
    accountErasureLedgerChildren,
  };
}

export function validateRegistry(registry: AccountErasureRegistry, census: CensusResult): string[] {
  const failures: string[] = [];
  const allowed = new Set<ErasureDisposition>(['erase', 'revoke', 'tombstone', 'retain', 'refuse', 'no_op']);

  if (census.baselineTableCount !== 634 || census.baselineMemberBoundCount !== 302) {
    failures.push(
      `ANTI-VACUITY baseline parser drift: got ${census.baselineTableCount} tables / ${census.baselineMemberBoundCount} member-bound; expected 634 / 302`,
    );
  }

  if (census.fkLinkedTables !== 243 || census.fkTableActionPairs !== 264) {
    failures.push(
      `ANTI-VACUITY migration FK parser drift: got ${census.fkLinkedTables} linked tables / ${census.fkTableActionPairs} table-action pairs; expected 243 / 264`,
    );
  }
  const expectedActions: Record<DeleteAction, number> = {
    CASCADE: 161,
    RESTRICT: 24,
    'NO ACTION': 47,
    'SET NULL': 32,
  };
  for (const action of Object.keys(expectedActions) as DeleteAction[]) {
    if (census.fkActionCounts[action] !== expectedActions[action]) {
      failures.push(
        `ANTI-VACUITY FK ${action}: got ${census.fkActionCounts[action]}, expected ${expectedActions[action]}`,
      );
    }
  }

  if (!registry.coverageOnly || !registry.activationProhibited) {
    failures.push('registry must remain coverageOnly=true and activationProhibited=true before route activation');
  }

  const discoveredLoci = new Map(census.memberBoundLoci.map((l) => [l.table, l]));
  const registeredLoci = new Map(registry.memberBoundLoci.map((l) => [l.table, l]));

  for (const [table, locus] of discoveredLoci) {
    const registered = registeredLoci.get(table);
    if (!registered) {
      failures.push(`UNCLASSIFIED member-bound locus: ${table}`);
      continue;
    }
    if (JSON.stringify(registered.identityColumns) !== JSON.stringify(locus.identityColumns)) {
      failures.push(
        `IDENTITY DRIFT ${table}: schema=${locus.identityColumns.join(',')} registry=${registered.identityColumns.join(',')}`,
      );
    }
    if (!allowed.has(registered.disposition)) failures.push(`INVALID disposition ${table}: ${registered.disposition}`);
    if (!registered.memberLabel.trim()) failures.push(`MISSING memberLabel: ${table}`);
    if (!registered.bindingRule.trim()) failures.push(`MISSING bindingRule: ${table}`);
    if (!registered.authorityReason.trim()) failures.push(`MISSING authorityReason: ${table}`);
    if (!registered.verificationRule.trim()) failures.push(`MISSING verificationRule: ${table}`);
    if (!registered.adapterKey.trim()) failures.push(`MISSING adapterKey: ${table}`);
  }
  for (const table of registeredLoci.keys()) {
    if (!discoveredLoci.has(table)) failures.push(`STALE registry locus absent from declared schema: ${table}`);
  }

  const acts = registeredLoci.get('account_erasure_acts');
  if (!acts || acts.disposition !== 'retain') {
    failures.push('account_erasure_acts must be explicitly classified retain');
  }

  const discoveredFks = new Map(census.memberForeignKeys.map((fk) => [fk.declarationKey, fk]));
  const registeredFks = new Map(registry.memberForeignKeyDeclarations.map((fk) => [fk.declarationKey, fk]));

  for (const [key, fk] of discoveredFks) {
    const registered = registeredFks.get(key);
    if (!registered) {
      failures.push(`UNCLASSIFIED member FK declaration: ${key}`);
      continue;
    }
    if (registered.table !== fk.table || registered.onDelete !== fk.onDelete) {
      failures.push(`FK DRIFT ${key}`);
    }
    if (!allowed.has(registered.disposition)) failures.push(`INVALID FK disposition ${key}: ${registered.disposition}`);
    if (!registered.authorityReason.trim()) failures.push(`MISSING FK authorityReason: ${key}`);
  }
  for (const key of registeredFks.keys()) {
    if (!discoveredFks.has(key)) failures.push(`STALE registry FK declaration absent from migrations: ${key}`);
  }

  const discoveredLedgerChildren = new Map(
    census.accountErasureLedgerChildren.map((fk) => [fk.declarationKey, fk]),
  );
  const registeredLedgerChildren = new Map(
    registry.accountErasureLedgerChildren.map((fk) => [fk.declarationKey, fk]),
  );
  for (const [key, fk] of discoveredLedgerChildren) {
    const registered = registeredLedgerChildren.get(key);
    if (!registered) {
      failures.push(`UNCLASSIFIED account-erasure ledger child: ${key}`);
      continue;
    }
    if (registered.table !== fk.table || registered.onDelete !== fk.onDelete) {
      failures.push(`LEDGER CHILD DRIFT ${key}`);
    }
    if (registered.disposition !== 'retain') {
      failures.push(`account-erasure ledger child must be retain: ${key}`);
    }
  }
  for (const key of registeredLedgerChildren.keys()) {
    if (!discoveredLedgerChildren.has(key)) {
      failures.push(`STALE account-erasure ledger child absent from migrations: ${key}`);
    }
  }

  return failures;
}

export function sha256Utf8(value: string): string {
  return createHash('sha256').update(value, 'utf8').digest('hex');
}

export function registryPath(root: string): string {
  return join(root, 'config/governance/account-erasure-registry.v2.json');
}

export function loadRegistry(root: string): AccountErasureRegistry {
  return JSON.parse(readFileSync(registryPath(root), 'utf8')) as AccountErasureRegistry;
}

export function migrationDirectoryRelative(root: string): string {
  return relative(root, join(root, MIGRATION_REL));
}
