import { createHash } from 'crypto';

/**
 * WS-01 — Source custody primitives.
 *
 * The governing sentence of the programme (founder, 2026-08-24):
 *
 *   What arrived is evidence. What the machine sees is interpretation.
 *   What the writer declares becomes the Work.
 *
 * This module holds the first clause only. It knows what arrived and how it was
 * decoded; it knows nothing about headings, sections, or structure, and must
 * never learn — the moment source custody can be influenced by an interpretation
 * of the text, it stops being custody.
 *
 * **Files have artifacts. Pasted words do not. Both can have Source. Neither is
 * given provenance it never had.** That rule is enforced structurally by the
 * CHECK on `manuscript_source_arrivals`, and mirrored here by the two-variant
 * type: there is no shape in which a member-supplied text carries an artifact.
 */

/** A durable original artifact exists and the source text derives from it. */
export const ARTIFACT_EXTRACTION = 'artifact_extraction';
/** The member supplied the text directly; no recoverable upstream artifact. */
export const MEMBER_SUPPLIED_TEXT = 'member_supplied_text';

export type SourceKind = typeof ARTIFACT_EXTRACTION | typeof MEMBER_SUPPLIED_TEXT;

/**
 * How a source text was produced from its artifact.
 *
 * Versions are pinned here rather than read at runtime: an arrival records the
 * decoder that produced it *at the time it arrived*, and a later dependency bump
 * must not retroactively relabel arrivals it never touched. When a version here
 * changes, arrivals written afterwards carry the new value and older rows keep
 * theirs — which is the whole point of storing it.
 */
export const EXTRACTORS = {
  docx: { method: 'mammoth-convertToMarkdown', version: 'mammoth@1.12.0' },
  pdf: { method: 'pdf-parse-getText', version: 'pdf-parse@2.4.5' },
  text: { method: 'utf8-decode', version: 'node-buffer-utf8' },
  /** Not an extraction: the member's own text, recorded as it was confirmed. */
  supplied: { method: 'member-supplied', version: 'n/a' },
} as const;

export type ExtractorKey = keyof typeof EXTRACTORS;

export function hashBytes(buffer: Buffer): string {
  return createHash('sha256').update(buffer).digest('hex');
}

/**
 * Hash source text over its exact UTF-8 bytes.
 *
 * Deliberately no normalization — not of newlines, not of Unicode form. Amendment
 * A1.3 forbids silent normalization after source-text creation, and a hash that
 * normalized first would report two different arrivals as the same one.
 */
export function hashText(text: string): string {
  return createHash('sha256').update(Buffer.from(text, 'utf-8')).digest('hex');
}

/** Extension for the vault filename. Provenance, not identity. */
export function artifactExt(filename: string): string {
  const m = /\.([a-zA-Z0-9]{1,12})$/.exec(filename);
  return m ? m[1].toLowerCase() : 'bin';
}

interface ArtifactArrivalInput {
  kind: typeof ARTIFACT_EXTRACTION;
  artifactRef: string;
  artifactHash: string;
  artifactSize: number;
  originalFilename: string;
  mimeType: string | null;
  sourceText: string;
  extractor: ExtractorKey;
}

interface SuppliedArrivalInput {
  kind: typeof MEMBER_SUPPLIED_TEXT;
  sourceText: string;
}

export type ArrivalInput = ArtifactArrivalInput | SuppliedArrivalInput;

export interface ArrivalRecord {
  sourceKind: SourceKind;
  artifactRef: string | null;
  artifactHash: string | null;
  artifactSize: number | null;
  originalFilename: string | null;
  mimeType: string | null;
  sourceText: string;
  sourceTextHash: string;
  extractionMethod: string;
  extractorVersion: string;
}

/**
 * Build the row a source arrival persists as.
 *
 * The member-supplied branch hard-nulls every artifact field rather than simply
 * omitting them, so a caller cannot smuggle artifact provenance onto a paste by
 * spreading extra keys into the input.
 */
export function buildArrival(input: ArrivalInput): ArrivalRecord {
  if (input.kind === MEMBER_SUPPLIED_TEXT) {
    return {
      sourceKind: MEMBER_SUPPLIED_TEXT,
      artifactRef: null,
      artifactHash: null,
      artifactSize: null,
      originalFilename: null,
      mimeType: null,
      sourceText: input.sourceText,
      sourceTextHash: hashText(input.sourceText),
      extractionMethod: EXTRACTORS.supplied.method,
      extractorVersion: EXTRACTORS.supplied.version,
    };
  }
  const extractor = EXTRACTORS[input.extractor];
  return {
    sourceKind: ARTIFACT_EXTRACTION,
    artifactRef: input.artifactRef,
    artifactHash: input.artifactHash,
    artifactSize: input.artifactSize,
    originalFilename: input.originalFilename,
    mimeType: input.mimeType,
    sourceText: input.sourceText,
    sourceTextHash: hashText(input.sourceText),
    extractionMethod: extractor.method,
    extractorVersion: extractor.version,
  };
}

/**
 * Whether a stored arrival may be presented as source custody.
 *
 * A hash without recoverable bytes is NOT custody (founder ruling, 2026-08-24) —
 * it answers *"is this the same object?"* and not *"can we recover the object?"*
 * So an `artifact_extraction` row whose bytes have gone missing fails custody
 * even though every column still reads plausibly. The caller proves
 * recoverability; this function refuses to accept the record's own word for it.
 */
export function certifiesCustody(
  record: Pick<ArrivalRecord, 'sourceKind' | 'artifactRef' | 'artifactHash'>,
  bytesRecoverable: boolean,
): boolean {
  if (record.sourceKind === MEMBER_SUPPLIED_TEXT) return true;
  if (!record.artifactRef || !record.artifactHash) return false;
  return bytesRecoverable;
}
