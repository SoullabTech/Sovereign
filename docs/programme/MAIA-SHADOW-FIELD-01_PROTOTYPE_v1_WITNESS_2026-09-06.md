# MAIA-SHADOW-FIELD-01 · PROTOTYPE v1 — build witness · **P4 STOPPED**

```text
LANE        MAIA-SHADOW-FIELD-01 · SHADOW-01 / PROTOTYPE
AUTHORIZED  founder 2026-09-06 — hard stop crossed, bounded to the Dedicated room
SCOPE v1    Dedicated Shadow Field room only
STATE       P0 · P1 · P2 · P3 · P5 · P6 · P7  BUILT / GREEN
            P4 (memory)                        **STOPPED — founder ruling required**
            P8 (founder walk)                  NOT STARTED — awaits P4 resolution + the room surface
RUNTIME     UNCHANGED · not merged · not deployed · ordinary path untouched
REGISTRY    UNTOUCHED (CMT-01 untouched, per the founder registry ruling)
GUARDIAN    UNTOUCHED
```

## 1 · P4 STOP — the keep act cannot be built as specified

The authorization required the keep act to write, with no migration:

```text
source_type: spontaneous
provenance: { origin: shadow-field, authoredBy: member, participationClass: placed }
```

and ruled: *"If the existing memory substrate cannot preserve those provenance/authority
facts through retrieval, P4 stops. Do not solve that by silently changing schema, adding a
source type, or introducing a derived memory class."*

**It cannot preserve them. P4 stops.** Three findings, each read at source:

**F-P4-1 · `provenance` is not selected at retrieval.** The loader that surfaces atoms into
MAIA is `lib/maia/memoryAtomsLoader.ts`. Its `SELECT_COLUMNS` (:157-172) is:
`id, title, body, primary_register, registers, elemental_lenses, status, kept_at,
return_preference, source_type, is_breakthrough, marked_breakthrough_at,
epistemological_status, facilitator_id`. **`provenance` is absent.** A Field origin written
there is never read back. The second retrieval path, `lib/workbench/sources/keep.ts:110,129`,
selects an even narrower set and also omits it.

**F-P4-2 · The column's declared semantics contradict the intended use.** Migration
`20260624000002` comments `provenance` as *"Structured attribution for **non-member-authored**
atoms"* with a practitioner-shaped payload (`session_id`, `practitioner_id`, `candidate_id`,
`candidate_index`, `written_at`). The loader's own canon note (:175-185) is explicit:
*"the `provenance` jsonb is **audit history, never runtime identity**."* Writing
`authoredBy: member` into a column reserved for non-member-authored audit history would make
the record say the opposite of what is true — the precise failure C1 exists to prevent.

**F-P4-3 · The fix is outside the v1 bound.** Adding `provenance` to `SELECT_COLUMNS` would
change the **ordinary-path** atoms loader, which this authorization lists as untouched, and
would surface a new field into `/list` prompt assembly. It is not available to v1.

**What the substrate *does* preserve truthfully.** `source_type = 'spontaneous'` survives
retrieval, and its declared meaning is exactly *"member typed directly into Keep (body
required)"* — which carries **authoredBy: member** and **participationClass: placed**. Two of
the three required facts are already preserved, by a column the loader reads. The third,
**`origin: shadow-field`**, is the one with no truthful carrier.

**Founder question (P4 only; nothing else is blocked).** Three coherent resolutions, none
taken:
1. **Drop `origin` from v1.** Keep as a plain member-authored `spontaneous` atom, provenance
   column untouched. Truthful and zero-migration, but a kept item is then indistinguishable
   from any other Keep entry — the Field leaves no trace of where it came from, which may be
   exactly right for shadow material, and may equally be a loss the member should choose.
2. **Author the carrier properly.** A schema act with its own authorization: either a
   `field_origin` column the loader reads, or a documented widening of `provenance` to carry
   member-authored origin, with the loader and the column comment corrected together.
3. **Defer the keep act entirely.** v1 ships session-bound only, which is the constitution's
   default posture anyway (L3).

Until this is ruled, **v1 has no writer at all** — which is the state now built, and is
constitutionally safe: nothing from a Shadow Field turn persists by any route.

## 2 · What was built (P0–P3, P5)

| File | What it is |
|---|---|
| `lib/maia/shadowField/types.ts` | Registers, the system-authored register ceiling, movements, doors, the typed member activation act on the CMT-01 axes. Deliberately contains **no** type for a stored reading, score, dominant element, or cross-turn psychological state — the absence is the enforcement. |
| `lib/maia/shadowField/prompts.ts` | The Field's prompt law: L1–L8 as turn law, the six-register ceiling, and per-movement law for Encounter · Stay · Differentiate · Reclaim · Choose · Return. Encounter and Stay admit **no** system-authored possibility at all. Carries the negative-form invariant header in the Relational Navigation idiom. |
| `app/api/maia/shadow-field/route.ts` | The room's separate interpretive assembly. Activation-gated, sanctuary-threaded, exit short-circuits before any model call, and it performs **no persistence of any kind**. |

**Assembly sovereignty is an import-graph fact, not a runtime discipline.** The route's entire
import list is `next/server`, `@anthropic-ai/sdk`, `lib/auth/serverSessions`,
`lib/auth/tester`, and the Field's own prompts and types. Because the ordinary path never
assembles a Field turn, no ordinary-path producer *can* participate in one. Safety, identity
and transport are retained, per the D6 amendment.

## 3 · P6 · P7 — falsifiers against the built assembly

```
npx tsx tests/constitutional/refusal-registry/shadow-01-gates.ts
  R32  GREEN   assembly sovereignty + no writer in v1   (Part III, F5, F8)
  R33  GREEN   entry is an act, not a match; exit silent (L1, L6, F1, F2, F14)
  R34  GREEN   prompt law prohibitions                   (L2, L5, F4, F11, F13, F15, F16)
  17 passed · 0 failed · 0 warned
```

**F12 rerun against the actual import graph and turn assembly (P7).** The compliant
Guardian from FALSIFY §2 cannot exist inside this room, and now fails for reasons a rewording
cannot reach: its trigger is a reading of member content, which R33 shows has no path to
activation here (the activation predicate never inspects `message`; no lexical or regex gate
exists in the room); and its frame arrives through an ordinary-path producer, which R32 shows
cannot be imported. The room passes F12 structurally, not by wording.

**One check was wrong before it was right.** R32 initially went RED on its own third
assertion because the route's documentation *names* `getMaiaResponse` in the sentence
explaining that it never calls it. The check was hardened to strip comments before testing
(the `code()` idiom refusal-31 already uses). Recorded because a check that reads prose as
code would have failed silently in the other direction later.

**Not exercised in v1 — never reported as PASS.** F3 (offer contract; the Invoked entrance
does not exist), F9 (silent supersession; no Field memory can return until a keep act
exists), F10 (practitioner path; absent). The gate runner prints these explicitly as
structurally absent.

## 4 · Gates

- **SHADOW-01 falsifiers:** 17 passed · 0 failed · 0 warned.
- **`npm run typecheck` (no-regression gate): RED, and not from this change.** The gate's
  complete list of new diagnostics is two entries, both at `tsconfig.ship.json:3` — TS5101
  (`downlevelIteration` deprecated) and TS5107 (`moduleResolution=node10` deprecated) under a
  newer TypeScript than the baseline was recorded against. No Shadow Field path appears in
  the diagnostic list. The same run reports 239 errors fixed since the baseline and 268 new
  files entering the program, i.e. the baseline and this container's toolchain have diverged
  broadly. **The baseline was NOT re-recorded** — absorbing this is explicitly forbidden and
  is not this lane's act. It should be resolved by whoever owns the toolchain bump.

## 5 · What remains before P8

1. **The founder's P4 ruling** (§1). The keep act and the Sanctuary persistence-boundary
   refusal cannot be built or walked until it lands.
2. **The room surface.** The walkable Dedicated room UI (arrival, doors, movements, Leave)
   and re-pointing the existing Journal "Shadow Work" door to it. The seven-walk instrument
   needs a room to walk.
3. Then P8, the founder walk, including the F16 adversarial specimen.

A green P8 proves a prototype. It does not authorize WITNESS and does not make the Shadow
Field Live.
