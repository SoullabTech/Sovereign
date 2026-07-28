# Recursive Development — Held Architectural Candidate

**Status:** **Doctrine RATIFIED as a domain-specific constitutional clarification (*lex specialis*) — Founder ruling, Kelly, 2026-07-26** (see §Constitutional Ruling). The *Development Lineage* **build remains HELD; implementation is NOT authorized.** Current-state audit + Risk #1 investigation complete. This document, the audit, and the Risk #1 dossier are placed on a **documentation-only PR** for review on their own merits before any code is contemplated. Authorizes no code, schema, workflow, or runtime change.

## Central constitutional rule

> **AIN may discover and formulate candidates for its own improvement, but it may never authorize, implement, merge, deploy, or ratify its own evolution.**

The system may surface. Only authorized humans may rule, implement, merge, deploy.

## Constitutional Ruling (Founder — Kelly, 2026-07-26)

**Ratified as a domain-specific constitutional clarification (*lex specialis*) — not a global reinterpretation of Invariant 8.** It neither repeals nor contradicts Invariant 8; it narrows scope for one domain.

**The crisp ruling (record verbatim):**
> For recursive system development, automation may surface and organize signals, but it may not constitute the named pattern or improvement hypothesis. Human Recognition and Human Pattern remain distinct sovereign acts. Mentor approval of an automated hypothesis does not retroactively make its authorship human.

Equivalently: *For the system's own development, automation ends at Signal. Human Recognition and Human Pattern are sovereign acts that cannot be delegated or retroactively supplied by approval.*

**Four ratified constitutional statements:**
1. Automation may gather and organize evidence.
2. Recognition is a distinct sovereign act — recognizing that signals belong together is already interpretation; it precedes naming.
3. The first named developmental pattern must be human-authored. Human approval of an automated interpretation does not make the interpretation human.
4. Implementation follows constitutional clarification. Existing systems remain governed by the canon under which they were built **until this doctrine is ratified _and_ implementation work is explicitly authorized.** *(No retroactive judgment.)*

**Relationship to Invariant 8 — specialization, and *more specific*, not *stricter*:**
- **Invariant 8** answers *Who decides?* — automation may generate proposals generally; humans decide.
- **Recursive Development** answers *Who may perform the first act of interpretation from which the system evolves?* — automation may surface/organize signals; it may not constitute the first named interpretation.
- Different governance problems. An offer to a member is not the system authoring its own evolution. Nothing is overridden; the newer doctrine narrows scope. *"Stricter" would wrongly imply Invariant 8 was insufficient — it is not; it simply answers a different question.*

**Service rulings** (evidence: `RECURSIVE_DEVELOPMENT_RISK1_SIGNALS_VS_PATTERNS_2026-07-26.md`):
- **`ImprovementHypothesisGenerator` — constitutionally ahead of the doctrine, not defective today.** It faithfully implements existing canon (Invariant 8); it would require redesign *if/when* implementation of this clarification is authorized. **Documentation outcome now; implementation candidate later.** Future architecture: `Signals → Recognition dossier (recurring rupture · frequency · evidence · confidence · chronology) → Human Recognition → Human-authored hypothesis` — the system still does almost all the work; it simply stops before interpretation.
- **pattern_ledger → member generation (Service 2) — a separate lane, under Recognition Integrity (Invariant 16), not this doctrine.** Its question: *when members encounter named patterns, who authored the meaning?* **This audit must NOT be used as evidence for or against the recursive doctrine** — it merely surfaced another question. Opened as its own bounded investigation, later.
- **`detectBreakthrough` — the reference implementation of the desired boundary**, cited *inside* this doctrine: detect · score · anonymize · never mark the member · never overwrite member witness. This is the architecture being generalized.

**Authorized / withheld:** Authorized — a documentation-only PR recording this doctrine + the audit + the Risk #1 dossier, for review on its own merits. Withheld — any implementation; Prompt 2 stays held until the clarification is recorded and reviewed.

## The loop (refined — Kelly, 2026-07-26)

```
Experience
  → Evidence
    → Signal
      → Human Recognition
        → Human Pattern
          → Candidate
            → Governance
              → Ruling
                → Implementation
                  → Verification
                    → Reflection
                      → Experience
```

The critical refinement over the original framing: **the automatable span ends at Signals, not Patterns.** This is not merely a safety improvement — it changes the epistemology of the whole system.

**A second refinement (Kelly, 2026-07-26): Recognition is distinct from Pattern.** The human span is *two* acts, not one. **Recognition** says *"these signals belong together"* — an associative act — **without yet naming what they mean.** **Pattern** names the meaning. A person can witness that several signals cohere before any interpretation is warranted; that is the witnessing vocabulary. So automation ends at Signal; Recognition and Pattern are both human, in that order.

## Four kinds of acts (must never be collapsed)

| Act | Nature | Legitimate author |
|---|---|---|
| **Signal** | descriptive — *what recurred* | the system may surface |
| **Recognition** | associative — *these belong together*, not yet named | a **human** witnesses |
| **Pattern** | interpretive — *what it means* | a **human** authors |
| **Candidate** | architectural | a human formulates |
| **Ruling** | authoritative | an **authorized** human only |

A signal says *"this recurred N times across authorized evidence; contradictory evidence also exists."* Recognition sees that several signals cohere — still descriptive, no meaning claimed. A pattern *names* the phenomenon — an interpretive act. The moment the system names the pattern, it has manufactured higher-order meaning, which the Constitutional Direction of Authority reserves to authored experience. So Recognition and Pattern authorship stay human, by construction.

## Pre-candidate constitutional test — Recognition-before-identification

**Agenda-setting is power.** A system that decides *what humans notice* already exerts influence, even if it approves nothing. Therefore, before any candidate may form:

- surface the underlying **evidence first**;
- make the **recurrence measurable**;
- **preserve contradictory evidence** (never suppress);
- **avoid naming or labeling** the phenomenon;
- **require a human to author the pattern** if one is warranted.

Observation precedes interpretation. The system shows content before anyone names it.

## Temporal-authority principle (the recursive counterpart to the Constitutional Direction of Authority)

> **Evidence before interpretation. Interpretation before governance. Governance before implementation.**

The Constitutional Direction of Authority defines *who* holds authority. This defines *when* each kind of authority may legitimately be exercised. Together they bound both the actor and the moment.

## Sequence: Practice → Corpus → Assistance (NOT Idea → Engine)

The first artifact is **not an engine**. It is a **ledger of recursive practice** — a corpus of the governance cycles already lived. The corpus does two things: (1) it **proves the practice exists**; (2) it becomes the **training set for any future assistance**. Only after the corpus reveals recurring, low-risk opportunities does assistance become considerable — and the first assistance helps people **find evidence, not name patterns**.

## The missing object — Development Lineage (Kelly, 2026-07-26)

The audit's decisive finding: the pieces already exist — observations, evidence stores, review surfaces, founder rulings, provenance. **What is absent is the *lineage* connecting them into one coherent developmental history.** This is **architectural archaeology, not greenfield engineering.**

So the real architectural target is **not another table** (not another evidence / pattern / hypothesis store) but a **Development Lineage** — an object that threads the whole chain:

```
This observation
  → generated these signals
    → which a human recognized as belonging together
      → which a human named as this pattern
        → which informed this candidate
          → which received this ruling
            → which authorized this implementation
              → which produced this verification
                → which generated these new observations.
```

That connective object does not exist today (audit §ABSENT #2). It is the true first artifact — a *lineage*, not an *engine* or a generic *ledger*.

**Burden of proof (Invariant 15).** Because the constitutional rule already exists as **Invariant 15 (Authored Adaptation)**, the governance question is **not** *"should we create this principle?"* but *"how faithfully are we implementing an existing principle?"* — a different, lighter conversation.

## First artifact — a human-authored Development Lineage in the governance domain (proposed; not authorized)

The first artifact is the **first instance of the Development Lineage** (above): a **human-authored** record of the platform's own governance/architecture cycles — near-zero constitutional surface, no member-data entanglement (audit §Recommended First Slice, **Fork A**).

**Name — OPEN Founder decision. Avoid "engine"** (collides with the existing *Relational Developmental Engine*, `RELATIONAL_DEVELOPMENTAL_ENGINE_CANDIDATE_2026-07-04.md`); the terminology audit also warns off *Room / Ledger / Pattern / Witness-Room* overload. Working candidates: **Development Lineage · Governance Cycle Record · Architectural Learning Record.** Each names what it *is today*, not what it might become.

Each entry records, as **separate** fields (never one "complete" status):
- What was observed?
- What evidence existed?
- What signals recurred? (with contradictory evidence preserved)
- What pattern did **the human** author?
- What candidate emerged? (scope **and** non-scope)
- What ruling was made? (explicit, human-authored)
- What was implemented? (references, not authorization)
- What verification followed? (claims bounded to what the run demonstrated)
- What changed in reality?
- What remained unresolved? (technical / relational / epistemic closure shown **independently**)

**Seed corpus — real historical cases** (verified records, not fiction): Provider Governance · Optimization Tooling Governance (PR #754) · Presence Constraints · Developmental Publishing · Closure Differentiation · Evidence Before Archive.

## Development order (updated 2026-07-26)

1. **Capture the direction** as a held Cat-1 architectural candidate — *this document*. ✅
2. **Current-state audit** (Prompt 1) — `RECURSIVE_DEVELOPMENT_CURRENT_STATE_AUDIT_2026-07-26.md`. ✅
3. **Risk #1 investigation** — `RECURSIVE_DEVELOPMENT_RISK1_SIGNALS_VS_PATTERNS_2026-07-26.md`. ✅
4. **Constitutional Ruling** — ratified as *lex specialis* (see §Constitutional Ruling). ✅
5. **Documentation-only PR** (this doctrine + audit + Risk #1 dossier). *In progress.* **Prompt 2 stays HELD until this PR is reviewed.**
6. **Separate Service 2 investigation** (Recognition Integrity / Invariant 16) — *after* the doc PR; must not be conflated with this doctrine.
7. **Only after those two governance steps**: decide whether any implementation is authorized (Development Lineage build; Service 1 redesign). No implementation authorized from the investigation.

## Success criterion

Not *"AIN improves itself."* Rather:

> A real observation can travel from evidence → a human ruling → an authorized implementation → bounded verification, **without any stage claiming authority it does not possess.**

## Explicit non-goals (what this direction does NOT authorize)

Autonomous self-modification · automated product optimization · engagement/retention maximization · an agent that writes/merges its own code · a generic analytics dashboard · an automated governance authority · converting inference into fact · silent expansion of what evidence AIN may inspect · member scoring or interior-state inference-as-fact · inferred consent · automatic pattern-naming · automatic candidate approval · automatic priority ranking · declaring a candidate successful merely because CI passes.

## Relationship to existing canon

- **[Constitutional Direction of Authority](../canon/CONSTITUTIONAL_DIRECTION_OF_AUTHORITY.md)** — the *who*; this candidate adds the *when*.
- **[Optimization Tooling Governance](../canon/OPTIMIZATION_TOOLING_GOVERNANCE.md)** + **[Provider Governance](../canon/PROVIDER_GOVERNANCE.md)** — recent lived cycles that motivate this, and the discipline that an unbounded improvement loop is the same optimization trap wearing a governance costume.
- **Recognition integrity / "notice patterns, never name meaning"** — the pre-candidate gate is its systematic form.
- **Steward-phase caution** — a mature *human* practice should not be converted into a *platform capability* without first proving, via the corpus, that automation serves sovereignty rather than diluting lived witness.

## Open Founder decisions

1. The ledger's name (avoid "engine").
2. Whether to proceed to step 2 (build the ledger) after the current-state audit lands.
3. The scope of the seed corpus and which historical cases are in-scope.
4. Whether the steward-phase question ("is this a genuine need, or the builder reflex?") is settled affirmatively before any build.
