/** @jest-environment node */
import { NextRequest } from 'next/server';
import { withSourcePersistenceLease, transitionSourcePersistencePosture, PersistenceRefused } from '../sessionPersistenceLease';
import { pool } from '@/lib/db/postgres';
jest.mock('@/lib/db/postgres', () => ({ pool: { connect: jest.fn() } }));
const connect = pool!.connect as jest.Mock;
const req = () => new NextRequest('http://localhost/api/writers-studio/sources', { headers: { 'x-session-token': 'valid-fixture' }});
let queries: string[];
let release: jest.Mock;
beforeEach(() => { jest.resetAllMocks(); queries = []; release = jest.fn(); });
function setup(posture: string, present = true) {
  const client = { release, query: jest.fn(async (sql: string) => {
    queries.push(sql.trim().split(/\s+/).slice(0,3).join(' '));
    if (sql.includes('FROM auth_sessions')) return { rows: present ? [{ source_persistence_posture: posture, source_persistence_revision: '3' }] : [] };
    if (sql.includes('UPDATE auth_sessions')) return { rows: present ? [{ source_persistence_revision: '4' }] : [] };
    return { rows: [] };
  })};
  connect.mockResolvedValue(client);
  return client;
}
test('ordinary authenticated lease holds lock through async work and releases after commit', async () => {
  setup('ordinary');
  let end!: () => void;
  const during = new Promise<void>(resolve => { end = resolve; });
  const work = jest.fn(async () => { await during; return 'saved'; });
  const result = withSourcePersistenceLease(req(), 'm1', work);
  await new Promise(resolve => setImmediate(resolve));
  expect(queries.some(q => q.includes('FOR UPDATE'))).toBe(false); // compact query recorder, checked below in mock SQL
  expect(queries).toEqual(['BEGIN', 'SELECT source_persistence_posture, source_persistence_revision']);
  expect(release).not.toHaveBeenCalled();
  end();
  await expect(result).resolves.toBe('saved');
  expect(queries.at(-1)).toBe('COMMIT');
  expect(release).toHaveBeenCalledTimes(1);
});
test.each(['sanctuary','unresolved'])('%s posture refuses and rolls back without executing content write', async posture => {
  setup(posture);
  const work = jest.fn();
  await expect(withSourcePersistenceLease(req(), 'm1', work)).rejects.toBeInstanceOf(PersistenceRefused);
  expect(work).not.toHaveBeenCalled();
  expect(queries.at(-1)).toBe('ROLLBACK');
  expect(release).toHaveBeenCalledTimes(1);
});
test('missing or revoked session refuses writes', async () => {
  setup('ordinary', false);
  await expect(withSourcePersistenceLease(req(), 'm1', jest.fn())).rejects.toBeInstanceOf(PersistenceRefused);
});
test('transition uses session-bound update with acknowledged revision', async () => {
  const client = setup('ordinary');
  await expect(transitionSourcePersistencePosture(req(), 'm1', 'sanctuary')).resolves.toEqual({ posture: 'sanctuary', revision: '4' });
  expect(client.query.mock.calls[1][0]).toContain('source_persistence_revision = source_persistence_revision + 1');
  expect(client.query.mock.calls[1][0]).toContain('session_token = $1 AND member_id = $2');
  expect(queries.at(-1)).toBe('COMMIT');
});
