/**
 * R12 — verify the actual importer claim entrypoint, not merely a proposed
 * encryption helper. All UUIDs/source bytes are invented and no database or
 * real file is touched. Physical SQL transaction acceptance is separate.
 */
import { claimArrival } from '../arrivals';
import { hashBytes, hashText, ARTIFACT_EXTRACTION, MEMBER_SUPPLIED_TEXT } from '../custody';
import { transaction } from '@/lib/db/postgres';
import { readVaultBytes } from '@/lib/storage/fileVault';

jest.mock('@/lib/db/postgres', () => ({
  query: jest.fn(),
  transaction: jest.fn(),
}));
jest.mock('@/lib/storage/fileVault', () => ({
  readVaultBytes: jest.fn(),
  writeDurableVaultBytes: jest.fn(),
}));

const memberA = '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd204';
const memberB = '5b40ec03-3e87-4f9d-8aa1-aa18ee5bd205';
const arrivalId = '306902ed-21a9-4c01-aa15-984755598218';
const manuscriptA = '4c0782ca-9074-43ee-9f3c-5f8500026780';
const manuscriptB = '4c0782ca-9074-43ee-9f3c-5f8500026781';
const bytes = Buffer.from([0x50, 0x4b, 0x03, 0x04, 0, 255, 7]);
const text = 'Entirely fictional original passage.\n';
const original = {
  source_kind: ARTIFACT_EXTRACTION as string,
  source_text: text,
  source_text_hash: hashText(text),
  artifact_ref: 'fictional/source.docx' as string | null,
  artifact_hash: hashBytes(bytes) as string | null,
  manuscript_id: null as string | null,
  member_id: memberA,
};
const mockedTx = transaction as jest.Mock;
const mockedRead = readVaultBytes as jest.Mock;
let state: typeof original;
let markOutcome: number;
let seen: string[];
let afterMarkOutcome: number;

beforeEach(() => {
  jest.clearAllMocks();
  state = { ...original };
  seen = [];
  markOutcome = 1;
  afterMarkOutcome = 1;
  mockedRead.mockResolvedValue(Buffer.from(bytes));
  mockedTx.mockImplementation(async (callback: (tx: { query: (sql: string, params: unknown[]) => Promise<unknown> }) => Promise<boolean>) => {
    let tentative = { ...state };
    const tx = { query: async (sql: string, params: unknown[]) => {
      seen.push(sql);
      if (sql.includes('FROM manuscript_source_arrivals') && sql.includes('FOR UPDATE')) {
        expect(params).toEqual([arrivalId, params[1]]);
        return { rows: tentative.member_id === params[1] && tentative.manuscript_id === null ? [tentative] : [], rowCount: 1 };
      }
      if (sql.includes('FROM member_manuscripts') && sql.includes('FOR UPDATE')) {
        const owner = params[0] === manuscriptA ? memberA : params[0] === manuscriptB ? memberB : null;
        return { rows: owner === params[1] ? [{ id: params[0] }] : [], rowCount: owner === params[1] ? 1 : 0 };
      }
      if (sql.includes('UPDATE manuscript_source_arrivals')) {
        if (tentative.manuscript_id !== null) return { rows: [], rowCount: 0 };
        tentative.manuscript_id = String(params[1]);
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('UPDATE member_manuscripts')) {
        return { rows: [], rowCount: markOutcome ? 1 : 0 };
      }
      throw new Error('UNEXPECTED_DB_QUERY');
    }};
    const outcome = await callback(tx);
    if (afterMarkOutcome === 1) state = tentative; // Simulated commit only after callback succeeds.
    return outcome;
  });
});

describe('R12 real importer Source claim ownership and atomicity', () => {
  it('claims only an original owned by the authenticated member into their own manuscript', async () => {
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).resolves.toBe(true);
    expect(state.manuscript_id).toBe(manuscriptA);
    expect(mockedRead).toHaveBeenCalledWith('fictional/source.docx');
    expect(seen).toHaveLength(4);
    expect(seen[0]).toContain('FOR UPDATE');
    expect(seen[1]).toContain('member_id = $2 FOR UPDATE');
    expect(seen[2]).toContain('manuscript_id IS NULL');
    expect(seen[3]).toContain("source_custody = 'source_custodied'");
    expect(mockedTx).toHaveBeenCalledTimes(1);
  });

  it('refuses foreign target manuscript even if the pending Source is owned', async () => {
    await expect(claimArrival(arrivalId, manuscriptB, memberA)).resolves.toBe(false);
    expect(state.manuscript_id).toBeNull();
    expect(mockedRead).not.toHaveBeenCalled();
    expect(seen.some(s => s.includes('UPDATE manuscript_source_arrivals'))).toBe(false);
  });

  it('refuses another member attempting to claim the first writer’s pending Source', async () => {
    await expect(claimArrival(arrivalId, manuscriptB, memberB)).resolves.toBe(false);
    expect(state.manuscript_id).toBeNull();
    expect(seen).toHaveLength(1);
  });

  it('refuses a second claim after Source was already claimed', async () => {
    state.manuscript_id = manuscriptA;
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).resolves.toBe(false);
    expect(state.manuscript_id).toBe(manuscriptA);
  });

  it('refuses missing, corrupt, and unavailable original bytes with no claim', async () => {
    mockedRead.mockResolvedValueOnce(Buffer.from([0]));
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).resolves.toBe(false);
    expect(state.manuscript_id).toBeNull();
    mockedRead.mockRejectedValueOnce(new Error('fictional_missing_file'));
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).rejects.toThrow('fictional_missing_file');
    expect(state.manuscript_id).toBeNull();
  });

  it('refuses modified extracted text and missing artifact identity', async () => {
    state.source_text_hash = '0'.repeat(64);
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).resolves.toBe(false);
    state.source_text_hash = hashText(text);
    state.artifact_hash = null;
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).resolves.toBe(false);
    expect(state.manuscript_id).toBeNull();
  });

  it('accepts a member-supplied text arrival only without invented file provenance', async () => {
    state.source_kind = MEMBER_SUPPLIED_TEXT;
    state.artifact_ref = null;
    state.artifact_hash = null;
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).resolves.toBe(true);
    expect(mockedRead).not.toHaveBeenCalled();
    expect(state.manuscript_id).toBe(manuscriptA);
  });

  it('refuses a paste that pretends to have Source artifact bytes', async () => {
    state.source_kind = MEMBER_SUPPLIED_TEXT;
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).resolves.toBe(false);
    expect(state.manuscript_id).toBeNull();
  });

  it('refuses unknown source kind without changing ownership', async () => {
    state.source_kind = 'untrusted_history';
    await expect(claimArrival(arrivalId, manuscriptA, memberA)).resolves.toBe(false);
    expect(state.manuscript_id).toBeNull();
  });

  it('rolls back the arrival assignment if destination status cannot be updated', async () => {
    markOutcome = 0;
    await expect(claimArrival(arrivalId, manuscriptA, memberA))
      .rejects.toThrow('source_destination_changed_under_lock');
    // Our fake transaction commits only when the callback returns.
    expect(state.manuscript_id).toBeNull();
    expect(seen.filter(x => x.startsWith('UPDATE'))).toHaveLength(2);
  });
});
