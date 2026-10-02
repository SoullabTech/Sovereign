/**
 * SANCTUARY-MANUSCRIPT-KEEP-01 / S1 — reference doubles + defeat candidates.
 *
 * Each server candidate replaces ONE decision on an identical substrate
 * (`ordinaryWrite` is the unchanged existing Press keep path: ownership SELECT,
 * verbatim containment, INSERT). A candidate is the smallest competent
 * embodiment of its named error; it is disposable and must never be a seed.
 *
 * ⛔ The REFERENCE_SERVER is a test double proving the laws are mutually
 * satisfiable. It is not the implementation and the live route is not derived
 * from it — the live route is proved separately, by the same laws.
 */

import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db/postgres';
import { getMemberIdFromRequest } from '@/lib/auth/getMemberFromRequest';
import { TurnPosture, contentWritable } from '@/lib/sanctuary/turnPosture';
import { readCurrentSanctuaryPosture, type CurrentPostureRead } from '@/lib/sanctuary/currentClientPosture';
import { buildKeepRequestBody, type KeepRequest } from '@/app/press/manuscript/keepRequest';
import type { RouteLike, TestStorage } from './harness';
import type { KeeperFactory } from './laws';

type Ctx = { params: Promise<{ id: string }> };

function containsVerbatim(haystack: string, needle: string): boolean {
  const norm = (t: string) => t.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim();
  return norm(haystack).includes(norm(needle));
}

/** The unchanged existing keep path, from ownership SELECT to 201. */
async function ordinaryWrite(memberId: string, id: string, sectionId: string, text: string, opts: { skipContainment?: boolean } = {}) {
  const section = await query<{ id: string; body: string }>(
    `SELECT s.id, s.body FROM manuscript_sections s JOIN member_manuscripts m ON m.id = s.manuscript_id WHERE s.id = $1 AND m.id = $2 AND m.member_id = $3`,
    [sectionId, id, memberId],
  );
  if (section.rows.length === 0) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
  if (!opts.skipContainment && !containsVerbatim(section.rows[0]!.body, text)) {
    return NextResponse.json({ error: 'Passage not found verbatim in this section' }, { status: 422 });
  }
  const result = await query<{ id: string; created_at: string }>(
    `INSERT INTO manuscript_keeps (member_id, manuscript_id, section_id, verbatim_text) VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
    [memberId, id, sectionId, text],
  );
  return NextResponse.json({ keep: { id: result.rows[0]!.id, createdAt: result.rows[0]!.created_at } }, { status: 201 });
}

async function parse(request: NextRequest, ctx: Ctx) {
  const memberId = await getMemberIdFromRequest(request);
  const { id } = await ctx.params;
  let body: Record<string, unknown> = {};
  try {
    body = ((await request.json()) ?? {}) as Record<string, unknown>;
  } catch {
    body = {};
  }
  return { memberId, id, body, sectionId: body['sectionId'], text: body['text'], sanctuary: body['sanctuary'] };
}

const unauthorized = () => NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
const badFields = () => NextResponse.json({ error: 'sectionId and non-empty text are required' }, { status: 400 });
const postureRequired = () => NextResponse.json({ error: 'posture_required', persisted: false }, { status: 400 });
const sanctuaryReceipt = () => NextResponse.json({ success: true, sanctuary: true, persisted: false });
const fieldsOk = (sectionId: unknown, text: unknown): sectionId is string =>
  typeof sectionId === 'string' && typeof text === 'string' && text.trim().length > 0;

/** The canonical DELETE, unchanged: ignores any Sanctuary hint. */
async function ordinaryDelete(request: NextRequest, ctx: Ctx) {
  const memberId = await getMemberIdFromRequest(request);
  if (!memberId) return unauthorized();
  const { id } = await ctx.params;
  const keepId = request.nextUrl.searchParams.get('keepId');
  if (!keepId) return NextResponse.json({ error: 'keepId is required' }, { status: 400 });
  const result = await query(`DELETE FROM manuscript_keeps WHERE id = $1 AND manuscript_id = $2 AND member_id = $3`, [keepId, id, memberId]);
  if ((result.rowCount ?? 0) === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ removed: true });
}

/** Conforming reference double. */
export const REFERENCE_SERVER: RouteLike = {
  async POST(request, ctx) {
    const p = await parse(request, ctx);
    if (!p.memberId) return unauthorized();
    if (typeof p.sanctuary !== 'boolean') return postureRequired();
    const posture = TurnPosture.resolve(p.body);
    if (!contentWritable(posture, 'manuscript_keeps')) return sanctuaryReceipt();
    if (!fieldsOk(p.sectionId, p.text)) return badFields();
    return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
  },
  DELETE: ordinaryDelete,
};

export const SERVER_CANDIDATES: Record<string, RouteLike> = {
  /** DS-1: the canonical route as it stands — nothing on the server reads posture. */
  'DS-1-client-only-guard': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
    },
    DELETE: ordinaryDelete,
  },
  /** DS-2: TurnPosture.resolve(body) with no boolean requirement — absence becomes ordinary. */
  'DS-2-absence-resolves-ordinary': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      const posture = TurnPosture.resolve(p.body);
      if (!contentWritable(posture, 'manuscript_keeps')) return sanctuaryReceipt();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
    },
    DELETE: ordinaryDelete,
  },
  /** DS-3: when the body carries no posture, ask the latest session row instead. */
  'DS-3-session-substitution': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      let sanctuary = p.sanctuary;
      if (typeof sanctuary !== 'boolean') {
        const row = await query<{ sanctuary: boolean }>(
          `SELECT sanctuary FROM maia_sessions WHERE member_id = $1 ORDER BY created_at DESC LIMIT 1`,
          [p.memberId],
        );
        sanctuary = row.rows[0]?.sanctuary ?? false;
      }
      const posture = TurnPosture.resolve({ ...p.body, sanctuary });
      if (!contentWritable(posture, 'manuscript_keeps')) return sanctuaryReceipt();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
    },
    DELETE: ordinaryDelete,
  },
  /** DS-4: the guard sits after the ownership SELECT. */
  'DS-4-guard-after-select': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      const section = await query<{ id: string; body: string }>(
        `SELECT s.id, s.body FROM manuscript_sections s JOIN member_manuscripts m ON m.id = s.manuscript_id WHERE s.id = $1 AND m.id = $2 AND m.member_id = $3`,
        [p.sectionId, p.id, p.memberId],
      );
      if (section.rows.length === 0) return NextResponse.json({ error: 'Section not found' }, { status: 404 });
      if (typeof p.sanctuary !== 'boolean') return postureRequired();
      const posture = TurnPosture.resolve(p.body);
      if (!contentWritable(posture, 'manuscript_keeps')) return sanctuaryReceipt();
      if (!containsVerbatim(section.rows[0]!.body, p.text as string)) return NextResponse.json({ error: 'nope' }, { status: 422 });
      const result = await query<{ id: string; created_at: string }>(
        `INSERT INTO manuscript_keeps (member_id, manuscript_id, section_id, verbatim_text) VALUES ($1, $2, $3, $4) RETURNING id, created_at`,
        [p.memberId, p.id, p.sectionId, p.text],
      );
      return NextResponse.json({ keep: { id: result.rows[0]!.id, createdAt: result.rows[0]!.created_at } }, { status: 201 });
    },
    DELETE: ordinaryDelete,
  },
  /** DS-5: write first, then undo if the posture turns out to forbid it. */
  'DS-5-guard-after-insert': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      const written = await ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
      if (written.status !== 201) return written;
      if (typeof p.sanctuary !== 'boolean') {
        await query(`DELETE FROM manuscript_keeps WHERE member_id = $1 AND section_id = $2 AND verbatim_text = $3`, [p.memberId, p.sectionId, p.text]);
        return postureRequired();
      }
      const posture = TurnPosture.resolve(p.body);
      if (!contentWritable(posture, 'manuscript_keeps')) {
        await query(`DELETE FROM manuscript_keeps WHERE member_id = $1 AND section_id = $2 AND verbatim_text = $3`, [p.memberId, p.sectionId, p.text]);
        return sanctuaryReceipt();
      }
      return written;
    },
    DELETE: ordinaryDelete,
  },
  /** DS-6: accepts the strings 'true' / 'false' as posture. */
  'DS-6-string-coercion': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      const s = p.sanctuary;
      const sanctuary = s === true || s === 'true' ? true : s === false || s === 'false' ? false : undefined;
      if (sanctuary === undefined) return postureRequired();
      const posture = TurnPosture.resolve({ ...p.body, sanctuary });
      if (!contentWritable(posture, 'manuscript_keeps')) return sanctuaryReceipt();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
    },
    DELETE: ordinaryDelete,
  },
  /** DS-7: Sanctuary reported as an error status rather than a receipt. */
  'DS-7-sanctuary-as-error': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      if (typeof p.sanctuary !== 'boolean') return postureRequired();
      const posture = TurnPosture.resolve(p.body);
      if (!contentWritable(posture, 'manuscript_keeps')) return NextResponse.json({ error: 'sanctuary' }, { status: 403 });
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
    },
    DELETE: ordinaryDelete,
  },
  /** DS-8: missing posture fails closed — but wearing the Sanctuary receipt. */
  'DS-8-refusals-conflated': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      if (typeof p.sanctuary !== 'boolean') return sanctuaryReceipt();
      const posture = TurnPosture.resolve(p.body);
      if (!contentWritable(posture, 'manuscript_keeps')) return sanctuaryReceipt();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
    },
    DELETE: ordinaryDelete,
  },
  /** DS-9: the receipt helpfully echoes what was not kept. */
  'DS-9-receipt-echoes-passage': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      if (typeof p.sanctuary !== 'boolean') return postureRequired();
      const posture = TurnPosture.resolve(p.body);
      if (!contentWritable(posture, 'manuscript_keeps')) {
        return NextResponse.json({ success: true, sanctuary: true, persisted: false, text: p.text });
      }
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
    },
    DELETE: ordinaryDelete,
  },
  /** DS-10: mints posture from the top-level boolean alone, ignoring a nested affirmative. */
  'DS-10-top-level-only': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      if (typeof p.sanctuary !== 'boolean') return postureRequired();
      const posture = TurnPosture.resolve({ sanctuary: p.sanctuary });
      if (!contentWritable(posture, 'manuscript_keeps')) return sanctuaryReceipt();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string);
    },
    DELETE: ordinaryDelete,
  },
  /** DS-11: Sanctuary "protects" the member from deleting too. */
  'DS-11-delete-gated': {
    POST: REFERENCE_SERVER.POST,
    async DELETE(request, ctx) {
      const hinted = request.nextUrl.searchParams.get('sanctuary') === 'true' || request.headers.get('x-sanctuary') === 'true';
      if (hinted) return NextResponse.json({ success: true, sanctuary: true, removed: false });
      return ordinaryDelete(request, ctx);
    },
  },
  /** DS-12: the posture gate is treated as the whole gate; containment dropped. */
  'DS-12-posture-replaces-containment': {
    async POST(request, ctx) {
      const p = await parse(request, ctx);
      if (!p.memberId) return unauthorized();
      if (typeof p.sanctuary !== 'boolean') return postureRequired();
      const posture = TurnPosture.resolve(p.body);
      if (!contentWritable(posture, 'manuscript_keeps')) return sanctuaryReceipt();
      if (!fieldsOk(p.sectionId, p.text)) return badFields();
      return ordinaryWrite(p.memberId, p.id, p.sectionId, p.text as string, { skipContainment: true });
    },
    DELETE: ordinaryDelete,
  },
};

export const SERVER_NAMED_KILL: Record<string, string> = {
  'DS-1-client-only-guard': 'SK-1-sanctuary-refused-with-receipt',
  'DS-2-absence-resolves-ordinary': 'SK-4-missing-posture-fails-closed',
  'DS-3-session-substitution': 'SK-11-no-session-substitution',
  'DS-4-guard-after-select': 'SK-2-sanctuary-touches-no-store',
  'DS-5-guard-after-insert': 'SK-2-sanctuary-touches-no-store',
  'DS-6-string-coercion': 'SK-5-malformed-posture-fails-closed',
  'DS-7-sanctuary-as-error': 'SK-1-sanctuary-refused-with-receipt',
  'DS-8-refusals-conflated': 'SK-6-refusals-distinguishable',
  'DS-9-receipt-echoes-passage': 'SK-7-refusal-carries-no-content',
  'DS-10-top-level-only': 'SK-8-contradiction-fails-closed',
  'DS-11-delete-gated': 'SK-9-delete-reachable-under-sanctuary',
  'DS-12-posture-replaces-containment': 'SK-10-ordinary-checks-preserved',
};

/** Collateral that is a necessary consequence of the named error (filled after the first run). */
export const SERVER_CLASSIFIED: Record<string, string[]> = {
  // A route that reads no posture writes on every input: every refusal law
  // and the no-content law (a 201 carries a keep identity) fall together.
  'DS-1-client-only-guard': [
    'SK-2-sanctuary-touches-no-store', 'SK-4-missing-posture-fails-closed', 'SK-5-malformed-posture-fails-closed',
    'SK-6-refusals-distinguishable', 'SK-7-refusal-carries-no-content', 'SK-8-contradiction-fails-closed',
  ],
  // resolve() without a boolean requirement accepts every shape ('false' → ordinary,
  // 'true' → receipt-not-400) and a missing posture yields a 201 keep identity.
  'DS-2-absence-resolves-ordinary': ['SK-5-malformed-posture-fails-closed', 'SK-7-refusal-carries-no-content'],
  // The substituted session row says ordinary, so missing/malformed write and
  // the reply that should have been a refusal carries a keep identity.
  'DS-3-session-substitution': ['SK-4-missing-posture-fails-closed', 'SK-5-malformed-posture-fails-closed', 'SK-7-refusal-carries-no-content'],
  // A gate placed after the SELECT reads the manuscript for every posture outcome.
  'DS-4-guard-after-select': ['SK-4-missing-posture-fails-closed', 'SK-5-malformed-posture-fails-closed'],
  // A gate placed after the INSERT writes for every posture outcome, contradiction included.
  'DS-5-guard-after-insert': ['SK-4-missing-posture-fails-closed', 'SK-5-malformed-posture-fails-closed', 'SK-8-contradiction-fails-closed'],
  // 'false' as a string becomes an ordinary 201, so that refusal carries a keep identity.
  'DS-6-string-coercion': ['SK-7-refusal-carries-no-content'],
  // Conflation IS a missing posture answered with the Sanctuary receipt (200, not 400).
  'DS-8-refusals-conflated': ['SK-4-missing-posture-fails-closed', 'SK-5-malformed-posture-fails-closed'],
};

// ─── caller ────────────────────────────────────────────────────────────────

const CARD_KEEPER =
  (read: () => CurrentPostureRead) =>
  (card: { sectionId: string; text: string }): KeepRequest =>
    buildKeepRequestBody(card, read());

export const REFERENCE_CALLER: KeeperFactory = (storage: TestStorage) =>
  CARD_KEEPER(() => readCurrentSanctuaryPosture(storage));

export const CALLER_CANDIDATES: Record<string, KeeperFactory> = {
  /** DC-1: read once when the page mounts; reuse for every gesture. */
  'DC-1-snapshot-at-mount': (storage) => {
    const snapshot = readCurrentSanctuaryPosture(storage);
    return CARD_KEEPER(() => snapshot);
  },
  /** DC-2: the body as it is today — no posture at all. */
  'DC-2-omits-posture': () => (card) => ({ ok: true, body: { ...card } as unknown as KeepRequest extends { ok: true; body: infer B } ? B : never }),
  /** DC-3: no live settings means "not in Sanctuary". */
  'DC-3-absence-is-ordinary': (storage) =>
    CARD_KEEPER(() => {
      try {
        const raw = storage.getItem('maia_settings');
        if (raw === null) return { resolved: true, sanctuary: false };
        const v = JSON.parse(raw)?.sanctuary;
        return typeof v === 'boolean' ? { resolved: true, sanctuary: v } : { resolved: false, reason: 'not_boolean' };
      } catch {
        return { resolved: false, reason: 'unreadable' };
      }
    }),
  /** DC-4: fall back to the account default when the live setting is absent. */
  'DC-4-default-preference-fallback': (storage) =>
    CARD_KEEPER(() => {
      const live = readCurrentSanctuaryPosture(storage);
      if (live.resolved) return live;
      try {
        const mode = JSON.parse(storage.getItem('maia_account_settings') ?? 'null')?.defaultMemoryMode;
        if (mode === 'sanctuary' || mode === 'continuity') return { resolved: true, sanctuary: mode === 'sanctuary' };
      } catch {
        /* fall through */
      }
      return live;
    }),
  /** DC-5: the string 'true' counts as Sanctuary; anything else is ordinary. */
  'DC-5-string-coercion': (storage) =>
    CARD_KEEPER(() => {
      try {
        const raw = storage.getItem('maia_settings');
        if (raw === null) return { resolved: false, reason: 'no_live_settings' };
        const v = JSON.parse(raw)?.sanctuary;
        return { resolved: true, sanctuary: v === true || v === 'true' };
      } catch {
        return { resolved: false, reason: 'unreadable' };
      }
    }),
  /** DC-6: a storage error is treated as "not in Sanctuary". */
  'DC-6-storage-failure-is-ordinary': (storage) =>
    CARD_KEEPER(() => {
      let raw: string | null;
      try {
        raw = storage.getItem('maia_settings');
      } catch {
        return { resolved: true, sanctuary: false };
      }
      if (raw === null) return { resolved: false, reason: 'no_live_settings' };
      try {
        const v = JSON.parse(raw)?.sanctuary;
        return typeof v === 'boolean' ? { resolved: true, sanctuary: v } : { resolved: false, reason: 'not_boolean' };
      } catch {
        return { resolved: false, reason: 'unreadable' };
      }
    }),
  /** DC-7: adds a client "I confirm" flag as though it conferred authority. */
  'DC-7-member-confirmed-flag': (storage) => (card) => {
    const r = buildKeepRequestBody(card, readCurrentSanctuaryPosture(storage));
    return r.ok ? { ok: true, body: { ...r.body, memberConfirmed: true } as typeof r.body } : r;
  },
};

export const CALLER_NAMED_KILL: Record<string, string> = {
  'DC-1-snapshot-at-mount': 'CK-1-reads-setting-at-gesture-time',
  'DC-2-omits-posture': 'CK-2-explicit-boolean-no-authority-flag',
  'DC-3-absence-is-ordinary': 'CK-3-absence-is-unresolved',
  'DC-4-default-preference-fallback': 'CK-3-absence-is-unresolved',
  'DC-5-string-coercion': 'CK-4-malformed-is-unresolved',
  'DC-6-storage-failure-is-ordinary': 'CK-5-storage-failure-is-unresolved',
  'DC-7-member-confirmed-flag': 'CK-2-explicit-boolean-no-authority-flag',
};
export const CALLER_CLASSIFIED: Record<string, string[]> = {
  // A keeper that never reads posture cannot be unresolved and cannot track a change.
  'DC-2-omits-posture': [
    'CK-1-reads-setting-at-gesture-time', 'CK-3-absence-is-unresolved', 'CK-4-malformed-is-unresolved', 'CK-5-storage-failure-is-unresolved',
  ],
};
