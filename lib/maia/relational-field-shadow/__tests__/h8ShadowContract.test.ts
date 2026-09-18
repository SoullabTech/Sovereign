import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const read = (p: string) => readFileSync(join(ROOT, p), 'utf8');

describe('H8 production shadow static containment', () => {
  const route = read('app/api/sovereign/app/maia/list/route.ts');
  const runner = read('lib/maia/relational-field-shadow/runner.ts');
  const projector = read('lib/maia/relational-field-shadow/currentActProjection.ts');
  const store = read('lib/maia/relational-field-shadow/evidenceStore.ts');
  const blindExporter = read('scripts/research/relational-field-shadow/export-blind.ts');
  const h8Exporter = read('scripts/research/relational-field-shadow/export-h8-current-act.ts');

  test('H8 does not add a second route seam or enter live response assembly', () => {
    expect(route).not.toContain('MAIA_RELATIONAL_FIELD_H8');
    expect(route.match(/launchRelationalFieldShadow\(/g)).toHaveLength(1);
    expect(runner).toContain("process.env.MAIA_RELATIONAL_FIELD_H8 === '1'");
    expect(runner).toContain("process.env.MAIA_RELATIONAL_FIELD_H8_CROSS_SESSION === '1'");
    expect(runner).not.toMatch(/responseData|sovereignText\s*=/);
  });

  test('projector is deterministic computation only with no database or cognition import', () => {
    expect(projector).not.toMatch(/@\/lib\/db\/postgres|maiaService|getMaiaResponse|MemoryWriteback|conversation_turns/);
    expect(projector).toContain('projectionDigest');
    expect(projector).toContain('no_direct_anchor');
    expect(projector).toContain('no_prior_evidence');
  });

  test('cross-session shadow is fail-closed and cannot widen the frozen generative packet', () => {
    const assembler = read('lib/maia/relational-field-shadow/fieldAssembler.ts');
    expect(assembler).toContain('SELECT conversational_recall_enabled');
    expect(assembler).toContain('conversational_recall_enabled !== true');
    expect(assembler).toContain("role = 'user'");
    expect(assembler).toContain("sourceKind: 'cross_session_turn'");
    expect(assembler).toContain('cross-session read failed closed');
    expect(runner).toContain('const packet = assembleRelationalFieldPacket');
    expect(runner).toContain('const h8Packet = assembleH8RelationalFieldPacket');
  });

  test('H8 persists through the existing dedicated research evidence store only', () => {
    expect(runner).toContain('persistRelationalFieldShadowEvidence');
    expect(store).toContain('INSERT INTO maia_relational_field_shadow_runs');
    for (const forbidden of ['member_memory_atoms', 'episodic_memories', 'developmental_memories', 'standing_events']) {
      expect(runner).not.toContain(forbidden);
      expect(projector).not.toContain(forbidden);
    }
  });

  test('legacy blind A/B exporter excludes non-text H8 projection rows', () => {
    expect(blindExporter).toContain('s.shadow_response_text IS NOT NULL');
  });

  test('H8 exporter is read-only and has no adjudication writeback', () => {
    expect(h8Exporter).toMatch(/SELECT s\.id|SELECT id::text/);
    expect(h8Exporter).not.toMatch(/INSERT\s+INTO|UPDATE\s+[a-z_]|DELETE\s+FROM/i);
    expect(h8Exporter).not.toMatch(/promoteModel|updateRoutingPreference|MemoryWriteback|standing_events/i);
  });
});
