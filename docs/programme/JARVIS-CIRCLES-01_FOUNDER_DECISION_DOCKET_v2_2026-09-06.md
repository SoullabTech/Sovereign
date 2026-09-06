# Founder Decision Docket — v2

**Supersedes** `…_FOUNDER_DECISION_DOCKET_2026-09-06.md` (v1, D-01…D-19). v1 is retained as record.
**Regrouped into three classes** per the founder continuation instruction.
**Stage:** CIRCLE-02 drafted; stop before ratification.

**v1 → v2 disposition:** D-17 satisfied (R9) · D-18 substantially satisfied, remainder → Class C
(R10) · D-19 **CLOSED** by the production witness (R8) · **D-06 CORRECTED** (R4) · D-09
strengthened (R6) · Tier-3 repairs → Class B, still unauthorized.

---

# CLASS A · CONSTITUTIONAL RULINGS NEEDED NOW

16 items. **Eight are the minimum to reach VERIFY** — marked ⭐.

| # | Ruling | Jarvis recommendation | Draft §|
|---|---|---|---|
| ⭐ **A-01** | **Ecosystem consent law** — *Connection may increase reach, but may never lower the consent level of what is being connected.* | **RATIFY.** Generalizes the Membrane Invariant to every new field without weakening it. | 02F |
| **A-02** | **Multiplication-not-enlargement law**, with the R2 rationale and **no headcount attached** | **RATIFY law + restated rationale. Ratify no number.** | 02D |
| ⭐ **A-03** | **The ontology** — Personal / Dyadic? / Circle / Constellation / Commons / Co-Lab; Constellation's unit is Circles | **RATIFY.** Corroborated by Ostrom nesting and minipublic practice. | 02D |
| ⭐ **A-04** | **Is a dyad a Circle, or a distinct Dyadic Field?** | **DISTINCT.** A dyad cannot survive one departure, cannot anonymize, cannot hold plurality, degenerates contribute-before-see. Five fields become six on this ruling. | 02B |
| **A-05** | **Circle defined by relational capacity, not headcount** — and: *defined* by the eight capacities, or *characterized* by them? | **RATIFY capacity-not-headcount. Recommend "characterized"** — "defined" makes every capacity a pass/fail gate and invites scoring. ⛔ No capacity index either way. | 02C |
| ⭐ **A-06** | **Ordinary witnessing vs contribute-before-see.** Doctrine says *Feel → Contribute → Browse* governs Circle participation; research says it belongs to structured inquiry only | **SCOPE THE DOCTRINE TO STRUCTURED INQUIRY.** Peripheral participation is legitimate. *The founder amends the doctrine; Jarvis does not.* | 02G |
| **A-06b** | **May a member withdraw an inquiry response?** Today: no | **YES** — it is the only irreversible Personal→Circle crossing, against *reversible at all times*. | 02G |
| **A-07** | **Circle lifecycle** — formation → coalescence → active → maturation → continue/rest/complete/differentiate | **RATIFY.** Rest, completion and birth are not engagement failures. | 02J |
| **A-08** | **Circle birth vs rupture-driven separation** as distinct phenomena with distinct mechanisms | **RATIFY.** Fault-line research shows conflict activates pre-existing subgroup boundaries — conflating them would let schism wear the language of generativity. | 02J |
| **A-09** | **Authority to initiate separation / birth** | **MEMBER ACT ONLY.** System may notice, reflect, ask. ⛔ No headcount trigger. | 02J |
| **A-10** | ⭐ **Facilitator authority — and removal authority, grounds, recourse** | **Facilitator authority procedural, not interpretive.** Removal is **unanswered today** (`status='removed'` has no writer) — this is constitutional before it is a repair. | 02E, 02H |
| **A-11** | **Repair / boundary action / moderation / safety intervention** — four distinct responses, each with an authority | **RATIFY the distinction.** Not every conflict should be repaired; not every conflict should be moderated. | 02I |
| **A-12** | ⭐ **Field Witness vs Common-Ground Mediator** — and **who may invoke the Mediator?** | **RATIFY both roles, default Field Witness, Mediator invoked only.** ⛔ Never silent drift. Invocation authority is unanswered. | 02K |
| ⭐ **A-13** | **Interest discovery and declared-interest privacy** | **DECLARED INTERESTS ONLY** — never MAIA conversation, atoms, semantic memory, anchors, or inferred themes. Deliberately less capable than Circle.so Connect and Mighty's AI matching. **That is the differentiator, not a limitation.** | 02L |
| ⭐ **A-14** | **Circle ↔ Constellation ↔ Commons membranes — and who holds a Circle's release authority** | **RATIFY the membranes.** Release authority (facilitator / collective assent / each author) is **open** and blocks the verifier. | 02M |
| **A-15** | **Circle ↔ Co-Lab membrane** | **RATIFY**, with membership never transferring automatically in either direction. | 02N |
| ⭐ **A-16** | **What may never cross automatically** — the seven-item hard list | **RATIFY.** These become the verifier's core assertions. | 02O |

# CLASS B · SUBSTRATE DEFECTS / REPAIRS

⛔ **None authorized. None touched.** Kept deliberately separate from Class A: these are things the
code does, not things the Constitution must decide.

| # | Defect | Sev | Note |
|---|---|---|---|
| **B-01** | **API/UI founder-gate mismatch** (G-01) — `/api/circles` at `minTier:'free'`, `/commons/join` public, no API route imports `requireFounder` | 🔴 | Membership scoping holds; not an inter-Circle leak. But *"Circles is not open for v1"* describes the UI only. **Recommend closing before any cohort.** |
| **B-02** | **No Circle boundary verifier** (G-12) — Circles absent from `verify-constitution-colab.ts` | 🔴 | Spec drafted (`…_BOUNDARY_VERIFIER_SPEC…`); **writing it is not authorized.** |
| **B-03** | **Removal/revocation defect** (G-06) — `status='removed'` has no writer; would not cascade if set by hand | 🔴 latent | Blocked on **A-10**. |
| **B-04** | **Missing containment-plan reference** (G-16) — code cites a doc that does not exist | 🟡 | Ruling intact and honored in code; its record is not. Same class as the `verify-colab-boundaries.ts` defect. |
| **B-05** | **Non-withdrawable inquiry response** (G-08) | 🟡 | Blocked on **A-06b**. |
| **B-06** | **`response_count` returned to client** (G-03) | 🟡 | Against *no counts*. Needs a doctrine reading, not a patch. |
| **B-07** | **Inert `visibility` / `invite_enabled`** (G-07) | 🟡 | ⛔ **Do not build to the inert columns.** Blocked on **A-13**. |
| **B-08** | **Pulse defence-in-depth** (G-10) — services lack internal membership gates | 🟢 | Correct at both call sites today. |
| **B-09** | **`status='integrating'` one-way door** (G-09) | 🟢 | |
| **B-10** | **Five nav entries → refusal screen** (G-17) | 🟢 | Correct if v1 closure is intended. |

# CLASS C · QUESTIONS TO LEARN THROUGH REAL CIRCLES

**No longer blockers to constitution.** These become the observational research programme
(`…_OBSERVATIONAL_RESEARCH_PROTOCOL…`).

viable Circle sizes · recognizability across size · facilitator load · peripheral participation ·
rupture frequency · repair capacity · subgroup emergence · generative Circle birth · how MAIA Field
Witness actually affects a group · **whether MAIA increases or decreases member authority** · how
long Circle formation takes · what healthy completion feels like.

`[LAW]` **Ratify no numerical size threshold from desk research** (Supplement R11).

---

## The path from here

```text
CONSTITUTE  ← we are here (draft produced, stopped before ratification)
     ↓  needs: A-01, A-03, A-04, A-06, A-10, A-13, A-14, A-16   (8 rulings)
VERIFY      write the Circle boundary verifier
     ↓
REPAIR      close Class B against the ratified Constitution
     ↓
INVOKE      creation / discovery / entry / leave
     ↓
LIVE CIRCLE → OBSERVE → CONSTELLATE → COMMONS → BRIDGE → COLLECTIVE MAIA
```

**Eight rulings unblock the next stage.** The other eight Class-A items can follow the verifier.
