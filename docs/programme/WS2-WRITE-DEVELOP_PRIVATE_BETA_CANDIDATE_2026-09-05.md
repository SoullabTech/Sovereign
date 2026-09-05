# WS2 · WRITE ⇄ DEVELOP — private-beta candidate · freeze record

> **`61ec49b48` is FROZEN as the WS2 Write ⇄ Develop private-beta candidate (founder ruling,
> 2026-09-05). This record changes no runtime bytes; it is written on top of the candidate, which
> does not move.**

```text
PRIVATE-BETA CANDIDATE   61ec49b48
STATUS                   FROZEN
BRANCH                   claude/ws2-write-develop-integration
```

## 1 · The evidence chain

Each SHA carries its own witness. None inherits another's.

```text
9c27572ce
founder Write ⇄ Develop walk
→ substantive loop PASS
→ compact navigation FAIL

76f722505
compact-navigation repair
→ independent real-browser compact witness PASS

b14c62c95
truthful classifier-refusal copy
→ focused presentation gates PASS

c52d3bb7d
Reader-03
→ provenance-preserving intermediate
→ never live-witnessed

82e966913 / 61ec49b48
Reader-04
→ deterministic contract gates PASS
→ position asymmetry deliberately pinned
→ live Gate 7 PASS

61ec49b48
final integrated smoke
→ 6 / 6 PASS
```

## 2 · What the candidate has been shown to do

```text
WRITE ⇄ DEVELOP founder loop        PASS
kept-version integrity              PASS
scoped supersession                 PASS
revision_not_current                PASS
natural classifier decline          PASS
direct reading retrieval            PASS
privacy boundary                    PASS
compact navigation repair           PASS
truthful classifier-refusal copy    PASS
Reader-04 deterministic gates       PASS
Reader-04 live witness              PASS
```

## 3 · Two witnesses, deliberately not merged

The final smoke's second reading is **constructed** — written through the freeze-and-store path under
the current reader identity, in an independent container and database, because that environment holds
no API key. It was bounded to what it can carry:

```text
retention · coexistence of reader versions · provenance display · direct retrieval
```

The live proposition was established separately, by Gate 7, on the founder's machine and the same
candidate SHA:

```text
live Reader-04 · exact ids in refs · no raw ids in prose
· 1-based section language · member-authored division language
```

These are complementary witnesses to different propositions. Neither is asked to carry the other's
claim, and they do not need to share a database to be valid about the same candidate.

## 4 · A harness finding, not a candidate defect

The smoke's item 3 first came back red. The harness sampled the readings panel after a fixed four
seconds and caught it still showing `opening…` on a cold dev server. That tests the clock, not the
retention contract; the condition was changed to wait for the readings request to resolve, and the
item passed. **Recorded here as a harness finding. It does not enter the candidate defect ledger.**

## 5 · What the freeze does and does not mean

It means: the Write + Develop vertical slice has enough evidence to become the private-beta
candidate. It does **not** mean any of:

```text
merge             authorized automatically   NO
deploy            already proved             NO
production smoke  already done               NO
mentor line       authorized                 NO
Explore           authorized                 NO
Review            authorized                 NO
Publish           authorized                 NO
```

And it does not convert `9c27572ce`'s compact-navigation FAIL into a PASS. That observation remains
true of that SHA; the descendant repair closes it, and the record of both stands.

## 6 · Immutability, for candidate purposes

```text
NO feature additions
NO opportunistic cleanup
NO reader tuning
NO UX polish unless a release gate exposes a blocker
NO new Studio modes
```

A new blocker earns a new SHA. `61ec49b48` remains the frozen candidate that exposed it.

## 7 · Known and carried forward, not blocking

- **Intermittent `classifier_foreign_field`** — one occurrence, refused safely, nothing corrupt
  stored, the next member-initiated commission succeeded. The false copy that accompanied it is
  repaired at `b14c62c95`. The offending key was never captured; a refusal stores nothing by design.
- **`maia_consciousness` migration chain wedged** at `20260830000003_manuscript_structure_contiguity.sql`,
  which does `ALTER TABLE … ADD CONSTRAINT` with no guard. Separate unit.
- **Content-quality observation**, non-blocking: one Gate 7 clause described two sections as sitting
  "on either side of the break" when a section intervenes. Loose phrasing, not an off-by-one, not a
  binding or provenance failure. A frozen reading is not corrected in place.
- **Owed after the lane lands**: the draft-route transaction-mock fix
  (`scratchpad/OWED-AFTER-1194.md`).

## 8 · The phase change

The question is no longer whether the architecture is sound. It is how to get this exact candidate
into testers' hands safely.
