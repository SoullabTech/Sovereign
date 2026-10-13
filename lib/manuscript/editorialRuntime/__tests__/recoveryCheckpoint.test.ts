jest.mock('@/lib/db/postgres', () => ({ transaction: jest.fn(), query: jest.fn() }));
jest.mock('@/lib/manuscript/sections/saveSection', () => ({ saveSectionInTransaction: jest.fn() }));

import { transaction } from '@/lib/db/postgres';
import { saveSectionInTransaction } from '@/lib/manuscript/sections/saveSection';
import { undoApplication, undoBaseVersion } from '../recovery';

const mockTransaction = transaction as jest.Mock;
const mockSaveSection = saveSectionInTransaction as jest.Mock;

describe('EA-REVIEW-UNDO-01 · Review checkpoint does not erase Undo', () => {
  const checkpoint = (revisionId: number) => ({
    currentVersion: revisionId,
    resultingVersion: revisionId - 1,
    lastIdempotencyOp: 'save',
    lastIdempotencyResponse: { checkpointed: true, revisionId },
  });

  it('admits Undo while the draft is still at the application version', () => {
    expect(undoBaseVersion({
      currentVersion: 7,
      resultingVersion: 7,
      lastIdempotencyOp: null,
      lastIdempotencyResponse: null,
    })).toBe(7);
  });

  it('admits exactly one immediate server checkpoint for Review', () => {
    expect(undoBaseVersion(checkpoint(8))).toBe(8);
  });

  it('refuses a second version movement even when the latest event is a checkpoint', () => {
    expect(undoBaseVersion({ ...checkpoint(9), resultingVersion: 7 })).toBeNull();
  });

  it('refuses a normal save or an unproven checkpoint', () => {
    expect(undoBaseVersion({ ...checkpoint(8), lastIdempotencyOp: 'section-save' })).toBeNull();
    expect(undoBaseVersion({ ...checkpoint(8), lastIdempotencyResponse: { checkpointed: false, revisionId: 8 } })).toBeNull();
    expect(undoBaseVersion({ ...checkpoint(8), lastIdempotencyResponse: { checkpointed: true, revisionId: 9 } })).toBeNull();
  });
});


describe('EA-REVIEW-UNDO-01 · durable Undo refuses manuscript drift', () => {
  const MEMBER = '11111111-1111-4111-8111-111111111111';
  const AUTH = '22222222-2222-4222-8222-222222222222';

  function harness(sectionBody: string) {
    const writes: string[] = [];
    mockTransaction.mockImplementation(async (fn: (tx: { query: (sql: string) => Promise<{ rows: unknown[] }> }) => unknown) =>
      fn({
        query: async (sql: string) => {
          if (sql.includes('FROM manuscript_revision_authorizations')) {
            return { rows: [{
              id: AUTH,
              work_id: '33333333-3333-4333-8333-333333333333',
              draft_id: '44444444-4444-4444-8444-444444444444',
              target_section_id: '55555555-5555-4555-8555-555555555555',
              resulting_version: 7,
              before_body: 'Original passage.',
              after_body: 'Applied passage.',
              undone_at: null,
            }] };
          }
          if (sql.includes('FROM manuscript_working_drafts')) {
            return { rows: [{
              version: 7,
              last_idempotency_op: null,
              last_idempotency_response: null,
            }] };
          }
          if (sql.includes('FROM manuscript_draft_sections')) {
            return { rows: [{ text: sectionBody, heading: null }] };
          }
          writes.push(sql);
          return { rows: [] };
        },
      }));
    return writes;
  }

  beforeEach(() => {
    jest.clearAllMocks();
    mockSaveSection.mockResolvedValue({ status: 'saved', version: 8 });
  });

  it('refuses when the section bytes no longer equal the applied body', async () => {
    const writes = harness('Applied passage, changed later.');
    await expect(undoApplication(MEMBER, AUTH)).resolves.toEqual({
      kind: 'refused', reason: 'work_moved',
    });
    expect(mockSaveSection).not.toHaveBeenCalled();
    expect(writes).toEqual([]);
  });

  it('restores the exact before-body only when the applied bytes still hold', async () => {
    const writes = harness('Applied passage.');
    await expect(undoApplication(MEMBER, AUTH)).resolves.toEqual({
      kind: 'undone', resultingVersion: 8,
    });
    expect(mockSaveSection).toHaveBeenCalledWith(
      expect.anything(),
      '33333333-3333-4333-8333-333333333333',
      MEMBER,
      '55555555-5555-4555-8555-555555555555',
      'Original passage.',
      7,
    );
    expect(writes.some((sql) => sql.includes('UPDATE manuscript_application_recovery'))).toBe(true);
  });
});
