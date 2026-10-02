/** D9 — a thread may be re-pointed at the latest equivalent finding when a newer reading arrives. */
export * from '../contract';
import type { FindingAnchor } from '../contract';
export interface ThreadBinding { readonly threadRef: string; anchor: FindingAnchor }
export const bindThread = (threadRef: string, anchor: FindingAnchor): ThreadBinding => ({ threadRef, anchor: { ...anchor } });
export const repointThread = (t: ThreadBinding, anchor: FindingAnchor): ThreadBinding => { t.anchor = anchor; return t; };
export const sameSubject = (t: ThreadBinding, a: FindingAnchor): boolean => t.anchor.readingId === a.readingId && t.anchor.observationKey === a.observationKey;
