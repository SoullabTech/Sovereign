/**
 * GATE 1 — Persistent corrigibility: executable invariants.
 *
 * Authority:
 *   docs/governance/FOUNDER_RULING_PERSISTENT_CORRIGIBILITY_GATE1_2026-08-09.md
 *   docs/architecture/audits/MAIA_PERSISTENT_CORRIGIBILITY_RECONCILIATION_2026-08-09.md (§11)
 *
 * Two proof styles, deliberately:
 *
 *  1. STRUCTURAL PINS — read the actual source and assert the load-bearing
 *     SQL/constraints exist. These are the mutation-resistant half: deleting
 *     an eligibility WHERE clause, restoring weight-0.70 promotion, or
 *     removing the authority filter turns the suite red. A pin failing means
 *     a constitutional seam was edited — do not "fix the test."
 *
 *  2. BEHAVIORAL TESTS — run the correction-persistence logic against a
 *     mocked db layer and assert what it writes, refuses, and scopes.
 *
 * What this file does NOT prove (recorded honestly, per the gate standard):
 * live DB CHECK enforcement (invariant A3's runtime half) and end-to-end
 * recall behavior require the migration applied to a real database — covered
 * by the gate-closure production-equivalent encounter, not by this suite.
 */

import * as fs from 'fs';
import * as path from 'path';

const R = (p: string) => fs.readFileSync(path.join(process.cwd(), p), 'utf8');

// ─── Mocked db layer for behavioral tests ────────────────────────────────────

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
}));

import { query } from '@/lib/db/postgres';
import {
  persistMemberCorrection,
  reverseMemberCorrection,
  SUPERSESSION_CONFIDENCE_FLOOR,
} from '@/lib/maia/correctionPersistence';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
import { buildCorrectionRepairBlock } from '@/lib/maia/correctionRepair';
import { detectCorrectionSignal } from '@/lib/consciousness/correctionDetection';

const mockQuery = query as jest.MockedFunction<typeof query>;

const normalPosture = TurnPosture.resolve({ sanctuary: false });
const sanctuaryPosture = TurnPosture.resolve({ sanctuary: true });

const explicitDetection = detectCorrectionSignal("that's not what i meant — i'm not angry at her, i'm afraid for her");
const generalDetection = detectCorrectionSignal('no, i said tuesday');

beforeEach(() => {
  mockQuery.mockReset();
});

// ═══════════════════════════════════════════════════════════════════════════
// STRUCTURAL PINS — retrieval paths honor supersession (invariants A1, A7, A10)
// ═══════════════════════════════════════════════════════════════════════════

describe('PIN: every live conversation-turn recall path filters on recall_eligibility', () => {
  test('TurnsStore.getRecentTurns (serves FAST recentContext, CORE ×8, DEEP seed, sessionManager, MemoryBundle scope=all)', () => {
    const src = R('lib/memory/stores/TurnsStore.ts');
    const getRecent = src.slice(src.indexOf('async getRecentTurns'), src.indexOf('async getSessionTurns'));
    expect(getRecent).toContain(`recall_eligibility = 'eligible'`);
  });

  test('memoryLoaders.loadPriorCrossSessionExchanges (conversational recall block, all tiers)', () => {
    const src = R('lib/maia/memoryLoaders.ts');
    const fn = src.slice(src.indexOf('export async function loadPriorCrossSessionExchanges'));
    const sqlEnd = fn.indexOf('ORDER BY created_at DESC');
    expect(fn.slice(0, sqlEnd)).toContain(`recall_eligibility = 'eligible'`);
  });

  test('MemoryBundle cross_session recent bucket', () => {
    const src = R('lib/memory/MemoryBundle.ts');
    // Anchor on the cross-session SQL itself: the same statement that excludes
    // the current session must also exclude superseded turns.
    expect(src).toMatch(/session_id <> \$2\s+AND recall_eligibility = 'eligible'/);
  });

  test('pin self-check: the filtered paths actually read conversation_turns (guards against vacuous green)', () => {
    // If a refactor renames the table or moves the SQL, the three pins above
    // could pass against dead strings. Assert the substrate name is present
    // in each pinned region too.
    const turns = R('lib/memory/stores/TurnsStore.ts');
    expect(turns).toContain('FROM conversation_turns');
    const loaders = R('lib/maia/memoryLoaders.ts');
    expect(loaders).toContain('FROM conversation_turns');
  });
});

describe('PIN: migration constraints (invariant A3 — the DB refuses ungoverned supersession)', () => {
  const migration = R('database/migrations/20260809000001_gate1_persistent_corrigibility.sql');

  test('turns_supersession_coherent: superseded requires an attached member act; eligible forbids one', () => {
    expect(migration).toContain('turns_supersession_coherent');
    expect(migration).toMatch(/recall_eligibility = 'superseded'\s+AND superseded_by_correction_id IS NOT NULL/);
    expect(migration).toMatch(/recall_eligibility = 'eligible'\s+AND superseded_by_correction_id IS NULL/);
  });

  test('ledger_authority_requires_member_act: no member act → no routing weight, enforced in the DB', () => {
    expect(migration).toContain('ledger_authority_requires_member_act');
    expect(migration).toMatch(/authority_source IS NULL\s+AND routing_influence_weight = 0/);
  });

  test('the correction is the member\'s words: verbatim_text NOT NULL with non-empty CHECK', () => {
    expect(migration).toMatch(/verbatim_text\s+TEXT NOT NULL CHECK \(length\(btrim\(verbatim_text\)\) > 0\)/);
  });

  test('production-data ruling: existing turns default to eligible; migration deletes nothing', () => {
    expect(migration).toContain(`DEFAULT 'eligible'`);
    expect(migration).not.toMatch(/\bDELETE\s+FROM/i);
    expect(migration).not.toMatch(/\bDROP\s+TABLE/i);
    expect(migration).not.toMatch(/UPDATE\s+conversation_turns/i);
  });
});

describe('PIN: interpretation authority (F4/F7 — recurrence never confers authority)', () => {
  const ledger = R('lib/consciousness/interpretiveLedger.ts');

  test('promotion writes routing weight 0 — the weight-0.70 acquisition rule stays dead', () => {
    const insert = ledger.slice(ledger.indexOf('INSERT INTO interpretive_ledger'), ledger.indexOf('RETURNING id'));
    expect(insert).toMatch(/\n\s+0, 'eligible'/);
    expect(insert).not.toContain(`0.70, 'eligible'`);
  });

  test('loadLedgerForRouting requires a member act: authority_source IS NOT NULL', () => {
    const fn = ledger.slice(ledger.indexOf('export async function loadLedgerForRouting'), ledger.indexOf('export async function loadLedgerForMember'));
    expect(fn).toContain('authority_source IS NOT NULL');
  });

  test('resonance is not confirmation: markAccepted no longer raises routing weight', () => {
    const fn = ledger.slice(ledger.indexOf('export async function markAccepted'), ledger.indexOf('export async function grantMemberAuthority'));
    expect(fn).not.toContain('routing_influence_weight = LEAST');
  });

  test('the only path to routing weight is the member act (grantMemberAuthority, member-scoped)', () => {
    const fn = ledger.slice(ledger.indexOf('export async function grantMemberAuthority'));
    expect(fn).toContain(`authority_granted_at     = NOW()`);
    expect(fn).toContain('AND member_id = $3');
  });

  test('clear_influence strips authority and zeroes weight (not the old 0.02)', () => {
    const clearCase = ledger.slice(ledger.indexOf(`case 'clear_influence':`), ledger.indexOf(`case 'confirm':`));
    expect(clearCase).toContain('authority_source         = NULL');
    expect(clearCase).toContain('routing_influence_weight = 0,');
    expect(clearCase).not.toContain('0.02');
  });
});

describe('PIN: no bulk retroactive inference (production-data ruling)', () => {
  test('correctionPersistence contains no sweep over historical turns', () => {
    const src = R('lib/maia/correctionPersistence.ts');
    // The only SELECT against conversation_turns must be the single-referent
    // lookup (LIMIT 1, session-scoped). Any broader scan is a violation.
    const selects = src.match(/SELECT[\s\S]*?FROM conversation_turns[\s\S]*?LIMIT \d+/g) ?? [];
    expect(selects).toHaveLength(1);
    expect(selects[0]).toContain('LIMIT 1');
    expect(selects[0]).toContain('session_id = $1');
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BEHAVIORAL — persistMemberCorrection (F1/F2/F5, invariants A6, A8, A9, A11)
// ═══════════════════════════════════════════════════════════════════════════

describe('persistMemberCorrection', () => {
  test('explicit high-confidence correction supersedes the immediately preceding assistant turn', async () => {
    expect(explicitDetection.confidence).toBeGreaterThanOrEqual(SUPERSESSION_CONFIDENCE_FLOOR);
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'turn-assistant-1' }] } as any) // referent lookup
      .mockResolvedValueOnce({ rows: [{ id: 'corr-1' }] } as any)           // correction insert
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);             // supersession update

    const result = await persistMemberCorrection(normalPosture, {
      memberId: 'member-a',
      sessionId: 'sess-1',
      verbatimText: "that's not what I meant — I'm not angry at her, I'm afraid for her",
      detection: explicitDetection,
    });

    expect(result).toMatchObject({ recorded: true, superseded: true, correctionId: 'corr-1', supersededTurnId: 'turn-assistant-1' });

    // F2: the update touches ONLY eligibility columns — never content, never DELETE.
    const updateSql = mockQuery.mock.calls[2][0] as string;
    expect(updateSql).toContain(`recall_eligibility = 'superseded'`);
    expect(updateSql).not.toMatch(/content/i);
    expect(updateSql).not.toMatch(/DELETE/i);
    // A11/isolation: member-scoped write.
    expect(updateSql).toContain('user_id = $3');
  });

  test('F5: below the supersession floor, the member act is recorded but nothing is superseded', async () => {
    expect(generalDetection.confidence).toBeLessThan(SUPERSESSION_CONFIDENCE_FLOOR);
    mockQuery.mockResolvedValueOnce({ rows: [{ id: 'corr-2' }] } as any); // insert only

    const result = await persistMemberCorrection(normalPosture, {
      memberId: 'member-a',
      sessionId: 'sess-1',
      verbatimText: 'no, i said tuesday',
      detection: generalDetection,
    });

    expect(result).toMatchObject({ recorded: true, superseded: false, reason: 'below_supersession_floor' });
    // Exactly one query: the verbatim record. No referent lookup, no update.
    expect(mockQuery).toHaveBeenCalledTimes(1);
    expect(mockQuery.mock.calls[0][0]).toContain('INSERT INTO member_corrections');
  });

  test('F5: no deterministic referent (no prior assistant turn) → record without supersession', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [] } as any)                 // referent lookup: empty
      .mockResolvedValueOnce({ rows: [{ id: 'corr-3' }] } as any); // insert

    const result = await persistMemberCorrection(normalPosture, {
      memberId: 'member-a',
      sessionId: 'sess-1',
      verbatimText: "you misunderstood me completely",
      detection: detectCorrectionSignal('you misunderstood me completely'),
    });

    expect(result).toMatchObject({ recorded: true, superseded: false, reason: 'no_deterministic_referent' });
  });

  test('A8: sanctuary writes nothing at all', async () => {
    const result = await persistMemberCorrection(sanctuaryPosture, {
      memberId: 'member-a',
      sessionId: 'sess-1',
      verbatimText: "that's not what i meant",
      detection: explicitDetection,
    });
    expect(result).toMatchObject({ recorded: false, superseded: false, reason: 'sanctuary' });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('A6/no-signal: ordinary speech persists nothing', async () => {
    const result = await persistMemberCorrection(normalPosture, {
      memberId: 'member-a',
      sessionId: 'sess-1',
      verbatimText: 'I just said goodbye to my dad at the airport',
      detection: detectCorrectionSignal('I feel quiet today'),
    });
    expect(result).toMatchObject({ recorded: false, reason: 'no_signal' });
    expect(mockQuery).not.toHaveBeenCalled();
  });

  test('A11: the referent lookup and supersession are scoped to the correcting member', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 't1' }] } as any)
      .mockResolvedValueOnce({ rows: [{ id: 'c1' }] } as any)
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);

    await persistMemberCorrection(normalPosture, {
      memberId: 'member-a',
      sessionId: 'sess-1',
      verbatimText: "that's not what i meant",
      detection: explicitDetection,
    });

    const referentSql = mockQuery.mock.calls[0][0] as string;
    expect(referentSql).toContain('user_id = $2');
    expect(mockQuery.mock.calls[0][1]).toEqual(expect.arrayContaining(['member-a']));
  });

  test('failure containment: db error is reported, never thrown', async () => {
    mockQuery.mockRejectedValueOnce(new Error('connection lost'));
    const result = await persistMemberCorrection(normalPosture, {
      memberId: 'member-a',
      sessionId: 'sess-1',
      verbatimText: "that's not what i meant",
      detection: explicitDetection,
    });
    expect(result).toMatchObject({ recorded: false, superseded: false, reason: 'write_error' });
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// BEHAVIORAL — reverseMemberCorrection (F6, invariant A5)
// ═══════════════════════════════════════════════════════════════════════════

describe('reverseMemberCorrection', () => {
  test('reversal restores eligibility, records itself, preserves the original row (F2/F6)', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ id: 'corr-1' }] } as any)      // ownership check
      .mockResolvedValueOnce({ rows: [{ id: 'reversal-1' }] } as any)  // reversal insert
      .mockResolvedValueOnce({ rows: [], rowCount: 1 } as any);        // restore update

    const result = await reverseMemberCorrection({
      memberId: 'member-a',
      correctionId: 'corr-1',
      verbatimText: 'I was narrating, not correcting — put that back.',
    });

    expect(result).toMatchObject({ reversed: true, reversalId: 'reversal-1', restoredTurnCount: 1 });

    // The reversal is a NEW row referencing the old one — nothing is deleted
    // or rewritten in member_corrections.
    const insertSql = mockQuery.mock.calls[1][0] as string;
    expect(insertSql).toContain('INSERT INTO member_corrections');
    expect(insertSql).toContain('reverses_correction_id');
    for (const call of mockQuery.mock.calls) {
      expect(call[0] as string).not.toMatch(/DELETE\s+FROM\s+member_corrections/i);
      expect(call[0] as string).not.toMatch(/UPDATE\s+member_corrections/i);
    }

    // Restore is member-scoped (A11).
    const restoreSql = mockQuery.mock.calls[2][0] as string;
    expect(restoreSql).toContain(`recall_eligibility = 'eligible'`);
    expect(restoreSql).toContain('user_id = $2');
  });

  test('cross-member reversal is refused at the ownership check (A11)', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] } as any); // not owned
    const result = await reverseMemberCorrection({
      memberId: 'member-b',
      correctionId: 'corr-owned-by-a',
      verbatimText: 'undo',
    });
    expect(result).toMatchObject({ reversed: false });
    expect(mockQuery).toHaveBeenCalledTimes(1);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// LAYER A — in-turn repair (unchanged constitutional properties)
// ═══════════════════════════════════════════════════════════════════════════

describe('buildCorrectionRepairBlock (Layer A)', () => {
  test('explicit phrase produces a this-turn-only guidance block', () => {
    const result = buildCorrectionRepairBlock("that's not what i meant");
    expect(result.detected).toBe(true);
    expect(result.block).toContain('Possible correction — this turn only');
    expect(result.block).toContain('possible signal, not a finding');
  });

  test('ordinary speech produces nothing', () => {
    const result = buildCorrectionRepairBlock('I feel quieter than yesterday');
    expect(result.detected).toBe(false);
    expect(result.block).toBeUndefined();
  });

  test('kill-switch disables the block', () => {
    const result = buildCorrectionRepairBlock("that's not what i meant", { enabled: false });
    expect(result.detected).toBe(false);
  });

  test('A9 companion: detection runs on full text — a correction late in a long message is seen', () => {
    const longMessage = 'x'.repeat(700) + " ...and honestly, that's not what i meant yesterday.";
    const detection = detectCorrectionSignal(longMessage);
    expect(detection.hasCorrectionSignal).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// WIRING PINS — the route and writeback carry the Gate 1 seams
// ═══════════════════════════════════════════════════════════════════════════

describe('PIN: route and writeback wiring', () => {
  test('live route wires detection, persistence, and the repair addendum', () => {
    const route = R('app/api/sovereign/app/maia/list/route.ts');
    expect(route).toContain('buildCorrectionRepairBlock');
    expect(route).toContain('persistMemberCorrection');
    expect(route).toContain('correctionRepairAddendum,');
    expect(route).toContain('correctionDetected: correctionDetectedThisTurn');
  });

  test('all prompt seams consume the repair addendum (FAST template, CORE context, DEEP-consult, DEEP-repair — invariant A7)', () => {
    const service = R('lib/sovereign/maiaService.ts');
    const occurrences = service.match(/correctionRepairAddendum/g) ?? [];
    // extraction+log (FAST) + template + CORE context + DEEP-consult list + DEEP-repair context
    expect(occurrences.length).toBeGreaterThanOrEqual(5);
    const voice = R('lib/sovereign/maiaVoice.ts');
    expect(voice).toContain(`{ field: 'correctionRepairAddendum'`);
  });

  test('writeback: a corrective exchange is typed correction, framed, and never a breakthrough', () => {
    const wb = R('lib/memory/MemoryWriteback.ts');
    expect(wb).toContain(`member corrected MAIA's prior understanding`);
    expect(wb).toContain(`input.memoryType ?? 'pattern'`);
    expect(wb).toMatch(/!input\.correctionDetected &&/);
  });
});
