# MAIA-MEMORY-ATTRIBUTION-01 / R0: Current-Canonical Reconciliation

**Standing:** EVIDENCE · normative authority NONE · read-only
**Evidence base:** `origin/clean-main-no-secrets @ 9c6081283` (full history; the clone was unshallowed so ancestry could be answered and not guessed)
**Opened from:** AIN-STANDING-01 R2 (prior session, 2026-10-01): *shared AIN-standing implementation NOT EARNED; local repairs only.* That ruling was produced in a session whose record was not committed. It is carried in here as context, and every load-bearing fact below was re-verified in this session.
**Changed:** this record only. No code, schema, migration, branch merge, deploy or runtime state.

**The R0 question.** Can the live FAST memory path be made truthfully attributed by recovering or reconciling already-governed P6/CMT mechanisms, without opening M3 or introducing a new standing vocabulary?

**Short answer.** Partly. Recovery is the wrong verb. The P6 donor exists, but on a lineage that was not kept, and its disposition contradicts the ratified charter. Canonical already has everything a first, cognition-neutral step needs: the three-axis vocabulary, the registry convention, the partition contract with its parity law, and a direct precedent (`projectAtomSections`). Attribution *framing into cognition* is still explicitly unauthorized.

---

## 1. Where P6 went

| Artifact | Location | In canonical? |
|---|---|---|
| Full MIPA Phase 0 (P1–P6): `participationGate` · `consentGates` · `sovereignDisposition` · `breakthroughParticipation` · `returnAuthority` · `lib/maia/turn/*` (Path B constructor) · MIPA spec · CMT spec v0.1 | `origin/claude/maia-long-term-memory-fda5gf`, tip `0f7e3025c`, deploy candidate `3e31bc0ff`; merge-base with canonical `a4305f4d6` (2026-09-02), 32 commits ahead, 62 files, +16.6k | **NO** |
| Narrow P6 restoration: `returnAuthority.ts` + migration `20260903000001_return_authority_fail_closed.sql` + practitioner writer binding + recall-tail fixes | `origin/feature/memory-organism-pass1-continuity-02`, tip `fd8c88847`, merge-base `b49f8fe9e`, 7 commits ahead | **NO** |
| Charter that names P6 restoration as a next step | `docs/programme/MAIA_JARVIS_MEMORY_ORGANISM_FULL_OPERATIONALIZATION.md` | YES. *Ratified in principle 2026-09-03.* |

Canonical tree check: all five P6 modules are **ABSENT**, and `20260903000001` is **ABSENT** from `database/migrations/` (516 files). The canonical spec documents that the P6 modules name (`MAIA_CANONICAL_TURN_ARCHITECTURE_SPEC_v0.1.md`, `MIPA_PHASE_0_SOVEREIGNTY_PREREQUISITES_SPEC.md`) are **also absent from canonical**. They exist only on the fda5gf branch.

**The turn-boundary decision the charter asked for (§11.1) was taken by practice.** `JARVIS-MEMORY-ORGANISM-PASS1-DIVINATION-01.md:5` names the kept lineage as *"the one that lives: `lib/maia/canonical-turn/**` … No Path B constructor. No second shadow"* (founder directive 2026-09-03). Every later memory lane (PARTITION-01, WS-ROOM, ER-R2) registers into `canonical-turn`. Path B is the unkept lineage.

⚠️ That decision is evidenced by a lane record and by consistent practice. **No standalone founder ruling retiring Path B was found.** This record does not supply one.

## 2. The doctrinal finding: the donor's disposition is superseded

The two governing texts disagree, and they disagree on the exact question this lane exists to answer.

- **Path B / MIPA (unkept lineage, not in canonical):** `participationGate.ts` header reads: *"It is NOT a provenance-labelling repair … unendorsed MAIA inference has no entitlement to participate merely because its authorship is now accurately named. **The gate therefore EXCLUDES.**"* P3c and P3f apply that rule to the developmental bucket and to breakthroughs inside `MemoryBundle`.
- **Memory Organism charter (canonical, ratified in principle):** *"Maximize useful continuity under member authority … A protection that unnecessarily prevents relevant member-owned memory from participating is itself a memory defect."* §9 finding 3: *"this is an **attribution** defect, not an availability one: the material may well participate; it must be attributed as inference."* §P6: *"P6's ideal result is not less memory."*

**Consequence.** Recovering Path B's P3c/P3f/P6 code would restore an **exclusion** doctrine that the ratified charter replaced with an **attribution** doctrine, and it would carry the unkept constructor along with it. Wholesale recovery is therefore unlawful. Some parts of the donor are still reusable:

| Donor element | Disposition |
|---|---|
| Two-field provenance (`authoredBy` × `authorityClass`), "provenance is never guessed; null ≠ probably MAIA" | **Still applicable.** It is already subsumed by canonical's three axes (`authoredBy` · `participationClass` · `authority`). No new vocabulary is needed. |
| R24/P3c discriminated developmental rows; P3f breakthrough union | **Classification reusable, exclusion disposition superseded** for beta |
| `lib/maia/turn/*` constructor and second shadow | **Superseded.** Unkept lineage. |
| `returnAuthority` + practitioner writer binding (continuity-02) | **Separate finding, still live** (§4c). It is not part of FAST attribution. |

⚠️ This record **identifies** the conflict and does not rule on it. If the founder holds that MIPA's exclusion lattice still governs some class (Sanctuary, third-party and retracted material are already excluded by the charter itself), the table above changes.

## 3. The live seam, re-verified

`/list` route → `MemoryBundleService.build()` → `formatForPrompt()` (`lib/memory/MemoryBundle.ts:644`) → `meta.memoryContext` → `getMaiaResponse` FAST (`lib/sovereign/maiaService.ts:1028`).

`formatForPrompt` emits four sections joined by `'\n\n'`:

| Section | Actual author / class | How it is rendered |
|---|---|---|
| `🧠 RELATIONSHIP:` counts + dominant element | system · computed | bare |
| `recentContinuity` (`buildContinuitySummary`, `:529`) | **mixed**: member + MAIA snippets, system-truncated | bare |
| `📚 RELEVANT MEMORIES:` bullets `[turn]` / `[developmental]` / `[breakthrough]` / `[insight]` | member testimony (turn: `role === 'user'` only, `:594`) · system inference (developmental) · system-computed significance (breakthrough, `significance: 0.9`) | `[source]` tag only. Nothing tells MAIA that a developmental line is her own inference rather than the member's words. |
| `⭐ RECENT BREAKTHROUGHS:` | system · computed significance | bare |

**Instrument blind spot (new; sharper than the prior census stated):** `memoryContext` is **not a key** in `LEGACY_META_KEY_TO_PRODUCER` (`lib/maia/canonical-turn/shadow.ts:23`), and no registry producer owns it. The M2 shadow therefore reports `zeroDiff` on turns where this block participates in cognition. **The canonical shadow cannot see the largest memory channel on `/list`.** This is the same defect class PARTITION-01 repaired for `member.atoms`, one channel over.

**Second unregistered channel (found, not in scope):** when the route supplies no `memoryContext`, FAST falls back to `memoryOrchestrator.formatRecallForPrompt(recall)` (`maiaService.ts:1056–1072`). That text is also invisible to the shadow.

**Convergence note:** `MemoryBundleService.formatForPrompt` is also called by `app/api/voice/stream-conversation/route.ts:1205` and `lib/consciousness/maiaOrchestrator.ts:425`. A byte-identical refactor of the projection therefore preserves the voice non-degradation gate by construction. A framing change would alter all three surfaces at once, which is one more reason framing needs its own act.

## 4. Standing of each local gap after reconciliation

| Gap (AIN-STANDING R1) | Standing now |
|---|---|
| **G2:** MemoryBundle attribution into FAST | **Bounded first step available inside existing authority** (§5). Framing into cognition stays **UNAUTHORIZED**: `partition.ts` header reads *"P6 framing is unauthorized; the renderer is untouched; M3 is unauthorized."* |
| **G1:** developmental memory exact source-turn ancestry | **Unchanged: FOUND / NOT OPENED.** Neither donor branch addresses it. It needs a schema/writer act of its own. |
| **G3:** `retrieved.member_web` mixed authorship | **Unchanged.** Governed by PARTITION-01, explicitly UNRESOLVED_MIXED. Do not reopen. |
| **G4:** computed vs member-marked breakthrough significance | **Partly addressed by §5 as ownership, not framing.** In the shadow, breakthrough bytes would be owned by a `system`/`computed` producer, never by `member`. No prompt change. |
| **G5:** programme status/custody index | **Unchanged: NAMED / NOT OPENED** (JEV). |
| **(c)** Practitioner observations: writer confers `contextual_doorway` | **Still live in canonical** (`app/api/studio/with-me/sessions/[sessionId]/route.ts:148`). The fix sits on continuity-02 and is unmerged. The charter records that the migration was applied to the production schema, so schema and writer disagree. That claim is ⚠️ **not re-verified** here: there is no production access from this container. |

## 5. One bounded repair candidate (proposed, ⛔ not authorized)

**MAIA-MEMORY-ATTRIBUTION-01 / R1: declared ownership of `memoryContext` bytes (shadow-only).**

1. Extract a pure projection `projectMemoryBundleSections(bundle)` that returns ordered `AuthoredSegment`s. Make `formatForPrompt` its join. Prove the result **byte-identical** to the current output over fixtures that cover every section and every bullet source. Precedent: `projectAtomSections()` in `lib/maia/memoryAtomsLoader`, which PARTITION-01 used for `member.atoms`.
2. Register producers under the existing convention, each with reason, date and lane, using **existing** `AuthoredBy`/`ParticipationClass`/`Authority` values only. Bullet `[turn]` → member/retrieved/situate. `[developmental]` → system/inferred/infer. `[breakthrough]` and the breakthrough section → system/computed. Relationship counts → system/computed. `recentContinuity` → **UNRESOLVED_MIXED** unless it can be shown to split without reordering. *Prove it; do not infer it* (PARTITION-01:162).
3. Add `memoryContext` to `LEGACY_META_KEY_TO_PRODUCER` with a `DeclaredPartition`. The acceptance condition is PARTITION-01's **parity law**: `contentParity === true` and empty unexplained diff.

**What it changes:** what the shadow can see and attest, and who owns which bytes in the manifest.
**What it does not change:** one byte MAIA receives, on any surface. It also adds no exclusion, no P6 framing, no M3, no schema, and does not touch G1.
**Falsifiers owed before build:** a defeat candidate that parses prompt prose for `[developmental]` instead of projecting from data (must die on the parity or data-origin check) · one that assigns `member` to developmental bytes · one that silently drops `recentContinuity` from the partition · one that changes a separator.

## 6. Founder questions (two, minimal)

1. **Authorize R1 as scoped in §5?** It falls under PARTITION-01's "passive shadow observation ALLOWED" posture, but it adds registry producers and a new partitioned key, so it is a lane act and should not be taken as a convenience.
2. **Doctrine confirmation for the later framing act:** when P6 framing is eventually opened, does it follow the charter (*attribute, keep participating*) or MIPA (*exclude unendorsed inference*)? This record finds that the charter governs, because it is ratified and in canonical while MIPA is on the unkept lineage. That is a finding, not a ruling.

## 7. Not inspected

Production schema state (`20260903000001` applied?) · live `[MAIA/shadow]` lines · `MaiaWisdomProvider` voice-wisdom use of `MemoryBundleService.build` · DEEP/CORE tier consumption of `memoryContext`. **NOT ASSESSED**, not implicitly healthy.

## 8. Conclusion

```text
P6 donor               located · two unmerged branches · unkept lineage
Wholesale recovery     UNLAWFUL (exclusion doctrine superseded; second constructor)
Reusable from donor    provenance discipline (already subsumed by canonical axes)
Live defect            memoryContext unregistered → shadow-blind; inference unattributed
Bounded candidate      R1 shadow-only declared partition, byte parity
Framing into cognition UNAUTHORIZED (unchanged)
M3                     UNAUTHORIZED (unchanged)
New standing vocabulary NOT NEEDED
Next lawful unit       founder decision on §6.1
```
