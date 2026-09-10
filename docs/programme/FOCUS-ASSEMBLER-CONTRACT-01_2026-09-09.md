# FOCUS-ASSEMBLER-CONTRACT-01

**Base `1ab082de7` · REPAIRED · witness NOT spent · flag OFF · `#1275` FROZEN.**

> ⭐⭐ **Focus reads the Work the writer is actually writing, not the Source it
> once came from. Addressability is the boundary that makes "here" durable enough
> to disclose.**

Found by the founder's pre-walk check, **before** the witness was spent. Three
defects in one seam, none of which 190 unit falsifiers could see.

## 1 · The read authority was wrong twice

`assembleFocus.ts` joined a `manuscripts` table that does not exist, on a
`user_id` column that does not exist, and read `manuscript_sections` — the
**Source ingest** relation. Every query would have failed, been caught, and
produced a truthful `did_not_cross`: the witness would have proved only that the
failure path works.

⭐⭐ **The naive repair would have been worse than the bug.** Renaming the table
would have *worked* — and disclosed Source text the member never made
section-addressable, bypassing a gate conferred only by a member act
(`sectionAddressabilityLifecycle.test.ts` holds ingest to that). *A fix that
passes and breaks the law.*

Ruled read authority, now enforced **inside the query**:

```text
member_manuscripts          identity of the Work        member_id must match
manuscript_working_drafts   current authored state      member_id must match
                            ⭐ section_addressable_at IS NOT NULL
manuscript_draft_sections   section-native truth        text, position order
manuscript_sections         ⛔ SOURCE / provenance — never the payload
```

Both ownership hops are asserted separately, because they are separate columns and
a future schema change could let them disagree.

## 2 · A real passage had no lawful path

The receipt forbids `section_ref` on a passage (application check **and** CHECK
constraint) — but the assembler needs that same id to find the passage. So:
send it and the mint refuses; omit it and assembly fails.

> ⭐ **The request may carry an ephemeral locator needed to execute the writer's
> act. The receipt records only what it is constitutionally entitled to retain.**

`passage` → assembler yes, receipt `NULL`. `section` → both, because the section
*is* what crossed. ⭐ The producer **label** is narrowed identically: a section
name in the prompt would leak the locator the receipt refuses.

⚠️ The old fixtures hid this: default request `passage` with **no** `sectionRef`,
against an assembler mocked to return text regardless.

## 3 · Two coordinate systems for one selection

The browser reports `selectionStart`/`selectionEnd` as **UTF-16 code units** and
Held Focus applies them with plain `.slice()`. The assembler used
`[...body].slice()` — **code points**. After an emoji the two diverge, and the
server would read different words than the writer framed. Now `.slice()`, pinned
by an emoji fixture.

## Witness — `scripts/witness/focus-assembler-contract.ts`

Imports the **real** `assembleFocus` and runs its **real** SQL against a
disposable Postgres holding the real schema. ⭐ The load-bearing fixture is that
**Source and Draft say different sentences**, so nothing can pass merely because
both happen to contain the same words.

**10 checks · 10 PASS · 0 FAIL** — draft wins over Source · Source never the
payload · draft order preserved · section id is draft-section identity · a Source
section id is not a valid locator · gate holds · wrong member gets nothing, even
with a real locator · emoji-before-selection exact · passage without a locator
refuses.

⭐ **And the instrument was proved able to fail**, which is the whole point:

| mutation | verdict |
|---|---|
| `member_manuscripts` → `manuscripts` | **5 failed** |
| Source substituted for draft | **3 failed** |
| addressability predicate removed | **1 failed** |
| code-point slicing restored | **1 failed** |
| unmutated | 10 passed · 0 failed |

*An instrument that cannot fail on the wrong answer has not tested the right one.*

**Gates:** contract witness **10/10** + 4 mutations red · `lib/disclosure` +
`lib/writers-studio` **197 passed · 0 failed** · typecheck 228 vs baseline 239 ·
0 regressions · `check:no-supabase` clean.

⛔ **Not touched:** Source schema · addressability lifecycle · automatic
conversion · receipt schema · passage privacy · Field + Orbit · `#1275` · deploy.

**Standing: `1ab082de7` is NO LONGER the witness subject.** The new tip is, and it
must be frozen, its serving-runtime identity established, and only then spent on
the seven-step walk.
