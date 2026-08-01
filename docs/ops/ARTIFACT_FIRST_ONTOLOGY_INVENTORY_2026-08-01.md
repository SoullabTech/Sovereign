# Where the artifact-first ontology still lives

**Inventory only. Nothing here is a change request, and nothing is authorized.**
Produced as a merge condition on PR #856 (Living Work, Slice 1), so that Slice 2 —
the declaration gesture — can be designed knowing exactly where the old ontology
still speaks.

The ratified position: **a manuscript is one expression of a Living Work, not its
identity.** Everything below currently assumes the reverse.

## 1 — Member-facing copy (highest cost, lowest effort)

This is where a creator actually meets the old ontology.

| Where | Says | Assumes |
| --- | --- | --- |
| `studioMap.ts` | **"Current Book"** as a rail section | the work *is* a book |
| Studio home | "Import Manuscript" as the only way in | every creator arrives with a manuscript |
| Studio home | "bring your book into form" | the work is a book |
| Working Draft | "An editable copy of this manuscript" | the manuscript is the subject |
| across `app/press` | *your book* ×4, *your manuscript* ×5, *the manuscript* ×3 | — |

**"Current Book" is the single most load-bearing string in the Studio.** It is the
rail heading a creator reads on arrival, and it names the artifact where the
ontology names the work.

## 2 — Routes

| Route | Note |
| --- | --- |
| `/press/manuscript` | the only writing surface; three states by query param |
| `/press/studio` | correctly named for the environment |
| `/book`, `/book-studio`, `/book-companion`, `/api/books`, `/labtools/books` | older surfaces outside the Studio lane |

Renaming routes is **not** implied. Route identity has its own prior ruling, and URL
churn costs more than it returns.

## 3 — Schema

| Table | Assumption |
| --- | --- |
| `member_manuscripts` | the manuscript is the member-owned root object |
| `manuscript_sections`, `manuscript_working_drafts`, `manuscript_keeps`, `manuscript_collections`, `manuscript_collection_items`, `manuscript_renders` | all hang off the manuscript as the top of the tree |
| `audiobook_chapters` | keys on `book_slug TEXT` |

**None of this needs to change.** `living_work_expressions` points *at* these rows
without touching them; a manuscript may remain the root of its own subtree while
ceasing to be the root of the Studio. Renaming them would be enormous, destructive,
and would buy nothing the join table does not already provide.

## 4 — The one real semantic conflict

`studioMap.ts` groups **Working Draft** and **Source** under **"Current Book."**
Under the ratified ontology those are two expressions — or one expression and its
source — of a Living Work, not two parts of a book. This is the only place where the
old ontology is doing *structural* work in the interface rather than merely naming
something.

## What this implies for Slice 2

The declaration gesture — *"I'm beginning a work"* — has to answer a question the
current Studio never asks, because the current Studio assumes the answer is always
"a book." The inventory says the gesture must not be reachable only from "Import
Manuscript," or the ontology will be lived as *a book, plus paperwork*.

**Cheapest meaningful change, when it is authorized:** the rail section, not the
routes and not the schema. One string, read on every arrival.

## Not in scope

No renames. No migrations. No route changes. No copy changes. This document changes
nothing; it records where the debt is so the next slice can be designed with open
eyes.
