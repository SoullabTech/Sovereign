# EDITORIAL-WRITE-CARRY-COMPLETION-01

**Branch** `claude/editorial-write-carry-completion-01` · **base** canonical `a8095aa18`.
⛔ No merge · ⛔ no deploy · ⛔ no migration · ⛔ no schema change.

> **PURPOSE** Restore the exact transaction-safe section-save primitive that
> `ER-CARRY-01` carried a caller for but did not carry the host for.
>
> **SOURCE OF TRUTH** `3dee5ce13` · EDITORIAL-WRITE-01.

> **⛔⛔ THE ACCEPTANCE LAW, AND IT IS UNUSUALLY STRICT:** this act restores a
> missing carrier from an already-built extraction; it does **not** improve,
> reinterpret, or redesign manuscript writing. If the diff against `3dee5ce13`
> is not mechanically explainable as the same extraction transplanted onto
> current canonical, **stop** — ⛔ do not "finish" it creatively.

---

## 1 · THE TRANSPLANT, DONE MECHANICALLY

⛔ Not retyped, ⛔ not adapted, ⛔ not improved. The span from the
`Save one section` doc comment through the end of `saveSectionInTransaction`
was lifted out of `3dee5ce13` and spliced over the corresponding span in
canonical, by program.

```
canonical span replaced : 2922 chars
transplanted span       : 4514 chars

BYTE-IDENTICAL to the 3dee5ce13 extraction : true
REST OF FILE UNCHANGED                     : true
```

⭐⭐ **The second line is the acceptance law discharged.** Everything outside the
extraction is byte-for-byte canonical.

### ⛔ WHAT WAS DELIBERATELY *NOT* CARRIED

`3dee5ce13` is ahead of canonical on unrelated work, and the full file diff
contains three hunks that are **not** the extraction:

| hunk | act | carried? |
|---|---|---|
| `EditableSection.storedText` | WS-FOCUS-PASSAGE-01 | ⛔ **no** |
| `loadEditableSections(onlyIds)` + returned `draftId` | WS-FOCUS-DRAFT-01 | ⛔ **no** |
| `resolveDraftWriteState` strips `storedText` | WS-FOCUS-PASSAGE-01 | ⛔ **no** |

⭐ *"Mechanically explainable as the same extraction"* means the extraction and
nothing beside it. A carry act that swept up whatever else the source commit
happened to contain would be the ER-CARRY-01 failure repeated in the opposite
direction.

### ⭐ BEHAVIOUR PRESERVATION, PROVEN

```
canonical  saveSection inner body        2275 chars normalised
restored   saveSectionInTransaction body 2279 chars normalised
identical after peeling one brace layer                  false
identical after peeling the extraction block too         TRUE
```

The four-character difference is the extraction's own redundant `{ }` block —
an artifact present in `3dee5ce13` and **kept**, because byte-fidelity to the
source is what makes the transplant checkable. ⛔ Tidying it would have made
this act an edit rather than a carry.

`saveSection` is now the one-line wrapper the extraction made it, and its
observable behaviour is unchanged.

---

## 2 · EVIDENCE

| # | proof | result |
|---|---|---|
| P1 | runtime export probe | `saveSectionInTransaction typeof = function` |
| P2 | import sweep of `lib/manuscript/**` (non-test) | `ALL IMPORTS RESOLVE` |
| P3 | behaviour preservation | token-identical modulo the extraction brace block |
| P4a | compile the **execution path** | **exit 0** |
| P4b | compile `lib/manuscript/**` | one error, **pre-existing and unrelated** |
| P5 | existing section-save tests | **9 passed, 9 total** |
| P6 | adoption execution probe | **10 passed · 0 failed** |
| P7 | ⭐ the probe falsified against canonical | **4 passed · 6 failed** |
| P8 | ship typecheck gate | see §5 |
| P9 | `check:no-supabase` | see §5 |

### ⭐ P4 — before and after, on the same isolated compile

```
canonical   lib/manuscript/ingest/parseUpload.ts(80,32)  TS2339  Mammoth       ← unrelated
            lib/manuscript/revisionAuthorization/execute.ts(43,10)  TS2305      ← THE DEFECT

restored    lib/manuscript/ingest/parseUpload.ts(80,32)  TS2339  Mammoth       ← unrelated
```

⭐ **Exactly one diagnostic removed. None introduced.** The `parseUpload`
mammoth-typings error is pre-existing on canonical, is not on the execution
path, and is ⛔ **not repaired here**.

### ⭐⭐ P6 / P7 — `scripts/witness/ewcc-01-execution-probe.ts`

Disposable PostgreSQL 16 cluster, database name containing `witness`, 451 of 487
canonical migrations applied (36 refused on absent extensions/predecessors;
every table this probe touches was created). ⛔ No route, no surface, no
gesture — it exercises the manuscript **execution path** directly, because that
is the dependency this act restored and the only thing it is entitled to claim.

**RESTORED — 10 passed · 0 failed**

```
P1  authorizeVersion succeeds
P2  the binding names the Work version this act READ          base 41
P3  the permission is unspent
P4  executeAuthorization reaches its mutation without throwing   ⭐ decisive
P5  the outcome is executed
P6  the receipt is whole · resultingVersion                    42
P7  the receipt is whole · acceptedAt is present
P8  the section body carries the adopted wording               ⭐ the manuscript moved
P9  the draft version advanced exactly once                    41 → 42
P10 the compatibility content was DERIVED from the sections
```

**CONTROL, against canonical's `saveSection.ts` — 4 passed · 6 failed**

```
TypeError: (0 , import_saveSection.saveSectionInTransaction) is not a function
    at lib/manuscript/revisionAuthorization/execute.ts:151
❌ [POSTGRES] Transaction rolled back
```

⭐⭐ **The control proves three things at once.** The probe is **lethal** — it
cannot pass on the broken tree. The crash is exactly the predicted one, at
`execute.ts:151`, the `saveSectionInTransaction` call. And the Phase B safety
claim is now **witnessed rather than asserted**: the transaction rolled back, so
P8 reads the ORIGINAL wording and P9 reads version **41** — the Work was never
touched and the permission was left unspent.

⚠️ **P10 passes vacuously in the control** (an untouched draft satisfies it
trivially). Named rather than hidden; it is load-bearing only on the restored
tree, and the control's falsification rests on P4–P9.

---

## 3 · TWO FIXTURE DEFECTS THE SUBSTRATE CAUGHT

Both are recorded because in each case the substrate was right and the probe was
wrong.

**(1) The round-trip trigger is IMMEDIATE, not deferred.** The first fixture
wrote the draft as section-addressable and then inserted its section, and died:

```
draft … is section-addressable: content must equal the flattening of its sections
(sections 67 chars, content 0 chars)
```

⛔ The trigger was not weakened. The fixture now assembles the draft **not**
section-addressable, DERIVES `content` from the sections with `string_agg`, and
declares addressability **last**, once the composition is already true.

**(2) `TRUNCATE members CASCADE` was REFUSED** — by the S3 guard:

```
[S3] TRUNCATE refused on ask_authorization_acts — it would bypass every
row-level deletion guard and resurrect every live authorization at once
```

⭐ The guard is right; the probe was reaching for a convenience the substrate
exists to forbid. Each run now brings its own identities instead of clearing the
database.

---

## 4 · ⛔ NOT DONE, AND NOT ATTEMPTED

```
⛔ save semantics redesigned          none — the body is byte-identical
⛔ transaction boundaries changed     none — the wrapper is the extraction's own
⛔ authorization/execution semantics  untouched; no file under
                                      revisionAuthorization/ was edited
⛔ ADOPTION-01 route/UI behaviour     not present on this branch at all
⛔ schema migration                   none
⛔ deploy                             none
```

⚠️ **The `tsconfig.ship.json` exclusion is NOT repaired here.** It explains why
the defect stayed latent; it is not the missing export. Carried as its own
finding. ⭐ It did not need repairing to prove this restoration: the isolated
compile of the execution path (P4a) and the runtime probe (P6/P7) are direct
evidence, and once ADOPTION-01 lands its route the ship gate compiles the tree
durably anyway.

---

## 5 · GATES

```
TypeScript no-regression gate — tsconfig.ship.json
  program files : 4304 (baseline 3965)
  errors        : 229 (baseline 239)
✨  10 error(s) fixed since the baseline (8 identities gone, 0 reduced).
📈  343 new file(s) entered the program.
✅  No TypeScript regressions.

check:no-supabase   ✅ No Supabase detected.
jest saveSection    9 passed, 9 total
```

⛔ **The baseline was NOT moved.** The gate reports ten errors fixed since the
baseline was recorded; recording that is a separate governed act and is not
taken here.

---

## 6 · STANDING

```
EDITORIAL-WRITE-CARRY-COMPLETION-01   ✅ RESTORED · ✅ WITNESSED · ✅ FALSIFIED
transplant fidelity                    byte-identical to 3dee5ce13's extraction
rest of file                           byte-identical to canonical
execution path                         compiles · exit 0
manuscript execution                   proven end to end on a disposable cluster
falsification control                  4 passed · 6 failed on canonical

tsconfig.ship.json manuscript exclusion  ⚠️ SEPARATE FINDING · ⛔ not repaired
parseUpload mammoth typings              ⚠️ PRE-EXISTING · ⛔ not repaired

merge                                  ⛔ NOT AUTHORIZED
deploy                                 ⛔ NOT AUTHORIZED
production                             UNTOUCHED
ADOPTION-01                            resumes only after this substrate is green
```
