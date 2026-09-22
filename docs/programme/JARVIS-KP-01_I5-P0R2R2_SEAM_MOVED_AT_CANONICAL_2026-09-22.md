# JARVIS-KP-01 / I5-P0R2R2 — SEAM MOVED AT CANONICAL

STATUS: RECORD (⛔ not an authorization)
**Date**: 2026-09-22
**Disposition**: `I5-P0 NOT READY` — §I.2 expected full-scope digest is STALE. **The binding refused correctly.**

> NO SEMANTIC JOIN WITHOUT A WARRANT.

---

## 1. §I custody — verified, all five blobs MATCH

At `429d0adf219113ea9a16e53d5544fe7d1265a92b`, parent
`d03a8757d85a77de8301cb9338c3a92f2738f763` (as the act states):

```
i5-p0r2-remediation.sh          1ecf0cbdbd528f0b78d1f8f83161eb0c31d11147   MATCH
i5-host-plane-probe.sh          a96de5c447c5f9aea14203768694ebaa057f2f31   MATCH
i5-p0r2-ceiling-falsifiers.sh   c3741121ebf79b953520bbc7f394dbf90cfe8621   MATCH
seam-identity.mjs               b86a7e3982a0bf809022c2fdfe2b7f28c203d223   MATCH
seam-identity-container.mjs     85bdba16753cceb4d5991ca4c8c69b57f79f1585   MATCH
```

## 2. ⭐⭐ The blocker — and it is the instrument WORKING, not expiring

Canonical advanced to `4ef9a1988f44394375526a78ca4db3694f5b51a5`. One declared
seam path changed:

```
M  app/api/sovereign/app/maia/list/route.ts
```

| digest | authorized (§I) | canonical now |
|---|---|---|
| full scope · 37 files | `195b16bc…` | **`b828400c…` — MOVED** |
| image scope · 36 files | `a63cf931…` | **`a63cf931…` — UNCHANGED** |

So the **running container still presents the authorized seam**; only canonical's
serving route moved. §I.3 holds; **§I.2 does not**, and the git-side witness
refused with `SEAM_MOVED_AT_CANONICAL`.

⭐ **This is categorically different from the P0 / P0R1 failures.** Those died
because the *warrant* named a point that something else moved — a defect in the
binding. This died because **the seam itself moved**, which is the one thing the
binding exists to stop. *The property-based binding is not expiring arbitrarily;
it is refusing a real change.*

## 3. What moved, read in full

`c6744f66 feat(serving-identity): execute F2-IQ at accepted-turn seam` — **another
lane**, seven added lines:

- one import of `classifyExplicitIdentityInquiry`
- one request-scoped call on the accepted utterance
- `void` of its result, with the comment stating: *no D2/D1 invocation,
  persistence, logging, response metadata, or disclosure*

⛔ It does **not** touch the shadow launch, the response construction, or anything
the I5 isolation falsifiers cover. It sits upstream of the shadow and discards its
own result.

## 4. ⚠️ The structural tension, named and ⛔ NOT resolved here

The seam declares the **whole serving route file**. That route is where the shadow
is launched, so including it is right — but it is also a file other lanes
legitimately edit, and **any byte changed anywhere in it STOPs I5**, even when the
change provably cannot affect the shadow.

Three dispositions, ⛔ none taken (each is a founder act on the readiness law):

- **(a) Re-pin** the full digest to `b828400c…`, with §3's diff on the record.
  Cheapest, and **keeps the law strict** — the digest move did its job by forcing a
  human to read a change to the serving route. **Recommended.**
- **(b) Narrow** the route entry to a sub-file region. ⛔ Hard to define
  byte-exactly and fragile to reformatting; it would trade a loud stop for a
  silent blind spot.
- **(c) Split** the law: require image-scope **equality** (which holds) plus
  **review** of any full-scope movement, rather than an automatic STOP.

⚠️ Whichever is chosen, note what (a) costs: re-pinning on every unrelated edit to
a busy route means the readiness digest needs a human read each time. That is a
real toll, and it is the honest price of a byte-exact binding over a shared file.

## 5. Dry-run boundary falsifiers — **4 PASS · 0 FAIL · 5 NOT ESTABLISHED**

`scripts/witness/i5-p0r2-dryrun-boundary-falsifiers.sh` drives a complete dry run
against stubbed `docker`/`psql`. §VI and §VII are only as strong as the script's
no-mutation boundary, and **that boundary had never been exercised** — every prior
run stopped in Phase 1.

| # | Proposition | Result |
|---|---|---|
| D3 | the configuration file was not modified | **PASS** — sha256 unchanged |
| D4 | no backup file was created | **PASS** — 0 |
| D5 | no compose invocation (no recreation) | **PASS** — 0 |
| D6 | no write SQL was issued | **PASS** — read-only only |
| D1 · D2 · D7 · D8 · D9 | reach-dependent propositions | **NOT ESTABLISHED** |

⭐ **D3–D6 passing under an early refusal is itself worth having**: it shows the
**refusal path also mutates nothing** — a STOP does not leave a half-written
config or an orphan backup.

⭐⭐ The five unreached propositions are scored **NOT ESTABLISHED, ⛔ not FAILED**,
for the same reason ancestry is three-valued: *scoring a lawful refusal as a
failure pressures the next author to weaken the refusal in order to turn the
matrix green.* The exit status is 0 because nothing failed, and the count is
printed so the gap cannot be read as success.

⛔ **I did not fake the binding to complete the matrix.** Overriding the canonical
rev, or relaxing the expected digest to let the test run through, would have
produced a green matrix that proved nothing about the act being authorized.

## 6. Standing

§I custody **VERIFIED, 5/5 MATCH** · §II falsification **6/6 PASS** (unchanged) ·
§III SNI correction **ACCEPTED** · §IV host-plane witness **ACCEPTED** · §VI dry
run **BLOCKED at the git-side binding** · image-scope seam **INTACT** · full-scope
seam **MOVED, expected value STALE** · no-mutation boundary **PARTIALLY PROVEN
(4/9, 0 failures)** · `--apply` **NOT RUN** · `.env.production` **UNMUTATED** ·
recreation **NONE** · flags **ALL OFF** · rows **NONE** · B1 **UNREPAIRED** · B2
**UNREPAIRED** · instrument **NOT FROZEN** · ⛔ I5-P1 NOT OPENED ·
**PRODUCTION UNTOUCHED.**

⭐ *The lane has now been stopped four times. The first three were the warrant
expiring. This one is the warrant working.*
