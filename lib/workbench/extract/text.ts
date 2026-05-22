/**
 * Plain-text extractor for .txt and .md uploads.
 *
 * Returns content as UTF-8 string. The arranger doesn't review typed text
 * since there's no extraction step that could corrupt it — these uploads
 * land directly at status='reviewed'.
 */

import { promises as fs } from 'fs';

export async function extractText(filePath: string): Promise<string> {
  return fs.readFile(filePath, 'utf8');
}
