/** Becoming logical core: no persistence, inference, provider, clock, or network. */
export const MOVEMENTS = ['arrive', 'open', 'encounter', 'dialogue', 'discern', 'bridge', 'return'] as const;
export type Movement = typeof MOVEMENTS[number];
export const QUALITIES = ['desired', 'feared', 'expected', 'surprising', 'unlived', 'unknown'] as const;
export type Quality = typeof QUALITIES[number];
export type Perspective = 'present' | 'imagined_future';
export type SourceRef = { sessionId: string; revision: number };
export type DialogueTurn = { id: string; perspective: Perspective; author: 'member'; kind: 'imaginal_dialogue'; text: string };
export const ELEMENTS = ['earth', 'water', 'air', 'fire', 'aether'] as const;
export type Element = typeof ELEMENTS[number];
export type ElementalImmersion = Record<Element, string>;
export type Possibility = { id: string; label: string; qualities: Quality[]; horizon: string; encounter: string; dialogue: DialogueTurn[]; elemental?: ElementalImmersion };
export type Session = {
  schemaVersion: 1; id: string; revision: number; createdAt: string; updatedAt: string;
  title: string; status: 'open' | 'paused' | 'returned'; returnedAt: string | null; returnActId: string | null;
  provenance: { entry: 'member_entered'; future: 'imaginal'; connection: 'member_proposed' };
  arrival: string; possibilities: Possibility[];
  discernment: { noticed: string; meaning: string; open: string; counterevidence: string };
  bridge: { orientation: string; practice: string; act: string; question: string; obstacle: string; support: string };
  returnNote: string; related: SourceRef[]; connection: string; exception: string;
};
export type SavedRecord = { id: string; current: Session; history: Session[] };
export class BecomingError extends Error { constructor(public code: string) { super(code); this.name = 'BecomingError'; } }
function fail(code: string): never { throw new BecomingError(code); }
const isObject = (v: unknown): v is Record<string, unknown> => v !== null && typeof v === 'object' && !Array.isArray(v);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function id(v: unknown): asserts v is string { if (typeof v !== 'string' || !UUID.test(v)) fail('INVALID_ID'); }
function text(v: unknown, limit = 20000): asserts v is string { if (typeof v !== 'string' || v.length > limit) fail('INVALID_TEXT'); }
function date(v: unknown): asserts v is string { if (typeof v !== 'string' || !Number.isFinite(Date.parse(v)) || new Date(v).toISOString() !== v) fail('INVALID_DATE'); }
function shape(v: unknown, keys: string[]): asserts v is Record<string, unknown> {
  if (!isObject(v) || Object.keys(v).length !== keys.length || Object.keys(v).some(k => !keys.includes(k))) fail('INVALID_SHAPE');
}
function textFields(v: unknown, keys: string[]): void { shape(v, keys); for (const k of keys) text(v[k]); }
export function newPossibility(possibilityId: string): Possibility {
  id(possibilityId); return { id: possibilityId, label: '', qualities: [], horizon: '', encounter: '', dialogue: [], elemental: { earth: '', water: '', air: '', fire: '', aether: '' } };
}
export function elementalOf(possibility: Possibility): ElementalImmersion {
  return possibility.elemental ?? { earth: '', water: '', air: '', fire: '', aether: '' };
}
export function newSession(sessionId: string, possibilityId: string, now: string): Session {
  id(sessionId); date(now);
  return { schemaVersion: 1, id: sessionId, revision: 0, createdAt: now, updatedAt: now, title: '', status: 'open', returnedAt: null, returnActId: null,
    provenance: { entry: 'member_entered', future: 'imaginal', connection: 'member_proposed' }, arrival: '', possibilities: [newPossibility(possibilityId)],
    discernment: { noticed: '', meaning: '', open: '', counterevidence: '' }, bridge: { orientation: '', practice: '', act: '', question: '', obstacle: '', support: '' },
    returnNote: '', related: [], connection: '', exception: '' };
}
export function validateSession(v: unknown): asserts v is Session {
  shape(v, ['schemaVersion','id','revision','createdAt','updatedAt','title','status','returnedAt','returnActId','provenance','arrival','possibilities','discernment','bridge','returnNote','related','connection','exception']);
  if (v.schemaVersion !== 1 || !Number.isInteger(v.revision) || (v.revision as number) < 0) fail('INVALID_VERSION');
  id(v.id); date(v.createdAt); date(v.updatedAt); text(v.title, 200); text(v.arrival); text(v.returnNote); text(v.connection); text(v.exception);
  if (Date.parse(v.updatedAt) < Date.parse(v.createdAt)) fail('INVALID_CHRONOLOGY');
  if (!['open','paused','returned'].includes(v.status as string)) fail('INVALID_STATUS');
  if (v.status === 'returned') { date(v.returnedAt); id(v.returnActId); if (Date.parse(v.returnedAt as string) < Date.parse(v.createdAt)) fail('INVALID_CHRONOLOGY'); }
  else if (v.returnedAt !== null || v.returnActId !== null) fail('FALSE_RETURN');
  shape(v.provenance, ['entry','future','connection']);
  if (v.provenance.entry !== 'member_entered' || v.provenance.future !== 'imaginal' || v.provenance.connection !== 'member_proposed') fail('PROVENANCE_VIOLATION');
  if (!Array.isArray(v.possibilities) || v.possibilities.length < 1 || v.possibilities.length > 8) fail('INVALID_POSSIBILITIES');
  const seen = new Set<string>();
  for (const p of v.possibilities) {
    const possibilityKeys = Object.keys(p as object);
    const oldShape = ['id','label','qualities','horizon','encounter','dialogue'];
    const elementalShape = [...oldShape,'elemental'];
    if (!isObject(p) || ![oldShape,elementalShape].some(keys => keys.length === possibilityKeys.length && possibilityKeys.every(k => keys.includes(k)))) fail('INVALID_SHAPE');
    id(p.id); if (seen.has(p.id)) fail('DUPLICATE_ID'); seen.add(p.id);
    text(p.label, 200); text(p.horizon, 200); text(p.encounter);
    if (p.elemental !== undefined) textFields(p.elemental, ['earth','water','air','fire','aether']);
    if (!Array.isArray(p.qualities) || p.qualities.some(q => !QUALITIES.includes(q as Quality)) || new Set(p.qualities).size !== p.qualities.length) fail('INVALID_QUALITY');
    if (!Array.isArray(p.dialogue) || p.dialogue.length > 64) fail('INVALID_DIALOGUE');
    for (const turn of p.dialogue) {
      shape(turn, ['id','perspective','author','kind','text']); id(turn.id); if (seen.has(turn.id)) fail('DUPLICATE_ID'); seen.add(turn.id);
      if (turn.author !== 'member' || turn.kind !== 'imaginal_dialogue' || !['present','imagined_future'].includes(turn.perspective as string)) fail('DIALOGUE_AUTHORSHIP');
      text(turn.text);
    }
  }
  textFields(v.discernment, ['noticed','meaning','open','counterevidence']);
  textFields(v.bridge, ['orientation','practice','act','question','obstacle','support']);
  if (!Array.isArray(v.related) || v.related.length > 12) fail('INVALID_RELATIONS');
  const refs = new Set<string>();
  for (const ref of v.related) {
    shape(ref, ['sessionId','revision']); id(ref.sessionId);
    if (ref.sessionId === v.id || !Number.isInteger(ref.revision) || (ref.revision as number) < 1) fail('INVALID_RELATION');
    const key = `${ref.sessionId}:${ref.revision}`; if (refs.has(key)) fail('DUPLICATE_RELATION'); refs.add(key);
  }
  if (JSON.stringify(v).length > 250000) fail('SESSION_TOO_LARGE');
}
export function recordReturn(session: Session, now: string, actId: string): Session {
  validateSession(session); date(now); id(actId);
  const next: Session = { ...session, status: 'returned', returnedAt: now, returnActId: actId, updatedAt: now };
  validateSession(next); return next;
}
export function reopen(session: Session): Session { validateSession(session); return { ...session, status: 'open', returnedAt: null, returnActId: null }; }
/** Compare-and-swap must be called within the storage transaction, not before it. */
export function prepareKeep(previous: SavedRecord | undefined, candidate: Session, expectedRevision: number, now: string, consent: boolean): SavedRecord {
  if (!consent) fail('KEEP_REQUIRES_EXPLICIT_ACT'); validateSession(candidate); date(now);
  if (!Number.isInteger(expectedRevision) || expectedRevision < 0 || candidate.revision !== expectedRevision) fail('INVALID_REVISION');
  if ((previous?.current.revision ?? 0) !== expectedRevision) fail('REVISION_CONFLICT');
  if (previous && (previous.id !== candidate.id || previous.current.createdAt !== candidate.createdAt)) fail('IDENTITY_CHANGED');
  const current = structuredClone({ ...candidate, updatedAt: now, revision: expectedRevision + 1 }); validateSession(current);
  return { id: current.id, current, history: previous ? [...previous.history, structuredClone(previous.current)] : [] };
}
export function resolveExact(records: SavedRecord[], ref: SourceRef): Session | null {
  const rec = records.find(r => r.id === ref.sessionId); if (!rec) return null;
  return [rec.current, ...rec.history].find(s => s.revision === ref.revision) ?? null;
}
/** Select only explicit source/version identities. This does not dispatch or retain MAIA context. */
export function temporalSelection(records: SavedRecord[], refs: SourceRef[]): { ref: SourceRef; source: Session | null; kind: 'imagined_at_a_past_time' }[] {
  return refs.map(ref => ({ ref, source: resolveExact(records, ref), kind: 'imagined_at_a_past_time' }));
}
export function exportRecord(record: SavedRecord): string {
  validateSession(record.current); record.history.forEach(validateSession);
  return JSON.stringify({ format: 'soullab-becoming-local-preview', schemaVersion: 1, notice: 'Member-entered reflection. Future material is imagined, not factual or predictive. Not account-synced.', record }, null, 2);
}
export const titleOf = (s: Session): string => s.title.trim() || 'Untitled reflection';
