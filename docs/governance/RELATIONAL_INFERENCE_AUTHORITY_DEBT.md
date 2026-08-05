# Governance debt — inference authority and interpretation status

**Date:** 2026-08-03 · **Status:** ⛔ RECORDED, NOT RULED. Nothing here authorizes a change.

Two findings surfaced while unblocking the typecheck gate for the practice-field corpus lane. Neither belongs to that lane; both are recorded here so the deploy does not absorb them.

---

## D1 — Interpretation status has no runtime transport

[PRACTITIONER_FIELD_AUTHORITY_SCHEMA](PRACTITIONER_FIELD_AUTHORITY_SCHEMA.md) §1.1 gives provenance a `state` axis — `unknown` / `asserted` / `validated` — so a candidate translation can be carried as a candidate. **The runtime has no field to carry it.**

Live example, in production now. `practice_fields.about_practice` for `now-what-demo` asserts flatly:

> *"cultivated across five practice domains: attention, relationships, meaning, contribution, and presence"*

This is `interpretation` + `asserted` — a Soullab translation Larry has never confirmed, carrying the measured five/six domain error. Nothing in the column, the composition path, or the rendered context marks it as candidate. To a member it reads as a description of the practice; to Larry it would read as our claim about his work.

**The shape of the gap:**

```
today     interpretation vocabulary → member-facing assertion
needed    source → interpretation → status → surface
                                    ├ asserted
                                    ├ candidate
                                    ├ observed
                                    ├ practitioner-declared
                                    └ member-confirmed
```

⚠️ Note the asymmetry this creates: *"preserve the five-domain language as an unverified translation"* is **not a state the system can currently be in.** Leaving it alone preserves the text, not its status. Until transport exists, the only honest options are to leave it unlabeled (current) or remove it — not to mark it.

⛔ Do **not** resolve by rewriting the domain language toward what we believe Larry would say. That compounds the original error. It is resolved from his own language, in the sitting.

---

## D2 — The detector infers `person`, an entry-flow label

`RelationshipTone` and `CounterpartLabel` each mix two epistemic sources, now separated in `lib/relationships/types.ts`:

| | Arrives by | Type |
|---|---|---|
| Phase 2 | system inference from language | `DetectableTone` · `DetectableCounterpartLabel` |
| Phase 4 | member selection in the entry flow | `DeclaredTone` · `DeclaredCounterpartLabel` |

The separation is now enforced by the compiler: the detector's lexicons are typed against the `Detectable*` halves, so adding a Phase 4 tone to `TONE_LANGUAGE` no longer typechecks. **This asserts an authority boundary, not a limit on what is knowable** — a future ruling may create a different detector, a practitioner interpretation layer, or a member-confirmed inference pathway. The narrow type does not prevent expansion; it prevents *accidental* expansion.

**The exception found while typing it.** `person` — a Phase 4 entry-flow label — is classified `Detectable` because the shipped detector already infers it. "Patch B" in `detectRelationalSignal.ts` assigns it when a named entity plus interaction is present and no canonical label matched:

```ts
if (namedEntityDetected) { counterpartLabel = 'person'; }
```

Its registry entry is `person: []` — no keywords, since nothing derives it lexically.

The type **records** this, it does not endorse it. Arguments both ways, unresolved:

- **Benign** — `person` is the weakest possible reading ("someone is present"). It carries no claim about who they are or what the relationship is, and it exists so a signal isn't structurally empty.
- **Not benign** — it is still a member-selection category produced by inference, and the labtool offers `person` alongside `self` and `unnamed_field`. A member choosing `person` and the system assigning `person` become indistinguishable downstream.

🔴 **Open question for ruling:** may the detector assign a neutral entry-flow label as a fallback, and if so, must the record distinguish an assigned `person` from a chosen one? Relevant: `SignalSource` (`maia_conversation` vs `labtool_manual`) may already carry that distinction — verify before designing anything new.

---

## What was changed under this finding

Type-level only; **no runtime behavior changed**. `person: []` never matches (`[].some()` is always false), exactly as `unspecified: []` never did.

- `lib/relationships/types.ts` — `DetectableTone` / `DeclaredTone`, `DetectableCounterpartLabel` / `DeclaredCounterpartLabel`; the public unions are unchanged in membership.
- `lib/relationships/detectRelationalSignal.ts` — lexicons typed against the `Detectable*` halves.

⚠️ **Untested here.** The `detectRelationalSignal` suite (42 tests) exists only in another worktree, not on this branch. Typecheck is green and the change is type-level, but that suite has not been run against it.
