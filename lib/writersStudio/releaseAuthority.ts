export type WriterImportFormat = 'docx' | 'pdf' | 'epub' | 'text';
export type WriterExportFormat = 'pdf' | 'epub';

export interface WriterReleaseAuthority {
  readonly manifestId: string;
  readonly sourceIntakeReleased: boolean;
  readonly importFormats: readonly WriterImportFormat[];
  readonly exportsCertified: Readonly<Record<WriterExportFormat, boolean>>;
  readonly permanentErasureCertified: boolean;
}

/**
 * Server-owned Writer release authority.
 *
 * This object is deliberately source-bound and environment-independent. A
 * browser flag, request header, query parameter, beta entitlement, or runtime
 * environment variable cannot release Source intake or certify an export.
 * Changing a false value requires a new admitted source/image and exact-image
 * acceptance; old test evidence does not transfer automatically.
 */
const AUTHORITY: WriterReleaseAuthority = Object.freeze({
  manifestId: 'writer-full-beta-encrypted-source-f1-f2-review-hold-20261026',
  sourceIntakeReleased: false,
  importFormats: Object.freeze(['docx', 'pdf', 'epub', 'text'] as const),
  exportsCertified: Object.freeze({ pdf: false, epub: false }),
  permanentErasureCertified: false,
});

export function writerReleaseAuthority(): WriterReleaseAuthority {
  return AUTHORITY;
}

export function writerPublicReleaseCapabilities(): WriterReleaseAuthority {
  return writerReleaseAuthority();
}

export function writerExportCertified(format: WriterExportFormat): boolean {
  return writerReleaseAuthority().exportsCertified[format] === true;
}
