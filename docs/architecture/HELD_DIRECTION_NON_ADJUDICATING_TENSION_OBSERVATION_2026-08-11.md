# Held Direction — Non-Adjudicating Tension Observation

**Classification**: **Cat 1 — preserved direction.** Held, ⛔ **not authorized**. No spec, no schema,
no implementation. Recorded 2026-08-11 at founder request, immediately after the EDE program was
frozen (`docs/architecture/audits/EDE_PROGRAM_CLOSURE_AND_STANDING_RULES_2026-08-11.md`, `933e329fa`).

---

## 1. The question, and the honest answer

> *"After everything we learned, will JARVIS/MAIA actually be paying attention to these tensions?"*

**Not yet. Nothing does.**

`JARVIS_EPISTEMIC_COHERENCE_CAPABILITY_2026-08-09.md` §7 names five contradiction categories —
`DESIGNED BUT ABSENT · IMPLEMENTED BUT UNWIRED · WIRED BUT UNEXERCISED · DOCUMENTATION DRIFT ·
STALE EVIDENCE` — records a real historical instance of **every one**, and states plainly:
*"Detecting these automatically is entirely unbuilt."* Every instance on record was found by a
directed human/LLM investigation. `epistemic-guard.mjs` adjudicates **one claim against its own cited
evidence**; it never compares two claims. Nothing in AIN performs a **pairwise** observation at any
surface.

So the tensions the EDE program spent five experiments characterising are, today, noticed only when
someone goes looking.

## 2. Why this can be built without touching the freeze

⭐ **The load-bearing observation from the whole program.** Across every construction, in all five
experiments and both arms, **one thing was invariant**: the reasoner reliably detected and reported
**substantive content divergence about a shared referent** — including in the runs where it declined
the *authority conflict* label:

> *"The two claims do contradict in substance."* (EDE-004 B2)
> *"The textual opposition is real but not jurisdictional."* (EDE-005 C3, briefed)
> *"What exists is a genuine disagreement held at one tier."* (EDE-003 A4)

What was **unstable** — reversing twice on structurally identical evidence — was the
**classification** of that divergence as an authority conflict.

> **Therefore: an observation layer that records the divergence and refuses the classification is
> built entirely on the stable part of the finding, and depends on none of the frozen part.**

⭐ Two corroborating results: EDE-004 measured `RECORD_BOTH` at **9/9** and `RESOLUTION_REQUIRED` at
**9/9** unaided. The *behaviour* such a layer needs — hold both, resolve neither — is already
reliable. What is missing is not judgment. **It is that nothing looks.**

## 3. The shape, stated as a constraint set (⛔ not a design)

1. ⭐⭐⭐ **Records divergence, never conflict.** The stored type is *observed divergence between two
   claims addressing the same referent*. ⛔ It may not carry a field meaning "authority conflict",
   "contradiction", or any value from the frozen lattice — precisely because §5 of the closure
   record is **PENDING FOUNDER ACT**.
2. ⭐⭐⭐ **Non-adjudicating by construction, not by policy.** No precedence field. No resolution
   field. No winner. No ranking. Case A's standard governs: *"Success = representing all four
   without choosing. A schema that forces one category is a failed design."*
3. **Record per side** — `provenance · authority_type · authority_scope · proof state` — which is
   already §7's canonical requirement, and notably **does not require deciding admissibility**.
4. **The observation's own provenance is `jarvis_inference`**, ⛔ never inherited from either claim
   (§4 inheritance rule: extraction by JARVIS is `jarvis_inference` until a human authority confirms
   it).
5. ⛔ **Never counted.** No contradiction metric, no dashboard tally, no aggregate. Founder ruling,
   EDE-005: *bad representation becomes future evidence* — a stored divergence must not later be
   retrievable as a conflict, nor inflate any count.
6. **Correctable by the claims' authors.** Anything that records a tension about someone's claim must
   be inspectable and removable by whoever holds authority over that claim.

## 4. Two populations, sharply different risk — ⛔ do not merge them

| | **JARVIS-side** (governance corpus) | **MAIA-side** (member / practitioner claims) |
|---|---|---|
| subject | docs, canon, rulings, runtime evidence | lived accounts, practitioner lenses |
| the five taxonomy categories | directly applicable | not the same phenomenon |
| sovereignty exposure | low | ⚠️ **high** |
| recommended order | **first** | ⛔ **gated, and not by this document** |

⛔ **MAIA-side constraints, non-negotiable if it is ever taken up.** Sanctuary is absolute and
untouched. Case E governs: a divergence between a member's account and a practitioner's lens ⛔ **may
never surface as the member being wrong** — the member's account is maximally authoritative within
`member_own_experience` and a practitioner lens has no standing there. Invariant 14 (cultural
sovereignty) applies to any language used to name a tension. And per Inhabitable Architecture,
**"tension" is not a room** — ⛔ this must not become a warehouse tab enumerating the member's
inconsistencies back at them.

## 5. Growth-obligation answers (`CLAUDE.md`, required for any capability increase)

- **What uncertainty does this introduce, and how is it preserved?** That a recorded divergence may
  be spurious — the referents may not actually be the same, or the divergence may be framing. It is
  preserved by typing every record as an *observation* with its own `jarvis_inference` provenance,
  by never emitting a resolution, and by leaving both claims fully intact and independently
  authoritative.
- **What provenance and ownership boundaries does it require?** Each side retains its own
  `authored_by` / `authority_scope` / proof state, unmodified. The observation is owned by JARVIS and
  is never promoted to either claim's provenance.
- **What new responsibility does it create?** A system that notices tensions acquires a duty not to
  accumulate them silently, not to let observation become an unreviewed dossier, and to let the
  claim-holder remove an observation about their own claim.

## 6. What would have to be true before this is authorized

1. ⭐ The **§5 semantic question** need **not** be resolved first — that is the point of §2. But if
   the direction ever grows a *classification* field, it becomes blocked on that founder act.
2. The **unrun-suite trap** must be answered up front: `MAIA_MEMORY_ADVERSARIAL_EVALS` E1–E14 are
   specified and never run; the golden-member gate is designed and never built. ⛔ **Acceptance must
   be a first run over real corpus, not a specification.**
3. Scope must start at **one** named population and **one** taxonomy category with recorded historical
   instances to test against — ⛔ not all five, ⛔ not both populations.
4. ⛔ Explicitly **not** authorized by this document, and expressly **not** a revival of any retracted
   EDE candidate: this observes divergence; it does not gate, adjudicate, or intersect scopes.

---

⛔ Held, not authorized. No code, schema, governance language, or canon changed by this record.
