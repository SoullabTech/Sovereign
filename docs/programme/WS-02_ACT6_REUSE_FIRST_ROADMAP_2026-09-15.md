# WS-02 · ACT 6 — REUSE-FIRST ROADMAP

**From ACTS 1–5, at canonical `b22945ac8`.** ⛔ Sequencing only — no
implementation, no source changes, no retirement, no schema, no deploy.

```
genuinely new capabilities    1
new architectural systems     0
```

ACT 4's four amendments are carried: second ADD **withdrawn** · keeps/marked-lines
is a **RENAME** · the unconverted state **must announce itself** · section/unit
reading scopes carry a **wiring risk**.

---

## 1 · ⚠️ The dependency graph, verified — and it differs from the illustrative order

The suggested order put **MAIA convergence before adoption**. The graph refuses
that:

> ⭐⭐ **Making `EditorialConversation` the only MAIA, before adoption exists,
> INTRODUCES a cost-5 fracture that does not exist today.** Today's default MAIA
> forgets — bad, but it never shows the writer a version lineage and never says
> *"nothing changes until you explicitly adopt a version."* Converge first and
> every member meets a complete editorial exchange that **cannot conclude**, on
> every turn, by default.

**ADOPTION-01 must land before or with MAIA-CONVERGENCE-01.**

Second correction: **return splits in two.** Restoring the chapter is
independent and immediately valuable; restoring *the relationship* only means
anything once editorial threads are what members actually have.

```
RETURN-LOCUS-01 ──────────────────────────┐
                                          ├──► REAL-WORK-ACCEPTANCE-01
WRITING-STATE-ANNOUNCE-01 ────────────────┤        (Horizon 1 closes)
                                          │
ADOPTION-01 ──► MAIA-CONVERGENCE-01 ──────┘
                      │  (carries RETURN-RELATIONSHIP)
                      ▼
        DEVELOPMENTAL-IN-ROOM-01
        LOCUS-CAPABILITIES-01  (emerging · keeps · collections)
        WORK-CAPABILITIES-01   (materials · structure · prepare)
                      │
                      ▼
               VOCABULARY-01
                      │
                      ▼
            LEGACY-RETIREMENT-01
```

---

## 2 · Horizon 1 — make the Studio whole

*The smallest set after which Kelly can use Writer's Studio for Chapter 10
without falling through a seam.*

### 01 · `RETURN-LOCUS-01`

| | |
|---|---|
| **Human problem** | Return opens Chapter 1 (cost 5) |
| **Existing substrate** | `manuscript_draft_sections.updated_at`; the `?s=` parameter and `resolveInitialSection` already exist |
| **Actual new work** | one read, and a section id on Home's Return link |
| **Risk** | ⚠️ *last written* is unambiguous; **"where she left off" must not become a ranked guess** across Works or relationships |
| **Witness** | Home names the chapter; the link carries it; the room opens there; ⛔ an empty draft still opens honestly |
| **Retirement unlocked** | none |

### 02 · `WRITING-STATE-ANNOUNCE-01`

| | |
|---|---|
| **Human problem** | Section / Whole / Worktable chosen server-side and unexplained — a product decision **concealed** |
| **Existing substrate** | `write-state` → `chooseMount` already returns the reason |
| **Actual new work** | say it: *this Work isn't in chapters yet* |
| **Risk** | ⚠️ turning an explanation into a **nudge to convert** — conversion stays the member's act |
| **Witness** | each mount states which scale it gave and why; the unconverted notice is not a call to action |
| **Retirement unlocked** | Worktable as a *concept* (not yet as code) |

### 03 · `ADOPTION-01` — ⭐ the one genuinely new capability

| | |
|---|---|
| **Human problem** | The decision cannot land (cost 5); a standing promise with no control |
| **Existing substrate** | `authorizeVersion` · `evaluateExecutionFit` · `executeAuthorization` · `readAuthorizationStatus` — **complete, tested, zero importers** |
| **Actual new work** | **one route + one member gesture + one confirmation that states the change in her words** |
| **Risk** | ⛔⛔ adoption becoming implicit; ⛔ the confirmation describing the *system* instead of the *book*; ⛔ execution-fit being re-implemented in the UI instead of consumed |
| **Witness** | ⭐ the human test: *compare → choose → adopt → see exactly what will change → the manuscript changes only if the existing rules permit* — and each refusal reads as a true sentence about her book (`stale_base` → *you've written here since*) |
| **Retirement unlocked** | none — it **completes** rather than replaces |

### 04 · `MAIA-CONVERGENCE-01` (carries RETURN-RELATIONSHIP)

| | |
|---|---|
| **Human problem** | Three presences, three memories; the prior relationship unreachable (cost 5) |
| **Existing substrate** | the whole editorial runtime; `proposal_chains.target_section_id` + `ask_threads` + `ask_turns.created_at` for the relationship read |
| **Actual new work** | one read (*threads for this section*), a **choice** surface, `MaiaColumn` reshaped to the arrival state, the flag's default |
| **Risk** | ⭐⭐ **the single greatest risk in the roadmap** — that "meaningful return" quietly becomes the most-recent guess UI-01A refused. ⛔ It must not. Each thread is named by **the passage it began from**, which is what a writer recognizes |
| **Witness** | *Kelly leaves Chapter 10 mid-relationship and returns tomorrow: the Studio restores the Work and the chapter, surfaces the open relationship, and **never invents which one she means when more than one exists**.* Plus: one thread → offered, not auto-opened; two → both shown; zero → a new one only on her gesture |
| **Retirement unlocked** | `StudioConversation`, `AskMaia.tsx` — ⛔ not removed here |

### 05 · `REAL-WORK-ACCEPTANCE-01`

> ⭐⭐ **AT ACT 05, WRITER'S STUDIO BECOMES REAL.** Chapter 10 moves in as
> primary environment. Not a code act — a **use** act, whose findings are the
> input to Horizon 2. *The roadmap returns to using the Studio rather than
> architecting it.*

---

## 3 · Horizon 2 — converge the organism

| | Act | Reuses | New work | Risk |
|---|---|---|---|---|
| 06 | `DEVELOPMENTAL-IN-ROOM-01` | readings substrate; ⭐ `ReadingScope` already admits `section` | commission a reading **from the locus**; render three-state per observation | ⚠️ the **wiring risk** — `section`/`unit` have no caller today, so the first one must be witnessed, ⛔ not assumed. And ⛔ never flatten *frozen reading* into *live conversation* |
| 07 | `LOCUS-CAPABILITIES-01` | `candidates` (emerging) · `keeps` · `collections` | bring them beside the section | ⛔ emerging must stay **member-pulled** — nothing ambient |
| 08 | `WORK-CAPABILITIES-01` | materials · structure · `render` | *Prepare* as a **mode**, not a room; converge three structure displays to one | ⛔ export must not silently become a second Studio again |
| 09 | `VOCABULARY-01` | — | one name per object: **keep** vs *marked line*; *manuscript/draft/section*; two meanings of *adopt* | ⚠️ renaming before convergence renames in two places — this is **why it is act 09** |

---

## 4 · Horizon 3 — retire, only after the replacement is witnessed

| | Act | Safe once |
|---|---|---|
| 10 | `LEGACY-RETIREMENT-01` | every capability has a witnessed home |

Removes: `StudioConversation` · `AskMaia.tsx` · `/writers-studio/review` ·
`/press/manuscript` as a member concept · `/press/studio` (finish the redirect) ·
the editorial feature flag once it is the default.

⛔ **Retirement is never a shortcut to convergence.** ⛔ Redirects preserved.
⛔ `/api/writers-studio/focus` containment and `/book-studio` remain their own
acts. ⚠️ `editorialWorkspace/` stays **unruled** — a substrate is not retired on
navigation evidence.

---

## 5 · What ships together

- **03 + 04 together, or 03 first.** ⛔ Never 04 alone.
- **01 + 02** can ship alone and are the cheapest real gain available today.
- **06–08** are independent of each other and can ship in any order.
- **09 after 06–08**, **10 after everything**.

---

## 6 · The build order

```
HORIZON 1 — make the Studio whole
  01  RETURN-LOCUS-01
  02  WRITING-STATE-ANNOUNCE-01
  03  ADOPTION-01                    ⭐ the one new capability
  04  MAIA-CONVERGENCE-01            (carries RETURN-RELATIONSHIP)
  05  REAL-WORK-ACCEPTANCE-01        ⭐⭐ the Studio becomes real here

HORIZON 2 — converge the organism
  06  DEVELOPMENTAL-IN-ROOM-01
  07  LOCUS-CAPABILITIES-01
  08  WORK-CAPABILITIES-01
  09  VOCABULARY-01

HORIZON 3 — retire the old architecture
  10  LEGACY-RETIREMENT-01
```

**Four code acts to a Studio Kelly can actually write Chapter 10 in**, and only
one of them adds a capability.

---

## 7 · Standing

**WS-02 · ACT 6 COMPLETE · ROADMAP DERIVED · ⛔ NOTHING IMPLEMENTED · NO ACT
OPENED.** WS-02 is complete end to end; opening act 01 is a separate founder act.
