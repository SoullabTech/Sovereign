/**
 * T1 Fault Localization — instrument unit tests.
 *
 * These lock the three properties that make the instrument safe to run in a
 * live member path:
 *
 *   1. SANITIZATION — member content cannot survive into an event.
 *   2. AUTHORITY SEPARATION — request_id is server-only; attempt_id is an
 *      untrusted client proposal that is shape-checked, never promoted.
 *   3. TRANSPARENCY OF CONTROL FLOW — stage() passes values and errors
 *      through unchanged, so wiring it in cannot alter behavior.
 */
import { describe, it, expect, jest } from '@jest/globals';
import {
  ALL_SEAMS,
  ATTEMPT_ID_HEADER,
  REDACTED,
  UNKNOWN_REVISION,
  buildStageEvent,
  clientRuntimeRevision,
  emitStage,
  isAllowedDetailKey,
  newAttemptId,
  newRequestId,
  sanitizeAttemptId,
  sanitizeDetail,
  serverRuntimeRevision,
  serverStageContext,
  stage,
  type StageContext,
} from '../faultLocalization';

function ctx(overrides: Partial<StageContext> = {}): StageContext & { lines: string[] } {
  const lines: string[] = [];
  return {
    side: 'server',
    requestId: 'req-fixed',
    attemptId: 'att-fixed',
    runtimeRevision: 'abc1234',
    sink: (l: string) => lines.push(l),
    now: () => 1_000,
    lines,
    ...overrides,
  } as StageContext & { lines: string[] };
}

// ═══════════════════════════════════════════════════════════════
// 1. Sanitization
// ═══════════════════════════════════════════════════════════════

describe('sanitization — member content cannot reach an event', () => {
  it('drops keys that are neither allowlisted nor measurement-shaped', () => {
    const out = sanitizeDetail({
      content: 'the thing I am actually working through',
      draft: 'private',
      title: 'My idea',
      framing: 'why this matters',
      prompt: 'system prompt text',
      reflection: 'MAIA said something',
    });
    expect(out).toEqual({});
  });

  it('redacts prose that is smuggled under an allowed key', () => {
    const out = sanitizeDetail({ reason: 'the member wrote about their divorce' });
    expect(out.reason).toBe(REDACTED);
  });

  it('redacts any string containing whitespace, however short', () => {
    expect(sanitizeDetail({ reason: 'a b' }).reason).toBe(REDACTED);
    expect(sanitizeDetail({ reason: 'ok\n' }).reason).toBe(REDACTED);
    expect(sanitizeDetail({ reason: '\tx' }).reason).toBe(REDACTED);
  });

  it('redacts token-shaped strings that exceed the 64-char bound', () => {
    expect(sanitizeDetail({ reason: 'a'.repeat(65) }).reason).toBe(REDACTED);
    expect(sanitizeDetail({ reason: 'a'.repeat(64) }).reason).toBe('a'.repeat(64));
  });

  it('keeps enum-shaped tokens under allowlisted keys', () => {
    expect(
      sanitizeDetail({ reason: 'idea_not_found', recognition_kind: 'change' })
    ).toEqual({ reason: 'idea_not_found', recognition_kind: 'change' });
  });

  it('keeps measurements about content but never the content', () => {
    expect(
      sanitizeDetail({
        block_count: 4,
        reflection_len: 212,
        duration_ms: 91,
        last_decision_present: true,
        naming_fired: false,
        invitation_offered: true,
        attempt_id_rejected: false,
        detail_ok: true,
      })
    ).toEqual({
      block_count: 4,
      reflection_len: 212,
      duration_ms: 91,
      last_decision_present: true,
      naming_fired: false,
      invitation_offered: true,
      attempt_id_rejected: false,
      detail_ok: true,
    });
  });

  it('drops non-scalar values entirely — no nested structures to hide content in', () => {
    const out = sanitizeDetail({
      block_count: { nested: 'content' },
      reason_count: ['a', 'b'],
      status: undefined,
      seam_origin: () => 'x',
    } as unknown as Record<string, unknown>);
    expect(out).toEqual({});
  });

  it('drops non-finite numbers', () => {
    expect(sanitizeDetail({ duration_ms: NaN, block_count: Infinity })).toEqual({});
  });

  it('rejects keys that are not lowercase snake tokens', () => {
    expect(isAllowedDetailKey('Block_count')).toBe(false);
    expect(isAllowedDetailKey('block-count')).toBe(false);
    expect(isAllowedDetailKey('_count')).toBe(false);
    expect(isAllowedDetailKey('block_count')).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════
// 2. Authority separation
// ═══════════════════════════════════════════════════════════════

describe('authority separation — the client proposes, the server decides', () => {
  it('accepts a well-shaped client attempt_id', () => {
    expect(sanitizeAttemptId('att-0123456789ab')).toBe('att-0123456789ab');
  });

  it('rejects malformed, oversized, or non-string attempt_ids', () => {
    expect(sanitizeAttemptId('short')).toBeNull();
    expect(sanitizeAttemptId('a'.repeat(65))).toBeNull();
    expect(sanitizeAttemptId('has space in it')).toBeNull();
    expect(sanitizeAttemptId('drop; DELETE FROM member_ideas')).toBeNull();
    expect(sanitizeAttemptId(null)).toBeNull();
    expect(sanitizeAttemptId(42)).toBeNull();
    expect(sanitizeAttemptId({ toString: () => 'att-aaaaaaaaaa' })).toBeNull();
  });

  it('mints a server request_id that no header can influence', () => {
    const headers = new Headers({
      [ATTEMPT_ID_HEADER]: 'att-0123456789ab',
      'x-request-id': 'req-attacker-supplied',
      'x-ideas-request-id': 'req-attacker-supplied',
    });
    const { ctx: c } = serverStageContext(headers);
    expect(c.attemptId).toBe('att-0123456789ab');
    expect(c.requestId).not.toBe('req-attacker-supplied');
    expect(c.requestId).toMatch(/^req-/);
  });

  it('records a rejection rather than silently treating it as absence', () => {
    const present = serverStageContext(new Headers({ [ATTEMPT_ID_HEADER]: 'bad' }));
    expect(present.ctx.attemptId).toBeNull();
    expect(present.attemptIdRejected).toBe(true);

    const absent = serverStageContext(new Headers({}));
    expect(absent.ctx.attemptId).toBeNull();
    expect(absent.attemptIdRejected).toBe(false);
  });

  it('never emits a request_id on a client-side event, even if one is set', () => {
    const event = buildStageEvent(
      { side: 'client', requestId: 'req-should-not-appear', attemptId: 'att-x', runtimeRevision: 'r' },
      'client.ask_request',
      'entered'
    );
    expect(event.request_id).toBeNull();
    expect(event.attempt_id).toBe('att-x');
  });

  it('mints distinguishable, non-colliding identifiers', () => {
    expect(newAttemptId()).toMatch(/^att-/);
    expect(newRequestId()).toMatch(/^req-/);
    expect(newAttemptId()).not.toBe(newAttemptId());
    expect(newRequestId()).not.toBe(newRequestId());
  });
});

// ═══════════════════════════════════════════════════════════════
// 3. Runtime revision — truthful or unknown, never fabricated
// ═══════════════════════════════════════════════════════════════

describe('runtime revision', () => {
  const prior = process.env.GIT_COMMIT;
  afterEach(() => {
    if (prior === undefined) delete process.env.GIT_COMMIT;
    else process.env.GIT_COMMIT = prior;
  });

  it('reports the stamped commit when present', () => {
    process.env.GIT_COMMIT = 'a1b2c3d';
    expect(serverRuntimeRevision()).toBe('a1b2c3d');
  });

  it('reports unknown — never a fabricated value — when unstamped', () => {
    delete process.env.GIT_COMMIT;
    expect(serverRuntimeRevision()).toBe(UNKNOWN_REVISION);
    process.env.GIT_COMMIT = '   ';
    expect(serverRuntimeRevision()).toBe(UNKNOWN_REVISION);
  });

  it('refuses a non-token commit value rather than logging it', () => {
    process.env.GIT_COMMIT = 'not a commit sha';
    expect(serverRuntimeRevision()).toBe(UNKNOWN_REVISION);
  });

  it('passes an unstamped client build through as unknown', () => {
    expect(clientRuntimeRevision(undefined)).toBe(UNKNOWN_REVISION);
    expect(clientRuntimeRevision('')).toBe(UNKNOWN_REVISION);
    expect(clientRuntimeRevision('UNSTAMPED')).toBe('UNSTAMPED');
    expect(clientRuntimeRevision('a1b2c3d')).toBe('a1b2c3d');
  });

  it('stamps every event with a runtime revision', () => {
    for (const seam of ALL_SEAMS) {
      const e = buildStageEvent(ctx(), seam, 'entered');
      expect(e.runtime_revision).toBe('abc1234');
      expect(e.seam).toBe(seam);
    }
  });
});

// ═══════════════════════════════════════════════════════════════
// 4. stage() is transparent to control flow
// ═══════════════════════════════════════════════════════════════

describe('stage() — bracketing without behavior change', () => {
  it('emits entered then completed and returns the value unchanged', async () => {
    const c = ctx();
    const value = { rows: [1, 2, 3] };
    const result = await stage(c, 'server.idea_fetch', async () => value, (r) => ({
      row_count: r.rows.length,
    }));
    expect(result).toBe(value);

    const events = c.lines.map((l) => JSON.parse(l.replace('[ideas/T1] ', '')));
    expect(events.map((e) => e.phase)).toEqual(['entered', 'completed']);
    expect(events[1].detail).toEqual({ row_count: 3, duration_ms: 0 });
  });

  it('emits failed and re-throws the ORIGINAL error, unchanged', async () => {
    const c = ctx();
    const boom = new TypeError('model exploded');
    await expect(
      stage(c, 'server.model_call', async () => {
        throw boom;
      })
    ).rejects.toBe(boom);

    const events = c.lines.map((l) => JSON.parse(l.replace('[ideas/T1] ', '')));
    expect(events.map((e) => e.phase)).toEqual(['entered', 'failed']);
    expect(events[1].seam).toBe('server.model_call');
    expect(events[1].detail.error_name).toBe('TypeError');
  });

  it('degrades the log line, never the request, when detailOf throws', async () => {
    const c = ctx();
    const result = await stage(c, 'server.persist', async () => 'value', () => {
      throw new Error('bad detail fn');
    });
    expect(result).toBe('value');
    const completed = JSON.parse(c.lines[1].replace('[ideas/T1] ', ''));
    expect(completed.phase).toBe('completed');
    expect(completed.detail.detail_ok).toBe(false);
  });

  it('swallows a throwing sink rather than failing the caller', async () => {
    const c: StageContext = {
      side: 'server',
      requestId: 'req-x',
      attemptId: null,
      runtimeRevision: 'r',
      sink: () => {
        throw new Error('log transport down');
      },
    };
    await expect(stage(c, 'server.touch', async () => 'ok')).resolves.toBe('ok');
  });

  it('is fully silenced by the IDEAS_T1_DISABLED kill switch', () => {
    const c = ctx();
    process.env.IDEAS_T1_DISABLED = '1';
    try {
      emitStage(c, 'server.auth', 'entered');
      expect(c.lines).toHaveLength(0);
    } finally {
      delete process.env.IDEAS_T1_DISABLED;
    }
  });

  it('emits one parseable JSON object per line, behind a greppable marker', () => {
    const c = ctx();
    emitStage(c, 'server.auth', 'entered', { attempt_id_rejected: false });
    expect(c.lines).toHaveLength(1);
    expect(c.lines[0].startsWith('[ideas/T1] ')).toBe(true);
    expect(c.lines[0]).not.toContain('\n');
    expect(JSON.parse(c.lines[0].replace('[ideas/T1] ', ''))).toMatchObject({
      instrument: 'ideas.fault_localization',
      side: 'server',
      seam: 'server.auth',
      phase: 'entered',
      request_id: 'req-fixed',
      attempt_id: 'att-fixed',
    });
  });
});

// ═══════════════════════════════════════════════════════════════
// 5. Seam distinction
// ═══════════════════════════════════════════════════════════════

describe('seam vocabulary', () => {
  it('is closed and free of duplicates', () => {
    expect(new Set(ALL_SEAMS).size).toBe(ALL_SEAMS.length);
  });

  it('separates client-side from server-side seams by prefix', () => {
    for (const seam of ALL_SEAMS) {
      expect(seam.startsWith('client.') || seam.startsWith('server.')).toBe(true);
    }
  });
});
