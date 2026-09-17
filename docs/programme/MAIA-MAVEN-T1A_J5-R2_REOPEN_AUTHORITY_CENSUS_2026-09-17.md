# MAIA-MAVEN-T1A · J5-R2 — REOPEN AUTHORITY CENSUS

**Date:** 2026-09-17
**Lane charter:** `MAIA-MAVEN-T1A_J5-R2_REOPEN_AUTHORITY_LANE_2026-09-17.md`
**Canonical evidence SHA:** `51d4060d71198ad5a36cfc6131dbfb9155617ba6`
**Prior J5 stop:** `5b8b5c495a570281b9bc030a671ac4abd8c82b24`
**J4 authority custody:** corrected contract at `bd9bf3c44ee21219383afa15060e05cd907499ed`
**Standing:** READ-ONLY CENSUS · NO REPAIR AUTHORIZED

---

## 1. Governing distinction

The ratified J4 contract defines REOPEN as the member deliberately authorizing prior persistent material to cross back into the present.

It separately establishes:

- KEEP does not imply REOPEN;
- CONTINUE does not imply KEEP;
- conversational relevance is not member permission;
- the member's REOPEN instruction supplies the retrieval constraint;
- mechanically declared ordering may act only inside that constraint;
- Sanctuary is ENCOUNTER ONLY.

The independently ratified crossing law in `SPM-FC-01-R5_FOUNDER_RATIFICATION_2026-09-17.md` adds a compatible narrow rule: where a governed crossing requires authority independent of material standing, standing cannot substitute for that authority.

Current canon now also includes `docs/canon/REPRESENTATION_AUTHORITY_LAW.md`: a representation may alter **crossing** only when a governed act explicitly grants it that authority **and** an attestation can fail when the authority-bearing condition becomes stale, absent, substituted, or invalid. This applies directly here because any parsed REOPEN signal, memory-mode flag, identity flag, or handoff identifier is a representation used by software to decide whether a crossing occurs.
## 2. Canonical route gate

The live sovereign MAIA route currently establishes cross-session availability with:

```ts
const allowCrossSessionMemory = isRecognizedUser && !isSanctuary;
```

For recognized users, the route defaults `memoryMode` to `continuity`; the client also sends `continuity` unless local storage explicitly requests `longterm`.

No present member REOPEN act participates in either decision.

The route file is byte-unchanged between the prior J5 stop base `2e82ca9f` and current canonical `51d4060d7`; current evidence therefore confirms, rather than merely inherits, the earlier finding.

## 3. Prior→present producer census

| Producer | Present gate on canonical | REOPEN authority present? | Census result |
|---|---|---:|---|
| MemoryBundle / `memoryContext` | recognized · non-Sanctuary · mode not `ephemeral` | No | ambient crossing |
| Member Live Context | recognized · non-Sanctuary | No | ambient crossing |
| developmental memories / theme signals | `allowCrossSessionMemory` | No | ambient crossing |
| `member_memory_atoms` | `allowCrossSessionMemory` + item eligibility | No present act | ambient crossing after eligibility |
| prior cross-session exchanges | `allowCrossSessionMemory` + recall preference | No present act | ambient crossing after eligibility |
| member-marked episodic moments | `allowCrossSessionMemory` + recall preference | No present act | ambient crossing after eligibility |
| prior I Ching readings | `allowCrossSessionMemory` | No present act | ambient crossing |
| relationship context handoff | explicit `relationshipContextId` supplied after member gesture | Yes, bounded handoff precedent | deliberate crossing shape |
## 4. Eligibility is real, but it is not the crossing act

Several loaders already carry legitimate item-level controls: scope, return preference, recall preference, status, sacred protection, member response, provenance, or attribution.

Those controls answer a different question:

> Which prior material is eligible to be used if a crossing has been authorized?

They do not answer:

> Did the member authorize prior continuity to enter this encounter now?

The current architecture therefore has meaningful eligibility controls underneath an absent encounter-level REOPEN authority.

### 4.1 Representation Authority defeater applied

| Representation | Substitution changes crossing? | Governed REOPEN grant present? | Failing attestation? | Result |
|---|---:|---:|---:|---|
| `isRecognizedUser` | Yes | No | No | spurious crossing authority |
| non-Sanctuary posture | Yes | No — it removes a prohibition; it does not author retrieval | Sanctuary attestation exists, REOPEN attestation does not | insufficient |
| `memoryMode = continuity` | Yes for MemoryBundle | No | No | spurious REOPEN substitute |
| recall / return preference | Yes for eligible items | grants item eligibility only, not present encounter reopening | item-level checks exist | valid eligibility, insufficient crossing authority |
| explicit member handoff id | Yes | candidate yes, if the member gesture is ruled to grant bounded generative use | must be added/verified | legitimate precedent, not yet general REOPEN law |

Under the canonical defeater, the defect is not that these representations exist. The defect is that some currently determine crossing without a governed REOPEN grant and crossing-specific attestation.

## 5. No explicit REOPEN seam found

Repository search found no `reopenAuthority`, `reopenIntent`, continuity-reopen token, or equivalent member-act seam on the live MAIA route.

The absence matters because the route cannot prove a member-authored crossing by inspecting identity, account preference, relevance, recency, or the existence of eligible prior rows.

A member may browse their own historical material without thereby granting MAIA generative use of it. Viewing and generative-context crossing are distinct acts.

## 6. Existing deliberate-crossing precedent

The Relationship Context Bridge is structurally different from ambient memory. The member presses **Take this to MAIA**; the client carries `relationshipContextId`; the route reads only that handed-off relationship; ambient fallback is deliberately disabled.

This does not automatically define the REOPEN implementation, but it proves the repository already contains a member-act → bounded identifier → prompt crossing pattern.
## 7. ⭐ START_FRESH is presently a false boundary

The member-facing Quick Settings control says:

> **New Conversation** — *Clear history and start fresh with the welcome screen.*

Its `maia-new-conversation` handler clears UI messages, local historical-message context, activation state, navigation restoration state, and the current session's local-storage transcript.

It does **not** establish a server-side refusal of prior continuity. Subsequent sends still transmit `memoryMode: 'continuity'` by default.

Even forcing `memoryMode = 'ephemeral'` would not currently close every crossing: Member Live Context and the later `allowCrossSessionMemory` block are not universally governed by that mode.

Therefore the existing member-facing START_FRESH gesture does not satisfy the J4 law that prior memory must not enter generative context under START_FRESH.

**Census disposition:** live semantic non-conformance. Recorded here; not repaired in this documentary lane.

## 8. What the contract must govern

The smallest contract capable of repairing the defect later must govern the crossing **before** every prior-continuity producer, not patch each producer's ranking or eligibility logic separately.

It must distinguish:

```text
availability / eligibility   prior material may legally exist and be eligible
REOPEN authority             the member authorizes a bounded prior→present crossing now
selection / ordering         how material inside the member-authorized set is bounded
presentation                 how the authorized result is rendered to MAIA
```

No downstream layer may manufacture an upstream one.
## 9. Negative controls the later build must survive

1. **Identity is not REOPEN.** Recognizing the member must not cause prior content to enter a fresh turn.
2. **Eligibility is not REOPEN.** A row may remain eligible while the prompt receives none of it.
3. **KEEP is not REOPEN.** `Keep this` may create future persistence without opening prior continuity.
4. **CONTINUE availability is not automatic REOPEN.** A previously open thread may remain available without entering a later encounter on its own.
5. **START_FRESH closes every continuity producer.** One surviving addendum is failure under the one-crossing law.
6. **Member constraint binds the set.** Material outside the requested source/topic/range must not enter because it seems relevant.
7. **Over-set refusal is valid.** If declared ordering cannot bound the authorized set without hidden selection, the system must narrow with the member or refuse.
8. **Explicit handoff may pass.** A member-authored object/thread handoff can authorize only the handed-off material, subject to Sanctuary and source eligibility.
9. **Sanctuary defeats REOPEN.** No REOPEN instruction can carry Sanctuary-origin material across its boundary.

## 10. Census conclusion

The live defect is not a ranking defect and not a memory-item consent defect.

It is a missing **present crossing authority** ahead of otherwise legitimate prior-content producers.

The contract may now be drafted. Runtime repair remains closed until founder adjudication of that contract.
