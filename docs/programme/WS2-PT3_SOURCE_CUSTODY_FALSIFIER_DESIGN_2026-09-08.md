# PT-3 — Source Custody Falsifier · DESIGN

**Status: DESIGN ACCEPTED as the basis for implementation (founder, 2026-09-08),
SUBJECT TO the two falsifier amendments now folded in (§4 P7, §4 P11).**
**BLOCKING DEPENDENCY — P8 requires the WS-DELETE-01 erasure authority boundary.**
That boundary is built and returned:
`WS-DELETE-01_ERASURE_AUTHORITY_AMENDMENT_2026-09-08.md`. PT-3 owns the property
*a content-working act cannot reach Source-destruction authority*; WS-DELETE-01 owns
the channel through which it is enforced. PT-3 consumes and falsifies it — it does not
constitute it.
**The witness itself is NOT built (sequence step 4).**
Date: 2026-09-08 · Branch: `claude/studio-bring-work-back-icvfaa`
Authorizing act: founder ruling 2026-09-08, *"NEXT AUTHORIZED ACT — PT-3 FALSIFIER
DESIGN ONLY"*. Doctrine: `WRITERS_STUDIO_PRODUCT_THESIS_LIFE_OF_A_WORK_2026-09-08.md` §5.

Still held: Encounter · intention authority · Restore · Work→Work lineage · WS2-08B ·
`living_works.stage` · new schema · deployment.

The law being made executable:

> **No content-working act performed in Writer's Studio may modify the historical
> Source from which a Working Draft was created. Revision, restoration, development,
> generation, formatting correction, or other work upon the manuscript occurs only in a
> descendant representation. Explicit member-directed Source lifecycle acts are
> separately governed and must never be disguised as editing.**

---

## 1 — The Source-write census (F4)

Read-only. Scope: every runtime path (`app/`, `lib/`) capable of inserting, updating,
replacing, deleting, overwriting **or invalidating** `manuscript_source_arrivals`, its
vault-backed artifact, or the canonical extracted representation.

### 1.1 — Relational writes to `manuscript_source_arrivals`

| Path | Statement | Class |
|---|---|---|
| `lib/manuscript/source/arrivals.ts:94` `recordArtifactArrival` / `recordSuppliedArrival` | `INSERT` | **ARRIVAL** |
| `lib/manuscript/source/arrivals.ts:137` `claimArrival` | `UPDATE … SET manuscript_id WHERE manuscript_id IS NULL` | **ARRIVAL** (single-claim by predicate) |
| *(none)* | `DELETE` | — |

**In `app/` + `lib/` there is exactly one writer module.** Every other runtime reference
is a read (`app/api/sovereign/studio/history/route.ts`,
`lib/manuscript/ingest/titleSuggestion.ts`, `lib/manuscript/source/custody.ts`).
Writes in `scripts/` (`verify-ws01-source-custody.ts`,
`witness/ws-delete-01-erasure-witness.ts`) are witness fixtures, not product paths —
**INFRASTRUCTURE / MAINTENANCE**, and §3 states how the scan must treat them so that
`scripts/` never becomes the smuggling route.

### 1.2 — Indirect relational destruction (cascade)

`manuscript_source_arrivals.manuscript_id REFERENCES member_manuscripts(id)`
**`ON DELETE CASCADE`**. Deleting a manuscript destroys its arrival row **without any
code naming the source table.**

| Path | Class |
|---|---|
| `lib/manuscript/source/eraseManuscript.ts:108` `DELETE FROM member_manuscripts` (WS-DELETE-01, member-directed, one transaction) | **SOURCE LIFECYCLE** |
| *(no other runtime deleter)* | — |

⚠ **This is the first masquerade surface.** A future capability that deletes and
re-creates a manuscript — "replace this manuscript", "re-import cleanly", a failed-
migration repair — destroys Source through a table it never mentions. §3 Seam C covers
it.

### 1.3 — Vault bytes

| Path | Call | Class |
|---|---|---|
| `lib/manuscript/source/arrivals.ts:51` | `writeVaultBytes('manuscript-sources', …)` | **ARRIVAL** |
| `lib/manuscript/source/eraseManuscript.ts:213` | `destroyVaultBytes(row.artifact_ref)` (sweep) | **SOURCE LIFECYCLE** |
| `lib/bugs/attachments.ts:63` | `writeVaultBytes('bugs', …)` | INFRASTRUCTURE |
| `app/api/sovereign/living-works/[id]/visual/route.ts:159,201` | `writeVaultBytes` / `deleteVaultBytes` (Work cover image) | **CONTENT WORK** (different namespace) |

Two structural facts:

- **`writeVaultBytes` truncates.** It is `mkdir -p` + `writeFile` on a *derived* path
  (`{namespace}/{fileId}.{ext}`), with **no write-once reservation and no namespace
  authority**. The manuscript `fileId` is `Date.now().toString(36) + '-' +
  artifactHash.slice(0,16)`, so today a collision requires identical bytes in the same
  millisecond and would overwrite with identical content — harmless *by arithmetic, not
  by rule*. Nothing prevents a future caller from computing a `manuscript-sources/…`
  path and overwriting it. This is F2's *"…merely by calling a shared helper"*, present
  in the codebase before Restore exists.
- **`destroyVaultBytes` enforces only the vault root**, not the namespace. Any path
  under the root is destroyable.

### 1.4 — `vault_erasure_queue` — the unqualified destruction channel

The sweep destroys **whatever path a row names**. The queue holds a path and nothing
else — deliberately, so it cannot reconstruct erased writing.

Its own migration doctrine states:

> *"NOT a general lifecycle system. It has exactly one producer (the manuscript DELETE
> act) and one consumer (the sweep). Anything wanting a broader deletion lifecycle needs
> its own ruling."*

**The census finds three runtime producers:**

| Producer | Class |
|---|---|
| `lib/manuscript/source/eraseManuscript.ts:123,191` | **SOURCE LIFECYCLE** (the declared producer) |
| `app/api/sovereign/living-works/[id]/route.ts:227` (delete Work) | **SOURCE LIFECYCLE** |
| `app/api/sovereign/living-works/[id]/visual/route.ts:187,224` (replace / remove cover image) | **CONTENT WORK** |

⚠ **The single-producer discipline is stated in a comment and enforced by nothing, and
it has already been exceeded.** Reported precisely, not inflated: **no producer enqueues
a source path today** — the visual route enqueues only the image path it just replaced,
and member-facing exposure is nil. The defect is that *the authority to destroy vault
bytes is reachable from a content-working route*, and the only thing standing between
that and a Source artifact is which string a caller happens to pass. That is the exact
shape PT-3/F2 exists to forbid.

### 1.5 — Classification summary

```text
ARRIVAL                     arrivals.ts (INSERT, claim UPDATE, vault write)
CONTENT WORK                living-works visual route (vault write/delete + enqueue)
SOURCE LIFECYCLE            eraseManuscript.ts (manuscript DELETE → cascade,
                            enqueue, sweep destroy) · living-works DELETE enqueue
INFRASTRUCTURE / MAINTENANCE  bug attachments · scripts/ witnesses · migrations
UNKNOWN                     none
```

**No UNKNOWN remains** — every enumerated capability is classified. That is a statement
about the paths this census enumerated, not a guarantee that none exists; §3's static
scan is what converts it from a reading into a standing assertion.

---

## 2 — The protected object (F1)

**PT-3 does not protect a row. It protects the thing the writer entrusted.** The witness
is therefore a function over four bindings that must agree, not a `SELECT *`:

```text
SOURCE WITNESS (manuscriptId) →
  IDENTITY      id · member_id · manuscript_id · source_kind · created_at
  ARTIFACT      artifact_ref · artifact_hash · artifact_size ·
                original_filename · mime_type
  EXTRACTION    source_text · source_text_hash
  PROVENANCE    extraction_method · extractor_version
  LIVENESS      bytes exist at artifact_ref
                AND sha256(bytes) === artifact_hash          ← re-read, re-hashed
                AND sha256(source_text) === source_text_hash
  REACHABILITY  no vault_erasure_queue row names artifact_ref
```

**Invariant PT-3/F1.** For every content-working act `A` on manuscript `M`:
`witness(M)` before `A` ≡ `witness(M)` after `A`, **and the witness is LIVE** (§5).

Three deliberate design decisions:

1. **LIVENESS is what stops "the row didn't change" from passing for custody.** Destroy
   or corrupt the bytes and every column still matches — WS-01's own negative control
   proves that a hash without recoverable bytes is not custody, and PT-3 inherits it.
2. **REACHABILITY makes *scheduled* destruction a violation now, not later.** An act
   that enqueues a Source path has already broken custody even though the bytes are
   still on disk when the assertion runs.
3. **The witness compares by arrival `id`.** A *new* arrival is permitted (F5); an old
   one changing, being repointed to another manuscript, or disappearing is not.

**Out of scope, and this is the point:** `manuscript_working_drafts`, revisions,
`manuscript_sections`, structure nodes, proposals, keeps, renders and every developmental
artifact are descendant representations and **must** be free to change. Per master brief
§4, `manuscript_sections` is INTERPRETATION, never Source — a falsifier that froze it
would forbid the Studio from working.

---

## 3 — The test seam (F3)

Behavioral assertions alone would produce a false green the moment they run against a
Studio that cannot yet violate the law. The seam is therefore **two instruments, and the
static one is the one that makes future capabilities inherit the law**:

**Seam A — behavioral (does today's Studio mutate Source?).** Witness before → run
representative real content-working acts → witness after. Acts drawn from the built
surface: draft write · draft revision · checkpoint · section body edit · structure
proposal adopt · keeps · develop preparation · reading/standing · render.

**Seam B — static authority scan (can tomorrow's Studio reach Source at all?).** Three
allowlists, asserted over comment-stripped runtime source in `app/` and `lib/`:

| Allowlist | Assertion | Catches |
|---|---|---|
| **Source-write** | only `lib/manuscript/source/arrivals.ts` may contain a write statement naming `manuscript_source_arrivals` | a Restore that writes Source directly |
| **Manuscript-delete** (**Seam C**) | only `lib/manuscript/source/eraseManuscript.ts` may contain `DELETE FROM member_manuscripts` | Source destroyed by cascade, through a table the code never mentions |
| **Erasure-enqueue** | only declared Source-lifecycle producers may `INSERT INTO vault_erasure_queue`, and no enqueue may carry a `manuscript-sources/` path except through the lifecycle authority | editing masquerading as lifecycle |

Comment-stripping is not incidental: it is the ratified C21 lesson — *a prose ban must
never read as the banned behavior returning.* This document itself contains the banned
strings.

`scripts/` is **excluded from the allowlists and asserted separately**: witness fixtures
legitimately write Source, so the scan must state that exclusion and pin the file list,
or `scripts/` becomes the smuggling route the scan was built to close.

**The desired property, stated as the scan's purpose:** any future content-working
capability inherits Source non-mutation *unless someone edits an allowlist* — which is a
visible, reviewable, constitutional act, not an accident.

---

## 4 — The falsifiers, and what each one catches

| # | Falsifier | Catches |
|---|---|---|
| **P1** | Witness identical across every representative content-working act | any content path that mutates Source today |
| **P2** | Witness is LIVE before and after (bytes re-read, both hashes recomputed) | the row-diff false green: bytes destroyed or overwritten, columns intact |
| **P3** | No `vault_erasure_queue` row names the arrival's `artifact_ref` after content work | destruction *scheduled* rather than performed |
| **P4** | Arrival's `manuscript_id` unchanged; arrival still `source_custodied` | Source silently repointed or decertified |
| **P5** | A second import creates a NEW arrival; the first arrival's witness is unchanged (F5) | a later arrival making an old one "become something else" |
| **P6** | Static: source-write allowlist | a future capability writing Source directly |
| **P7** | **Cascade reachability — two-part.** (a) *mutation locality*: the cascade-triggering `DELETE FROM member_manuscripts` exists only at the sanctioned lifecycle boundary; (b) *authority reachability*: content-working paths cannot **enter** that boundary — an allowlist of who may import or invoke `eraseManuscript()`, with the negative control *a content-working caller attempts to obtain manuscript-deletion authority through the sanctioned helper* → **REFUSED / structurally unreachable** | Source destroyed without naming it, **and** a content route calling the approved helper while the SQL allowlist stays perfectly green |
| **P8** | **Source-destruction reachability (post-S4).** Content-working code cannot **acquire** Source-erasure power, **counterfeit** it, **repurpose** another authority into it, or **cross into Source by pathname construction**; canonical-namespace refusal holds. *(Queue locality — exactly one runtime SQL inserter — is now an S4 structural assertion, not a PT-3 falsifier: after S4 the seam is the only inserter, so allowlisting direct inserts would describe the pre-S4 world.)* | editing reaching lifecycle authority |
| **P9** | Lifecycle still works: WS-DELETE-01 erasure destroys Source completely | a falsifier that "protects" Source by making the member's own erasure impossible |
| **P10** | Vacuity guard: a manuscript with no arrival yields **SKIP, never PASS** | green earned by having nothing to protect |
| **P11** | **Source-write reachability (structural).** Two properties: **(i)** generic vault writing cannot target the `manuscript-sources` namespace at all; **(ii)** Source arrival may create a NEW artifact but cannot overwrite an existing historical one — **create-only filesystem semantics**, so historical Source is immutable by mechanism rather than by improbable filename collision. Never satisfied by collision arithmetic, timestamps, hashes, or by observing which callers happen to pass which namespace today | a future content route acquiring `writeVaultBytes` truncation power over Source without ever appearing in the behavioral corpus |

**Post-S4, each falsifier proves a distinct thing — the split matters because P8's old
wording described an architecture that no longer exists:**

```text
S4  / queue locality        exactly one runtime SQL enqueue primitive
P7  / lifecycle locality    only the sanctioned lifecycle path may invoke the
                            manuscript destructive transition
P8  / destruction reach     content work cannot acquire or counterfeit
                            Source-erasure power; canonical namespace holds
P11 / write reach           content work cannot acquire Source creation,
                            overwrite or truncation power
```

**P7's second half is the amendment that matters most.** The original assertion proved
*where* the destructive SQL lives; it said nothing about *who can reach it*. A future
content-working route could call the sanctioned `eraseManuscript()` and leave the SQL
allowlist entirely green. Locality is necessary and insufficient — reachability is the
falsifier.

**P11 is the byte-level counterpart to the Source-row law.** P2 catches an overwrite once
it is exercised; P11 is prospective, and prospective is what PT-3 is for.

**P9 is the half that keeps PT-3 honest.** Custody that cannot be relinquished is not
custody; it is capture. The amended PT-3 exists precisely so the member's own lifecycle
act stays possible, and the falsifier must prove both directions or it will drift into
protecting the Studio's copy of the writer's book from the writer.

---

## 5 — The lifecycle / editing separation assertion (F2)

```text
CONTENT-WORKING ACT                    SOURCE LIFECYCLE ACT
edit · restore · develop · revise      explicit member-directed withdrawal /
format · generate                      replacement / governed custody act
        │                                      │
        └── P1–P8: Source unchanged            └── P9: reaches destruction through
            and unreachable                        ONE named authority, and is
                                                   never entered by a content path
```

The assertion is **reachability, not intent**: a content-working path must not be able to
reach Source-mutating authority *by any means* — a flag, a renamed operation, a shared
helper, a cascade, or an enqueued string. Two of those five are live today (shared helper
§1.3, cascade §1.2) and one is already exercised by a content route (§1.4).

---

## 6 — Demonstrated false-green risk (F6)

**The row-diff false green.** A falsifier that compares columns before and after passes
while the entrusted artifact is gone.

**Synthetic violation** (test double only — production implementation is not modified):
a fake "content-working act" that calls the shared `writeVaultBytes('manuscript-sources',
fileId, ext, differentBytes)` with the arrival's own derived `fileId`, overwriting the
artifact in place. Every column is untouched; `artifact_hash` still holds the original
hash.

- A column-comparison falsifier: **PASS** — wrong.
- P2 (re-read, re-hash): **FAIL** — correct.

This is the same negative control WS-01 already ratified (*"a hash without recoverable
bytes must never be accepted as Source custody"*), applied one stage later: WS-01 proved
custody **at arrival**; PT-3 must prove it **survives the Studio**. That gap is precisely
what this design fills — `scripts/verify-ws01-source-custody.ts` ends at the moment of
arrival and asserts nothing about any subsequent act.

---

## 7 — Smallest implementation series — and the founder act it needs first

**⛔ SURFACED, PER THE RULING'S CONDITION — AND SINCE RULED.** Completing this design
required a new architectural authority boundary for **P8**: there was no Source-lifecycle
authority seam, only an open table with three producers and a doctrine comment. The
founder ruled S4 first, adjudicated in WS-DELETE-01, and the seam now exists
(`lib/storage/erasureAuthority.ts`). Its **first implementation was refused** on founder
review — *absence + namespace is not evidence + locality* — and repaired the same day:
Source lifecycle authority is now an operation, not a portable token, so there is no
authority object to widen, counterfeit, or carry past a rollback. NC-12…NC-18 green.
**Founder acceptance of the repaired seam is still outstanding, and step 4 is held until
it lands** — which is the same discipline that forbade building S2/S3 against the old
shape and rewriting their allowlists afterwards.

Proposed series, smallest first:

| Step | Deliverable | Authorization |
|---|---|---|
| **S1** | `sourceWitness()` — pure + read-only; no schema, no new table | within this design act |
| **S2** | **P1–P5, P9, P10** behavioral falsifier over the real content surface, disposable fixture, rollback-only consequence | needs a build act |
| **S3** | **P6, P7 (locality + reachability), P11** static scans (comment-stripped, `scripts/` excluded and pinned) | needs a build act |
| **S4** | the governed erasure seam that P8 falsifies | **RULED · BUILT · FIRST ATTEMPT REFUSED · REPAIRED** (WS-DELETE-01, 2026-09-08). ⛔ Awaiting founder acceptance; steps below are held until it lands |
| **S5** | Bind the whole set into the release gate so it runs on every Studio change | needs a build act |

**S4 is done.** S1–S3 and S5 now deliver PT-3 as executable law over everything that
exists today, written once against the authority shape that will stand.

---

## 8 — Standing

⛔ THE PT-3 WITNESS IS NOT IMPLEMENTED. No falsifier built, no schema, no route, no
deploy. This document is a design and a census. The only code that exists is the
WS-DELETE-01 seam PT-3 depends on, built under its own lane's ruling and recorded there.

Owed to the founder: **(a)** acceptance of the **repaired** S4 seam; **(b)** a build act
for S1–S3 + S5 against that shape. §1.4's three-producer finding is **adjudicated in
WS-DELETE-01** per the ruling, not here.

> Get PT-3 right and Restore can later become dangerous in exactly the right way:
> powerful against the descendant draft, constitutionally powerless against what the
> writer originally entrusted.
