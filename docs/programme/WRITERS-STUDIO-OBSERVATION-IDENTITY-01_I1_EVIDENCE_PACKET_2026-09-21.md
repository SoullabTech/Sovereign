# `OBSERVATION-IDENTITY-01 / I1` — EVIDENCE PACKET

**Status** ⭐ **I1 COMPLETE — STOPPED FOR ADJUDICATION** · ⛔ no merge · ⛔ no deploy · ⛔ no step 2–8

## 1 · Branch and base

`claude/magical-maxwell-debsmm` · base `a8a686cdb78aa83c0b25acc9c47c11f8bba7a5b3`

## 2 · Files changed

| File | Change |
|---|---|
| `lib/manuscript/developmentalReading/observationIdentity.ts` | ⭐ NEW — minter, basis fingerprint, position, total order |
| `lib/manuscript/developmentalReading/contract.ts` | 4 fields on `DevelopmentalObservation`; contract version → `-03` |
| `lib/manuscript/developmentalReading/freeze.ts` | identity minted at the seam; injectable minter |
| `…/__tests__/assess.test.ts` · `…/__tests__/freeze.test.ts` | fixtures updated for the new fields |
| `tests/constitutional/writers-studio/liveMatrix.ts` · `liveRunner.ts` | ⭐ NEW — the live matrix |
| `tsconfig.ws-observation-identity.json` · `package.json` | strict config + `matrix:ws-observation-identity-live` |

⛔ No `app/**`. ⛔ No `database/**`. ⛔ No migration.

## 3 · ⭐⭐ Where the single admission seam lives — AND IT ALREADY EXISTED

**`freezeReading()` · `lib/manuscript/developmentalReading/freeze.ts`**, one caller (`commission.ts:85`).

⭐ **The census changed I1's shape.** §1 asks for exactly one live mechanism turning a reader claim
into a canonical observation and forbids a second. ⭐ **That mechanism was already built** — an
observation model exists (`DevelopmentalObservation`, addressed `(readingId, observationKey)` under
INV-2) and `freezeReading` is the only place a `ReaderClaimDraft` becomes one.

> ⛔ **So I1 did NOT introduce an admission point. A new one would BE the second path the ruling
> forbids.** It adds identity, basis and position **at the seam that already admits.**

## 4 · How `observation_id` is minted

`mintObservationId()` → `dobs_${randomUUID()}`. Opaque · minted at admission · ⛔ not derived from
claim text, facet text, or the basis fingerprint.

⚠️ **Deliberately NOT derived from `(readingId, position)`** — that would encode admission order
into the identity, and §3 asks for opacity.

The seam takes an optional `mintId` **only** so a test can mint deterministically and prove every
identity came from this seam. ⛔ A caller supplies the *function*, never the identities.

## 5 · How the basis fingerprint is computed

SHA-256 over canonicalised `{ lens, revisionDigest, sorted refs, sorted doesNotEstablish }`.
⛔ **`observation` text is absent by construction** — the basis is what the noticing rests on, never
what it says. ⭐ Two observations may lawfully share one; that is the §III falsifier, and the live
fixture exercises it.

## 6 · How manuscript position is resolved

Earliest across cited refs by `(sectionPosition, codePointStart ?? 0)`, with `sectionPosition`
read from `readState.sectionTopology`. `section` → `(pos, 0)` · `passage` → `(pos, range.start)` ·
`section-run` → earliest member.

> ⚠️⚠️ **NOT EVERY OBSERVATION HAS A POSITION, and the ruling's formula is silent on it.**
> Three of six ref kinds — `structure-unit`, `structure-units`, `structure-topology` — name authored
> divisions and carry **no section at all**. ⭐ Position is therefore **nullable**, and a null sorts
> **after** every positioned observation, holding admission order among themselves. ⛔ A position is
> never invented, and a section absent from the topology contributes none rather than being coerced
> to 0 (which would place it first in the Work).

⛔ **Admission stores in ADMISSION order, not sorted order** — `key` (`o1`…) encodes the claim index
and BUILD-07F standing addresses observations by that key, so sorting at the seam would silently
re-address every member's recorded standing. **Ordering is a read-time concern.**

## 7 · D1–D7 against the live implementation

`npm run matrix:ws-observation-identity-live` → **exit 0**

```
LIVE REFERENCE (real freezeReading)          20/20 PASS
D1_TEXT_IDENTITY         KILLED on L1-identity-not-text-derived
D2_EVIDENCE_IDENTITY     KILLED on L1-required-falsifier        (classified collateral)
D3_PER_FACET_REREAD      KILLED on L3-no-reading-on-render
D4_GUIDED_EXPANSION      KILLED on L3-set-equals-admitted       (classified collateral)
D5_HIDDEN_REACHABILITY   KILLED on L3-set-invariant             (classified collateral)
D6_TIE_RANKING           KILLED on L4-manuscript-order
D7_COMPASS_IN_PROMPT     KILLED on L5-kills-D7
```

§6 live Compass separation, all PASS: the live prompt carries no declaration · the request carries
**exactly** `commissionedLens, evidence, recovered` · `read.ts` sends `renderRequest(request)` as
the **whole** user message · a guard watching only `evidence` would pass D7, this one does not.

⭐ The F1 double matrix (`matrix:ws-observation-identity`) **remains lethal**, exit 0.

## 8 · ⭐ The sibling-admission falsifier

`SIBLING_ADMISSION_PATH` — a plausible second route that builds structurally valid canonical
observations **without passing through `freezeReading`**: own identity, same basis, same position.
**KILLED on `L0-single-admission-seam`.**

Backed by a **static guard**, because runtime detection alone would not establish that no second
route *can* exist:

- `L6-one-consumer-of-the-minter` — exactly one module besides its own names `mintObservationId`, and it is `freeze.ts`
- `L6-minter-resolved-once-at-the-seam` — the default is resolved once
- `L6-minted-exactly-once-per-admission` — one invocation site, inside the claims loop

⚠️ **The first version of this guard was wrong and passed vacuously.** It searched for
`mintObservationId(` — but the seam resolves the minter as `input.mintId ?? mintObservationId` and
invokes `mint()`, so it found **0 call sites and reported success**. ⭐ It now tests **references**,
not call syntax. *A guard that cannot see the implementation it guards is worse than no guard.*

## 9 · Strict typecheck

`tsc -p tsconfig.ws-observation-identity.json` (strict + `noUncheckedIndexedAccess`, TypeScript
**5.6.3**, matching the project) → ⭐ **0 diagnostics in I1-owned files.**

⚠️ 18 diagnostics remain in **transitively imported neighbours** — `readState.ts`, `parse.ts`,
`draftSections.ts` — which are not written to `noUncheckedIndexedAccess`. ⛔ Pre-existing, unchanged,
and ⛔ **the flag was not weakened to manufacture a pass** (the S3 disposition, applied).

## 10 · Neighbouring suites

Baseline established by stashing the change and re-running the identical check. ⭐ **Zero
attributable regressions.**

- ⭐ Fixed: `assess.test.ts` constructed an observation literal missing the four new fields.
- ⭐ Fixed: `freeze.test.ts`'s key-set assertion. **The law it guards is unchanged** — no
  interpretation, questions, possibilities, uncertainty, severity, priority, score, confidence or
  rank. None of the four new fields is any of those. *The list grew; the prohibition did not move.*
- ⚠️ Pre-existing at HEAD, **not mine**, verified by the stashed baseline: `freeze.test.ts` refused-
  variant missing `cause`; `store.ts:139` implicit `any`.
- ⚠️ Environment-only (no `node_modules` here): `pg`, `@anthropic-ai/sdk`, `@capacitor/core`, jest globals.

## 11 · Confirmations

⛔ **No DB migration** — `observations` is `jsonb`, so the new fields need none.
⛔ **No facet UI** · ⛔ **no facet-specific prose generation in `lib/**`** (the renderer is a test
double, §7) · ⛔ **no Editorial Reading** · ⛔ **no pass synthesis** · ⛔ **no ranking** ·
⛔ **no deployment** · ⛔ **no `app/**` change** · `check:no-supabase` exit 0.

---

## ⚠️⚠️ RAISED FOR ADJUDICATION — ⛔ NOT DECIDED HERE

**There are now two addresses for one observation, and the member's own acts hang off the older one.**

- `(reading_id, observation_key)` — BUILD-07F `developmental_observation_standing` records a
  member's stance by `(member_id, reading_id, observation_key, event_index)`.
- `observationId` — the canonical identity facets will key on.

⭐ They are 1:1 within a reading and the seam guarantees it, so **nothing can drift today.** ⚠️ But
which is the durable member-facing address is a founder question, and answering it by migration is
⛔ not authorized by this act. ⭐ Naming it now is cheaper than discovering it when a facet and a
standing disagree about which observation the member took a position on.

⛔ **v1/v2 readings are NEVER backfilled.** A historical row's missing identity **is** the evidence
that it was admitted under a contract that had none; minting one now would fabricate an admission
event that never happened.

## Closure condition

> Every live observation enters through one admission seam, mints identity there, preserves basis
> separately, and survives every recorded defeat candidate.

⭐ **Met.** ⛔ Stopped for adjudication.
