# WS2-07 · BUILD-07D · GATE B(a) WITNESS — 2026-09-05

**Founder-run.** Live witness through the surface's own routes, with the model
REAL. Two attempts, both recorded. Attempt 1 is not a bad run and is not
reinterpreted: it is the attempt that found the defect attempt 2 proves
repaired.

```text
Gate A    Does the deterministic Develop architecture obey the contract?   GREEN
Gate B(a) Can live MAIA actually produce the durable member reading?       GREEN
D1–D8     Does the real member-visible room behave correctly?              PENDING
```

---

## 1 · Result

```text
BUILD-07D · Gate B(a) · attempt 2
runtime candidate   2315c7994
checkout            12c485f1a          (acceptance instrument only)
P0                  byte-identical to the candidate · GREEN
Gate B(a)           17 checks · 0 failures
provider calls      4 over 3 commissioned acts
rows frozen         2
result              GATE B(a) ACCEPTED
BUILD-07D           NOT ACCEPTED / remains open
```

The complete lawful workflow, witnessed live end to end:

```text
first kept version
    ↓  F1   MAIA reads · 201 · reading 22960931 · 8 observations · 2 calls
    ↓  F4   the writer edits Section 1 through the draft route
    ↓  F5   old reading SUPERSEDED, scoped per observation, byte-identical
    ↓  F5b  premature reread REFUSED · revision_not_current at capture
    ↓  F5c  the writer Keeps a version — the act the refusal named
    ↓  F6   MAIA reads again under another lens · 201 · reading dcff5816
            · 5 observations · the first retained and listed
```

## 2 · Attempt 1 — the failed acceptance witness that earned this

```text
runtime candidate   d884ee606
checkout            dd6c9bfd8
P0                  GREEN
F1                  GREEN · reading ab36c907 · 8 observations · 2 calls
F2–F5               GREEN
F6                  409 revision_not_current at capture · REFUSED CORRECTLY
provider calls      2
result              14 checks · 1 failure · GATE B(a) UNPROVED
record              /tmp/ws2-07d-gate-b.json, preserved
```

The refusal was the capture guard doing exactly its job: F4 saves through the
draft route as an **autosave**, so the draft advanced (1383 bytes) while the
append-only revision stayed where it was (revision 1, 1364 bytes), and

> a capture never attaches current ranges to an older revision.

Three facts fix the adjudication and were checked, not assumed: the refusal
arose at stage `capture`, **before** any model call; total provider calls were
2, all F1's; and no row was stored. Neither the v2 contract, the reader, the
classifier nor persistence was implicated. F6 had never established its own
precondition, so it never tested what it claimed to test.

## 3 · What attempt 1 found: a member-surface defect

Develop answered *every* capture and recover refusal with

> "This work is not ready to be read yet — it needs a draft with sections."

This draft had sections. What it lacked was a current kept version. The surface
misdescribed the exact state the guard had just caught.

**The member contract, settled by founder ruling:**

> MAIA reads a KEPT version of the Work. If the writer has changed the Work
> since the last kept version, they keep the current version before
> commissioning another developmental reading.

**What was explicitly NOT done**, because each would have dissolved the
boundary the guard exists to hold: `revision_not_current` was not weakened;
capture was not made to checkpoint; the Develop commission was not made to
checkpoint silently on the member's behalf. The Develop room's only act remains
asking for a reading, and it holds no control that changes the Work.

**What was done** (`2315c7994`): the refusal is named in the member's language,
and the room offers the navigation that already exists — the Writer Canvas,
where "Keep a version" lives.

## 4 · F5b — the discovery made permanent

```text
✓ F5b edited but not kept: the commission refuses revision_not_current AT
      CAPTURE — no model call, no row, one act
      (409 revision_not_current at capture · 0 call(s) · 0 new row(s))
```

Passed on its first-ever run. F4 and F5 were preserved byte-for-byte so that
what they attest is unchanged; F5b was inserted between F5 and F6, and F5c
supplies the precondition F6 always needed. The repair therefore cannot delete
the circumstance that found it, and a future weakening of capture fails here
rather than passing quietly.

## 5 · What Gate B(a) does NOT establish

```text
NOT established   that the member-visible room RENDERS any of this correctly —
                  no browser, no rendered surface, no member. In particular the
                  new refusal sentence and its Writer Canvas link are witnessed
                  here only as route behaviour, never as pixels.
NOT established   that an `unclassifiable` decline arises naturally. All eight
                  observations in F1 and all five in F6 carry a phenomenon.
                  D1–D8's absent-phenomenon witness needs a CONSTRUCTED
                  reading; it cannot come from these.
NOT established   anything about production. This ran in-process against an
                  ephemeral scratch database on a development checkout.
NOT established   any judgement about the CONTENT of what MAIA noticed. The
                  observations are printed for the founder and are never
                  auto-adjudicated by a script.
```

## 6 · Lane state at this record

```text
runtime candidate   2315c7994
Gate A              25/25 GREEN · 12c485f1a · ACCEPTED
Gate B(a) attempt 1 preserved · UNPROVED · the finding is its value
Gate B(a) attempt 2 17/17 GREEN · ACCEPTED
substantive CI      build · TypeScript no-regression · Empty database
                    reconstruction · sovereignty · check-diagrams · Axis 1 ·
                    auto-label — all GREEN on 12c485f1a
D1–D8               NEXT · two visual obligations (§5)
BUILD-07D           OPEN · NOT ACCEPTED
BUILD-07E           UNOPENED · UNAUTHORIZED
covenant-gates      RED — the mentor line is the founder's alone, and Gate B
                    and D1–D8 had to earn it before it could be given
```

Instrument: `scripts/ws2-07d-develop-gate-b.ts`.
Records: `/tmp/ws2-07d-gate-b.json` (attempt 1, copied to `~`),
`/tmp/ws2-07d-gate-b-attempt2.json` (attempt 2).
