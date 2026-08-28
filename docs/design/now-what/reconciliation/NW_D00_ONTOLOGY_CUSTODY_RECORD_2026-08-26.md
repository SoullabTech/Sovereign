# NW-D00 — Room Ontology Custody Record

**Task**: bounded parallel task authorized alongside NW-R01 — *"recover/author the missing
ontology custody record."*
**Outcome**: **RECOVERED, not authored.** The ruling document existed all along. No new
doctrine was written; nothing was retroactively ruled.

---

## What was actually wrong

`docs/design/now-what/NOW_WHAT_ROOM_ONTOLOGY_CONSOLIDATION_2026-08-05.md` is cited as the
governing authority by `lib/nowWhat/rooms.ts` and 7 route files. It was absent from the working
tree.

**It was never deleted.** There is no deletion commit on the path. The document and its
implementation were authored on *different branches*, and only one of them merged:

| Commit | Date | Contents | Reachable from `clean-main-no-secrets`? |
|---|---|---|---|
| `ca8d1cac9` — *"build(now-what): the five-room ontology"* | 2026-08-05 | the **implementation** | **YES** — ancestor of HEAD |
| `95cfae2e8` — *"client home + flourishing field — the slice that survived the walk"* | 2026-08-05 | the **ruling document** (121 lines) | **NO** — only on `chore/ain-delegate-jarvis-*` |
| `c42cfe4a3` — *"preserve the 2026-08-09 constitutional and evidence corpus"* | 2026-08-09 | the ruling document (128 lines, corrected) | **NO** — only on `chore/rehabilitation-corpus-provenance` |

So the code that enforces a five-room ontology and six route retirements shipped to main while
the ruling that authorizes it stayed on branches that never landed. A later commit
(`c42cfe4a3`, "preserve… corpus") suggests someone had already noticed material was orphaned;
that preservation branch did not merge either.

**Corrects census finding F5**, which read *"the governing document does not exist."* The
accurate finding is narrower and more fixable: **the document exists and is recoverable; main
lost it to a branch split.** The earlier phrasing overstated the loss. (My first check ran
against a shallow clone — 149 of 5,278 commits — which is why the history looked empty. The
repository has since been unshallowed.)

## What was recovered

The 2026-08-09 version (`c42cfe4a3`, 128 lines) is restored to its cited path. It is strictly
newer than the 2026-08-05 version: it supersedes one stale finding (per-dimension threads *are*
rendered, post-#978) and adds the final review posture and the write-loop closure record.

**Provenance**: recovered verbatim by `git show`. Not edited, not updated, not re-ruled.

## What the recovered ruling contains (and why it matters to NW-D03)

The document is not a sketch. It is a founder-ratified ruling with a disposition table for all
13 surfaces and six governing tests. Load-bearing content the programme was about to reason
without:

- **The standing architectural test**: *"two rooms cannot exist merely because they use
  different nouns if they invoke the same human gesture."*
- **Six room tests**, including *"if this room disappeared tomorrow, what human experience would
  become impossible?"* and *"rooms are born from a repeated human gesture, not a conceptual
  category."* These are directly the tests NW-D03 needs for the "does My Question need to remain
  a permanent destination?" question.
- **D-A ruled**: The Room is the verb-room; My Question and Think-with-MAIA do not split.
  *"The rooms hold the person's life; The Room holds the conversation."* Rationale given:
  *"this prevents the AI layer from becoming the center."*
- **D-C ruled (criteria)**: *"A turning point cannot be detected. A turning point is
  recognized."* The system may never promote something because it appears statistically
  important.
- **D-D ruled (test)**: *"Can someone say 'this is not the lens I use' and still belong in the
  room? If yes, it is an offering. If no, it has become architecture."*
- **Governing principle**: *"a field is not a collection of topics; it is a collection of
  relationships a person has intentionally placed."*

### The finding that bears directly on the current Home

The recovered ruling contains an explicit front-door direction:

> **Front door (founder direction)**: signed-in arrival = **Home**, answering *"here is what is
> alive since you were last here"* — five doors, **aliveness-ordered by member-authored facts
> only** (open question touched, practice active, conversation upcoming, thing kept).

Two consequences:

1. **"What is alive now" was already ruled on 2026-08-05**, with the same constraint the founder
   re-derived on 2026-08-26 — *member-authored facts only*. Census conflict **C4** is therefore
   not an open question; it is a settled one that the shipped code did not implement.
2. **The shipped Home renders its five doors in fixed source order.** No aliveness ordering
   exists in `ClientHome.tsx`. This is a third respect in which the shipped Home departs from
   ruled ground — alongside the gesture-architecture regressions at census **F3**.

## Ruling drift discovered by the recovery

Comparing the ruling against the shipped code surfaces two places where implementation went
past its authorization:

| Ruling | Status in the document | What shipped | Assessment |
|---|---|---|---|
| **D-B** — Position's home | **"still open"** (explicitly unsettled) | `/now-what/position` redirects into My Coaching — the *recommended* option | Enacted while open. Outcome may well be right; the authorization is missing. |
| **D-D** — Cultivation vocabulary | Recommended **(b)**: six domains as *offered* starting vocabulary, member may rename or discard | Six domains **hardcoded** in `app/now-what/work/page.tsx:48`, no rename, no discard — option **(c)** | Enacted against the recommendation. The document itself flags this as an **Invariant 14 (cultural sovereignty)** exposure, and names the test D-D exists to satisfy: *"can someone say 'this is not the lens I use' and still belong in the room?"* As shipped, the six domains are architecture, not an offering. |

D-C and D-E did not drift: My Story ships as the month-grouped arrangement the ruling specifies
as the interim, and the held-capabilities placeholders retired without replacement, matching
D-E's ruled default disposition.

## Disposition

- Document restored to its cited path; the 7 route citations and `rooms.ts` now resolve.
- **D-B and D-D are live governance items for NW-D01/NW-D03**, not census housekeeping. D-D in
  particular is a sovereignty-invariant exposure the ruling anticipated and the build did not
  honor.
- No ruling in the recovered document was changed, extended, or reinterpreted by this task.
