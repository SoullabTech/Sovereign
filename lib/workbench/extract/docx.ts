/**
 * .docx extractor via mammoth.
 *
 * Pulls raw text from a Word doc. mammoth.extractRawText drops formatting
 * but preserves paragraph structure as line breaks, which is what the
 * Workbench wants — we don't carry docx styling into the indexed text.
 *
 * Like plain text, .docx uploads land at status='reviewed' on the way in
 * since the extraction is reliable.
 */

import mammoth from 'mammoth';

export async function extractDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}
