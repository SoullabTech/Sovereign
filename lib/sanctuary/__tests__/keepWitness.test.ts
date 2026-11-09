/** @jest-environment node */
/**
 * Sanctuary closure at the store (founder ruling 2026-11-09): the thread store writes nothing without a KeepWitness, and a witness
 * exists only for an explicitly declared ordinary posture. Proven with a database double that records every statement.
 */
const statements: string[] = [];
jest.mock('@/lib/db/postgres', () => ({
  query: async (sql: string) => { statements.push(sql); return { rows: [{ id: 't1', turn_index: 0 }] }; },
}));

import { KeepWitness, resolveStudioPosture } from '../studioPosture';
import { appendTurn, appendTurnWithClient, openLivingWorkThread, openThread } from '@/lib/manuscript/ask/threadStore';

const ordinary = () => KeepWitness.fromDeclaration(false)!;
const turn = { threadId: 't1', memberId: 'm1', speaker: 'author' as const, body: 'private words', staleness: { state: 'current' } as never };
const thread = { manuscriptId: 'ms', memberId: 'm1', anchor: { on: 'work' } as never, reading: null, canonicalAtOpen: 'c', initiatedBy: 'author' as const };

beforeEach(() => { statements.length = 0; jest.spyOn(console, 'error').mockImplementation(() => undefined); });

describe('a witness is minted only from a declared ordinary posture', () => {
  it.each([[undefined], [null], [true], ['false'], [0], ['no_live_settings'], [{}]])('never from %p', (v) => {
    expect(KeepWitness.fromDeclaration(v)).toBeNull();
  });
  it('from an explicit false', () => { expect(KeepWitness.fromDeclaration(false)).toBeInstanceOf(KeepWitness); });
  it('cannot be forged by calling the constructor or by a look-alike object', () => {
    expect(() => new (KeepWitness as unknown as new (t: symbol, s: string) => unknown)(Symbol('KeepWitness'), 'declared_ordinary')).toThrow();
  });
  it('the resolver gives a witness exactly when it keeps', async () => {
    for (const v of [true, undefined, 'yes', null]) expect((await resolveStudioPosture('m1', { sanctuary: v })).witness).toBeNull();
    expect((await resolveStudioPosture('m1', { sanctuary: false })).witness).toBeInstanceOf(KeepWitness);
    expect((await resolveStudioPosture('m1', { sanctuary: false, meta: { sanctuary: true } })).witness).toBeNull();   // contradiction ⇒ stricter
  });
});

describe('the thread store writes nothing without a witness', () => {
  const forged = [undefined, null, { source: 'declared_ordinary' }, true];
  it.each(forged.map((f) => [f]))('openThread refuses %p before any SQL', async (keep) => {
    await expect(openThread({ ...thread, keep } as never)).rejects.toThrow('sanctuary_write_refused');
    await expect(openLivingWorkThread({ livingWorkId: 'w', memberId: 'm1', canonicalAtOpen: 'c', initiatedBy: 'author', keep } as never)).rejects.toThrow('sanctuary_write_refused');
    await expect(appendTurn({ ...turn, keep } as never)).rejects.toThrow('sanctuary_write_refused');
    await expect(appendTurnWithClient({ query: async (sql: string) => { statements.push(sql); return { rows: [] }; } } as never, { ...turn, keep } as never)).rejects.toThrow('sanctuary_write_refused');
    expect(statements).toEqual([]);
  });
  it('with a witness, it writes', async () => {
    await openThread({ ...thread, keep: ordinary() });
    await appendTurn({ ...turn, keep: ordinary() });
    expect(statements.filter((s) => /INSERT INTO ask_/.test(s)).length).toBe(2);
  });
});
