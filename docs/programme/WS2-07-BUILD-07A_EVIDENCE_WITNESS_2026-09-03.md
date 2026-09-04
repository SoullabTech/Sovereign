# WS2-07 · BUILD-07A — Developmental Evidence, built and witnessed

```text
LANE            JARVIS-WS2-07-DEVELOPMENTAL-INTELLIGENCE-01 · BUILD-07A
BOUND CANONICAL clean-main-no-secrets @ 8d04f1b9fd0b22a16c8e5673d47279fef3ada3a2
CANDIDATE       claude/build-07a-developmental-evidence-n5tm37 @ bfeb1a9
STATUS          CANDIDATE BUILT · WITNESSED IN SESSION · NOT CLOSED
DATE            2026-09-03
AUTHORIZES      nothing. BUILD-07B–H remain unauthorized.
```

⛔ **This record does not close BUILD-07A.** Closure is a founder act. What is recorded here is
the candidate, what it proves, how, and what remains uncertain — including one uncertainty about
the acceptance instrument itself (§6).

## 0 · Provenance of this record

Every run below was performed **by this remote session**, against a PostgreSQL 16 cluster it
started itself, bootstrapped from the empty canonical baseline by `scripts/bootstrap-database.sh`
and brought forward by the real migration chain (`scripts/apply-migrations.sh`, 634 tables, all
migrations applied). No production database, no minisforum, no founder machine was touched.

```text
[RUN]         this session executed it and read the output directly
[REPORTED]    nothing in this record is REPORTED — every result was RUN
```

The Work in the witness is synthetic. The runtime is not: the draft is created by the real
`POST` handler, saved by the real `PUT` handler, structure is authored by the real
`structureService`, and every capture reads through the real loaders.

## 1 · What was built

```text
lib/manuscript/development/evidenceRef.ts     the reference vocabulary
lib/manuscript/development/readState.ts       the frozen read state + coverage + fingerprint
lib/manuscript/development/resolve.ts         recoverEvidence · locateCurrent · observationLocation
lib/manuscript/development/bind.ts            bindEvidence · BoundEvidence · unreadSpan
lib/manuscript/development/capture.ts         captureEvidence · loadRevisionContent · loadLiveWork
lib/manuscript/development/__tests__/         66 pure cases + the static cannot-act guard
lib/manuscript/structure/structureDigest.ts   the canonical digest, extracted pure (same value)
scripts/ws2-07a-evidence-witness.ts           50 checks against live PostgreSQL
```

Two existing files changed by one line each: `canonicalFingerprint()` delegates to the extracted
digest and returns the same value (pinned by `structureDigest.test.ts`); `codePointBoundaries` is
exported from `draftSections.ts` for the recovery slice.

**Not built, by authority:** no model call, no reader, no prompt, no interpretation, no
`DevelopmentalReading` persistence, no route, no surface, no migration, no manuscript mutation.
`evidenceCannotAct.test.ts` walks the module graph and asserts each of those statically.

## 2 · The evidence object

```ts
DevelopmentalEvidence {
  readState {
    draftId
    revisionNumber            ONE immutable revision — the one the reading was taken from
    revisionDigest            sha256 over that revision's content
    sectionTopology           ordered section ids as read
    sections: {               EVERY section in the topology:
      [sectionId]: {
        revisionNumber        (always the reading's revision)
        range { start, end }  Unicode CODE POINTS into that revision's content
        digest                sha256 over the section's bytes as read
      }
    }
    inputFingerprint          over exactly: draft, revision (number + digest), topology,
                              body-depth sections with digests, structure fingerprint
    structureContext?         present iff authoritative structure was supplied:
                              every authored unit — id, parentId, position, kind, title,
                              origin, adoptedFromId, direct placements by section id
    structureFingerprint?     present iff structureContext is; the canonical algorithm
  }
  coverage {
    sections: { [sectionId]: 'position' | 'body' }
  }
}
```

**No prose.** The object is ids, offsets, digests and the member's own structure labels.
Witnessed: a serialised capture of a four-section Work is 1,934 bytes and contains no word of it.

**`EvidenceRef` — six variants, typed by discriminant:**

```text
TEXTUAL      section { sectionId }                       requires body depth
             passage { sectionId, range }                requires body depth
             section-run { sectionIds[] }                requires position depth
STRUCTURAL   structure-unit { unitId }                   requires structure supplied
             structure-units { unitIds[] }               requires structure supplied
             structure-topology { }                      requires structure supplied
```

A ref carries no version (INV-6), no quote, no heading, no offset into live prose (INV-5). A
`passage` range is in code points relative to the section AS READ and resolves only through the
frozen `SectionState`, whose target is an append-only revision — the same reasoning that admitted
`section_partition`. **Quote policy, ruled for this unit:** a reference carries no quotation; the
words are recovered from the immutable revision, never copied into the reference.

**`BoundEvidence`** is the relation an observation will be required to carry. It is a class with
a private member and no exported constructor; the only way to hold one is `bindEvidence(refs,
evidence)` succeeding. An observation typed `evidence: BoundEvidence` therefore cannot be built,
serialised or deserialised without every reference having been proven against one specific
evidence object. That is what *structurally dependent* means here.

## 3 · The recoverability mechanism

```text
immutable revision          working_draft_revisions (append-only; UPDATE trigger-refused)
+ stable section identity   manuscript_draft_sections.id, carried by section_partition
+ exact range               section_partition [{ sectionId, start, end }] — code points
+ coverage                  per section, position | body
+ recoverable references    EvidenceRef → readState.sections[id] → (revision, range) → text
+ authored-structure refs   EvidenceRef → readState.structureContext (frozen inline)
+ provenance                revisionDigest · per-section digest · inputFingerprint ·
                            structureFingerprint
```

Two operations, named apart and implemented apart (DECIDE §4):

| | function | resolves against | on change |
|---|---|---|---|
| **Historical display** | `recoverEvidence` | the frozen state + the immutable revision | must always succeed |
| **Current location** | `locateCurrent` | the Work as it stands now | `superseded`, saying what moved |

`recoverEvidence` verifies the revision content against `revisionDigest` and the recovered section
against its frozen `digest` before slicing, and slices through the code-point boundary table so an
astral character is never split. `locateCurrent` is three-state — `current · superseded ·
unmeasured` — and scoped per reference: a changed section supersedes refs into it and nothing
else; a run is moved by reorder or insertion inside it, not by text; a unit is moved by its own
row or placements; the topology by its digest. **There is no fuzzy re-find.** A passage in a
section that changed is superseded even where its words survive (INV-19).

**The capture refuses three shortcuts** (`freezeReadState`, pure; `captureEvidence`, live):

```text
revision_not_current       the latest revision is not byte-for-byte AND section-for-section
                           the state now held → refuse. It does not checkpoint on the
                           author's behalf; it does not attach current ranges to an
                           older revision.
partition_not_recorded     the revision predates section-addressability → refuse. It does
                           not re-partition (option (c), still rejected).
structure_inconsistent     structure names a section or parent the revision cannot see →
                           refuse. It does not trim structure to fit.
```

A capture with no authored structure supplied (or a Work that has none) carries no structure
context; structural refs are then refused at bind as `structure_not_supplied` — **absent, not
degraded** (INV-16a). Proposed-origin unit rows are excluded from the frozen context and from its
fingerprint (INV-17).

## 4 · The acceptance instrument — reconstructed, then ratified prospectively

> **FOUNDER RULING — 2026-09-04 · BUILD-07A Acceptance Instrument v1**
>
> The six outcomes and ten falsifiers recorded in this section are **ratified as the governing
> acceptance instrument for BUILD-07A**. They are **not** declared to be a verbatim reconstruction
> of the original 2026-09-02 session list. **Their authority begins with this ruling.** If the
> original instrument is later recovered and contains an additional criterion, that is new
> historical evidence requiring explicit adjudication; this record is not silently rewritten.

The reconstruction below is kept as it was put, so the reasoning that produced the instrument
survives beside the ruling that gave it authority.

**The unit's "ten falsifiers / six required outcomes" are not on canonical.** They were stated in
the session that opened BUILD-07A (2026-09-02) and are referred to by the recoverability boundary
record — *"the substrate would satisfy 4 of its 6 required outcomes, and the recoverability
falsifiers (1 and 2) could not yet be demonstrated"* — but no document carries the list. Searched:
the lane, DECIDE, UNDERSTAND, FIND, the boundary record, the prerequisite record, the board, the
roadmap, and every WS2-07 commit message.

Rather than invent an instrument and call it the original, this record **reconstructs one from
the invariants DECIDE binds on evidence** and states the mapping so it can be disputed line by
line. The two anchors the boundary record gives are honoured: falsifiers 1 and 2 are the
recoverability falsifiers, and the four outcomes satisfiable without recoverability are outcomes
1, 2, 5 and 6.

⛔ **This reconstruction was not the founder's list until the founder said so.** Ratified
prospectively on 2026-09-04 as *Acceptance Instrument v1* — see the ruling at the head of this
section. It governs from that date; it does not claim to be the 2026-09-02 original.

### Six required outcomes

| # | Outcome | Binds | Where proven |
|---|---|---|---|
| 1 | A typed evidence vocabulary that names textual AND authored-structure evidence | INV-5 TYPED · EXPRESSIVE | `evidenceRef.test.ts` · witness §4 |
| 2 | Durable addressing: stable identities only; no live offset, no heading, no per-ref version | INV-5 DURABLE · INV-6 | `evidenceRef.test.ts` · witness F7 |
| 3 | Per-section frozen state that RESOLVES to the exact immutable revision read | INV-7a · INV-7b | `readState.test.ts` · `resolve.test.ts` · witness F1, F3, F4 |
| 4 | Structure context frozen and resolvable; authored structure only; absent where not supplied | INV-7b · INV-16a · INV-17 | `readState.test.ts` · witness F2, F8 |
| 5 | Coverage at the granularity of the claim, and a derivable unread span | INV-8 · INV-9 | `bind.test.ts` · witness F6, O5 |
| 6 | Provenance: a fingerprint over exactly the inputs used; the capture reads and never acts | INV-7 · lane §8 | `readState.test.ts` · witness O6, F5, F10 |

### Ten falsifiers — any FAIL is a unit stop

| # | Falsifier — FAIL if… | Result |
|---|---|---|
| 1 | after the author edits and checkpoints, a textual ref does not recover the text AS READ, byte for byte — or recovers the live text | **PASS** — original recovered; live text differs; wrong revision refused; astral passage whole |
| 2 | after the author changes authored structure, a structural ref cannot show the structure reasoned from | **PASS** — frozen unit recovered with the old title; unit and topology `superseded` |
| 3 | a capture attaches current section ranges to an older revision that does not match the state read | **PASS** — `revision_not_current`, typed; no checkpoint made on the author's behalf |
| 4 | a revision with no recorded partition is re-partitioned instead of refused | **PASS** — `partition_not_recorded` from the live capture and from the pure freeze |
| 5 | the evidence object or any new schema holds manuscript prose | **PASS** — no prose in the object; no new table; no migration |
| 6 | prose-derived evidence binds on a section not read at body depth | **PASS** — `body_not_read`; order-derived evidence over the same sections binds |
| 7 | a ref carries a version, a quote, a heading, or an offset into live prose | **PASS** — by shape, by test, by witness |
| 8 | structural evidence binds to a proposal id or reviewed unit key, or binds where no structure was supplied | **PASS** — `unknown_structure_unit` · `structure_not_supplied` |
| 9 | a reference is re-anchored, fuzzy-matched, or supersession is coarser than what moved; or an unmeasurable Work reads as current | **PASS** — `section-text` on the edited section only; run and structure `current`; null → `unmeasured` |
| 10 | the substrate can reach a model, a reader or a prompt, writes any table, or leaves the Work other than the author made it | **PASS** — static guard; byte-identical Work after every capture and recovery |

### INV-7b

**DEMONSTRATED.** After the author appended to a section (ordinary save), checkpointed it
(revision 2), and renamed a division, the reading frozen at revision 1 recovered the section's
original bytes, a six-code-point passage across an astral pair, the run with its positions, and
the unit with its original title — while `locateCurrent` reported exactly which of those the Work
had moved past and which it had not.

## 5 · Results

```text
unit tests        66 passed · 0 failed     lib/manuscript/development + structureDigest
manuscript suite  552 passed · 0 failed    29 suites, every existing surface unchanged
witness           50 checks · 0 failures   PostgreSQL 16.13, UTF-8, empty baseline + real chain
typecheck         no-regression gate GREEN (ship program); strict tsc over the new modules
                  and the witness: 0 errors
no-supabase       clean
```

Witness sequence, as run: draft born addressable (POST) → two units authored and placed
(structureService) → capture · bind · no-prose · no-write → save without checkpoint (PUT) →
capture refused → checkpoint (PUT) → recover against revision 1 → locate against the live Work →
rename a unit → recover and locate again → legacy-shaped revision → capture refused → static guard
→ Work byte-identical.

### A finding from the run, not about the code

The first scratch cluster was created without an encoding and came up **SQL_ASCII**. Under it,
`length(text)` counts **bytes**, and the section-partition trigger refused the very first draft
creation: *"section_partition covers 415 of 436 code points"* — 415 code points against 436 bytes.
Rebuilding the database `ENCODING 'UTF8'` resolved it. The code was right; the cluster was wrong.

It is recorded because the partition contract, and now the evidence contract on top of it, are
correct **only on a UTF-8 database**. Production is presumed UTF-8 and was not checked from here:

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc "SHOW server_encoding"'
```

should return `UTF8`. If it does not, that is a finding ahead of everything in this record.

## 6 · Remaining uncertainty

1. **The instrument is a reconstruction — RESOLVED 2026-09-04.** Ratified prospectively as
   *Acceptance Instrument v1* (§4). Its authority begins with the ruling, not with a claim of
   provenance. A later-recovered original with an additional criterion is new historical evidence
   for explicit adjudication, never a silent rewrite of this record.
2. **Witnessed in session, not by the founder.** Every result is `[RUN]` by this session on its own
   cluster. The record's value rests on the witness being re-run where the founder can see it:
   `DATABASE_URL=… npx tsx scripts/ws2-07a-evidence-witness.ts` → expected `50 checks · 0 failures`.
3. **Structure fingerprint vs `canonicalFingerprint()`.** Equal whenever no `origin = 'proposed'`
   rows exist in `manuscript_structure_units` — which is every Work under the current model, where
   proposals live in their own table — and witnessed equal. Where such rows existed, the evidence
   fingerprint would digest authored rows only (INV-17) while `canonicalFingerprint()` digests
   all. Named so it is not discovered later.
4. **Who checkpoints before a reading.** A capture refuses when the Work has moved past its latest
   revision; it does not make a revision. Whether a developmental reading is preceded by an
   automatic checkpoint, a member-visible one, or a refusal surfaced to the member is a
   BUILD-07B/07D question about a member's act, and is not decided here.
5. **Heading depth.** Coverage has two depths, `position` and `body`. Draft sections carry no
   heading of their own (headings live on source sections via provenance), so a heading-derived
   evidence kind was not defined. If BUILD-07B needs one, it is an additive variant.
6. **Per-unit supersession includes `position`.** A sibling inserted before a unit renumbers it and
   supersedes refs to it. Conservative in the direction INV-21 prefers; a later ruling could narrow
   it to labels and placements.

## 7 · Recommendation, and the closure gate as ruled

**CLOSE BUILD-07A**, on conditions that are the founder's to satisfy and none of which is a code
change. The first was met on 2026-09-04 (§4 ratification). Two remain, **ruled 2026-09-04**, and
neither can be performed from a remote session: one needs the LAN path to minisforum, the other is
founder-visible by definition.

```text
CHECK 1 · production PostgreSQL is UTF-8
  ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness -tAc "SHOW server_encoding"'
  REQUIRED   UTF8
  OTHERWISE  STOP. The database is not repaired in this lane.

CHECK 2 · founder-visible witness rerun, from a clean checkout of the candidate
  git rev-parse HEAD          → the candidate's tip (code unchanged since bfeb1a9;
                                see the lane entry for the exact tip at closure)
  git status --short          → empty
  DATABASE_URL="$DATABASE_URL" npx tsx scripts/ws2-07a-evidence-witness.ts
  REQUIRED   50 checks · 0 failures
```

**When both hold, the founder authorizes:**

```text
BUILD-07A     CLOSED / ACCEPTED
INV-7b        DEMONSTRATED
F1–F10        PASS
O1–O6         PASS
```

— then the ordinary PR for `claude/build-07a-developmental-evidence-n5tm37` is opened, its gates
run, and it merges only after green. **BUILD-07B is not begun in that closure commit or PR.**
After 07A reaches canonical, BUILD-07B — Developmental Reader — is authorized separately, by its
own act. If either check fails, **HOLD** — the code does not change while a gate is red.

## 8 · What this does not do

```text
no model · no reader · no prompt · no interpretation
no DevelopmentalReading · no observation · no lens · no phenomenon
no route · no surface · no migration · no manuscript mutation
no second durable prose store
no closure of BUILD-07A · no opening of BUILD-07B
```
