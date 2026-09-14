# Replay witness — product subject `085451706`

A **replay** of the lane's runtime witness on the merged head, run because
canonical moved and the custody rule requires evidence to name the state it was
taken against. It does not replace the original run; `../../wire-result.json`
and `../../witness-record.md` remain the evidence of record for `2902def01`.

## Subject

```
PRODUCT SUBJECT   0854517068969e93716bf7592c60da2742532696
CANONICAL BASE    bbf52f009881f913153549c88b1077203462da03
PRIOR SUBJECT     2902def019fca72a820b9f78afcff1f7188fab28   (still accepted)
PRIOR CUSTODY     034bf8ca79ebe8a079a0832d76b2c668517d6711   (still sealed)
```

`085451706` is a merge of canonical into the transport branch — no rebuild, no
force-push. Both prior SHAs remain in ancestry.

## Instruments — unchanged, and that is the point

The replay reused the sealed instruments **byte-for-byte**, verified by digest
immediately before the run:

| Instrument | SHA-256 | Same as sealed |
|---|---|---|
| `../../seed.mjs` | `2141e4dfbef29151139ed3c86b68125699563670f79bebe0c61442407dc3f47f` | yes |
| `../../witness.mjs` | `2078aa033ef737e1abc12a8475fd4517eade800c01dba96e35a69cc69f34fd6c` | yes |

⚠️ **One episode is recorded rather than tidied away.** The replay server was
first started on port 3998 and the driver's URL was edited to match, which broke
byte-identity (digest `92c36b36a3d5cfac…`). That edited copy was **discarded, not
run**: the driver was restored from the sealed bytes and the server restarted on
3999, the port the sealed instrument targets. Digest re-verified as identical
before execution. The alternative — running the edited copy and calling it the
same instrument — is exactly the provenance laundering this custody discipline
exists to prevent.

## Environment, as observed

```
PostgreSQL    16, fresh disposable cluster (separate from the original run's)
migrations    424 of 480 applied
refused        56  — identical count to the original run
server        Next dev, real HTTP, real route
```

## Arms — observed on this subject

```
ARM 1  BODY_AUTHORITY_REQUIRED   200   768 bytes
       sections              aa · mm · zz
       sectionOrientations   2 · 5 · 9

ARM 2  BODY_SCOPE_INCOMPLETE     200   509 bytes
       sectionOrientations   byte-equal to ARM 1

ARM 3  unlocatable               500    66 bytes
       {"refusal":"section_orientation_unavailable","unlocatableCount":1}
```

Every figure matches the original run — same statuses, same byte counts, same
ordinal law, same count-only refusal. The fixture uses fresh UUIDs, so the
response bodies differ in identity values while the governed properties do not.

## ARM 3 — mutation deltas, as observed

| table | delta |
|---|---|
| `ask_threads` | **0** |
| `ask_turns` | **0** |
| `ask_authorization_acts` | **0** |
| `ask_authorization_consumptions` | **0** |
| `context_disclosure_receipts` | **0** |

## Static gates on this subject

```
frozenOrientation.test.ts          25 passed
ask + writersStudio + disclosure   572 passed, 36 suites, 0 failed
TypeScript no-regression gate      229 vs baseline 239, no regressions
```

## Cleanup

```
Next server   stopped
cluster       stopped
data dir      removed
```
