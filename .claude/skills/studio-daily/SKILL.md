---
name: studio-daily
description: Run the daily Writer's Studio observation loop — what changed in real writer behavior since the last review, what surprised us, what writers did instead, what remains unresolved, and what must stay untouched. Use for a daily or periodic Studio review, when asked how writers are actually using the Studio, or to check whether anything has earned intervention. Observational only; never creates tasks and never proposes features.
---

# Daily Studio Loop

Governed by **[JARVIS Stewardship Constitution](../../../docs/governance/JARVIS_STEWARDSHIP_CONSTITUTION_2026-08-12.md)** — read it first. This
skill does not restate it.

```
STANCE:  Ethnographer, not product manager.
OUTPUT:  A reading of what is happening. Never a backlog.
⛔ NOT:  Task creation · feature proposals · redesign · fixing what you see.
```

**North star:** *Are writers increasingly able to forget the Studio and remain with the
work?*

---

## The loop

```
real use since last review
  → meaningful changes
  → surprises
  → what the writer did instead
  → crossings
  → unresolved questions
  → intervention threshold
  → what must remain untouched
```

⛔ **This loop terminates in a reading, not a decision.** If you find yourself drafting a
repair, you have left the loop. Note it and stop.

---

## Gathering (production, read-only)

Never read draft or manuscript **content**. Counts, timestamps, and distinct owners only.

```bash
run() { ssh soullab@minisforum "docker exec maia-postgres psql -U soullab maia_consciousness -c \"$1\""; }

# Writing activity — the primary signal. Distinct owners + recency, never a bare count.
run "SELECT left(d.member_id::text,8) AS member, d.revision_count revs,
     length(d.content) chars, d.updated_at last_write
     FROM manuscript_working_drafts d ORDER BY d.updated_at DESC;"

# Checkpoints — deliberate acts, not autosave. A writer marking a moment.
run "SELECT left(saved_by::text,8) AS member, count(*) checkpoints, max(created_at) latest
     FROM working_draft_revisions GROUP BY 1 ORDER BY latest DESC;"

# Gravity: which rooms hold anything at all, and when they were last touched.
run "SELECT 'living_works' t, count(*) n, count(DISTINCT member_id) owners, max(updated_at) latest FROM living_works
     UNION ALL SELECT 'living_work_materials', count(*), 0, NULL FROM living_work_materials
     UNION ALL SELECT 'manuscript_keeps', count(*), count(DISTINCT member_id), max(created_at) FROM manuscript_keeps;"

# Is MAIA anywhere near the writing?
run "SELECT origin_route, count(*) FROM agent_runs
     WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY 1 ORDER BY 2 DESC;"
```

Also gather, and weight **higher** than any query above: anything a writer said to a
human. Their words are the strongest evidence this loop can carry.

---

## The six outputs

Answer each. An empty answer is a legitimate result — say "nothing" rather than
manufacturing an observation.

### 1. What became more real
Only changes that represent a person doing something. A writer returning after two days
is more real than a thousand autosaves. Name the evidence class (§3): production data ·
their words · source · test.

### 2. What surprised us
Hesitation, mistrust, unexpected desire, or a writer asking a human what the software
means. **Capture exact words** (§4). ⛔ Do not resolve the surprise in the same breath as
recording it.

### 3. What did the writer do instead
⭐ **The gravitational field.** This is the field most likely to be skipped and most
likely to matter.

- Which surface did she return to, having had others available?
- Where did she leave one room for another, and at what moment?
- What did she do **outside the Studio** — Word, Notes, Finder, email, paper — and for
  what job?
- What did she name differently than the product names it?

Improvising outside the system is not a usage failure. It is the clearest possible
signal of a missing or broken crossing, and it is invisible to feature analytics.

### 4. Crossings
Transitions where **both endpoints work** but the human crossing is weak, invisible,
misleading, or semantically overloaded (§5). Name the crossing; do not name a feature.

Standing register — classify, do not act:

| | Crossing | Status |
|---|---|---|
| A | Source exists → writer cannot feel her original is safe | repair staged, awaiting uncontaminated walk |
| B | Import succeeds → writer reads representation loss as damage to her manuscript | OBSERVED / UNDIAGNOSED |
| C | Keeps exists → ordinary "keep" collides with product "Keeps" | OBSERVED / significance pending |
| D | Canvas exists → writer may never discover why she would go there | OBSERVED / no demonstrated pull |

### 5. What remains unresolved
Including disposition questions that are the founder's, not JARVIS's. Currently open:
**no writing surface generates any MAIA runs.** Whether writing is better for that
absence or impoverished by it is not decidable from telemetry, and this loop must not
decide it.

### 6. Has anything earned intervention?
Default answer: **no.** Intervention is earned only when *all* hold:

- real human evidence, not inference
- the failure is repeated or consequential
- the cause is bounded
- it prevents someone from inhabiting the system
- changing it now would **not** contaminate ongoing observation
- a smallest repair addresses the crossing without redesign

⛔ Novelty, spare capacity, and architectural possibility are not evidence (§7).

### 7. What must remain untouched
State this explicitly, every time. Naming what stays still is as much the product of this
loop as naming what moved — it is what stops accumulated observation from turning into
accumulated work.

---

## Stop conditions

Stop and report rather than continuing when:

- a writer is **actively writing** — do not deploy, migrate, or disturb the surface
- answering a question would require asking a writer a leading question
- the reading would need production mutation or new instrumentation to prove
- you are about to explain the product to a writer who just showed you confusion (§4)

---

## Do not invoke this skill to

- plan Studio work, size a backlog, or justify a change already decided on
- evaluate a capability end-to-end — that is `maia-capability-review`
- build or repair anything in the Studio — that is `writers-studio-product-steward`
- study one surface's lived experience in depth — that is `field-study`
