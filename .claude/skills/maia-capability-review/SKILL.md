---
name: maia-capability-review
description: Evaluate a MAIA capability end-to-end as a lived function, not a page or module — existence, function, purpose, integration, and next evolution. Use when asked to "review X as a MAIA capability", audit whether a feature actually works for members, or classify a surface's completeness (A–E). Read-only by default; never implements.
---

# MAIA Capability Review

*"Does the route load?" is not the question. "Can a person actually do this thing
with MAIA, and does MAIA carry it?" is.*

Invoked as: **`review <capability> as a MAIA capability`**.

⛔ **READ-ONLY BY DEFAULT.** This skill produces a decision instrument, never a
change. Implementation requires separate authorization, always as its own unit.

**Governing authority:** [`docs/governance/JARVIS_STEWARDSHIP_CONSTITUTION_2026-08-12.md`](../../../docs/governance/JARVIS_STEWARDSHIP_CONSTITUTION_2026-08-12.md).
The evidence discipline below is this skill's local procedure for constitutional §2 and
§3; the constitution governs, and applies to every claim JARVIS makes anywhere — not
only inside a review.

---

## Standing evidence rules (non-negotiable)

These exist because each was learned by getting it wrong:

1. **Liveness is not a row count.** Three queries minimum: total, **distinct-owner
   distribution** (test fixtures identified), **recency of writes**. A count says
   data exists; only distribution + recency say it is *used*.
2. **Distribution is not provenance.** Rows can span many members and still be
   100% machine-authored. Ask *who authored this row* separately from *how many
   members have rows*. (Relational Field 2026-08-10: 20+ members, ~98% inferred.)
3. **Never assume which route is live.** Query `agent_runs.origin_route` over 30
   days. Docs go stale; traffic does not lie. (A guard once sat on the route
   carrying 0.4% of traffic while the 99.6% route was unguarded.)
4. **File existence ≠ live caller.** Count importers, then check whether the
   importer itself is live. A sophisticated service whose only consumer returns
   410 is dead.
5. **Model vocabulary ≠ rendered vocabulary.** Quote member-facing labels from the
   render, never from a comment, constant, or enum.
6. **Name the evidence class per claim** — render · test · source · production
   data. Never silently substitute a weaker class for a stronger one.
7. **Stop at the evidence boundary.** If proving a claim needs production
   mutation or new instrumentation, mark it **UNPROVEN**. Never manufacture proof.
8. **Capability preservation.** *Unused*, *unreachable*, or *imperfectly governed*
   never means *unwanted*. Historical existence is evidence, not authorization;
   current absence is evidence, not prohibition. Report disposition questions;
   do not resolve them.

---

## The five layers

Answer each independently. Do not let a pass at one layer imply a pass at another.

### 1. Does it exist?
Route implemented · deployed at the live SHA · reachable · authenticated
correctly · connected to the intended APIs and tables. Verify against the SHA
production actually runs, not the working tree.

### 2. Does it function?
⚠️ **This layer requires exercising the gestures.** Rendering is not functioning.
Walk the real path: create → act → persist → leave → return → is it still there?
Confirm each gesture reached the database, not merely the API. Inventory any
control that is present but does nothing — **dead UI is a finding, not a detail**.

### 3. Does it fulfil its intended purpose?
Recover the governing intent first (canon, spec, founder ruling), then compare
behavior against it. ⛔ "Tests pass" is not an answer here. Ask the capability's
own question in human terms — for Relationship: *can MAIA know this person exists
in my life, carry the evolving texture, distinguish what I told it from what it
inferred, and accompany rupture and repair?*

### 4. Is it integrated with MAIA, or an isolated mini-app?
Check each seam that should exist: conversation · memory · episodes · Sanctuary ·
consent/provenance · practitioner context · member identity · House navigation ·
relational signals. For each: **wired · declared-but-severed · absent**.
⭐ Also look for **competing models of the same thing** — two tables for one
concept is a finding of the first order.

### 5. What should happen next?
Rank by increase in human usefulness, ⛔ never by ease of implementation.

---

## Classification

| | |
|---|---|
| **A** | Fully functioning — all layers pass, verified behaviorally |
| **B** | Functioning with bounded gaps — name each gap exactly |
| **C** | Partially functioning — core gestures work, chain incomplete |
| **D** | Facade / substrate missing — presents, does not carry |
| **E** | Unsafe or governance-blocked — surface immediately, ahead of everything else |

**E outranks the other layers.** A containment or consent failure is reported
first and separately; it is never folded into a completeness score.

---

## Method

1. **Recover intent** — canon, specs, founder rulings, prior audits. ⭐ Check
   whether a prior review already answered layers; **do not re-run settled work** —
   carry it forward with its date and evidence, and say which layers are new.
2. **Locate implementation** — routes, components, services, tables, migrations.
3. **Establish liveness** — production SHA, `agent_runs.origin_route`, row
   distribution + recency, importer counts.
4. **Map the chain** — draw the full path the capability claims, and mark each
   hop alive / severed / absent. The severed hop is the finding.
5. **Walk the member journey** — authenticated, via a sanctioned local fixture.
   ⚠️ Screenshot-producing verification goes to a **subagent**; the parent takes
   findings only. ⛔ Never fabricate a session, create accounts, or enter
   credentials. ⛔ Never walk production with member data.
6. **Check boundaries** — Sanctuary, consent, provenance, scoping. Independently
   and early.
7. **Inventory the debris** — dead UI, duplicate architectures, orphaned services,
   latent capability worth preserving.
8. **Classify and propose** — A–E with evidence per layer, the **first broken
   seam** for every incomplete capability, and bounded next units, unexecuted.
9. **STOP.**

---

## Output

One document under `docs/architecture/audits/`. Required sections:
intent · what exists · liveness evidence · the chain (per-hop status) · the five
layers answered separately · boundary findings · debris inventory · **classification
with per-claim evidence class** · first broken seam per gap · bounded next units
· explicit UNPROVEN list.

⛔ Do not implement. ⛔ Do not begin the next unit. ⛔ Do not touch historical data.
