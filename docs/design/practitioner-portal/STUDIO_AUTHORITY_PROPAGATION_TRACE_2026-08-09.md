# Studio Authority Propagation Trace

**Status: EVIDENCE — 2026-08-09.** ⛔ No implementation. ⛔ Repairs nothing, migrates nothing, adds no
`relationship_spaces` check. Ruling 2 remains **held**.

Traces how authority propagates from HTTP entrypoint to governed row, across the relational, mixed,
and unresolved routes of
[`…CLASSIFICATION_COMPLETION_2026-08-09.md`](STUDIO_AUTHORITY_PATH_CLASSIFICATION_COMPLETION_2026-08-09.md),
plus the helpers they call.

> ⭐⭐⭐ **The distinction this trace protects:** *"touches a person"* is **not** the same as *"requires
> relationship authority."* ⛔ Making `relationship_spaces` a universal gate would be an
> ontology-by-patch error in the opposite direction.

---

## 0. Method and limits

| | |
|---|---|
| **Traced** | request → auth → practitioner identity → team/client/member resolution → helper → SQL predicate → effect |
| **Evidence** | route source + helper source + **production schema** (read-only, `maia_consciousness` on `minisforum`, 2026-08-09) |
| ⛔ **Not done** | ⛔ no runtime execution · ⛔ no row-level data read · ⛔ no proof any path is reachable in practice · ⛔ UI/client callers unread |
| ⚠️ **Consequence** | a predicate absent from source **may** exist in an unread helper. ⭐ Every claim below cites the file and line shape it rests on |

---

## 1. ⭐⭐⭐ The headline finding — one predicate governs almost everything

> ⭐⭐⭐ **Studio's authority model is, nearly universally, a single ownership predicate:
> `practitioner_id = <session-derived>`.**

⭐ Verified identical in shape across every priority surface:

| Surface | Predicate |
|---|---|
| `changes/[id]` GET · PUT · DELETE | `WHERE id = $1 AND practitioner_id = $2` |
| `protocols/[id]` GET · PUT · PATCH | `WHERE id = $1 AND practitioner_id = $2` |
| `encounters/[id]/threshold` | `SELECT … FROM encounters WHERE id = $1 AND practitioner_id = $2` |
| `voice-notes/[noteId]/audio` | `WHERE id = $1 AND practitioner_id = $2` |
| `scheduled-sends/[id]` DELETE | `WHERE id = $1 AND practitioner_id = $2 AND status = 'pending'` |
| `field/attention` | `WHERE fa.practitioner_id = $1 …` |
| all list endpoints | conditions **seeded** with `practitioner_id = $1` |

⭐ **What this is:** **authorship / ownership authority over the record.** ⛔ **What it is not:**
authority over the person the record references.

📌 **Two things follow, and they must not be merged:**

1. ✅ **Cross-practitioner reads are structurally prevented.** ⛔ No traced read path can return
   another practitioner's rows. ⭐ The ownership model is *sound for the object*.
2. ⛔ **Ownership of a record is silently treated as sufficient authority over the person it names.**
   ⭐ That is the crossing Ruling 1 identifies — and it is **invisible at the route layer**, because
   the predicate looks like a clean ownership check.

> ⭐⭐⭐ **Member reach is distributed through the substrate; authority checks are organized around
> practitioner ownership at the route layer.** The system can cross from *"my workspace"* into *"a
> governed person"* ⛔ without the source file announcing the crossing.

---

## 2. Identity-resolution paths

| Path | Helper | Direction | Verdict |
|---|---|---|---|
| **Caller → practitioner** | [`getCurrentPractitioner`](../../../lib/auth/getCurrentPractitioner.ts) | ⭐ `getMemberIdFromRequest` → `WHERE p.member_id = $1 AND p.status='active' LIMIT 1` → returns **both** IDs | ✅ **member-first**, per the [bridge ruling](FOUNDER_RULING_IDENTITY_TO_AUTHORITY_BRIDGE_2026-08-09.md) §6 |
| **Practitioner → member** | [`getPractitionerIdForMember`](../../../lib/studio/getPractitionerIdForMember.ts) | `member_id` → active profile; ⭐ returns `null` when absent | ✅ fail-closed |
| **Practitioner → team** | [`resolveSessionTeamId`](../../../lib/team/sessionTeamScope.ts) | `practitionerId` → `practitioners.member_id` → `ensureOwnCoLab(memberId)` | ✅ ⭐ **resolves to member before scoping, and THROWS if unscopable** — in-code: *"A booking that cannot be scoped must fail loudly rather than land somewhere plausible"* |
| **Member → team role** | [`lib/auth/teamPermissions`](../../../lib/auth/teamPermissions.ts) | `studio_team_members WHERE member_id = $1 AND team_id = $2` | ✅ member-keyed |
| **Member → channel** | [`lib/team/permissions`](../../../lib/team/permissions.ts) | `team_channel_members WHERE channel_id = $1 AND member_id = $2` | ✅ member-keyed |

⭐ **Identity resolution is not the problem.** Every helper traced resolves to a **member identity**
and fails closed on absence. ⛔ The bridge ruling's first half is satisfied throughout.

---

## 3. ⚠️ Competing authorization idioms

⭐ Answering the founder's question directly — Studio has ⛔ **not** one coherent model, and ⛔ not
merely several locally coherent ones. ⚠️ It has **accumulated route-specific conventions** over one
dominant read predicate:

| # | Idiom | Where | Assessment |
|---|---|---|---|
| **I** | ⭐ **Ownership predicate on reads** — `practitioner_id = $1` seeded into every condition list | universal | ✅ consistent · ⭐ prevents cross-practitioner reads |
| **II** | ⭐ **Assert-client-owned before write** — `SELECT id FROM practitioner_clients WHERE id=$1 AND practitioner_id=$2` | [`clients/[id]/notes`](../../../app/api/studio/clients/%5Bid%5D/notes/route.ts) (`assertClientOwned`) · [`protocols`](../../../app/api/studio/protocols/route.ts) | ⚠️ validates against the **contact record** — ⛔ the record Ruling 1 says confers no authority |
| **III** | ⛔⛔ **No client validation — caller-supplied `clientId` written directly** | [`practitioner-observations`](../../../app/api/studio/practitioner-observations/route.ts) · [`field-signals`](../../../app/api/studio/field-signals/route.ts) · [`occupancy-ratings`](../../../app/api/studio/occupancy-ratings/route.ts) · [`protocol-assignments`](../../../app/api/studio/protocol-assignments/route.ts) | ⛔ **see §4** |
| **IV** | ⭐ **Member-first authorization** — `requireChannelAccess(channelId, memberId)`, `practitionerId` as provenance only | [`team/channels/[channelId]/decisions`](../../../app/api/team/channels/%5BchannelId%5D/decisions/route.ts) | ✅ ⭐ **the shape the bridge ruling describes, already in production** |
| **V** | ⭐ **Containment refusal** — fail closed before the read | [`pattern-ledger`](../../../app/api/studio/clients/%5Bid%5D/pattern-ledger/route.ts) | ⭐ **held**; ⛔ not weakened by this trace |
| **VI** | ⭐ **PHI accessor** — `encounter_transcripts` etc. encrypted with AAD binding `{table, column, rowId, ownerId=encounterId}` | [`lib/security/phiAccessors/encounterTranscripts`](../../../lib/security/phiAccessors/encounterTranscripts.ts) | ⚠️ **confidentiality, ⛔ not authority** — prevents ciphertext transplant; ⛔ decides nothing about who may act |

⚠️ **Two membership substrates coexist** — `studio_team_members` (team role) and
`team_channel_members` (channel membership). ⭐ Both member-keyed, ⛔ different objects; recorded as
topology, ⛔ not as a defect.

---

## 4. ⛔⛔ The finding that is nonconformant on evidence already ratified

> ⛔⛔ **Four write paths accept a caller-supplied `clientId` and persist it with NO ownership or
> relationship validation of any kind.**

| Route | Write |
|---|---|
| [`practitioner-observations`](../../../app/api/studio/practitioner-observations/route.ts) POST | `clientId` from request body → `INSERT INTO studio_practitioner_observations (…, client_id, …)` |
| [`field-signals`](../../../app/api/studio/field-signals/route.ts) POST | `clientId` from body → `INSERT INTO studio_field_signals (…, client_id, …)` |
| [`occupancy-ratings`](../../../app/api/studio/occupancy-ratings/route.ts) POST | `clientId` from body → `INSERT INTO session_occupancy_ratings (…, client_id, …)` |
| [`protocol-assignments`](../../../app/api/studio/protocol-assignments/route.ts) POST | `clientId` from body → assignment row |

⭐ **Contrast within the same codebase:** `clients/[id]/notes` and `protocols` **do** assert the
client belongs to the practitioner before writing. ⛔ These four do not.

⚠️ **The concrete failure:** a practitioner may author a persisted claim — an observation, a field
signal, an occupancy rating, a protocol assignment — **naming another practitioner's client**. ⭐ Reads
stay scoped by `practitioner_id`, so the author sees only their own row; ⛔ but the row exists, it
names a person the author has no record of, and ⛔ **no relationship of any kind was proven.**

📌 **Status: `nonconformant`** — ⭐ and this conclusion needs **no new ruling.** It is decided by
Ruling 1's prohibition on *"deriving authority over a member from … another unilaterally authored
record"* — ⛔ here there is not even a unilateral record to derive from. ⚠️ **Caveat:** ⛔ not verified
whether an FK or DB constraint rejects a foreign `client_id`; ⭐ the schema query found `client_id`
columns but ⛔ no `(practitioner_id, client_id)` composite constraint.

---

## 5. Mixed-row semantics — operation-level predicates

⭐ Per founder direction, `studio_changes` is **not** classified globally.

| Operation | Predicate | Person reach | Reading |
|---|---|---|---|
| `GET /changes` (list) | `WHERE c.practitioner_id = $1`, `LEFT JOIN practitioner_clients cl ON cl.id = c.client_id`; optional `AND c.client_id = $n` from query string | ⛔ **exposes `c.member_id` in the projection** | ⚠️ **mixed** — a change with null `client_id`/`member_id` is practitioner's own work; a populated one **surfaces a governed member's id** under a pure ownership predicate |
| `GET /changes/[id]` | `WHERE c.id = $1 AND c.practitioner_id = $2` | same | ⚠️ mixed |
| `POST /changes` | `clientId` from **query string**, inserted | ⛔ binds a person at creation | ⚠️ ⛔ **no client-ownership assertion traced** — same shape as §4 |
| `PUT` · `DELETE /changes/[id]` | `WHERE id = $1 AND practitioner_id = $2` | inherits row's binding | ⚠️ mixed |

> ⭐⭐⭐ **A mixed table needs a row-semantic authority model.** The current model is **column-blind**:
> the identical predicate governs a row whether or not it names a governed member.

⭐ Same shape applies to `studio_decisions` (nullable `client_id` + `team_id`) and to
`studio_pattern_protocols` (`client_id` + **`member_id`**).

---

## 6. ⚠️ Encounter participation — a distinct authority form

**[`encounters/[id]/threshold`](../../../app/api/studio/encounters/%5Bid%5D/threshold/route.ts)**

```text
verify: SELECT id … FROM encounters WHERE id = $1 AND practitioner_id = $2   ← ownership of the encounter
then:   SELECT id, display_name, role FROM encounter_participants WHERE encounter_id = $1   ← ⛔ NO further predicate
```

⛔ **Participant rows — which carry `member_id` — are returned on the strength of the practitioner
owning the encounter.** ⭐ Consent events exist (`encounter_consent_events`), ⚠️ but the participant
read itself is gated by ownership alone.

> ⚠️ **This may be legitimate.** ⭐ Encounter participation is plausibly **its own authority form** —
> presence in a shared event, not administrative stewardship. ⛔ **Unruled.** ⛔ Do not classify as
> nonconformant.

⭐ Same for `chat` · `transcript` · `moments` · `moments/extract`: encounter-ownership gates access to
material co-produced with participants who are governed members. ⭐ PHI encryption (idiom VI) protects
confidentiality ⛔ but decides no authority question.

---

## 7. Outbound and streaming effects

| Route | Effect | Predicate | Reading |
|---|---|---|---|
| [`voice-notes/[noteId]/audio`](../../../app/api/studio/voice-notes/%5BnoteId%5D/audio/route.ts) | ⭐ **streams media** | `WHERE id = $1 AND practitioner_id = $2` | ⚠️ `voice_notes.client_id` exists — ⛔ a **person-scoped media disclosure** authorized purely by record ownership. ⭐ Sound if the recording is the practitioner's own artifact; ⛔ unsettled if it captures the person |
| [`scheduled-sends/[id]`](../../../app/api/studio/scheduled-sends/%5Bid%5D/route.ts) DELETE | cancels a pending send | `WHERE id=$1 AND practitioner_id=$2 AND status='pending'` | ✅ **cancellation is conformant** — ⭐ withdrawing one's own pending act; ⚠️ the **creating** path (outward action toward a person's email) was ⛔ not traced here |

> ⭐⭐⭐ **Outward action toward a person is not equivalent to an internal practitioner-owned record**,
> and the current predicate does not distinguish them.

---

## 8. Cross-domain authority composition

**[`field/attention`](../../../app/api/studio/field/attention/route.ts)** · **`field/attention/options`** · **`field/pulse`**

⭐ Team-owned surfaces (`field_attention`: `practitioner_id` + `team_id`, ⛔ no person columns) that
**read `studio_changes` and `studio_decisions`** — both of which carry `client_id`, and
`studio_changes` also `member_id`.

⚠️ **Composition risk, stated precisely:** a **team-scoped** surface aggregates from **relational**
substrate. ⛔ Team membership is not a relationship with the person named in an aggregated row. ⭐ The
predicate is `practitioner_id = $1` plus a team clause — so the *aggregate* stays practitioner-owned,
⚠️ but the **derived view is composed from person-bearing rows** without any relationship being
established.

📌 ⛔ Not classified. ⭐ It is a genuine authority-composition question the founder flagged, and the
evidence confirms the composition exists.

---

## 9. ⭐⭐⭐ Why zero routes consult `relationship_spaces`

⭐ The founder's A–E question. **The evidence supports B, with a strong C component:**

| | Answer | Verdict |
|---|---|---|
| **A** | Studio has an independent already-governed authority model | ⚠️ **partly** — it has a *consistent* model (ownership), ⛔ but consistency ≠ governed. ⛔ No ruling ever authorized ownership-as-relational-authority |
| **B** | ⭐⭐⭐ **Studio predates the constitutional relationship substrate and was never migrated to it** | ✅ **best supported** — `relationship_spaces` (migration `20260701000001`) has **0 rows**; Studio's tables and idioms predate it; the two route sets are disjoint |
| **C** | ⭐⭐ **Only some operations should depend on it** | ✅ **also true, and it constrains B** — §1 shows ownership is *correct* for practitioner-owned objects; §2 shows identity resolution already conforms |
| **D** | `relationship_spaces` governs a different layer | ⚠️ **partly** — its live consumers are member-facing (member portal, MAIA list, join/consent), ⛔ not practice administration |
| **E** | other | ⛔ no evidence found |

> ⭐⭐⭐ **Conclusion: `relationship_spaces` is a substrate Studio was built before and has not been
> reconciled with — ⛔ NOT a gate every Studio route is missing.**

⭐ Several distinct authority forms appear legitimate and independently sufficient in the evidence:

| Form | Evidence it is real | Sufficient for |
|---|---|---|
| **Self authority** | `field`, `field/[id]` keyed on `identity.memberId` | one's own material |
| **Team authority** | `studio_team_members`, `team_channel_members`, `ensureOwnCoLab` | team-owned objects |
| **Authorship authority** | the universal `practitioner_id` predicate | ⭐ the practitioner's **own** records |
| **Encounter participation** | `encounter_participants` + `encounter_consent_events` | ⚠️ plausibly its own form (§6) — ⛔ unruled |
| **Administrative stewardship** | `practitioner_clients` contact record | ⭐ contact-holding · ⛔ **explicitly NOT relational authority** (Ruling 1) |
| **Constituted relational authority** | `relationship_spaces` at threshold | ⛔ **currently exercised by zero Studio operations** |

---

## 10. The matrix

`route | operation | relation | person reach | identity source | authority predicate | helper | effect | ruling | status`

| route | op | relation | person reach | identity src | authority predicate | helper | effect | ruling | status |
|---|---|---|---|---|---|---|---|---|---|
| `practitioner-observations` | POST | `studio_practitioner_observations` | `client_id` | ⛔ **caller body** | ⛔ **none** | — | write | R1 | ⛔ **nonconformant** |
| `field-signals` | POST | `studio_field_signals` | `client_id` | ⛔ **caller body** | ⛔ **none** | — | write | R1 | ⛔ **nonconformant** |
| `occupancy-ratings` | POST | `session_occupancy_ratings` | `client_id` | ⛔ **caller body** | ⛔ **none** | — | write | R1 | ⛔ **nonconformant** |
| `protocol-assignments` | POST | `studio_protocol_assignments` | `client_id` | ⛔ **caller body** | ⛔ **none** | — | write | R1 | ⛔ **nonconformant** |
| `changes` | POST | `studio_changes` | `client_id`/`member_id` | ⛔ query string | ⛔ none traced | — | write | R1 | ⛔ **nonconformant** |
| `clients/[id]/patterns` | GET | `practitioner_clients` | `member_id` | path param | contact record | `getClientMemberId` | read | R1 | ⛔ **nonconformant** |
| `clients/[id]/notes` | GET·POST | `practitioner_client_notes` | `client_id` | path param | `assertClientOwned` | — | read·write | — | ⛔ **unresolved-rule** (material *about* a person) |
| `protocols` · `[id]` · `observations` | all | `studio_pattern_protocols` | `member_id` | body + contact check | ownership + contact | — | read·write | — | ⛔ **unresolved-rule** (held) |
| `protocols/[id]/council` | POST | ← `studio_pattern_protocols` | `member_id` (indirect) | path param | ownership | — | write | — | ⛔ **unresolved-rule** |
| `encounters` | POST | `encounter_participants` | ⛔ **`member_id`** | body | team scope only | `resolveTeam` | write | — | ⛔ **unresolved-rule** (held) |
| `encounters/[id]/threshold` | GET·POST | `encounter_participants` | `member_id` | path param | ⚠️ encounter ownership only | — | read | — | ⛔ **unresolved-rule** (§6) |
| `encounters/[id]/chat`·`transcript`·`moments` | all | transcripts/turns | `member_id` (via participants) | path param | encounter ownership | PHI accessor | read·write | — | ⛔ **unresolved-rule** |
| `voice-notes/[noteId]/audio` | GET | `voice_notes` | `client_id` | path param | ownership | — | ⭐ **stream** | — | ⛔ **unresolved-rule** (§7) |
| `scheduled-sends/[id]` | DELETE | `scheduled_sends` | recipient email | path param | ownership + `status='pending'` | — | cancel | — | ✅ **conformant** |
| `field/attention`·`pulse` | GET | `field_attention` ← `studio_changes`/`decisions` | indirect | session | ownership + team | — | read | — | ⛔ **unresolved-rule** (§8) |
| `field`·`field/[id]` | all | `process_items` | ⛔ none (self) | `identity.memberId` | `member_id = self` | — | read·write | R-bridge | ✅ **conformant** |
| `field/notes`·`events`·`people`·`attention/[id]` | all | `field_*` | ⛔ none | session | practitioner + team | — | read·write | — | ✅ **no-relational-authority-required** |
| `team/channels/[id]/decisions` | GET·POST | `team_decisions` | ⛔ none | `getMemberIdFromRequest` | ⭐ `requireChannelAccess(channelId, memberId)` | `lib/team/permissions` | read·write | R-bridge | ✅ **conformant** ⭐ exemplar |
| `availability`·`modules`·`profile` | all | practitioner tables | ⛔ none | session | ownership | — | read·write | — | ✅ **no-relational-authority-required** |
| `pattern-ledger` | GET | `pattern_ledger` | `member_id` | path param | ⭐ **fail-closed** | — | ⛔ none | — | ✅ **conformant (contained)** |
| `clients` · `clients/[id]` · `import-actions` | all | `practitioner_clients` | contact person | session | ownership | — | read·write | R1 | ⚠️ **insufficient-evidence** — ⭐ contact-holding is explicitly preserved by R1 |
| `decisions`·`[id]`·`consult`·`mentor` | all | `studio_decisions` | `client_id` | session + body | ownership | — | read·write | — | ⚠️ **insufficient-evidence** (mixed rows, §5) |
| `client-inquiry/responses` | all | `studio_inquiry_responses` | `client_id` | session | ownership | — | read | — | ⚠️ **insufficient-evidence** |
| `client-inquiry/prompt-sets` | GET | ⛔ none | ⛔ none | — | — | — | read | — | ✅ **no-relational-authority-required** |

⭐ **Status vocabulary is kept strict:** ⛔ `unresolved-rule` is **never** collapsed into
`nonconformant`. ⭐ Five routes are nonconformant **only** because Ruling 1 already decides them; ⛔ ten
await a rule that does not yet exist.

---

## 11. ⭐ Findings that alter the six-class classification

| # | Change |
|---|---|
| **1** | ⛔ **`changes` POST joins the nonconformant set**, ⛔ not merely "mixed" — `clientId` from the query string is persisted with no validation |
| **2** | ⭐ `scheduled-sends/[id]` DELETE promotes to ✅ **conformant** — cancelling one's own pending act needs no relational authority |
| **3** | ⚠️ `encounters/[id]/threshold` moves from *relational* to ⛔ **unresolved-rule** — encounter participation is plausibly its **own** authority form (§6) |
| **4** | ⚠️ `field/attention` · `pulse` sharpen from *mixed* to **cross-domain composition** (§8) — the surface is team-owned, the **inputs** are person-bearing |
| **5** | ⭐ Idiom **IV** (`team/.../decisions`) is now evidenced as the **exemplar** conforming shape, ⛔ not merely "already member-keyed" |

---

## 12. ⛔ Questions that genuinely require a founder ruling

1. ⭐⭐⭐ **The authority object of practitioner-authored material about a person.** ⭐ Ownership and
   governance are ⛔ not necessarily the same property: an observation is *authored by* the
   practitioner and *about and consequential to* a member. ⭐ Governs: notes · observations · field
   signals · protocols · occupancy ratings.
2. ⭐ **Is encounter participation an independent authority form?** ⭐ If yes, `encounters/*` is
   governed by participation + consent events, ⛔ not by constituted relationship.
3. ⭐ **Does person-scoped media streaming require more than record ownership?** (`voice-notes` audio.)
4. ⭐ **May a team-scoped surface aggregate person-bearing rows** (`field/attention`, `pulse`), and
   under whose authority?
5. ⭐ **Row-semantic authority for mixed tables** — must the predicate change when the relational
   column is populated, or does the object's authorship govern regardless?
6. ⚠️ **Outward sends.** ⭐ Cancellation is conformant; ⛔ the *creating* path was not traced. What
   authority is required to send **to** a person?

⛔ **No implementation. No repair. Ruling 2 remains held.**
