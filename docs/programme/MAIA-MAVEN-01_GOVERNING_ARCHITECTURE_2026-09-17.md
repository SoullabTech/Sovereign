# MAIA-MAVEN-01 — GOVERNING ARCHITECTURE

**Status:** CANDIDATE canonical architectural authority. Not ratified canon.
**Lane:** `MAIA-MAVEN-CANON-01` — documentation and constitutional reconciliation only.
**Implementation:** ⛔ NOT AUTHORIZED.
**Date:** 2026-09-17
**Origin:** Architecture developed and founder-ratified in founder deliberation outside the
repository, handed to this lane for reconciliation with existing repository law.

---

## 0. What this record is, and is not

This record **registers** a settled architecture so that future development cannot lose,
reinterpret, or duplicate it. It does not authorize building any of it.

⛔ This record creates no schema, migration, API, capability execution, memory machinery,
Presence Frame, Continuation Ledger, Journal CAPTURE, reminder, calendar integration, tool
calling, route, or `/maia` visual change.

⭐ **Where an older repository law is the ancestor of a Maven law, this record cites the
ancestor and defers to it.** Where a Maven law is genuinely new synthesis with no repository
ancestor, this record says so plainly. It does not claim prior standing it did not earn.

Reconciliation findings, including the classification of every law below, are in
`MAIA-MAVEN-CANON-01_CANONICALIZATION_REPORT_2026-09-17.md`. **That report is part of this
record's authority**: a law classified TENSION there is not settled merely because it appears
here.

---

## 1. Core proposition

> **MAIA is one relational presence across many worlds, able to orient, retrieve, continue,
> and act through governed capabilities while leaving authorship, authority, and the right to
> begin again with the member.**

---

## 2. Governing dimensions

Every capability, surface, and crossing answers these seven:

| Dimension | Question |
|---|---|
| **Capability** | What can MAIA do here? |
| **Context** | Where is this happening, and what does that context admit? |
| **Continuity** | What carries forward, and by whose standing? |
| **Intent** | What did the member actually ask for? |
| **Authority** | Who authorizes this, and is that authority proven rather than assumed? |
| **Handoff** | What crosses a boundary, and what is accounted for? |
| **Orientation** | Does the member know where they are and what is in play? |

---

## 3. Capability classes

`CONVERSE` · `ORIENT` · `NAVIGATE` · `READ` · `CONTINUE` · `CAPTURE` · `REMIND` · `MODIFY` ·
`CROSS` · `SHARE` · `EXTERNAL_ACT` · `DELETE` · `START_FRESH`

⚠️ **These classes are a classification vocabulary, not an implemented type.** The repository's
present capability surface is `lib/maia/capabilities.ts` (`MaiaCapability`, 13 ids), which is a
**declared registry with zero consumers** — see the report, finding F-1. This record does not
authorize reconciling the two.

---

## 4. Core architectural laws

Each law states its repository ancestry. **A law with a mature ancestor is downstream of that
ancestor and does not supersede it.**

### 4.1 Domain sovereignty

> MAIA orchestrates; canonical domains retain authority.

**Ancestors (repository).** `lib/navigation/houseDestinations.ts` — "the single authoritative
definition of every place the House can open"; `app/api/sovereign/keeps/route.ts` — "This route
ORDERS but never SELECTS"; `app/api/sovereign/studio/history/route.ts` doctrine — "never reads
current state — every act is an immutable record".
**Classification:** REFINEMENT. The law is new as a *general* statement; each domain already
enforces it locally.

### 4.2 Context sovereignty

> Context may resolve meaning; it does not manufacture permission.

**Ancestor (repository, MORE MATURE THAN THIS LAW).** `lib/disclosure/disclosureBoundary.ts`:
*"Resolve authority first. Prove it exists. Account for the disclosure. Then let the context
cross."* That module also records why: `REQUEST-ORDER-01` refuted the assumption that a consent
row exists before context is assembled, replacing "usually true" with an ordering that cannot
be skipped because each step is the previous step's returned authority.
**Classification:** CONSISTENT. ⭐ **Maven defers to `disclosureBoundary.ts`.** Where the two
differ in precision, the existing seam governs.

### 4.3 Continuity sovereignty

> Unfinishedness cannot be diagnosed.

**Ancestor.** `docs/canon/LONGITUDINAL_MEMORY_CATEGORY_GRADIENT.md` core invariant: *"MAIA may
remember in service of continuity, but may not form identity around a member faster than the
member participates in that formation."* Also the gestalt non-capture law
(`docs/architecture/MAIA_TEMPORAL_RELATIONAL_MEMORY_GESTALT_LAW_2026-09-16.md`).
**Classification:** REFINEMENT. The gradient governs *memory formation*; this law extends the
same discipline to *continuation* — an axis the gradient does not address. That extension is new.

### 4.4 Intent sovereignty

> Natural language may remain broad; execution becomes precise.

**Ancestor:** none found.
**Classification:** NEW SYNTHESIS. The repository has no intent-resolution layer. The nearest
object is the `voicePhrases` array in `lib/maia/capabilities.ts`, which is literal phrase
matching in an unwired registry, and `lib/maia/voiceNavigationBridge.ts`, which self-describes
as *"a temporary transport layer… replaced by an internal event bus when the capability system
matures."*

### 4.5 Crossing sovereignty

> Relationship may continue across contexts; content crosses only with authority.

**Ancestor (repository, SUBSTANTIALLY MORE MATURE THAN THIS LAW).**
`lib/writers-studio/focusCrossing.ts` — C1 boundary singularity (*"exactly once — not 'at least
once'"*), C2 server-side read after `may_cross` (*"If the client supplied the passage text, the
boundary would be decorative"*), and the amended definition of what counts as a crossing
(*"The crossing occurs when an ADMITTED producer containing the authorized Work is handed into
the RESPONSE-PRODUCING cognition path"* — *"the receipt is evidence of disclosure, not of
successful inference"*). Plus `lib/disclosure/contextDisclosureReceipt.ts`.
**Classification:** CONSISTENT. ⭐⭐ **Maven's crossing law is the weaker statement and must
never be cited in preference to the Focus crossing seam.** Any future cross-context capability
inherits C1 and C2 rather than restating them.

### 4.6 Fresh-start sovereignty

> The member retains the right not to foreground prior continuity.

**Ancestor:** partial — `lib/anchor/surfacePreference.ts` (member governs whether an anchor may
surface); `return_preference` on memory atoms.
**Classification:** ⚠️ **TENSION — founder decision required.** `docs/canon/MAIA_MEMORY_CANON_v1.0.md`
§II declares a **non-negotiable base chain** (recent turns + episodic + semantic + relational +
developmental) that *"must be available and queried every time a recognized member speaks."*
A member instruction to start fresh appears to countermand a non-negotiable.
The proposed resolving distinction — **recorded as a proposal, not a ruling** — is that the base
chain governs *retrieval availability* while START_FRESH governs *foregrounding*, so nothing is
un-queried and nothing is forced into the present. See report finding T-1. ⛔ No implementation
may rely on either reading until ruled.

### 4.7 Evidence sovereignty

> Capability is earned by evidence, not possibility.

**Ancestors.** `lib/navigation/houseDispositions.ts` — `intentionally_withheld` is documented as
*"A ruling, not an omission"*, with a test-enforced invariant that disposition values describe
presentation state only; `lib/maia/memorySelectionPolicy.ts` — `MEMORY_SELECTION_POLICY_VERSION`,
*"Changing the policy is a governed act… never a tuning knob"*; `docs/canon/CLAIM_STATE_AUTHORITY.md`
and `docs/canon/MARKETING_CLAIM_DISCIPLINE.md` — the ratified **Live / Designed / Vision** triple.
**Classification:** REFINEMENT, ⚠️ with a vocabulary hazard. See §6 and report finding T-2.

---

## 5. Sacred `/maia` preservation law

> **The existing `/maia` look and feel is permanent.**

The sacred core may receive maintenance only for **accessibility**, **performance**, **browser
compatibility**, and **genuine bug repair**.

Additive fields may develop *around* it: navigation, continuity, thresholds, provenance,
contextual layers, peripheral structures.

The **central composition, atmosphere, visual geometry, and perceptual gestalt are protected.**

**Design law:** *Preserve the center; evolve the field around it.*

**Aesthetic law:** *Dynamic presentation arises from relationship, context, timing, and
meaningful change — not New Age ornament or decorative animation.*

**Ancestors.** `components/maia/MaiaShell.tsx` carries founder rulings in load-bearing comments:
the left rail was retired in favour of the House as *"THE doorway… the only permanent
navigation"*, with the explicit instruction *"Do not reintroduce a permanent multi-icon rail
here"*; arrival mode recedes chrome for a newcomer while *"Returning members render with
arrivalMode=false — their surface is unchanged."* Aesthetic ancestry:
`docs/canon/TRANSPARENT_ENCHANTMENT.md`.

⚠️ **Enforcement gap, named not repaired.** These rulings live in prose comments. No test
asserts the central geometry, and the drift guards that do exist
(`lib/navigation/__tests__/houseNavDrift.test.ts`) protect *navigation agreement*, not visual
composition. This is the same defect class the repository already names against itself in
`lib/navigation/houseDispositions.ts`: *"⚠️ NOTHING IN THIS FILE ENFORCES THIS. It is a
declaration of intent that a future authorization layer must honour."* ⛔ Closing the gap is not
authorized by this lane.

---

## 6. Maven evidence model

Capability maturity:

`UNKNOWN → DESIGNED → BOUNDED → LIVE`

with `WITHHELD`, and `DEFERRED` where appropriate.

⚠️ **This is a second maturity vocabulary.** The repository already ratifies **Live / Designed /
Vision** (`MARKETING_CLAIM_DISCIPLINE.md`, `CLAIM_STATE_AUTHORITY.md`) for outward claims, and
the founder's own six-category artifact typology (CLAUDE.md) for internal state. Maven's
`BOUNDED` and `WITHHELD` have no equivalent in the ratified triple; `Vision` has no equivalent
here. ⛔ **Until reconciled by founder ruling, the Maven ladder governs internal capability
standing only and confers no outward claim state.** An outward claim still answers to
`MARKETING_CLAIM_DISCIPLINE.md`. See report finding T-2.

### Per-capability evidence obligations

Every capability eventually answers: human purpose · canonical authority · operation class ·
allowed contexts · positive intents · negative intents · identity · entitlement · scope ·
confirmation · provenance · reversibility · failure behavior · negative control · runtime
witness · human witness · known limits · standing.

### The repeatable JARVIS flow

```text
J0 — human need
J1 — repository census
J2 — authority reconciliation
J3 — experience contract
J4 — bounded build
J5 — technical evidence
J6 — founder witness
J7 — beta witness
J8 — claim ratification
J9 — drift guard
```

⭐ The distinction between **J5 technical evidence** and **J6 founder witness** is the one this
repository has most often needed and most often skipped. A green test suite is J5. It is not J6.

---

## 7. Standing

- **MAIA-MAVEN-01:** CANDIDATE canonical authority. No CONTRADICTION found against existing
  repository law, so it may stand as candidate.
- **Open founder decisions:** T-1 (fresh-start vs non-negotiable base chain) · T-2 (two maturity
  vocabularies) · T-3 (capability registry reconciliation) — see the report.
- **Implementation:** ⛔ NOT AUTHORIZED.
- **Production:** UNTOUCHED.
