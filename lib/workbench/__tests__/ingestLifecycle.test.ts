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
import { HANDWRITING_OCR_FLAG, MANUAL_TRANSCRIPTION_MESSAGE, ingestWorkbenchUpload } from '../intake';
import { extFromName, originalPath, writeDraft, writeOriginal } from '../storage';
import { extractPdf } from '../extract/pdf';
import { ocrImage, ocrPdf } from '../ocr';

const mockQuery = query as jest.Mock;
const mockWriteOriginal = writeOriginal as jest.Mock;
const mockWriteDraft = writeDraft as jest.Mock;
const mockExtFromName = extFromName as jest.Mock;
const mockOriginalPath = originalPath as jest.Mock;
const mockExtractPdf = extractPdf as jest.Mock;
const mockOcrImage = ocrImage as jest.Mock;
const mockOcrPdf = ocrPdf as jest.Mock;

const member = '11111111-1111-1111-1111-111111111111';
const id = '22222222-2222-2222-2222-222222222222';
const photo = {
  name: 'notebook.jpg',
  type: 'image/jpeg',
  size: 1234,
  arrayBuffer: async () => new TextEncoder().encode('image').buffer,
} as unknown as File;
const scan = {
  name: 'notebook.pdf',
  type: 'application/pdf',
  size: 2345,
  arrayBuffer: async () => new TextEncoder().encode('pdf').buffer,
} as unknown as File;

const originalFlag = process.env[HANDWRITING_OCR_FLAG];

beforeEach(() => {
  jest.clearAllMocks();
  delete process.env[HANDWRITING_OCR_FLAG];
  mockExtFromName.mockReturnValue('jpg');
  mockOriginalPath.mockReturnValue('/tmp/original.jpg');
  mockQuery.mockResolvedValue({ rows: [], rowCount: 0 });
  mockQuery.mockResolvedValueOnce({ rows: [{ id }], rowCount: 1 });
  mockWriteOriginal.mockResolvedValue(`${member}/${id}/original.jpg`);
});

afterAll(() => {
  if (originalFlag === undefined) delete process.env[HANDWRITING_OCR_FLAG];
  else process.env[HANDWRITING_OCR_FLAG] = originalFlag;
});

describe('WS-SOURCE-INTAKE-01 — source custody survives transcription', () => {
  it('preserves a handwritten page for manual transcription while automatic OCR is gated off', async () => {
    const out = await ingestWorkbenchUpload(member, photo);
    expect(out.transcriptionStatus).toBe('error');
    expect(out.sourceKind).toBe('handwritten_image');
    expect(mockOcrImage).not.toHaveBeenCalled();
    expect(mockWriteDraft).not.toHaveBeenCalled();
    const manualUpdate = mockQuery.mock.calls.find((c) => String(c[0]).includes("transcription_status = 'error'"));
    expect(manualUpdate?.[1]).toEqual(['handwritten_image', MANUAL_TRANSCRIPTION_MESSAGE, id, member]);
  });

  it('preserves an image-only PDF for manual transcription while automatic OCR is gated off', async () => {
    mockExtFromName.mockReturnValue('pdf');
    mockOriginalPath.mockReturnValue('/tmp/original.pdf');
    mockExtractPdf.mockResolvedValue({ text: '', likelyScanned: true });
    const out = await ingestWorkbenchUpload(member, scan);
    expect(out.transcriptionStatus).toBe('error');
    expect(out.sourceKind).toBe('scanned_pdf');
    expect(mockOcrPdf).not.toHaveBeenCalled();
    const manualUpdate = mockQuery.mock.calls.find((c) => String(c[0]).includes("transcription_status = 'error'"));
    expect(manualUpdate?.[1]).toEqual(['scanned_pdf', MANUAL_TRANSCRIPTION_MESSAGE, id, member]);
  });

  it('stores handwriting OCR only as a draft awaiting writer review', async () => {
    process.env[HANDWRITING_OCR_FLAG] = '1';
    mockOcrImage.mockResolvedValue('words from the notebook');
    const out = await ingestWorkbenchUpload(member, photo);
    expect(out.transcriptionStatus).toBe('draft');
    expect(out.sourceKind).toBe('handwritten_image');
    expect(mockWriteDraft).toHaveBeenCalledWith(member, id, 'words from the notebook');
    const finalUpdate = mockQuery.mock.calls.find((c) => String(c[0]).includes('transcription_draft = $3'));
    expect(finalUpdate?.[1]).toEqual(expect.arrayContaining(['handwritten_image', 'words from the notebook', 'draft']));
  });

  it('allows an explicitly enabled image-only PDF OCR path to produce only a draft', async () => {
    process.env[HANDWRITING_OCR_FLAG] = '1';
    mockExtFromName.mockReturnValue('pdf');
    mockOriginalPath.mockReturnValue('/tmp/original.pdf');
    mockExtractPdf.mockResolvedValue({ text: '', likelyScanned: true });
    mockOcrPdf.mockResolvedValue('words from the scanned pages');
    const out = await ingestWorkbenchUpload(member, scan);
    expect(out.transcriptionStatus).toBe('draft');
    expect(out.sourceKind).toBe('scanned_pdf');
    expect(mockOcrPdf).toHaveBeenCalledWith('/tmp/original.pdf');
    expect(mockWriteDraft).toHaveBeenCalledWith(member, id, 'words from the scanned pages');
  });

  it('preserves the original when OCR fails and records an honest error state', async () => {
    process.env[HANDWRITING_OCR_FLAG] = '1';
    mockOcrImage.mockRejectedValue(new Error('recognizer failed'));
    await expect(ingestWorkbenchUpload(member, photo)).rejects.toThrow('recognizer failed');
    expect(mockWriteOriginal).toHaveBeenCalledTimes(1);
    const custodyUpdate = mockQuery.mock.calls.find((c) => String(c[0]).includes('SET storage_path = $1'));
    expect(custodyUpdate).toBeTruthy();
    const errorUpdate = mockQuery.mock.calls.find((c) => String(c[0]).includes("transcription_status = 'error'"));
    expect(errorUpdate).toBeTruthy();
  });
});
