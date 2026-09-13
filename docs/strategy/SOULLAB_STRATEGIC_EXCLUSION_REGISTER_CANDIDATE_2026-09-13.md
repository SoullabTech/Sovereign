# Soullab Strategic Exclusion Register — CANDIDATE (r2)

```text
STATUS      CANDIDATE. 6 entries adjudicated (2026-09-13). 24 remain unadjudicated.
RULED BY    founder, 2026-09-13 (opening): read-only reconstruction, not founder-from-memory
            composition; every entry CANDIDATE until adjudicated; do not draft the kernel.
            founder, 2026-09-13 (r2): three corrections, six adjudications, and the LEVEL
            discriminator. "Strategic memory is not the same thing as decision memory."
METHOD      Jarvis reconstruction from existing rulings. No new research. No external sweep.
NOT A LANE  Strategic memory, not a programme lane. No build, no schema, no deploy.
HANDOFF     UARE-01 exposed the question, does not own the answer, and stops here.
SEQUENCE    This register → adjudication → Phase 1 census completes → kernel drafted from the
            STRATEGIC level only → external challenge last. Market research challenges the
            strategy; it does not generate it.
```

---

## 0 · Corrections to r1 — recorded, not deleted

Three errors in the first reconstruction, found by the founder. Each is corrected in place below
and preserved here, because a register that quietly edits its own findings cannot be trusted to
report on anyone else's.

### C1 · X-04 age was wrong
r1 said the local-first development decision was *"nineteen months old."* It is dated 2026-02-11;
today is 2026-09-13. **Seven months.** The review argument may still hold; the age argument was
false and is withdrawn.

### C2 · F3 was false, and was contradicted by this document's own entries
r1's F3 asserted that *"one entry has a fully recovered reopen condition."* The register as
written contains **18 reopen conditions marked [R] and 6 marked [J]** — verifiable by counting the
field markers in the file it appeared in.

**How the error happened, because the mechanism matters more than the miscount:** F3 was authored
from the impression left by the corpus sweep — explicit "reopen" language is rare in the source
rulings — rather than from the entries Jarvis had just finished writing. The finding was composed
*alongside* the evidence instead of *from* it.

That is precisely the failure this register exists to guard against, committed by the register
itself on its first pass. **Rule adopted: a finding must be derived from the entries and must
name the count it rests on.** Every finding below now does.

### C3 · F2 overstated X-16 and X-21
r1 said X-16 and X-21 sit *"exactly"* where the observation-phase freeze sat before it hardened.
They do not. The old freeze hardened **without enumerated exits**. X-16 has them, written into the
spec on the same day the freeze was declared:

> Four conditions — *stable evaluation · closed learning loops · routing coherence · settled
> memory topology* — then *"only by Kelly's explicit declaration. Engineering pressure does not
> lift the freeze."* Plus sequencing: *"Episodic ships first."*
> — `docs/specs/COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C

**Corrected finding:** the risk is **stale reopen criteria**, not missing ones. Criteria written
in May, never revisited, against a system that has moved substantially since. A condition nobody
re-reads decays into a condition nobody can satisfy — a slower path to the same hardening, but a
different repair: *review the criteria*, not *write some*.

---

## 1 · The three memories

The r1 sweep's real yield was not 28 entries. It was the discovery that Soullab needs three
memories and has been trying to keep them in one place.

```text
CONSTITUTIONAL MEMORY     What we will not become.
                          REFUSED. Reopens only through constitutional amendment.

STRATEGIC MEMORY          Viable futures we deliberately chose among.
                          CHOSEN AGAINST · DEFERRED · UNPROVEN.
                          ← the kernel is derived from this layer, and only this layer

OPERATIONAL MEMORY        How we decided to implement or run things for now.
                          Architecture decisions · incidents · tooling · technical debt.
```

Every entry therefore carries a **LEVEL** as well as a CLASS. Without it the eventual kernel
inherits implementation history and becomes *an autobiography of the repository instead of a
statement of choice*.

### The admission test (founder, 2026-09-13)

> **Would reversing this choice materially change Soullab's identity, market position, human
> promise, sovereignty posture, or allocation of scarce organizational attention?**

If no, it is operating memory, not strategic memory.

Corollary adopted with F3 below: **if no meaningful tradeoff exists, the item probably is not
strategic enough for this register.**

---

## 2 · Field provenance

| Marking | Meaning |
|---|---|
| **[R] RECOVERED** | Quoted or closely paraphrased from a dated ruling. |
| **[J] JARVIS-PROPOSED** | Not in the record. Requires adjudication before it carries weight. |
| **[F] FOUNDER-RULED** | Adjudicated 2026-09-13. Carries standing. |

`TRADEOFF` remains mostly **[J]**. `REOPEN CONDITION` is mostly **[R]** — see C2.

---

## 3 · Adjudicated entries (6)

### X-01A · Outsourced custody of member data, memory, or canonical cognition
- **LEVEL** [F] CONSTITUTIONAL · **CLASS** [F] REFUSED
- **CHOICE** [R] Member data, memory and canonical cognition run on infrastructure Soullab controls.
- **ALTERNATIVE** [R] Managed hosting or managed databases holding member material.
- **WHY** [R] *"No third party sits between users and their data. No jurisdiction concerns — we control the location. Complete air-gap capability if needed."*
- **SOURCE** [R] `CLAUDE.md` §Non-negotiables, §Infrastructure.
- **TRADEOFF** [J] Full ops burden in-house: deploy-lane locks, provenance verification, no managed failover.
- **REOPEN CONDITION** [F] Constitutional amendment only.
- **RULING** [F] *"Sovereign custody is constitutional."*

### X-01B · Managed infrastructure for non-authoritative, non-member-data functions
- **LEVEL** [F] STRATEGIC · **CLASS** [F] CHOSEN AGAINST FOR NOW (founder also offered UNDECIDED)
- **CHOICE** [F] Self-host these too, for now.
- **ALTERNATIVE** [F] A CDN or managed service for public, non-member-data assets.
- **WHY** [F] *"A CDN serving a public logo is not morally equivalent to putting Anamnesis into somebody else's database. Don't let 'self-hosted' become topology fundamentalism."*
- **SOURCE** [F] Founder ruling 2026-09-13, splitting r1's X-01.
- **TRADEOFF** [J] Public-surface latency, resilience and bandwidth costs carried by one box behind a residential forward.
- **REOPEN CONDITION** [J] Any case where the asset is demonstrably non-authoritative and carries no member data. **The question appears never to have been asked separately — which is why r1 could not classify it.**

### X-04 · Local-first development
- **LEVEL** [F] **OPERATIONAL** · **CLASS** [R] CHOSEN AGAINST (reversible)
- **RULING** [F] **STRIKE from the strategic register; preserve as an operating decision.** *"Whether tomorrow's coding is done with Qwen, Claude, a stronger local model, or some later model does not substantially answer: what is Soullab choosing to become?"*
- **DISPOSITION** [F] Stays in `docs/decision-log.md`. Reviewed periodically. **Does not feed the kernel.**
- **SOURCE** [R] `docs/decision-log.md`, 2026-02-11 — *"Reversible: Yes"*, *"Cloud is metered, not abandoned."*
- **NOTE** [F] Per C1, seven months old, not nineteen.

### X-13 · Typecheck no-regression baseline
- **LEVEL** [F] **OPERATIONAL** · **CLASS** [F] not a strategic exclusion — *"a transitional quality-control mechanism"*
- **RULING** [F] **STRIKE from the strategic register; move to operational debt/governance.** *"The clean tree remains an eventual destination. It was never really 'chosen against.'"*
- **CORRECTION to r1** [F] The gate is stronger than r1 described. It does not compare totals. Each diagnostic is keyed on **`file | TS code | normalized message`** with a per-key occurrence count; line numbers are deliberately excluded from identity so they shift without masking regressions. It fails on a new key, an increased count, or lost compilation coverage. **230 does not buy nine free errors.** *(Verified in `scripts/check-typehealth-baseline.js`.)*
- **REAL ISSUE** [F] A ratchet gap: a fixed diagnostic remains in the baseline until a governed re-baseline, so an old fixed error could return and still match its baseline key.
- **OPERATIONAL RULING** [F] *"When verified work reduces the diagnostic set, ratchet the baseline downward at suitable release/phase boundaries. Baseline increases or coverage narrowing require explicit justification."*

### X-16 · The full memory field
- **LEVEL** [F] STRATEGIC · **CLASS** [F] **DEFERRED — accepted. Not doctrine.**
- **CHOICE** [R] Arena-by-arena activation, each with its own Phase 2-equivalent spec.
- **ALTERNATIVE** [R] Wiring the coherence/field layer now.
- **WHY** [R] *"This document does not authorize wiring. The freeze is the default state."*
- **SOURCE** [R] `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.C; `MEMORY_EXPANSION_PLAN_2026-05-24.md` §5.
- **TRADEOFF** [J] The capability most responsible for MAIA being more than a chatbot stays partly inert.
- **REOPEN CONDITION** [F] *Restated exactly:* eligible for reconsideration only after **(1)** the four §0.C conditions hold — stable evaluation, closed learning loops, routing coherence, settled memory topology; **(2)** Episodic has shipped first; and **(3)** the founder explicitly lifts the freeze. *"Engineering pressure does not lift the freeze."*
- **⚠ STANDING RULE** [F]
  ```text
  reopen condition satisfied
          ≠
  feature authorized
  ```
  Satisfying the condition means **the question may be asked again** — nothing more.
- **REVIEW FLAG** [J] Per C3, these criteria were written 2026-05-24 and have not been revisited. Staleness, not absence, is the live risk.

### X-21A · Member-facing field / coherence surfaces
- **LEVEL** [F] STRATEGIC · **CLASS** [F] DEFERRED
- **CHOICE** [R] Withhold every member-facing "field state," "coherence," "RFI" or "UFI" surface.
- **WHY** [R] *"Until Episodic ships and stabilizes, resonant-field / coherence talk remains mostly metaphorical architecture language."*
- **SOURCE** [R] `CLAUDE.md` §Still held under freeze.
- **TRADEOFF** [J] Soullab's most distinctive vocabulary cannot be surfaced.
- **REOPEN CONDITION** [R] Episodic ships and stabilizes, providing a measurable substrate.

### X-21B · Claims of RFI / UFI / field intelligence
- **LEVEL** [F] STRATEGIC · **CLASS** [F] UNPROVEN
- **CHOICE** [F] Even once a surface becomes technically possible, the ontological claim stays evidence-gated.
- **WHY** [R] **This distinction was already contracted in May and r1 collapsed it.** §0.D *Activation altitude clause*: *"activation must claim a bounded continuity layer, not proof of a resonant field… a boundary that holds even after activation — a sharper version of the freeze, not a weakening of it."*

  | CAN claim | CANNOT claim |
  |---|---|
  | "MAIA has continuity signals from prior interactions." | "The resonant field is alive." |
  | "Coherence readings inform routing." | "The field is forming." |
  | "Field state may modulate elemental tone lightly." | "We have proven RFI." |
  | "The field layer is observational." | "MAIA possesses field intelligence." |
- **SOURCE** [R] `COHERENCE_FIELD_WIRE_UP_SPEC_2026-05-24.md` §0.D.
- **REOPEN CONDITION** [R] Evidence, via `CLAIM_LADDER` rung ascent — **not** by Episodic shipping.
- **RULING** [F] *"That is cleaner than allowing 'Episodic shipped' to sound as though it licenses both product and ontology."*

---

## 4 · Unadjudicated — STRATEGIC level (kernel-producing set)

Entries r1 recovered, now levelled. **LEVEL is [J] unless marked.** Full field records are in
git history at `1337d51a`; abbreviated here to keep the strategic set readable.

| # | Choice | Alternative chosen against | Class | Source |
|---|---|---|---|---|
| **X-03** | Provider replaceability — *"no provider is load-bearing for who MAIA is"* | OpenAI in the production runtime | CHOSEN AGAINST (REFUSED in-prod, lab-gated otherwise) | `PROVIDER_GOVERNANCE.md`, canon 2026-07-07 |
| **X-05** | Circles scale by multiplication, not enlargement | Enlarging a single relational field | CHOSEN AGAINST | FR-10, 2026-09-06 |
| **X-06** | Build the FR-02 Commons fresh | Reuse `community_*` — *"would import a status economy on day one"* | CHOSEN AGAINST | I0 census; D-I2 |
| **X-09** | *"Voice may have a different capture path; it may not have a different mind"* | A voice-optimized cognition path | REFUSED at cognition, CHOSEN AGAINST at capture | `MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md` |
| **X-10** | Delegation capped at a bounded primitive | Automatic classification, routing, swarms, automatic merging | CHOSEN AGAINST, evidence-gated | `AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md` §9 |
| **X-11** | A north star may not be strip-mined for near-term copy | Demoting Vision → Designed to ship it | REFUSED (representation) | `MARKETING_CLAIM_DISCIPLINE.md` |
| **X-14** | Anti-Drift Law freeze on generalized architecture | Extracting the Coaching Journey Template now | DEFERRED | Naming ruling 2026-09-04 |
| **X-15** | Circle authority stays founder-only | Constituting a member cohort now | DEFERRED (to I8) | I0 census; D-I3 |
| **X-17** | Practitioner-wisdom work held behind the BUILD GATE | Continuing on design direction alone | DEFERRED | `UNIVERSAL_PRACTITIONER_SEED_2026-08-05.md` |
| **X-19** | Trust observations stay observation-only | Phase 3 affinity weighting | DEFERRED | `INTELLIGENCE_FIELD_ACCESS_MAP.md` |
| **X-20** | RFI / UFI not built, not claimed | Building or claiming them | UNPROVEN | Founder, 2026-05-24 |
| **X-23** | P1–P13 held at rung 1; nothing on rungs 1–4 is marketed | Publishing the research as findings | UNPROVEN | `CLAIM_LADDER.md` |
| **X-24** | Capacity transfer metric not claimed | Claiming measurable transfer | UNPROVEN | `CLAIM_LADDER.md` |

**13 entries. This is the set the kernel may later be derived from.**

---

## 5 · Unadjudicated — OPERATIONAL level (excluded from the kernel)

Recovered, real, worth keeping — and **not** answers to *what is Soullab choosing to become*.

| # | Decision | Why operational |
|---|---|---|
| X-02 | Local PostgreSQL; `check:no-supabase` | Vendor-specific enforcement of X-01A, not a separate choice |
| X-07 | FR-18 guarded at the mutation, not by revoking the token | *"Excellent engineering — but it is not corporate strategy, even though it teaches us something profound about authority"* [F] |
| X-08 | Reconcile forward on the I0.5 schema drift | Incident ruling |
| X-12 | Structural retirement via 410 before deletion | Implementation pattern |
| X-18 | Dormant service cleanup sequenced after Episodic | Technical debt sequencing |
| X-22 | Voice fix deployed, not yet falsified by a member | Verification state, not a choice |

---

## 6 · CONSTITUTIONAL level — pointer, not transcription

`docs/ANTI_FEATURES.md` is a complete REFUSED register and already guards the distinction this
document exists to preserve: *"Anti-features are not 'future features we haven't prioritized.'
They are permanent exclusions."* Not re-transcribed. Four noted for strategic consequence:

| # | Refusal | Source |
|---|---|---|
| X-25 | **Sanctuary content never crosses** — including by member request within Sanctuary. The one absolute that overrides member will. | FR-08.1 |
| X-26 | **No counts, scores, ranks, streaks, badges, leaderboards or trust levels** as status mechanisms. Forecloses the engagement-metrics playbook entirely. | FR-08.7; `ANTI_FEATURES.md` §2 |
| X-27 | **No access gated on a measured attribute of a person.** | I0 census finding (2) |
| X-28 | **No stealth memory.** | `CLAUDE.md` §Non-negotiables |

---

## 7 · Findings (r2)

Each finding now names the count it rests on, per C2.

### F1 · REFUSED is well-kept; the other classes were not collected
Unchanged and unchallenged. `ANTI_FEATURES.md` is rigorous. CHOSEN AGAINST, DEFERRED and UNPROVEN
existed only scattered across 20+ source documents until this sweep.

### F2 (corrected) · The risk is stale reopen criteria, not missing ones
See C3. X-16's criteria are explicit, enumerated, and **116 days old without revisit**. The old
observation-phase freeze hardened because it had *no* exit; X-16 and X-21A can harden because
theirs is *unread*. Different failure, different repair: review the criteria on a cadence.

### F3 (corrected) · Tradeoffs are poorly recorded; reopen conditions are inconsistent
**Counts, verified against r1 (`1337d51a`): of 24 entries carrying a REOPEN CONDITION, **18 are
[R]** and 6 [J] — 75% recovered. Of the 20 carrying a TRADEOFF, **5 are [R]** and 15 [J] — 25%
recovered.** *(An r2 draft of this finding said 4/20; corrected here on the same rule it states.)*

The gap is asymmetric and the asymmetry is the finding. Soullab records **where an exit lies** far
better than **what a choice costs**. Reopen conditions are weakest precisely among CHOSEN AGAINST
entries — where a live alternative was declined and the cost is highest.

**Adopted rule** [F] — applies when a ruling REFUSES, CHOOSES AGAINST, DEFERS, FREEZES, or HOLDS
AS UNPROVEN. Not on every ruling; *"that would produce bureaucratic filler."*

| Field | Required for |
|---|---|
| `CLASS` | all four classes |
| `TRADEOFF` | all four classes |
| `REOPEN CONDITION` | CHOSEN AGAINST · DEFERRED · UNPROVEN |
| `REOPEN CONDITION` = *"constitutional amendment only"* | REFUSED, explicitly recorded as such |

> **If no meaningful tradeoff exists, the item probably isn't strategic enough for this register.**

Two fields on rulings Soullab already writes — not another governance apparatus.

### F4 · The general decision log went dormant as decision volume exploded
`docs/decision-log.md` opens *"Prevents re-deciding things."* It holds **three entries, all dated
2026-02-11**, untouched for seven months. Lane ledgers absorbed the function within their lanes.
Nothing held cross-lane memory. **With LEVEL now defined, the decision log is the natural home for
the OPERATIONAL layer** — and X-04 has been returned to it.

### F5 · A contradiction inside the anchor
`CLAUDE.md:13` listed EC2 as part of the ethical architecture; `CLAUDE.md:131` states NOT EC2.
**Ruled a factual fossil, not a strategic question** [F]; repaired independently — see §9.

### F6 · The strongest exclusions are enforced by falsifiers, not prose
**Three of 30 entries are machine-enforced: X-07 (fails T10d), X-09 (pinned by
`__tests__/voice-non-degradation.test.ts`), X-03 (`check:no-openai`).** Prose exclusions drift;
these cannot. Direct evidence that a `STRATEGY_CASE` schema would be the wrong instrument: what
holds here is a predeclared falsifier that runs, not a field a model fills in.

### F7 (new) · The exemplar strategic choice does not exist in the record
"Practitioners first operationally" was offered as the model of a well-formed strategic exclusion.
**It is not recoverable.** The sweep found the BUILD GATE, the SCOPE RULING (*"smallest six-month
stewardship environment; next capability earned by use"*), the universality floor, and the
member ⊥ practitioner convergence ruling — **all of which presuppose practitioners-first without
ever ruling it.**

Soullab's most consequential sequencing decision is operative in practice and absent from the
record. It cannot be recovered; it can only be **authored**. That is a founder act, and it is
arguably the first entry the kernel will need.

---

## 8 · What this document does not do

- Does **not** draft or imply a kernel.
- Does **not** open a lane, authorize a build, touch schema, or change behavior.
- Does **not** claim the 24 unadjudicated entries have standing.
- Does **not** assert that any **[J]** field is what the founder actually reasoned.
- Does **not** claim completeness.

---

## 9 · Open for adjudication (24 entries)

Priority, in Jarvis's judgment:

| # | Item | The question |
|---|---|---|
| 1 | **F7** | Author "practitioners first" — or rule that it is not in fact the choice. The kernel has a hole here either way. |
| 2 | **LEVEL assignments** | 13 STRATEGIC / 6 OPERATIONAL are [J]. X-15 and X-19 are the borderline calls; X-02 may belong under X-01A rather than standing alone. |
| 3 | **F2 cadence** | X-16 and X-21A criteria are 116 days unread. On what cadence are reopen criteria reviewed? |
| 4 | **X-05, X-11** | The two entries that most directly foreclose a market position. Highest kernel weight. |
| 5 | **X-01B** | Is it CHOSEN AGAINST FOR NOW or UNDECIDED? The two produce different kernels. |

**Repaired separately per §F5:** `CLAUDE.md:13` EC2 fossil — factual correction, committed apart
from this register so it is independently reviewable and revertable.

**No entry above §3 has standing until adjudicated.**
