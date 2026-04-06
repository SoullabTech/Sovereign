/**
 * Privacy Gate — Trust Layer Enforcement Tests
 *
 * CRITICAL: These tests verify that symbolic/generative agent outputs
 * respect the Trust Layer Phase 1 privacy envelope.
 *
 * The privacy gate is the single source of truth for whether AI
 * generation is permitted in a session. All paths — oracle conversation,
 * session followups, agent orchestrator — use isAiPermitted().
 *
 * If these tests fail, the consent boundary is broken.
 *
 * Run: npx jest __tests__/privacy-gate.test.ts
 */

import type { PrivacyGateResult } from '../lib/trust/types';

// ── Mock the database layer ────────────────────────────────────
// We mock lib/db/postgres so isAiPermitted can run without a live DB.

let mockQueryResult: { rows: any[] } = { rows: [] };

jest.mock('../lib/db/postgres', () => ({
  query: jest.fn(async () => mockQueryResult),
  queryOne: jest.fn(async () => mockQueryResult.rows[0] ?? null),
  insertOne: jest.fn(async () => mockQueryResult.rows[0] ?? null),
}));

// Import after mock is set up
import { isAiPermitted, getSessionPrivacy } from '../lib/trust/service';

// ── Helpers ────────────────────────────────────────────────────

function setSessionRow(overrides: Partial<{
  privacy_mode: string;
  consent_level: string;
  visibility_scope: string;
  allow_ai_distillation: boolean;
  allow_export: boolean;
}> = {}) {
  const row = {
    privacy_mode: 'standard',
    consent_level: 'digital',
    visibility_scope: 'member_only',
    allow_ai_distillation: true,
    allow_export: true,
    ...overrides,
  };
  mockQueryResult = { rows: [row] };
}

function setNoSession() {
  mockQueryResult = { rows: [] };
}

const STANDARD_SESSION = {
  privacy_mode: 'standard',
  consent_level: 'digital',
  visibility_scope: 'member_only',
  allow_ai_distillation: true,
  allow_export: true,
};

function setMemoryContractBlocking() {
  const { query } = require('../lib/db/postgres');
  query
    .mockResolvedValueOnce({ rows: [STANDARD_SESSION] })
    .mockResolvedValueOnce({
      rows: [{ disposition: 'keep_private', never_use_for_ai: false, expires_at: null }],
    });
}

function setMemoryContractPermitting() {
  const { query } = require('../lib/db/postgres');
  query
    .mockResolvedValueOnce({ rows: [STANDARD_SESSION] })
    .mockResolvedValueOnce({
      rows: [{ disposition: 'allow_maia_summary', never_use_for_ai: false, expires_at: null }],
    });
}

function setMemoryContractWithAiVeto() {
  const { query } = require('../lib/db/postgres');
  query
    .mockResolvedValueOnce({ rows: [STANDARD_SESSION] })
    .mockResolvedValueOnce({
      rows: [{ disposition: 'allow_maia_summary', never_use_for_ai: true, expires_at: null }],
    });
}

function setExpiredMemoryContract(overrides: { never_use_for_ai?: boolean; disposition?: string } = {}) {
  const { query } = require('../lib/db/postgres');
  const pastDate = new Date(Date.now() - 86400000).toISOString(); // yesterday
  query
    .mockResolvedValueOnce({ rows: [STANDARD_SESSION] })
    .mockResolvedValueOnce({
      rows: [{
        disposition: overrides.disposition ?? 'keep_private',
        never_use_for_ai: overrides.never_use_for_ai ?? false,
        expires_at: pastDate,
      }],
    });
}

// ── Reset mocks between tests ──────────────────────────────────

beforeEach(() => {
  jest.clearAllMocks();
  mockQueryResult = { rows: [] };
});

// ================================================================
// TEST 1: Oracle blocks symbolic processing when AI is disabled
// ================================================================

describe('Privacy Gate — Blocked Sessions', () => {
  it('blocks when privacy_mode is confidential', async () => {
    setSessionRow({ privacy_mode: 'confidential' });
    const result = await isAiPermitted('session-123');
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('privacy_mode_blocks_ai');
  });

  it('blocks when allow_ai_distillation is false', async () => {
    setSessionRow({ allow_ai_distillation: false });
    const result = await isAiPermitted('session-456');
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('session_ai_disabled');
  });

  it('blocks when memory contract disposition is keep_private', async () => {
    setMemoryContractBlocking();
    const result = await isAiPermitted('session-789');
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('memory_contract_blocks_summary');
  });

  it('returns stable denial reasons (not generic errors)', async () => {
    setSessionRow({ privacy_mode: 'confidential' });
    const result = await isAiPermitted('session-stable');
    expect(result.reason).toBeDefined();
    expect(typeof result.reason).toBe('string');
    expect(result.reason!.length).toBeGreaterThan(0);
    // Reason must be a stable enum-like value, not a freeform error message
    expect(result.reason).toMatch(/^[a-z_]+$/);
  });
});

// ================================================================
// TEST 2: Allowed path remains unchanged
// ================================================================

describe('Privacy Gate — Permitted Sessions', () => {
  it('permits when privacy_mode is standard and AI distillation is on', async () => {
    setMemoryContractPermitting();
    const result = await isAiPermitted('session-allowed');
    expect(result.permitted).toBe(true);
    expect(result.reason).toBeUndefined();
  });

  it('permits when privacy_mode is private but AI distillation is on', async () => {
    // 'private' mode restricts visibility, not AI processing
    const { query } = require('../lib/db/postgres');
    query
      .mockResolvedValueOnce({
        rows: [{ ...STANDARD_SESSION, privacy_mode: 'private' }],
      })
      .mockResolvedValueOnce({ rows: [] }); // no blocking contract

    const result = await isAiPermitted('session-private-ok');
    expect(result.permitted).toBe(true);
  });

  it('permits when memory contract allows maia summary', async () => {
    setMemoryContractPermitting();
    const result = await isAiPermitted('session-contract-ok');
    expect(result.permitted).toBe(true);
  });
});

// ================================================================
// TEST 3: Fail-open for non-rl_sessions (regular MAIA chat)
// ================================================================

describe('Privacy Gate — Fail-Open Behavior', () => {
  it('returns session_not_found when session has no rl_sessions row', async () => {
    setNoSession();
    const result = await isAiPermitted('nonexistent-session');
    // isAiPermitted fails closed (returns not-permitted) when session is
    // not found. The oracle route handles this by catching and failing open.
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('session_not_found');
  });

  it('session_not_found reason is stable and parseable', async () => {
    setNoSession();
    const result = await isAiPermitted('missing-session');
    // The oracle route uses this reason to decide whether to fail open
    expect(result.reason).toBe('session_not_found');
    expect(result.reason).toMatch(/^[a-z_]+$/);
  });
});

// ================================================================
// TEST 4: Privacy Gate Result shape contract
// ================================================================

describe('Privacy Gate — Response Shape', () => {
  it('permitted result has no reason field', async () => {
    setMemoryContractPermitting();
    const result = await isAiPermitted('session-shape-ok');
    expect(result).toEqual({ permitted: true });
    expect(Object.keys(result)).toEqual(['permitted']);
  });

  it('denied result always has reason field', async () => {
    setSessionRow({ allow_ai_distillation: false });
    const result = await isAiPermitted('session-shape-denied');
    expect(result.permitted).toBe(false);
    expect(result).toHaveProperty('reason');
    expect(typeof result.reason).toBe('string');
  });

  it('confidential mode takes precedence over allow_ai_distillation=true', async () => {
    // Edge case: if someone sets confidential but forgets to disable AI
    setSessionRow({ privacy_mode: 'confidential', allow_ai_distillation: true });
    const result = await isAiPermitted('session-precedence');
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('privacy_mode_blocks_ai');
  });
});

// ================================================================
// Phase 2: Memory Governance — never_use_for_ai + expiry
// ================================================================

describe('Privacy Gate — never_use_for_ai (Phase 2)', () => {
  it('blocks when active contract has never_use_for_ai = true', async () => {
    setMemoryContractWithAiVeto();
    const result = await isAiPermitted('session-ai-veto');
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('memory_contract_never_use_for_ai');
  });

  it('never_use_for_ai overrides permissive disposition', async () => {
    // Contract says allow_maia_summary but never_use_for_ai = true
    setMemoryContractWithAiVeto();
    const result = await isAiPermitted('session-veto-override');
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('memory_contract_never_use_for_ai');
  });

  it('never_use_for_ai reason is stable and parseable', async () => {
    setMemoryContractWithAiVeto();
    const result = await isAiPermitted('session-veto-reason');
    expect(result.reason).toMatch(/^[a-z_]+$/);
    expect(result.reason).toBe('memory_contract_never_use_for_ai');
  });
});

describe('Privacy Gate — Contract Expiry (Phase 2)', () => {
  it('expired keep_private contract does not block', async () => {
    setExpiredMemoryContract({ disposition: 'keep_private' });
    const result = await isAiPermitted('session-expired-kp');
    expect(result.permitted).toBe(true);
  });

  it('expired never_use_for_ai contract does not block', async () => {
    setExpiredMemoryContract({ never_use_for_ai: true });
    const result = await isAiPermitted('session-expired-veto');
    expect(result.permitted).toBe(true);
  });

  it('unexpired contract still blocks normally', async () => {
    const { query } = require('../lib/db/postgres');
    const futureDate = new Date(Date.now() + 86400000 * 30).toISOString(); // 30 days
    query
      .mockResolvedValueOnce({ rows: [STANDARD_SESSION] })
      .mockResolvedValueOnce({
        rows: [{ disposition: 'keep_private', never_use_for_ai: false, expires_at: futureDate }],
      });
    const result = await isAiPermitted('session-unexpired');
    expect(result.permitted).toBe(false);
    expect(result.reason).toBe('memory_contract_blocks_summary');
  });
});
