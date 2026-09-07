# Field pulse containment — provenance of the 2026-07-17 ruling

**Purpose:** resolve the dangling citation in `lib/circles/fieldPulseService.ts` (B-04).
⛔ **This note reconstructs no historical prose.** It records what survives, what does not, and the
one thing that is verifiably wrong elsewhere.

## 1. The citation

`lib/circles/fieldPulseService.ts` carried, in its header:

> `docs/architecture/CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md`

**That file does not exist**, and did not exist when the Circles census first flagged it (2026-09-06).

## 2. It is not recoverable

| Search | Result |
|---|---|
| Working tree | absent |
| `docs/architecture/`, `docs/programme/`, `docs/canon/` | absent |
| **`chore/preserve-larry-experience-audit`** (the branch the preservation audit says it is stranded on) | **absent** |
| `git log --all --diff-filter=A` across **4,801 commits**, all refs | **never added** |

**The document has no recoverable form in this repository.**

## 3. ⚠️ Second finding — the preservation audit is wrong on this line

`docs/ops/PRESERVATION_AUDIT_2026-08-01.md` lists
`CIRCLES_FIELD_PULSE_CONTAINMENT_PLAN_2026-07-17.md` among **281 documents "stranded — on the
branch, not on canonical."**

**It is not on that branch.** The branch was fetched and its full tree searched.

That audit is a **governance record**: its stated purpose is that *"no disposition has been made for
any file below"* and *"do not delete the branch until every file has a disposition."* An entry for a
file that is not there means either the branch was rewritten after the audit, or the inventory
included a name that was never a file.

⛔ **Not repaired here.** It is outside the Circles lane, it is a founder-governed record, and the
correct question — *does this affect other entries in the 281?* — is not one Jarvis should answer
by editing the list. **Raised for founder adjudication.**

## 4. What does survive, and is authoritative

**The code comment itself**, written at the time and continuously present in the runtime:

> **SOVEREIGNTY CORRECTION (2026-07-17, Kelly ruling R5/R12):** System-inferred member themes
> (`member_theme_signals`) are SUSPENDED from the field pulse. Inferred material may support
> private tentative reflection, but it may not enter a shared field without explicit member
> ratification and collective eligibility. The pulse now derives only from circle-native,
> already-governed inputs: inquiries and shared activity. Do not reintroduce `member_theme_signals`
> here without a ratified collective eligibility pathway.

**And the runtime behavior it produced**, verified continuously by the Circle verifier (**C4**):
`getCirclePulse()` sets `const signals: FieldSignal[] = []` unconditionally, and no Circle service
reads `member_theme_signals`.

**The ruling is intact. Only its plan document is missing.** That distinction is the whole finding:
containment was never weakened, and the verifier proves it on every run — which is a stronger
guarantee than the prose would have been.

## 5. Disposition

- The code citation now points **here**, so a reader reaches a true account rather than a 404.
- ⛔ **Runtime behavior is not under repair.** Nothing about containment changes.
- The ruling is cited by its **surviving evidence** — the comment and C4 — not by a document that
  cannot be produced.
- **B-04 → DOCUMENTATION / PROVENANCE ONLY**, now resolved *as* provenance: the missing artefact is
  recorded as missing, not quietly re-cited or invented.

> A citation to a document nobody can produce is worse than no citation: it implies an authority
> that cannot be checked. Naming the absence is the repair.
