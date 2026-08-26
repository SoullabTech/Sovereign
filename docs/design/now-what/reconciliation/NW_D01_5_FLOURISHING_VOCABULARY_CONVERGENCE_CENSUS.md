# NW-D01.5 — FLOURISHING VOCABULARY CONVERGENCE CENSUS

**Unit**: NW-D01.5 · **Date**: 2026-08-26
**Scope (founder-set)**: platform substrate and inconsistency only. **No Larry doctrine changed,
no validation inferred, production status left UNKNOWN.**

> *Note on scope*: D01.5 was originally framed as the relational-architecture / practitioner-lane
> census. The founder narrowed it to vocabulary convergence. **The practitioner-lane census
> remains a separate parked item** (see the relational-architecture amendment).

---

## 1. Every Flourishing domain declaration in the repository

Scanned `*.ts` / `*.tsx` / `*.sql` / `*.json` / `*.md` for files enumerating a domain set
(≥3 domain names co-occurring), then read each declaration directly.

### Runtime-bearing declarations

| # | Location | Declares | Model |
|---|---|---|---|
| 1 | `database/migrations/20260805200001_flourishing_dimension.sql:16` — CHECK constraint | `relationships, meaning, presence, health, contribution, time` | **Larry's six** ✅ |
| 2 | `app/now-what/work/page.tsx:48` — `DOMAINS` | relationships · meaning · presence · health · contribution · time | **Larry's six** ✅ |
| 3 | `components/now-what/NowWhatRoom.tsx:~194` — `CULTIVATE_DIMENSIONS` | relationships · meaning · presence · health · contribution · time | **Larry's six** ✅ |
| 4 | `scripts/seed/seed-flourishing-field.ts:45, :70` — `FIELD_CONTENT.about_practice` | *"five practice domains: **attention**, relationships, meaning, contribution, and presence"* | 🔴 **stale five** |

### Documentation-bearing declarations

| Location | Model | Status |
|---|---|---|
| `docs/reviews/LARRY_IP_CORPUS_INVENTORY_AUDIT_2026-08-03.md` §3a | names both, diagnoses the drift | ✅ correct, and the source of the correction |
| `docs/governance/LARRY_ATTACHMENT_A_INSTRUMENT_v0.md` §0 | names Larry's six; flags the seed's five | ✅ correct |
| `docs/governance/LARRY_SOURCE_AND_CUSTODY_SITTING_AGENDA_v1.md` | names Larry's six | ✅ correct |
| `docs/fields/FLOURISHING_FIELD_MANIFEST.md` (v0.1, **2026-06-28**) | heavy use of **"attention"** as a domain | ⚠️ **predates the correction.** An OS-validation draft, not a runtime input — but it is the most "attention"-dense document in the repo and will mislead anyone reading it as vocabulary |
| `docs/fields/larry/FLOURISHING_NOW_WHAT_FIELD_CONCEPT.md` | mixed | ⚠️ Soullab synthesis, pre-correction |
| `docs/design/now-what/reconciliation/NW_R01_*.md` | Larry's six | ✅ corrected in place by D01 |

**Fixtures / tests**: no test or fixture asserts a domain set. `lib/practiceField/__tests__/` and
`lib/nowWhat/__tests__/` touch flourishing only incidentally. **No test would have caught the
drift, and none would catch it recurring.**

**Prompts**: no prompt file hardcodes a domain list. Domain vocabulary reaches MAIA only through
the practice field's stored text — see §3.

## 2. Which declaration is canonical today

**The CHECK constraint (#1) is the de-facto canonical authority.** It is the only declaration the
database enforces: a `flourishing_dimension` outside `('relationships','meaning','presence',
'health','contribution','time')` is rejected at write time, regardless of what any TypeScript file
believes.

**The three runtime declarations (#1–3) are fully converged on Larry's six.** The member-facing
path — placing a reflection under a dimension, entering the room through a dimension door,
gathering material back per dimension — is consistent end to end.

⚠️ **Canonical ≠ validated.** The CHECK constraint encodes Larry's six as reported by the founder
from a talk corpus that is **not held**, never confirmed by Larry, with the one validation attempt
ruled compromised (D01-F3). *This unit does not treat schema enforcement as validation, and
neither should anything downstream.*

## 3. Where the stale five can still influence runtime

**One path, and it is a live one.**

```
scripts/seed/seed-flourishing-field.ts
  → INSERT/UPDATE practice_fields.about_practice  (ON CONFLICT upsert)
    → getPracticeFieldBySlug(slug)
      → formatFieldContextForRoom()            practiceFieldService.ts:288
         └─ line 292: sections.push(`About this practice: ${field.about_practice}`)
        → resolveFieldBlock()                  roomComposition.ts:108
          → composeRoomTurnPrompt() → the model
```

**If that seed runs against any database, the stale five-domain sentence composes into MAIA's
system prompt for every conversation entered with that field's context.** Not a documentation
defect — a prompt-content defect one command away.

Three aggravating details:

1. **`about_practice` is not behind the corpus gate.** `corpusIsComposable()` returns `false`
   unconditionally — a deliberate hard gate so ratified corpus cannot compose before ratification.
   **`about_practice` bypasses it entirely** and composes freely. The gate protects the corpus and
   not the summary *of* the corpus.
2. **The seed asserts class-D Larry material as fact, pre-signature.** Its `about_practice` opens:
   *"Larry Closs's Now What? practice rests on one central claim: flourishing is not a destination
   — it is a practice."* D01-F6 classified that sentence as **class D** (derived; raw source not
   held) and it is unlicensed under an unsigned agreement. The seed does label itself a demo field
   authored by Kelly *"pending Larry's own authoring act"* — honest labelling, but the sentence
   still reaches a prompt-bound column attributed to Larry's practice.
3. **The wrong five and a right claim travel in the same string**, so a partial fix that keeps the
   sentence and repairs the list still leaves (2) unresolved.

**Mitigations already present**: the seed refuses production DSNs (`PROD_MARKERS = ['soullab.life',
'192.168.0.104', 'minisforum']`, enforced at line 94 with a thrown error); it is **not** wired to
any npm script, so it runs only by explicit `npx tsx`; and it writes a clearly-labelled `larry.demo`
identity rather than a real Larry member. The guard is real and it is narrow: it matches on DSN
substrings, so a production database reached by an IP or hostname not on that list is not refused.

## 4. Is `seed-flourishing-field.ts` executable, historical, or capable of authoring a real field?

**All three questions have uncomfortable answers.**

- **Executable**: **yes.** `npx tsx scripts/seed/seed-flourishing-field.ts [--database-url <dsn>]`.
  Not npm-wired, not deprecated, no removal notice, idempotent by design (`ON CONFLICT … DO
  UPDATE`), so re-running silently overwrites.
- **Historical**: **no.** It is current, referenced by three governance documents as a live defect,
  and carries no "retired" marker.
- **Capable of authoring a real field**: **yes, within its guard.** It creates a `members` row and
  a `practice_fields` row with prompt-composing content. It cannot target the three named
  production markers. It **can** target any other database — staging, a colleague's machine, a
  restored dump, or production reached by an unlisted address.

**Assessment**: the file is a **loaded instrument, safety-catch on**. The catch is real and
substring-shaped. Per Attachment A §5, this file should not author a Larry-labelled field at all
before signature — and today it is the only file in the repo that could.

## 5. Smallest convergence repair

Ordered by ratio of risk removed to change made. **None touches member data, schemas, migrations,
or Larry doctrine.**

**R1 — Make the seed structurally incapable of the wrong vocabulary.** *(smallest, highest value)*
Import the canonical domain list from one shared constant, derive `about_practice`'s domain
sentence from it, and assert at startup that the list matches the CHECK constraint's values.
Divergence then fails loudly at run time rather than composing silently into a prompt. This
converges #1–#4 on a single source and makes recurrence structurally impossible rather than
merely corrected.

**R2 — Remove the class-D Larry claim from seeded prompt content.** Independent of R1 and not a
vocabulary question: the *"flourishing is not a destination"* sentence is unlicensed material in
a prompt-bound column. Either drop it pending signature, or reduce `about_practice` to plainly
Soullab-authored demo text making no claim about Larry's practice.

**R3 — Add the witness test that does not exist.** One test asserting every domain declaration in
the repo matches the CHECK constraint. No test would have caught this drift; that is why it
survived three weeks after being named.

**R4 — Date-stamp or scope-mark `docs/fields/FLOURISHING_FIELD_MANIFEST.md`.** Documentation only.
A 2026-06-28 draft using "attention" as a domain will mislead the next reader; a one-line header
noting it predates the 2026-08-03 correction is enough. **Do not rewrite its content** — it is a
record of a validation pass, not a vocabulary source.

**Explicitly NOT proposed**: changing any domain name; making domains member-declinable (that is
R01-F2/D-D, requires the sitting *and* a migration, since a fixed CHECK cannot hold a
member-named dimension); touching `docs/fields/larry/`; or treating any of this as validation.

## 6. Doctrine untouched

No Larry-authored doctrine was changed, and no validation was inferred. The six domains remain
**Larry-derived via founder report, unvalidated, unlicensed**. This unit only asks that the
repository say **one** thing about them instead of two.

## 7. Production status

**UNKNOWN.** Not inferred, not estimated. The corpus audit's §4 question — whether Larry material
is live in production ahead of a signed instrument — is open since 2026-08-03 and must be answered
by the real query on the founder's machine (this session has no SSH client and no route to
minisforum):

```bash
ssh soullab@minisforum 'docker exec maia-postgres psql -U soullab maia_consciousness \
  -c "SELECT slug, holder_username, length(about_practice) FROM practice_fields;"'
```

Until it runs, **whether the stale five-domain sentence is composing into a real member's
conversation today is not known.** The seed's prod guard makes it unlikely via *this* path; it
does not make it false, because the audit's §4 describes content possibly authored directly in the
production database rather than seeded.

## DECISIONS REQUIRED

1. **Authorize R1 + R3** (structural convergence + witness test) as a bounded repair.
2. **Rule on R2** — whether the class-D Larry sentence leaves seeded prompt content pending
   signature. Recommended: yes.
3. **Run the §7 query.**

## STOP
