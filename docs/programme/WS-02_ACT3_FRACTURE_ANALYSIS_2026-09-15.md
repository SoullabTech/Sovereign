# WS-02 · ACT 3 — FRACTURE / DUPLICATION ANALYSIS

**Starting canonical** `b22945ac8` · **READ-ONLY** · ⛔ no KEEP / CONVERGE /
RESHAPE / RETIRE / ADD rulings.

**The test applied to every fracture:** *if we were forbidden to build a new
subsystem, could this be solved by connecting, converging, exposing, renaming or
retiring what already exists?*

---

## 1 · The causal matrix

| # | Fracture | Sev | Primary cause | Secondary | Substrate exists? | New capability genuinely required | Cost |
|---|---|---:|---|---|---|---|---:|
| 1 | Return opens Chapter 1 | 5 | **STATE / CONTINUITY** | NAVIGATION | **yes, complete** | ⛔ none — one read + one link parameter | **5** |
| 2 | Prior editorial relationship unreachable; a second opens silently | 5 | **DISCONNECTED** | STATE | **yes, complete** | ⛔ none — one read; a *choice* surface if >1 | **5** |
| 3 | Adopt cannot land | 5 | **DISCONNECTED** | — | **yes, complete** | ⭐ **one route + one member gesture** | **5** |
| 4 | Export is a secret door into a 7-tab Studio | 4 | **NAVIGATION** | FRAGMENTED, HIDDEN | yes | ⛔ none | 4 |
| 5 | One object, four vocabularies | 4 | **VOCABULARY** | FRAGMENTED | n/a | ⛔ none | 3 |
| 6 | Two full editors on **one draft row**, in two rooms | 4 | **DUPLICATED** | LEGACY / PARALLEL | yes | ⛔ none | 3 |
| 7 | MAIA is three presences with three memories | 4 | **DUPLICATED** | HIDDEN (flag) | yes | ⛔ none | 3 |
| 8 | Developmental reading is not where the writing is | 3 | **FRAGMENTED** | NAVIGATION | yes | ⚠️ section-scoped reading — *possibly* ADD | 3 |
| 9 | Three editors, no stated occasion | 3 | **FRAGMENTED** | VOCABULARY | yes | ⛔ none | 2 |
| 10 | Rail promises 16, offers 3 | 2 | **HIDDEN** | NAVIGATION | partly | ⛔ none | 1 |
| 11 | Two meanings of *adopt* | 3 | **VOCABULARY** | DISCONNECTED (#3) | yes | ⛔ none | 3 |
| 12 | Keeps and marked lines: one gesture, two rooms, two names | 2 | **VOCABULARY** | FRAGMENTED | yes | ⛔ none | 2 |
| 13 | `AskMaia.tsx` mounted nowhere · `/writers-studio/review` unlinked · `editorialWorkspace` unimported | 1 | **DISCONNECTED** | LEGACY | yes | ⛔ none | 0 |
| 14 | `/book-studio/*` — founder-gated parallel lineage | 2 | **LEGACY / PARALLEL** | HIDDEN | yes | ⛔ none | 1† |

† 1 for the member (invisible); high for the programme.

### The two counts

```
problems requiring genuinely new capability      1   (possibly 2 — see #8)
problems solvable primarily through convergence 13
```

⭐⭐ **The single genuinely-new item is #3, and it is one route plus one
gesture.** Everything else in the list is connection, naming, navigation or
retirement. **Writer's Studio is under-integrated, not underbuilt** — ACT 2's
thesis survives causal analysis.

---

## 2 · Cluster 1 — return / continuity

### What already exists, mechanism by mechanism

| To restore | Mechanism today | Durable? | Reachable on return? |
|---|---|---|---|
| manuscript identity | `?m=` + `adoptRouteIdentity` latch | URL | **yes** — Home's Return link carries it |
| section identity | `?s=` + `readSectionParam` / `replaceState` | **URL only** | ⛔ **no** — Home's link omits it |
| view mode (Section/Whole) | `readManuscriptView(manuscriptId)` | **localStorage**, per device | partly |
| editorial thread | `?editorialThread=` | **URL only** | ⛔ **no** |
| selected version / comparison | React state | none, by ruling | ⛔ no (cheap) |
| developmental reading | `readingId`, frozen, server-side | **yes** | via `/develop`, Work-scoped |
| declared acts | `/api/sovereign/studio/history` | **yes** | yes, on Home |
| kept passages | `/api/sovereign/keeps` → marked lines | **yes** | yes, on Home |

⚠️ **`writing_arrived` is not what it sounds like.** It is sourced from
`manuscript_source_arrivals` — *a manuscript arrived* (import), not *the writer
arrived at a place*. The history is a ledger of **declarative acts**, and
navigation is deliberately not one of them.

### ⭐⭐ What is actually absent

**Nothing durable.** Every fact needed to put Kelly back in Chapter 10, in
yesterday's conversation, is **already in the database**:

```
manuscript_draft_sections.updated_at      → the section she last wrote in
proposal_chains.target_section_id         → which section a chain is about
ask_threads.proposal_chain_id             → the thread on that chain
ask_turns.created_at                      → when that thread last moved
```

⭐ So re-entry is a **read across existing columns**, not a subsystem. The
smallest missing connective tissue is:

1. a section identity on the Return link (the parameter already exists), and
2. a read that answers *"which editorial threads exist for this section, and
   which moved most recently"* — plus a **surface that lets her choose**, because
   UI-01A's refusal of a most-recent guess stands and must not be quietly
   reversed into an automatic one.

⛔ **The distinction ACT 2 drew holds up:** persistence, identity, provenance and
relationship are all present and correct. What is absent is the **return path**.
This is continuity without re-entry, and it is a connection problem.

---

## 3 · Cluster 2 — writing surfaces by human job

| Human job | Served by | Verdict |
|---|---|---|
| write new prose | Section surface · Whole surface · Worktable · `press/manuscript` draft tab | **four** |
| revise existing prose | same four | **four** |
| rewrite a selected passage | `EditorialConversation` → member version (flag B) | one |
| compare formulations | Compare (flag B) | one |
| work across a whole chapter | Whole surface · Worktable · draft tab | three |
| accept a formulation | ⛔ **nothing** | zero |
| change the canonical manuscript | section save · draft save · structure adopt | three, none of them *adoption of a version* |

⭐⭐ **There are not "three editors". There is ONE working draft row and four
ways to type into it** — and two of those (canvas Worktable, `press/manuscript`
draft tab) **import the same `press/manuscript/workingDraftClient`**. The
duplication is at the *surface* layer, not the substrate layer; the substrate
already converged and the rooms did not.

⚠️ The Section/Whole/Worktable choice is made **server-side** by
`write-state` → `chooseMount` and never explained. So *when to use which* is
partly not the writer's decision, which makes the visual similarity more
confusing rather than less.

---

## 4 · Cluster 3 — MAIA

| | `MaiaColumn` | `StudioConversation` | `EditorialConversation` | `/develop` readings |
|---|---|---|---|---|
| what she knows | the Work context | client-sent local history | the thread, the chain, the locus, the Work | a frozen reading of the Work |
| object she looks at | the Work | nothing durable | **one passage** | the Work's sections |
| what persists | — | ⛔ nothing | **everything** | the reading |
| what returns | — | ⛔ nothing | the thread, *if the URL survives* | yes, by `readingId` |
| what she can act upon | nothing | nothing | propose wording (never apply) | produce evidence-linked observations |
| what the writer uses her for | orientation | general talk | working on **this passage** | understanding **this Work** |

⭐⭐ **Answer to the question as posed:** `StudioConversation` and
`EditorialConversation` are **two technical incarnations of one intended
presence** — same job, same room, same seat, differing only in whether MAIA
remembers. `MaiaColumn` is not a third presence but the **empty state of that
seat**. `/develop` **is** a genuinely different relational function: prepared,
frozen, evidence-linked reading of the whole Work rather than live exchange about
a passage.

So: **two incarnations to converge, one function to keep distinct** — and the
distinct one is in the wrong room (#8).

---

## 5 · Cluster 4 — `/press/manuscript`, tab by tab

| Tab | Human job | Data object | Overlaps Writer's Studio | Unique capability | Inbound | Outbound | Terminology |
|---|---|---|---|---|---|---|---|
| manuscript | read the source | `manuscript_sections` | **yes** — outline/Whole | — | ⛔ none | none | "manuscript" = source |
| **draft** | write the book | **`manuscript_working_drafts`** | ⭐⭐ **the identical row the Canvas edits, via the identical client** | — | ⛔ none | none | "draft" |
| keeps | see kept passages | `keeps` | **yes** — Home marked lines | — | ⛔ none | none | "keep" vs "marked line" |
| collections | group kept material | `collections` | ⛔ no | ⭐ **unique** | ⛔ none | none | "collection" |
| emerging | see candidate material | `candidates` | ⛔ no | ⭐ **unique** | ⛔ none | none | "emerging" |
| export | render / take it away | `render` | ⛔ no | ⭐ **unique** | rail *Export* | none | "export" |
| book | the book artifact | render/book | partial (`/book-studio`) | ⭐ likely unique | ⛔ none | none | "book" |

⭐⭐ **Three of seven tabs hold capability that exists nowhere else**
(collections · emerging · book), one is the *only* export path, and **two
duplicate the Studio outright** — one of them by editing the same row through the
same client.

⛔ **The room is not the capability.** Nothing in this table argues that
`/press/manuscript` must survive; it argues that **collections, emerging, export
and book must**, and that *draft* and *manuscript* are duplicates of surfaces the
Studio already owns.

---

## 6 · Translation cost — what actually ejects the writer

Costs of **5** (cannot complete the intended act): #1, #2, #3.

All three are the same shape: **the system holds the fact and does not carry the
person across the seam.** None is a missing feature.

⭐ The costs of 3–4 (#4–#7, #11) are the *vocabulary and duplication* layer —
they do not stop her, they make her hold a model of the product in her head while
trying to hold a model of her book. That is the tax ACT 4 should be judged
against, because it is what makes the Studio feel like several products.

---

## 7 · What ACT 4 inherits

- ⭐ **One ADD, precisely bounded:** a route and a member gesture for adoption.
  Possibly a second (section-scoped developmental reading, #8) — **flagged, not
  concluded**, since `/develop` may be reshapeable rather than rebuildable.
- ⭐ **Two re-entry reads** over columns that already exist, plus a **choice**
  surface that does not guess.
- ⭐ **Two MAIA incarnations to converge; one MAIA function to keep separate.**
- ⭐ **One working-draft row with four ways in** — a surface-layer duplication
  over an already-converged substrate.
- ⭐ **Four capabilities to rescue from a room** (collections · emerging · export ·
  book) and two duplicates inside it.
- ⛔ And the standing constraint: *harvest is not preservation.* Nothing above
  argues that a component survives because it exists.

---

## 8 · Standing

**WS-02 · ACT 3 COMPLETE · READ-ONLY · CAUSES CLASSIFIED · ⛔ NO RULINGS TAKEN ·
HOLDING FOR FOUNDER READING BEFORE ACT 4.**
