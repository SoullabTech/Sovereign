# CRP-001 — OPEN QUESTIONS

Questions raised by execution that are **not** resolved, and that must not be
resolved opportunistically inside whatever PR happened to surface them.

Each states what raised it, why it is not the same problem as the work that
found it, and what would close it.

---

## OQ-1 · Canonical preservation vs. executor visibility

> **If an artifact is canonically preserved but explicitly non-consumable by a
> class of executor, is instructional prohibition sufficient, or does CRP
> require structural context-exclusion?**

**Raised by:** committing `CRP-001-GOVERNANCE-COLLISION-REGISTER.md` into the
repository under Step 3.

**The situation.** The register is founder-facing. The mandate §0 instructs
executors not to read it, following the MDR-001 convention. Before Step 3 it
sat off-repo at `/Users/soullab`, where a cold executor working in the
repository would not have encountered it. That protection was **accidental —
a property of where the file happened to live, not a rule**. Canonical custody
removes the accident and leaves only the instruction.

**Why this is not a custody problem.** Git custody and executor visibility are
different controls answering different questions:

```text
custody      → can a later reader verify these exact bytes?
visibility   → may this reader consume these bytes at all?
```

Step 3 was scoped to the first. Solving the second by moving or omitting the
file would have quietly traded a custody guarantee for a visibility one, and
CRP-001 §17 already holds that scope is control-plane and not something an
execution unit may adjust for its own convenience.

**What would close it.** A ruling on whether CRP recognizes a structural
exclusion mechanism — a founder-only location outside the executor's reachable
tree, a marker the harness enforces, or an accepted position that
instructional prohibition is sufficient and the risk is accepted knowingly.

**Status:** OPEN. Not blocking Step 4.

---

## OQ-2 · Change classification for governance-only PRs

**Raised by:** PR #1039 failing the covenant gate — *"No change classification
found."*

**The situation.** `docs/GOVERNANCE_MENTOR_COVENANT.md` §5 defines Class A as
*anything touching consent, privacy, retention, member sovereignty… identity,
memory handling*, and Class C as *copy changes, prompt tuning inside doctrine,
refactors*. There is **no docs-only or governance-artifact category**.

A governance-only PR sits awkwardly between them:

- it changes **no runtime behavior whatsoever** — the diff is
  `docs/architecture/**` and nothing executes it;
- but the artifacts it canonicalizes **are** the member-data boundary. The
  C4 = G2 ruling is what will later authorize a witness to observe production
  traffic. Recording that ruling as durable authority is, in substance, a
  privacy/memory-handling act even though it is textually inert.

**Why this is not a one-off.** Every future CRP step — the chain registry, the
validator, the conformance suite — will produce governance-only PRs against
this same gate. Classifying this one by instinct sets an unstated precedent
for all of them.

### RULING — 2026-08-12 — **CLASS A**

> **Governance-only is not equivalent to low-risk. The diff canonicalizes
> authority over member-memory observability.**

Not because it changes runtime behavior — it does not — but because it changes
the **governing authority under which future runtime behavior may inspect and
handle member memory data**.

```text
#1039

Runtime behavior changed:       NO
Product code changed:           NO
Governance authority changed:   YES
Privacy/memory handling:        YES
Classification:                 CLASS A
```

**Classification follows the behavioral effect of the artifact, not the file
type.**

Approval path is the covenant's Class A path exactly: **Founder-Steward + 2
Council votes + 1 Mentor**. The `covenant-signoff` bootstrap bridge may be
used **only** for missing independent *approvals* — it cannot turn an A into
a C.

### Precedent established

```text
Governance documentation that merely RECORDS an already-governing fact
→ classification follows the effect of the recording, possibly lower.

Governance documentation that CREATES / RATIFIES / CANONICALIZES
an authority over privacy, consent, sovereignty, identity, or memory
→ Class A even if runtime code is untouched.
```

#1039 is the second case. Future CRP governance PRs are classified against
this distinction, not against the fact that their diffs are Markdown.

**Status:** **CLOSED** by ruling. The covenant's open question — whether the
covenant itself should carry an explicit governance-artifact category rather
than deriving it per-PR — is **not** closed by this ruling and is left to the
covenant's own stewards.

---

## LOG

- **2026-08-12** — OQ-1 and OQ-2 opened during Step 3 execution.
- **2026-08-12** — OQ-2 **CLOSED**: founder ruled #1039 **Class A**.
  `class-a` applied. Precedent recorded. Merge waits on the Class A approval
  state actually being satisfied — the label is a classification, not an
  approval.
