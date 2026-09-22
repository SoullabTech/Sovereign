# `OBSERVATION-ADDRESS-01 / C1` — READ-ONLY CUSTODY CENSUS

**Branch** `claude/magical-maxwell-debsmm` · **SHA** `624983fb` · ⛔ no code written for this census
⛔ **No production data mutated · no schema added · no standing migrated · no bridge implemented.**

---

## 0 · ⚠️ ENVIRONMENT — HALF THIS CENSUS CANNOT BE RUN FROM HERE

`ssh` **ABSENT** · `DATABASE_URL` **UNSET** · `minisforum` **NOT RESOLVABLE**.

⭐ **A statement about the environment, ⛔ not a deferral and ⛔ not a partial result.** No production
read has been performed under this lane. Questions **3 · 4 · 5 · 8 · 9** and the row/age/orphan/
duplicate counts are **OWED TO A HOST WITH PRODUCTION ACCESS** and appear below as ⛔ UNREAD.

⭐ Everything schema-derived is **fully established**, and — as it turns out — **the decisive
answer is a schema fact, not a data fact.**

---

# ⭐⭐ HEADLINE — THE I1 PACKET'S §11 CONFIRMATION WAS WRONG

> I1 §11 stated: *"⛔ **No DB migration** — `observations` is `jsonb`, so the new fields need none."*

**⛔ THAT IS FALSE, and the correction is the most important result of C1.**

The `jsonb` **column** accepts any shape. The **BEFORE INSERT trigger does not.**
`developmental_readings_observations_check()` (current form, `20260904000002`, v2) enumerates a
**closed key set**:

```sql
IF k NOT IN ('key','lens','phenomenon','evidenceRefs','observation',
             'doesNotEstablish','structureDependency') THEN
  RAISE EXCEPTION 'observation % carries field "%", which the reading contract does not authorize', i, k;
```

⛔ **`observationId` · `admissionIndex` · `basisFingerprint` · `position` are all outside that set.**

**The live chain is `commission.ts` → `freezeReading()` → `freezeAndStore()` → `INSERT`**, and
`freezeAndStore` passes `JSON.stringify(reading.observations)` **unmodified** — it strips nothing.
⭐ So **the first attempt to persist a v3 reading against a real database RAISES.** Not theoretical:
it is the ordinary commissioning path.

### ⚠️ Why the I1 matrix could not catch this

The live matrix exercises `freezeReading()`, which is **pure** and never reaches the store.
⭐ **I proved the seam mints correctly and never proved the result could be written down.**
*A matrix that never persists cannot see a persistence constraint* — and my §11 line asserted the
absence of a migration from the column type while the authority lived in a trigger.

---

# ⭐⭐ AND THE CONSEQUENCE FOR THE ADDRESS LAW

The Address Law records that the two addresses are *"presently 1:1 within a reading."*
⭐ **That is true of the freeze OUTPUT and false of the durable RECORD.**

> ⛔ **`observation_id` does not exist in the persisted record at all.** It is currently a
> runtime-only value that ceases to exist at the store boundary.

So the bridge question is **not** *how do two persisted addresses reconcile*. There is **ONE**
persisted address — `(reading_id, observation_key)` — and the canonical identity is **not durable**.

⚠️ My `L7-identity-and-key-are-1to1` guard was **true and not the whole truth**: it tested the
in-memory object. It says nothing about what survives the INSERT, because nothing does.

---

## 1 · SCHEMA FACTS — established, read-only

⚠️ **Name correction:** the table is **`developmental_observation_standing_events`** (the census
question named it `developmental_observation_standing`; no such relation is defined).

| Column | Type / constraint |
|---|---|
| `id` | `uuid PRIMARY KEY DEFAULT gen_random_uuid()` |
| `member_id` | `uuid NOT NULL REFERENCES members(id) ON DELETE RESTRICT` |
| `reading_id` | `uuid NOT NULL REFERENCES developmental_readings(id) ON DELETE CASCADE` |
| `observation_key` | `text NOT NULL CHECK (length(observation_key) > 0)` |
| `event_index` | `integer NOT NULL CHECK (event_index >= 0)` |
| `standing` | `text NOT NULL CHECK (standing IN ('keep','dismiss','unresolved'))` |
| `recorded_at` | `timestamptz NOT NULL DEFAULT now()` — server-stamped, never from a caller |

**Uniqueness** `UNIQUE (member_id, reading_id, observation_key, event_index)`
**Index** `idx_dose_current (member_id, reading_id, observation_key, event_index DESC)`
**Triggers** `dose_no_update` (append-only) · `dose_no_single_delete` ·
`developmental_readings_no_orphan_delete`

⭐⭐ **THE MIGRATION ALREADY ANTICIPATED THIS LANE, IN ITS OWN WORDS:**

> *"`observation_key` CANNOT be foreign-keyed: observations live inside the reading's jsonb and
> there is no row to reference. **The write boundary — not a constraint — must establish that this
> key resolves in this frozen reading.** No weaker pattern check is added here, because a second,
> weaker guard beside the real one invites false confidence in it."*

⭐ So resolution has **always** been a write-boundary obligation. ⛔ The database does not and was
never intended to enforce that an `observation_key` resolves.

**Standing is append-only, `event_index`-monotonic, and current standing is a projection**
(greatest `event_index` per triple; UNSET = zero events).

---

## 2 · CODE-PATH FACTS — established

- `freezeReading()` is the single admission seam (I1, closed) and emits the four v3 fields.
- `freezeAndStore()` (`store.ts:65`) INSERTs `JSON.stringify(reading.observations)` **verbatim**.
- `commission.ts` imports both — **the live path**.
- `observationKey(position) = 'o' + (position+1)`; the trigger independently re-asserts
  `o->>'key' = 'o' || i` at insert, so **the address↔position relation is enforced in the database**.
- v1/v2 discrimination is by **absence** of `readingContractVersion`; v2 relaxed exactly one thing
  (`phenomenon` may be absent) and ⛔ **did not widen the key set**.

---

## 3 · ⛔ PERSISTED-DATA FACTS — UNREAD

⛔ Not inferred, ⛔ not estimated, ⛔ not implied by filenames. **Owed to a host with production access.**

Q3 current values · Q4 duplicate standing rows · Q5 does every standing row resolve to exactly one
persisted observation · Q7/Q8 pre-`-03` readings and what differs · Q9 orphans · all row counts ·
age range.

⭐ One query answers most of it, read-only:

```sql
SELECT count(*) AS standing_events,
       count(DISTINCT (member_id, reading_id, observation_key)) AS identities,
       count(*) FILTER (WHERE NOT EXISTS (
         SELECT 1 FROM developmental_readings r
          WHERE r.id = s.reading_id
            AND jsonb_path_exists(r.observations,
                  ('$[*] ? (@.key == "' || s.observation_key || '")')::jsonpath)
       )) AS unresolved_address
  FROM developmental_observation_standing_events s;

SELECT count(*) AS readings,
       count(*) FILTER (WHERE reader_provenance ? 'readingContractVersion') AS v2_or_later,
       min(frozen_at), max(frozen_at)
  FROM developmental_readings;
```

⚠️ The second is approximate on provenance shape and must be checked against where
`readingContractVersion` actually sits before being quoted.

---

## 4 · INFERRED BRIDGE CONSEQUENCES — ⛔ inference, ⛔ not evidence

⭐ Kept separate, as required. Each rests on §1–§2, ⛔ none on unread data.

1. **A member action carrying `observation_id` has nothing durable to resolve against**, because the
   identity is not persisted. ⛔ This is upstream of the bridge, not a property of it.
2. **Q10 answered:** resolution `observation_id → (reading_id, observation_key)` **cannot be made
   total today by any query**, since the left-hand side is absent from the record. ⛔ Not because a
   join is missing — because the value is.
3. ⭐ **Two shapes are visible, ⛔ NEITHER DESIGNED NOR RECOMMENDED HERE** (C1 forbids it):
   persist the identity (a **governed trigger widening**, i.e. the migration the ruling hoped to
   avoid) · or derive it deterministically from the frozen reading address (**no storage**, but it
   meets §II's *minted at admission* and the opacity requirement head-on, and my own I1 note warned
   that deriving from position encodes admission order into the identity).
   ⛔ **Adjudicating between them is the bridge design, and is not authorized.**
4. ⚠️ **I1 is live-unsafe as it stands.** Any real commissioning run now raises at INSERT. ⛔ No
   repair attempted under C1.

---

## 5 · REQUIRED RETURN

| Item | Result |
|---|---|
| Branch / SHA | `claude/magical-maxwell-debsmm` @ `624983fb` (no census code written) |
| Schema evidence | ✅ §1, complete |
| Row counts · age range · pre-`-03` count · orphans · duplicates · unresolved addresses | ⛔ **UNREAD** — no production route |
| Shape variants discovered | ⭐ **One, decisive:** the closed-key INSERT trigger refuses all four v3 fields |
| **Deterministic bridge** | ⛔ **NOT SUPPORTED** as currently shaped |

### ⛔ NOT SUPPORTED — and the reason is narrower than the verdict sounds

⛔ Not because standing is malformed · ⛔ not because the 1:1 relation fails · ⛔ not because a
migration is inherently required to join two addresses.

> ⭐ **Because `observation_id` is not in the durable record at all, so there is no left-hand side
> to resolve from — and it cannot be put there without a governed change to the insert trigger.**

⭐ The founder's preferred outcome — *no migration unless the census proves the bridge cannot be
deterministic and total* — is **not yet refuted**: a derivation-based identity would need no
migration. ⛔ But it is **not yet supported either**, and deciding between persistence and
derivation is the design act C1 is forbidden to take.

---

## Standing

`OBSERVATION-ADDRESS-01` **ESTABLISHED · NOT IMPLEMENTED.** C1 **COMPLETE ON SCHEMA**, ⛔ **INCOMPLETE
ON PERSISTED DATA** (no production route). ⛔ Bridge not designed · ⛔ not implemented · ⛔ facet
implementation not opened · ⛔ production untouched.

⚠️ **Carried up for adjudication, ahead of the bridge**: the I1 v3 fields are **refused by the live
insert trigger**, so the closed I1 implementation cannot persist a reading. ⭐ Whether that is
repaired by widening the trigger, by deriving identity instead of storing it, or by reverting the
fields is a founder ruling — ⛔ none of the three is taken here.
