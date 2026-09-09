# D6 — Process continuity · 2026-09-09

**Status**: **D6 COMPLETE · GATE D6 PASS · STOPPED BEFORE D7.**
**Continues**: D5 PASS. Product definition and north star at `e9c845d9f`.
**Constraint**: specification only. No UI candidates, implementation, schema, routes or migration.

> ### Continuity preserves what happened. It does not decide what matters now.

**Carried unchanged, ratified:**
> *Persistence confers neither present authority nor presumptive relevance.*
> *Consent to remember is not consent to be interpreted through the memory every time.*

---

## 1 · The instrument — five categories, and a persisted fact may acquire none of the others

```text
HISTORICAL FACT     this happened
PRESENT AUTHORITY   MAIA may act on this now
PRESENT RELEVANCE   this matters now
STANDING            this holds until revoked
AUTHORSHIP          this bears on who made what
```

⭐ **The whole of D6 is the rule that a fact in the first column may not silently migrate into any other.**

| What persists | Historical fact | Present authority | Present relevance | Standing | Authorship |
|---|:--:|:--:|:--:|:--:|:--:|
| writer-stated intention / question | ✅ | — | ⛔ never inferred | — | — |
| process thread | ✅ | — | ⛔ | — | — |
| active / last Work locus | ✅ | — | ⛔ *(restores position, claims no priority)* | — | — |
| conversation | ✅ | — | ⛔ | — | — |
| offered observations | ✅ | — | ⛔ **resurfacing would be this claim** | — | — |
| explicit writer decisions | ✅ | — | ⛔ | — | — |
| revision + proposal ancestry | ✅ | — | ⛔ | — | ✅ **legitimately** |
| **writer standing acts** | ✅ | — | — | ✅ **by definition** | — |
| unresolved questions | ✅ *historical context only* | — | ⛔ | ⛔ | — |

**Two rows are exceptions, and both are principled.** *Revision and proposal ancestry* bears on authorship because that is what provenance is for (D5 §6A). *Writer standing acts* carry standing because the writer created them as standing — **the writer may establish a standing; the system may never derive one.**

## 2 · The commission boundary

Now that MAIA may perform substantive editorial work, this is the sharpest continuity risk.

```text
PERSIST                    "Kelly commissioned substantial editing here."
DO NOT PERSIST AS AUTHORITY "Kelly currently authorizes substantial editing here."
```

**The historical act survives. The present authorization does not.**

### 2.1 · ⚠️ "Continuing" vs "resuming" must be observable, never inferred

The boundary cannot be a timeout. **A duration threshold is a system judgment about the writer's attention** — precisely what §3 refuses for threads, and it would arrive here by the back door.

```text
LAWFUL — observable discontinuity
  session ended · page reload · new device · app restart · connection lost

UNLAWFUL — inferred inactivity
  "no input for N minutes" · idle detection · attention scoring
```

⭐ **A writer who steps away for two hours and returns to the same live page has not resumed** — nothing observable broke, and iteration continues seamlessly. **A writer who reloads has resumed**, however brief the gap. The system reads facts about itself, never facts about the person.

### 2.2 · ⭐ Re-grounding happens before MAIA next generates — not on arrival

**A re-grounding question on arrival would be the forced "continue where you left off" card the prohibitions forbid**, wearing a politer name.

```text
ARRIVAL              silent. The Work, where they left it. Nothing asked.
WRITER JUST WRITES   nothing is ever asked. The commission simply never fires.
MAIA ABOUT TO ACT
UNDER A PRIOR
COMMISSION           re-ground first, cheaply, once:
                     "We were working this passage together. Keep going here?"
```

**The question appears at the moment of MAIA's act, not the writer's arrival.** One gesture re-grounds it. No consent ceremony, and no silent carry-forward.

## 3 · Thread lifetime — **F-D2-3 ANSWERED**

⛔ **No system-inferred `active` / `stale` / `expired` / `unfinished`.** Those become judgments about the writer's attention, and each would license resurfacing.

```text
HISTORICALLY AVAILABLE   +   PRESENTLY ENGAGED / NOT PRESENTLY ENGAGED
```

**"Live" is established by present engagement — never by elapsed time or an algorithm.** A thread may remain available indefinitely without remaining live.

```text
OLD THREAD DISAPPEARS      -> continuity lost
OLD THREAD KEEPS SUMMONING -> memory acquires authority
NEITHER                    -> the past remains reachable, the present remains free
```

> ### The past remains reachable. The present remains free.

## 4 · Resume order under Option C

```text
1  THE WORK                    canonical, where they left it
2  last locus
3  the writer's prior words / thread, if relevant
4  MAIA's observations and analysis, behind that
```

⛔ **Never:** `MAIA's memory of what we were doing → the Work.` **That would recreate the one-entrance defect across sessions** — the writer arriving into MAIA's account of their own work rather than into their work.

Arrival restores the Work. Everything else is **reachable, not presented.**

## 5 · Prohibitions — and the mechanism they share

```text
no unresolved-item badges          no unfinished-thread counts
no automatic resurfacing           no "continue where you left off" entrance
no priority decay / engagement scoring
no inferred current intention      no persisted commission as authorization
```

⭐ **Every one of these is the same move: converting a stored fact into a present claim.** Naming the mechanism makes the list extensible rather than a checklist to route around — **anything that makes the system the decider of what matters now is prohibited, whether or not it appears above.**

A writer may have twenty prior questions, sit down, and write a new paragraph. **That is lawful and unremarkable, and nothing in the system may treat it as neglect.**

---

## Gate D6

> **Gate D6**: resuming a process may offer prior context, but the writer must be able to re-ground or supersede it cheaply.

```text
GATE D6      PASS
```

**Evidence**: prior context is **reachable, never presented** (§4); nothing is resurfaced, counted, badged or scored (§5); threads carry no system-assigned state to supersede (§3); and the only question the system ever asks is a single re-grounding gesture, fired by MAIA's act rather than the writer's arrival (§2.2) — which is both cheap and skippable by simply writing.

```text
D7                        NOT OPENED — experience candidates
IMPLEMENTATION            NOT AUTHORIZED
SEL-0B · selector · F-7 · UI · schema · migration · merge · deploy   NOT TOUCHED
```

**Carried**: F-D2-2 · F-D2-5 (open, non-blocking). **F-D2-3: ⭐ CLOSED at §3.**
