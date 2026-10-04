Yes. Build it as a **Claude Code Prompting Governance System**.

Core aim:

> Claude Code should not be the intelligence center.
> It should be a temporary senior contractor operating inside your sovereign system.

## 1. The basic hierarchy

```txt
MAIA / Soullab Sovereign System
│
├── Canon Layer
│   ├── product principles
│   ├── architectural invariants
│   ├── symbolic field rules
│   └── sovereignty constraints
│
├── Task Router
│   ├── Claude Code
│   ├── local coding agent
│   ├── OpenAI / other API
│   └── deterministic scripts
│
├── Work Protocols
│   ├── inspect
│   ├── plan
│   ├── patch
│   ├── test
│   ├── summarize
│   └── handoff
│
└── Memory / Archive
    ├── what changed
    ├── why it changed
    ├── what was deferred
    └── what must not be repeated
```

The important move: **Claude Code only receives the portion of intelligence needed for the task.**

Not the whole cosmology. Not the whole platform. Not the whole book. Just enough field, constraint, and file-path specificity.

---

# 2. Define Claude Code task classes

Create four classes.

## Class A — Expensive / Claude-worthy

Use Claude Code for:

* architectural refactors
* difficult TypeScript diagnosis
* production bug tracing
* schema/route/memory orchestration
* PR separation
* complex merge/rebase judgment
* subtle UX or product logic
* anything involving MAIA canon

## Class B — Moderate

Use Claude sparingly or with compressed prompts:

* new routes
* new components
* test coverage
* integration scaffolds
* database wiring
* logging / observability

## Class C — Local-agent suitable

Do **not** spend Claude Code on:

* lint cleanup
* import fixes
* boilerplate
* repetitive tests
* formatting
* renaming
* file moves
* simple React components
* README updates

## Class D — Deterministic only

Use scripts, not LLMs:

* grep checks
* build verification
* changed-file summaries
* route existence checks
* schema comparison
* dead import scans
* env var audits

This is where major savings begin.

---

# 3. Create a reusable Claude Code system prompt

Use this at the start of every serious Claude Code session:

```md
You are working inside the Soullab / MAIA sovereign codebase.

Your role is not to redesign the system. Your role is to execute a bounded engineering task while preserving existing architecture, canon, and production behavior.

Operating rules:

1. Inspect before editing.
2. Do not invent files, routes, schemas, or abstractions without verifying current structure.
3. Prefer additive changes over rewrites.
4. Preserve existing working behavior unless the task explicitly changes it.
5. Keep concerns separated.
6. Do not collapse symbolic, product, memory, and UI layers into one abstraction.
7. Do not make runtime-active changes unless explicitly requested.
8. If a change is speculative, place it in docs or behind a clear gate.
9. Use small commits with clean separation of concerns.
10. After edits, run the narrowest meaningful verification first, then broader tests if needed.

Before editing, report:
- files inspected
- current structure found
- proposed minimal change
- risks
- verification plan

After editing, report:
- files changed
- exact behavior changed
- tests/checks run
- unresolved risks
- suggested next step
```

---

# 4. Add your sovereignty constraint

This should appear in most prompts:

```md
Sovereignty constraint:

Do not make MAIA more ambient, more persuasive, more dependency-seeking, or more interpretive than the current canon allows.

MAIA should preserve user agency, distinguish evidence from interpretation, and avoid premature convergence.

When uncertain, slow the system down rather than making it more assertive.
```

That protects the soul of the system.

---

# 5. Cost-control prompt

Use this when starting a Claude Code session:

```md
Cost discipline:

Work in short bounded passes.

Do not perform broad exploration unless necessary.
Do not read unrelated files.
Do not summarize the entire codebase.
Do not propose large future architecture unless directly relevant.

If the task can be delegated to:
- a shell command
- a local model
- a deterministic script
- an existing test

then recommend that path instead of doing expensive exploratory reasoning.

Stop after completing the requested pass and produce a concise handoff.
```

---

# 6. The "inspect only" prompt

Use this before committing to bigger work:

```md
INSPECT ONLY.

Do not edit files.

Task:
[describe issue]

Please inspect the relevant files and return:

1. What exists now
2. Where the relevant logic lives
3. What is likely wrong or missing
4. Minimal change options
5. Which option is safest
6. Which files would change
7. What tests/checks should verify it

Do not implement yet.
```

This saves a lot of waste.

---

# 7. The "surgical patch" prompt

```md
SURGICAL PATCH ONLY.

Implement the smallest safe change for:

[task]

Constraints:
- no broad refactor
- no new architecture unless unavoidable
- no unrelated cleanup
- no formatting churn
- preserve current API behavior
- keep changes limited to the necessary files

After patch:
- show changed files
- explain exact behavior change
- run targeted verification
- do not proceed to next task
```

---

# 8. The "handoff to sovereign system" prompt

Use at the end of every Claude Code session:

```md
Create a handoff note for the sovereign system.

Include:

1. Task completed
2. Branch name
3. Commit hash if available
4. Files changed
5. Runtime behavior changed
6. Tests/checks run
7. Risks or unresolved issues
8. Deferred work
9. Whether this should update canon, docs, memory, or roadmap
10. Recommended next prompt

Keep it concise and factual.
```

---

# 9. The key architectural insight

You already have enough intelligence in your own system.

Claude Code should become:

```txt
Executor / diagnostician / patcher
```

Not:

```txt
Architect / oracle / memory / product brain / canon interpreter
```

The more your own system handles context, memory, routing, and canon, the less Claude Code has to "think from scratch" every session.

That is how you reduce cost without reducing quality.
