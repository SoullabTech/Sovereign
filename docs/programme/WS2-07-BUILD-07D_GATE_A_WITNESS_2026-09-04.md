# WS2-07 · BUILD-07D · GATE A WITNESS — 2026-09-04

**Founder-run.** Deterministic acceptance act. Head `d884ee606`.

This record states what Gate A establishes and nothing else. Gate B(a) and the
member walk D1–D8 answer different questions and get their own records; they
are not folded into this one, now or later.

```text
Gate A    Does the deterministic Develop architecture obey the contract?   GREEN
Gate B(a) Can live MAIA actually produce the durable member reading?       NEXT
D1–D8     Does the real member-visible room behave correctly?              AFTER
```

---

## 1 · Result

```text
BUILD-07D · Gate A witness
head                     d884ee606
database                 empty UTF-8 scratch database
canonical bootstrap      PASS
pending migrations       11 applied
terminal migration       20260904000002_developmental_reading_contract_v2.sql
Gate A                   25 checks · 0 failures

v2 surface witness:
  stored decline         phenomenon key absent
  presented decline      phenomenon + phenomenonLabel absent
  observation            text/evidence/limits preserved
  siblings               classified labels preserved

provenance E8            PASS
result                   GATE A ACCEPTED
BUILD-07D                NOT ACCEPTED / remains open
```

## 2 · The run

```text
instrument   scripts/ws2-07d-develop-gate-a.ts
invocation   DATABASE_URL=... npx tsx scripts/ws2-07d-develop-gate-a.ts
checkout     /tmp/ws2-f1-pin @ d884ee606
seam         MAIA_INFERENCE_MODE=sovereign — the inference seam REFUSES
             throughout; no model participates in Gate A
falsifiers   E0 · E1–E14 (E8 carrying the three v2 surface checks)
```

The database was built from nothing: `createdb -E UTF8 -T template0` →
`bootstrap-database.sh` (canonical baseline: 634 tables, 504 ledger rows) →
`npm run db:migrate`, which applied 11 pending migrations ending at
`20260904000002_developmental_reading_contract_v2.sql`, then reported
`✅ All migrations applied + invariants verified`.

`E0` — `server_encoding = UTF8` — passed first, so the declared STOP condition
did not fire and the rest of the run is admissible.

## 3 · What the v2 checks witness

Three checks, never executed before this run, added to `E8` when the reading
contract was corrected. They witness the corrected contract **twice, for two
different claims**, inside one frozen reading: fixture phenomena
`['recurrence', undefined, 'positional-asymmetry']`.

| check | what it establishes |
| --- | --- |
| a DECLINED observation carries no phenomenon KEY as stored, and none reaches the presentation | omission survives freeze *and* `developPresentation`; asserted with `in`, so an explicit `null` or an empty string would fail. No badge, no placeholder, no key. |
| the declined observation is COMPLETE — its text, evidence and limits are untouched by the decline | the decline costs the observation nothing: it is admitted whole. |
| the decline does not disturb its siblings — o1 and o3 keep their labels | `recurrence` and `positional-asymmetry` are unaffected; the decline is per-observation, not per-reading. |

Together these are the structural form of the governing principle:

> Observation has ontological priority over classification: the taxonomy may
> describe a developmental observation, but it may neither manufacture one nor
> veto one.

## 4 · The provenance assertion (E8)

`E8 presented: coverage from the frozen coverage; provenance names reader and
classifier apart` — **PASS**.

Recorded because it is not a trivial pass. As the harness stood before this
head, the assertion pinned `-01` version literals against the live constants
and **would have failed**. That is a latent acceptance-harness defect, not a
build defect; it was found only because the v2 fixture change forced a re-read
of the check. It is now written against `READER.readerVersion` and
`CLASSIFIER.classifierVersion`, and asserts they are named apart rather than
asserting either literal.

## 5 · What Gate A does NOT establish

Stated so that no later document can borrow this result for a claim it does not
carry:

```text
NOT established   that live MAIA can produce a durable reading
                  (the seam refused throughout — no model ran)
NOT established   that the member-visible room renders any of this correctly
                  (no browser, no rendered surface, no member)
NOT established   that an `unclassifiable` decline arises naturally from the
                  classifier under live conditions
                  (the decline here is a FIXTURE, deliberately so)
NOT established   anything about production; this ran against an ephemeral
                  scratch database on a development checkout
```

Gate A proves the deterministic architecture obeys the contract. That is its
whole claim.

## 6 · Lane state at this record

```text
Gate A            25/25 GREEN · ACCEPTED · d884ee606
Gate B(a)         AUTHORIZED to begin
D1–D8             AFTER B(a) · must include the absent-phenomenon
                  rendering witness (no placeholder, no "unclassified",
                  no "unknown", no empty chip, no degraded state)
classify.ts       REFROZEN
BUILD-07D         NOT ACCEPTED · remains open
BUILD-07E         UNOPENED · UNAUTHORIZED
covenant-gates    RED — the mentor line is the founder's alone
```

The eventual 07D acceptance is to rest on three independent kinds of evidence —
deterministic, live-model, and member-visible — recorded separately, rather
than on one retrospective document asserting that everything worked.

---

## 7 · Gate A rerun on runtime candidate `2315c7994` — 2026-09-05

Appended, not rewritten. §1–§6 above stand as the record of the `d884ee606`
run and are not relabelled.

Between the two runs, Gate B attempt 1 found a member-surface defect and the
founder authorized a bounded 07D repair (`2315c7994`), which edited one runtime
file, `app/writers-studio/develop/DevelopRoom.tsx`. The runtime under
acceptance therefore moved.

```text
BUILD-07D · Gate A witness · rerun
runtime candidate   2315c7994
checkout            12c485f1a
checkout delta      Gate B acceptance instrument only (pin declaration)
database            the same reconstructed UTF-8 scratch database
Gate A              25 checks · 0 failures
E0                  server_encoding = UTF8 · GREEN
E8 v2               3 / 3 GREEN
result              GATE A ACCEPTED for 2315c7994
BUILD-07D           NOT ACCEPTED / remains open
```

**Why the rerun was required.** Gate A does not import `DevelopRoom.tsx`, so
its earlier result was almost certainly unaffected. That is a reason to expect
a passing rerun; it is not a licence to relabel one execution as evidence of a
different runtime. The governing rule, founder-stated:

> Acceptance evidence belongs to the runtime it actually witnessed.

So 07D's three gates now name one runtime:

```text
runtime candidate   2315c7994

Gate A              deterministic architecture      → 2315c7994 @ 12c485f1a
Gate B attempt 2    live MAIA workflow              → 2315c7994 via P0
D1–D8               rendered member experience      → pending
```

```text
d884ee606 @ 082ae1a74   valid HISTORICAL Gate A evidence · neither erased
                        nor relabelled
2315c7994 @ 12c485f1a   current Gate A acceptance evidence
```

§5 above applies unchanged to this run: no model participated, no
member-visible surface was rendered, and the decline it witnesses is a fixture.
