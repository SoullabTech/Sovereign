/**
 * GATHER-02 — what a material IS, and what it may claim about itself.
 *
 * Pure. The discipline this module carries is the one WS-01 established for
 * manuscripts, generalised to everything a writer brings in: a thing that
 * claims to be a file must HAVE the file, and a thing that was typed may never
 * claim otherwise. The database enforces it too; this is where the rule is
 * decided and tested.
 *
 * The spine every surface renders:
 *
 *     SOURCE      what actually arrived
 *        ↓
 *     MATERIAL    what the writer has gathered
 *        ↓
 *     WORK        what the writer is making
 *
 * A material never becomes part of a Work by arriving. Belonging is a separate
 * member act with the writer's own sentence attached — see living_work_materials,
 * which this deliberately reuses rather than replacing.
 */

export const MATERIAL_KINDS = [
  {
    id: 'document',
    label: 'Document',
    /** What the writer sees when they are choosing how to bring something in. */
    blurb: 'A PDF, Word document, text or Markdown file.',
    /** Does an artifact — real bytes in the vault — have to exist? */
    fileBacked: true,
  },
  {
    id: 'note',
    label: 'Note',
    blurb: 'Something you write or paste here.',
    fileBacked: false,
  },
  {
    id: 'transcript',
    label: 'Transcript',
    blurb: 'A conversation or session already written out.',
    fileBacked: false,
  },
  {
    id: 'audio',
    label: 'Recording',
    blurb: 'A voice note or recording. Kept as itself; not transcribed here.',
    fileBacked: true,
  },
  {
    id: 'image',
    label: 'Image',
    blurb: 'A photograph, sketch, or scan.',
    fileBacked: true,
  },
  {
    id: 'link',
    label: 'Link',
    blurb: 'A source elsewhere. The address is kept; the page is not fetched.',
    fileBacked: false,
  },
] as const;

export type MaterialKind = (typeof MATERIAL_KINDS)[number]['id'];

export function kindById(id: string): (typeof MATERIAL_KINDS)[number] | null {
  return MATERIAL_KINDS.find((k) => k.id === id) ?? null;
}

export function isMaterialKind(value: unknown): value is MaterialKind {
  return typeof value === 'string' && MATERIAL_KINDS.some((k) => k.id === value);
}

// ---- what a file is allowed to be -------------------------------------

const EXTENSION_KIND: { pattern: RegExp; kind: MaterialKind }[] = [
  { pattern: /\.(pdf|docx|doc|txt|md|markdown|rtf)$/i, kind: 'document' },
  { pattern: /\.(mp3|m4a|wav|aac|ogg|flac|webm)$/i, kind: 'audio' },
  { pattern: /\.(png|jpe?g|gif|webp|heic|tiff?)$/i, kind: 'image' },
  { pattern: /\.(vtt|srt)$/i, kind: 'transcript' },
];

const MIME_KIND: { prefix: string; kind: MaterialKind }[] = [
  { prefix: 'audio/', kind: 'audio' },
  { prefix: 'image/', kind: 'image' },
  { prefix: 'text/', kind: 'document' },
  { prefix: 'application/pdf', kind: 'document' },
  { prefix: 'application/vnd.openxmlformats-officedocument.wordprocessingml', kind: 'document' },
  { prefix: 'application/msword', kind: 'document' },
];

/**
 * What kind of thing did the writer just hand us?
 *
 * Filename first, MIME second. Browsers disagree about MIME types for .md and
 * .docx often enough that trusting MIME first mislabels ordinary files, and a
 * writer whose chapter notes arrive labelled "Recording" will not trust the
 * room again.
 *
 * Returns null for a file we will not take, so the refusal is explicit rather
 * than a silent fallback to "document" over bytes nobody can read.
 */
export function kindForFile(filename: string, mimeType?: string | null): MaterialKind | null {
  for (const rule of EXTENSION_KIND) {
    if (rule.pattern.test(filename)) return rule.kind;
  }
  if (mimeType) {
    const mime = mimeType.toLowerCase();
    for (const rule of MIME_KIND) {
      if (mime.startsWith(rule.prefix)) return rule.kind;
    }
  }
  return null;
}

/** Kinds whose text we can read here, today. Others are kept, not read. */
export function canExtractText(kind: MaterialKind, filename: string): boolean {
  if (kind === 'note' || kind === 'transcript' || kind === 'link') return true;
  if (kind !== 'document') return false;
  return /\.(pdf|docx|txt|md|markdown)$/i.test(filename);
}

// ---- the provenance rule ----------------------------------------------

export interface ArrivalClaim {
  kind: MaterialKind;
  artifactRef: string | null;
  artifactHash: string | null;
  artifactSize: number | null;
  originalFilename: string | null;
  sourceUrl: string | null;
}

export type ClaimVerdict = { ok: true } | { ok: false; reason: string };

/**
 * A material may not claim a provenance it does not have.
 *
 * The failure this prevents is the one WS-01 named for manuscripts: pasted
 * text presented as an extracted file, so a later reader believes an original
 * exists that never did. Here it is generalised — an image row without bytes
 * is the same lie in a different costume.
 *
 * Mirrored by a CHECK constraint, so a route that forgets to call this still
 * cannot write the false row. This function exists so the refusal is a clear
 * message rather than a database error.
 */
export function checkArrival(claim: ArrivalClaim): ClaimVerdict {
  const kind = kindById(claim.kind);
  if (!kind) return { ok: false, reason: 'Unknown kind of material' };

  const hasArtifact =
    claim.artifactRef !== null && claim.artifactHash !== null && claim.artifactSize !== null;
  const partialArtifact =
    !hasArtifact &&
    (claim.artifactRef !== null || claim.artifactHash !== null || claim.artifactSize !== null);

  if (partialArtifact) {
    return { ok: false, reason: 'A file must arrive with all of its bytes, hash and size' };
  }
  if (kind.fileBacked && !hasArtifact) {
    return { ok: false, reason: `A ${kind.label.toLowerCase()} must arrive as a file` };
  }
  if (!kind.fileBacked && hasArtifact) {
    return {
      ok: false,
      reason: `A ${kind.label.toLowerCase()} is not a file and may not claim one`,
    };
  }
  if (claim.kind === 'link' && !claim.sourceUrl) {
    return { ok: false, reason: 'A link needs an address' };
  }
  if (claim.kind !== 'link' && claim.sourceUrl) {
    return { ok: false, reason: 'Only a link carries an address' };
  }
  if (hasArtifact && !claim.originalFilename) {
    return { ok: false, reason: 'A file keeps the name it arrived as' };
  }
  return { ok: true };
}

// ---- naming -----------------------------------------------------------

/**
 * A material's opening name. The writer renames whenever they like; this is
 * only what it is called before they have said.
 *
 * A filename is used as-is, extension stripped, because a filename is at least
 * something the writer chose. Text is named by its own first line, which is
 * usually what a note is about. Neither is a title MAIA invented, and the
 * writer's own words always win when they supply them.
 */
export function openingName(params: {
  kind: MaterialKind;
  originalFilename?: string | null;
  sourceUrl?: string | null;
  text?: string | null;
}): string {
  if (params.originalFilename) {
    const stripped = params.originalFilename.replace(/\.[A-Za-z0-9]{1,8}$/, '').trim();
    if (stripped) return stripped.slice(0, 120);
  }
  if (params.sourceUrl) {
    try {
      const url = new URL(params.sourceUrl);
      const path = url.pathname === '/' ? '' : url.pathname;
      return `${url.hostname.replace(/^www\./, '')}${path}`.slice(0, 120);
    } catch {
      return params.sourceUrl.slice(0, 120);
    }
  }
  const firstLine = (params.text ?? '')
    .split('\n')
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (firstLine) return firstLine.slice(0, 120);
  return 'Untitled';
}

/** Bytes, said the way a person says them. */
export function sizeLabel(bytes: number | null): string | null {
  if (bytes === null || bytes < 0) return null;
  if (bytes < 1024) return `${bytes} bytes`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
