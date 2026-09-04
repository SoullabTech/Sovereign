/**
 * BUILD-07C — DEVELOPMENTAL READING · commissioning a reading.
 *
 *     capture → recover → read → classify → freeze → store → load by identity
 *
 * THE COMMISSIONER IS NOT THE READER. This module may reach the 07A capture
 * (a database read of the member's Work, in one REPEATABLE READ snapshot),
 * the 07A recovery, the 07B reader, the 07C classifier and the store. The
 * reader itself still cannot reach any of the first (its gate holds); what it
 * receives is exactly what the contract allows — a lens, a frozen evidence
 * object, and whole-section prose recovered under it.
 *
 * ONE COMMISSION, ONE READING. No retry on refusal, no second read, no scope
 * widening (INV-18, INV-19). A refusal at any stage returns which stage and
 * why, and stores nothing: a refusal is never a reading (§10).
 *
 * NOTHING TOUCHES THE WORK. Capture is a read; the store writes only its own
 * two tables.
 */

import { captureEvidence, loadRevisionContent } from '../development/capture';
import { recoverEvidence } from '../development/resolve';
import type { DevelopmentalLens, RecoveredBody } from '../developmentalReader/contract';
import { readDevelopmentally, type ReadOptions } from '../developmentalReader/read';
import { classifyClaims } from './classify';
import type { DevelopmentalReading } from './contract';
import { freezeReading } from './freeze';
import { freezeAndStore, loadReading } from './store';

export interface CommissionInput {
  manuscriptId: string;
  /** The verified member. Capture refuses a Work that is not theirs. */
  memberId: string;
  lens: DevelopmentalLens;
  /** Section ids to read at body depth (INV-18: per reading). */
  bodyScope: readonly string[];
  withStructure: boolean;
}

export type CommissionStage = 'capture' | 'recover' | 'read' | 'classify' | 'freeze' | 'store';

export type CommissionOutcome =
  | { outcome: 'frozen'; reading: DevelopmentalReading }
  | { outcome: 'refused'; stage: CommissionStage; refusal: string; detail: string };

const refused = (stage: CommissionStage, refusal: string, detail: string): CommissionOutcome =>
  ({ outcome: 'refused', stage, refusal, detail });

export async function commissionReading(input: CommissionInput, opts: ReadOptions = {}): Promise<CommissionOutcome> {
  const { manuscriptId, memberId, lens, bodyScope, withStructure } = input;

  const cap = await captureEvidence(manuscriptId, memberId, { bodyScope, withStructure });
  if (!cap.ok) return refused('capture', cap.refusal, cap.detail);
  const evidence = cap.value;

  const content = await loadRevisionContent(evidence.readState.draftId, evidence.readState.revisionNumber);
  if (content === null) return refused('recover', 'revision_content_required', `revision ${evidence.readState.revisionNumber} of draft ${evidence.readState.draftId} is absent`);
  const recovered: RecoveredBody[] = [];
  for (const sectionId of bodyScope) {
    const r = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, content);
    if (!r.ok) return refused('recover', r.refusal, r.detail);
    if (r.value.kind !== 'text') return refused('recover', 'revision_integrity_failure', `section ${sectionId} did not recover as text`);
    recovered.push(r.value);
  }

  const request = { commissionedLens: lens, evidence, recovered };
  const result = await readDevelopmentally(request, opts);
  if (result.outcome === 'refused') return refused('read', result.refusal, result.detail);

  let phenomena: Awaited<ReturnType<typeof classifyClaims>> | null = null;
  if (result.outcome === 'claims') {
    phenomena = await classifyClaims(
      result.claims.map((c) => ({ text: c.text, doesNotEstablish: c.doesNotEstablish })),
      lens,
      result.reader.model,
    );
    if (!phenomena.ok) return refused('classify', phenomena.refusal, phenomena.detail);
  }

  const frozen = freezeReading({
    manuscriptId, request, result,
    phenomena: phenomena?.ok ? phenomena.phenomena : [],
    reader: result.reader,
    classifier: phenomena?.ok ? phenomena.classifier : null,
  });
  if (!frozen.ok) return refused('freeze', frozen.refusal, frozen.detail);

  const stored = await freezeAndStore(memberId, frozen.value);
  if (!stored.ok) return refused('store', stored.refusal, stored.detail);

  const reading = await loadReading(stored.id, memberId);
  if (!reading) return refused('store', 'not_found', `reading ${stored.id} was written but could not be read back`);
  return { outcome: 'frozen', reading };
}
