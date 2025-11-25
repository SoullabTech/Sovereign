/**
 * Wrapper for pdf-parse to avoid build-time issues
 * The pdf-parse library has debug code that runs at import time
 * This wrapper ensures it only loads at runtime
 */

export async function parsePDF(dataBuffer: Buffer): Promise<any> {
  // Dynamic import to avoid build-time execution
  const pdfParse = await import('pdf-parse');
  return pdfParse.default(dataBuffer);
}