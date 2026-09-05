# WS2-07 · BUILD-07D · CONSTRUCTED v2 ABSENT-PHENOMENON RENDER WITNESS — 2026-09-05

**Founder-run, founder-ruled: PASS.** Browser, real room, real session.

> **PASS — constructed rendering evidence only.** It proves that an observation
> whose v2 stored form omits `phenomenon` renders ordinarily, with no
> placeholder and no degraded state. It does **not** establish that live MAIA
> naturally produced a classifier decline.

That sentence governs every later use of this witness. A screenshot taken here
may not be cited as evidence about how often, or whether, a classifier declines.

---

## 1 · Why constructed, and not live

Neither live Gate B(a) reading declined a phenomenon: **8 of 8** observations in
F1 and **5 of 5** in F6 carried one. No live artefact existed to look at, and
acceptance may not wait on stochastic model behaviour. So the specimen was
seeded — and labelled as seeded, in the script header, in its printed output,
and here.

The reading is real by every measure except the decline itself: a real capture
of a real draft, frozen through the 07C freeze under the v2 contract, written
through the 07C store, passing the same trigger and reaching the room by the
same path as any other reading. Only the reader and classifier identities are
fixture identities — and the room shows them as such
(`DEVELOPMENTAL-READER-02 · walk-fixture-model · classified by
DEVELOPMENTAL-PHENOMENON-04`).

Instrument: `scripts/ws2-07d-seed-v2-decline-fixture.ts` (`7aee9a892`).
It does not clean up after itself, deliberately: the `finally` cleanup in every
gate harness is exactly why the two live Gate B readings no longer exist.

## 2 · The specimen as stored, verified from the database

```text
observations        3
declined            1
as stored           recurrence · (none) · positional-asymmetry
o2 phenomenon key   ABSENT — not null, not empty: the key is not there
```

Checked by querying the stored row, not by trusting the seeding code's
intention.

## 3 · The ruling

```text
CONSTRUCTED V2 ABSENT-PHENOMENON WITNESS — PASS

o2 observation text        PRESENT
o2 evidence                PRESENT
o2 limits                  PRESENT
ordinary placement         PRESENT
Current state              PRESENT

phenomenon key             ABSENT by seeded contract
phenomenon label           ABSENT in UI
"unclassified"             ABSENT
"unknown"                  ABSENT
empty phenomenon chip      ABSENT
placeholder                ABSENT
degraded/error styling     ABSENT

sibling o1 label           PRESENT
sibling o3 label           PRESENT
```

As rendered:

```text
O1  RECURRENCE            [Current]     label present
O2                        [Current]     no label, and no gap where one would be
O3  POSITIONAL ASYMMETRY  RESTS ON YOUR STRUCTURE  [Current]
```

The state chip sits where its siblings' sit; the label simply is not there, and
the row closes up as though it never was. `o1` and `o3` keeping their labels is
what makes the absence read as *nothing to say* rather than *something failed* —
the sibling contrast is the whole of the evidence, which is why no further
screenshot of `o3` was required.

Founder's decisive sentence:

> The presentation neither manufactures a classification nor turns
> non-classification into an error state.

This is the interface half of the governing principle. The contract half was
settled in v2; the taxonomy may neither manufacture a developmental observation
nor veto one. Here the room proves it does not smuggle the veto back in as a
visual state.

## 4 · Environment

```text
runtime candidate   2315c7994
browser checkout    7aee9a892       runtime delta: none
database            maia_gatea_scratch (UTF-8, canonical chain + 11 migrations)
server              next dev on :3007, DATABASE_URL set explicitly
```

The npm `dev` script runs `env -u DATABASE_URL`, so it must be bypassed for a
walk against a scratch database — otherwise the app silently falls back to
`maia_consciousness` and renders a different database's content. Confirmed
bypassed by the boot line `[SchemaCheck] schema_migrations records: 515`
(504 baseline + 11 applied).

## 5 · Incidental, recorded but not load-bearing for this ruling

- **Provisional D6 evidence.** Before signing in, the Develop URL — carrying a
  valid manuscript id *and* a valid reading id — rendered a door:
  *"DEVELOP · Readings of your work open only to you. Sign in to enter."*
  No content leaked, no empty room, no not-found. D1–D8 should still confirm
  D6 after a real sign-out: *never signed in* and *signed out* reach that state
  by different paths.
- **A finding outside this unit's boundary.** `/signin` renders a failed
  sign-in as a raw API envelope: `{"error":"Invalid username or password"}`.
  Truthful, but a member sees JSON where a sentence belongs. Not BUILD-07D's
  surface; recorded here so it is not lost, to be fixed in its own lane.

## 6 · Lane state

```text
Gate A                         ACCEPTED · 25/25 · 2315c7994
Gate B(a)                      ACCEPTED · 17/17 · 2315c7994
constructed v2 render witness  PASS
D1–D8                          OUTSTANDING — the live member walk
BUILD-07D                      OPEN · NOT YET ACCEPTED
BUILD-07E                      UNOPENED
covenant-gates                 RED — mentor verification available only after
                               an ACCEPTED ruling
```
