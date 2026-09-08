# PT-3 — Step 4 Results · P1–P11

**Status: P1–P11 GREEN, including P11(iii). Vault-writer census complete, no UNKNOWN.**
**P11 falsified on first run (§4), was RETURNED not repaired, and WS-01 built the missing
write-side boundary under its own ruling (§6). The falsification and its wording are kept
verbatim — the finding is the record, not a stage to be tidied away.**
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
| **⛔ P11(i)** generic vault writing cannot target the Source namespace | ❌ **FALSIFIED on first run** → ✅ after the WS-01 repair, strengthened to canonical destination |
| **⛔ P11(ii)** Source arrival is create-only and cannot overwrite a historical artifact | ❌ **FALSIFIED on first run** → ✅ after the WS-01 repair, now exercising the dedicated Source-create operation |

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

### The smallest repair, as proposed at the time of the falsification (⛔ NOT DONE THEN)

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

*Founder ruling, same day: ownership confirmed to WS-01. The repair is §6.*

---

## 6 — The WS-01 Source write authority repair

Built under the founder ruling of 2026-09-08 (PT-3 Step 4 / P11 falsification). Bounded:
the vault remains a shared mechanism used by several domains; **what is exceptional is
entrusted manuscript Source, and WS-01 owns that exception.** No global vault programme was
opened.

```text
GENERIC VAULT WRITE      ordinary artifacts — MUST NOT resolve into Source
SOURCE ARRIVAL WRITE     the WS-01 boundary — owns the namespace, creates only
CONTENT WORK             has no Source-write operation at all
```

**A · Source reserved from generic writing.** `lib/storage/fileVault.ts` gains
`SOURCE_VAULT_NAMESPACE` and **one canonical vault-destination rule**,
`canonicalVaultDestination()`. The refusal is on the **canonical destination**, never on
the spelling of the `namespace` argument — banning the literal string would repeat S4's
textual mistake in write form, and *both* `namespace` and `fileId` are caller-influenced.
It refuses on segments rather than normalizing: absolute paths, drive letters, backslashes,
NUL, and any empty, `.` or `..` segment. Refused **before** any byte is written and before
any directory is created.

**B · A dedicated Source-arrival operation.** `lib/manuscript/source/sourceArtifact.ts` →
`createSourceArtifact(fileId, ext, bytes)`. It takes **no caller-selected namespace** —
`manuscript-sources` is owned internally — and returns artifact data, never generic write
authority. **No capability token was created:** S4's lesson is that a token is a claim, and
imitating its shape without its reasons would be cargo cult. `arrivals.ts` now establishes
Source through it; the local namespace constant is gone, because a constant there would be
a second place that believes it knows where Source lives.

**C · Create-only by mechanism.** The write uses `wx` (`O_CREAT | O_EXCL`): **the kernel,
not a convention, refuses an existing path.** `EEXIST` never becomes overwrite — the
operation retries at a fresh unique path, establishing a genuinely new artifact.
Deliberately **not** deduplication: identical bytes arriving twice are two entrustments, and
collapsing them would decide a semantic question nobody has ruled on. `allowRetry: false`
makes the refusal directly observable, which is what P11(ii) falsifies against.

### P11 as amended and rerun — **all green**

| | |
|---|---|
| (i) six caller-controlled constructions — `manuscript-sources` · `work-visuals/../manuscript-sources` · `./manuscript-sources` · `ordinary` + `fileId=../manuscript-sources/x` · `../manuscript-sources` · `manuscript-sources/nested` | **all REFUSED**, and no Source directory was created |
| (i) ordinary namespaces still write | ✅ — the refusal is Source-specific, not a general seizure of the vault |
| (ii) duplicate create refused **and the historical bytes read back identical** | ✅ — the assertion is the bytes, not the error |
| (ii) a collision resolves to a NEW artifact, never a replacement | ✅ |
| reachability — only WS-01 Source arrival may establish Source bytes | ✅, kept **separate from P6**: P6 asks who may mutate the Source *record*, P11 who may create or alter the *bytes* |

### The negative controls, before and after

```text
BEFORE REPAIR   row unchanged + bytes overwritten
                → P2 catches the damage after the fact

AFTER REPAIR    a content path attempts the same overwrite through the generic
                writer → REFUSED before historical Source changes (D0)
```

Both are retained in the behavioral witness. D1–D3 still demonstrate the row-diff false
green, with the corruption now applied **out of band** — by writing the file directly,
because the Studio's own writer can no longer reach it. That is the point: the vector is
closed *and* the detection still works, since bytes can be lost to something outside the
Studio and a row diff would never notice.

> From detection to constitutional inability.

---

## 7 — P11(iii) · direct vault-write reachability

Founder review 2026-09-08 accepted the WS-01 production repair and found one last false
green — **in the falsifier, not the mechanism**. P11's reachability assertions proved that
nobody else calls `createSourceArtifact()` and nobody names the reserved namespace at
`writeVaultBytes()`. That is not the whole property. It is the write-side form of the P7
lesson:

> Pinning who calls the sanctioned operation is not sufficient if another route can reach
> the protected resource without that operation.

### The census (read-only)

Rule: a runtime file in `app/` or `lib/` that references the vault root
(`FILE_STORAGE_PATH` / `resolveVaultRoot`) **and** contains a byte-writing call
(`writeFile` · `writeFileSync` · `appendFile` · `createWriteStream` · `copyFile` · `rename`
· a `w`/`a` flag). **Six, and every one is classified — no UNKNOWN.**

| Writer | Why it cannot resolve into Source |
|---|---|
| `lib/manuscript/source/sourceArtifact.ts` | **the WS-01 Source boundary itself** — owns the namespace, create-only via `wx` |
| `lib/storage/fileVault.ts` | the generic writer; refuses a canonical Source destination — P11(i) |
| `app/api/studio/files/route.ts` | first segment is a server-derived practitioner UUID; the only caller-influenced component is `path.extname(file.name)`, which cannot contain a separator |
| `app/api/studio/sessions/[sessionId]/voice-notes/route.ts` | practitioner UUID, then the literal `voice-notes`, then a `randomUUID` note id with an extension from a fixed literal set |
| `app/api/practitioner/materials/route.ts` | practitioner UUID, then the literal `materials`, then a `randomUUID` file id; extension via `path.extname`, no separator possible |
| `app/api/open/threshold/[token]/stream/[streamId]/route.ts` | literal `encounters` segment, then encounter and stream ids read from uuid **columns on a row the token owns** — never from the request path |

**No existing route can presently reach Source.** Nothing to return, and no further production
repair is implied.

### The assertion

Three distinct properties, deliberately not folded together:

```text
P11(i)    the generic helper cannot resolve into Source
P11(ii)   WS-01 Source creation is create-only
P11(iii)  every other direct vault writer is enumerated and bounded away from Source
```

The allowlist carries a **reason per entry**, and a new direct writer fails the census until
someone states why it cannot reach Source — a visible, reviewable act. This is deliberately
**not** "every vault writer must use `writeVaultBytes()`": that would be an unrelated storage
refactor, and independently bounded writers may stay independent.

### The demonstrated false green

The scanner is a pure function over `{path, source}`, so the bypass class is demonstrated on
a **synthetic** route — no production code modified. It writes beneath the vault root through
Node directly, into `manuscript-sources`, calling neither helper:

| | |
|---|---|
| the helper-only assertions see it | **not at all** — this is the false green |
| P11(iii) sees it | **caught**, and it is not in the allowlist |

---

## 5 — Standing

⛔ Not done and not authorized: release-gate binding (step 5) · Encounter ·
Restore · intention authority · Work→Work lineage · WS2-08B · `living_works.stage` ·
deployment.

**Gates (final):** typecheck 229 vs baseline 239, **0 regressions** · structural suite
**19 passed** · behavioral witness **ALL CONTROLS PASSED · 1 skipped** · `lib/manuscript` +
`lib/storage` + `lib/bugs` + living-works + `app/api/studio`: **60 suites, 1034 passed,
1 skipped, 1 failed.**

⚠ **That one failure is pre-existing and unrelated to this lane** — `app/api/studio/
sessions/[sessionId]/voice-notes/__tests__/route.test.ts` expects the 404 copy
`"Practitioner not found"` where the route says `"Practitioner not found for member"`. That
route and its test are untouched by this branch (last modified by PR #1216) and appear here
only because the P11(iii) census widened which suites I ran. Recorded rather than fixed:
repairing it is not authorized by this act.

No previously green constitutional test was weakened or removed; P11 was strengthened
twice — to canonical destinations, then to resource reachability — on its way to green.

**Provenance of the behavioral run:** a PostgreSQL 16.13 cluster stood up in-session, schema
restored from `database/baseline/0001_baseline_2026-09-01.sql` plus every migration from
`20260801` forward. Stated plainly: the baseline restore left some foreign keys unapplied
(the dump's `vector` extension is unavailable here), and the missing
`manuscript_source_arrivals → member_manuscripts ON DELETE CASCADE` was restored by hand
before the P9 leg. **The witness caught that gap by failing** — P9 reported the custody
record surviving an erasure — which is the falsifier behaving correctly against an
incomplete fixture. Production carries the FK; NC-19's earlier run used a minimal schema
built directly from the real migrations and had it throughout.

> Content work is constitutionally powerless against Source **destruction**, against the
> Source **record**, and now against Source **bytes**. Historical Source is no longer
> unlikely to be overwritten by the Studio — it is un-overwritable through the Studio's
> ordinary writing powers.
