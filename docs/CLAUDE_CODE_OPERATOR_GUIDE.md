# Claude Code Operator Guide

A practical guide to working with Claude Code inside the Soullab / MAIA sovereign codebase.

This is the **how to use it** companion to [`docs/canon/CLAUDE_CODE_GOVERNANCE.md`](./canon/CLAUDE_CODE_GOVERNANCE.md), which is the **what it is and why** canon. Read the canon for principles. Read this for daily practice.

---

## 1. What this is and what it is not

**This is:**

- A sovereignty layer
- A task-boundary discipline
- A cost and cognition management system
- A continuity-preservation structure

**This is not:**

- An AI ideology
- A restriction system
- Anti-Claude or anti-frontier-models
- A replacement for engineering judgment

The intent is to keep Claude Code useful, focused, and bounded — not to limit what it can do, but to clarify when, where, and how it should do it.

---

## 2. What we built

A small set of artifacts, merged in [PR #286](https://github.com/SoullabTech/Sovereign/pull/286):

| File | Purpose |
|---|---|
| `docs/canon/CLAUDE_CODE_GOVERNANCE.md` | Source of truth. Defines Claude Code's role, four task classes, and the system prompts. |
| `CLAUDE.md` (pointer added under Canon) | Ensures every new Claude Code session loads the governance frame. |
| `.claude/prompts/inspect-only.md` | Explore before editing. |
| `.claude/prompts/surgical-patch.md` | Smallest safe change, no scope creep. |
| `.claude/prompts/cost-discipline.md` | Bounded passes, no broad exploration. |
| `.claude/prompts/handoff.md` | End-of-session report. |
| `.claude/prompts/sovereignty-constraint.md` | Protect MAIA's core posture. |

Each prompt file carries a `<!-- Source: ... §N -->` header pointing back to the canon section it was extracted from. The canon is the single source of truth; prompts are extractions, not forks.

---

## 3. What we actually created

Not a prompt library. A **governance membrane** between five layers:

- **Sovereign architecture** — the codebase, its invariants, its design
- **External inference engines** — Claude, OpenAI, local models
- **Operational execution** — commits, PRs, deployments, verification
- **Canon authority** — the rules, principles, and vows that govern the system
- **Runtime behavior** — what users actually experience

The membrane keeps each layer's concerns from collapsing into the others. Without it, Claude Code drifts into redefining architecture, becoming system memory, or quietly rewriting canon through accumulated edits. With it, Claude Code stays where it belongs.

---

## 4. The core principle

> Claude Code is an executor, diagnostician, and patcher.
> Not an architect, not system memory, not the canon interpreter.

The codebase already contains the intelligence. Claude Code receives only the portion needed for a specific task — not the whole cosmology, not the whole platform, just enough context, constraint, and file-path specificity.

This prevents:

- The tool implicitly redefining the ontology
- Architecture drifting session by session
- Canon becoming emergent rather than intentional
- Context becoming ambient (which costs both money and sovereignty)

---

## 5. How to use it day-to-day

The five prompts are designed to be **copy-pasted into the start of a Claude Code session**, individually or in combination.

### Starting a session

| If… | Paste this |
|---|---|
| The task is unclear or surface area is unknown | `inspect-only.md` |
| Cost or scope might balloon | `cost-discipline.md` |
| The change touches voice, expression, relational tone, or user-facing behavior | `sovereignty-constraint.md` |

These can stack. A typical opener for a sensitive task: cost-discipline + sovereignty-constraint + the actual task description.

### Inside a session

Once inspection has yielded a clear minimal change, paste `surgical-patch.md` with the specific task. This binds Claude Code to the smallest safe edit and prevents drift into adjacent files.

Resist the urge to bundle "while we're here" cleanups. Adjacent improvements belong in their own pass.

### Ending a session

Before merging or closing, paste `handoff.md`. The output is a concise, factual report: task completed, files changed, runtime behavior changed, tests run, risks, deferred work, whether canon or memory needs updating.

The handoff is the bridge between a Claude Code session and the sovereign system's memory. Without it, what changed and why lives only in commit messages, which decay quickly.

---

## 6. Task classes — knowing what belongs in Claude Code

The canon defines four classes. The earliest cost savings come from being honest about which class a task is in.

- **Class A — Claude-worthy.** Architectural refactors, schema or route orchestration, complex bug tracing, anything involving MAIA canon. *Use Claude Code.*
- **Class B — Moderate.** New routes, new components, integration scaffolds. *Use Claude Code with compressed prompts.*
- **Class C — Local-agent suitable.** Lint, formatting, renames, file moves, repetitive tests, simple components. *Don't spend Claude Code on these.*
- **Class D — Deterministic only.** Grep checks, build verification, route audits, env var audits. *Use scripts, not LLMs.*

A useful instinct: if a shell command, a deterministic script, or an existing test could do the job, recommend that path instead of using inference.

---

## 7. What to watch for

The membrane is new. It must be observed before it is tightened.

Watch for:

- **Token burn patterns** — sessions that re-explain the same context repeatedly. Repeating context = candidate for compression or canonization.
- **Prompt drift** — a session shape that worked before that stops working. Means the prompts need refinement, or the underlying task changed class.
- **Repeated session shapes** — patterns that recur often enough to deserve their own prompt, script, or routine.
- **Where governance prevents damage** — confirm the rules are doing useful work.
- **Where governance slows useful work** — confirm the rules are not over-tight.
- **Where routing wants to emerge naturally** — the seam between Claude / local / script will surface in real use, not from speculation.

The discipline is: **observe before tightening**. Do not pre-architect the next layer. Let the membrane reveal it through 3–5 real sessions.

---

## 8. What's deferred (do not pre-build)

Five next moves are identified but explicitly held:

1. **Local-model delegation layer** — largest cost ceiling, most surface area
2. **Deterministic tooling layer** — cheapest first build
3. **Memory packet compression** — subtle, benefits everything
4. **Task classification router** — the keystone (gates which engine handles which class; the other four plug into it)
5. **Contributor execution protocols** — matters when contributors beyond Kelly arrive

None should be built until real sessions surface the seam that points at one of them.

---

## 9. When to revisit this membrane

Trigger a review when one of the following actually happens (not in anticipation):

- More agents enter the stack
- Local models become genuinely production-ready for part of the pipeline
- Contributors beyond Kelly begin running Claude Code sessions
- MAIA acquires deeper memory or orchestration capability that overlaps with Claude Code's current job
- Session cost or drift becomes unacceptable in observable, repeatable ways

Until one of those fires, the answer to *should we build the next layer* is **not yet**.

---

## 10. Maintenance rules

- **Edit the canon, not the prompts.** Prompts are extractions. If a rule changes, update `docs/canon/CLAUDE_CODE_GOVERNANCE.md` first, then re-extract.
- **Keep the `CLAUDE.md` pointer in place.** It's what makes the governance load on every session.
- **Don't add a new prompt without a canon section to back it.** If you find yourself wanting one, write the canon first.
- **Don't let `.claude/prompts/` grow into a sprawling library.** Five is enough until real use proves otherwise.
- **Treat any drift toward Claude Code "redesigning the ontology" or "becoming system memory" as a canon violation**, regardless of technical merit.

---

## 11. File map

```
docs/canon/CLAUDE_CODE_GOVERNANCE.md      # canon — what it is and why
docs/CLAUDE_CODE_OPERATOR_GUIDE.md        # this document — how to use
CLAUDE.md                                 # pointer under Canon
.claude/prompts/
  inspect-only.md
  surgical-patch.md
  cost-discipline.md
  handoff.md
  sovereignty-constraint.md
```

---

## 12. The one-line summary

> Claude Code is a temporary senior contractor inside a sovereign system. The canon defines the contract. The prompts are how the contract is enforced session by session. The membrane is what the contract protects.
