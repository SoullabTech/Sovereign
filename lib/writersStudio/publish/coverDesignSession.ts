/**
 * Author-controlled cover composition (IN-MEMORY ONLY).
 *
 * One independent book design per format, with bounded reversible edits. There
 * is deliberately NO persistence or ownership surrogate. The server-authorized
 * Work/revision never enters this module, and no artwork/ISBN or publisher
 * upload path is inferred from an editable visual study.
 */
export type CoverEdition = 'paperback' | 'hardcover' | 'kindle';
export type CoverPalette = 'forest' | 'ink' | 'paper';
export type CoverTextField = 'title' | 'subtitle' | 'byline' | 'backText';
export type CoverEditionDesign = Readonly<{
  title: string;
  subtitle: string;
  byline: string;
  backText: string;
  palette: CoverPalette;
  titleOffsetPx: number;
}>;
export type CoverDesign = Readonly<{
  selected: CoverEdition;
  editions: Readonly<Record<CoverEdition, CoverEditionDesign>>;
}>;
export type CoverSession = Readonly<{
  present: CoverDesign | null;
  past: readonly CoverDesign[];
  future: readonly CoverDesign[];
}>;

export type CoverSessionAction =
  | { type: 'start'; title: string }
  | { type: 'clear' }
  | { type: 'target'; value: CoverEdition }
  | { type: 'palette'; value: CoverPalette }
  | { type: 'text'; field: CoverTextField; value: string }
  | { type: 'moveTitle'; delta: -12 | 12 }
  | { type: 'undo' }
  | { type: 'redo' };

const TEXT_LIMITS: Readonly<Record<CoverTextField, number>> = {
  title: 170, subtitle: 240, byline: 130, backText: 850,
};
const HISTORY_LIMIT = 40;
const OFFSET_LIMIT = 48;
export const EMPTY_COVER_SESSION: CoverSession = {
  present: null, past: [], future: [],
};

export function startCoverSession(title: string): CoverSession {
  const seededTitle = title.slice(0, TEXT_LIMITS.title);
  const original = (): CoverEditionDesign => ({
    title: seededTitle, subtitle: '', byline: '', backText: '', palette: 'forest', titleOffsetPx: 0,
  });
  return {
    present: {
      selected: 'paperback',
      editions: { paperback: original(), hardcover: original(), kindle: original() },
    },
    past: [], future: [],
  };
}

export function activeCoverEdition(design: CoverDesign): CoverEditionDesign {
  return design.editions[design.selected];
}

function checkpoint(session: CoverSession, next: CoverDesign): CoverSession {
  if (!session.present || session.present === next) return session;
  return {
    present: next,
    past: [...session.past, session.present].slice(-HISTORY_LIMIT),
    future: [],
  };
}
function replaceActive(design: CoverDesign, next: CoverEditionDesign): CoverDesign {
  if (next === design.editions[design.selected]) return design;
  return {
    ...design,
    editions: { ...design.editions, [design.selected]: next },
  };
}

export function coverSessionReducer(
  session: CoverSession,
  action: CoverSessionAction,
): CoverSession {
  if (action.type === 'clear') return EMPTY_COVER_SESSION;
  if (action.type === 'start') return startCoverSession(action.title);
  if (action.type === 'undo') {
    if (!session.present || !session.past.length) return session;
    return {
      present: session.past[session.past.length - 1]!,
      past: session.past.slice(0, -1),
      future: [session.present, ...session.future].slice(0, HISTORY_LIMIT),
    };
  }
  if (action.type === 'redo') {
    if (!session.present || !session.future.length) return session;
    return {
      present: session.future[0]!,
      past: [...session.past, session.present].slice(-HISTORY_LIMIT),
      future: session.future.slice(1),
    };
  }
  const design = session.present;
  if (!design) return session;
  if (action.type === 'target') {
    if (design.selected === action.value) return session;
    return checkpoint(session, { ...design, selected: action.value });
  }
  const current = activeCoverEdition(design);
  if (action.type === 'palette') {
    if (current.palette === action.value) return session;
    return checkpoint(session, replaceActive(design, { ...current, palette: action.value }));
  }
  if (action.type === 'text') {
    // Memory remains bounded even if an external caller bypasses the HTML
    // input maxLength. The React renderer always escapes the author's words.
    const value = action.value.slice(0, TEXT_LIMITS[action.field]);
    if (current[action.field] === value) return session;
    return checkpoint(session, replaceActive(design, { ...current, [action.field]: value }));
  }
  if (action.type === 'moveTitle') {
    const titleOffsetPx = Math.max(-OFFSET_LIMIT, Math.min(
      OFFSET_LIMIT, current.titleOffsetPx + action.delta,
    ));
    if (titleOffsetPx === current.titleOffsetPx) return session;
    return checkpoint(session, replaceActive(design, { ...current, titleOffsetPx }));
  }
  return session;
}
