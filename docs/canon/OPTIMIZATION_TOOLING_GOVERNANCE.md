# Optimization Tooling Governance

**Status:** Canon (ratified 2026-07-26). Governs automated code-optimization tools — [AIDE](https://metr.org/AI_R_D_Evaluation_Report.pdf)/[Weco](https://github.com/WecoAI/weco-cli)-class search optimizers and any successor.

**Complementary to [`PROVIDER_GOVERNANCE.md`](./PROVIDER_GOVERNANCE.md), not overlapping — the two answer different questions:**

- **Provider Governance** — *Who may enter the runtime, and under what conditions?*
- **Optimization Tooling Governance** (this document) — *What kinds of optimization are legitimate, and where are their constitutional boundaries?*

Development-lane relationship: [`docs/ai/MULTI_MODEL_SESSION_MODE.md`](../ai/MULTI_MODEL_SESSION_MODE.md).

---

## Founder Ruling

**Kelly W. Nezat — 2026-07-26**

> Weco may be used as an offline engineering optimization tool for constitutionally bounded technical objectives. It may not optimize, infer, or redefine relational, behavioral, developmental, or governance outcomes. Any objective function must be explicitly human-authored, reproducible, and subordinate to AIN's governing principles. Weco has no authority over runtime behavior and grants no standing as a runtime provider.

---

## Governance Principle

*The enduring rule — true independent of any particular tool, vendor, or deployment. It should still read correctly when the tool is no longer called Weco.*

> Optimization is legitimate only within constitutionally bounded domains where the objective is explicitly defined by humans and remains subordinate to the platform's governing principles.

The problem is never the existence of a metric — every engineering system optimizes metrics (compiler speed, battery life, cache hit rate). The problem is **unbounded optimization**. Two questions draw the boundary:

1. **Who chooses the objective?** It must be human-authored — never discovered, inferred, or proposed by the optimizer.
2. **What authority does the optimizer hold over it?** It may propose changes that move a bounded, human-set metric. It may never redefine what counts as success, and it may never ratify its own output.

An optimizer proposes; a human decides. This holds whether the tool is Weco or something not yet built.

---

## Background — why the distinction matters

Prompted by the question: *can we use Weco for recursive self-improvement of AIN and MAIA?* Weco is the AIDE algorithm as a CLI — an LLM-guided tree search that repeatedly rewrites source files, runs a human-supplied eval script, parses **one numeric metric** it prints, and keeps edits that move that metric. It is an engineering optimizer against an explicit objective function, **not an architectural or governance decision-maker.**

"Recursive self-improvement of MAIA" is too broad; three different things hide inside it:

1. improving the **codebase** — the only category an optimizer like Weco is shaped for;
2. improving the **models** — different governance;
3. improving the **relationship with members** — a governance question, never an optimization problem.

## Allowed domains

Bounded, measurable, non-behavioral objectives, each evaluated against a **frozen evaluation corpus** (versioned · frozen · synthetic or explicitly approved · reproducible — otherwise iterations cannot be meaningfully compared) with **no member data in the loop**:

STT accuracy · VAD tuning · vector-search recall · cache efficiency · memory-indexing speed · parser robustness · audio buffering · streaming chunk size · token efficiency · database query performance · FAST-path latency · retrieval quality.

## Forbidden domains

Automated optimization of the following is prohibited — these are governance questions decided by humans under canon, never targets a metric may search for:

attachment · persuasion · disclosure · dependency · emotional influence · trust manipulation · conversational steering · memory-retention policies · consent boundaries.

## Conditions of use

Cloud orchestration is a **deployment concern, not a constitutional one** — a cloud-orchestrated developer tool is acceptable when all of the following hold:

- **no production dependency** — nothing in the runtime path depends on it;
- **no member data** — the corpus is synthetic or explicitly approved;
- **removable without architectural impact** — deleting it changes nothing structural;
- **equivalent alternatives remain possible** — no lock-in.

Runtime systems remain self-hosted regardless; this document governs offline tooling only.

## Relationship to existing governance

- Grants **no standing as a MAIA runtime provider** — the same firewall the Kimi development lane carries ([`MULTI_MODEL_SESSION_MODE.md`](../ai/MULTI_MODEL_SESSION_MODE.md)). Runtime admission is governed solely by [`PROVIDER_GOVERNANCE.md`](./PROVIDER_GOVERNANCE.md).
- **Human authority is retained end to end**: Claude routes, a tool may search within bounds, Kelly decides. The optimizer proposes; it never ratifies.

---

## See also — constitutional map

The governing layer reads as a set of complementary questions, not independent documents:

- **[Provider Governance](./PROVIDER_GOVERNANCE.md)** *(canon)* — *who* may enter the runtime, and under what conditions.
- **[Optimization Tooling Governance](./OPTIMIZATION_TOOLING_GOVERNANCE.md)** *(canon)* — *what* optimization authority is legitimate, and where its boundaries lie.
- **[Attention-Salience Principle](../ux/ATTENTION_SALIENCE_PRINCIPLE_CANDIDATE_2026-07-26.md)** *(candidate — not yet ratified)* — *how* interaction should present decisions.
- **Voice Interaction Architecture** *(Cat-1 candidate, sealed — not yet ratified)* — the technical architecture implementing these principles.
- **[Multi-Model Session Mode](../ai/MULTI_MODEL_SESSION_MODE.md)** — the development lane within which these tools operate.
