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

import { captureEvidence, loadRevisionContentForCognition } from '../development/capture';
import { establishDisclosureBoundary, mayCrossBoundary } from '@/lib/disclosure/disclosureBoundary';
import { confirmDisclosureCrossed } from '@/lib/disclosure/contextDisclosureReceipt';
import { actIdentifiers } from '@/lib/disclosure/actIdentity';
import type { DisclosureLocus } from '@/lib/disclosure/disclosureAuthority';
import { TurnPosture } from '@/lib/sanctuary/turnPosture';
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
  /**
   * ⭐ The writer's commissioned scope, as they named it — `whole`, one section,
   * a division, or a bounded run. Built at the route from `ReadingScope`, never
   * inferred here from `bodyScope`: a three-section body could be a division or
   * a range or a whole small Work, and the disclosure scope names the ACT the
   * writer authorized, not the geometry of what happened to cross.
   */
  locus: DisclosureLocus;
  /** ⭐ The writer's act, named by the surface that saw it. Never invented here. */
  actId: string;
}

export type CommissionStage = 'capture' | 'recover' | 'read' | 'classify' | 'freeze' | 'store';

export type CommissionOutcome =
  | { outcome: 'frozen'; reading: DevelopmentalReading }
  | { outcome: 'refused'; stage: CommissionStage; refusal: string; detail: string };

const refused = (stage: CommissionStage, refusal: string, detail: string): CommissionOutcome =>
  ({ outcome: 'refused', stage, refusal, detail });

export async function commissionReading(input: CommissionInput, opts: ReadOptions = {}): Promise<CommissionOutcome> {
  const { manuscriptId, memberId, lens, bodyScope, withStructure, locus, actId } = input;

  const cap = await captureEvidence(manuscriptId, memberId, { bodyScope, withStructure });
  if (!cap.ok) return refused('capture', cap.refusal, cap.detail);
  const evidence = cap.value;

  /* ⭐⭐ THE DISCLOSURE BOUNDARY, before a single authored character is loaded
     for cognition. One commission is ONE handoff and therefore ONE act, however
     many sections its body contains — never N section receipts. */
  const { requestId, disclosureId } = actIdentifiers(actId);
  const boundary = await establishDisclosureBoundary({
    requestId, posture: TurnPosture.resolve({ userId: memberId }),
    memberId, sessionId: null, disclosureId,
    boundary: 'manuscript_prose->maia_cognition',
    sourceClass: 'work',
    participationBasis: 'member_invoked',
    workRef: manuscriptId,
    locus,
    gesture: 'commission_reading',
  });
  if (!mayCrossBoundary(boundary)) {
    /* ⛔ No authority, no reading. The commission is refused rather than served
       from a Work the system had no standing to read to MAIA. */
    return refused('recover', 'disclosure_unavailable', 'the disclosure boundary could not be established');
  }

  const disclosure = await loadRevisionContentForCognition(
    boundary.authority,
    { memberId, workRef: manuscriptId, locus },
    evidence.readState.draftId, evidence.readState.revisionNumber);
  const content = disclosure.kind === 'disclosed' ? disclosure.content : null;
  if (content === null) return refused('recover', 'revision_content_required', `revision ${evidence.readState.revisionNumber} of draft ${evidence.readState.draftId} is absent`);
  const recovered: RecoveredBody[] = [];
  for (const sectionId of bodyScope) {
    const r = recoverEvidence({ kind: 'section', sectionId }, evidence.readState, content);
    if (!r.ok) return refused('recover', r.refusal, r.detail);
    if (r.value.kind !== 'text') return refused('recover', 'revision_integrity_failure', `section ${sectionId} did not recover as text`);
    recovered.push(r.value);
  }

  const request = { commissionedLens: lens, evidence, recovered };
  /* ⭐⭐ THE HANDOFF SEAM. Generation begins here and is deliberately NOT awaited
     yet, so the receipt is confirmed at the moment of crossing rather than on an
     answer. `onHandoff` fires inside the provider, immediately before the request
     leaves the process; `.finally` settles false if the call completes without
     ever dispatching — a refusal, a missing client, a throw.

       handoff fails                  → receipt stays `attempted`
       handoff succeeds, answer fails → receipt stays `crossed`

     ⛔ A generation failure after handoff does NOT mean the Work never crossed.
     Response success is not disclosure evidence — handoff is. */
  let signalled = false;
  let settle!: (v: boolean) => void;
  const handoff = new Promise<boolean>((r) => { settle = r; });
  const readingRun = readDevelopmentally(request, { ...opts, onHandoff: () => { signalled = true; settle(true); } })
    .finally(() => { if (!signalled) settle(false); });

  if (await handoff) await confirmDisclosureCrossed(boundary.disclosureId);

  const result = await readingRun;
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
