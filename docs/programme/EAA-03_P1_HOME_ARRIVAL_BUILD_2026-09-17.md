# EAA-03 / P1 — Home Arrival build

**Date:** 2026-09-17
**Authority:** EAA-03 / P1-D — Home Arrival Build Authorization
**Prerequisite:** `LF-SCOPE-01` PASS at `6adbc3bb` ✅
**Branch:** `claude/magical-archimedes-dcsry5`
**Status:** ✅ P1.1–P1.5 IMPLEMENTED · ✅ TESTS PASS · ✅ BEHAVIOURAL WITNESS PASS · ✅ VISUAL WITNESS CAPTURED · ⛔ P2 NOT BEGUN · ⛔ NOT DEPLOYED

> The member arrives, meets a quiet centre, recognizes up to three things they
> themselves chose to keep, and can begin — with nothing interpreted about them.

---

## 1. Implementation seam

The already-shipped prototype membrane, extended by one view. **No new route.**

```
/maia/prototype                          (existing page, gate untouched)
  └─ ArrivalPrototypeShell               (existing shell, +1 view entry)
       └─ view 'fieldnow'  →  FieldNowArrival        ← NEW surface
                                  │
                                  └─ GET /api/maia/field-now   ← NEW read-only route
                                          └─ loadEligibleKeeps()  ← NEW adapter
                                                  └─ livingFieldAtomGuards()   (LF-SCOPE-01, imported)
```

Containment inherited unchanged: default-OFF `arrivalPrototype` flag · role gate ·
prototype-only posture · no production Home replacement · no redirect · existing
House escape · **iOS exclusion** (`scripts/capacitor-patch-routes.sh` already
carries `"app/maia/prototype"`) · no persistence, no default-state inference.

## 2. Files

**New**
| File | Purpose |
|---|---|
| `lib/maia/field-now/eligibleKeeps.ts` | The read-only continuity adapter |
| `lib/maia/field-now/display.ts` | Pure provenance phrasing + date truth |
| `app/api/maia/field-now/route.ts` | GET only, credential-bound |
| `components/maia/prototype/FieldNowArrival.tsx` | The P1 surface |
| `lib/maia/field-now/__tests__/eligibleKeeps.test.ts` | 17 tests |
| `components/maia/prototype/__tests__/fieldNowArrival.test.ts` | 33 tests |
| `scripts/witness/p1-field-now-eligibility.sql` | Behavioural witness |
| `docs/programme/witness/p1/*.png` | Visual witness (6 frames) |

**Modified — one file, four lines:** `components/maia/prototype/ArrivalPrototypeShell.tsx`
(import, `View` union, one `VIEWS` entry, one render line).

## 3. Reused, not rebuilt

| Primitive | Source |
|---|---|
| Centre visual | `RhythmHoloflower` (idle: `rhythmMetrics={null}`, `interactive={false}`, `dimmed`) |
| Field / atmosphere | the shell's existing `PrototypeField` |
| Eligibility boundary | `livingFieldAtomGuards()` — **imported**, so Home and Living Field cannot drift |
| Practitioner guard | `PRACTITIONER_ATTRIBUTION_GUARD`, via that import |
| Credential resolution | `getMemberIdFromRequest` |
| Navigation escape | the shell's existing House view and `/maia` |

⛔ No arrival-state system was invented. P1 does not read or write
`lib/maia/arrivalState.ts`; it neither competes with nor duplicates it.

## 4. Eligibility predicate — exact

```sql
SELECT id, title, source_type, kept_at
  FROM member_memory_atoms
 WHERE member_id = $1
   AND kept_at IS NOT NULL
   AND status IN ('active', 'still_alive')
   AND return_preference IN ('contextual_doorway', 'ritual_review_opt_in')
   AND <livingFieldAtomGuards()>        -- personal scope · no practitioner
                                        -- authorship · attribution guard · not
                                        -- member-rejected · not sanctuary ·
                                        -- not sacred/protected/archived
 ORDER BY kept_at DESC, id DESC
 LIMIT $2                               -- 3
```

**Two Home-specific restrictions, and why Home is stricter than Living Field:**

- **`return_preference`** — Living Field is a place the member *navigates into*,
  and opening it is asking, so it does not filter this. Home Arrival surfaces
  material **unbidden** around the centre: the member arrived, they did not ask
  for these particular items. That is exactly the contextual doorway the consent
  vocabulary was written for, so `member_pulled` is honoured and excluded.
- **`status`** — narrowed to the canonical loader's allowlist. `set_aside` is
  "parked (lower weight)", a member gesture meaning *not now*; surfacing parked
  material unbidden would override it.

**`generated_by` is NOT filtered**, per the P1-D §I ruling.

**Ordering** is `kept_at DESC` — a member act, which is what gives chronology a
truthful meaning — with `id DESC` as a deterministic, non-semantic tie-break
already in the schema. ⛔ No relevance, similarity, score or frequency.

## 5. What a visible thread means

Exactly: **you chose to keep this.** Two things enforce that beyond copy:

1. **The renderer cannot see position.** `Thread` takes `{ thread, reduced }` —
   no `index`, no `total`. It is structurally incapable of weighting by rank.
2. **Identical treatment.** Same width, same distance below the centre, same
   styling, no fill and no border at rest. Left-to-right order is the chronology
   of the member's own Keep acts, which the provenance line states outright.

Titles are the member's own labels. ⛔ Nothing is summarized, titled, classified
or assigned a domain; no model is called anywhere on this path.

## 6. Provenance — told truthfully or not at all

`Kept September 16`, from the real `kept_at` (with the year when it is not the
current one, so a past-year Keep is not silently misdated).

A source line appears only for source types the repository actually establishes:
`idea` · `session_excerpt` · `spontaneous`. **`journal`, `dream` and `reflection`
are deliberately omitted** — the atoms migration marks each "source bridge stub
for now", so naming a Journal as the origin would assert a link the schema itself
says is not yet made. `idea_block` / `decision` / `change` are omitted as
block-scoped. An unmapped type shows no source line: a gap is left as a gap.

Disclosure is on hover, focus **and** tap, and the text is always in the
accessibility tree via `aria-describedby` — never visual-only, never spatial-only.

## 7. The beginning affordance — §XVI resolved as **outcome B**

**Finding: no prefill seam exists.** `composerDraft` in `OracleConversation.tsx`
is set only from *in-component* sources — the SoulPrompt picker (`:10927`), the
daily check-in (`:10973`) and element discovery (`:10989`). No URL parameter, no
event, no prop reaches it; `/maia` consumes no such search param. The journal
deep-link precedent opens a *sheet*, it does not carry text.

So P1 takes outcome B: the threshold enters the canonical MAIA surface and the
member begins there. ⛔ No second message-write path was built.

Consequence taken deliberately: the threshold is a **button**, not a text field.
Rendering a real input that then discarded what the member typed would be the
dishonest version of this state.

## 8. Evidence

### 8.1 Unit — 50/50 PASS

`eligibleKeeps.test.ts` (17) uses the repo's mock discipline: the db mock records
calls and returns rows **unfiltered**, so every eligibility claim passes only
because the predicate reached the wire.

`fieldNowArrival.test.ts` (33) mixes behavioural tests of the pure display module
with structural assertions in the manner of `RELATIONSHIPS-UX-01` (jest here is
node-env, `*.test.ts` only, with no React renderer).

⚠️ Those structural scans **strip comments first**. Five assertions initially
failed against files that *documented their own compliance* — the route's
"⛔ NO AFFINITIES" note matched a search for `living_field_affinities`. That is
the C21 lesson from the Circles verifier, applied rather than rediscovered.

### 8.2 Behavioural witness — PASS, and discriminating

`scripts/witness/p1-field-now-eligibility.sql`, on a disposable PostgreSQL 16
shadow built from the **real migrations** for the tables under test. One
transaction, ends in `ROLLBACK`.

```
--- eligible, bounded to three, newest Keep act first ---
 newest kept thing | middle kept thing | older kept thing

OK — bound of three, ordered by the member's own Keep act.
OK — practitioner, client scope, co-lab scope, rejected, member-pulled, parked,
     archived, sanctuary and another member's material are all excluded.
OK — identical Keep times resolve by a deterministic, non-semantic tie-break.
OK — another member's material is unreachable; zero is a valid, complete state.

--- without the scope/authorship guard (the leak) ---
 an observation about you · client-scoped material · material the member rejected
 · co-lab material · sanctuary material · (+ the 7 legitimate rows)

NEGATIVE CONTROL OK — removing the scope/authorship guard admits 5 prohibited
                      fixture(s). The witness is discriminating.
OK — 16 atoms and 2 members intact across every read.

verdict: P1-ELIGIBILITY PASS
```

### 8.3 Non-mutation

Measured as a **before/after delta**, not asserted as a magic number: a census is
taken before any read and compared after, expecting only the two fixtures the
tie-break block deliberately adds. Atom and member counts both hold. Unit tests
additionally assert the adapter emits no DML and reads exactly one table, and
that the route exports only `GET`.

⛔ Nothing in P1 creates or mutates atoms, affinities, Changes, return
preferences, relationship records or any synthesis.

### 8.4 Visual witness — `docs/programme/witness/p1/`

Desktop 1440×900 @2×. ⚠️ Captured in **Chromium**, not Safari — Chromium is what
this container provides; a Safari pass is owed before any wider exposure.

| Frame | State |
|---|---|
| `01-zero-keeps.png` | Zero eligible Keeps — **the real path**: no database in this container, so the adapter's failure branch produced a genuine empty field |
| `02-one-keep.png` | One |
| `03-three-keeps.png` | Three |
| `04-provenance-disclosure.png` | `Kept September 16 · You wrote this directly` on hover |
| `05-reduced-motion.png` | `prefers-reduced-motion: reduce` |
| `06-gate-closed.png` | Flag OFF — the membrane refusing, unchanged |

### 8.5 Gates

| Gate | Result |
|---|---|
| `npm run typecheck` | ✅ **229 vs baseline 239 · 0 regressions** |
| `npm run check:no-supabase` | ✅ clean |
| P1 suites | ✅ 50/50 |
| Regression (`lib/maia`, `lib/workbench`, `lib/psyche`, `lib/navigation`, `components/maia`, `app/relationships`) | ✅ 40 suites / 727 tests pass |

⚠️ **One pre-existing failure, not mine.** `lib/maia/canonical-turn/__tests__/writersStudioRoom.test.ts`
fails 3/51 on `PRODUCER_REGISTRY` membrane entries — the same 3 verified against
clean HEAD during LF-SCOPE-01. Reported, ⛔ not repaired.

⚠️ **Typecheck caution worth recording.** Running the dev server for the visual
witness generated `.next/types/**`, which pulled extra files into
`tsconfig.ship.json`'s program and surfaced diagnostics in unrelated files
(`app/wisdom-keepers/sacred-texts/page.tsx`). Clean HEAD showed *three* such
diagnostics and the working tree *one* — i.e. the signal was an artifact, not a
regression. `rm -rf .next` restored the true reading. **A typecheck run taken
while a dev server has been running is not trustworthy.**

## 9. Two corrections made during the build, both surfaced by the witness

**(a) The first layout was wrong, and the screenshot is what proved it.** Threads
were placed on an arc at equal radius. Real rendering showed them overlapping to
the point of illegibility, and Playwright reported that neighbouring threads
*intercepted one another's pointer events* — a genuine accessibility defect, not
a test artifact. Replaced with an even row: equal width, equal distance below the
centre, no overlap. The arc also varied nothing meaningful and risked reading
distance-to-centre as importance.

**(b) They still looked like dashboard cards.** §XIII rules those out explicitly.
Border and fill removed at rest; a faint wash now appears only under hover or
focus, so the affordance stays discoverable without the field becoming a row of
tiles.

## 10. Known limitations and one founder question

⚠️ **The centre carries elemental colour, and §VI says it should not.** The
existing centre primitive *is* the holoflower, whose petals are elementally
coloured by design. P1 renders it `dimmed`, which softens it considerably (see
the frames). But if §VI's "no element colours" is meant to exclude the holoflower
itself, then the centre needs a different primitive and that is a **founder
call** — not something to decide silently inside a build authorization that also
said to reuse the existing centre-field primitive.

Other limitations, stated plainly:
- Chromium, not Safari (§8.4).
- Desktop only, as instructed; no mobile adaptation attempted.
- The visual witness used intercepted fixtures for the 1- and 3-thread frames.
  Only the zero state exercised the live route end-to-end, because this container
  has no database.
- The shadow carried the real migrations for the tables under test, not the full
  production schema; `studio_teams`, `studio_people` and `encounters` were minimal
  FK stubs.
- ⛔ No production read was performed.

## 11. Explicit confirmations

| Not changed | Confirmation |
|---|---|
| `living_field_affinities` | Not read, not joined, not ranked by, not displayed, not repaired. Asserted in tests for both the route and the surface. |
| Relationships | No file under `app/relationships/**` or `components/relationships/**` touched. No Fire, no elemental invitations. |
| Voice | No VoiceKernel, STT, TTS, TurnCoordinator, mic or audio lifecycle. Asserted in tests. |
| Schema | No migration. No DDL anywhere. |
| Production Home | `app/maia/page.tsx`, `MaiaShell`, `MaiaCenterField`, `OracleConversation` all untouched. |
| `indexAtom.ts` write path | Untouched — the recorded scope-blind writer stays a separate governed question. |
| The House | No destination moved; no candidate IA exposed. |
| Flag | Still default-OFF. Not enabled anywhere. |

## 12. Standing

**P1.1–P1.5 ✅ IMPLEMENTED · UNIT 50/50 · BEHAVIOURAL WITNESS PASS WITH A
DISCRIMINATING NEGATIVE CONTROL · VISUAL WITNESS CAPTURED · ⛔ P2 NOT BEGUN ·
⛔ NO SCHEMA · ⛔ NO WRITES · ⛔ NO AFFINITIES · ⛔ NO VOICE · ⛔ NOT DEPLOYED ·
⛔ FLAG NOT ENABLED · PRODUCTION UNTOUCHED.**

Returned for founder experiential adjudication. The question this was built to
answer is not whether the tests are green:

> Can someone enter Soullab, encounter a quiet centre, recognize a few things
> they themselves deliberately retained, and know where to begin — without MAIA
> interpreting their life for them?
