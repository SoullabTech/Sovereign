**PROPOSED — NOT RATIFIED** · invocation JRF-05/EARTH · 2026-08-13

# Earth — what is actually here, and what it weighs

Earth in this system is **grounding/embodiment** (`lib/maia/spiralogicReference.ts:5`, verified —
the file is 8 lines and contains no other elemental material). Earth's relational attention per
A1 §4 is *events, commitments, boundaries, safety, embodied reality*.

Earth's method here was to weigh things: open the migration, find the writer, count the rows.

---

## Scope

**Asked:** what Earth perceives in the Relational Field that other elements structurally cannot;
where Earth must remain epistemically limited; what an Earth reading requires before it may be
offered; and what this design would rebuild that already exists.

**Not examined:** Fire/Water/Air/Aether readings (not Earth's territory). Runtime log evidence of
what actually fires in production. The Relationship Room Constitution (A5) and the six pending
rulings (A4) beyond their citation in A1. The `relationship_entry_patterns` decay semantics beyond
confirming `expires_at` exists and is unread.

---

## Evidence and existing infrastructure

### Custody first — the tree is not production

**FACT.** Working tree HEAD is `d41b8b355` on `feature/labtools-redesign`, dated 2026-08-11.
Production is `22200f967`, dated 2026-08-13. `git merge-base --is-ancestor 22200f967 HEAD` →
**prod is NOT an ancestor of HEAD**; merge-base is `7c9dd5192`.

**FACT.** The rupture containment exists at production and **not** in this working tree:

- `22200f967:lib/relationships/relationshipSignalService.ts:169` —
  `const DECLARATION_CAPABLE_SOURCES: ReadonlySet<string> = new Set();`
- `22200f967:lib/relationships/__tests__/ruptureContainment.test.ts` — exists.
- Working tree: `grep -c DECLARATION_CAPABLE lib/relationships/relationshipSignalService.ts` → **0**.
  `lib/relationships/__tests__/` contains only `detectRelationalSignal.test.ts`.
- Working tree `lib/relationships/relationshipSignalService.ts:121` writes
  `rupture_state: safeRupture(input.ruptureState)` **unconditionally**.

**INFERENCE** (from the containment commit `22200f967 fix(relational): contain inferred rupture
state at write and at read`, 2026-08-13, versus HEAD's 2026-08-11 date): this is an **unmerged
older branch, not a deletion**. The containment was never on this branch. That is the benign
reading, and it is still a live hazard: **anyone building RF-R3 in this checkout builds without
containment and would not see it missing.**

⚠️ Two structurally different searches (`grep -rn` over `lib app components`; `git grep` repo-wide,
plus four name variants `declaration_capable` / `declarationCapable` / `declarationSources`)
return **zero** hits in the working tree. An inquiry reading only this tree would conclude the
containment does not exist. It does — one branch over.

### Production row counts (read-only `SELECT`, `maia-postgres` on minisforum, 2026-08-13)

| Table / predicate | Rows |
|---|---|
| `member_relationships` | **46** |
| `relationship_entries` | **1190** |
| `relationship_entries WHERE confidence IS NULL` | **18** |
| `relationship_field_state` | **10** |
| `relationship_field_state WHERE elemental_dynamics IS NOT NULL` | **0** |
| `relationship_spaces` | **0** |
| `member_relational_signals` | **440** |
| `member_relational_signals WHERE relationship_id IS NULL` | **440** |
| `member_relational_signals WHERE rupture_state IS NOT NULL` | **97** |

**FACT.** A1's "440 unattached signals" and "`relationship_spaces` … 0 rows", and A2 §7's
"18 rows", are all **verified exactly**.

### What the substrate actually is

**FACT.** `member_relationships`, `relationship_field_state`, `relationship_entries` are all
created by **one** migration: `database/migrations/20260403000001_relationship_field_v1.sql`
(lines 5, 22, 39).

**FACT — the filename lies.** `database/migrations/20260630000008_member_relationships.sql` does
**not** create `member_relationships`. It creates `relationship_spaces` (line 19), and its own
header (lines 5–7) says so: *"member_relationships = member's personal relationship journal …
That table is constitutionally occupied. This table must not overload it."* A1 cites this
migration correctly by content; the filename is a trap laid for the next reader.

**FACT — every signal is unattached, by construction, on both live routes.**
`persistDetectedSignal(userId, detected, null, sourceTurnId)` —
`22200f967:app/api/sovereign/app/maia/list/route.ts:1654` and
`22200f967:app/api/sovereign/app/maia/route.ts:386`. The third positional argument is the
relationship id and it is the literal `null` at both call sites. 440/440 unattached is not drift;
it is what the code does every time.

**FACT — `elemental_dynamics` is a hole.** `relationship_field_state.elemental_dynamics JSONB`
exists (`20260403000001_relationship_field_v1.sql:30`). It is **read** and returned to the client
at `app/api/relationships/[id]/route.ts:43` and `:76` (`elementalDynamics: fieldState.elemental_dynamics`).
The only `INSERT`/`UPDATE` touching this table is
`app/api/relationships/[id]/checkin/route.ts:111`, whose column list is
`(relationship_id, member_id, field_tone, active_signals, last_checkin_at)` and whose
`DO UPDATE SET` sets `field_tone`, `active_signals`, `last_checkin_at`, `updated_at`.
**Nothing writes `elemental_dynamics`.** Production confirms: 0 of 10 rows non-null.
Same for `dominant_pattern` and `developmental_theme` — declared, never written.

Applying the brief's **representational completion check**: a caller exists (the GET route), the
producer observes **nothing**, and the value **never varies**. `elementalDynamics` is a field that
has only ever emitted `null` to a client.

**FACT — there are already two relational readers, and the live one is not the one A1 names.**

- `lib/relationships/buildRelationalContextBlock.ts` — sole caller
  `app/api/oracle/conversation/route.ts`, the lane retired 2026-07-17 per CLAUDE.md.
- `22200f967:lib/relationships/formatRelationalContextForPrompt.ts` — called from the
  **traffic-bearing** route at `22200f967:app/api/sovereign/app/maia/list/route.ts:877,881`, via
  `getMemberActiveRelationalContext`. This file **does not exist in the working tree** (`ls` →
  No such file or directory).

**FACT — the live retrieval path has a complete caller chain.** At `22200f967`, the live read is
gated on an explicit member handoff and sanctuary-excluded (list/route.ts:865–890: *"Explicit-handoff
only … every fire here is a known member act"*). It fires only when `body.relationshipContextId`
is present. That field is sent by `components/OracleConversation.tsx:5268`
(*"RELATIONAL BRIDGE: Session-persistent contextId from /relationships/[id] handoff"*), whose
`apiEndpoint` is set to `/api/sovereign/app/maia/list` by `app/maia/page.tsx:831,1528`,
`app/field/talk/page.tsx:415`, `app/studio/maia/page.tsx:118`,
`components/maia/presence/MaiaPresence.tsx:239`.

**INFERENCE.** A *narrow, member-gated, provenance-marked* relational retrieval is complete
**in code** end to end at production. `formatRelationalContextForPrompt`'s own header already
implements much of A2 §5's discipline — it marks who recorded what, refuses recency claims, and
subordinates the record to what the member is saying now.

**NOT ESTABLISHED.** Whether that path ever **fires** in production. I have a code-read, not a
runtime trace. No log witness of `[MAIA/sovereign] relational-context` was gathered. Per the
project's own evidence rule, a runtime claim requires a runtime trace, and I am not making one.

### The corpus is overwhelmingly inference

**FACT.** 18 of 1190 relationship entries have `confidence IS NULL` — **1.5%**.
440 of 440 signals are inference-sourced (`source` ∈ `maia_conversation` | `labtool_manual`;
`lib/relationships/types.ts:184`), all unattached, 97 carrying a `rupture_state` at rest.

**FACT.** Containment guards **write** and **read** (per the prod test assertions at
`ruptureContainment.test.ts:90,102`), but the 97 rows already hold the assertion in the store.
The guard is a gate in front of a room that still contains the thing.

---

## Proposed design

**RECOMMENDATION (Earth's contribution, narrow by design).**

1. **RF-R3 must be built from a tree that contains the containment.** Branch from `22200f967`,
   not from `feature/labtools-redesign`. This is not a preference; the containment is literally
   absent from the current checkout.

2. **Do not create an elemental storage column. One already exists, empty, and it must stay that
   way or be dropped.** `relationship_field_state.elemental_dynamics` is a pre-built vessel for
   exactly the violation A2 §9 forbids — *eligibility computed, never copied into a mutable
   authority field*. It is JSONB (unconstrained), it is already returned to the client, and it has
   no writer. The first person implementing A1 §4 will find it and fill it. Earth's recommendation
   is to **drop the column** before RF-R6 opens, and let an elemental reading be computed per
   offer or not exist.

3. **An Earth reading is offerable only as a doorway the member opens, never as a finding.**
   Concretely, all four must hold:
   - the member **chose** Earth from five equally-presented invitations — it was not routed to
     them by a detector (a classifier-selected element is `INFERRED` per A2 §3, and INFERRED
     never speaks);
   - the reading **quotes** `declared_text`, or is explicitly attributed as MAIA's own OBSERVED
     question per A2 §3;
   - it asserts **no durable Earth attribute** of the relationship or the person;
   - nothing about the reading persists as member-level relational knowledge (A2 §8.3), including
     in telemetry (A2's anti-laundering clause).

4. **Null the 97 at-rest inferred `rupture_state` values.** This is a system act on **system
   inference**, not on member material — no member authored those values, so A2 §4's prohibition
   on system-performed member acts is not engaged. Read-time containment is a guard a future
   reader can forget to apply; an empty column cannot be misread.

5. **Item 7 (shared space) should be built into `relationship_spaces`, which is a fully specified,
   consent-gated, zero-row building that already exists** — schema, three scoped content tables
   (`20260630000009`), consent state machine, and two live routes
   (`app/api/relationship-spaces/[spaceId]/{consent,threshold}/route.ts`). A1 already says this.
   Earth confirms it materially and adds: it has **no CRUD routes** — no create, no list. That is
   the actual gap, not the schema.

---

## Risks and falsification cases

- **Falsifies finding on `elemental_dynamics`:** produce any `INSERT`/`UPDATE` writing that column,
  or any production row where it is non-null. I checked both; both were empty. A writer in a
  branch I did not read would falsify it.
- **Falsifies the custody finding:** if RF-R3 is to be built on a tree branched from prod, the
  containment gap is irrelevant. It matters only if someone builds here.
- **Falsifies "retrieval is more built than A1 says":** a runtime trace showing
  `relationshipContextId` is never populated in practice — i.e. the handoff UI is unreachable or
  unused. I did not establish that it fires. If it never fires, A1's framing is exactly right and
  mine is overreach.
- **Falsifies the 18-entry reading:** if `confidence IS NULL` turns out not to correlate with
  member authorship at all (see Dissent), then the 1.5% figure describes a column, not a corpus.

---

## Constitutional conflicts

Named, **not** resolved:

1. **A2 §7 identifies member-created entries by `confidence IS NULL` — which is the same defect
   A2 §0 condemns.** A2's central argument is that `source` cannot prove authorship because it is
   a downstream label a developer typed. `confidence` is also a downstream column; its *absence*
   is equally not a gesture witness. A2 §8.1 rules the 18 non-retro-eligible for other reasons and
   so reaches a safe outcome — but the identification method used to find them contradicts the
   document's own epistemology.

2. **A1's "Reuse before building" omits the live reader while forbidding a second implementation.**
   It says *"⛔ Move/adapt the existing reader; do not build a second one"* and names
   `POST /api/relationships · /[id] · /entries · /checkin` as *"the only paths that bind
   relationship_id today"* — true — but does not name `formatRelationalContextForPrompt` or the
   `sovereign/app/maia/list` handoff path. A second reader already exists. The warning arrives
   after the fact.

3. **A1 §"Reuse": *"Elemental architecture already exists project-wide; item 4 is a lens over it,
   ⛔ not a new taxonomy."*** Project-wide, true (`lib/transcript-analysis/*`,
   `lib/consciousness/maia-implicit-architecture.ts`, `ConversationalPipeline.ts`). **In the
   relational domain, false** — `grep -rni 'element|fire|water|earth|aether' lib/relationships/*.ts`
   returns only the English verb *"fire"* in comments about detectors firing. There is no elemental
   substrate in `lib/relationships`. Item 4 would be a **new taxonomy believing itself a reuse**.
   Surfaced, not reconciled.

---

## Reuse opportunities

- `relationship_spaces` + `relationship_space_{messages,notes,artifacts}` — complete, consented,
  zero-row. Item 7 belongs here. Missing: create/list routes.
- `formatRelationalContextForPrompt` — the live, provenance-disciplined prompt formatter. RF-R5
  should adapt **this**, not `buildRelationalContextBlock` (whose only caller is a retired lane).
- `getMemberActiveRelationalContext` + the `relationshipContextId` handoff — the existing
  member-gesture-gated retrieval trigger. RF-R3's `retrieval_consent` should compose with it.
- `relationship_entry_patterns.expires_at` — exists, advisory, unread
  (`20260409000001:34,52,55`). A1 is right that item 5 should consume it.
- `member_relationships.realm` (`outer`/`inner`/`transpersonal`) — an existing member-facing
  distinction A1 does not mention. Declarations attach to relationships that already carry it.
- Consent-gate precedent (A2 §7): atoms `return_preference`, Daily Anchor `surface_preference`.

**What Earth says plainly the design would rebuild:** the **relational prompt formatter** (two
already exist, one live) and the **elemental storage slot** (`elemental_dynamics`, already present
and empty). Both are duplications waiting to happen, and neither is on A1's reuse list.

---

## Where Earth must remain epistemically limited

This section is not modesty. Earth is the element most likely to do harm here, because Earth's
readings *look like facts*.

**Earth mistakes the record for the life.** Production says 46 relationships and 10 field states.
Earth will treat that as the shape of these members' relational worlds. It is the shape of what
someone typed into a form. The estranged parent, the person who died, the relationship too raw to
name, the one that has no bond_type in the dropdown — all weigh zero to Earth and often weigh most.

**Earth reads absence as absence.** A member with 0 entries appears to Earth as a member with no
relational life; a member with 400 appears engaged. Earth would rank them, and would be wrong in
both directions. 1172 of 1190 entries here are system-generated — so the corpus Earth wants to
stand on is mostly the system talking to itself. **Volume of record is a measure of instrumentation,
not of living.**

**Earth mistakes durability for truth.** `field_tone` is a stored enum with a `last_checkin_at`;
the member's sentence is unstructured and unstamped. Earth will prefer the enum, and will let a
six-month-old check-in speak in the present tense. This is precisely the defect
`formatRelationalContextForPrompt`'s header was written to prevent — which is evidence that
someone already caught Earth doing this once.

**Earth misreads endings.** `member_relationships.archived_at` looks to Earth like a relationship
that ended. A2 §9 rules explicitly that Release *"must NOT be interpreted as a statement that the
original experience was false."* Earth's native instinct is exactly that misinterpretation:
removed means retracted, archived means over.

**Earth refuses the unformed.** Earth's own A1 §4 attention — *events, commitments, boundaries* —
is a filter that admits only what has already hardened. A boundary is weighable; the ambivalence
around it is not. A commitment is recordable; the dread of it is not. **A member's relational life
is mostly unformed, and Earth's honest report of it will therefore be mostly wrong in the same
direction every time: too settled, too concluded, too solid.**

**The concrete reduction.** An Earth reading offered as *"You have named a boundary with your
mother, and your last three entries describe crossing it"* is materially accurate, weighable,
cite-able — and it hands the member a verdict about their own inconsistency drawn from a record
they did not author. That sentence is `rupture_state` again, one layer up, wearing Earth's clothes.
It is exactly the movement A1 forbids: **detect → classify → present as truth.** Earth can produce
it fluently and it will feel like rigor.

**Therefore, Earth's own reading is `OBSERVED` at best, never `DECLARED`** — and per A2 §8.3 it is
in-turn only, and may not persist.

---

## Unresolved founder decisions

1. **Should `relationship_field_state.elemental_dynamics` be dropped before RF-R6 opens?**
   *Recommended ruling: yes.* An empty, unconstrained, member-readable JSONB column with no writer
   is the pre-built vessel for persisting an elemental reading as a mutable authority field —
   the exact act A2 §9 forbids. A boundary whose shape makes the violation impossible beats one
   that forbids it (A2 §6).

2. **Must RF-R3 be built from a tree containing the rupture containment (i.e. branched from
   `22200f967`, not `feature/labtools-redesign`)?** *Recommended ruling: yes.* The containment is
   absent from the current checkout and its absence is invisible to anyone working there.

3. **Should A1's "Reuse before building" be corrected to name `formatRelationalContextForPrompt`
   and the live `relationshipContextId` handoff path as the existing reader?**
   *Recommended ruling: yes.* A1 forbids a second implementation while omitting the one that is
   live; the omission is what would cause the duplication.

4. **Should the 97 at-rest `rupture_state` values be nulled in place?**
   *Recommended ruling: yes.* They are system inference, not member material, so A2 §4's
   prohibition on system-performed member acts is not engaged; read-time containment is a guard
   that a future reader can bypass, and an empty column cannot be misread.

---

## Dissent and uncertainty

**I dissent, narrowly, from the brief's assertion that "functional Relational Field intelligence
is not built."** A member-gated, sanctuary-excluded, provenance-marked relational retrieval has a
complete caller chain at production — page → component → live route → service → formatter → prompt.
It is narrow and it is not declaration, so the brief's *spirit* holds entirely. But CLAUDE.md names
**inverse drift** — *"we didn't see X was Cat 6"* — as a failure symmetric with inflation, and this
looks like a candidate. ⚠️ I temper this myself: I established **code**, not **runtime**. If the
handoff never fires, the brief is right and I am overreaching. That is why I marked it
NOT ESTABLISHED rather than arguing it.

**I dissent from A2 §7's method, not its ruling.** Identifying member-created entries by
`confidence IS NULL` uses a downstream column's absence as evidence of a gesture — the very move
A2 §0 exists to end. The ruling (§8.1, non-retro-eligible) is right. The path to it undercuts the
document's own argument, and a future reader may cite `confidence IS NULL` as a provenance signal
because A2 appeared to.

**I dissent from myself on recommendation 4.** Nulling the 97 rows destroys evidence of a
structural defect, and CLAUDE.md's change discipline says *preserve evidence of structural defects
rather than cosmetically hiding them.* The counter-argument is real. If the founder prefers
preservation, the honest alternative is to leave the rows and rely on read containment — but then
the containment must never be bypassed, and Earth notes that a guard is a weaker instrument than
an empty column.

**Where Earth is least reliable, stated plainly:** everything above is a count and a code-read.
Not one line of it is evidence about what any member has actually experienced. Earth can tell you
that 440 signals exist and that no member ever attached one. Earth cannot tell you whether a
single one of them was true.
