# WS-EDITORIAL-UI-02 · MEMBER VERSION COMPOSER

**Branch** `claude/ws-editorial-ui-01` · **base** `4457c769e` (UI-01B, CLOSED).

**Status: THE WRITER ANSWERS IN WORDING · BROWSER-WITNESSED 72/0 ·
MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

> ⭐⭐ Until now the writer could only receive formulations. This is where they
> answer in kind — *"no, I'd write it this way"* — and their sentence becomes
> part of the authored lineage rather than temporary textarea state.

---

## 1 · The laws were carried; the boundary was not

The historical W2 `VersionComposer` at `ab416cc5` had the right laws and an
obsolete boundary — a browser-visible `chainId` and `WRITERS_STUDIO_WRITE_ENABLED`.
⛔ Nothing was transplanted. `editorialThread.ts` (its `authorLabel`) no longer
exists, and the surface was rewritten in the Studio design system.

Carried: the writer authors wording · `supersedes` is the exact formulation they
acted against · refusal retains the draft · ⛔ no rebase · ⛔ no retry · ⛔ MAIA's
wording never prefills "Your version" · the refusal copy, near-verbatim, because
it was already plain and never reassuring.

---

## 2 · ⛔ NO `ask_turn` — the distinction that made this a seam, not a reuse

```
member discourse    → ask_turn
member Direction    → ask_turn + Direction + binding
member formulation  → ProposalVersion            ⭐ and nothing else
```

A formulation authored in a composer is **already its own semantic act**.
Manufacturing a chat turn so that every version carries a binding would invent
something the writer never said. Turn bindings stay what they are: an *optional*
relationship fact for versions actually authored through a turn.

`lib/manuscript/editorialRuntime/memberVersion.ts` — `appendMemberEditorialVersion`:
the browser names the **thread**; the chain is derived from the frozen
`ask_threads ↔ proposal_chain` relationship, with ownership in the SQL; `author`
is **server-fixed** to `member`; ⛔ no `rationale`, because this cut gives the
writer no field for one and an absent field must not become an empty string that
reads as a stated-and-empty reason.

⭐⭐ **`supersedes` crosses the boundary unchanged.** `appendAuthoredVersion`'s
own 2026-09-14 merge blocker was that lock acquisition must not invent history; a
seam that resolved a stale predecessor *for* the writer would reintroduce it one
layer up.

---

## 3 · Route

`POST /api/writers-studio/editorial/version`, behind the same server flag, closed
to exactly `{ threadId, supersedes, replacementText }`. Unknown fields are
**refused and named** — `author`, `chainId`, `rationale`, `adopt` and the rest —
because a caller that sent one and got 201 would believe it had standing.

`201 appended · 404 absent/foreign · 409 succession moved · 400 malformed`.
⛔ No automatic retry on 409, at any layer.

⛔⛔ **`replacementText` is type-checked, never truthiness-checked.** `''` is a
lawful candidate formulation — a writer may mean *this passage should not be
here* — and it changes nothing until adoption, which is closed. A
`!b.replacementText` guard would silently refuse an act the substrate permits.

---

## 4 · The read now carries the whole succession

⚠️ UI-01 exposed versions **only through turn bindings**, so a composer-authored
formulation — which lawfully has no turn — would have been **durable and
invisible**.

⛔ Not repaired with chronology. `readEditorialThread` now also returns
`versions[]` and `headVersionId` from `readProposalWork()`, which already owns
read → `validateChain` → `lineage`. ⛔ No second ordering algorithm, and a
corrupt chain **refuses** (`chain_unreadable`) rather than being worked around.

```
turns      conversation order
versions   authored succession
```

⛔ Never merged into one timestamped feed: a composer version has no turn, and a
chronological merge would have to invent a position for it among things that
were said.

---

## 5 · ⭐⭐ The target is frozen at the click — the load-bearing UI law

`composerTarget` is `useState` created by the writer's gesture on a **particular
version** ("Write my version from this"). ⛔ It is never derived from
`headVersionId`.

```
lineage head       V3      ← moved
composer target    V2      ← stays V2
draft                      ← stays
submission         supersedes = V2
store              not_successor_of_head, truthfully
```

⛔ No retarget · ⛔ no retry · ⛔ no rebase · ⛔ no cleared draft. *The machine's
timing may judge their relationship stale; it may not rewrite which wording they
answered.* On refusal the lineage is re-read so they can **see what moved**,
while their draft and their frozen target both survive.

⛔ The field starts **empty**. Authoring identical text is lawful; the system must
not manufacture that authorship by copying it in. The standing sentence —
*"Nothing changes until you explicitly adopt a version."* — is on screen, and
there are no Keep / Revise / Adopt controls.

⭐ On success the surface **re-reads from the server**. The submitted text is
never spliced into the visible lineage: the screen agrees with storage.

---

## 6 · Witness — 72 passed · 0 failed, real Chromium

`scripts/witness/ui-editorial-surface-witness.ts` (renamed from
`ui-01a-mount-witness.ts`; one witness rather than three, because the later acts
are only meaningful **on** a conversation the earlier ones established — a
composer witness that seeded its own chain would be proving something about a
fixture).

**Ordinary reciprocal authorship** — MAIA's V1 appears in the succession, not only
in the talk · the field is **empty** · the target is stated before submission and
names the version clicked · the member version is durable, authored `member`,
superseding **exactly** V1, **byte-for-byte** · **`ask_turn` count does not grow**
· no binding invented · manuscript untouched · no authorization created · the
lineage reads `MAIA · Version 1 → Your version · Version 2` · survives a reload.

**The race** — composer open against V2, `MY-DRAFT` typed, a **real second
authenticated request** lands V3, then submit. ⭐⭐ The outgoing request body was
captured: it still said `supersedes = V2`. Refused; `MY-DRAFT` became no version;
their words still in the field; the target still V2; the lineage re-read to three.

**Closed shape** — `author` → 400 and the refusal names the field · `chainId` →
400 · `rationale` → 400 · `adopt` → 400 · foreign thread → 404 · ⭐⭐ **empty
`replacementText` → 201**, durable and authored, with the manuscript still the
writer's own sentence.

Seven known-bad mutants killed by the nine new source obligations (28 total in
`canvasEditorialMount.test.ts`): head-derived target · prefilled field · draft
cleared on refusal · truthiness-checked wording · seam resolving the predecessor
· a manufactured `ask_turn` · a caller-named author.

---

## 7 · ⚠️ One finding, measured rather than assumed

⭐ **Playwright scrolls elements into view before clicking, so every obligation
above can pass over a surface a person cannot reach.** That is not something a
green run answers about itself, so it was measured: at 1600×1000 with three
versions in the lineage, **"Add my version" is below the fold** and reachable only
by scrolling a scrollable ancestor.

Reported as **usable, not comfortable** — `W11` passes on reachability and the run
prints the note. ⛔ Not redesigned here: panel density and what scrolls inside the
conversation is the same class as the inner border/ramp question already held.

⚠️ **And one instrument defect of my own.** The "keeps the draft on refusal"
obligation first sliced the submit function from the first `setWordingRefusal(` —
which is the `(null)` **reset at the top** — so the "refusal branch" it scanned
contained the whole success branch and failed on that branch's own
`setWording('')`. The anchor is now the 201 early return, and the reason is in
the source.

---

## 8 · Gates

- Browser witness → **72 passed · 0 failed**
- `npm run typecheck` → **229 vs baseline 239 · 0 regressions · exit 0**
- `app/writers-studio` + `lib/writersStudio` + `lib/manuscript` → **1982 passed ·
  1 failed**

⚠️ **That one failure is `lib/manuscript/development/__tests__/evidenceCannotAct.test.ts`
— "adds no migration" — and it is RED ON CANONICAL**, because
`20260913000002_disclosure_boundary_developmental_ask.sql` matches its
`/develop|evidence|reading|observation/i` scan. Recorded earlier in this session;
⛔ not repaired here, ⛔ not whitelisted, ⛔ not this lane's.

---

## 9 · Standing

**WS-EDITORIAL-UI-02 · MEMBER VERSION COMPOSER LIVE BEHIND THE FLAG ·
STRUCTURAL LINEAGE VISIBLE · BROWSER-WITNESSED 72/0 · ADOPT CLOSED ·
NO DECISION CONTROLS · MERGE NOT AUTHORIZED · PRODUCTION UNTOUCHED.**

Held: side-by-side comparison · Keep Original · a Revise decision surface · Adopt
exact version · authorization/execution UI · legacy retirement · the global audio
toast · the inner panel border/ramp ruling · the composer-below-the-fold density
question · canonical merge (canonical is at `8cb640644`; this chain is based
through `a2ed3c67d` and is **not merge-ready by implication**).
