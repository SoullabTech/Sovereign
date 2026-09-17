# SPM · D9-C — REPRESENTATION DISCRIMINATOR

**One question. One specimen. ⛔ Not a census. ⛔ Not architecture. ⛔ No repair.**

---

## 1 · BINDING

| | |
|---|---|
| Branch | `claude/festive-sagan-apvfs5` |
| HEAD at execution | `4b4b9b55dc7a94a33007c2f2d31188db3d56bf47` |
| Tree | clean |
| Frozen inputs | D9-A `b16d2eea` · D9-B `4b4b9b55` — ⛔ neither modified |
| Drift vs census SHA `8b80ec21` over `lib app database components` | **EMPTY** |
| Instrumentation | ⛔ **none created** · static trace only · no database read |

**The question, as put:**

> On an actual representation path, can the same material with unchanged provenance and present
> standing be permitted for one purpose/audience and refused for another solely because the
> crossing lacks its own warrant?

Pre-registered outcomes **A** (independent representation warrant observed) · **B**
(representation follows standing/scope) · **C** (no executable discriminator exists).

---

## 2 · CANDIDATES CONSIDERED AND REJECTED

⛔ None was assumed suitable. Each was rejected for a stated reason, before the surviving one was
examined.

| Candidate | Rejected because |
|---|---|
| `practitionerProjection` | ⛔ **No authorization object exists at all.** The material is structurally unreachable — no `relationship_id` column to reach it by, no denylist, no grantable permission. Nothing *varies*, so nothing discriminates. Pure scope → Model T |
| `crossing_must_be_false` | ⛔ `CHECK (crossing_allowed = FALSE)` is unconditional. A warrant that can never be granted is not a warrant under test |
| Writer's Studio adopted / drafted first-person material | ⛔ The crossing is a **mutation** of the Work (D9-B B2). Fails the instruction's "not mutation" |
| `ask_authorization_acts` (B4) | ⛔ The crossing is **into cognition** — an input. Already adjudicated; re-using it would beg the question |
| `context_disclosure_receipts` | ⛔ Collapsed in D9-B B3 (replay/idempotency). Also an input crossing |
| `epistemicFraming()` | ⛔ Governs *how strongly* a claim is worded, not *whether* a crossing may occur. CONVENTION, and it varies with **standing**, which is the thing that must be held constant |
| `return_preference` · `surface_preference` · `valid_to` | ⛔ Authorization lives **on the material** as a column. Varying it varies the material's state → Model T by construction |
| `ROOM_POLICIES.memberAboutAllowed` / `fieldCompositionAllowed` | ⛔ Static per-room flags, not grantable or revocable. `relational_navigation` is the only room with `memberAboutAllowed: false`, and it does not route through the response-producing canonical path. Scope, not warrant |
| `refuseBorrowedFirstPerson` | ⛔ Shadow-only (K2, unchanged) |

⭐ **The rejections are themselves a result.** On output paths the organism almost always places
authorization **on the material** (a column) or **nowhere** (structural unreachability). Both are
Model T's shape. Exactly one seam was found where the authorization is a **separate object indexed
by audience**.

---

## 3 · THE SPECIMEN

**Circles sharing.** `lib/circles/sharingService.ts` · `lib/circles/consentService.ts` ·
`shared_artifacts` + `circle_memberships` (`20260213000004_circles_commons.sql`) ·
routes `/api/circles/shared`, `/api/circles/shared/[sharedId]/revoke`,
`/api/circles/[circleId]/feed`, `/api/circles/[circleId]/consent`.

This is a **representation** path in the strict sense required: member material rendered to
**other human beings**. It is not retrieval, not mutation, not replay.

### 3.1 · The three observations

**(i) REFUSAL — the warrant is consulted before any representation can exist.**

```
shareArtifact():
  const { membership } = await getCircleWithMembership(circleId, memberId);
  if (membership.consent_mode !== 'manual') throw new Error('CONSENT_REQUIRED');
```

`consent_mode` lives on `circle_memberships` — **(member × circle)**. ⛔ It is not a property of
the material, and the material is not read at all before the refusal.

**(ii) AUDIENCE-INDEXED — the same member holds a different warrant per circle.**

`consent_mode` is per membership row. A member may be `'manual'` in circle X and `'not_now'` in
circle Y **simultaneously**, with byte-identical material, identical provenance, identical present
standing. Representation is permitted into X and refused into Y.

**(iii) ⭐ CASCADE — the decisive observation. Withdrawal stops existing representations while
nothing about the material changes.**

```
setConsent(): if (consentMode !== 'manual')
  UPDATE shared_artifacts SET revoked_at = NOW()
   WHERE circle_id = $1 AND shared_by = $2 AND revoked_at IS NULL
```

and `listFeed` reads `WHERE sa.circle_id = $1 AND sa.revoked_at IS NULL`.

After the cascade: the artifact row still exists · its `shared_title` and `shared_summary` are
**unchanged, character for character** · `artifact_ref` unchanged · the source item **untouched**
(`revokeArtifact`: *"Sets revoked_at — does NOT delete the original source item"*; the column
comment: *"Original source item untouched"*). **Only the member × audience authorization changed.
Representation stopped.**

### 3.2 · The controlled comparison, as required

```
claim               artifact_ref                     CONSTANT
provenance          source row never written         CONSTANT
present standing    source status/valid_to untouched CONSTANT
wording             shared_title / shared_summary    CONSTANT across (iii)
─────────────────────────────────────────────────────────────────
audience A   circle with consent_mode = 'manual'   → representation PERMITTED
audience B   circle with consent_mode = 'not_now'  → representation REFUSED  (CONSENT_REQUIRED)
audience A′  same circle after setConsent('not_now') → representation CEASES (cascade)
```

⚠️ **One clause of the criterion fails on the *share* half and holds on the *revoke* half.**
`shared_title`/`shared_summary` are supplied by the caller at share time, so the **creation** of a
share does not hold wording constant — a new authored object appears. Observation (iii) is
therefore the load-bearing one: there, wording, material, provenance and standing are all fixed on
a row that already exists, and representation still stops.

---

## 4 · MODEL T, RUN AT FULL STRENGTH

Three rebuttals, each stated as an opponent would and each answered.

**T1 — *"`shared_artifacts` is a copy. Representation follows where the bytes are. No warrant."***
⛔ **Refuted by (iii).** After the cascade the bytes are exactly where they were. Representation
stops anyway.

**T2 — *"`revoked_at` is the copy's own material validity — Model T's second concept, `valid_to`
under another name."***
⚠️ **Admitted for `revokeArtifact`**, which is per-artifact and genuinely a validity flip.
⛔ **Refused for (i) and (iii).** Both are decided on `circle_memberships.consent_mode`, which is
**not a property of any material**. In (i) no artifact exists yet, so there is no validity to
consult. In (iii) the flip is a *consequence* of a decision taken on a different object. To absorb
these, Model T must index state by **(member × audience)** — which is the disputed axis renamed.
Per D9-B §3.3 that is recorded as **capitulation, not redundancy.**

**T3 — *"`consent_mode` is ordinary access control."***
⛔ Ordinary reader-side access control does not (a) get granted and revoked **by the subject about
their own material**, (b) index by audience rather than by reader identity, or (c) retroactively
**stop representations already published**. `consent_mode` does all three.

**⚠️ What genuinely weakens the specimen, recorded rather than argued away:**

* `consent_mode TEXT NOT NULL DEFAULT 'manual'` — the warrant is **granted by default**, opt-out
  rather than opt-in. That supports *separable and revocable*; it does **not** support *must be
  affirmatively granted*.
* The vocabulary is two-valued (`manual | not_now`). It is a switch, not a rich warrant.
* The cascade's mechanism is a bulk validity flip, so Model T can describe the *implementation*
  even where it cannot describe the *decision*.

---

## 5 · REACHABILITY — stated in the ruling, not in a footnote

`lib/circles/circleAccess.ts` gates every Circle API route on the **founder allowlist**, and
fails closed: *"with FOUNDER_MEMBER_IDS unset nobody passes."* `CIRCLE_ACCESS_MEMBER_IDS` — the
cohort authority that would admit members — appears **only inside a comment**, marked `(future)`.

So the specimen is **executable, routed, and not member-reachable at this SHA.**

| | X10 `refuseBorrowedFirstPerson` | **D9-C Circles** | B4 Ask act |
|---|---|---|---|
| Executable | ✅ | ✅ | ✅ |
| Routed / response-producing | ❌ shadow, unawaited | ✅ four routes | ✅ |
| Reachable by an ordinary member | ❌ | ❌ founder allowlist | ✅ |

⛔ **The ruling below is qualified by this row and must not be quoted without it.**

---

## 6 · ONE FINDING THE ATTACK TURNED UP · ⛔ NOT REPAIRED

`shared_text` is **written and never read.** It appears in exactly two places repository-wide: the
`INSERT` in `shareArtifact` and the field on `SharedArtifactRow`. `listFeed` selects
`shared_title, shared_summary` and **not** `shared_text`. No other reader exists.

So `content_mode = 'full_text'` — which `shareArtifact` validates and refuses without a body
(`FULL_TEXT_REQUIRES_TEXT`) — stores content that **no representation path returns**.

**This is a FALSE REFUSAL candidate against positive control #11** (*member authorizes a crossing
for purpose P / audience A → that crossing succeeds*): for `full_text`, the member authorizes and
the crossing does not occur.

⚠️ **Classified STRUCTURAL POSSIBILITY, not a finding:** the surface is founder-gated, so no member
has been denied anything, and a reader may exist outside the paths scanned. ⛔ Not repaired; no
reader proposed.

---

## 7 · RULING

> # **OUTCOME A — INDEPENDENT REPRESENTATION WARRANT OBSERVED**
> ## qualified: executable and routed · ⛔ not member-reachable at this SHA

The question as put is answered **yes**. On a real representation path — member material rendered
to other human beings — the same material, at unchanged provenance and unchanged present standing
and with unchanged wording, is represented to one audience and refused to another, and the only
thing that differs is an authorization object that lives on the **membership**, not on the
material, is indexed by **audience**, and **retroactively withdraws representations already made**.

Outcome **B** is excluded by observation (iii): standing and scope are both unchanged across the
cascade, and representation stops. Outcome **C** is excluded because the discriminator exists and
did not have to be manufactured.

### 7.1 · ⛔ What outcome A does NOT license

The founder's list of unproven cases is **unchanged by this result**, and D9-C proves none of them:

| Case | Status after D9-C |
|---|---|
| MAIA speaking about the member, to the member | ⛔ **STILL UNEVIDENCED** |
| MAIA characterizing the member | ⛔ **STILL UNEVIDENCED** |
| first-person representation | ⛔ **STILL UNEVIDENCED** (K2 unchanged) |
| practitioner-facing representation | ⛔ scope, not warrant (§2) |
| external-human representation | ⛔ no seam found |

⭐ **The specimen is a member publishing their own artifact to other members.** MAIA is not the
speaker. **The arrow D9-C was opened to prevent — *one purpose-bound capability exists → all human
representation requires that architecture* — is still not earned.** What is now earned is the
narrower arrow: *representation crossings CAN require their own warrant, and at least one live seam
does.*

### 7.2 · The surviving claim, restated at its exact size

> **Some crossings — including at least one genuine representation crossing to a human audience —
> require authority that is not reducible to the standing of the material being crossed.**

⛔ Not: *every representation of a person requires an independent purpose-bound warrant.*

---

## 8 · THE PHILOSOPHICAL CORRECTION, PRESERVED

Carried forward from D9-B B10, and D9-C does not disturb it:

```
EPISTEMIC STANDING          CROSSING WARRANT
"How strongly may MAIA      "May MAIA use this here,
 claim this?"                now, for this purpose?"
```

`epistemicFraming()` — *"Proportions authority to the quality of the knowledge"* — is the organism
deliberately letting epistemic standing govern **how strongly MAIA speaks**. That is not a defect
and it is not a counterexample to warrant. It answers a different question.

⛔ The stronger form — *greater epistemic certainty should never affect representation* — remains
**false of the organism**, and D9-C provides no reason to revive it.

D9-C's addition: **sometimes the second question is asked at the representation boundary, and the
answer is not derivable from the first.**

---

## 9 · WHAT WOULD OVERTURN THIS

1. **Evidence that `consent_mode` is consulted as material state** — e.g. a governed reading in
   which it is understood as a property of the artifact rather than of the membership. Would move
   the specimen to Model T.
2. **A demonstration that the cascade is incidental** — that revoking on consent change is
   bookkeeping rather than authority withdrawal, with the record treating a change to it as
   non-constitutional.
3. **Evidence the Circle routes are unreachable even by founders**, or that the surface is retired.
   An unreachable refusal witnesses less than a reachable one; §5 already discounts it, and this
   would discount it further.
4. **A `shared_text` reader** — would close §6 and remove the false-refusal candidate.

**What would strengthen it:** `CIRCLE_ACCESS_MEMBER_IDS` being constituted, making the specimen
member-reachable and lifting the §5 qualifier.

**What is still needed before D9 could claim the general representation boundary:** a specimen in
which **MAIA is the speaker** and the subject is the member — the row that is still empty in §7.1.

---

## 10 · STANDING

```
D9-C                    ✅ COMPLETE — one question, one specimen
OUTCOME                 ⭐ A — INDEPENDENT REPRESENTATION WARRANT OBSERVED
                        ⚠️ QUALIFIED — executable and routed · founder-gated · not member-reachable
Outcome B               ❌ excluded by the cascade
Outcome C               ❌ excluded — a discriminator exists; none was manufactured
MAIA-AS-SPEAKER CASE    ⛔ STILL UNEVIDENCED — the general boundary is NOT earned
D9-A                    ⛔ FROZEN, unmodified
D9-B                    ⛔ FROZEN, unmodified — including the B3 record
NEW FINDING             shared_text written, never read — STRUCTURAL POSSIBILITY, ⛔ unrepaired
FALSE AUTHORIZATION     0 new
FALSE REFUSAL           0 confirmed · 1 structural candidate (§6)
F5                      ⛔ HOLD
SPM                     ⛔ CLOSED
D9 CLOSURE              ⛔ NOT TAKEN — founder act
REPAIR                  ⛔ NOT AUTHORIZED
INSTRUMENTATION         ⛔ NONE CREATED
PRODUCTION              ⛔ UNTOUCHED — no database read, no runtime observation
SOURCE                  ⛔ UNCHANGED
```

> *The organism keeps authorization on the material almost everywhere it speaks, and on the
> relationship in the one place a person publishes to other people. Where it is on the
> relationship, taking it back stops the speech and leaves the record standing.
> That is a representation warrant. It is one seam, and no member can reach it yet.*

**STOP.**
