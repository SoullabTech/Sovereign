export const COVER_EDITIONS = ['paperback', 'hardcover'] as const;
export type CoverEdition = (typeof COVER_EDITIONS)[number];

export function isCoverEdition(value: unknown): value is CoverEdition {
  return typeof value === 'string' && (COVER_EDITIONS as readonly string[]).includes(value);
}

export interface CoverAssetMetadata {
  edition: CoverEdition;
  originalFilename: string | null;
  mimeType: 'application/pdf';
  byteSize: number;
  sha256: string;
  pageCount: 1;
  pageWidthPt: number;
  pageHeightPt: number;
  chosenAt: string;
  updatedAt: string;
  /** Upload custody is proven; print geometry is a successor preflight. */
  printGeometryStatus: 'not_yet_certified';
}
