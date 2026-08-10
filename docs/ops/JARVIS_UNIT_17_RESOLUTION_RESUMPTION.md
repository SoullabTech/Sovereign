# JARVIS Unit 17 — Conversational Resolution + Governed Resumption

**Status:** implemented and proved. **No MAIA bridge. No member data. No natural-language permission engine.**
**Work unit:** `jarvis-unit-17-resolution-resumption`
**Branch:** `chore/jarvis-unit-17-resolution-resumption`
**Base:** `2e2999674` (Unit 16 — founder/operator input channel authentication)
**Date:** 2026-08-10

This record stands without conversation context.

---

## 1. The question this unit answers

Unit 16 established **who** answered. This establishes **what** they answered.

> **Authentication proves who answered. It does not prove what they answered.**

Therefore:

> **No conversational statement may resolve a founder/operator gate unless the
> system can prove its correspondence to the specific unresolved authority
> question.**

The failure this exists to make structurally impossible:

```
Gate A: "May JARVIS adopt provenance model X?"
Founder later says: "Yes, that looks right."
  → search recent unresolved questions
  → semantic similarity
  → assume Gate A was answered
  → resume work
```

There is no similarity scoring, no recency heuristic, no conversational
adjacency, no model inference anywhere in this unit. **Correspondence is by
reference or it does not exist.**

---

## 2. The terminal-run decision (§1, §8)

`ESCALATION_REQUIRED` **stays terminal**. `LEGAL_TRANSITIONS` still gives it `[]`,
`TERMINAL_STATES` is unchanged, and **no `AWAITING_AUTHORITY` state was added**.
`jarvis-runtime-pipeline.mjs` is untouched.

A resolution does not reopen a terminal run. It authorizes a **new run carrying
explicit lineage** — `resumes_run_id`, `resolution_id`, `gate_id`.

This yields the sentence the unit exists to make provable:

> *"Run B was not admitted because JARVIS interpreted the founder as saying yes.
> Run B was admitted because Resolution R explicitly closed Gate Q from terminal
> Run A."*

**The cost, stated plainly:** resumption is **lineage, not continuation**. The
suspended process does not literally resume; a successor run inherits the
identity and the unlocked scope. That is more truthful than mutating a terminal
disposition, and it leaves the Unit 11 state machine intact.

---

## 3. Files

| Path | Role |
|---|---|
| `scripts/builder/jarvis-authority-gate.mjs` | **New.** Gates, digests, typed resolutions, amendment narrowing, resumption verification |
| `scripts/builder/jarvis-runtime.mjs` | Resumption seam before admission; lineage stored and published |
| `scripts/builder/__tests__/jarvis-gate-resumption-proof.mjs` | **New.** 35 cases — A–Z plus M1–M12 |
| `package.json` | `jarvis:gate:proof` |

---

## 4. The lifecycle

```
bounded work reaches ESCALATION_REQUIRED (terminal)
   ↓
gate created: gate_id, authority class, immutable question,
              question digest, source run, answer vocabulary,
              bounded continuation
   ↓
authenticated answer arrives (Unit 16 instruction)
   ↓
answer explicitly carries gate_id + question_digest + typed resolution
   ↓
authority class checked against the gate
   ↓
durable resolution record
   ↓
new run admitted with resumes_run_id + resolution_id + gate_id
   ↓
Unit 15 delegation → Unit 14 admission → runtime governance
```

---

## 5. Five independent proofs of correspondence

Each is checked against a **record**, never against a caller assertion:

| Proof | Mechanism | Refusal |
|---|---|---|
| **Which question** | `gate_id` must be carried explicitly | `GATE_REFERENCE_REQUIRED` |
| **Unmutated question** | `question_digest` (SHA-256) must match | `GATE_DIGEST_MISMATCH` |
| **What kind of answer** | typed resolution from the gate's own vocabulary | `RESOLUTION_TYPE_REQUIRED` |
| **Who may answer** | Unit 16 standing + role vs gate authority class | `FOUNDER_AUTHORITY_REQUIRED` / `OPERATOR_AUTHORITY_REQUIRED` |
| **What may resume** | requested continuation ⊆ unlocked continuation | `RESUMPTION_SCOPE_EXCEEDED` |

### The gate declares its continuation *before* any answer exists

`continuation` is fixed at gate creation. An answer can therefore never choose
its own scope — it can only approve, refuse, or **narrow** what was already
declared. A gate without a bounded continuation cannot be created at all.

---

## 6. Typed resolution, not interpretation (§5)

`APPROVE` · `REFUSE` · `AMEND`, each gate declaring which it accepts.

Free text may accompany a resolution as `rationale`. **It can never close a gate.**
The proof feeds five natural approvals — `yes`, `looks good`, `I agree`,
`go ahead`, `Yes, that looks right.` — from a genuinely authenticated founder,
correct role, with the gate open, and asserts:

- with no gate reference → `GATE_REFERENCE_REQUIRED`
- **even with the correct `gate_id` and digest** → `RESOLUTION_TYPE_REQUIRED`
- resolution count unchanged, gate still `OPEN`

### AMEND may only narrow (§11)

An amendment's parameters must already exist in the declared continuation, and
each may only narrow it: array values must be a subset, scalars must be
unchanged. Introducing a field the gate never declared (`deploy_authority: true`)
is refused as `AMENDMENT_WIDENS_SCOPE`. This is what keeps amendment safe without
inventing a policy language.

---

## 7. Immutability and history (§4, §10, §12)

**A question is never edited.** `amendGateQuestion()` supersedes the gate with a
new one carrying a new digest. The original keeps its text, gains
`status: SUPERSEDED` and `superseded_by`. Answers to the old question cannot
resolve it, and the old digest does not open the new gate.

**No last-answer-wins.** A resolved gate refuses re-resolution; a contradicting
later `REFUSE` does not overwrite an earlier `APPROVE`. The first resolution
stands and remains loadable.

**`REFUSE` is durable evidence.** It closes the gate, unlocks nothing
(`continuation: null`, `permits_resumption: false`), preserves actor and
rationale, and can never later be repurposed as approval. Asking again is a new
gate, not a mutation of history.

**Supersession withdraws authorization.** A gate superseded *after* resolution
invalidates the resumption it had authorized.

---

## 8. Unit 15 and Unit 14 remain authoritative (§15)

A resolution is **not** a runtime delegation. Proved directly:

- **T** — a valid resolution with an unknown `delegation_id` is refused. A
  resolution cannot substitute for Unit 15.
- **U** — a resumed run requesting `R4_WRITE` is refused. A resolution cannot
  lift the Unit 14 principal ceiling.
- **V** — a different work identity, widened targets, or fabricated lineage are
  each refused. Resumption is not a privilege-escalation path.

---

## 9. Tests

```
npm run jarvis:gate:proof          →  35 passed, 0 failed
npm run jarvis:authority:proof     →  29 passed, 0 failed   (Unit 16)
npm run jarvis:delegation:proof    →  45 passed, 0 failed   (Unit 15)
npm run jarvis:principal:proof     →  25 passed, 0 failed   (Unit 14)
node .../jarvis-runtime-proof.mjs  →  15 passed · 0 failed  (Unit 11)
node .../jarvis-desktop-proof.mjs  →  20 passed, 0 failed   (Unit 12)
```

Hermetic; ephemeral ports; the delegate is stalled and never invoked. No live
runtime, claim registry, member data or real delegation home was touched.

| Group | Coverage |
|---|---|
| **A–K** | gate creation · opaque reference · digest binding · founder resolution · operator resolution · wrong-role refusal · missing reference · unknown gate · post-issuance amendment · **free-text-only refusal** · quoted/revoked material |
| **L–N** | duplicate resolution · conflicting resolution · refusal creates no resumption |
| **O–Z** | bounded resumed run · terminal run never reopened · new run id · lineage to run and resolution · Unit 15 required · Unit 14 required · scope conservation · superseded resolution · injection · amendment narrowing · public projection privacy |
| **M1–M12** | mutation proofs — semantic matching, recency selection, skipped digest, prose-as-type, skipped role check, last-answer-wins, refusal-permits-resumption, trusted lineage, skipped scope conservation, resolution-as-delegation, reopening the terminal run, widening amendment |

**M1 and M2 are the pair that matter**: they encode the exact bad system in the
brief — resolving by semantic similarity and by most-recent-open-gate — and both
discriminate.

---

## 10. What is still NOT true

- **No MAIA bridge, no member conversation, no member data.** Zero references to
  the runtime address anywhere in `lib/`, `app/`, `components/`.
- **No generic natural-language permission engine.** Nothing in this unit reads
  content to decide anything.
- **No production change**, no deploy, no migrations, no feature flags.
- **Gates are not raised automatically.** This unit implements the gate/resolution
  contract; deciding *when* work should raise a gate remains with the caller.
- **Resumption is lineage, not process continuation** (§2).
- **Publication is still open** — Unit 16's `PENDING_PUBLICATION` is untouched. A
  founder ruling that resolves a gate still does not mutate canon.

---

## 11. Classification

**B — core resolution/resumption is complete, with bounded residue explicitly
outside this unit.**

Not **A**: gates are not yet raised automatically by escalating work, and
publication remains open from Unit 16. Both are real, both are outside the
mandate, and neither weakens what is proved.

Not **C**: correspondence and authority semantics are complete and adversarially
proved — governed resumption is safe to use.

---

## 12. Next bounded unit

**JARVIS Unit 18 — Alpha proving walk.** End-to-end with synthetic principals and
scopes, zero member data: a bounded run escalates, raises a real gate, receives
an authenticated typed resolution, and a linked successor run completes under
Unit 15 delegation and Unit 14 admission — proved against the live local runtime
rather than in-process.
