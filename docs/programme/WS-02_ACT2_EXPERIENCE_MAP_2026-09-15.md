# WS-02 · ACT 2 — EXPERIENCE MAP

**Starting canonical** `b22945ac8` · **READ-ONLY** · ⛔ no KEEP / CONVERGE / RETIRE rulings.

**Scenario, concrete throughout:** *Kelly opens Elemental Alchemy, returns to
Chapter 10, wants to know where she left off, revise a passage, ask MAIA about
the chapter's developmental problem, compare her own versions, choose one, and
keep writing.*

Two configurations mapped: **A** default (both Writer's Studio flags off — what a
member experiences today) and **B** `WRITERS_STUDIO_EDITORIAL_ENABLED=1`.

---

## 1 · The journey

| Moment | Surface | Member sees | Must know / remember | Continuity | Fracture |
|---|---|---|---|---|---|
| **Return to Work** | `/writers-studio` | *Return* hero: the Work's image, title, meta; recent Works; her own marked lines | that this is the Studio's front door | **partial** — the **Work** is remembered, the **place in it is not** | ⭐⭐ "Return to this work" is `canvasForManuscript(CANVAS_HREF, id)` — **`m=` only**. Chapter 10 is not in the link |
| **Orient** | canvas | outline · writing field · MAIA column · lower band | which of two views she is in | **partial** | The place resolves to **`sections[0]`** — she lands on Chapter 1 and must navigate to 10 herself |
| **Find where to write** | outline panel | section list by heading | that the outline switches the single editor | ok | Two more outlines exist (lower band, `/writers-studio/review`) showing the same structure |
| **Write / revise** | Section surface | one section, autosaving | Section vs Whole vs Worktable | ok within a view | ⭐ Three editors. Nothing tells her **when to use which**; Worktable appears only for unconverted drafts |
| **Consult MAIA — A** | `StudioConversation` | a chat panel | that this conversation is **not** kept | **broken by design** — client `Turn[]`, client-minted `sessionId`; a reload loses it | Feels like a chatbot beside the book |
| **Consult MAIA — B** | `EditorialConversation` | You / MAIA, Directions, offered wording | — | **strong** — server thread, survives reload | Its address lives **only in the URL** (§2) |
| **Developmental response** | `/writers-studio/develop` | frozen, evidence-linked readings | **that this address exists** — one inbound link, from the rail map | separate room | ⭐ Work-and-reading scoped, **not section scoped**: she cannot ask "what's wrong with Chapter 10" and stay in Chapter 10 |
| **Compare versions — A** | — | **nothing** | — | — | ⛔ Not available |
| **Compare versions — B** | canvas Compare | passage-as-opened vs one exact version | that comparison is not a decision | strong within the session | Presentation state; a reload drops the selection (ruled, cheap) |
| **Choose / Adopt** | — | ⛔ **nothing, in either configuration** | — | — | ⭐⭐ **THE CLIFF.** §3 |
| **Understand structure** | canvas `StructureReview` | proposed section breaks; adopt | that structure is confirmed here, but *read* in three other places | ok | Structure adoption works; version adoption does not — **two things called adopt behave differently** |
| **Keep / save** | canvas checkpoint · `/press/manuscript?tab=keeps` | "Keep a version"; Keeps live elsewhere | that Keeps are a **different room** | partial | Marked lines surface on Home; the Keeps tab is unlinked |
| **Export / prepare** | `/press/manuscript?tab=export` | a seven-tab environment | that *Export* is a door into another Studio | **broken** | ⭐⭐ §4 |
| **Leave** | — | nothing to do | — | autosave holds the prose | The **conversation address** is lost with the tab |
| **Return later** | `/writers-studio` | the Work again | everything above, again | **weakest link in the chain** | ⭐⭐⭐ §2 |

---

## 2 · ⭐⭐⭐ The return fracture — ranked first

Three separate facts compose into one experience:

1. **Place is URL-only.** `readSectionParam` / `locationForSection` keep `?s=` via
   `replaceState`. Nothing server-side records where she was in the Work.
2. **Home's Return link carries only `m=`.** So a return through the front door
   resolves `resolveInitialSection(null, ids)` → **`sections[0]`**.
3. **The editorial conversation is addressable only by exact id.** Every read is
   `WHERE id = $1 AND member_id = $2`. There is **no list route, no by-section
   lookup, no by-chain lookup** — deliberately, since the schema admits many
   threads per chain and UI-01A refused a most-recent guess.

⭐⭐ **The consequence, stated plainly:** in configuration B, Kelly works with
MAIA on Chapter 10, closes the tab, and comes back tomorrow. Clicking
*Conversations* finds no `editorialThread` in the URL — so it **opens a new
relationship**. Yesterday's exchange is durable, correct, provably intact, and
**unreachable**. The room does not show her a second conversation existing; it
simply starts one.

⛔ This is not a defect of UI-01A — it is the honest cost of refusing a
most-recent guess without yet building the surface that lets a member *choose*
among their own threads. **Experientially it is the single largest fracture in
the Studio.**

In configuration A the same moment is smaller but worse in kind: the
conversation was never kept at all.

---

## 3 · ⭐⭐ The adoption cliff — the precise edge

Trace *"Yes. This is the version I want."*

```
compare V1 vs V2        ✅ exists (B only)
decide                  ✅ the writer can decide
say so                  ⛔ NOTHING RECEIVES IT
authorize the version   ✅ authorizeVersion()      built · tested · 0 routes
check it still fits     ✅ evaluateExecutionFit()  built · tested · 0 routes
execute into the draft  ✅ executeAuthorization()  built · tested · 0 routes
manuscript changes      ⛔ unreachable
```

⭐⭐ **The cliff is exactly one layer thick: an HTTP route and a control.** The
decision has nowhere to land, not because the machinery is missing but because
nothing in `app/` imports `lib/manuscript/revisionAuthorization/`.

⚠️ And the experiential shape of it is specific: the Studio can now hold a
complete, well-formed editorial exchange that **cannot conclude**. Every screen
says *"Nothing changes until you explicitly adopt a version."* — which is true,
and there is no way to explicitly adopt a version. **A promise of an act that
does not exist reads as a broken control, not as restraint.**

---

## 4 · ⭐⭐ The four-address problem, as experienced

`/press/manuscript` has seven tabs. Two are reachable, each by a link named after
the tab: *Export* → `?tab=export`, *Import* → `?import=1`.

So Kelly clicks **Export** and arrives in an environment containing
**manuscript · draft · keeps · collections · emerging · book** — six other jobs
she has never been shown, three of which (draft, keeps, book) are about the very
manuscript she is writing.

⭐ **The shared-draft question, answered:** she cannot tell she is looking at the
same object. Canvas calls it *the manuscript* and works in *sections*;
`/press/manuscript` calls the same underlying draft *draft*, and adds *keeps*,
*collections*, *emerging*. **Same object, four vocabularies, no statement of
identity between them.**

⛔ `/press/studio` redirects to `/writers-studio`, so the address history is
already telling this story: the Press studio was retired into the Writer's
Studio, and its manuscript room was left behind the two doors.

---

## 5 · ⭐ MAIA multiplicity, as experienced

| | what she meets | does it remember? |
|---|---|---|
| A · default | `MaiaColumn` (holds nothing) → `StudioConversation` on *Conversations* | **no** |
| B · enabled | `MaiaColumn` → `EditorialConversation` | **yes**, until the address is lost |
| either | `/writers-studio/develop` — frozen readings, another room | yes, but Work-scoped |
| — | `AskMaia.tsx` sits in the canvas folder, **mounted nowhere** | — |

⭐⭐ **She does not experience one continuous intelligence.** She meets a column
that explains it holds nothing, a conversation whose memory depends on a flag she
cannot see, and a separate room where MAIA's developmental reading lives — and
the reading room does not know which chapter she is in, while the conversation
room does.

---

## 6 · ⭐ Editor multiplicity, as experienced

Section · Whole · Worktable are each defensible; the system chooses between them
server-side (`write-state` → `chooseMount`) and **never explains the choice**. A
writer whose draft is unconverted gets the Worktable and a notice; a converted
one gets Section with a Whole toggle. *When to use which* is never said, and the
answer is partly not hers to make.

---

## 7 · Observed fractures, ranked by experiential consequence

1. ⭐⭐⭐ **Return does not return.** Wrong chapter, and yesterday's conversation
   is unreachable — with a new one silently opened in its place.
2. ⭐⭐ **The decision cannot land.** A complete editorial exchange ends at a
   sentence promising an act that has no control and no route.
3. ⭐⭐ **Export is a secret door into a second Studio** holding six unshown jobs
   about the same book.
4. ⭐⭐ **One object, four vocabularies** — manuscript / draft / keeps / emerging —
   with nothing asserting they are the same Work.
5. ⭐ **MAIA is three presences**, one of which forgets, one of which remembers
   only while its address survives, and one of which lives in another room and
   does not know the chapter.
6. ⭐ **The developmental reading is not where the writing is.** The one
   capability that would answer *"what is wrong with Chapter 10"* requires
   leaving Chapter 10.
7. **Three editors, no stated occasion**, and the choice is made for her.
8. **The rail promises sixteen and offers three**, which is honest but reads as a
   room mostly not built — while substantial capability sits behind two doors and
   a flag.
9. **Two meanings of *adopt*** — structure proposals adopt and execute; versions
   cannot.
10. **Keeps and marked lines are the same gesture** shown in two rooms under two
    names.

⛔ **No recommendations.** ACT 3 may ask which of these are duplication, which
disconnection, which vocabulary, which navigation, and which genuinely missing
capability — on the evidence above, **only one item in this list is missing
capability** (a route and a control for adoption), and it is not the worst one.

---

## 8 · Standing

**WS-02 · ACT 2 COMPLETE · READ-ONLY · BOTH CONFIGURATIONS MAPPED · ⛔ NO
JUDGMENTS TAKEN · HOLDING FOR FOUNDER READING BEFORE ACT 3.**
