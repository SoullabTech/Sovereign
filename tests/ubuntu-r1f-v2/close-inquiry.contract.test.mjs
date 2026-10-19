/**
 * Ubuntu R1F V2 isolated fictional test-only contract.
 * Reads ONLY the three approved Circle application files from this checkout.
 * Imports no Soullab runtime module, opens no socket, contacts no database.
 * Requires Node >=22 with node:module stripTypeScriptTypes.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';
import { runInNewContext } from 'node:vm';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const paths = Object.freeze({
  inquiry: 'lib/circles/inquiryService.ts',
  route: 'app/api/circles/[circleId]/inquiries/[inquiryId]/close/route.ts',
  fieldMemory: 'components/circles/FieldMemory.tsx',
});
const source = Object.fromEntries(
  Object.entries(paths).map(([name, path]) => [name, readFileSync(join(repo, path), 'utf8')])
);
function extract(fn, body) {
  const target = 'export async function ' + fn + '(';
  const begin = body.indexOf(target);
  assert.ok(begin >= 0, 'MISSING_' + fn);
  const rest = body.slice(begin);
  const next = rest.indexOf('\nexport ', 1);
  return next < 0 ? rest : rest.slice(0, next);
}
function loadFunction(fn, sourceText, stubs) {
  const javascript = stripTypeScriptTypes(extract(fn, sourceText), { mode: 'strip' })
    .replace(/^export\s+async\s+function/, 'async function');
  return runInNewContext(javascript + '\n' + fn, Object.freeze({ ...stubs }));
}
function fakeDb() {
  const circle = 'fictional-circle';
  const inquiryId = 'fictional-inquiry';
  const opener = 'fictional-facilitator';
  let row = {
    id: inquiryId, circle_id: circle, opened_by: opener,
    status: 'open', field_synthesis: 'legacy-fictional-summary',
  };
  let memberActive = true;
  let calls = [];
  const getCircleWithMembership = async (circleId, memberId) => {
    if (!memberActive || circleId !== circle || memberId !== opener) throw new Error('FORBIDDEN');
    return { membership: { role: 'facilitator', status: 'active' } };
  };
  const queryOne = async (sql, params) => {
    calls.push({ sql, params });
    if (sql.includes('SELECT id, circle_id, opened_by, status')) {
      return params[0] === inquiryId
        ? { id: row.id, circle_id: row.circle_id, opened_by: row.opened_by, status: row.status } : null;
    }
    if (sql.includes('UPDATE circle_inquiries ci')) {
      assert.match(sql, /AND ci\.status = 'open'/);
      assert.match(sql, /cm\.status = 'active'/);
      assert.match(sql, /FOR SHARE/);
      assert.match(sql, /field_synthesis = NULL/);
      if (!memberActive || row.status !== 'open' ||
          params[0] !== inquiryId || params[1] !== circle || params[2] !== opener) return null;
      row = { ...row, status: 'closed', field_synthesis: null };
      return { ...row };
    }
    throw new Error('UNEXPECTED_SQL_IN_FICTIONAL_QUERY_MOCK');
  };
  return {
    circle, inquiryId, opener, queryOne, getCircleWithMembership,
    get row() { return row; },
    get calls() { return calls; },
    setMemberActive(value) { memberActive = value; },
    setStatus(value) { row = { ...row, status: value }; },
  };
}
const fakeResponse = { json(body, opts = {}) { return { status: opts.status ?? 200, body }; } };
function loadRoute(fixture, accessResult = { ok: true, memberId: 'fictional-facilitator' }) {
  return loadFunction('POST', source.route, {
    closeInquiry: loadFunction('closeInquiry', source.inquiry, fixture),
    requireCircleAccess: async () => accessResult,
    NextResponse: fakeResponse,
    console: { error() { throw new Error('UNEXPECTED_ROUTE_500'); } },
  });
}
async function callRoute(post, jsonText, circle = 'fictional-circle') {
  return post(
    { text: async () => jsonText },
    { params: Promise.resolve({ circleId: circle, inquiryId: 'fictional-inquiry' }) }
  );
}
function assertContiguousBind(sql, params) {
  const ids = [...sql.matchAll(/\$(\d+)/g)].map(m => Number(m[1]));
  const highest = Math.max(0, ...ids);
  assert.equal(params.length, highest, 'wrong bind count');
  for (let i = 1; i <= highest; i++) assert.ok(ids.includes(i), 'sparse bind index ' + i);
}

test('U01 empty body remains a successful, synthesis-free close', async () => {
  const db = fakeDb();
  const result = await callRoute(loadRoute(db), '');
  assert.equal(result.status, 200);
  assert.equal(db.row.status, 'closed');
  assert.equal(db.row.field_synthesis, null);
});
test('U02 empty JSON object remains an accepted close', async () => {
  const result = await callRoute(loadRoute(fakeDb()), '{}');
  assert.equal(result.status, 200);
});
test('U03 explicit JSON null synthesis remains equivalent to none', async () => {
  const result = await callRoute(loadRoute(fakeDb()), '{"fieldSynthesis":null}');
  assert.equal(result.status, 200);
});
test('U04 non-null fieldSynthesis values fail closed at service boundary', async () => {
  for (const value of ['"fictional-summary"', '""', '123', 'false', '{}', '[]']) {
    const db = fakeDb();
    const result = await callRoute(loadRoute(db), '{"fieldSynthesis":' + value + '}');
    assert.equal(result.status, 400, value);
    assert.equal(db.calls.length, 0, 'source DB should not be contacted');
  }
});
test('U05 valid JSON null and non-object bodies refuse with client error', async () => {
  for (const text of ['null', '[]', '"x"', '42', 'true']) {
    const db = fakeDb();
    const result = await callRoute(loadRoute(db), text);
    assert.equal(result.status, 400, text);
    assert.equal(db.calls.length, 0);
  }
});
test('U06 malformed JSON refuses with client error', async () => {
  const db = fakeDb();
  const result = await callRoute(loadRoute(db), '{"fieldSynthesis":');
  assert.equal(result.status, 400);
  assert.equal(db.calls.length, 0);
});
test('U07 current route authentication refusal is preserved', async () => {
  const db = fakeDb();
  const result = await callRoute(loadRoute(db, { ok: false, status: 403, error: 'Unavailable' }), '{}');
  assert.equal(result.status, 403);
  assert.equal(db.calls.length, 0);
});
test('U08 mismatched Circle path cannot close the inquiry', async () => {
  const db = fakeDb();
  const result = await callRoute(loadRoute(db), '{}', 'different-circle');
  assert.equal(result.status, 404);
  assert.equal(db.row.status, 'open');
});
test('U09 inactive opener cannot close the inquiry', async () => {
  const db = fakeDb();
  db.setMemberActive(false);
  const result = await callRoute(loadRoute(db), '{}');
  assert.equal(result.status, 403);
  assert.equal(db.row.status, 'open');
});
test('U10 already closed inquiry is refused without mutation', async () => {
  const db = fakeDb();
  db.setStatus('closed');
  const result = await callRoute(loadRoute(db), '{}');
  assert.equal(result.status, 409);
});
test('U11 competing close requests have one winner in query mock only', async () => {
  const db = fakeDb();
  const post = loadRoute(db);
  const results = await Promise.all([
    callRoute(post, '{}'), callRoute(post, '{}'),
  ]);
  assert.deepEqual(results.map(x => x.status).sort(), [200, 409]);
  // This is a mock of the SQL conditional transition, NOT a PG locking test.
});
test('U12 unfiltered inquiry listing binds only Circle ID', async () => {
  const calls = [];
  const list = loadFunction('listInquiries', source.inquiry, {
    getCircleWithMembership: async () => ({ membership: { status: 'active' } }),
    query: async (sql, params) => {
      assertContiguousBind(sql, params);
      assert.deepEqual(Array.from(params), ['fictional-circle']);
      assert.match(sql, /NULL::text AS field_synthesis/);
      assert.doesNotMatch(sql, /SELECT ci\.\*/);
      calls.push(sql);
      return { rows: [{ field_synthesis: null }] };
    },
  });
  const rows = await list('fictional-circle', 'fictional-member');
  assert.equal(rows[0].field_synthesis, null);
  assert.equal(calls.length, 1);
});
test('U13 filtered inquiry listings bind contiguous parameters', async () => {
  for (const status of ['open', 'closed']) {
    const list = loadFunction('listInquiries', source.inquiry, {
      getCircleWithMembership: async () => ({ membership: { status: 'active' } }),
      query: async (sql, params) => {
        assertContiguousBind(sql, params);
        assert.deepEqual(Array.from(params), ['fictional-circle', status]);
        assert.match(sql, /AND ci\.status = \$2/);
        assert.match(sql, /NULL::text AS field_synthesis/);
        return { rows: [{ field_synthesis: null }] };
      },
    });
    const rows = await list('fictional-circle', 'fictional-member', status);
    assert.equal(rows[0].field_synthesis, null);
  }
});
test('U14 inquiry detail projection hides legacy synthesis in response shape', async () => {
  const service = loadFunction('getInquiryWithResponses', source.inquiry, {
    getCircleWithMembership: async () => ({ membership: { status: 'active' } }),
    queryOne: async (sql, params) => {
      if (sql.includes('FROM circle_inquiries ci')) {
        assert.match(sql, /NULL::text AS field_synthesis/);
        assert.doesNotMatch(sql, /SELECT ci\.\*/);
        return {
          id: 'fictional-inquiry', circle_id: 'fictional-circle',
          opened_by: 'fictional-facilitator', status: 'closed',
          field_synthesis: null, opener_name: 'fictional-F',
        };
      }
      return null;
    },
    query: async (sql) => {
      assert.match(sql, /withdrawn_at IS NULL/);
      return { rows: [] };
    },
  });
  const result = await service('fictional-inquiry', 'fictional-member');
  assert.equal(result.inquiry.field_synthesis, null);
});
test('U15 FieldMemory copy does not promise unavailable syntheses', () => {
  assert.match(source.fieldMemory, /Past inquiries will appear here\./);
  assert.doesNotMatch(source.fieldMemory, /Past inquiries and their syntheses will appear here\./);
});
test('U16 named privacy and concurrency guards remain in source', () => {
  assert.match(source.inquiry, /field_synthesis = NULL/);
  assert.match(source.inquiry, /AND ci\.status = 'open'/);
  assert.match(source.inquiry, /FOR SHARE/);
  assert.equal((source.inquiry.match(/NULL::text AS field_synthesis/g) ?? []).length, 2);
  assert.doesNotMatch(source.inquiry, /SELECT ci\.\*/);
});
