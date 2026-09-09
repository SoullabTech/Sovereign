# SEL-0 CORPUS 01 — **RETIRED AS CONFIRMATORY** · founder ruling, 2026-09-08

**Supersedes status only.** Every prior artifact, digest, record and ruling stands unedited. Nothing
here rewrites history; this document changes what corpus 01 may be *used for*, and nothing else.

```text
SEL-0 CORPUS 01
fixture                 LOCKED historically
Manifest B              UNOPENED
founder ranking         NOT STARTED
selector run            NOT PERFORMED
contamination           DISCOVERED PRE-RANKING
confirmatory status     RETIRED
result                  NO TEST OCCURRED
```

---

## What was found, and when

Discovered during the pre-ranking gates, **before Manifest B was opened**:

```text
production ask_thread   be247847-d1f3-447e-be30-6993366e17d6
observationKey          o9        — one of the 19, position 13 in the frozen neutral order
initiatedBy             author
openedAt                2026-09-08 12:11:41Z   (4m23s after the reading froze at 12:07:18Z)
turns                   2 — author 24 chars, then MAIA 1,402 chars
```

The founder had read and discussed `o9` with MAIA months before the ranking act, in the ordinary
course of using the product. A second, unmeasurable exposure follows from the room's design: the
Develop room renders **every** observation of a reading, unsorted and unfiltered, so the other
eighteen were on screen in native `o1…oN` order. Whether they were read is unknown and only the
founder can say.

⛔ **This was not a selector run.** Production runs `3afa51b9f`, which predates the selector
entirely; no selection path existed to run. The four other gates passed:

```text
/tmp/ea_sel0_sections.txt removed          PASS
selector/runtime lock unchanged            PASS   4/4 files byte-identical to HEAD 64e439f66
Manifest B digest vs frozen                PASS   a5564f05…1e843
no selector run against the frozen 19      PASS   structurally impossible
founder blind intact                       FAIL
```

## Why it retires the corpus rather than being caveated

⭐ **The exposure is not merely "he saw an item".** He formed a view of `o9` *in conversation with
the ranker*. That is a shared upstream cause between the two rankings — the exact mechanism the
audit named when it required a selection-neutral sort, arriving by a route the sort cannot defend
against. Manifest B's seeded shuffle protects against primacy correlation in a first reading; it
cannot undo a reading that already happened in native order.

The founder ruled out every salvage:

```text
rank all 19 with o9 caveated       REFUSED — a caveated inferential result is not confirmatory
exclude o9 and rank 18             REFUSED — changes the frozen fixture; n=18 weakens U
fresh reading, same EA material    REFUSED — a new reading may reproduce the discussed noticing
                                     or an equivalent one; a new reading IDENTITY does not
                                     restore founder INDEPENDENCE
```

⭐ **That last refusal is the sharp one, and it is right.** Independence is a property of the
*person*, not of the row. Re-freezing the same material under a new id would have produced a corpus
that looked clean and was not.

## What this retirement does NOT touch

```text
product contract          ebcb46d0d          UNAFFECTED
selector implementation   ws2-sel0-selector-01 · 64e439f66   UNAFFECTED
runtime lock              UNAFFECTED
statistical criteria      D >= .60 · p <= .05 · U >= 60      PRESERVED
Manifest A / B / C · excluded set · source snapshot · overlay · fixture lock
                          ALL PRESERVED AT THEIR RECORDED DIGESTS
```

**No test occurred.** Corpus 01 produced no PASS, no FAIL, no INCONCLUSIVE, and no number. It is
retired unrun, which is a different and cleaner thing than a result that has to be explained.

## Consequence

Elemental Alchemy is no longer protected material, because there is no longer a confirmatory
benchmark to protect. It is authorized as the founder-known Work for the Develop Room experience
witness — recorded in `SEL-0_EA_DEVELOP_WALK_2026-09-08.md`.

A new confirmatory corpus is required and is specified separately as **SEL-0B**.
