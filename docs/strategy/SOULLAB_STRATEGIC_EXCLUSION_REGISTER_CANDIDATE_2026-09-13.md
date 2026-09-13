# Soullab Strategic Exclusion Register — CANDIDATE (r4)

```text
STATUS      CANDIDATE. 18 adjudication rulings applied (2026-09-13, r2+r3+r4);
            14 resulting entries adjudicated; 16 entries remain open; 30 entries total.
            Kernel-producing set: 13.
RULED BY    founder, 2026-09-13 (opening): read-only reconstruction, not founder-from-memory
            composition; every entry CANDIDATE until adjudicated; do not draft the kernel.
            founder, 2026-09-13 (r2): three corrections, six adjudications, and the LEVEL
            discriminator. "Strategic memory is not the same thing as decision memory."
            founder, 2026-09-13 (r3): cardinality repair (C4); F7 AUTHORED as X-29; X-15
            releveled OPERATIONAL; X-19 elevated in wording, STRATEGIC retained; X-02
            collapsed beneath X-01A as enforcement, not an independent decision.
            founder, 2026-09-13 (r4): X-05 kept STRATEGIC with fields filled; X-09 and X-11
            releveled CONSTITUTIONAL; X-01B and X-10 releveled OPERATIONAL; F2 answered with a
            90-day stale backstop; X-29 given a distribution acceptance condition, no build.
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

### C4 · Cardinality after the splits
r2's header said *"6 entries adjudicated / 24 unadjudicated."* Splitting X-01 and X-21 turned 28
recovered entries into 30 and 6 rulings into 7 resulting records. **Acts and resulting records are
different counts and the register must not conflate them.**

Ledger after r3 (5 further rulings):

| | Count |
|---|---|
| Adjudication rulings applied (r2 + r3) | **11** |
| Resulting entries adjudicated | **10** |
| Open — STRATEGIC | 11 |
| Open — OPERATIONAL | 5 |
| Open — CONSTITUTIONAL | 4 |
| **Open total** | **20** |
| **Grand total** | **30** |

The kernel-producing set is **17 entries** — 11 open plus 6 adjudicated at STRATEGIC level
(X-01B · X-16 · X-19 · X-21A · X-21B · X-29).

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

### The second admission test (founder, r4)

> **A strategic alternative must be a future Soullab could legitimately choose.**

This is what separates X-11 from X-29. *"Should we enter through practitioners or consumers?"* is a
real fork. *"Should we tell tomorrow's story as if it were today's?"* is not — it is an honesty
boundary wearing the grammar of a choice. **Consequence does not make something strategy: a
constitutional floor constrains strategy; it is not produced by it.**

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
- **CURRENT ENFORCEMENT** [F] — *absorbed from r2's X-02, which is no longer a numbered entry:*
  ```text
  Local PostgreSQL · lib/db/postgres.ts
  npm run check:no-supabase (pre-commit + CI)

  STATUS
  Implementation of X-01A, not the constitutional principle itself.
  ```
  **Why collapsed** [F]: *"A future technology could satisfy X-01A while looking nothing like
  today's PostgreSQL stack. X-01A should survive such replacement."* Left standing alone, the
  register would slowly convert **sovereign custody** into **this particular vendor is
  metaphysically forbidden** — which are not equivalent.

### X-01B · Managed infrastructure for non-authoritative, non-member-data functions
- **LEVEL** [F] **OPERATIONAL** *(releveled from STRATEGIC, r4)* · **CLASS** [F] current preference
- **RULING** [F] **The admission test dissolves the CHOSEN-AGAINST-vs-UNDECIDED question r3 left open.** Putting a public logo on a CDN tomorrow would not materially change Soullab's human promise or sovereignty posture, provided the implementation respects privacy and authority boundaries. So no artificial strategic decision about CDN usage is forced; **each actual managed-service proposal is evaluated on its merits.** Preserves the distinction the r3 collapse recovered:
  ```text
  PRINCIPLE        sovereign custody
       ≠
  IMPLEMENTATION   minisforum + PostgreSQL + Caddy forever
  ```
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

### X-29 · Member-first experience; practitioner-led initial distribution
- **LEVEL** [F] STRATEGIC · **CLASS** [F] CHOSEN AGAINST
- **⚠ PROVENANCE** [F] **AUTHORED, not recovered.** Per F7 this choice was operative in practice
  and absent from the record. Every substantive field below is **founder-authored on the act that
  accepts it** — none may later be re-marked [R]. *A choice authored today does not become a
  choice that was always on the record.*
- **CHOICE** [F] Build the human/member experience as the primary lived product, while entering
  the market initially through practitioners who bring existing relationships, practices and
  fields of service.
- **ALTERNATIVE** [F] Direct-to-consumer acquisition as the primary initial distribution strategy.
- **WHY** [F] Two axes that r1's proposed "practitioners first" would have collapsed:
  ```text
  BUILD / EXPERIENCE          member first
  GO-TO-MARKET / DISTRIBUTION practitioner-led first
  ```
  **This is why "practitioners first" alone would have muddied the record rather than repaired
  it.** The corpus supports the distinction: the Universal Practitioner Seed's settled sequence
  opens with *"Ship the member field"* (step 1 of 5), and §"The reusable deployment pattern"
  names **practitioner deployment** and **member deployment** as parallel kinds, not a priority
  order.
- **SOURCE** [F] Founder act, 2026-09-13, on finding F7. Supporting context (not authority):
  `UNIVERSAL_PRACTITIONER_SEED_2026-08-05.md` §"DIRECTION SETTLED", §88.
- **TRADEOFF** [F] Slower broad reach; practitioner sales and onboarding burden; heterogeneous
  methods; **continual need to defend the member's sovereignty from practitioner authority.**
- **REOPEN CONDITION** [F] Reconsider consumer-first distribution when the direct member
  experience can independently sustain onboarding, continuity, consent, support and economic
  viability **without introducing attachment or engagement incentives and without weakening
  member sovereignty.**
- **DISTRIBUTION ACCEPTANCE CONDITION** [F] — *not a build authorization.* The tradeoff above is
  **not** "we must invent a member-sovereignty mechanism." Mechanisms exist. It is that
  **practitioner-led distribution continually creates pressure on an already-established
  sovereignty boundary, so every practitioner deployment has to prove that boundary survives the
  deployment.**

  > **Before any practitioner-led deployment expands beyond a witnessed specimen, demonstrate
  > that member-private material remains unavailable to the practitioner absent an explicit
  > member sharing act — including through metadata and derived signals — and that the member's
  > own MAIA relationship remains structurally independent of the practitioner relationship.**

  ```text
  existing architecture passes  → no build
  coverage incomplete           → owning lane receives the defect
  new guard required            → separate authorization
  ```
  ⛔ **Finding a gap is not permission to repair it.** See F9 — this condition already has a live
  candidate gap, which is why it is a condition and not a formality.

### X-15 · Circle authority stays founder-only
- **LEVEL** [F] **OPERATIONAL** *(releveled from STRATEGIC)* · **CLASS** [R] DEFERRED
- **RULING** [F] **RELEVEL → OPERATIONAL.** Founder-only Circle access is a release-stage
  membrane. *"Reversing that tomorrow would not change what Soullab is. It would mean I8 arrived."*
- **WHERE THE STRATEGIC DECISION ACTUALLY SITS** [F] X-05 — *Circles scale through multiplication
  rather than enlargement* — belongs in the kernel-producing layer. *"We haven't constituted the
  Circle beta cohort yet"* does not.
- **DISPOSITION** [F] Durable operational memory, retaining its I8 reopen condition. Leaves the
  strategic set.

### X-19 · System-inferred trust does not silently become relational authority
- **LEVEL** [F] STRATEGIC *(retained)* · **CLASS** [F] DEFERRED — evidence-and-authority-gated
- **RULING** [F] **Wording elevated from implementation to the relational-authority choice.** r2
  recorded this as *"trust observations stay observation-only; Phase 3 affinity weighting not
  wired"* — which reads operational. **What is actually at stake:** *may a system-inferred
  judgment about trust quietly acquire authority over human relationship or affinity?*
- **CHOICE** [F] System-inferred trust does not silently become relational authority.
- **ALTERNATIVE** [F] Using inferred trust observations to weight affinity, matching, access,
  recommendation or relational significance **without a new authority act.**
- **WHY** [R] Trust observations are *"observation-only by design"*; any future wiring *"would
  need category-gradient pass — system-inferred → non-form by default."*
- **SOURCE** [R] `docs/canon/INTELLIGENCE_FIELD_ACCESS_MAP.md`.
- **TRADEOFF** [J] Trust data accumulates unused.
- **REOPEN CONDITION** [F] Only after the category-gradient question is resolved **and** the
  proposed use establishes: whose authority the inference carries · how the person can inspect,
  correct or refuse it · and why the system, rather than the human, is entitled to let it affect
  relationship.
- **NOTE** [F] *"Phase 3 affinity weighting is merely the current specimen."*

### X-05 · Circles scale by multiplication, not enlargement
- **LEVEL** [F] STRATEGIC *(kept)* · **CLASS** [F] CHOSEN AGAINST
- **RULING** [F] **One of the strongest genuine strategic choices in the register.** FR-10 does not say the current implementation happens to use small groups; it says **collective scale itself** should proceed by multiplication and nesting rather than making one relational field absorb unlimited complexity. *"Reversing it would change what kind of social architecture Soullab is creating."*
- **CHOICE** [R] Collective scale through multiplication and nesting of small fields.
- **ALTERNATIVE** [R] Enlarging a single relational field.
- **WHY** [R] *"Enlargement increasingly makes recognizability, participation, facilitation, differentiation and repair difficult to preserve."*
- **SOURCE** [R] FR-10, 2026-09-06.
- **TRADEOFF** [F] Gives up economies of scale, audience density, large-group network effects, simpler administration, and the familiar "one big community" model. Multiplication creates coordination and constellation complexity.
- **REOPEN CONDITION** [F] ⛔ **Not** *"a Circle with 500 people seems to work"* — headcount is explicitly not the law. Reopen only on evidence that enlargement can preserve **all five properties FR-10 names** — recognizability, participation, facilitation, differentiation, repair — **without** introducing status mechanics, centralized authority, or relational anonymity. Any change then requires an explicit amendment to FR-10.

### X-09 · Voice may not have a different mind
- **LEVEL** [F] **CONSTITUTIONAL** *(releveled from STRATEGIC)* · **CLASS** [F] REFUSED
- **RULING** [F] The source is not a preference and never was. Verified at the top of the canon: *"**Status:** standing ruling and **hard acceptance gate**, founder, 2026-08-31. **Not a preference.** … **There is no reduced voice version of MAIA.**"* And: *"RED means Desktop voice does not ship."*
- **REFUSED ALTERNATIVE** [F] — *narrowed:* **response-producing voice cognition that bypasses or substitutes for canonical MAIA cognition** — the canon's *"thinner, cheaper, generic, stateless, or otherwise reduced conversation path."*
- **⛔ CORRECTION to r2/r3** [F] Do **not** describe alternative capture, STT or TTS as chosen against. The same canon explicitly permits those to differ and evolve freely: *STT/TTS are sensory infrastructure.* r2's "CHOSEN AGAINST at the capture boundary" was wrong and is withdrawn.
- **SOURCE** [R] `docs/canon/MAIA_CONVERSATIONAL_INTELLIGENCE_NON_DEGRADATION.md`; pinned by `__tests__/voice-non-degradation.test.ts`.
- **REOPEN CONDITION** [F] Constitutional/canonical amendment only.

### X-10 · Delegation capped at a bounded primitive
- **LEVEL** [F] **OPERATIONAL** *(releveled from STRATEGIC)* · **CLASS** [F] DEFERRED
- **RULING** [F] As recovered, X-10 is *manual task and model selection until the bounded primitive generates enough evidence to justify automating it* — **an internal Builder OS sequencing choice.** Its own source scopes automatic classification out *for this unit*, reopening on evidence plus a separate authorization. **Do not feed it to the kernel.**
- **⚠ WHY THE HIGHER PRINCIPLE IS NOT RE-ENTERED HERE** [F] The authority firewall — *delegates execute under authority; they do not create authority* (no delegate may establish constitutional architecture, member authority, consent, confidentiality, provenance, security boundaries, founder rulings or ontology) — **is serious and is already represented elsewhere.** Duplicating it as a new strategy entry would let one principle accrue several homes and drift between them.
- **SOURCE** [R] `AIN_DELEGATION_CONTROL_PLANE_2026-08-09.md` §9.

### X-11 · A north star may not be strip-mined
- **LEVEL** [F] **CONSTITUTIONAL** *(releveled from STRATEGIC)* · **CLASS** [F] REFUSED
- **RULING** [F] The alternative is not a legitimate strategic future. Relabeling a Vision story as Designed to make it saleable now is **representation discipline**, governing every outward statement — an honesty boundary, not a fork. *"It has enormous market consequences, yes. But consequence does not make something strategy."*
- **SOURCE** [R] `MARKETING_CLAIM_DISCIPLINE.md` §True-North Preservation.
- **REOPEN CONDITION** [F] Constitutional/canonical amendment only.
- **NOTE** [F] This ruling produced the second admission test in §1.

---

## 4 · Unadjudicated — STRATEGIC level (kernel-producing set)

Entries r1 recovered, now levelled. **LEVEL is [J] unless marked.** Full field records are in
git history at `1337d51a`; abbreviated here to keep the strategic set readable.

| # | Choice | Alternative chosen against | Class | Source |
|---|---|---|---|---|
| **X-03** | Provider replaceability — *"no provider is load-bearing for who MAIA is"* | OpenAI in the production runtime | CHOSEN AGAINST (REFUSED in-prod, lab-gated otherwise) | `PROVIDER_GOVERNANCE.md`, canon 2026-07-07 |
| **X-06** | Build the FR-02 Commons fresh | Reuse `community_*` — *"would import a status economy on day one"* | CHOSEN AGAINST | I0 census; D-I2 |
| **X-14** | Anti-Drift Law freeze on generalized architecture | Extracting the Coaching Journey Template now | DEFERRED | Naming ruling 2026-09-04 |
| **X-17** | Practitioner-wisdom work held behind the BUILD GATE | Continuing on design direction alone | DEFERRED | `UNIVERSAL_PRACTITIONER_SEED_2026-08-05.md` |
| **X-20** | RFI / UFI not built, not claimed | Building or claiming them | UNPROVEN | Founder, 2026-05-24 |
| **X-23** | P1–P13 held at rung 1; nothing on rungs 1–4 is marketed | Publishing the research as findings | UNPROVEN | `CLAIM_LADDER.md` |
| **X-24** | Capacity transfer metric not claimed | Claiming measurable transfer | UNPROVEN | `CLAIM_LADDER.md` |

**7 open entries.** With the 6 adjudicated STRATEGIC entries (X-05 · X-16 · X-19 · X-21A ·
X-21B · X-29), the kernel-producing set totals **13** — down from 17. **A healthy contraction:**
four entries left because they were a constitutional floor (X-09, X-11) or an implementation
preference (X-01B, X-10) wearing strategic grammar.

---

## 5 · Unadjudicated — OPERATIONAL level (excluded from the kernel)

Recovered, real, worth keeping — and **not** answers to *what is Soullab choosing to become*.
*(X-15 is now OPERATIONAL and adjudicated — recorded in §3, not here. X-02 is no longer a
numbered entry; it lives beneath X-01A as current enforcement.)*

| # | Decision | Why operational |
|---|---|---|
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

### F2 · RULED (r4) — 90-day stale backstop, review without authorization
The error was never lack of criteria. X-16's are unusually good. **The problem is that
architecture can move while the criterion sits untouched.**

> **Every STRATEGIC DEFERRED or UNPROVEN entry with a future-facing reopen condition is reviewed
> when a named upstream condition materially changes, or after 90 days without review, whichever
> comes first.**

⛔ **Review does not reopen the item and authorizes nothing.** It asks only four questions:

1. Does this criterion still describe the real architecture?
2. Has one of its conditions already been satisfied, or become obsolete?
3. Is the original reason for the hold still true?
4. Does the tradeoff look materially different now?

No new lane. No automatic job. No strategy ceremony. **The 90 days is a stale-data backstop, not a
cadence.** Currently in scope: X-16, X-19, X-21A, X-21B, X-20, X-23, X-24.

### F9 (new) · The X-29 acceptance condition has a live candidate gap
Verification of the mechanisms X-29 rests on, run before recording the ruling:

**Present and verified.** `can_be_shown_to_practitioner` defaults FALSE and moves only by an
explicit per-thread member gesture (`NW_D00_EXISTING_PRODUCT_CENSUS_2026-08-26.md`); render
evidence records *"Every row: `can_be_shown_to_practitioner = false`"*; UI trust copy is backed by
a real absence — *"Your practitioner cannot see your positions — **there is no read for**"*
(`position/page.tsx:190`).

**Not located.** The stronger half — client-private material *unrecoverable by construction*, and
a practitioner unable to **infer its existence** through timestamps, counts, ordering,
notifications, suggested actions or latency — **could not be found in this repository.** (The
phrase "unrecoverable by construction" does occur, in `CRP-001-C3-BINDING-RECORD.md`, but about a
git artifact's provenance ceiling — an unrelated context, matched coincidentally.) Nor was
"predates and outlives" located.

**And the one three-way visibility table found disclaims itself**: *"⚠️ This table is descriptive
of the design intent, **not a ruled access model.** The authoritative boundary is the consent
architecture, not this grid"* (`NOW_WHAT_NAVIGATION_AND_ARRIVAL_ARCHITECTURE_2026-08-03.md`).

**Consequence:** the acceptance condition's *"including through metadata and derived signals"*
clause is **not a confirmation exercise**. The consent gate is real; the inference-channel
guarantee is, on this reading, unlocated. ⛔ **Named, not repaired** — per the standing programme
stop. The ruling stands unchanged and is arguably strengthened: this is exactly what the condition
exists to catch.

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
record. It cannot be recovered; it can only be **authored**.

**AUTHORED 2026-09-13 as X-29** — and the authoring corrected the finding's own framing. r2
proposed the missing choice was *"practitioners first."* It is two-dimensional: **member-first
experience, practitioner-led initial distribution.** The seed's settled sequence opens with
*"Ship the member field,"* so a flat "practitioners first" would have recorded the opposite of
what the corpus shows. **A gap named is not yet a gap correctly named.**

### F8 (new) · Kernel value concentrates at one altitude
Across 17 STRATEGIC entries, the ones carrying kernel weight are **not feature decisions**. They
are choices about **who holds authority** (X-19, X-01A), **how Soullab reaches people** (X-29),
**what kind of relationship scales** (X-05, X-10), and **which incentives it refuses to optimize
for** (X-11, X-26). The r3 relevelings ran in both directions on exactly this test: X-15 fell out
of the strategic set as a release-stage membrane, while X-19 stayed and was raised, because its
specimen was operational but its question was not. **Altitude, not subject matter, decides the
level.**

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
| 1 | **F9** | The inference-channel guarantee is unlocated. Does it exist somewhere Jarvis could not reach, or is it a real gap for the owning lane? **Only the founder can tell these apart.** |
| 2 | **X-03, X-06** | The two highest-weight open strategic entries — provider replaceability and refusing an inherited status economy. |
| 3 | **X-14, X-17** | Both DEFERRED behind gates (Jondi walk · Larry IP inventory). Now in F2's 90-day scope. |
| 4 | **X-20, X-23, X-24** | The three UNPROVEN entries. Do they share one reopen condition — evidence — or three? |
| 5 | **Remaining LEVELs** | 7 STRATEGIC / 5 OPERATIONAL still [J], and four constitutional entries have never been levelled by act. |

**Repaired separately per §F5:** `CLAUDE.md:13` EC2 fossil — factual correction, committed apart
from this register so it is independently reviewable and revertable.

**No entry above §3 has standing until adjudicated.**
