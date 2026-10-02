# `WRITERS-STUDIO-EDITORIAL-READING-01 / A1→A2` — FOUNDER BOUNDARY RULINGS

**2026-09-22 · DOCUMENTARY CUSTODY ONLY · FOUNDER ADJUDICATION**

Against canonical `578e5ee10d747846f6d4fe54e116e5b131cdbe30`.

⛔ No runtime · ⛔ no schema · ⛔ no migration · ⛔ no route · ⛔ no prompt · ⛔ no UI ·
⛔ no deployment. No file outside `docs/programme/` is touched by this act.

---

## 0 · What this record is, and what it is not

⭐⭐ **These are founder adjudications ARISING FROM the A1 census. They are ⛔ NOT
A1 findings, and they are ⛔ NOT A2 implementation.**

The distinction is the reason this record exists at its own address rather than
inside the census:

```
3e7793d1                    what A1 DISCOVERED
  A1 census candidate       ⛔ byte-unchanged by this act
        ↓
A1→A2 BOUNDARY RULINGS      what the FOUNDER DECIDED because of those discoveries
  this record               durable custody of the adjudication
        ↓
A2                          consumes these as INHERITED LAW
                            ⛔ does not reopen them implicitly
```

⛔ **This record was deliberately NOT folded into `3e7793d1` after the fact.**
Folding it in would blur what the census found into what the founder ruled, and
a later reader could no longer tell which sentences were evidence and which were
decision. ⭐ *The census reports; the ruling decides; neither may wear the
other's authority.*

⛔ Nothing here authorizes A2 to open. A2 opens on its own founder act.

---

## 1 · Anti-aliasing

> **An `EditorialReading` is not, wraps not, aliases not, and is not
> constructible from the existing `editorialSynthesis` raw-prose path.**

**Ruled:**

- `EditorialReading` is a **distinct canonical identity** from the existing
  `editorialSynthesis`.
- The existing raw-prose / model-call synthesis is ⛔ **not an admissible
  construction path** for the new primitive.
- `editorialSynthesis` is **kept as historical and existing vocabulary in its own
  domain** — ⛔ this ruling does not disturb, deprecate or rename it.
- `EditorialReading` is the cleanest obvious name for the new primitive **unless
  A2 finds a stronger one**.

**Occasioned by** A1 §2: `lib/manuscript/structure/maiaReader.ts` already
produces an object named `editorialSynthesis` whose output shape resembles what
the future object may need, but whose production path — one model call over
headings plus requested prose — places it on the wrong side of A0 §XIII
falsifier 3.

⭐ **The hazard is precisely that the resemblance is real.** The shape is close;
the licence is not. A0 §IV licenses a whole-Work claim by recorded coverage over
admitted observations; `editorialSynthesis` is licensed by the model's fluency
over prose.

**A2 owes:** an **explicit anti-aliasing law** in the contract, in those terms.

---

## 2 · Revision identity — cross-revision composition is CLOSED BY DEFAULT

**Ruled, for the first lawful primitive:**

- All constituent readings **must bind to the same exact `revisionDigest`**.
- ⛔ Readings are **not** composed across revisions merely because they belong to
  the same Work.
- A reading taken at an earlier revision **remains valid historical evidence for
  the revision it witnessed** — ⛔ it is **not admissible** as an input to a
  current-revision Editorial Reading.

```
same revisionDigest
  → composition may be considered

different revisionDigest
  → no composition

work advanced beyond available readings
  → current Editorial Reading unavailable/incomplete
     until current-revision evidence exists
```

⭐ Cross-revision reasoning, **if ever desired, is its own explicit
constitutional extension** — ⛔ never an accretion inside A2 or A3.

**Occasioned by** A1 §4.2, which found that no cross-reading coverage union
exists *and* that the rule such a union would require does not exist either.

⭐⭐ **The ruling's value is that it gives A3 a clean problem instead of an
accidental policy.** Left unruled, the first implementation that needed more
coverage would have decided cross-revision composition by default, silently, in
the course of solving something else.

---

## 3 · `OBSERVATION-ADDRESS-01` dependency — parallel, not blocking

**Ruled:**

- A2 **does not wait** for `OBSERVATION-ADDRESS-01` to close. A2 may define the
  primitive, its invariants, admissible inputs, identity, refusal semantics and
  warrant.
- `OBSERVATION-ADDRESS-01` is an **implementation dependency** wherever future
  runtime performs **member-facing action through `observation_id`**.
- Runtime work requiring observation-address resolution **may not claim closure**
  before that lawful seam exists.
- ⛔ **No duplicate resolver may be invented.**

⭐ The ruling separates conceptual authority from runtime authority: conceptual
work proceeds, and the absence of a lawful seam is a **closure condition**, not a
licence to build a second one.

**Occasioned by** A1 §5.1 and §3.7 — the two-address law, and the A1 evidence
packet's own standing (*steps 2–4 not started; standing-write integration is a
later act, if it is needed at all*).

⛔ Unchanged by this ruling: existing standing keyed
`(member_id, reading_id, observation_key)` remains authoritative until
separately reconciled. ⛔ Do not migrate it · ⛔ do not silently change its keys ·
⛔ do not create duplicate standing keyed by `observation_id`.

---

## 4 · Return precision — section identity, ⛔ never fabricated position

**Ruled:**

```
sectionId known + position known
  → return to exact section/position

sectionId known + position null
  → SECTION_RESOLVED · POSITION_UNRESOLVED
     return to exact section; position remains unresolved

sectionId unresolved
  → no section-precise return
```

- ⛔ The system **must never infer an offset, paragraph or span merely to make
  the return appear more precise.**
- ⭐ The second state is **named explicitly** —
  **`SECTION_RESOLVED · POSITION_UNRESOLVED`** — rather than pretending
  null-position observations have exact textual coordinates.

**Occasioned by** A1 §5.4: `position` is **nullable by ratified design**
(`OBSERVATION-IDENTITY-01 §5`) because an observation citing only structural
evidence names authored divisions and has no place in the prose. A0 §XI's
*section-precise return* was undefined for exactly those observations.

⭐ **Naming the state is the substance of the ruling, not its presentation.** An
unnamed intermediate state is the condition under which an implementation
fabricates coordinates to fill an interface — and the fabrication would be
invisible, because the output would look like every other precise return.

---

## 5 · Identity ambiguity is a REFUSAL CONDITION

**Ruled — promoted from implementation note to contract:**

> If multiple durable records resolve to the same `observationId`, an Editorial
> Reading **must not** deduplicate them, choose one, merge them, or treat them as
> equivalent. The synthesis/composition operation **refuses that identity** until
> the underlying ambiguity is resolved.

**Occasioned by** A1 §3.7 / §5.2: the I1A validator refuses a *partial* identity
group (0 or 4, never 1–3) but enforces ⛔ **no uniqueness on `observationId`**,
within a reading or across readings. ⭐ A duplicate identity is **representable
in the durable record**. The read-only resolver detects and refuses; ⛔ it never
picks one.

⭐ This ruling **preserves the existing resolver's fail-closed behaviour all the
way upward**, so that a layer built above it cannot quietly restore the choice
the layer beneath it refused to make.

---

## 6 · Standing

```
WRITERS-STUDIO-EDITORIAL-READING-01 / A1→A2 BOUNDARY RULINGS
FIVE FOUNDER RULINGS · DOCUMENTARY CUSTODY ONLY
⭐ A1 CENSUS CANDIDATE 3e7793d1 PRESERVED BYTE-UNCHANGED
⛔ A1 CANONICAL ADMISSION NOT TAKEN BY THIS ACT
⛔ A2 NOT OPENED · ⛔ A3 NOT OPENED
⛔ NO CONTRACT · NO IMPLEMENTATION · NO PERSISTENCE · NO RUNTIME
⛔ NO REUSE OF editorialSynthesis AUTHORIZED
⛔ NO SCHEMA · NO ROUTE · NO PROMPT · NO UI · NO DEPLOY
PRODUCTION UNTOUCHED
```

⭐ A2, when it opens on its own founder act, **consumes these five rulings as
inherited law** and ⛔ does not reopen them implicitly. Reopening any of them
requires a founder act naming the ruling and the evidence that it was wrong —
⛔ never that it was inconvenient.

⛔ The `SUPERSESSION-R1` cleanup remains independent; nothing in this record
consumes or mutates that vehicle.
