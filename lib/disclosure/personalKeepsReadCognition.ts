/**
 * MAIA-MAVEN-T1A · J5-4 — governed Personal Keeps cognition crossing.
 *
 * Authority is established upstream (J5-3) per Keep object. This module then
 * re-resolves only those authorized objects through the canonical selector,
 * projects the inventory truth MAIA is allowed to see, and confirms disclosure
 * receipts only after the response-producing model call has actually begun.
 *
 * It does not detect intent, mint authority, route a live /maia request, or
 * deepen sourced Keeps beyond the inventory fields proven by J3.
 */
import type { TurnPosture } from '@/lib/sanctuary/turnPosture';
import {
  resolvePersonalKeep,
  type PersonalKeepRow,
  type ResolvePersonalKeepInput,
} from '@/lib/psyche/personalKeepsRead';
import { confirmDisclosureCrossed } from './contextDisclosureReceipt';
import type { AuthorizedPersonalKeepRef } from './personalKeepsReadAuthority';

export interface PersonalKeepCognitionProjection {
  readonly id: string;
  readonly title: string;
  readonly sourceType: string;
  readonly status: string;
  readonly keptAt: string;
  /** Only spontaneous atom content is proven source-native at this depth. */
  readonly bodySnippet?: string;
}

export interface PersonalKeepsReadCognitionInput {
  readonly posture: TurnPosture;
  readonly projection: readonly PersonalKeepCognitionProjection[];
  /** True handoff signal; confirmation happens inside this callback. */
  readonly onHandoff: () => boolean | Promise<boolean>;
}

export interface PreparePersonalKeepsReadInput {
  readonly memberId: string;
  readonly posture: TurnPosture;
  readonly authorized: readonly AuthorizedPersonalKeepRef[];
}

export type PreparedPersonalKeepsRead =
  | { readonly kind: 'sanctuary_refused' }
  | { readonly kind: 'projection_refused'; readonly failedKeepRef: string }
  | { readonly kind: 'ready'; readonly projection: readonly PersonalKeepCognitionProjection[] };

type ResolveKeep = (input: ResolvePersonalKeepInput) => Promise<PersonalKeepRow | null>;

function projectKeep(row: PersonalKeepRow): PersonalKeepCognitionProjection {
  const bodySnippet = row.source_type === 'spontaneous' && row.body
    ? row.body.slice(0, 140)
    : undefined;
  return {
    id: row.id,
    title: row.title,
    sourceType: row.source_type,
    status: row.status,
    keptAt: row.kept_at.toISOString(),
    ...(bodySnippet ? { bodySnippet } : {}),
  };
}

/** Re-resolve every authorized identity under the canonical Personal Keep guards. */
export async function preparePersonalKeepsReadCognition(
  input: PreparePersonalKeepsReadInput,
  deps: { resolveKeep: ResolveKeep } = { resolveKeep: resolvePersonalKeep },
): Promise<PreparedPersonalKeepsRead> {
  if (input.posture.sanctuary) return { kind: 'sanctuary_refused' };

  const projection: PersonalKeepCognitionProjection[] = [];
  for (const ref of input.authorized) {
    const row = await deps.resolveKeep({ memberId: input.memberId, keepId: ref.keepRef });
    if (!row) return { kind: 'projection_refused', failedKeepRef: ref.keepRef };
    projection.push(projectKeep(row));
  }
  return { kind: 'ready', projection };
}

/**
 * Render only inventory truth. Keep ids, disclosure ids and receipt ids never
 * enter the prompt. Sourced atom bodies are deliberately absent until a
 * source-native resolver is separately governed.
 */
export function renderPersonalKeepsReadBlock(
  projection: readonly PersonalKeepCognitionProjection[],
): string {
  const lines = [
    'PERSONAL KEEPS — MEMBER-INVOKED, RESPONSE-SCOPED',
    'Use only this Personal Keeps projection for this response. Do not infer missing source content or treat this as standing memory permission.',
  ];
  projection.forEach((keep, index) => {
    lines.push(`${index + 1}. ${keep.title}`);
    lines.push(`   Type: ${keep.sourceType} · Status: ${keep.status} · Kept: ${keep.keptAt}`);
    if (keep.bodySnippet) lines.push(`   Excerpt: ${keep.bodySnippet}`);
  });
  return lines.join('\n');
}

/** Invoke first, signal the true handoff second, await model settlement third. */
export async function invokePersonalKeepsResponse<T>(
  invoke: () => Promise<T>,
  onHandoff: () => boolean | Promise<boolean>,
): Promise<T> {
  const pending = invoke();
  await onHandoff();
  return await pending;
}

export type PersonalKeepsReadCrossingResult<T> =
  | { readonly kind: 'sanctuary_refused' }
  | { readonly kind: 'projection_refused'; readonly failedKeepRef: string }
  | { readonly kind: 'no_handoff' }
  | { readonly kind: 'confirmation_failed'; readonly failedDisclosureIds: readonly string[] }
  | { readonly kind: 'crossed'; readonly response: T };

/**
 * Resolve projection before cognition, then make receipt confirmation a custody
 * consequence of the model handoff itself. A cognition path that returns before
 * calling onHandoff is a non-crossing and leaves every receipt attempted.
 */
export async function performPersonalKeepsReadCognition<T>(
  input: PreparePersonalKeepsReadInput,
  deps: {
    cognition: (input: PersonalKeepsReadCognitionInput) => Promise<T>;
    resolveKeep?: ResolveKeep;
    confirmReceipt?: (disclosureId: string) => Promise<boolean>;
  },
): Promise<PersonalKeepsReadCrossingResult<T>> {
  const prepared = await preparePersonalKeepsReadCognition(input, {
    resolveKeep: deps.resolveKeep ?? resolvePersonalKeep,
  });
  if (prepared.kind !== 'ready') return prepared;

  const confirmReceipt = deps.confirmReceipt ?? confirmDisclosureCrossed;
  let handoffStarted = false;
  let confirmation: Promise<boolean> | null = null;
  const failedDisclosureIds: string[] = [];

  const onHandoff = (): Promise<boolean> => {
    if (confirmation) return confirmation;
    handoffStarted = true;
    confirmation = (async () => {
      for (const ref of input.authorized) {
        if (!await confirmReceipt(ref.disclosureId)) failedDisclosureIds.push(ref.disclosureId);
      }
      return failedDisclosureIds.length === 0;
    })();
    return confirmation;
  };

  const response = await deps.cognition({
    posture: input.posture,
    projection: prepared.projection,
    onHandoff,
  });

  if (!handoffStarted) return { kind: 'no_handoff' };
  await confirmation;
  if (failedDisclosureIds.length > 0) {
    return { kind: 'confirmation_failed', failedDisclosureIds };
  }
  return { kind: 'crossed', response };
}
