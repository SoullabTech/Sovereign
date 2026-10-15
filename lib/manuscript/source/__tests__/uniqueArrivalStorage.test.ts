jest.mock('@/lib/db/postgres', () => ({ query: jest.fn() }));
jest.mock('@/lib/storage/fileVault', () => ({ writeDurableVaultBytes: jest.fn() }));

import { query } from '@/lib/db/postgres';
import { writeDurableVaultBytes } from '@/lib/storage/fileVault';
import { recordArtifactArrival } from '../arrivals';

const fakeQuery = query as jest.Mock;
const fakeWrite = writeDurableVaultBytes as jest.Mock;
beforeEach(() => {
  jest.resetAllMocks();
  fakeQuery.mockResolvedValue({ rows: [{ id: 'fictional-arrival-id' }] });
  fakeWrite.mockImplementation(async (namespace: string, id: string, ext: string) => namespace + '/' + id + '.' + ext);
});
it('stores simultaneous byte-identical originals under independent immutable paths', async () => {
  const same = {
    memberId: 'fictional-member',
    bytes: Buffer.from('fictional source bytes'),
    originalFilename: 'chapter.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    sourceText: 'fictional text',
    extractor: 'docx' as const,
  };
  // Distinct paths are vital: deleting an abandoned copy cannot erase the
  // otherwise identical original another member has already saved.
  const [one, two] = await Promise.all([recordArtifactArrival(same), recordArtifactArrival(same)]);
  expect(one.artifactHash).toBe(two.artifactHash);
  expect(one.artifactRef).not.toBe(two.artifactRef);
  expect(fakeWrite).toHaveBeenCalledTimes(2);
});
