# PT-3 — Step 4 Results · P1–P11

**Status: BUILT AND RUN. P1–P10 GREEN. ⛔ P11 FALSIFIES — RETURNED, NOT REPAIRED.**
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa`
Authorizing act: founder ruling 2026-09-08 (S4 acceptance / PT-3 Step 4).
Design: `WS2-PT3_SOURCE_CUSTODY_FALSIFIER_DESIGN_2026-09-08.md`.

> Make it difficult for Writer's Studio to become capable of violating Source custody
> tomorrow without visibly breaking the law.

---

## 1 — What was built

| Artifact | Role |
|---|---|
| `lib/manuscript/source/sourceWitness.ts` | the Source witness — identity · artifact metadata · recoverable bytes · artifact hash · exact extracted text · text hash · extractor provenance · **liveness** · **absence of a pending erasure obligation** |
| `scripts/witness/pt3-source-custody-witness.ts` | behavioral half — **P1–P5, P9, P10** against a real database and a real vault |
| `lib/manuscript/source/__tests__/pt3SourceCustody.test.ts` | structural half — **P6, P7, P8, P11**, four scans kept deliberately separate |

**The four powers are not collapsed into one allowlist**, as ruled: S4 owns the queue
mechanism, P7 lifecycle reachability, P8 destruction reachability, P11 write reachability.
A green P8 does not prove P11; a green P11 does not prove P7.

---

## 2 — Behavioral results (real PostgreSQL 16 + real file vault)

**`ALL CONTROLS PASSED · 1 skipped`** (a skip discharges nothing — FR-14).

Five representative content-working acts, each issued as the product issues it — working
draft created · draft revised again · sections written · a keep recorded · `saveSection()`,
the real section-write code path. After **every** act:

| | |
|---|---|
| **P1** Source witness digest unchanged | ✅ ×5 |
| **P2** Source still LIVE — bytes re-read from the vault and re-hashed | ✅ ×5 |
| **P3** no erasure obligation on this Source | ✅ ×5 |
| **P4** binding intact: `manuscript_id`, `source_custodied` | ✅ ×5 |
| **P5** a later arrival elsewhere leaves the historical arrival identical, and is its own witness | ✅ |
| **P10** a legacy manuscript (no arrival) → **SKIP, never PASS** | ✅ reported as `SKIP`, `custody=legacy_interpreted_import` |
| **P9** the member can still relinquish custody **completely** — record gone · **bytes gone** · nothing left owed | ✅ |

### The demonstrated false green (design §6)

A test-double "content-working act" overwrote the artifact in place through the shared
truncating writer, touching no column. **No production code was modified to make it
reproduce.**

| | |
|---|---|
| D1 every column untouched — **a row-diff falsifier would PASS here** | ✅ reproduces |
| D2 ⛔ **P2 catches it** — the witness is no longer live | ✅ |
| D3 ⛔ and the digest moved, because liveness is part of the witness | ✅ |

*A row comparison is not custody.* This is WS-01's ratified negative control carried one
stage later: WS-01 proved custody **at arrival**, PT-3 proves it **survives the Studio**.

---

## 3 — Structural results

**10 passed · 2 failed.** The two failures are P11, and they are the deliverable.

| | Result |
|---|---|
| **P6** only `lib/manuscript/source/arrivals.ts` writes `manuscript_source_arrivals` | ✅ |
| **P6** the `scripts/` exclusion is *named*, not assumed | ✅ — and it earned its keep immediately: it failed on the two witness scripts written for this very lane until they were named. A new script that writes Source now cannot pass unnoticed |
| **P7(a)** locality — the cascade-triggering `DELETE FROM member_manuscripts` exists only in the seam | ✅ |
| **P7(b)** reachability — only `eraseManuscript.ts` may invoke `relinquishManuscriptSource`; only the manuscript DELETE route may invoke `eraseManuscript` | ✅ |
| **P7(b)** negative control — a content-working caller obtaining deletion authority is structurally unreachable | ✅ |
| **P8** cannot **acquire** — the seam's entire export surface is pinned; no authority export exists | ✅ |
| **P8** cannot **counterfeit** — no authority type, no function taking one | ✅ |
| **P8** cannot **repurpose** — the queue has exactly one writer | ✅ |
| **P8** cannot **pathname-cross** — canonical refusal holds | ✅ |
| **⛔ P11(i)** generic vault writing cannot target the Source namespace | ❌ **FALSIFIES** |
| **⛔ P11(ii)** Source arrival is create-only and cannot overwrite a historical artifact | ❌ **FALSIFIES** |

---

## 4 — ⛔ THE FALSIFICATION (P11)

**P11 was written to the ruled law, not to the implementation, and it fails.** This is the
result, and per the ruling it is returned rather than repaired: *do not silently repair the
Source-write architecture from inside the falsifier build.*

**P11(i) — generic vault writing can target the Source namespace.**
`writeVaultBytes(namespace, fileId, ext, buffer)` takes the namespace from its caller and
has no refusal. Any module that can import it can write into `manuscript-sources`. There is
no `SOURCE_VAULT_NAMESPACE` boundary; the namespace is a string a caller chooses.

**P11(ii) — Source arrival is not create-only.**
`writeVaultBytes` is `mkdir -p` + `writeFile`, which **truncates**. A second write at the
same derived path replaces the first. Historical Source is therefore protected by the
improbability of a `Date.now()`-plus-hash filename collision, not by mechanism — exactly
what the ruling forbids relying on.

**Exposure today is nil, and should not be inflated.** No content-working path passes the
Source namespace, and P1–P5 confirm no current act moves the witness. The defect is
prospective and it is precisely PT-3's subject: **Restore has not been written yet, and
when it is, this is the door it would walk through.** Latent reachability becomes an actual
editing capability the moment a correction feature exists.

### The smallest repair, if authorized (⛔ NOT DONE)

1. A dedicated Source-arrival write boundary that owns the `manuscript-sources` namespace,
   with `writeVaultBytes` **refusing** that namespace — the write-side mirror of what S4
   did for destruction.
2. **Create-only** semantics for Source bytes: open with `wx` (`O_CREAT | O_EXCL`) so a
   second write at an existing path fails at the filesystem, and let the arrival path
   handle collision explicitly rather than silently winning it.
3. A structural scan pinning that only the Source-arrival module may reach that boundary.

That is a new authority boundary on the write side, adjacent to WS-01. **It belongs to
whoever owns Source arrival, not to PT-3** — the same ownership discipline that sent the
erasure-channel defect back to WS-DELETE-01 rather than letting PT-3 rewrite it.

---

## 5 — Standing

⛔ Not done and not authorized: the P11 repair · release-gate binding (step 5) · Encounter ·
Restore · intention authority · Work→Work lineage · WS2-08B · `living_works.stage` ·
deployment.

**Gates:** typecheck 229 vs baseline 239, **0 regressions** · `lib/manuscript` +
`lib/storage` + living-works: **59 suites, 1022 passed, 1 skipped, 2 failed — the two
failures being P11 and nothing else.** No previously green test went red.

**Provenance of the behavioral run:** a PostgreSQL 16.13 cluster stood up in-session, schema
restored from `database/baseline/0001_baseline_2026-09-01.sql` plus every migration from
`20260801` forward. Stated plainly: the baseline restore left some foreign keys unapplied
(the dump's `vector` extension is unavailable here), and the missing
`manuscript_source_arrivals → member_manuscripts ON DELETE CASCADE` was restored by hand
before the P9 leg. **The witness caught that gap by failing** — P9 reported the custody
record surviving an erasure — which is the falsifier behaving correctly against an
incomplete fixture. Production carries the FK; NC-19's earlier run used a minimal schema
built directly from the real migrations and had it throughout.

> Content work is constitutionally powerless against Source **destruction** and against the
> Source **record**. It is not yet powerless against Source **bytes**. That gap is P11, and
> it is the finding.
