import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

describe('MAIA-RELATIONAL-FIELD-SHADOW-01 static constitutional contract', () => {
  const service = read('lib/sovereign/maiaService.ts');
  const route = read('app/api/sovereign/app/maia/list/route.ts');
  const runner = read('lib/maia/relational-field-shadow/runner.ts');
  const store = read('lib/maia/relational-field-shadow/evidenceStore.ts');
  const migration = read('database/migrations/20260916211500_relational_field_shadow_runs.sql');

  test('SH-F1/4/7 seam is after response construction, synchronous-to-schedule, and before return', () => {
    const marker = route.indexOf('MAIA-RELATIONAL-FIELD-SHADOW-01 — shadow-only, member-invisible');
    const responseBuilt = route.lastIndexOf('const response = jsonWithCors', marker);
    const returned = route.indexOf('return response;', marker);
    expect(marker).toBeGreaterThan(responseBuilt);
    expect(returned).toBeGreaterThan(marker);
    const block = route.slice(marker, returned);
    expect(block).toContain('!isSanctuary');
    expect(block).toContain("originRoute: '/api/sovereign/app/maia/list'");
    expect(block).toContain('memberId: effectiveUserId ?? null');
    expect(block).toContain('primaryResponse: sovereignText');
    expect(block).not.toMatch(/await\s+launchRelationalFieldShadow/);
    expect(block).not.toMatch(/responseData\s*=|sovereignText\s*=/);
    expect(service).not.toContain('MAIA-RELATIONAL-FIELD-SHADOW-01 — disposable research shadow');
  });

  test('SH-F2/3 evidence store writes only the dedicated research table', () => {
    expect(store).toContain('INSERT INTO maia_relational_field_shadow_runs');
    for (const forbidden of ['conversation_turns', 'episodic_memories', 'developmental_memories', 'standing_events', 'member_memory']) {
      expect(store).not.toContain(forbidden);
    }
  });

  test('SH-F10 evidence schema has no winner, score, reviewer or promotion columns', () => {
    const tableBody = migration.match(/CREATE TABLE IF NOT EXISTS public\.maia_relational_field_shadow_runs \(([\s\S]*?)\n\);/)?.[1] ?? '';
    expect(tableBody).not.toMatch(/winner|ranking|rank\b|reviewer|attunement_score|preference|promotion/i);
    expect(runner).not.toMatch(/EngineComparisonService|learning-orchestrator|BestEngine|reviewEngine/);
  });

  test('SH-F6 Cut 1 records refusal and does not invoke structural recovery/regeneration', () => {
    expect(runner).toContain("status: 'refused'");
    expect(runner).toContain('refusalCode: err.code');
    expect(runner).not.toContain('renderWithStructuralRecovery');
    expect(runner).not.toContain('regeneration');
  });

  test('SH-F10 models are explicitly configured; no default winner is selected', () => {
    expect(runner).toContain("process.env.MAIA_RELATIONAL_FIELD_SHADOW_MODELS || ''");
    expect(runner).not.toMatch(/MAIA_RELATIONAL_FIELD_SHADOW_MODELS\s*\|\|\s*['\"]qwen/i);
    expect(runner).not.toMatch(/\.sort\s*\(|\bscore[A-Z_(]|\bwinner[A-Z_(]/i);
  });

  test('no other runtime module reads the research table', () => {
    const allowed = new Set([
      'lib/maia/relational-field-shadow/evidenceStore.ts',
      'database/migrations/20260916211500_relational_field_shadow_runs.sql',
    ]);
    const roots = ['lib', 'app'];
    const hits: string[] = [];
    const runtimeRead = /(?:FROM|JOIN|UPDATE|DELETE\s+FROM)\s+(?:public\.)?maia_relational_field_shadow_runs/i;
    const walk = (dir: string) => {
      for (const name of readdirSync(join(ROOT, dir), { withFileTypes: true })) {
        const rel = join(dir, name.name);
        if (name.isDirectory()) walk(rel);
        else if (/\.(ts|tsx|js)$/.test(name.name) && !rel.includes('/__tests__/') && runtimeRead.test(read(rel))) hits.push(rel);
      }
    };
    roots.forEach(walk);
    expect(hits.filter((p) => !allowed.has(p))).toEqual([]);
  });

  test('offline exporter is read-only and contains no automatic adjudication path', () => {
    const exporter = read('scripts/research/relational-field-shadow/export-blind.ts');
    const sql = exporter.match(/await query<Row>\(\s*`([\s\S]*?)`/)?.[1] ?? '';
    expect(sql).toMatch(/SELECT s\.id/);
    expect(sql).toMatch(/JOIN maia_turns/);
    expect(sql).not.toMatch(/INSERT\s+INTO|UPDATE\s+[a-z_]|DELETE\s+FROM/i);
    expect(exporter).not.toMatch(/attunementScore|reviewer_label|BestEngine|promoteModel|updateRoutingPreference/);
    expect(exporter).toContain('primary_digest_mismatch');
  });

});
