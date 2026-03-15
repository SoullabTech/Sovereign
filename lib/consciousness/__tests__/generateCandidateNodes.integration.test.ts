/**
 * generateCandidateNodes Integration Tests
 *
 * Tests the four repaired paths against the real PostgreSQL schema:
 *   1. case_memories.content is read correctly (not content_summary)
 *   2. case_notes.content + themes_observed are read correctly
 *   3. goal-path member resolution through client_id → practitioner_clients → members
 *   4. deduplication pre-check prevents duplicate inserts, including null source_id
 *
 * Excluded from standard test run (*.integration.test.ts pattern in jest.config.js).
 * Run with:
 *   npx jest --testPathPattern="generateCandidateNodes.integration" --no-coverage
 *
 * Requires a running local PostgreSQL with all migrations applied.
 */

import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(process.cwd(), '.env.local') });

import db from '@/lib/db/postgres';
import { generateCandidateNodes } from '../elementNodeGenerator';

// ─── Unique run prefix ─────────────────────────────────────────────────────
// Prevents cross-test contamination when tests run concurrently or if a
// prior run left orphaned rows.
const RUN = Date.now().toString(36);

// ─── Seed helpers ──────────────────────────────────────────────────────────

async function seedMember(suffix: string, email?: string): Promise<string> {
  const result = await db.query(
    `INSERT INTO members (passkey, username, password_hash, name, email)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id`,
    [
      `TEST-${RUN}-${suffix}`,
      `test_${RUN}_${suffix}`,
      'not-a-real-hash',
      `Test ${suffix}`,
      email ?? null,
    ],
  );
  return result.rows[0].id as string;
}

async function seedPortalPractitioner(suffix: string): Promise<string> {
  const result = await db.query(
    `INSERT INTO practitioners (slug, name, email)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [
      `test-${RUN}-${suffix}`,
      `Test Portal Practitioner ${suffix}`,
      `portal_${RUN}_${suffix}@test.example`,
    ],
  );
  return result.rows[0].id as string;
}

async function seedPractitionerClient(
  portalPractitionerId: string,
  email: string,
): Promise<string> {
  const result = await db.query(
    `INSERT INTO practitioner_clients (practitioner_id, email, name)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [portalPractitionerId, email, 'Test Portal Client'],
  );
  return result.rows[0].id as string;
}

async function seedCase(
  practitionerMemberId: string,
  clientId: string | null = null,
): Promise<string> {
  const result = await db.query(
    `INSERT INTO practitioner_cases (practitioner_id, client_identifier, client_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [
      practitionerMemberId,
      `case-${RUN}-${Math.random().toString(36).slice(2)}`,
      clientId,
    ],
  );
  return result.rows[0].id as string;
}

async function seedMemory(
  caseId: string,
  practitionerMemberId: string,
  elementTags: string[],
  significance: number,
  content = 'Client showed elemental activation during session.',
): Promise<string> {
  const result = await db.query(
    `INSERT INTO case_memories
       (case_id, practitioner_id, memory_type, content, significance, element_tags)
     VALUES ($1, $2, 'pattern', $3, $4, $5::text[])
     RETURNING id`,
    [caseId, practitionerMemberId, content, significance, elementTags],
  );
  return result.rows[0].id as string;
}

async function seedNote(
  caseId: string,
  practitionerMemberId: string,
  elementFocus: string,
  content = 'Session focused on elemental regulation and presence.',
  themesObserved: string[] = ['regulation', 'presence'],
): Promise<string> {
  const result = await db.query(
    `INSERT INTO case_notes
       (case_id, practitioner_id, note_type, content, element_focus, themes_observed)
     VALUES ($1, $2, 'session', $3, $4, $5::text[])
     RETURNING id`,
    [caseId, practitionerMemberId, content, elementFocus, themesObserved],
  );
  return result.rows[0].id as string;
}

// ─── Cleanup ───────────────────────────────────────────────────────────────

async function cleanup(): Promise<void> {
  // Order matters: case_element_nodes.practitioner_id has no ON DELETE CASCADE,
  // so we must delete practitioner_cases first (which cascades to case_element_nodes,
  // case_memories, and case_notes), before deleting members.
  await db.query(
    `DELETE FROM practitioner_cases
     WHERE practitioner_id IN (SELECT id FROM members WHERE passkey LIKE $1)`,
    [`TEST-${RUN}-%`],
  );
  // Now safe to delete members — no remaining FK references
  await db.query(`DELETE FROM members WHERE passkey LIKE $1`, [`TEST-${RUN}-%`]);
  // Delete portal practitioners — cascades to practitioner_clients
  await db.query(`DELETE FROM practitioners WHERE slug LIKE $1`, [`test-${RUN}-%`]);
}

// ─── Tests ─────────────────────────────────────────────────────────────────

describe('generateCandidateNodes integration', () => {
  afterAll(async () => {
    await cleanup();
    await db.closePool();
  });

  // ── 1. Memories path ────────────────────────────────────────────────────

  it('generates marker nodes from case_memories using the content column', async () => {
    const practitionerId = await seedMember('prac-1');
    const caseId = await seedCase(practitionerId);
    const memId = await seedMemory(
      caseId,
      practitionerId,
      ['fire'],
      0.8,
      'Client showed strong fire activation. Energised and initiating.',
    );

    const result = await generateCandidateNodes(caseId, practitionerId);

    expect(result.inserted).toBeGreaterThanOrEqual(1);
    expect(result.nodes.length).toBe(result.inserted);

    const fireNode = result.nodes.find(n => n.element === 'fire' && n.role === 'marker');
    expect(fireNode).toBeDefined();
    expect(fireNode!.sourceType).toBe('case_memory');
    expect(fireNode!.sourceId).toBe(memId);
    expect(fireNode!.caseId).toBe(caseId);
    expect(fireNode!.confirmedByPractitioner).toBe(false);
  });

  // ── 2. Notes path ───────────────────────────────────────────────────────

  it('generates marker nodes from case_notes using content + themes_observed columns', async () => {
    const practitionerId = await seedMember('prac-2');
    const caseId = await seedCase(practitionerId);
    const noteId = await seedNote(
      caseId,
      practitionerId,
      'water',
      'Session focused on water element. Emotional fluidity and boundaries explored.',
      ['fluidity', 'boundaries'],
    );

    const result = await generateCandidateNodes(caseId, practitionerId);

    const waterNode = result.nodes.find(n => n.element === 'water' && n.role === 'marker');
    expect(waterNode).toBeDefined();
    expect(waterNode!.sourceType).toBe('case_note');
    expect(waterNode!.sourceId).toBe(noteId);
    // case_notes have fixed confidence of 0.6
    expect(waterNode!.confidence).toBeCloseTo(0.6);
  });

  // ── 3. Goal path — member linked through client email ───────────────────

  it('resolves member through client_id → practitioner_clients.email → members without crashing', async () => {
    const practitionerId = await seedMember('prac-3');
    const portalPractitionerId = await seedPortalPractitioner('prac-3');
    const clientEmail = `client_${RUN}_3@test.example`;

    // Seed a members row for the client (same email as practitioner_clients row)
    await seedMember('client-3', clientEmail);
    const pcClientId = await seedPractitionerClient(portalPractitionerId, clientEmail);
    const caseId = await seedCase(practitionerId, pcClientId);

    // No missions exist for this member, but the join should complete without error
    const result = await generateCandidateNodes(caseId, practitionerId);

    expect(result).toBeDefined();
    expect(typeof result.inserted).toBe('number');
    expect(typeof result.skipped).toBe('number');
    // No crash — generation succeeded despite empty mission set
  });

  // ── 4. Missing member linkage is handled gracefully ─────────────────────

  it('tolerates unregistered client (no matching members row) and still generates from other sources', async () => {
    const practitionerId = await seedMember('prac-4');
    const portalPractitionerId = await seedPortalPractitioner('prac-4');

    // This email does NOT exist in the members table
    const orphanEmail = `orphan_${RUN}_4@nowhere.example`;
    const pcClientId = await seedPractitionerClient(portalPractitionerId, orphanEmail);
    const caseId = await seedCase(practitionerId, pcClientId);

    // Seed a memory so we get at least one node despite the failed member join
    await seedMemory(caseId, practitionerId, ['earth'], 0.75);

    const result = await generateCandidateNodes(caseId, practitionerId);

    // Should still produce earth node — goal path failure is silent, not fatal
    expect(result.inserted).toBeGreaterThanOrEqual(1);
    const earthNode = result.nodes.find(n => n.element === 'earth');
    expect(earthNode).toBeDefined();
  });

  // ── 5. Deduplication — non-null source_id ───────────────────────────────

  it('does not insert duplicates on second generation run for same source_id', async () => {
    const practitionerId = await seedMember('prac-5');
    const caseId = await seedCase(practitionerId);
    await seedMemory(caseId, practitionerId, ['air'], 0.8);
    await seedNote(caseId, practitionerId, 'fire');

    const first = await generateCandidateNodes(caseId, practitionerId);
    expect(first.inserted).toBeGreaterThan(0);

    const second = await generateCandidateNodes(caseId, practitionerId);
    expect(second.inserted).toBe(0);
    expect(second.skipped).toBe(first.inserted);

    // Row count in DB is unchanged after second run
    const rows = await db.query(
      `SELECT COUNT(*)::int AS count FROM case_element_nodes WHERE case_id = $1`,
      [caseId],
    );
    expect(rows.rows[0].count).toBe(first.inserted);
  });

  // ── 6. Deduplication — null source_id (grounding path) ──────────────────

  it('does not insert a duplicate grounding node (null source_id) on second run', async () => {
    const practitionerId = await seedMember('prac-6');
    const caseId = await seedCase(practitionerId);

    // Two high-significance earth memories trigger the grounding candidate
    await seedMemory(caseId, practitionerId, ['earth'], 0.85);
    await seedMemory(caseId, practitionerId, ['earth'], 0.90);

    const first = await generateCandidateNodes(caseId, practitionerId);
    const groundingCount = first.nodes.filter(n => n.role === 'grounding').length;
    expect(groundingCount).toBe(1);

    const second = await generateCandidateNodes(caseId, practitionerId);
    expect(second.nodes.filter(n => n.role === 'grounding').length).toBe(0);

    // Exactly one grounding node persists
    const rows = await db.query(
      `SELECT COUNT(*)::int AS count FROM case_element_nodes
       WHERE case_id = $1 AND role = 'grounding'`,
      [caseId],
    );
    expect(rows.rows[0].count).toBe(1);
  });
});
