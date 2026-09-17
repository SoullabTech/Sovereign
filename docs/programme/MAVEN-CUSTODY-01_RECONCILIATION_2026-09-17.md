# MAVEN-CUSTODY-01 — CUSTODY AND KEEP-SEMANTICS RECONCILIATION

**Status:** READ-ONLY / DOCUMENTARY. Implementation NOT AUTHORIZED.
**Method:** repository-history evidence (GitHub commit API + deepened fetch + source execution). ⛔ No artifact reconstructed.
**Prior:** `docs/canon/MAVEN_FOUNDER_ADJUDICATION_2026-09-17.md`

---

## 1. Repository / worktree identity

```text
repository root   /home/user/Sovereign
remote (origin)   https://github.com/SoullabTech/Sovereign   (fetch + push)
current branch    claude/fervent-einstein-za564h
HEAD              2c5ff8771bf0ea3014d3c54f42d7d6e7323fca42
worktrees         1 — /home/user/Sovereign only
```

### ⚠️ The clone is SHALLOW and NARROW — this invalidates the prior absence finding

```text
.git/shallow        PRESENT — 10 graft boundaries
local history       293 commits
local refs          4        (2 local branches, 2 remote-tracking)
remote heads        1,587
```

⭐ **The session that wrote the adjudication reported artifacts "not present in this repository". That
statement was true of the checkout and carried no information about the repository.** A 2-of-1,587-branch,
293-commit shallow clone cannot witness absence. Recorded as a method correction, not smoothed: **absence in a
shallow checkout is not evidence of absence in custody** — the same defect class as a green gate that never ran.

---

## 2 & 3. True custody of the Maven implementation work — **RESOLVED**

Both cited commits exist and were retrieved from the remote by full SHA.

| Commit | Date (UTC) | Subject | Record |
|---|---|---|---|
| `6adbc3bb5e10fac9c1aa6253e0800329a0d7286c` | 2026-09-17 16:31:12 | `fix(living-field): LF-SCOPE-01 — context containment on all three read paths` | `docs/programme/LF-SCOPE-01_CONTAINMENT_2026-09-17.md` |
| `194e30547bfac500ecf43792f134e85fff9950de` | 2026-09-17 17:07:19 | `feat(home): EAA-03 P1 — Home Arrival "Your Field Now" prototype` | `docs/programme/EAA-03_P1_HOME_ARRIVAL_BUILD_2026-09-17.md` |

Both authored by `claude <noreply@anthropic.com>`, both from session `session_01EygzD1XjMkixkytXNdCJCS`
— **a different session from the one that wrote the adjudication** (`session_01NgMA6bbSFW2Ks88tkE3PMs`).
That is the custody gap's cause: parallel sessions, unshared checkouts.

### Ancestry

```text
8b80ec21  Merge PR #1334  (ANCESTOR of clean-main-no-secrets — verified)
   └─ 9ec3be6d  docs(EAA-03): P1-B Home arrival repository truth census (read-only)
        └─ 6adbc3bb  LF-SCOPE-01 containment
             └─ 194e3054  EAA-03 P1 Home Arrival
```

## 4. Merged vs branch-local

```text
6adbc3bb   NOT an ancestor of origin/clean-main-no-secrets   → BRANCH-LOCAL
194e3054   NOT an ancestor of origin/clean-main-no-secrets   → BRANCH-LOCAL
```

⭐ The negative is **sound, not a shallow-clone artifact**: their shared base `8b80ec21` *is* an ancestor of
`origin/clean-main-no-secrets`, so the history needed to decide the question is present. Canonical is at
`97c7d946`; these three commits sit on a sibling line that never merged.

⚠️ **Neither commit is a branch TIP** in the 1,587-head listing — the carrying branch has moved past them or
was deleted. The commits remain retrievable by SHA; **a named branch head is not established.**

## 5. Unresolved custody

| Artifact | Standing |
|---|---|
| `lib/maia/capabilities.ts` / `CAPABILITY_REGISTRY` | ⭐ **FOUND — on canonical `clean-main-no-secrets` and in the working tree.** See §5a. |
| `docs/programme/LF-SCOPE-01_CONTAINMENT_2026-09-17.md` | FOUND @ `6adbc3bb`, branch-local |
| `docs/programme/EAA-03_P1_HOME_ARRIVAL_BUILD_2026-09-17.md` | FOUND @ `194e3054`, branch-local |
| `MAIA-NODE-03/04/05_*.md` | **UNRESOLVED CUSTODY** — absent from both located trees; no matching branch name among 1,587 heads |
| `MAIA-MAVEN-CANON-01` reconciliation object | **UNRESOLVED CUSTODY** — zero branch-name matches; not in either located tree |
| `HOUSE_DESTINATIONS` | **UNRESOLVED CUSTODY** — no symbol match in the located tree or working tree |

⛔ None reconstructed.

### 5a. ⚠️ Correction — `CAPABILITY_REGISTRY` was never missing

The adjudication recorded it "absent as an artifact." **That was my error, and it was a filename assumption —
the exact method the charter warned against.** The prior search looked for a file named `*capabilityRegistry*`.
The registry is at **`lib/maia/capabilities.ts`**, present on canonical and in this working tree.

A second false negative compounded it: `mcp__github__search_code` for `CAPABILITY_REGISTRY` returned
`total_count: 0` **with `incomplete_results: true`** — an unbuilt index reporting zero, read as a finding.

⭐ **R3 survives intact and is now evidenced rather than asserted** (verified in the working tree):

```text
lib/maia/capabilities.ts        153 lines, 13 declared capability ids
exported: MaiaCapability · CapabilityDefinition · CAPABILITY_REGISTRY
          getCapability() · getCapabilitiesForWorld()
consumers of the module          0
references to CAPABILITY_REGISTRY outside the file itself   0
callers of getCapability / getCapabilitiesForWorld          0
capability_available emissions                              0
```

The only `capabilityAvailable` occurrences in the repository belong to **WebAuthn biometric offer logic**
(`components/auth/UnifiedAuth.tsx:443`) — an unrelated concept sharing the noun. ⛔ Noted, not this lane's.

**NODE-05 stays OPEN at J5. No retroactive PASS.** `lib/maia/voiceNavigationBridge.ts` remains the live
transport (60 lines, window `CustomEvent`, consumed by `MaiaShell.tsx` and `voiceCommands.ts`), self-described
as temporary. The registry is declarative substrate that nothing reads.

### 5b. ⭐⭐ LF-SCOPE-01 — the ruling was made without custody of its own evidence

The adjudication ruled LF-SCOPE-01 **UNATTESTED**: *"If there is no artifact bearing that evidence, Maven
should not manufacture one by implication. Create the evidence when the actual scope work is done."*

**The scope work was done — the same day, ~3 hours earlier, at `6adbc3bb`.** It carries:

- `lib/maia/living-field/atomEligibility.ts` (86 lines) — one predicate serving all three read paths
- containment applied to the field-counts, gathering-list and encounter-context readers
- `__tests__/livingFieldScopeContainment.test.ts` (233 lines) — asserted at the wire
- `scripts/witness/lf-scope-01-containment.sql` (218 lines) — disposable-shadow behavioural witness
- a **discriminating negative control**: pre-repair predicate admits 4 rows where repaired admits 1
- `docs/programme/LF-SCOPE-01_CONTAINMENT_2026-09-17.md` (222 lines)

⚠️ **The ruling's own standard is met; only its premise was wrong.** The evidence is not manufactured by
implication — it is branch-local and was invisible to the ruling session.

⭐ **The ruling's logic is nonetheless vindicated in a way worth keeping**: the attestation is **branch-local
and unmerged**, so *canonical* still bears no LF-SCOPE-01 evidence. **Attested in custody · unattested on
canonical.** ⛔ Recommended standing change, founder's call — not taken here.

---

## 6. Keep-semantics census

⚠️ **At least 15 objects, not five.** "Keep" is the most overloaded noun in the repository.

| # | Object | Domain | Human act | Persistence | Scope | Member-facing | Desired Maven class | Collision |
|---|---|---|---|---|---|---|---|---|
| 1 | `lib/consciousness/keepIntent.ts` | Personal | expresses Keep intent in speech | none (recognizer) | personal | indirect | **KEEP/CAPTURE** | ⚠️ **yes — §7** |
| 2 | `lib/library/keepIntent.ts` | Personal Wisdom Library | maps intent → governed state | none (seam) | platform/practitioner/member | no | KEEP/CAPTURE | ⚠️ **yes — duplicate module name** |
| 3 | `app/maia/keep-capture/` | Personal | capture surface | persistent | personal | **yes** | KEEP/CAPTURE | no |
| 4 | `app/api/sovereign/keeps/` | Personal | read kept atoms (`keepsReadDoctrine`) | persistent | personal | yes | KEEP/CAPTURE | no |
| 5 | `app/api/sovereign/manuscripts/[id]/keeps/` | Work | Work-scoped keeps | persistent | Work | yes | KEEP/CAPTURE (Work-qualified) | yes — domain |
| 6 | `app/writers-studio/useManuscriptKeeps.ts` | Work | client hook | persistent | Work | yes | KEEP/CAPTURE (Work-qualified) | yes |
| 7 | `keepAVersion` (`__tests__`) | Work | preserve a **revision** | persistent | Work | yes | ⚠️ **version pin — not a member Keep** | ⚠️ **yes** |
| 8 | `app/api/psyche/portfolio/keep/` | Psyche | portfolio keep | persistent | personal | yes | KEEP/CAPTURE (Psyche-qualified) | yes |
| 9 | `lib/psyche/conversational-keep.ts` + route | Psyche | conversational keep offer | persistent | personal | yes | KEEP/CAPTURE | yes |
| 10 | `lib/psyche/keep-governor.ts` | Psyche | **governs the offer**, not the keep | persistent (posture) | personal | no | ⚠️ **offer governance** | ⚠️ **yes** |
| 11 | `components/psyche/KeepAffordance.tsx` | Psyche | the affordance | none | personal | **yes** | KEEP/CAPTURE | no |
| 12 | `lib/workbench/sources/keep.ts` | Workbench | keep as a *source* | read | unknown | no | ⚠️ retrieval adapter | yes |
| 13 | `lib/memory-keeper.ts` | infra | ⚠️ **"keeper" ≠ Keep** | — | — | no | **not a Keep** | ⚠️ **lexical only** |
| 14 | `app/wisdom-keepers/`, `wisdomKeeperService.ts` | Community | ⚠️ **a role — a person** | persistent | shared | yes | **not a Keep** | ⚠️ **lexical only** |
| 15 | `keepOpenNonPersistent.test.ts` | Personal | see §6a | none (guard) | personal | no | **OPEN-KEEP (UI act)** | ⚠️ **misread — §6a** |

⛔ No implementation object renamed. Recommendation column is advisory only.

### 6a. ⚠️ CORRECTION — `keepOpenNonPersistent` was misread, and the correction was carried into your ruling

The T1-A charter claimed this file put Continuation and preservation on one lexeme, and the founder ruling
carried that forward as *"`keepOpenNonPersistent`, where the lexeme **keep** participates in Continuation
rather than preservation."*

**Source refutes it.** The file parses as **(keep-open)(non-persistent)** — *opening the Keep panel must
write nothing* — not *(keep)(open)*. Its own header:

```text
OPEN KEEP     = UI/navigation act        = zero persistence
PREPARE KEEP  = distill for preview      = ephemeral only, zero durable write
CONFIRM KEEP  = explicit member action   = persistence permitted
```

It guards a real prior defect (`/api/capsules/from-chat-window` wrote a `reflection_capsules` row on *open*,
before the member saw anything). **It is a Keep-authority guard, and a good one.** The claim is withdrawn.

⭐ **The underlying concern was right; the evidence was wrong — and the true evidence is worse.** See §7.

---

## 7. ⭐⭐ KEEP vs CONTINUE — the collapse is REAL, LIVE, and WITNESSED

`lib/consciousness/keepIntent.ts` recognizes `keep_material` and `open_keep`. **Continuation has no
recognizer anywhere.** The author anticipated the family — `FALSE_FRIENDS` guards `'keep this door open'` —
but the guard is one entry short.

**Witness.** Type annotations mechanically stripped from the real source (no reimplementation); executed
under Node 22:

```text
kind            matched      member means              said
keep_material   keep this    KEEP (preservation)       keep this
keep_material   keep this    CONTINUE (manual §7)      keep this open          ⛔ COLLAPSE
none            null         CONTINUE (manual §7)      keep that open          ⚠️ asymmetric
keep_material   keep this    CONTINUE (manual §7)      keep this question open ⛔ COLLAPSE
none            null         CONTINUE (manual §7)      leave this open
none            null         CONTINUE (manual §7)      let's come back to this
none            null         neither (false friend)    keep this door open     ✅ guarded
none            null         neither                   keep going              ✅
```

**Classification: CONTRADICTION, not tension.**

- A member saying *"keep this question open"* — Manual §7 Continuation, verbatim — is recognized as
  **preservation**. The founder's prohibition (*"No phrase matcher may collapse them"*) is **already violated
  in the repository.**
- ⚠️ The failure is **asymmetric on a distinction meaningless to the member**: *"keep this open"* collapses,
  *"keep that open"* does not, solely because `KEEP_MATERIAL_PHRASES` contains `'keep this'` and not
  `'keep that'`. **Members cannot know which word arms the defect.**
- ⭐ **Mitigation that makes this reportable rather than urgent**: the KEEP AUTHORITY CONTRACT holds
  downstream — recognition only surfaces an affordance; **only member confirmation persists**. So today the
  member is *offered the wrong gesture*, not silently kept. The containment is real and is why this is a
  documented contradiction and not an incident.
- ⛔ **NOT REPAIRED.** Adding `'keep this open'` to `FALSE_FRIENDS` would suppress the misread without
  building CONTINUE — converting a wrong offer into silence, and foreclosing the contract T1-A must author.
  **The repair is downstream of the semantics ruling, not upstream of it.**

---

## 8. Sanctuary correction carried forward

```text
SANCTUARY
Encounter                            YES
History                              NO
Memory                               NO
Continuation                         NO
Persistent crossing from Encounter   NO — including by explicit member request
```

Invariant 6 governs and is **NOT amended**. To preserve something encountered in Sanctuary the member leaves
Sanctuary and performs a **new member act outside it**; MAIA does not carry content across the threshold.
Member Manual v1 §12 is superseded in place (original retained verbatim). Any other text stating otherwise is
superseded.

⚠️ **Open obligation surfaced by §7, named not repaired:** `keepIntent.ts` states *"knows nothing about
Sanctuary — callers own that."* That delegation is correct in design. **This lane did not audit whether every
caller enforces it.** Until audited, ⛔ do not assert Sanctuary containment of the Keep affordance as proved.

## 9. Continuity Stack — terminology correction

```text
WAS   "Four-Layer Memory Model"     ⛔ collides with canonical Four-Layer
NOW   Continuity Stack
      Encounter → History → Memory → Continuation
```

Canonical **Four-Layer = Content / Form / Meta / Frame** (`docs/canon/FOUR_LAYER_SUBSTITUTION.md`, verified)
is untouched and unreinterpreted. Terminology only. **One canonical term, one canonical referent.**

⭐ §7 gives the new name immediate work: **Continuation is the one layer of the Continuity Stack with no
recognizer and no substrate**, and it is precisely where the Keep lexeme is leaking.

## 10. Can `MAIA-MAVEN-CANON-01` be closed?

# ⛔ NO — REMAINS BLOCKED

| Condition | Standing |
|---|---|
| Reconciliation object in custody | ⛔ **UNRESOLVED** — not found on any of 1,587 heads or in either located tree |
| NODE-03/04/05 records in custody | ⛔ **UNRESOLVED** |
| `CAPABILITY_REGISTRY` custody | ✅ RESOLVED — canonical; R3 evidenced; NODE-05 stays open |
| LF-SCOPE-01 custody | ✅ RESOLVED — attested at `6adbc3bb`, **branch-local, unmerged** |
| EAA-03 P1 custody | ✅ RESOLVED — `194e3054`, **branch-local, unmerged** |
| Keep semantics reconciled | ⛔ **NO — §7 records a live CONTRADICTION** |

**Two independent blockers.** Custody is partially resolved and the Keep noun is not yet safe for
member-facing use.

⚠️ **One new item for founder adjudication:** LF-SCOPE-01's standing was ruled without custody of its
evidence (§5b). The ruling is not wrong on its own terms — canonical still bears no attestation — but
*"create the evidence when the scope work is done"* is satisfied in custody and the accurate standing is
**attested / unmerged**. ⛔ Not changed here.

---

## Standing

```text
MAVEN-CUSTODY-01                  RECORD WRITTEN
Clone completeness                ⚠️ SHALLOW — prior absence finding INVALIDATED as method
Commit custody                    ✅ BOTH RESOLVED (branch-local, unmerged, no branch tip)
CAPABILITY_REGISTRY               ✅ FOUND on canonical — prior "absent" CORRECTED (§5a)
R3 / NODE-05                      ✅ EVIDENCED · STAYS OPEN AT J5
LF-SCOPE-01                       ⚠️ ATTESTED IN CUSTODY · UNMERGED (§5b) — founder input owed
keepOpenNonPersistent claim       ⚠️ WITHDRAWN (§6a)
KEEP vs CONTINUE                  ⛔ CONTRADICTION — witnessed, live, UNREPAIRED (§7)
Sanctuary                         ABSOLUTE · UNAMENDED
Continuity Stack                  TERMINOLOGY CORRECTED
MAIA-MAVEN-CANON-01               ⛔ CANNOT CLOSE — custody + Keep semantics
T1-A                              ⛔ NOT IMPLEMENTED
Code copied between repos         NONE
Keep objects renamed              NONE
Continuation substrate            NONE CREATED
Missing artifacts reconstructed   NONE
Production                        UNTOUCHED
```

**STOP. Returned for founder adjudication.**
