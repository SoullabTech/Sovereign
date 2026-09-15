# RETURN-LOCUS-01 · RESTORE THE WRITER TO THE WORK'S PLACE

**Base** canonical `b22945ac8` · branch `claude/return-locus-01`.
**Status: BUILT · BROWSER-WITNESSED 17/0 · MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

> *Kelly leaves Elemental Alchemy while working in Chapter 10. When she returns
> to the Work, the Studio restores Chapter 10 without her remembering a URL, and
> without guessing.*

⛔ No schema change. ⛔ No new memory subsystem. ⛔ No editorial-thread
restoration. ⛔ No deploy.

---

## 1 · ⭐⭐ The act's premise needed correcting before it could be built

The founder asked for a semantics check before `updated_at` became the rule.
It did not survive as stated. `manuscript_draft_sections.updated_at` has **five
writers**, and only one is *a writer at a place*:

| writer | rows touched | a place? |
|---|---|---|
| `saveSection` | **one** | ⭐ **yes** — the member, writing here |
| whole-draft save | **every** | ⛔ one timestamp, no place |
| revision restore | **every** | ⛔ no |
| conversion / import (INSERT) | **every** | ⛔ no |
| `normalizeLegacyScaffold` | many | ⛔ a system act |

⭐ And the tie is **real, not theoretical**: `convertDraft` loops its INSERTs
inside one `transaction()`, and PostgreSQL's `now()` is **transaction time**, so
every section a conversion creates carries the *identical* timestamp.

⛔ **So `MAX(updated_at) LIMIT 1` would break that tie by whatever order the
database returned — replacing "always Chapter 1" with a different invisible
guess.** That is the one outcome this act existed to avoid.

### The rule taken

```
exactly one section holds the maximum   →  distinct         a place exists
more than one shares it                 →  undifferentiated NO place, and we say so
no sections / no addressable draft      →  none
```

⛔ A tie is **not a weak signal to be ranked.** It is the truthful report that
one act changed those rows and that act had no place.

### ⚠️ Vocabulary inherited, not invented

`app/api/sovereign/manuscripts/route.ts` already ruled this class of question at
Work scale (**STUDIO-WRITING-PRESENCE-01**, 2026-09-08): `last_written_at`
establishes **member draft activity** — *"saving, checkpointing, restoring, or
editing. It does not establish writing, and nothing may render it as a writing
time."*

⭐ This module is therefore called **section ACTIVITY**. A distinct result is
strong enough to *return* someone to; ⛔ it is not strong enough to claim they
were *writing* there, and the type carries no field that says so.

---

## 2 · What was built — three small pieces, all reuse

| | |
|---|---|
| `lib/writersStudio/sectionActivity.ts` | the read + the tie rule, **one statement, decided inside it** |
| `app/api/sovereign/manuscripts/[id]/locus/route.ts` | a door to that read. ⛔ Decides nothing itself |
| `app/writers-studio/useSectionActivity.ts` + `HomeView` `returnHref()` | the Return link, section-scoped **only** when distinct |

⭐ `returnHref` invents **no URL grammar**: `canvasForManuscript` and
`locationForSection` both already existed. While the read is in flight, and for
`undifferentiated` and `none`, the link is **byte-identical to the one that
shipped before this act**, so nothing waits on it and nothing degrades.

---

## 3 · Witness — 17 passed · 0 failed, real Chromium

| | |
|---|---|
| **I1–I3** | an import ties every section → `undifferentiated`, **names no section**, says how many share the moment |
| **R0** | ⭐ a verbatim import is **not offered back as continuable** at all — the honest state of a fresh import |
| **W1–W2** | one `saveSection` breaks the tie; the place is Chapter 10 |
| **R2–R5** | ⭐⭐ the Return link names Chapter 10, keeps the Work, and **the room opens there — no URL remembered** |
| **R6** | ⛔ nothing was written to get there |
| **N1** | ⭐ an explicitly named section still beats the remembered one — she is in charge |
| **U1–U2** | ⭐⭐ a whole-draft save erases the place, and the Studio **reports no place rather than inventing one** |
| **B1–B3** | unauthenticated 401; another member and an unknown Work both get `none` — ⛔ not a redaction |

Plus six unit obligations on the rule, falsified against the forbidden mutant
(*break the tie by taking the first row*), which kills two of them.

---

## 4 · ⚠️ Three fixture defects of my own — each one taught the act something

**(1) My first fixture inserted sections in separate transactions**, so they
differed by microseconds and the read correctly answered `distinct`. ⛔ The rule
was not wrong — **the fixture modelled three imports rather than one.** Left
uncorrected, the witness would have reported the tie case as unreachable and
this act would have shipped with its hardest case unproven. The fixture now uses
one transaction, and **asserts the tie exists before proceeding**.

**(2) The Return hero never rendered**, because `homeState` offers a Work back
only when `hasCurrentMemberContribution` — the draft diverging from its
revision-1 baseline — which is how a verbatim seed is kept from masquerading as
writing. The fixture had no revision 1. ⭐ Adding it made the fixture *more
faithful*, not merely greener.

**(3) The round-trip triggers are `DEFERRABLE INITIALLY DEFERRED`**, so the
section write and the draft write must share one transaction, and the draft's
content must be **derived** from the sections by `string_agg` exactly as
`saveSection` does — not assembled by the fixture.

⚠️ **And a mutant restore failed again** because the file was untracked and
`git checkout --` cannot reach it. Repaired by hand and re-verified; the harness
lesson from earlier in this session is still not fully learned.

---

## 5 · ⚠️ One finding, reported — ⛔ not repaired

`app/writers-studio/homeState.ts` lines 16–20 still say
`lastMemberDraftActivityAt` is *"the working draft's updated_at, which moves when
the member actually writes."* That claim was **refuted in
`app/api/sovereign/manuscripts/route.ts` on 2026-09-08** — *"that enumeration was
INCOMPLETE and the conclusion was FALSE."*

⭐ `homeState`'s **behaviour** is correct (it conjoins `hasWriting` **and**
`hasCurrentMemberContribution` precisely because activity is not writing); only
its prose carries the superseded claim. ⛔ Not corrected here — it changes no
behaviour and belongs to whoever next rules on that file.

---

## 6 · Gates

- browser witness → **17 passed · 0 failed**
- `lib/writersStudio/__tests__/sectionActivity.test.ts` → **6/6**, mutant killed
- Writer's Studio suites → **884 passed · 53 suites · 0 failed**
- `npm run typecheck` → **229 vs baseline 239 · 0 regressions**

## 7 · Standing

**RETURN-LOCUS-01 · BUILT · WITNESSED · ⛔ MERGE NOT AUTHORIZED · ⛔ PRODUCTION
UNTOUCHED.** Next in the roadmap: `WRITING-STATE-ANNOUNCE-01`, then
`ADOPTION-01`. ⛔ Editorial-thread return remains part of `MAIA-CONVERGENCE-01`.
