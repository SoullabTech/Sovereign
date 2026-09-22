/**
 * MA-D1 … MA-D12 — DELIBERATELY WRONG SUBSTRATES.
 * ⛔ A SURVIVING CANDIDATE REPAIRS THE SUITE, NEVER THE CANDIDATE.
 */

import type { AdmitInput, AdmitResult, Facet, LiveWork, MemberObservation, MemberPlaceSubstrate, Projection, Resolution, ResumeState } from './contract';
import { ReferenceSubstrate, mintMemberObservationId } from './reference';

/* §IX MA-D1 — ambiguous duplicate text auto-selects one current location. */
class D1_PicksTheLikelyMatch extends ReferenceSubstrate {
  override resolve(o: MemberObservation, live: LiveWork): Resolution {
    const r = super.resolve(o, live);
    if (r.state !== 'MISSING_HISTORICAL_ONLY') return r;
    const guess = live.sections.find((s) => s.digest.includes('with-the-sentence'));
    return guess ? { state: 'EXACT', currentDraftSectionId: guess.id, creation: o.address } : r;
  }
}
/* §IX MA-D2 — calls an evidence-side "current" flag the answer after an edit. */
class D2_TrustsEvidenceFlag extends ReferenceSubstrate {
  override resolve(o: MemberObservation, live: LiveWork): Resolution {
    const section = live.sections.find((s) => s.id === o.address.draftSectionId);
    /* the flag it trusts: "the section still exists" — which is what an
       evidence-side 'current' looks like when nobody checks the digest */
    if (section) return { state: 'EXACT', currentDraftSectionId: section.id, creation: o.address };
    return super.resolve(o, live);
  }
}
/* §IX MA-D3 — a current resolution overwrites the creation address. */
class D3_OverwritesCreation extends ReferenceSubstrate {
  override resolve(o: MemberObservation, live: LiveWork): Resolution {
    const r = super.resolve(o, live);
    if (r.state === 'CHANGED') {
      const section = live.sections.find((s) => s.id === o.address.draftSectionId)!;
      const moved: MemberObservation = { ...o, address: { ...o.address, sectionDigest: section.digest, revisionNumber: live.revisionNumber } };
      this.observations.set(o.id, moved);
      return { ...r, creation: moved.address };
    }
    return r;
  }
}
/* §IX MA-D4 — a member observation is projected as MAIA-authored. */
class D4_ProjectsAsMaia extends ReferenceSubstrate {
  override project(o: MemberObservation, facet: Facet): Projection {
    return { ...super.project(o, facet), provenance: 'maia' as unknown as 'member' };
  }
}
/* §IX MA-D5 — rendering in another mode mints another id. */
class D5_MintsPerFacet extends ReferenceSubstrate {
  override project(o: MemberObservation, facet: Facet): Projection {
    return { ...super.project(o, facet), observationId: facet === 'guided' ? o.id : mintMemberObservationId() };
  }
}
/* §IX MA-D6 — cold-start resume chooses a Work. */
class D6_ColdStartChooses extends ReferenceSubstrate {
  override coldStartWork(memberId: string): string | null {
    for (const [k, v] of this.resume) if (k.startsWith(memberId + ':')) return v[0]?.workId ?? null;
    return null;
  }
}
/* §IX MA-D7 — resume accumulates a behavioural history. */
class D7_ResumeAccumulates extends ReferenceSubstrate {
  override writeResume(state: ResumeState): void {
    const k = `${state.memberId}:${state.workId}`;
    this.resume.set(k, [...(this.resume.get(k) ?? []), state]);
  }
  override readResume(memberId: string, workId: string): ResumeState | null {
    const rows = this.resume.get(`${memberId}:${workId}`) ?? []; return rows[rows.length - 1] ?? null;
  }
}
/* §IX MA-D8 — renders MOVED in v1. */
class D8_RendersMoved extends ReferenceSubstrate {
  override resolve(o: MemberObservation, live: LiveWork): Resolution {
    const r = super.resolve(o, live);
    return r.state === 'CHANGED' ? { ...r, state: 'MOVED' as unknown as 'CHANGED' } : r;
  }
}
/* MA-D9 — retrieval ignores the owner. */
class D9_IgnoresOwner extends ReferenceSubstrate {
  override retrieve(_m: string, workId: string): readonly MemberObservation[] {
    return [...this.observations.values()].filter((o) => o.workId === workId);
  }
}
/* MA-D10 — retrieval ignores the Work. */
class D10_IgnoresWork extends ReferenceSubstrate {
  override retrieve(memberId: string): readonly MemberObservation[] {
    return [...this.observations.values()].filter((o) => o.memberId === memberId);
  }
}
/* MA-D11 — re-anchors by shifting the range after an insertion above.
   ⭐ The most COMPETENT wrong machine: it "helpfully" adjusts offsets. */
class D11_ReanchorsByShift extends ReferenceSubstrate {
  override resolve(o: MemberObservation, live: LiveWork): Resolution {
    const r = super.resolve(o, live);
    if (r.state !== 'CHANGED') return r;
    const section = live.sections.find((s) => s.id === o.address.draftSectionId)!;
    if (!section.digest.endsWith('-shifted')) return r;
    const shifted = { ...o.address, range: { start: o.address.range.start + 40, end: o.address.range.end + 40 } };
    return { state: 'EXACT', currentDraftSectionId: section.id, creation: shifted };
  }
}
/* MA-D12 — a deleted section drops the observation instead of keeping it. */
class D12_DropsOnDeletion extends ReferenceSubstrate {
  override resolve(o: MemberObservation, live: LiveWork): Resolution {
    const r = super.resolve(o, live);
    if (r.state === 'MISSING_HISTORICAL_ONLY') this.observations.delete(o.id);
    return r;
  }
}
/* MA-D13 — the id is derived from the text, so an identical note is the same note. */
class D13_TextDerivedId extends ReferenceSubstrate {
  override admit(input: AdmitInput): AdmitResult {
    const r = super.admit(input); if (!r.ok) return r; const o = r.observation;
    const derived: MemberObservation = { ...o, id: `mobs_${Buffer.from(input.text).toString('hex').slice(0, 16)}` };
    this.observations.delete(o.id); this.observations.set(derived.id, derived); return { ok: true, observation: derived };
  }
}
/* MA-S1 defeat — member confirmation overrides Sanctuary. */
class DS1_ConfirmationOverrides extends ReferenceSubstrate {
  override admit(input: AdmitInput): AdmitResult {
    /* ⭐ Narrow: overrides ONLY a resolved Sanctuary posture. A machine that
       also wrote on MISSING posture would be embodying a second error. */
    const override = input.memberConfirmed && input.posture !== undefined && input.posture.sanctuary;
    return override ? super.admit({ ...input, posture: { sanctuary: false, resolvedAtIso: 'forced' } }) : super.admit(input);
  }
}
/* MA-S2 defeat — refuses only when reached through the client (the UI hid it). */
class DS2_ClientOnlyGuard extends ReferenceSubstrate {
  override admit(input: AdmitInput): AdmitResult {
    return input.channel === 'direct' ? super.admit({ ...input, posture: { sanctuary: false, resolvedAtIso: 'assumed' } }) : super.admit(input);
  }
}
/* MA-S3 defeat — absence of posture defaults to ordinary persistence. */
class DS3_MissingPostureWrites extends ReferenceSubstrate {
  override admit(input: AdmitInput): AdmitResult {
    return super.admit({ ...input, posture: input.posture ?? { sanctuary: false, resolvedAtIso: 'defaulted' } });
  }
}
/* MA-S5 defeat — the refusal "helpfully" carries what was refused. */
class DS5_RefusalLeaks extends ReferenceSubstrate {
  override admit(input: AdmitInput): AdmitResult {
    const r = super.admit(input); if (r.ok) return r;
    return { ok: false, refusal: { ...r.refusal, memberIdPrefix: `${input.memberId} · “${input.text}”` } };
  }
}

export const REFERENCE = (): MemberPlaceSubstrate => new ReferenceSubstrate();

export const DEFEAT_CANDIDATES: Readonly<Record<string, () => MemberPlaceSubstrate>> = {
  'MA-D1_PICKS_THE_LIKELY_MATCH': () => new D1_PicksTheLikelyMatch(),
  'MA-D2_TRUSTS_EVIDENCE_FLAG': () => new D2_TrustsEvidenceFlag(),
  'MA-D3_OVERWRITES_CREATION': () => new D3_OverwritesCreation(),
  'MA-D4_PROJECTS_AS_MAIA': () => new D4_ProjectsAsMaia(),
  'MA-D5_MINTS_PER_FACET': () => new D5_MintsPerFacet(),
  'MA-D6_COLD_START_CHOOSES': () => new D6_ColdStartChooses(),
  'MA-D7_RESUME_ACCUMULATES': () => new D7_ResumeAccumulates(),
  'MA-D8_RENDERS_MOVED': () => new D8_RendersMoved(),
  'MA-D9_IGNORES_OWNER': () => new D9_IgnoresOwner(),
  'MA-D10_IGNORES_WORK': () => new D10_IgnoresWork(),
  'MA-D11_REANCHORS_BY_SHIFT': () => new D11_ReanchorsByShift(),
  'MA-D12_DROPS_ON_DELETION': () => new D12_DropsOnDeletion(),
  'MA-D13_TEXT_DERIVED_ID': () => new D13_TextDerivedId(),
  'MA-DS1_CONFIRMATION_OVERRIDES_SANCTUARY': () => new DS1_ConfirmationOverrides(),
  'MA-DS2_CLIENT_ONLY_GUARD': () => new DS2_ClientOnlyGuard(),
  'MA-DS3_MISSING_POSTURE_WRITES': () => new DS3_MissingPostureWrites(),
  'MA-DS5_REFUSAL_LEAKS_CONTENT': () => new DS5_RefusalLeaks(),
};

export const NAMED_KILL: Readonly<Record<string, string>> = {
  'MA-D1_PICKS_THE_LIKELY_MATCH': 'MA-F9-duplicate-text-is-never-selected',
  'MA-D2_TRUSTS_EVIDENCE_FLAG': 'MA-F14-digest-mismatch-is-never-EXACT',
  'MA-D3_OVERWRITES_CREATION': 'MA-F10-creation-address-never-mutates',
  'MA-D4_PROJECTS_AS_MAIA': 'MA-F11-projection-keeps-member-provenance-and-one-id',
  'MA-D5_MINTS_PER_FACET': 'MA-F11-projection-keeps-member-provenance-and-one-id',
  'MA-D6_COLD_START_CHOOSES': 'MA-F13-resume-is-one-row-and-never-selects-a-work',
  'MA-D7_RESUME_ACCUMULATES': 'MA-F13-resume-is-one-row-and-never-selects-a-work',
  'MA-D8_RENDERS_MOVED': 'MA-F12-v1-emits-only-the-three-states',
  'MA-D9_IGNORES_OWNER': 'MA-F7-retrieval-is-owner-and-work-scoped',
  'MA-D10_IGNORES_WORK': 'MA-F7-retrieval-is-owner-and-work-scoped',
  'MA-D11_REANCHORS_BY_SHIFT': 'MA-F1-insertion-above-is-CHANGED-not-reanchored',
  'MA-D12_DROPS_ON_DELETION': 'MA-F5-deletion-is-MISSING-and-observation-survives',
  'MA-D13_TEXT_DERIVED_ID': 'MA-F15-identical-words-are-two-observations',
  'MA-DS1_CONFIRMATION_OVERRIDES_SANCTUARY': 'MA-S1-explicit-save-refused-in-sanctuary',
  'MA-DS2_CLIENT_ONLY_GUARD': 'MA-S2-direct-store-invocation-refuses-in-sanctuary',
  'MA-DS3_MISSING_POSTURE_WRITES': 'MA-S3-unresolved-posture-fails-closed',
  'MA-DS5_REFUSAL_LEAKS_CONTENT': 'MA-S5-refusal-evidence-is-content-free',
};

export const CLASSIFIED: Readonly<Record<string, readonly string[]>> = {
  /* ⭐ Trusting "the section exists" as EXACT necessarily also misreads an
     insertion above and an internal edit — every case where the section
     stands and its bytes moved. Irreducible: the error IS not checking. */
  'MA-D2_TRUSTS_EVIDENCE_FLAG': ['MA-F1-insertion-above-is-CHANGED-not-reanchored', 'MA-F2-edit-inside-is-CHANGED',
    /* ⚠️ ADDED after the first run reported it UNCLASSIFIED: a resolver that
       trusts "the section exists" never asks WHICH WORK either, so identical
       coordinates in another Work read as EXACT. Irreducible — the error is
       the absence of checking, and Work is one of the checks. */
    'MA-F8-colliding-address-never-crosses-works'],
  /* ⭐ Rendering MOVED where CHANGED belongs also fails the specific CHANGED
     laws, since those assert the state by name. Same error, seen twice. */
  'MA-D8_RENDERS_MOVED': ['MA-F1-insertion-above-is-CHANGED-not-reanchored', 'MA-F2-edit-inside-is-CHANGED'],
  /* ⭐ Ignoring the Work on retrieval is the same fact MA-F8's leak check sees. */
  'MA-D10_IGNORES_WORK': ['MA-F8-colliding-address-never-crosses-works'],
  /* ⚠️ WITHDRAWN after the first run: D11 re-anchors only on the `-shifted`
     fixture and falls through to CHANGED on MA-F14's `different` digest.
     A narrower candidate than I predicted — which is correct for it. */
  'MA-D11_REANCHORS_BY_SHIFT': [],
  /* ⚠️ WITHDRAWN after the first run: D3 rewrites digest and revision but
     leaves the RANGE intact, so MA-F1's range check never fires. The
     prediction was wrong; the check was not. */
  'MA-D3_OVERWRITES_CREATION': [],
};
