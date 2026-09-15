# ER-CARRY-01 · SEAM TRANSPLANT

**Date** 2026-09-15 · **Branch** `claude/ws-editorial-runtime-01` (from `1d88f6958`)
**Source authority** `59ae8c7a33d4675e78621cb5700b5d9809c006ec`
**Authorized** founder, 2026-09-15 — **a separate mechanical act**.

```
20 / 20 blobs == source        ⭐
no 21st source file            ⭐
carried seam tests             144 / 144 green
ER-F1 … ER-F8                  green
defeat candidates              7 / 7 killed · 0 unclassified collateral
```

⛔ **NO EDITS TO THE CARRIED BYTES. NO PRODUCER REGISTRATION. NO IMPLEMENTATION.
NO PRODUCTION CHANGE.**

---

## 1 · The mechanic, and why it is a transplant

⛔ **`claude/w4-2-schema-design` was NOT merged and its commits were NOT
cherry-picked.** That carrier holds unrelated architecture and twelve
migrations; acquiring it to obtain twenty source files would have been the trap
already recorded against `b67eb15e5` — *a disclosure travelling with 437 files.*

Each path was transplanted as a blob:

```
git show 59ae8c7a3:<path> > <path>
```

and re-hashed afterwards against `git rev-parse 59ae8c7a3:<path>`.

### ⛔ "no 21st source file", enumerated rather than assumed

```
editorialDiscourse/            2
editorialWorkspace/            3
proposalChain/                 7
revisionAuthorization/         6
exactText.ts                   1
sections/coordinateSpace.ts    1
                              ──
                              20    ⭐ matches the ruled closure exactly
```

⚠️ **And the last line is why the closure was enumerated by path, not by
directory.** `lib/manuscript/sections/` holds **sixteen** files at the source.
Only `coordinateSpace.ts` is in the ruled closure. A directory-wide copy would
have carried **fifteen files nobody authorized** — and would have looked tidy
doing it.

### Before/after manifest

Every one of the twenty read `BEFORE = ABSENT` — nothing was overwritten, so no
prior state was destroyed by this act.

```
editorialDiscourse/__tests__/contract.test.ts        ABSENT → d68706667
editorialDiscourse/contract.ts                       ABSENT → b1c5c7691
editorialWorkspace/__tests__/ontology.test.ts        ABSENT → 972417c24
editorialWorkspace/ontology.ts                       ABSENT → 46af5fa36
editorialWorkspace/store.ts                          ABSENT → a523729eb
exactText.ts                                         ABSENT → 8d0d93f90
proposalChain/__tests__/succession.test.ts           ABSENT → d92869135
proposalChain/contract.ts                            ABSENT → 0776b47e3
proposalChain/editorialSubject.ts                    ABSENT → 1770c2e25
proposalChain/proposalWork.ts                        ABSENT → 2e39ec279
proposalChain/proposalWorkTarget.ts                  ABSENT → c1a41a83b
proposalChain/store.ts                               ABSENT → 53d535b2c
proposalChain/succession.ts                          ABSENT → 33d872181
revisionAuthorization/__tests__/authorization.test.ts ABSENT → c70bf169b
revisionAuthorization/contract.ts                    ABSENT → 409581afe
revisionAuthorization/execute.ts                     ABSENT → 42a81ab64
revisionAuthorization/executionFit.ts                ABSENT → 5db0deb39
revisionAuthorization/status.ts                      ABSENT → 4c4a8515d
revisionAuthorization/store.ts                       ABSENT → de2bbc214
sections/coordinateSpace.ts                          ABSENT → 5fb7d96a4
```

---

## 2 · Acceptance

**The four carried seals, run here:** `4 suites · 144 tests · 144 passed`.

⭐ Their passing is the substantive result. These are the seals that were
authored *with* the seams — `editorialDiscourse` (the discourse contract and
its two seals), `editorialWorkspace` (the ontology's negative law),
`proposalChain` (succession), `revisionAuthorization`. **They pass against a
canonical base that is seven migrations newer than the one they were written
on.**

**The runtime matrix is unchanged by the carry:** `ER-F1 … ER-F8` green, seven
defeat candidates, seven kills, zero unclassified collateral. ⭐ It imports
nothing from the carried seams, so this is confirmation that the transplant
disturbed nothing — not a re-derivation.

---

## 3 · ⛔ The scope boundary, asserted rather than asserted-about

> *The presence of these files does not activate anything.*

- **`revisionAuthorization/execute.ts` is carried and adoption stays shut.** It
  restores an already-ruled seam the other seals depend on. ⛔ Nothing calls it,
  and carrying it is not an execution act.
- **The four editorial producer ids remain UNREGISTERED.** The contract says so
  in its own header — *"DECLARED, not registered: `PRODUCER_REGISTRY` is
  untouched, and a falsifier asserts that it stays untouched."*

⭐ **And the check for that had to strip comments first.** A raw scan for
`registerProducer|PRODUCER_REGISTRY` matches `contract.ts` — **twice, in the
prose that documents the non-registration.** Comment-stripped: **0 hits in
code.** This is the C21 class, and it was applied before it bit rather than
after: *a prohibition must never read as the banned behaviour returning, and a
file can trip a scanner precisely because it documents its own compliance.*

---

## 4 · Standing

```
W5 substrate                    ✅ production
W4 semantic schema              ✅ production
WS-EDITORIAL-RUNTIME-01
  falsifier suite               ✅ ER-F1…ER-F8 · 7/7 killed
  ER-CARRY-01                   ✅ CLOSED · 20/20 · 144/144
  runtime implementation        🟢 OPEN

producer registration           ⏭ belongs to the implementation that follows
UI / Canvas wiring              ⛔
Adopt surface                   ⛔
legacy retirement               ⛔
production mutation             ⛔ NONE
```

> ***The vocabulary is restored. The verb that uses it is not yet written.***
