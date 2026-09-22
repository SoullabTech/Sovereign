# `OBSERVATION-ADDRESS-01 / A1` — RESOLVER EVIDENCE PACKET

**Base** `fix/ws-observation-identity-i1a-20260921` @ `7a91d6992c2a03ae3095baf445e6d36195f04637`
**Branch** `claude/ws-observation-address-a1`
⛔ No standing writes · ⛔ no UI · ⛔ no legacy backfill · ⛔ no deploy · ⛔ no migration.

---

## 1 · What was built

`lib/manuscript/developmentalReading/observationAddress.ts` — read-only.

```
observationId → member-owned frozen reading → exact canonical observation → STORED observationKey
```

- `resolveObservationAddress(id, memberId)` → `resolved | unknown | ambiguous`
- `readingIdentityState(readingId, memberId)` → `canonical | legacy | mixed | not_found`

⭐ **Member scope sits in the predicate, not a post-filter** — a foreign reading never produces a
row to choose from, so there is nothing to return by accident.

⭐ **`unknown` deliberately does not split into "wrong owner" vs "does not exist."** Telling a
caller that an identity exists under a different member would disclose another member's reading.
*A refusal is not an occasion to disclose.*

---

## 2 · ⭐ Real PostgreSQL witness — GREEN

**PostgreSQL 16.13**, disposable, carrying the **actual** canonical schema and the **actual I1A
validator applied verbatim from the migration** — ⛔ not a model of the durable shape, the shape
itself. `npm run witness:ws-observation-address` → **exit 0**.

**Resolver 16/16 PASS**, including: canonical match · `position: null` (structural-only) resolves ·
**mixed population reads the stored key** · unknown → `unknown` · **duplicate → `ambiguous`, refused
not arbitrated** · wrong-owner → `unknown` · true owner still resolves · legacy identity never
manufactured · all four population states · **0 rows written, 0 standing events**.

⭐ The witness was **not** written against a convenient fixture: it hit two real constraints on the
way in (`developmental_readings_outcome_observations`, INV-0) and the fixture was corrected to
satisfy them rather than the schema loosened.

### Seven defeat candidates — ALL KILLED

| Candidate | Named kill |
|---|---|
| **AD1** derives the key from `admissionIndex` | `A3-computes-no-derived-address` |
| **AD2** no member scope | `A1-wrong-owner-not-resolved` |
| **AD3** first match wins on duplicate | `A1-duplicate-refused` |
| **AD4** legacy-ordinal fallback | `A1-legacy-not-manufactured` |
| **AD5** basis fingerprint as identity | `A1-basis-is-not-identity` |
| **AD6** legacy treated as canonical | `A1-unknown-identity` |
| **AD7** writes standing while resolving | `A3-standing-untouched` |

---

## 3 · ⭐⭐ THE FINDING — "never derive" is not behaviourally testable, and that is the point

AD1 **survived every behavioural probe**, and it was right to.

The I1A validator enforces **both** `admissionIndex = i - 1` **and** `key = 'o' || i`. ⭐ So on
**every state the database permits**, deriving the key and reading it return **the same string**.
⛔ No behavioural check can separate them, because no lawful row exists on which they differ.

> ⭐ **The prohibition is therefore not about output. It is about what the code DEPENDS ON.**
> A derived resolver silently couples itself to a validator invariant, and the day that invariant is
> relaxed it becomes wrong **with no test failing.**

So the guard is **static**, and binds the implementation under test — its own source, sliced from
the real file, ⛔ never a declared flag a candidate could set.

⚠️ **One repair on the way there, recorded because it is the same class of error:** the first static
guard asserted *reads the stored key* **and** *computes no address* in one check, and fired as
collateral on four candidates that do not derive at all — their sliced source simply lacks the
shared SELECT. ⭐ **A guard that kills for the wrong reason is not lethal, it is noisy.** Split in two:
the prohibition binds any source; the positive law binds only the whole module.

⚠️ **And one harness defect, found by the discipline working:** the first run reported four
"survivors." The runner re-seeded before each candidate but ran the battery against the **stale**
seed, so candidates failed on mismatched reading ids instead of dying on their named check.
⭐ **The suite was repaired, never the candidates.**

---

## 4 · ⚠️ What the database does NOT guarantee

The I1A validator refuses a **partial** identity group (0 or 4, never 1–3) — but enforces
⛔ **no uniqueness on `observationId`**, within a reading or across them.

> ⭐ **A duplicate identity is REPRESENTABLE in the durable record.**

The resolver therefore **detects** it and returns `ambiguous`; ⛔ it never picks a winner, because
arbitrating would invent an answer the data does not contain. AD3 is exactly that candidate, and it
dies.

⛔ Whether uniqueness *should* be enforced at the database is a founder question. ⛔ Not taken here —
A1 is read-only, and the resolver is correct either way.

---

## 5 · Gates

| Gate | Result |
|---|---|
| A1 witness (real PostgreSQL) | ⭐ **exit 0** — resolver 16/16, all seven candidates die |
| Strict typecheck (`noUncheckedIndexedAccess`, TS 5.6.3) | ⭐ **0 diagnostics in A1-owned files** |
| F1 double matrix | exit 0 (unchanged) |
| I1 live matrix | exit 0 (unchanged) |
| `check:no-supabase` | exit 0 |
| Migrations touched | **0** |

---

## 6 · Scope confirmations

⛔ No standing write · ⛔ no UI · ⛔ no legacy backfill (production's 245 legacy observations are
untouched and remain lawfully legacy) · ⛔ no deploy · ⛔ no migration · ⛔ no identity derived ·
⛔ no identity manufactured · ⛔ `app/**` unchanged.

---

## Standing

⭐ **A1 COMPLETE — STOPPED FOR ADJUDICATION.**

The identity→address law is established and proved against the real durable shape **before any
member action depends on it** — which was the point of taking this window while standing is empty.

⛔ Steps 2–4 not started. ⛔ Standing-write integration is a later act, if it is needed at all.
⛔ Production untouched.
