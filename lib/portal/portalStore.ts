/**
 * Personal Portal — prototype-local store (Track A).
 *
 * This module is THE SEAM. Today it persists to localStorage so the Portal is a
 * real, usable surface without waiting on the production chain (role-auth →
 * reconciliation → Sanctuary deploy). Each function maps 1:1 to a sovereign
 * substrate call that replaces it once Track B lands — swapping the body is a
 * one-function change, the call sites don't move:
 *
 *   addMarked()          → POST /api/sovereign/atoms (+ is_breakthrough)   [tier 3, marked]
 *   getContinuityEchoes()→ atoms loader: last 1–2 member-MARKED atoms       [tier 3, read]
 *   addWitnessed()       → the existing background atom-formation path      [tier 2, remembered]
 *   saveWisdom/getWisdom → atoms (source_type: 'spontaneous')              [canon building]
 *
 * Sovereignty invariants are enforced HERE, in the data layer, not only in the UI:
 *
 *   1. RELEASE PERSISTS NOTHING. There is deliberately no release function in this
 *      module — not even a counter (a count is a denominator; Drift gate #1). Release
 *      text never reaches this file; it lives in React state and is discarded. The
 *      Sanctuary boundary is structural: there is nowhere here to put it.
 *
 *   2. SIGNIFICANCE IS MEMBER-DECLARED. addMarked() requires a member-authored or
 *      member-selected label. Nothing in this module infers, nominates, or scores
 *      significance. (Negative Rights Principle: the system may remember; it may not
 *      decide what mattered.)
 *
 *   3. NO DENOMINATOR. No counts, streaks, "this week," or completion are stored or
 *      derived. Continuity reads back verbatim labels + dates only.
 *
 * See: docs/specs/EVENING_PORTAL_SPEC_2026-06-14.md,
 *      docs/specs/NEGATIVE_RIGHTS_PRINCIPLE_CANON_PROPOSAL_2026-06-14.md
 */

const NS = 'maia.portal.v1';
const K_MARKED = `${NS}.marked`; // tier 3 — member-declared significance
const K_WITNESSED = `${NS}.witnessed`; // tier 2 — remembered, not marked
const K_WISDOM = `${NS}.wisdom`; // canon building
const K_ANCHOR = `${NS}.anchor`; // morning orientation (Daily Anchor seam)

// ── Types ───────────────────────────────────────────────────────────────────

/** tier 3 — the member chose to carry this forward. The only tier that "marks". */
export interface MarkedItem {
  id: string;
  label: string; // member-selected category OR member-written word — never inferred
  note?: string; // member's own words, optional
  at: number;
}

/** tier 2 — like normal conversation: remembered, never elevated to significance. */
export interface WitnessedItem {
  id: string;
  kind: 'honor' | 'witness';
  text: string;
  at: number;
}

export type WisdomKind =
  | 'quote'
  | 'passage'
  | 'song'
  | 'teaching'
  | 'insight'
  | 'dream'
  | 'synchronicity'
  | 'moment';
export interface WisdomItem {
  id: string;
  kind: WisdomKind;
  text: string;
  source?: string;
  at: number;
}

// ── Low-level (SSR-safe) ────────────────────────────────────────────────────

function read<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    // Storage full / blocked — fail soft. The Portal never blocks on persistence.
  }
}

function id(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
}

// ── Remember (tier 3) ───────────────────────────────────────────────────────

/**
 * Mark something to carry forward. PROTOTYPE: writes locally.
 * PROD SEAM → POST /api/sovereign/atoms with is_breakthrough=true, label = the
 * member's word. The label MUST originate from the member (selected or written).
 */
export function addMarked(label: string, note?: string): MarkedItem {
  const trimmed = label.trim();
  if (!trimmed) throw new Error('A mark needs a member-authored label.');
  const item: MarkedItem = { id: id(), label: trimmed, note: note?.trim() || undefined, at: Date.now() };
  const items = read<MarkedItem>(K_MARKED);
  items.push(item);
  write(K_MARKED, items);
  return item;
}

export function getMarked(): MarkedItem[] {
  return read<MarkedItem>(K_MARKED).sort((a, b) => b.at - a.at);
}

export function removeMarked(itemId: string): void {
  write(K_MARKED, read<MarkedItem>(K_MARKED).filter((m) => m.id !== itemId));
}

/**
 * Continuity echo: the last 1–2 member-MARKED items, verbatim (label + date).
 * No counts, no themes, no aggregation — replay only. (Drift gate #1 + #3.)
 */
export function getContinuityEchoes(limit = 2): MarkedItem[] {
  return getMarked().slice(0, Math.max(0, limit));
}

// ── Honor / Witness (tier 2) ────────────────────────────────────────────────

/**
 * A background continuity trace — "remembered, not marked". PROTOTYPE: local.
 * PROD SEAM → the existing atom-formation path (same as normal conversation).
 * Never surfaced as significance; never enters the Continuity echo.
 */
export function addWitnessed(kind: 'honor' | 'witness', text: string): WitnessedItem | null {
  const trimmed = text.trim();
  if (!trimmed) return null; // zero-input floor — nothing to remember
  const item: WitnessedItem = { id: id(), kind, text: trimmed, at: Date.now() };
  const items = read<WitnessedItem>(K_WITNESSED);
  items.push(item);
  write(K_WITNESSED, items);
  return item;
}

export function getWitnessed(): WitnessedItem[] {
  return read<WitnessedItem>(K_WITNESSED).sort((a, b) => b.at - a.at);
}

// ── Wisdom Field (canon building) ───────────────────────────────────────────

export function saveWisdom(kind: WisdomKind, text: string, source?: string): WisdomItem | null {
  const trimmed = text.trim();
  if (!trimmed) return null;
  const item: WisdomItem = { id: id(), kind, text: trimmed, source: source?.trim() || undefined, at: Date.now() };
  const items = read<WisdomItem>(K_WISDOM);
  items.push(item);
  write(K_WISDOM, items);
  return item;
}

export function getWisdom(): WisdomItem[] {
  return read<WisdomItem>(K_WISDOM).sort((a, b) => b.at - a.at);
}

export function removeWisdom(itemId: string): void {
  write(K_WISDOM, read<WisdomItem>(K_WISDOM).filter((w) => w.id !== itemId));
}

// ── Morning anchor (orientation, not retention) ─────────────────────────────

/** The morning "what is alive today?" — orientation only; last one replaces prior. */
export function setAnchor(text: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(K_ANCHOR, JSON.stringify({ text: text.trim(), at: Date.now() }));
  } catch {
    /* fail soft */
  }
}

export function getAnchor(): { text: string; at: number } | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(K_ANCHOR);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// NOTE (intentional): there is no `release(...)` export. Release writes nothing.
// If you came here to add one, re-read the module header — that absence is the feature.
