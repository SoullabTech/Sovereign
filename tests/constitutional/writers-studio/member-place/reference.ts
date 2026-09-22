/**
 * CONFORMING REFERENCE — a TEST DOUBLE, ⛔ NEVER A SEED.
 *
 * A Map with no table, transaction, lock, durability or schema. It exists to
 * prove the laws are MUTUALLY SATISFIABLE and to be the substrate the defeat
 * candidates corrupt. ⛔ Copying it forward into lib/ would smuggle storage
 * decisions out of a double that was never designed to make them.
 */

import { createHash } from 'node:crypto';
import type {
  AdmitInput, AdmitResult, Facet, LiveWork, MemberObservation, MemberPlaceSubstrate, Projection,
  Resolution, ResumeState,
} from './contract';

let seq = 0;
/** Opaque. ⛔ Not derived from text, address or facet. */
export const mintMemberObservationId = (): string => `mobs_${(++seq).toString(16).padStart(8, '0')}`;

export class ReferenceSubstrate implements MemberPlaceSubstrate {
  protected observations = new Map<string, MemberObservation>();
  protected resume = new Map<string, ResumeState[]>();

  /** ⭐ The STORE refuses — regardless of channel, regardless of confirmation. */
  admit(input: AdmitInput): AdmitResult {
    /* ⚠️ NOT `memberId.slice(0, 8)`. MA-S5 went red on the reference itself:
       a short id makes a "prefix" the whole id. A hash prefix is opaque at
       any length. (The same hazard sits in contentWritable's slice(0,12) on
       session ids — routed out, not repaired here.) */
    const prefix = createHash('sha256').update(input.memberId).digest('hex').slice(0, 8);
    if (input.posture === undefined) return { ok: false, refusal: { store: 'member_observations', category: 'posture_unresolved', memberIdPrefix: prefix } };
    if (input.posture.sanctuary) return { ok: false, refusal: { store: 'member_observations', category: 'sanctuary', memberIdPrefix: prefix } };
    /* ⭐ B-IR1 — MA-F16. Sanctuary permission is necessary for persistence but
       is not member consent; member consent is necessary but does not
       override Sanctuary. The founder's independent review found this
       conjunction half-enforced: the field existed and nothing read it. */
    if (!input.memberConfirmed) return { ok: false, refusal: { store: 'member_observations', category: 'not_confirmed', memberIdPrefix: prefix } };
    const o: MemberObservation = {
      id: mintMemberObservationId(), memberId: input.memberId, workId: input.workId,
      address: input.address, kind: input.kind, text: input.text,
      provenance: 'member', createdAt: input.at, editedAt: null,
    };
    this.observations.set(o.id, o);
    return { ok: true, observation: o };
  }

  retrieve(memberId: string, workId: string): readonly MemberObservation[] {
    return [...this.observations.values()].filter((o) => o.memberId === memberId && o.workId === workId);
  }

  /** ⭐ Three states, from the live Work alone. ⛔ No matching, no evidence input. */
  resolve(o: MemberObservation, live: LiveWork): Resolution {
    const creation = o.address;
    if (live.workId !== o.workId) return { state: 'MISSING_HISTORICAL_ONLY', currentDraftSectionId: null, creation };
    const section = live.sections.find((s) => s.id === creation.draftSectionId);
    if (!section) return { state: 'MISSING_HISTORICAL_ONLY', currentDraftSectionId: null, creation };
    if (section.digest === creation.sectionDigest) return { state: 'EXACT', currentDraftSectionId: section.id, creation };
    return { state: 'CHANGED', currentDraftSectionId: section.id, creation };
  }

  project(o: MemberObservation, facet: Facet): Projection {
    return { observationId: o.id, provenance: 'member', facet, text: o.text };
  }

  snapshot(): string {
    return JSON.stringify({ observations: [...this.observations.values()], resume: [...this.resume.entries()] });
  }
  restore(snapshot: string): void {
    const s = JSON.parse(snapshot) as { observations: MemberObservation[]; resume: [string, ResumeState[]][] };
    this.observations = new Map(s.observations.map((o) => [o.id, o]));
    this.resume = new Map(s.resume);
  }

  /** ⭐ Overwritten, never accumulated. */
  writeResume(state: ResumeState): void {
    this.resume.set(`${state.memberId}:${state.workId}`, [state]);
  }
  readResume(memberId: string, workId: string): ResumeState | null {
    return this.resume.get(`${memberId}:${workId}`)?.[0] ?? null;
  }
  /** ⭐ Always null. The parameter is accepted and deliberately unused: resume
   *  knows the member and still may not choose their Work (F4.3). */
  coldStartWork(_memberId: string): string | null { return null; }
  resumeRowCount(memberId: string, workId: string): number {
    return this.resume.get(`${memberId}:${workId}`)?.length ?? 0;
  }
}
