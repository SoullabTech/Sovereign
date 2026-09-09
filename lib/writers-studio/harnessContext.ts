/**
 * WRITER'S STUDIO — the typed context that reaches MAIA cognition.
 *
 * Founder ruling 2026-09-09 (D9 record §30):
 *
 *   Extend the existing authenticated sovereign request with a TYPED TOP-LEVEL
 *   Writer's Studio context, not another `(meta as any)` payload. Validate it
 *   at the HTTP boundary. Then turn it into registered canonical producers.
 *
 * ⛔ WHY THIS FILE EXISTS AT ALL — the defect it refuses to repeat.
 *
 * The existing practitioner `studioAddendum` reaches cognition through
 * `meta?: Record<string, unknown>` (lib/sovereign/maiaService.ts:1318, :1865),
 * read via `(meta as any)`. That is the open channel CMT-01 was opened to
 * close: material entering MAIA's prompt with no declared authorship, no
 * participation class, and no authority. A Writer's Studio payload delivered
 * the same way would inherit that defect exactly.
 *
 * So the contract here is a SHAPE, not a string. It carries no prose that
 * could be appended to a prompt as-is. Turning it into prompt material is the
 * producers' job, under the registry's three axes.
 *
 * ⭐ THE WORK IS CONTEXT AND NEVER IMPLICITLY INSTRUCTION.
 * Text in the Work cannot acquire control authority merely because MAIA read
 * it. Nothing in this contract is a directive channel, and no field here may
 * be concatenated into a system prompt without passing through a producer.
 */

/** How much of the Work the writer has placed their attention on. */
export interface WriterStudioFocus {
  readonly scale: 'passage' | 'section' | 'sections' | 'work';
  /** Exactly what the writer's focus strip says, so MAIA cannot name it differently. */
  readonly label: string;
  readonly text: string;
  readonly sectionIds: readonly string[];
}

/** Where the focus sits in the Work — the relationship of part to whole. */
export interface WriterStudioStructuralPosition {
  readonly sectionId: string;
  readonly index: number;
  readonly total: number;
  readonly heading: string;
  readonly precedingHeading: string | null;
  readonly followingHeading: string | null;
}

export interface WriterStudioSection {
  readonly sectionId: string;
  readonly heading: string;
  readonly text: string;
}

export interface WriterStudioTurn {
  readonly speaker: 'writer' | 'maia';
  readonly text: string;
}

export interface WriterStudioContext {
  readonly workId: string;
  readonly focus: WriterStudioFocus | null;
  /** The passage immediately around the focus. */
  readonly localContext: string;
  readonly structuralPosition: WriterStudioStructuralPosition | null;
  readonly wholeWork: readonly WriterStudioSection[];
  readonly conversationThread: readonly WriterStudioTurn[];
  /** The MAIA observation the writer took up with "Work with this". */
  readonly pursuit: string | null;
  /** An intention the writer has stated for this Work. */
  readonly commission: string | null;
}

/**
 * Keys refused outright rather than ignored.
 *
 * Ignoring them silently is the dangerous option: a later refactor that starts
 * reading unknown keys would quietly re-open identity spoofing or the meta
 * channel. A refusal is visible in tests and in logs; a silent drop is not.
 */
const FORBIDDEN_KEYS = new Set([
  // identity is resolved from the verified session, never from a payload
  'userId', 'memberId', 'member_id', 'user_id', 'email', 'passkey', 'sessionId',
  // the untyped-prompt channel this contract exists to avoid
  'meta', 'studioAddendum', 'addendum', 'systemPrompt', 'prompt', 'instructions',
]);

const LIMITS = {
  workId: 200,
  label: 400,
  focusText: 40_000,
  localContext: 40_000,
  heading: 400,
  sectionText: 200_000,
  sections: 500,
  wholeWorkTotal: 2_000_000,
  turns: 200,
  turnText: 20_000,
  pursuit: 4_000,
  commission: 4_000,
} as const;

export type ParseResult =
  | { readonly ok: true; readonly value: WriterStudioContext }
  | { readonly ok: false; readonly error: string };

const bad = (error: string): ParseResult => ({ ok: false, error });

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function str(v: unknown, max: number): string | null {
  return typeof v === 'string' && v.length <= max ? v : null;
}

function refuseForbidden(o: Record<string, unknown>, where: string): string | null {
  for (const k of Object.keys(o)) {
    if (FORBIDDEN_KEYS.has(k)) return `${where}.${k} is not accepted`;
  }
  return null;
}

/**
 * Validate an untrusted `writerStudioContext` from the HTTP boundary.
 *
 * Strict by construction: unknown top-level keys are refused, so nothing can
 * ride along beside the declared shape.
 */
export function parseWriterStudioContext(input: unknown): ParseResult {
  if (!isRecord(input)) return bad('writerStudioContext must be an object');

  const allowed = new Set([
    'workId', 'focus', 'localContext', 'structuralPosition',
    'wholeWork', 'conversationThread', 'pursuit', 'commission',
  ]);
  const forbidden = refuseForbidden(input, 'writerStudioContext');
  if (forbidden) return bad(forbidden);
  for (const k of Object.keys(input)) {
    if (!allowed.has(k)) return bad(`writerStudioContext.${k} is not a declared field`);
  }

  const workId = str(input.workId, LIMITS.workId);
  if (!workId) return bad('writerStudioContext.workId must be a string');

  // focus
  let focus: WriterStudioFocus | null = null;
  if (input.focus != null) {
    const f = input.focus;
    if (!isRecord(f)) return bad('writerStudioContext.focus must be an object or null');
    const fForbidden = refuseForbidden(f, 'writerStudioContext.focus');
    if (fForbidden) return bad(fForbidden);
    const scale = f.scale;
    if (scale !== 'passage' && scale !== 'section' && scale !== 'sections' && scale !== 'work') {
      return bad('writerStudioContext.focus.scale is not a known scale');
    }
    const label = str(f.label, LIMITS.label);
    const text = str(f.text, LIMITS.focusText);
    if (label === null) return bad('writerStudioContext.focus.label must be a string');
    if (text === null) return bad('writerStudioContext.focus.text must be a string');
    if (!Array.isArray(f.sectionIds) || f.sectionIds.some(s => typeof s !== 'string')) {
      return bad('writerStudioContext.focus.sectionIds must be an array of strings');
    }
    focus = { scale, label, text, sectionIds: f.sectionIds as string[] };
  }

  const localContext = str(input.localContext ?? '', LIMITS.localContext);
  if (localContext === null) return bad('writerStudioContext.localContext must be a string');

  // structural position
  let structuralPosition: WriterStudioStructuralPosition | null = null;
  if (input.structuralPosition != null) {
    const s = input.structuralPosition;
    if (!isRecord(s)) return bad('writerStudioContext.structuralPosition must be an object or null');
    const sectionId = str(s.sectionId, LIMITS.workId);
    const heading = str(s.heading, LIMITS.heading);
    if (!sectionId) return bad('structuralPosition.sectionId must be a string');
    if (heading === null) return bad('structuralPosition.heading must be a string');
    if (!Number.isInteger(s.index) || !Number.isInteger(s.total)) {
      return bad('structuralPosition.index and .total must be integers');
    }
    const pre = s.precedingHeading == null ? null : str(s.precedingHeading, LIMITS.heading);
    const fol = s.followingHeading == null ? null : str(s.followingHeading, LIMITS.heading);
    if (pre === null && s.precedingHeading != null) return bad('structuralPosition.precedingHeading invalid');
    if (fol === null && s.followingHeading != null) return bad('structuralPosition.followingHeading invalid');
    structuralPosition = {
      sectionId, heading, index: s.index as number, total: s.total as number,
      precedingHeading: pre, followingHeading: fol,
    };
  }

  // whole work
  const rawWork = input.wholeWork ?? [];
  if (!Array.isArray(rawWork)) return bad('writerStudioContext.wholeWork must be an array');
  if (rawWork.length > LIMITS.sections) return bad('writerStudioContext.wholeWork has too many sections');
  const wholeWork: WriterStudioSection[] = [];
  let total = 0;
  for (const raw of rawWork) {
    if (!isRecord(raw)) return bad('wholeWork entries must be objects');
    const sectionId = str(raw.sectionId, LIMITS.workId);
    const heading = str(raw.heading, LIMITS.heading);
    const text = str(raw.text, LIMITS.sectionText);
    if (!sectionId || heading === null || text === null) return bad('wholeWork entry is malformed');
    total += text.length;
    if (total > LIMITS.wholeWorkTotal) return bad('writerStudioContext.wholeWork is too large');
    wholeWork.push({ sectionId, heading, text });
  }

  // conversation
  const rawTurns = input.conversationThread ?? [];
  if (!Array.isArray(rawTurns)) return bad('writerStudioContext.conversationThread must be an array');
  if (rawTurns.length > LIMITS.turns) return bad('writerStudioContext.conversationThread is too long');
  const conversationThread: WriterStudioTurn[] = [];
  for (const raw of rawTurns) {
    if (!isRecord(raw)) return bad('conversationThread entries must be objects');
    if (raw.speaker !== 'writer' && raw.speaker !== 'maia') {
      return bad('conversationThread entry has an unknown speaker');
    }
    const text = str(raw.text, LIMITS.turnText);
    if (text === null) return bad('conversationThread entry text is malformed');
    conversationThread.push({ speaker: raw.speaker, text });
  }

  const pursuit = input.pursuit == null ? null : str(input.pursuit, LIMITS.pursuit);
  if (pursuit === null && input.pursuit != null) return bad('writerStudioContext.pursuit is malformed');
  const commission = input.commission == null ? null : str(input.commission, LIMITS.commission);
  if (commission === null && input.commission != null) return bad('writerStudioContext.commission is malformed');

  return {
    ok: true,
    value: {
      workId, focus, localContext, structuralPosition,
      wholeWork, conversationThread, pursuit, commission,
    },
  };
}
