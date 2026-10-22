/**
 * R9 — direct server mutation exports must be impossible to use to bypass
 * verified independent R20 authority. This test exercises the REAL exports,
 * never mocks the authority or the grant server.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PilotR20AuthorityUnavailable } from '../pilotR20Authority';
import {
  approvePilotWriter, acceptPilotWriter, revokePilotWriter,
} from '../pilotGrantServer';
import {
  approvePilotWriter as fakeApprove,
  acceptPilotWriter as fakeAccept,
  revokePilotWriter as fakeRevoke,
} from '../../../scripts/writers-studio/r9-fixture/fictionalPilotGrantDbModel';

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(() => { throw new Error('R9_MUST_NOT_TOUCH_DATABASE'); }),
  transaction: jest.fn(() => { throw new Error('R9_MUST_NOT_START_TRANSACTION'); }),
}));

const writer = '22222222-2222-4222-8222-222222222222';
const founder = '11111111-1111-4111-8111-111111111111';
const saved = { ...process.env };
beforeEach(() => {
  process.env.WRITER_PILOT_GRANT_WRITES_ENABLED = '1';
  delete process.env.WS_PILOT_TEST_DATABASE_URL;
  delete process.env.WS_R4_MEMBER_DATABASE;
});
afterAll(() => {
  process.env = saved;
});

test('direct production grant mutation exports fail closed with flag ON', async () => {
  await expect(approvePilotWriter(writer, founder))
    .rejects.toBeInstanceOf(PilotR20AuthorityUnavailable);
  await expect(acceptPilotWriter(writer))
    .rejects.toBeInstanceOf(PilotR20AuthorityUnavailable);
  await expect(revokePilotWriter(writer, founder))
    .rejects.toBeInstanceOf(PilotR20AuthorityUnavailable);
});

test('direct production exports still refuse when a caller supplies fake fixture URLs', async () => {
  process.env.WS_PILOT_TEST_DATABASE_URL =
    'postgresql://postgres@127.0.0.1:55439/postgres';
  process.env.DATABASE_URL = process.env.WS_PILOT_TEST_DATABASE_URL;
  await expect(approvePilotWriter(writer, founder))
    .rejects.toBeInstanceOf(PilotR20AuthorityUnavailable);
  await expect(acceptPilotWriter(writer))
    .rejects.toBeInstanceOf(PilotR20AuthorityUnavailable);
  await expect(revokePilotWriter(writer, founder))
    .rejects.toBeInstanceOf(PilotR20AuthorityUnavailable);
});

test('test-only model refuses absent fictional database authorization before any SQL', async () => {
  await expect(fakeApprove(writer, founder))
    .rejects.toThrow('writer_pilot_fictional_db_only');
  await expect(fakeAccept(writer))
    .rejects.toThrow('writer_pilot_fictional_db_only');
  await expect(fakeRevoke(writer, founder))
    .rejects.toThrow('writer_pilot_fictional_db_only');
});

test('test-only model refuses a non-loopback or different database even with matching env strings', async () => {
  for (const url of [
    'postgresql://postgres@localhost:55439/postgres',
    'postgresql://postgres@127.0.0.1:55440/postgres',
    'postgresql://postgres@127.0.0.1:55439/soullab',
    'postgresql://writer@127.0.0.1:55439/postgres',
  ]) {
    process.env.DATABASE_URL = url;
    process.env.WS_PILOT_TEST_DATABASE_URL = url;
    await expect(fakeApprove(writer, founder))
      .rejects.toThrow('writer_pilot_fictional_db_only');
    await expect(fakeAccept(writer))
      .rejects.toThrow('writer_pilot_fictional_db_only');
    await expect(fakeRevoke(writer, founder))
      .rejects.toThrow('writer_pilot_fictional_db_only');
  }
});

test('test model refuses if declared fixture and actual database URLs differ', async () => {
  process.env.DATABASE_URL = 'postgresql://postgres@127.0.0.1:55439/postgres';
  process.env.WS_PILOT_TEST_DATABASE_URL = 'postgresql://postgres@127.0.0.1:55439/other';
  await expect(fakeApprove(writer, founder))
    .rejects.toThrow('writer_pilot_fictional_db_only');
});

test('real app-server module contains no direct INSERT/UPDATE/DELETE for pilot grants', () => {
  const source = readFileSync(
    resolve(process.cwd(), 'lib/writersStudio/pilotGrantServer.ts'), 'utf8',
  );
  expect(source).not.toMatch(/INSERT\s+INTO\s+writer_studio_beta_grants/i);
  expect(source).not.toMatch(/UPDATE\s+writer_studio_beta_grants/i);
  expect(source).not.toMatch(/DELETE\s+FROM\s+writer_studio_beta_grants/i);
  expect(source).not.toMatch(/transaction\s*\(/i);
  expect(source).toContain('PilotR20AuthorityUnavailable');
});
