// lib/scribe/transcriptImport.ts
// Session Studio Step 1 — transcript paste/upload parser.
// Spec: docs/architecture/SESSION_STUDIO_UNIFIED_ENVIRONMENT_2026-07-19.md
//
// Attribution discipline: this parser NEVER invents speaker attribution.
// Labels present in the document are preserved verbatim (they are supplied
// evidence, not inference); text without labels gets label=null and is stored
// as speaker='unknown'. Mapping labels to practitioner/participant identity is
// the Step 2 speaker-confirmation screen, not this module.

export interface ImportedTurn {
  /** Speaker label exactly as supplied by the document, or null if none. */
  label: string | null;
  text: string;
  /** Timestamp offset supplied by the document, or null if none. */
  atMs: number | null;
}

export interface ParsedTranscript {
  turns: ImportedTurn[];
  /** Distinct supplied labels in order of first appearance. */
  speakerLabels: string[];
  /** True if any turn carried a document-supplied timestamp. */
  timestampsSupplied: boolean;
}

/** Reject absurd inputs before parsing. */
export const MAX_IMPORT_CHARS = 2_000_000;
export const MAX_IMPORT_TURNS = 5_000;

// hh:mm:ss or mm:ss (mm may be 1–2 digits; hh:mm:ss when 3 parts)
const TIME_RE = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;

function parseTimeMs(raw: string): number | null {
  const m = TIME_RE.exec(raw.trim());
  if (!m) return null;
  const a = parseInt(m[1], 10);
  const b = parseInt(m[2], 10);
  const c = m[3] !== undefined ? parseInt(m[3], 10) : null;
  if (c !== null) return ((a * 60 + b) * 60 + c) * 1000; // hh:mm:ss
  return (a * 60 + b) * 1000; // mm:ss
}

/**
 * A candidate speaker label must look like a name/role, not prose, a URL, or a
 * clock reading. Deliberately conservative: a false negative degrades to
 * label=null (honest), a false positive invents structure.
 */
function isPlausibleLabel(raw: string): boolean {
  const label = raw.trim();
  if (!label || label.length > 48) return false;
  if (TIME_RE.test(label)) return false;
  if (/https?:\/\//i.test(label)) return false;
  if (/^\d+$/.test(label)) return false;
  // Prose heuristic: labels are short — more than 6 words reads as a sentence.
  if (label.split(/\s+/).length > 6) return false;
  return true;
}

interface WorkingTurn {
  label: string | null;
  atMs: number | null;
  parts: string[];
}

/**
 * Parse pasted or .txt transcript text into ordered turns.
 *
 * Recognized structures (all optional, mixed freely):
 * - `Name: text`                          (labeled turn)
 * - `[12:34] Name: text` / `12:34 Name: text`  (timestamped labeled turn)
 * - `Name  12:34` on its own line, text below   (Otter-style header)
 * - `[12:34]` / `12:34` on its own line          (timestamp for the next turn)
 * - Plain prose: split on blank lines into unlabeled paragraph turns.
 * - Continuation lines are appended to the current turn.
 */
export function parseTranscript(text: string): ParsedTranscript {
  const input = text.replace(/^﻿/, '').replace(/\r\n?/g, '\n');
  if (input.length > MAX_IMPORT_CHARS) {
    throw new Error(`Transcript exceeds ${MAX_IMPORT_CHARS} characters`);
  }

  const lines = input.split('\n');
  const turns: WorkingTurn[] = [];
  // State lives on an object so the mutating helpers below don't fight
  // TypeScript's control-flow narrowing of captured `let` bindings.
  const st: { current: WorkingTurn | null; pendingMs: number | null } = {
    current: null,
    pendingMs: null,
  };

  const commit = () => {
    if (st.current && st.current.parts.join(' ').trim()) turns.push(st.current);
    st.current = null;
  };
  const startTurn = (label: string | null, atMs: number | null, first: string) => {
    commit();
    st.current = { label, atMs: atMs ?? st.pendingMs, parts: first.trim() ? [first.trim()] : [] };
    st.pendingMs = null;
  };

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const trimmed = line.trim();

    // Blank line: paragraph boundary for unlabeled prose; otherwise neutral.
    if (!trimmed) {
      if (st.current && st.current.label === null) commit();
      continue;
    }

    // Timestamp-only line → applies to the next turn.
    const bare = trimmed.replace(/^\[|\]$/g, '');
    if (TIME_RE.test(bare)) {
      st.pendingMs = parseTimeMs(bare);
      continue;
    }

    // `[12:34] rest` or `12:34 rest` prefix
    let rest = trimmed;
    let lineMs: number | null = null;
    const tsPrefix = /^\[?(\d{1,2}:\d{2}(?::\d{2})?)\]?\s+(.*)$/.exec(trimmed);
    if (tsPrefix && parseTimeMs(tsPrefix[1]) !== null) {
      lineMs = parseTimeMs(tsPrefix[1]);
      rest = tsPrefix[2];
    }

    // Otter-style header: `Name  12:34` (name then time, no content)
    const otter = /^(.{1,48}?)\s{1,}(\d{1,2}:\d{2}(?::\d{2})?)$/.exec(rest);
    if (otter && isPlausibleLabel(otter[1]) && parseTimeMs(otter[2]) !== null) {
      startTurn(otter[1].trim(), parseTimeMs(otter[2]), '');
      continue;
    }

    // `Name: text` labeled turn. A colon followed by `//` is a URL scheme
    // (`https://…`), not a speaker delimiter.
    const colonIdx = rest.indexOf(':');
    if (colonIdx > 0 && !rest.slice(colonIdx + 1).startsWith('//')) {
      const maybeLabel = rest.slice(0, colonIdx);
      if (isPlausibleLabel(maybeLabel)) {
        startTurn(maybeLabel.trim(), lineMs, rest.slice(colonIdx + 1));
        continue;
      }
    }

    // Timestamped but unlabeled line starts a new unlabeled turn.
    if (lineMs !== null) {
      startTurn(null, lineMs, rest);
      continue;
    }

    // Continuation of the current turn, or the start of unlabeled prose.
    if (st.current) {
      st.current.parts.push(trimmed);
    } else {
      startTurn(null, null, trimmed);
    }
  }
  commit();

  if (turns.length > MAX_IMPORT_TURNS) {
    throw new Error(`Transcript exceeds ${MAX_IMPORT_TURNS} turns`);
  }

  const speakerLabels: string[] = [];
  for (const t of turns) {
    if (t.label && !speakerLabels.includes(t.label)) speakerLabels.push(t.label);
  }

  return {
    turns: turns.map(t => ({
      label: t.label,
      text: t.parts.join(' ').replace(/\s+/g, ' ').trim(),
      atMs: t.atMs,
    })),
    speakerLabels,
    timestampsSupplied: turns.some(t => t.atMs !== null),
  };
}

/**
 * Duration when the document supplied no timestamps: an estimate from word
 * count at conversational pace (~150 wpm), floor 60s. It is an ESTIMATE and is
 * recorded as such in the session's import provenance — never presented as a
 * measured recording length. Used only so ordering timestamps exist and the
 * review header has a scale.
 */
export function estimateDurationMs(turns: ImportedTurn[]): number {
  const words = turns.reduce((n, t) => n + t.text.split(/\s+/).length, 0);
  return Math.max(60_000, Math.round((words / 150) * 60_000));
}

/**
 * Storage offsets for the turns. Document order is the primary evidence and
 * the review orders by spoken_at, so offsets MUST be strictly monotonic even
 * when the document timestamps only some turns (or timestamps them out of
 * order). Supplied timestamps are used where they respect monotonicity;
 * un-timestamped turns advance by `fallbackStepMs` past the last offset.
 */
export function assignOffsets(turns: ImportedTurn[], fallbackStepMs = 2_000): number[] {
  const offsets: number[] = [];
  let last = -1;
  for (const t of turns) {
    const candidate = t.atMs !== null ? t.atMs : last < 0 ? 0 : last + fallbackStepMs;
    const effective = Math.max(candidate, last + 1);
    offsets.push(effective);
    last = effective;
  }
  return offsets;
}
