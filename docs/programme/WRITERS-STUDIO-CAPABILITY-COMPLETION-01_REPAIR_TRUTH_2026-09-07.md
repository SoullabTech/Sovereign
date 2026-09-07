# WRITER'S STUDIO — CAPABILITY COMPLETION · 01
## ACT 3 — REPAIR TRUTH · D1 · D2 · D3 · D4

**Authority** Founder Rulings III — repair of the four defect classes authorized
**Custody** branch `claude/writers-studio-capability-clxw8d`
**Scope** declaration only. **No capability was built, retired or redefined.**

> **The covenant was not architected away. The Studio lost truth about what had
> already been built.**
>
> Implementation may lag ratified intent.
> Declaration may not lag known implementation.

---

## D1 · DECLARATION TRUTH

`StudioAvailability` carried two questions in one field — *is it built* and *can
you navigate to it* — and that conflation is what made the Studio lie about
itself. Materials, Structure and Versions are opened by a member every day, but
they are **panels, not routes**, so the only thing the old two-state field could
say about them was `later`. The rail then drew a working capability as
unavailable, and the room had to contradict the map to make it usable again.

```text
available   built, reached by NAVIGATION   — carries an href
in-room     built, reached as a PANEL      — carries no href, by construction
later       ratified intent, not built     — carries nothing
```

**Corrected to `in-room`:** Materials · Structure · Versions · Conversations ·
**Statistics**.

Statistics was the sharpest defect in the Studio: the rail drew it unavailable
while the lower band **of the same screen** displayed the word, section and
version counts — exactly the figures `FIELD-MAP §7` permits. It is now hosted in
the room that renders it, and selecting it opens that band.

**Insights** stays `later` and gains `servedBy: { mode: 'develop' }`. Its
ratified function *is* implemented — as Develop, with frozen readings, evidence
and member standing — so the map **records that relationship rather than
building a second MAIA authority beside a constituted one.**

`visibleDestinations` (Studio Home) is unchanged in behaviour: route-reachable
only, so Home still offers doors and still shows nothing unbuilt.

---

## D2 · FR-C RESTORED

The ruling never changed. The implementation was lost on another branch and the
render regressed to a dimmed `<span aria-disabled>` at 55% opacity **with the
state expressed nowhere but the opacity** — which a screen reader cannot read, a
low-vision member cannot distinguish from quiet ink, and nobody can act on.

> **Dimness is a mood, not a statement.**

Each unavailable row now says its state, and the three states are three
different sentences — collapsing them would be its own dishonesty:

```text
not built yet         the capability does not exist
needs a manuscript    it exists and is waiting for a Work on the table
in Develop            the member already has it, under another name
```

Enforced, not merely rendered: `assertShellPromisesNothing` now **refuses a
shell that leaves an unavailable destination silent**, so no future rail can
drop the state line and still pass.

---

## D3 · ONE CAPABILITY AUTHORITY, MANY PLACEMENTS

The defect was never "three arrays exist". It was that **three places could
independently make contradictory claims about product reality.**

```text
PLACEMENT          may have multiple projections
CAPABILITY TRUTH   has one authority — studioMap.ts
```

- `satisfiedInRoom` is now a **hosting** claim, not an **existence** claim. A
  room may say where an `in-room` capability is open; it may not say that a
  capability exists. `assertRoomClaimsNothingUnbuilt` refuses the second reading
  at the seam, and the projection refuses it again — before this repair, a room
  could promote *any* id at all.
- `StudioLowerBand.STRUCTURE_SURFACES` **no longer declares availability.** It
  keeps what it legitimately owns — that these four surfaces are banded
  together, and in what order — and reads capability from `capabilityOf()`.
- **No fourth registry was invented.** An existing model took the authority.

### ⚠️ A correction inside this repair, recorded rather than quietly fixed

The first implementation **added Threads to `STUDIO_MAP` as a seventeenth
destination.** Four ratified tests failed immediately, and they were right:
**D-019 settles the rail grammar at exactly sixteen — 7 work · 4 MAIA · 5
tools** — and that ruling is not this lane's to amend.

> **The repair would have fixed one ratified ruling by breaking another.**
> The tests caught what the reasoning did not.

Threads is genuinely awkward: **ratified** (`FIELD-MAP §3` names it twice, §4
calls it a Structure concept; Rulings III: RATIFIED STRUCTURE CONCEPT) and
**unplaced** (D-019 has no room for it). So capability truth moved to a
`RATIFIED_UNPLACED` register in the same file, and **placement stays unanswered
because unanswered is the truth.** Nothing in that register can reach a member;
when Threads is placed it moves into the map by a founder act.

Before this, the only trace of Threads anywhere was a boolean in a lower band —
which is how a band became the sole authority on a ratified capability, and how
the census came to read it as an orphan and propose deleting it.

---

## D4 · THE DEAD END

`unitedWork` is null in two completely different situations, and `WorkDrawer`
treated them as one:

```text
NONE      no Work declares this manuscript   → "which one is this a form of?"  ✅ right question
SEVERAL   the member declared it in two      → the same question, already answered twice
```

D-018 says a manuscript belonging to several Works is **correct by design**. But
the withdraw gesture — *"no longer a form of this work"* — lives in the
united-work view, which that member can no longer reach. So the room offered
**declaring into a third Work as the only way out of having declared into two**,
while Conversations stayed shut because MAIA will not choose between Works.

> **A reversible member act must not hide the gesture required to reverse it.**

The ambiguous state now lists the declaring Works and hands back the existing
`undeclare` gesture. Nothing chooses for the member; nothing is withdrawn on
their behalf; the multi-Work state is named as allowed, not as an error.

---

## GATES

```text
app/writers-studio suite      20 suites · 330 tests · 330 passed · 0 failed
new falsifiers                app/writers-studio/__tests__/declarationTruth.test.ts
npm run typecheck             ✅ No TypeScript regressions (229 vs baseline 239; 10 fixed, 0 new)
npm run check:no-supabase     ✅ clean
```

⚠️ **A note on how these gates were obtained.** This container had **no
`node_modules` at all**. Earlier `tsc` invocations in this session exited on
`tsconfig.ship.json` deprecation diagnostics without ever type-checking, so the
"clean" reads they produced were worthless. Dependencies were installed and every
gate above was then run for real. **Recorded because a gate believed on bad
evidence is worse than no gate.**

---

## STANDING

```text
D1 · D2 · D3 · D4     REPAIRED, tested
STEP 5 (coverage)     NOT OPENED — large-Work perception is R&D (FR-06)
STEP 6                NOT MADE — which ratified capability moves next is the
                      founder's product-priority decision, not an
                      implementation inference
BUILD (capability)    NOT AUTHORIZED
DEPLOY                NOT AUTHORIZED

The 60,000 code-point ceiling is UNTOUCHED.
No capability was built, retired or redefined.
```
