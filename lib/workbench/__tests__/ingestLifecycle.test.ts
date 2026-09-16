jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('../storage', () => ({
  extFromName: jest.fn(() => 'jpg'),
  originalPath: jest.fn(() => '/tmp/original.jpg'),
  writeOriginal: jest.fn(),
  writeDraft: jest.fn(),
  writeReviewed: jest.fn(),
}));
jest.mock('../extract/text', () => ({ extractText: jest.fn() }));
jest.mock('../extract/docx', () => ({ extractDocx: jest.fn() }));
jest.mock('../extract/pdf', () => ({ extractPdf: jest.fn() }));
jest.mock('../ocr', () => ({ ocrImage: jest.fn(), ocrPdf: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { ingestWorkbenchUpload } from '../intake';
import { writeDraft, writeOriginal } from '../storage';
import { ocrImage } from '../ocr';

const mockQuery = query as jest.Mock;
const mockWriteOriginal = writeOriginal as jest.Mock;
const mockWriteDraft = writeDraft as jest.Mock;
const mockOcrImage = ocrImage as jest.Mock;

const member = '11111111-1111-1111-1111-111111111111';
const id = '22222222-2222-2222-2222-222222222222';
const photo = {
  name: 'notebook.jpg',
  type: 'image/jpeg',
  size: 1234,
  arrayBuffer: async () => new TextEncoder().encode('image').buffer,
} as unknown as File;

beforeEach(() => {
  jest.clearAllMocks();
  mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  mockQuery.mockResolvedValueOnce({ rows: [{ id }], rowCount: 1 });
  mockWriteOriginal.mockResolvedValue(`${member}/${id}/original.jpg`);
});

describe('WS-SOURCE-INTAKE-01 — source custody survives transcription', () => {
  it('stores handwriting OCR only as a draft awaiting writer review', async () => {
    mockOcrImage.mockResolvedValue('words from the notebook');
    const out = await ingestWorkbenchUpload(member, photo);
    expect(out.transcriptionStatus).toBe('draft');
    expect(out.sourceKind).toBe('handwritten_image');
    expect(mockWriteDraft).toHaveBeenCalledWith(member, id, 'words from the notebook');
    const finalUpdate = mockQuery.mock.calls.find((c) => String(c[0]).includes('transcription_draft = $3'));
    expect(finalUpdate?.[1]).toEqual(expect.arrayContaining(['handwritten_image', 'words from the notebook', 'draft']));
  });

  it('preserves the original when OCR fails and records an honest error state', async () => {
    mockOcrImage.mockRejectedValue(new Error('recognizer failed'));
    await expect(ingestWorkbenchUpload(member, photo)).rejects.toThrow('recognizer failed');
    expect(mockWriteOriginal).toHaveBeenCalledTimes(1);
    const custodyUpdate = mockQuery.mock.calls.find((c) => String(c[0]).includes('SET storage_path = $1'));
    expect(custodyUpdate).toBeTruthy();
    const errorUpdate = mockQuery.mock.calls.find((c) => String(c[0]).includes("transcription_status = 'error'"));
    expect(errorUpdate).toBeTruthy();
  });
});
